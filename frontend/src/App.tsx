    import { useState } from 'react'
    import { Button } from '@/components/ui/button'
    import { useApi} from '@/hooks/useApi'
    import { useAppSelector, useAppDispatch } from '@/store'
    import { setTheme } from '@/store/slices/uiSlice'

    interface HealthResponse {
      status: string
      timestamp: string
      uptime: number
    }

    function App() {
      const dispatch = useAppDispatch()
      const theme = useAppSelector((state) => state.ui.theme)
      const [uploadProgress, setUploadProgress] = useState(0)
      
      // Example usage of new useApi hook
      const healthApi = useApi<HealthResponse>('/health', {
        immediate: true,
        swrConfig: {
          refreshInterval: 30000, // Refresh every 30 seconds
        }
      })


      const {data,isFetching,} = useApi<any>('/api/v1/bills', {
        immediate: true,
        swrConfig: {
          refreshInterval: 30000, // Refresh every 30 seconds
        }
      })

      console.log(data,isFetching)
      
      const handleNewApiMutation = async () => {
        try {
          const result = await healthApi.post('/api/test', 
            { message: 'Hello from new useApi hook!' },
            { message: true }
          )
          console.log('New API mutation result:', result)
          // Invalidate health data to refresh
          await healthApi.invalidate('/health')
        } catch (error) {
          console.error('New API mutation error:', error)
        }
      }
      
      
      
      const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        
        try {
          setUploadProgress(0)
          const result = await healthApi.uploadFile('/api/upload', file, (progress) => {
            setUploadProgress(progress)
          })
          console.log('File upload result:', result)
          setUploadProgress(0)
        } catch (error) {
          console.error('File upload error:', error)
          setUploadProgress(0)
        }
      }

      return (
        <div className="min-h-screen bg-background text-foreground p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Luxuray Stay HMS</h1>
            
            <div className="space-y-6">
              <div className="p-6 border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Theme Management</h2>
                <p className="mb-4">Current theme: {theme}</p>
                <Button 
                  onClick={() => dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))}
                >
                  Toggle Theme
                </Button>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">New useApi Hook Demo</h2>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Health Check (GET with SWR)</h3>
                  {healthApi.isLoading && <p>Loading...</p>}
                  {healthApi.error && <p className="text-red-500">Error: {healthApi.error.message}</p>}
                  {healthApi.data && (
                    <pre className="bg-gray-100 p-2 rounded text-sm mb-2">
                      {JSON.stringify(healthApi.data, null, 2)}
                    </pre>
                  )}
                  <Button 
                    onClick={() => healthApi.mutate()}
                    variant="outline"
                    size="sm"
                  >
                    Refresh Health Data
                  </Button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Test Mutation (POST)</h3>
                  <Button 
                    onClick={handleNewApiMutation}
                    disabled={healthApi.isLoading}
                  >
                    Trigger New API Mutation
                  </Button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">File Upload with Progress</h3>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="mb-2"
                  />
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <p className="text-sm mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Legacy API Hooks Demo</h2>
              </div>
            </div>
          </div>
        </div>
      )
    }

    export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { PublicRoute } from '@/components/custom/PublicRoute';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - redirect to dashboard if authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        
        {/* Protected Routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Unauthorized page for role-based access */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-destructive mb-4">Unauthorized</h1>
                <p className="text-muted-foreground mb-4">
                  You don't have permission to access this page.
                </p>
                <a href="/dashboard" className="text-primary hover:underline">
                  Go back to Dashboard
                </a>
              </div>
            </div>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-destructive mb-4">404</h1>
                <p className="text-muted-foreground mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <a href="/dashboard" className="text-primary hover:underline">
                  Go back to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

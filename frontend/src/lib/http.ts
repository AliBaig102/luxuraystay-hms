import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common['Authorization']
  }
}
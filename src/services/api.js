import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Instancia de Axios preconfigurada con:
 * - Base URL desde VITE_API_URL (fallback localhost)
 * - Interceptor de request que adjunta token JWT del localStorage
 * - Interceptor de response que limpia sesion y redirige a /login en 401
 */
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** Instancia de Axios preconfigurada */
export default api

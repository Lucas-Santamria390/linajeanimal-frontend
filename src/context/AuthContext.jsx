import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

/**
 * Proveedor de autenticacion global
 * Maneja login/logout, almacena token y usuario en localStorage
 * @param {object} props - Propiedades del componente
 * @param {JSX.Element} props.children - Componentes hijos
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token: newToken, usuario: userData } = res.data.data
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión'
      setError(msg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setError(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, isAuthenticated, login, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de autenticacion
 * @returns {{ user: (object|null), token: (string|null), loading: boolean, error: (string|null), isAuthenticated: boolean, login: (email: string, password: string) => Promise<boolean>, logout: () => void, setError: (msg: string|null) => void }} Estado y funciones de autenticacion
 * @throws {Error} Si se usa fuera de AuthProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

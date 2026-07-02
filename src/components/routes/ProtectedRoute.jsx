import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Ruta protegida que redirige a /login si el usuario no esta autenticado
 * @param {object} props - Propiedades del componente
 * @param {JSX.Element} props.children - Componente hijo a renderizar si esta autenticado
 * @returns {JSX.Element}
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

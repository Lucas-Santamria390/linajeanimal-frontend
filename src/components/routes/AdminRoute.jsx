import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Ruta de administracion que bloquea acceso a usuarios sin rol admin.
 * @param {object} props - Propiedades del componente.
 * @param {JSX.Element} props.children - Vista a renderizar si el usuario tiene permisos.
 * @returns {JSX.Element}
 */
export default function AdminRoute({ children }) {
  const { user } = useAuth()

  if (user?.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

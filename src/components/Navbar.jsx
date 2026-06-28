import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-brand-600 text-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg">
        LinajeAnimal
      </Link>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-brand-100">Dashboard</Link>
            <span className="text-brand-100">{user?.nombre || user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-brand-600 px-3 py-1 rounded text-sm font-medium hover:bg-brand-50"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-brand-100">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  )
}

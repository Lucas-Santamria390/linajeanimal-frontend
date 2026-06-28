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
    <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg">
        LinajeAnimal
      </Link>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-indigo-200">Dashboard</Link>
            <span className="text-indigo-200">{user?.nombre || user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-700 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-100"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-indigo-200">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  )
}

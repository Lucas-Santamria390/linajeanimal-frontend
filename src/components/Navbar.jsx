import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Barra de navegación principal responsive con menú hamburguesa y drawer lateral.
 * Conserva la estructura de distribución extrema original del equipo.
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    navigate('/login')
  }

  // Helper para dar estilos a los enlaces activos e interactivos según la paleta del plan
  const getLinkClass = (path) => {
    const baseClass = "text-sm font-semibold transition-colors duration-200 py-2 px-3 rounded-lg block md:inline-block"
    return location.pathname === path
      ? `${baseClass} bg-brand-600 text-white shadow-xs`
      : `${baseClass} text-brand-50 hover:bg-brand-600/60 hover:text-white`
  }

  return (
    <nav className="bg-brand-500 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      
      {/* LOGO PRINCIPAL (Conserva la posición original exacta de tus compañeros) */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="font-bold text-lg select-none flex items-center gap-2">
        <span>🐾 LinajeAnimal</span>
      </Link>

      {/* CONTENIDO ESCRITORIO (>= 768px) */}
      <div className="hidden md:flex items-center gap-6">
        {/* Enlaces de Navegación */}
        <div className="flex items-center space-x-1">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
              <Link to="/animales" className={getLinkClass('/animales')}>Animales</Link>
              <Link to="/especies" className={getLinkClass('/especies')}>Especies</Link>
              <Link to="/razas" className={getLinkClass('/razas')}>Razas</Link>
              {/* Tu requerimiento: Solo admin ve usuarios */}
              {user?.rol === 'admin' && (
                <Link to="/usuarios" className={getLinkClass('/usuarios')}>Usuarios</Link>
              )}
            </>
          ) : (
            <Link to="/" className={getLinkClass('/')}>Inicio</Link>
          )}
        </div>

        {/* Datos de Sesión / Acceso */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-brand-400 pl-4">
              <Link to="/perfil" className="text-right hover:opacity-80 transition-opacity">
                <p className="text-sm font-bold leading-tight text-white">{user?.nombre || user?.email}</p>
                <p className="text-xs text-brand-200 capitalize font-medium">{user?.rol || 'user'}</p>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-brand-500 px-3 py-1.5 rounded text-sm font-medium hover:bg-brand-50 transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-brand-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors shadow-xs"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {/* BOTÓN HAMBURGUESA - MÓVIL (< 768px) */}
      <div className="flex md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-brand-600 text-white focus:outline-none transition-colors cursor-pointer"
          aria-controls="mobile-drawer"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Abrir menú de navegación</span>
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* DRAWER LATERAL RESPONSIVE (< 768px) */}
      {/* Fondo oscuro traslúcido */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel del Drawer */}
      <div
        id="mobile-drawer"
        className={`fixed top-0 right-0 bottom-0 w-64 bg-brand-500 z-50 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Botón Cerrar Drawer */}
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md hover:bg-brand-600 text-white cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enlaces Móvil */}
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className={getLinkClass('/dashboard')}>Dashboard</Link>
                <Link to="/animales" onClick={() => setIsOpen(false)} className={getLinkClass('/animales')}>Animales</Link>
                <Link to="/especies" onClick={() => setIsOpen(false)} className={getLinkClass('/especies')}>Especies</Link>
                <Link to="/razas" onClick={() => setIsOpen(false)} className={getLinkClass('/razas')}>Razas</Link>
                {user?.rol === 'admin' && (
                  <Link to="/usuarios" onClick={() => setIsOpen(false)} className={getLinkClass('/usuarios')}>Usuarios</Link>
                )}
              </>
            ) : (
              <Link to="/" onClick={() => setIsOpen(false)} className={getLinkClass('/')}>Inicio</Link>
            )}
          </div>
        </div>

        {/* Info de sesión Móvil en la parte inferior */}
        <div className="border-t border-brand-400 pt-6 mt-auto">
          {isAuthenticated ? (
            <>
              <Link to="/perfil" onClick={() => setIsOpen(false)} className="block mb-4 hover:opacity-80 transition-opacity">
                <p className="text-base font-bold text-white leading-tight">{user?.nombre || user?.email}</p>
                <p className="text-xs text-brand-200 capitalize font-medium">{user?.rol || 'user'}</p>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2.5 bg-white text-brand-500 text-center text-sm font-bold rounded-lg transition-colors shadow-xs"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}
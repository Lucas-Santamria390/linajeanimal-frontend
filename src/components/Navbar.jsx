import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Barra de navegación principal responsive. En escritorio muestra solo logo y sesión
 * (la navegación la resuelve Sidebar); en móvil despliega un drawer lateral con todos los enlaces.
 * @returns {JSX.Element} Navbar completo con vista de escritorio y drawer móvil.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
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

      {/* LOGO PRINCIPAL */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="font-bold text-lg select-none flex items-center gap-2">
        <span>🐾 LinajeAnimal</span>
      </Link>

      {/* SESIÓN / ACCESO — ESCRITORIO (>= 768px). La navegación por secciones la maneja Sidebar. */}
      <div className="hidden md:flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-4 border-l border-brand-400 pl-4">
            <Link to="/perfil" className="text-right hover:opacity-80 transition-opacity">
              <p className="text-sm font-bold leading-tight text-white">{user?.nombre || user?.email}</p>
              <p className="text-xs text-brand-200 capitalize font-medium">{user?.rol || 'user'}</p>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600 cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="rounded-lg border border-brand-100 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Registrarse
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs hover:bg-secondary-600"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
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

      {/* DRAWER LATERAL RESPONSIVE (< 768px) — unica navegacion por secciones en movil */}
      {/* Fondo oscuro traslúcido */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
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
                className="w-full rounded-lg bg-secondary-500 py-2.5 text-sm font-bold text-white transition-colors shadow-xs hover:bg-secondary-600 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg border border-brand-100 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-brand-600"
              >
                Registrarse
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg bg-secondary-500 py-2.5 text-center text-sm font-bold text-white transition-colors shadow-xs hover:bg-secondary-600"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/animales', label: 'Animales' },
  { to: '/especies', label: 'Especies' },
  { to: '/razas', label: 'Razas' },
]

/**
 * Sidebar de navegacion administrativa, visible desde el breakpoint md (>=768px).
 * En movil permanece oculto: la navegacion la resuelve el menu hamburguesa del Navbar.
 * @returns {JSX.Element|null} Barra lateral con enlaces a las secciones principales, o null sin sesion activa.
 */
export default function Sidebar() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  const items = [
    ...NAV_ITEMS,
    ...(user?.rol === 'admin' ? [{ to: '/usuarios', label: 'Usuarios' }] : []),
    { to: '/perfil', label: 'Perfil' },
  ]

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-card p-4 md:flex">
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-brand-50 hover:text-brand-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

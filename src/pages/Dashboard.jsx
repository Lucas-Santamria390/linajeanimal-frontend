import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

/**
 * Pagina de Dashboard con estadisticas generales
 * Muestra tarjetas con totales de animales, especies, razas y usuarios.
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useDashboard()

  if (loading) return <Loading message="Cargando estadísticas..." />

  const cards = [
    { label: 'Animales', value: stats?.animales, color: 'border-l-brand-500' },
    { label: 'Especies', value: stats?.especies, color: 'border-l-secondary-500' },
    { label: 'Razas', value: stats?.razas, color: 'border-l-brand-300' },
    { label: 'Usuarios', value: stats?.usuarios, color: 'border-l-secondary-600' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-neutral-text mb-4">Dashboard</h1>
      <p className="text-neutral-muted mb-6">
        Bienvenido, <span className="font-semibold">{user?.nombre || user?.email}</span>
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-neutral-200 bg-neutral-card p-4 shadow-sm border-l-4 ${card.color}`}
          >
            <p className="text-sm text-neutral-muted">{card.label}</p>
            <p className="text-2xl font-bold text-neutral-text">{card.value ?? '--'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

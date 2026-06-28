import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

export default function Dashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useDashboard()

  if (loading) return <Loading message="Cargando estadísticas..." />

  const cards = [
    { label: 'Animales', value: stats?.animales, color: 'border-l-brand-500' },
    { label: 'Especies', value: stats?.especies, color: 'border-l-green-500' },
    { label: 'Razas', value: stats?.razas, color: 'border-l-blue-500' },
    { label: 'Usuarios', value: stats?.usuarios, color: 'border-l-amber-500' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Bienvenido, <span className="font-semibold">{user?.nombre || user?.email}</span>
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white p-4 rounded shadow border-l-4 ${card.color}`}
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value ?? '--'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

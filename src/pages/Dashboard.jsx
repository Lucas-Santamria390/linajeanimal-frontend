import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import { useAnimales } from '../hooks/useAnimales'
import Loading from '../components/Loading'
import Alert from '../components/Alert'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'

/**
 * Pagina de Dashboard con estadisticas generales.
 * Muestra tarjetas con totales de animales, especies, razas y usuarios,
 * ademas de una tabla con los ultimos 5 animales registrados.
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const { user } = useAuth()
  const { stats, loading: statsLoading, error: statsError } = useDashboard()
  const {
    data: latestAnimals,
    loading: animalsLoading,
    error: animalsError,
    refetch: refetchAnimals,
  } = useAnimales({ limit: 5, page: 1, sort: '-createdAt' })

  const cards = [
    { label: 'Animales', value: stats?.animales, color: 'border-l-brand-500' },
    { label: 'Especies', value: stats?.especies, color: 'border-l-secondary-500' },
    { label: 'Razas', value: stats?.razas, color: 'border-l-brand-300' },
    { label: 'Usuarios', value: stats?.usuarios, color: 'border-l-secondary-600' },
  ]

  const latestAnimalColumns = useMemo(
    () => [
      { key: 'nombre', header: 'Nombre' },
      {
        key: 'especie',
        header: 'Especie',
        render: (value) => value?.nombre || '-',
      },
      {
        key: 'raza',
        header: 'Raza',
        render: (value) => value?.nombre || '-',
      },
      {
        key: 'sexo',
        header: 'Sexo',
        render: (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'),
      },
      {
        key: 'createdAt',
        header: 'Registrado',
        render: (value) => {
          if (!value) return '-'

          const date = new Date(value)
          if (Number.isNaN(date.getTime())) return '-'

          return date.toLocaleDateString('es-PA', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-text sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-neutral-muted sm:text-base">
          Bienvenido, <span className="font-semibold text-neutral-text">{user?.nombre || user?.email}</span>
        </p>
      </section>

      {statsError && <Alert type="error" message={statsError} />}

      {statsLoading ? (
        <Loading message="Cargando estadisticas..." />
      ) : (
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
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-600">
              Últimos registros
            </p>
            <h2 className="mt-1 text-xl font-bold text-neutral-text sm:text-2xl">
              Últimos 5 animales registrados
            </h2>
            <p className="mt-1 text-sm text-neutral-muted">
              Ordenados por fecha de creación, del más reciente al más antiguo.
            </p>
          </div>

          {animalsError && (
            <button
              type="button"
              onClick={() => refetchAnimals({ limit: 5, page: 1, sort: '-createdAt' })}
              className="inline-flex items-center justify-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
            >
              Reintentar
            </button>
          )}
        </div>

        {animalsError ? (
          <Alert type="error" message={animalsError} />
        ) : animalsLoading ? (
          <Loading message="Cargando ultimos animales..." />
        ) : latestAnimals.length === 0 ? (
          <EmptyState
            title="No hay animales registrados"
            message="Aún no se han creado animales en el sistema."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-card shadow-sm">
            <DataTable columns={latestAnimalColumns} data={latestAnimals} />
          </div>
        )}
      </section>
    </div>
  )
}

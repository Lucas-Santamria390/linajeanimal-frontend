import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEspecies } from '../../hooks/useEspecies'
import { useRazas } from '../../hooks/useRazas'
import PageHeader from '../../components/ui/PageHeader'
import SelectField from '../../components/form/SelectField'
import DataTable from '../../components/data/DataTable'
import Pagination from '../../components/data/Pagination'
import ConfirmModal from '../../components/ui/ConfirmModal'
import Loading from '../../components/ui/Loading'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

const TABS = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Desactivadas' },
  { value: 'all', label: 'Todas' },
]

/**
 * Pagina de listado de razas con filtro por especie, activo/inactivo, paginacion y reactivar/desactivar.
 * @returns {JSX.Element}
 */
export default function RazasList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const rowsPerPage = 10
  const [page, setPage] = useState(1)
  const [especieFiltro, setEspecieFiltro] = useState('')
  const [activeFilter, setActiveFilter] = useState('true')
  const [alertMessage, setAlertMessage] = useState(() => {
    const msg = location.state?.success || ''
    if (msg) window.history.replaceState({}, document.title)
    return msg ? { type: 'success', message: msg } : null
  })
  const [modalConfig, setModalConfig] = useState({ isOpen: false, target: null, isReactivating: false })
  const [isToggling, setIsToggling] = useState(false)

  const {
    data: razas,
    loading,
    error,
    pagination,
    refetch,
    toggleActive,
  } = useRazas()
  const {
    data: especies,
    loading: loadingEspecies,
    error: errorEspecies,
    refetch: refetchEspecies,
  } = useEspecies({ limit: 100 })

  useEffect(() => {
    const params = { page, limit: rowsPerPage }
    if (especieFiltro) params.especie = especieFiltro
    if (activeFilter !== 'all') params.active = activeFilter
    refetch(params)
  }, [page, especieFiltro, activeFilter, refetch])

  const handleTabChange = useCallback((value) => {
    setActiveFilter(value)
    setPage(1)
  }, [])

  const especieOptions = useMemo(
    () => especies.map((especie) => ({ value: especie._id, label: especie.nombre })),
    [especies]
  )

  const columns = useMemo(() => {
    const baseColumns = [
      { key: 'nombre', header: 'Nombre' },
      {
        key: 'especie',
        header: 'Especie',
        render: (value) => value?.nombre || '-',
      },
      {
        key: 'descripcion',
        header: 'Descripcion',
        render: (value) => value || '-',
      },
    ]

    if (!isAdmin) {
      return baseColumns
    }

    return [
      ...baseColumns,
      {
        key: 'active',
        header: 'Estado',
        render: (_value, row) => <Badge active={row.active} />,
      },
      {
        key: 'acciones',
        header: 'Acciones',
        className: 'w-64',
        render: (_value, row) => {
          const isInactive = row.active === false
          return (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(`/razas/${row._id}/editar`)}
                className="inline-flex items-center rounded-md bg-secondary-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-secondary-600"
              >
                Editar
              </button>
              {isInactive ? (
                <button
                  type="button"
                  onClick={() => setModalConfig({ isOpen: true, target: row, isReactivating: true })}
                  className="inline-flex items-center rounded-md bg-state-success-border px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:brightness-110"
                >
                  Reactivar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalConfig({ isOpen: true, target: row, isReactivating: false })}
                  className="inline-flex items-center rounded-md border border-brand-300 bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-200"
                >
                  Desactivar
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [isAdmin, navigate])

  const handleSpeciesChange = useCallback((event) => {
    setEspecieFiltro(event.target.value)
    setPage(1)
  }, [])

  const handleToggle = useCallback(async () => {
    if (!modalConfig.target || isToggling) return
    setIsToggling(true)
    try {
      await toggleActive(modalConfig.target._id, modalConfig.isReactivating)
      setAlertMessage({
        type: 'success',
        message: modalConfig.isReactivating
          ? 'Raza reactivada con éxito.'
          : 'Raza desactivada con éxito.',
      })
      setModalConfig({ isOpen: false, target: null, isReactivating: false })
    } catch {
      setModalConfig({ isOpen: false, target: null, isReactivating: false })
      setAlertMessage({
        type: 'error',
        message: modalConfig.isReactivating
          ? 'No se pudo reactivar la raza. Intenta nuevamente.'
          : 'No se pudo desactivar la raza. Intenta nuevamente.',
      })
    } finally {
      setIsToggling(false)
    }
  }, [modalConfig, isToggling, toggleActive])

  const emptyMessages = {
    true: {
      title: especieFiltro ? 'No hay razas activas para la especie seleccionada' : 'No hay razas activas',
      message: especieFiltro
        ? 'Prueba con otra especie o cambia el filtro de estado.'
        : 'Todas las razas están desactivadas o aún no has creado ninguna.',
    },
    false: {
      title: especieFiltro ? 'No hay razas desactivadas para la especie seleccionada' : 'No hay razas desactivadas',
      message: 'Todas las razas se encuentran activas en este momento.',
    },
    all: {
      title: especieFiltro ? 'No hay razas para la especie seleccionada' : 'No hay razas registradas',
      message: especieFiltro
        ? 'Prueba con otra especie o limpia el filtro para ver todo el catálogo.'
        : 'Aún no hay razas disponibles en el sistema.',
    },
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Razas"
        breadcrumbs={[{ label: 'Razas' }]}
        action={isAdmin ? (
          <button
            type="button"
            onClick={() => navigate('/razas/nuevo')}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            + Nueva raza
          </button>
        ) : null}
      />

      {alertMessage && (
        <Alert
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {errorEspecies && (
        <div className="flex items-start gap-2">
          <Alert type="error" message={errorEspecies} className="flex-1" />
          <button
            type="button"
            onClick={refetchEspecies}
            className="shrink-0 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2">
          <Alert type="error" message={error} className="flex-1" />
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {isAdmin && (
          <div className="flex gap-1 rounded-xl border border-neutral-200 bg-neutral-card p-1 shadow-sm w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === tab.value
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-neutral-muted hover:text-neutral-text hover:bg-neutral-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="sm:min-w-[200px]">
          <SelectField
            id="filtro-especie"
            label="Filtrar por especie"
            value={especieFiltro}
            onChange={handleSpeciesChange}
            options={especieOptions}
            loading={loadingEspecies}
            disabled={loadingEspecies || Boolean(errorEspecies)}
            placeholder="Todas las especies"
          />
        </div>
      </div>

      {loading ? (
        <Loading message="Cargando razas..." />
      ) : (
        <div className="space-y-4">
          {razas.length === 0 ? (
            <EmptyState
              title={emptyMessages[activeFilter].title}
              message={emptyMessages[activeFilter].message}
              action={
                isAdmin && activeFilter === 'true' && !especieFiltro ? (
                  <button
                    type="button"
                    onClick={() => navigate('/razas/nuevo')}
                    className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                  >
                    Agregar raza
                  </button>
                ) : null
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={razas}
            />
          )}

          {pagination && pagination.pages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              total={pagination.total}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        loading={isToggling}
        title={modalConfig.isReactivating ? 'Reactivar raza' : 'Desactivar raza'}
        message={
          modalConfig.target
            ? modalConfig.isReactivating
              ? `Esta acción reactivará la raza "${modalConfig.target.nombre}". Volverá a estar disponible para registrar nuevos animales.`
              : `Esta acción desactivará la raza "${modalConfig.target.nombre}". No se eliminarán sus registros históricos, pero no se podrán registrar nuevos animales bajo esta raza.`
            : ''
        }
        confirmText={
          isToggling
            ? 'Procesando...'
            : modalConfig.isReactivating
              ? 'Reactivar'
              : 'Desactivar'
        }
        cancelText="Cancelar"
        onConfirm={handleToggle}
        onCancel={() => setModalConfig({ isOpen: false, target: null, isReactivating: false })}
      />
    </div>
  )
}

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEspecies } from '../../hooks/useEspecies'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/data/DataTable'
import Pagination from '../../components/data/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmModal from '../../components/ui/ConfirmModal'
import Alert from '../../components/ui/Alert'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'

const TABS = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Desactivadas' },
  { value: 'all', label: 'Todas' },
]

/**
 * Pagina de listado de especies con busqueda, paginacion, activar/desactivar y control de roles
 * @returns {JSX.Element}
 */
export default function EspeciesList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.rol === 'admin'

  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState('true')
  const limit = 10

  const params = { page: currentPage, limit }
  if (activeFilter !== 'all') params.active = activeFilter

  const { data: especies, loading, error, pagination, refetch: fetchEspecies, toggleActive } = useEspecies(params)

  const [alertMessage, setAlertMessage] = useState(null)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null, isReactivating: false })
  const [isToggling, setIsToggling] = useState(false)

  const handleOpenModal = useCallback((id, isReactivating) => {
    setModalConfig({ isOpen: true, id, isReactivating })
  }, [])

  const handleConfirmToggle = useCallback(async () => {
    if (!modalConfig.id) return
    try {
      setIsToggling(true)
      await toggleActive(modalConfig.id, modalConfig.isReactivating)
      setAlertMessage({
        tipo: 'success',
        texto: modalConfig.isReactivating
          ? 'Especie reactivada con éxito.'
          : 'Especie desactivada con éxito.',
      })
    } catch {
      setAlertMessage({
        tipo: 'error',
        texto: modalConfig.isReactivating
          ? 'No se pudo reactivar la especie. Inténtelo de nuevo.'
          : 'No se pudo desactivar la especie. Inténtelo de nuevo.',
      })
    } finally {
      setIsToggling(false)
      setModalConfig({ isOpen: false, id: null, isReactivating: false })
    }
  }, [modalConfig, toggleActive])

  const handleTabChange = useCallback((value) => {
    setActiveFilter(value)
    setCurrentPage(1)
    const newParams = { page: 1, limit }
    if (value !== 'all') newParams.active = value
    fetchEspecies(newParams)
  }, [limit, fetchEspecies])

  const totalPages = pagination?.pages || 1

  if (loading) {
    return <Loading message="Cargando catálogo de especies..." />
  }

  const columnas = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción' },
    ...(isAdmin
      ? [
          {
            key: 'active',
            header: 'Estado',
            render: (_value, row) => <Badge active={row.active} />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            key: 'acciones',
            header: 'Acciones',
            render: (_value, row) => {
              const isInactive = row.active === false
              return (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/especies/${row._id}/editar`)}
                    className="inline-flex items-center rounded-md bg-secondary-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-secondary-600"
                  >
                    Editar
                  </button>
                  {isInactive ? (
                    <button
                      type="button"
                      onClick={() => handleOpenModal(row._id, true)}
                      className="inline-flex items-center rounded-md bg-state-success-border px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:brightness-110"
                    >
                      Reactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenModal(row._id, false)}
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
      : []),
  ]

  const emptyMessages = {
    true: {
      title: 'No hay especies activas',
      message: isAdmin
        ? 'Todas las especies están desactivadas o aún no has creado ninguna.'
        : 'No se encontraron especies activas en el sistema.',
    },
    false: {
      title: 'No hay especies desactivadas',
      message: 'Todas las especies se encuentran activas en este momento.',
    },
    all: {
      title: 'No hay especies registradas',
      message: isAdmin
        ? 'Comienza agregando tu primera especie para asociarla a tus razas y animales.'
        : 'No se encontraron registros de especies en el sistema actualmente.',
    },
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-none mx-auto space-y-6">
      {alertMessage && (
        <Alert
          type={alertMessage.tipo}
          message={alertMessage.texto}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {error && (
        <div className="flex items-start gap-2">
          <Alert type="error" message={error} className="flex-1" />
          <button
            type="button"
            onClick={() => fetchEspecies()}
            className="shrink-0 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
        </div>
      )}

      <PageHeader
        title="Catálogo de Especies"
        action={
          isAdmin ? (
            <button
              type="button"
              onClick={() => navigate('/especies/nuevo')}
              className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              + Nueva especie
            </button>
          ) : null
        }
      />

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

      {(!especies || especies.length === 0) ? (
        <EmptyState
          title={emptyMessages[activeFilter].title}
          message={emptyMessages[activeFilter].message}
          action={
            isAdmin && activeFilter === 'true' ? (
              <button
                type="button"
                onClick={() => navigate('/especies/nuevo')}
                className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Agregar Especie
              </button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-card shadow-sm">
          <DataTable columns={columnas} data={especies || []} />

          {totalPages > 1 && (
            <div className="border-t border-neutral-200 p-4">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  fetchEspecies({ page, limit, ...(activeFilter !== 'all' ? { active: activeFilter } : {}) })
                }}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        loading={isToggling}
        title={modalConfig.isReactivating ? '¿Reactivar Especie?' : '¿Desactivar Especie?'}
        message={
          modalConfig.isReactivating
            ? 'Esta acción reactivará la especie seleccionada. Volverá a estar disponible para registrar nuevos animales y razas.'
            : 'Esta acción desactivará la especie seleccionada. No se eliminarán sus registros históricos del linaje, pero no se podrán registrar nuevos animales bajo esta categoría.'
        }
        confirmText={
          isToggling
            ? 'Procesando...'
            : modalConfig.isReactivating
              ? 'Confirmar y Reactivar'
              : 'Confirmar y Desactivar'
        }
        cancelText="Cancelar"
        onConfirm={handleConfirmToggle}
        onCancel={() => setModalConfig({ isOpen: false, id: null, isReactivating: false })}
      />
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEspecies } from '../hooks/useEspecies'
import { useRazas } from '../hooks/useRazas'
import PageHeader from '../components/PageHeader'
import SelectField from '../components/SelectField'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'
import Loading from '../components/Loading'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'

/**
 * Pagina de listado de razas con filtro por especie, paginacion y borrado suave.
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
  const [alertMessage, setAlertMessage] = useState(() => {
    const msg = location.state?.success || ''
    if (msg) window.history.replaceState({}, document.title)
    return msg ? { type: 'success', message: msg } : null
  })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    data: razas,
    loading,
    error,
    pagination,
    refetch,
    remove,
  } = useRazas()
  const {
    data: especies,
    loading: loadingEspecies,
    error: errorEspecies,
    refetch: refetchEspecies,
  } = useEspecies({ limit: 100 })

  useEffect(() => {
    refetch({
      page,
      limit: rowsPerPage,
      ...(especieFiltro ? { especie: especieFiltro } : {}),
    })
  }, [page, especieFiltro, refetch])

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
        key: 'acciones',
        header: 'Acciones',
        className: 'w-48',
        render: (_value, row) => (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/razas/${row._id}/editar`)}
              className="text-sm font-medium text-secondary-600 transition-colors hover:text-secondary-800"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              Desactivar
            </button>
          </div>
        ),
      },
    ]
  }, [isAdmin, navigate])

  const handleSpeciesChange = useCallback((event) => {
    setEspecieFiltro(event.target.value)
    setPage(1)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      await remove(deleteTarget._id)
      setAlertMessage({ type: 'success', message: 'Raza desactivada con éxito.' })
      setDeleteTarget(null)
    } catch {
      setDeleteTarget(null)
      setAlertMessage({ type: 'error', message: 'No se pudo desactivar la raza. Intenta nuevamente.' })
    } finally {
      setIsDeleting(false)
    }
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
            onClick={refetch}
            className="shrink-0 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-neutral-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:max-w-md">
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
              title={especieFiltro ? 'No hay razas para la especie seleccionada' : 'No hay razas registradas'}
              message={
                especieFiltro
                  ? 'Prueba con otra especie o limpia el filtro para ver todo el catálogo.'
                  : 'Aún no hay razas activas disponibles en el sistema.'
              }
              action={isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate('/razas/nuevo')}
                  className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Agregar raza
                </button>
              ) : null}
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
        isOpen={Boolean(deleteTarget)}
        loading={isDeleting}
        title="Desactivar raza"
        message={
          deleteTarget
            ? `Esta acción desactivará la raza "${deleteTarget.nombre}". Podrás restaurarla más adelante desde el backend si el flujo lo permite.`
            : ''
        }
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

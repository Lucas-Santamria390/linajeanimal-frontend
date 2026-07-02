import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUsuarios } from '../hooks/useUsuarios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'
import Loading from '../components/Loading'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'

/**
 * Pagina de listado de usuarios con paginacion, confirmacion de estado y acciones.
 * @returns {JSX.Element}
 */
export default function UsuariosList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const rowsPerPage = 10

  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [alertMessage, setAlertMessage] = useState(() => {
    const message = location.state?.success || ''
    return message ? { type: 'success', message } : null
  })

  useEffect(() => {
    if (location.state?.success) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state?.success])

  const { data: usuarios, loading, error, pagination, refetch, toggleActive } = useUsuarios()

  useEffect(() => {
    refetch({ page, limit: rowsPerPage })
  }, [page, refetch])

  const openToggleModal = useCallback((usuario) => {
    setSelectedUser(usuario)
    setIsModalOpen(true)
  }, [])

  const closeToggleModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleToggleActive = async () => {
    if (!selectedUser || isUpdating) return

    setIsUpdating(true)
    try {
      await toggleActive(selectedUser._id, !selectedUser.active)
      setAlertMessage({
        type: 'success',
        message: `Usuario ${selectedUser.active ? 'desactivado' : 'activado'} con éxito.`,
      })
    } catch {
      setAlertMessage({
        type: 'error',
        message: 'No se pudo actualizar el estado del usuario. Intenta nuevamente.',
      })
    } finally {
      setIsUpdating(false)
      closeToggleModal()
    }
  }

  const columns = useMemo(() => [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    {
      key: 'rol',
      header: 'Rol',
      render: (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'),
    },
    {
      key: 'active',
      header: 'Activo',
      render: (value) => <Badge active={Boolean(value)} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'w-56',
      render: (_value, row) => {
        const canToggle = row._id !== user?._id

        return (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/usuarios/${row._id}/editar`)}
              className="inline-flex items-center rounded-md bg-secondary-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-secondary-600"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => openToggleModal(row)}
              disabled={!canToggle}
              className="inline-flex items-center rounded-md border border-brand-300 bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {row.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        )
      },
    },
  ], [navigate, openToggleModal, user])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Usuarios"
        breadcrumbs={[{ label: 'Usuarios' }]}
        action={(
          <button
            type="button"
            onClick={() => navigate('/usuarios/nuevo')}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            + Nuevo usuario
          </button>
        )}
      />

      {alertMessage && (
        <Alert
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {!alertMessage && error && (
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

      {loading ? (
        <Loading message="Cargando usuarios..." />
      ) : (
        <div className="space-y-4">
          {usuarios.length === 0 ? (
            <EmptyState
              title="No hay usuarios registrados"
              message="Todavía no existen usuarios activos para mostrar en esta lista."
              action={(
                <button
                  type="button"
                  onClick={() => navigate('/usuarios/nuevo')}
                  className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Crear usuario
                </button>
              )}
            />
          ) : (
            <DataTable
              columns={columns}
              data={usuarios}
            />
          )}

          {pagination?.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              pages={pagination.totalPages}
              totalDocs={pagination.totalDocs}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        loading={isUpdating}
        title={selectedUser?.active ? 'Desactivar usuario' : 'Activar usuario'}
        message={
          selectedUser
            ? `Vas a ${selectedUser.active ? 'desactivar' : 'activar'} a "${selectedUser.nombre}". ¿Deseas continuar?`
            : ''
        }
        confirmText={selectedUser?.active ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        onConfirm={handleToggleActive}
        onCancel={closeToggleModal}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEspecies } from '../hooks/useEspecies'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import Alert from '../components/Alert'
import Loading from '../components/Loading'

/**
 * Pagina de listado de especies con busqueda, paginacion, soft delete y control de roles
 * @returns {JSX.Element}
 */
export default function EspeciesList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: especies, loading, error, refetch: fetchEspecies, remove: deleteEspecie } = useEspecies()

  const [currentPage, setCurrentPage] = useState(1)
  const [especiesPerPage] = useState(10)
  const [alertMessage, setAlertMessage] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEspecieId, setSelectedEspecieId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAdmin = user?.rol === 'admin'

  useEffect(() => {
    fetchEspecies()
  }, [fetchEspecies])

  const handleOpenDeleteModal = (id) => {
    setSelectedEspecieId(id)
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEspecieId) return
    try {
      setIsDeleting(true)
      await deleteEspecie(selectedEspecieId)
      setAlertMessage({ tipo: 'success', texto: 'Especie desactivada con éxito.' })
      fetchEspecies()
    } catch {
      setAlertMessage({ tipo: 'error', texto: 'No se pudo desactivar la especie. Inténtelo de nuevo.' })
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
      setSelectedEspecieId(null)
    }
  }

  const indexOfLastEspecie = currentPage * especiesPerPage
  const indexOfFirstEspecie = indexOfLastEspecie - especiesPerPage
  const currentEspecies = especies ? especies.slice(indexOfFirstEspecie, indexOfLastEspecie) : []
  const totalPages = especies ? Math.ceil(especies.length / especiesPerPage) : 1

  if (loading) {
    return <Loading message="Cargando catálogo de especies..." />
  }

  const columnas = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción' },
    ...(isAdmin ? [{
      key: 'acciones',
      header: 'Acciones',
      render: (_value, row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/especies/editar/${row._id}`)}
            className="text-sm text-secondary-600 hover:text-secondary-800 font-medium"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => handleOpenDeleteModal(row._id)}
            className="text-sm text-brand-700 hover:text-brand-800 font-medium"
          >
            Desactivar
          </button>
        </div>
      ),
    }] : []),
  ]

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
        action={isAdmin ? (
          <button
            type="button"
            onClick={() => navigate('/especies/nuevo')}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            + Nueva especie
          </button>
        ) : null}
      />

      {(!especies || especies.length === 0) ? (
        <EmptyState
          title="No hay especies registradas"
          message={isAdmin
            ? "Comienza agregando tu primera especie para asociarla a tus razas y animales."
            : "No se encontraron registros de especies en el sistema actualmente."
          }
          action={isAdmin ? (
            <button
              type="button"
              onClick={() => navigate('/especies/nuevo')}
              className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              Agregar Especie
            </button>
          ) : null}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-card shadow-sm">
          <DataTable
            columns={columnas}
            data={currentEspecies}
          />

          {totalPages > 1 && (
            <div className="border-t border-neutral-200 p-4">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        loading={isDeleting}
        title="¿Desactivar Especie?"
        message="Esta acción realizará una baja lógica de la especie seleccionada. No se eliminarán sus registros históricos del linaje, pero no se podrán registrar nuevos animales bajo esta categoría."
        confirmText={isDeleting ? "Desactivando..." : "Confirmar y Desactivar"}
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsModalOpen(false)
          setSelectedEspecieId(null)
        }}
      />
    </div>
  )
}

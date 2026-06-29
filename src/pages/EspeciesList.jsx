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

/**
 * Vista de página que renderiza el listado de especies registradas en el sistema.
 * Gestiona estados de carga, errores, vistas vacías, paginación, alertas de éxito
 * y la eliminación lógica (soft delete) restringida por el rol del usuario.
 *
 * @returns {JSX.Element} Componente de la página de listado de especies.
 */
export default function EspeciesList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { especies, loading, error, fetchEspecies, deleteEspecie } = useEspecies()

  // Estados locales para la paginación y flujos de UI
  const [currentPage, setCurrentPage] = useState(1)
  const [especiesPerPage] = useState(10)
  const [alertMessage, setAlertMessage] = useState(null)
  
  // Estados para el Modal de Confirmación de Soft Delete
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [especieIdSeleccionada, setEspecieIdSeleccionada] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Determinar si el usuario actual es administrador para habilitar mutaciones
  const isAdmin = user?.rol === 'admin'

  useEffect(() => {
    fetchEspecies()
  }, [])

  /**
   * Abre el modal de confirmación guardando el ID de la especie elegida.
   * 
   * @param {number|string} id - Identificador único de la especie a desactivar.
   * @returns {void}
   */
  const handleOpenDeleteModal = (id) => {
    setEspecieIdSeleccionada(id)
    setIsModalOpen(true)
  }

  /**
   * Ejecuta la desactivación lógica (soft delete) de la especie seleccionada.
   * 
   * @returns {Promise<void>} Promesa asíncrona de la operación.
   */
  const handleConfirmDelete = async () => {
    if (!especieIdSeleccionada) return
    try {
      setIsDeleting(true)
      await deleteEspecie(especieIdSeleccionada)
      setAlertMessage({ tipo: 'success', texto: 'Especie desactivada con éxito.' })
      fetchEspecies() // Refresca los datos del backend real
    } catch (err) {
      setAlertMessage({ tipo: 'error', texto: 'No se pudo desactivar la especie. Inténtelo de nuevo.' })
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
      setEspecieIdSeleccionada(null)
    }
  }

  // Lógica de paginación local sobre la data del API
  const indexOfLastEspecie = currentPage * especiesPerPage
  const indexOfFirstEspecie = indexOfLastEspecie - especiesPerPage
  const currentEspecies = especies ? especies.slice(indexOfFirstEspecie, indexOfLastEspecie) : []
  const totalPages = especies ? Math.ceil(especies.length / especiesPerPage) : 1

  // 1. ESTADO LOADING (Obligatorio en Guía de Contribución)
  if (loading && !especies) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="ml-3 text-neutral-600 font-medium">Cargando catálogo de especies...</p>
      </div>
    )
  }

  // Definición de las columnas adaptativas para la DataTable
  const columnas = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Descripción', accessor: 'descripcion' }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-none mx-auto space-y-6">
      
      {/* Alertas globales de éxito o error */}
      {alertMessage && (
        <Alert 
          type={alertMessage.tipo} 
          message={alertMessage.texto} 
          onClose={() => setAlertMessage(null)} 
        />
      )}

      {/* 2. ESTADO ERROR (Mensajes limpios usando componente Alert) */}
      {error && (
        <Alert 
          type="error" 
          message={`Error al sincronizar con el servidor: ${error}`} 
        />
      )}

      {/* Encabezado dinámico: Solo muestra botón de creación al rol 'admin' */}
      <PageHeader
        title="Catálogo de Especies"
        description="Listado general y control de especies animales registradas en LinajeAnimal."
        actionLabel={isAdmin ? "Nueva especie" : null}
        onActionClick={isAdmin ? () => navigate('/especies/nuevo') : null}
      />

      {/* 3. ESTADO EMPTY (Control de colección vacía mediante componente dedicado) */}
      {(!especies || especies.length === 0) ? (
        <EmptyState
          title="No hay especies registradas"
          description={isAdmin ? "Comienza agregando tu primera especie para asociarla a tus razas y animales." : "No se encontraron registros de especies en el sistema actualmente."}
          actionLabel={isAdmin ? "Agregar Especie" : null}
          onActionClick={isAdmin ? () => navigate('/especies/nuevo') : null}
        />
      ) : (
        /* 4. ESTADO SUCCESS (Renderizado de la información del API) */
        <div className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden">
          <DataTable
            columns={columnas}
            data={currentEspecies}
            actions={isAdmin ? [
              {
                label: 'Editar',
                icon: 'edit',
                onClick: (row) => navigate(`/especies/editar/${row.id}`),
                className: 'text-secondary-600 hover:text-secondary-800'
              },
              {
                label: 'Desactivar',
                icon: 'trash',
                onClick: (row) => handleOpenDeleteModal(row.id),
                className: 'text-rose-600 hover:text-rose-800'
              }
            ] : []} // Array vacío para rol user bloquea renderizado de acciones en la fila
          />
          
          {totalPages > 1 && (
            <div className="border-t border-neutral-200 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación para Soft Delete */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="¿Desactivar Especie?"
        message="Esta acción realizará una baja lógica de la especie seleccionada. No se eliminarán sus registros históricos del linaje, pero no se podrán registrar nuevos animales bajo esta categoría."
        confirmLabel={isDeleting ? "Desactivando..." : "Confirmar y Desactivar"}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsModalOpen(false)
          setEspecieIdSeleccionada(null)
        }}
        isDanger={true}
      />
    </div>
  )
}
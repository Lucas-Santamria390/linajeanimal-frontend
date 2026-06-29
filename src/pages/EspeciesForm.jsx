import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEspecies } from '../hooks/useEspecies'
import FormField from '../components/FormField'
import Alert from '../components/Alert'

/**
 * Componente de formulario unificado para la creación y edición de especies.
 * Maneja validaciones de campos en tiempo real, estados de carga de datos previos,
 * errores de servidor y redirección interactiva post-guardado.
 *
 * @returns {JSX.Element} Pantalla del formulario de especies.
 */
export default function EspeciesForm() {
  const navigate = useNavigate()
  const { id } = useParams() // Extrae el ID de la URL si estamos editando
  const { createEspecie, updateEspecie, getEspecieById, loading, error } = useEspecies()

  const isEditMode = Boolean(id)

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })

  // Estado local para errores de validación por campo
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  // Efecto para precargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditMode) {
      /**
       * Obtiene los datos históricos de la especie desde la API real.
       */
      const cargarEspecie = async () => {
        try {
          setLoadingData(true)
          const data = await getEspecieById(id)
          if (data) {
            setFormData({
              nombre: data.nombre || '',
              descripcion: data.descripcion || ''
            })
          }
        } catch (err) {
          setApiError('No se pudieron precargar los datos de la especie.')
        } finally {
          setLoadingData(false)
        }
      }
      cargarEspecie()
    }
  }, [id, isEditMode])

  /**
   * Maneja los cambios de escritura en los inputs actualizando el estado.
   * * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - Evento de cambio.
   * @returns {void}
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Limpiar el error del campo conforme el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  /**
   * Valida las restricciones de negocio antes de realizar el submit.
   * * @returns {boolean} True si el formulario es válido, False en caso contrario.
   */
  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la especie es obligatorio.'
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres.'
    }
    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Procesa el envío del formulario para creación o actualización.
   * * @param {React.FormEvent} e - Evento de submit del formulario.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!validarFormulario()) return

    try {
      if (isEditMode) {
        await updateEspecie(id, formData)
      } else {
        await createEspecie(formData)
      }
      
      // Redirección con estado interno para que la lista muestre la alerta de éxito
      navigate('/especies', { 
        state: { 
          alert: { 
            tipo: 'success', 
            texto: isEditMode ? 'Especie actualizada correctamente.' : 'Especie creada con éxito.' 
          } 
        } 
      })
    } catch (err) {
      setApiError(err?.message || 'Ocurrió un error al procesar la solicitud en el servidor.')
    }
  }

  // 1. ESTADO LOADING (Precarga en edición)
  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        <p className="text-neutral-600 font-medium text-sm">Cargando datos históricos...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-6">
        
        {/* Encabezado dinámico */}
        <div>
          <h1 className="text-xl font-bold text-neutral-text">
            {isEditMode ? '📝 Editar Especie' : '🌱 Nueva Especie'}
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            {isEditMode ? 'Modifica los parámetros principales de la especie seleccionada.' : 'Registra una nueva categoría base para la clasificación del linaje animal.'}
          </p>
        </div>

        {/* 2. ESTADO ERROR (Alertas globales de servidor) */}
        {apiError && (
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          {/* Campo Nombre (Obligatorio) */}
          <FormField
            label="Nombre de la Especie *"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            placeholder="Ej: Porcina, Bovina, Equina..."
            disabled={loading}
          />

          {/* Campo Descripción (Opcional) */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-neutral-muted">
              Descripción (Opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Añade detalles o notas particulares de esta especie..."
              disabled={loading}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-text focus:outline-none focus:border-secondary-500 min-h-[100px] resize-y transition-colors"
            />
          </div>

          {/* Botones de Acción Responsivos */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/especies')}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-neutral-muted bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Guardar Cambios' : 'Crear Especie'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
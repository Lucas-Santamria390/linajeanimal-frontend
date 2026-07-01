import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEspecies } from '../hooks/useEspecies'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

const INITIAL_FORM = {
  nombre: '',
  descripcion: '',
}

/**
 * Pagina de formulario de especies para crear y editar.
 * @returns {JSX.Element}
 */
export default function EspeciesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { getById, create, update } = useEspecies()

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loadingEspecie, setLoadingEspecie] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    if (!isEditMode) return undefined

    let cancelled = false

    const loadEspecie = async () => {
      setLoadingEspecie(true)
      setSubmitError(null)
      try {
        const data = await getById(id)
        if (cancelled || !data) return
        setFormData({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
        })
      } finally {
        if (!cancelled) setLoadingEspecie(false)
      }
    }

    loadEspecie()

    return () => {
      cancelled = true
    }
  }, [getById, id, isEditMode])

  const handleChange = useCallback((event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setSubmitError(null)
  }, [])

  const validate = useCallback(() => {
    const nextErrors = {}

    if (!formData.nombre.trim()) {
      nextErrors.nombre = 'El nombre de la especie es obligatorio.'
    } else if (formData.nombre.trim().length < 2) {
      nextErrors.nombre = 'El nombre debe tener al menos 2 caracteres.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [formData.nombre])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      if (isEditMode) {
        await update(id, formData)
      } else {
        await create(formData)
      }

      navigate('/especies', {
        state: {
          success: `Especie ${isEditMode ? 'actualizada' : 'creada'} con exito.`,
        },
      })
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Hubo un problema al procesar la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEspecie) {
    return <Loading message="Cargando datos de la especie..." />
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={isEditMode ? 'Editar especie' : 'Nueva especie'}
        breadcrumbs={[
          { label: 'Especies', to: '/especies' },
          { label: isEditMode ? 'Editar' : 'Nuevo' },
        ]}
        action={(
          <button
            type="button"
            onClick={() => navigate('/especies')}
            className="inline-flex items-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Volver a especies
          </button>
        )}
      />

      {submitError && (
        <Alert type="error" message={submitError} onClose={() => setSubmitError(null)} />
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-neutral-200 bg-neutral-card p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="nombre"
            name="nombre"
            label="Nombre de la especie"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Ej. Porcino, Bovino, Felino"
            maxLength={100}
          />

          <div className="space-y-1">
            <label htmlFor="descripcion" className="block text-sm font-medium text-neutral-text">
              Descripcion
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles adicionales sobre esta clasificacion..."
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-card px-3 py-2 text-neutral-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/especies')}
            className="inline-flex items-center justify-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Guardando...' : isEditMode ? 'Actualizar especie' : 'Crear especie'}
          </button>
        </div>
      </form>
    </div>
  )
}

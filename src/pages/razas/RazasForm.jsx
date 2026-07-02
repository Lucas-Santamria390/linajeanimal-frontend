import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEspecies } from '../../hooks/useEspecies'
import { useRazas } from '../../hooks/useRazas'
import PageHeader from '../../components/ui/PageHeader'
import FormField from '../../components/form/FormField'
import SelectField from '../../components/form/SelectField'
import Loading from '../../components/ui/Loading'
import Alert from '../../components/ui/Alert'

const INITIAL_FORM = {
  nombre: '',
  especie: '',
  descripcion: '',
}

/**
 * Formulario de razas para crear y editar.
 * @returns {JSX.Element}
 */
export default function RazasForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [loadingRaza, setLoadingRaza] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retrySeed, setRetrySeed] = useState(0)

  const {
    getById,
    create,
    update,
  } = useRazas({}, { skipInitialFetch: true })
  const {
    data: especies,
    loading: loadingEspecies,
    error: especiesError,
    refetch: refetchEspecies,
  } = useEspecies({ limit: 100 })

  useEffect(() => {
    if (!isEditing) return undefined

    let cancelled = false

    const loadRaza = async () => {
      setLoadingRaza(true)
      setLoadError(null)
      try {
        const raza = await getById(id)
        if (cancelled) return

        if (!raza) {
          setLoadError('No se pudo cargar la raza. Intenta nuevamente.')
          return
        }

        setForm({
          nombre: raza.nombre || '',
          especie: raza.especie?._id || raza.especie || '',
          descripcion: raza.descripcion || '',
        })
      } catch {
        if (!cancelled) {
          setLoadError('No se pudo cargar la raza. Intenta nuevamente.')
        }
      } finally {
        if (!cancelled) setLoadingRaza(false)
      }
    }

    loadRaza()

    return () => {
      cancelled = true
    }
  }, [getById, id, isEditing, retrySeed])

  const especieOptions = useMemo(
    () => especies.map((especie) => ({ value: especie._id, label: especie.nombre })),
    [especies]
  )

  const validate = useCallback(() => {
    const nextErrors = {}

    if (!form.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio'
    } else if (form.nombre.trim().length < 2) {
      nextErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!form.especie) {
      nextErrors.especie = 'La especie es obligatoria'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [form.nombre, form.especie])

  const handleChange = useCallback((event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setSubmitError(null)
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        nombre: form.nombre.trim(),
        especie: form.especie,
      }

      if (form.descripcion.trim()) {
        payload.descripcion = form.descripcion.trim()
      }

      if (isEditing) {
        await update(id, payload)
      } else {
        await create(payload)
      }

      navigate('/razas', {
        state: {
          success: isEditing ? 'Raza actualizada exitosamente' : 'Raza creada exitosamente',
        },
      })
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Error al guardar la raza')
    } finally {
      setSubmitting(false)
    }
  }, [create, id, form.descripcion, form.especie, form.nombre, isEditing, navigate, update, validate])

  const handleRetryLoad = useCallback(() => {
    setRetrySeed((value) => value + 1)
  }, [])

  if (loadingRaza) {
    return <Loading message={isEditing ? 'Cargando datos de la raza...' : 'Cargando...'} />
  }

  if (isEditing && loadError) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Editar raza"
          breadcrumbs={[
            { label: 'Razas', to: '/razas' },
            { label: 'Editar raza' },
          ]}
        />

        <div className="rounded-2xl border border-neutral-200 bg-neutral-card p-5 shadow-sm sm:p-6">
          <div className="space-y-4">
            <Alert type="error" message={loadError} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRetryLoad}
                className="inline-flex items-center justify-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => navigate('/razas')}
                className="inline-flex items-center justify-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
              >
                Volver a razas
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={isEditing ? 'Editar raza' : 'Nueva raza'}
        breadcrumbs={[
          { label: 'Razas', to: '/razas' },
          { label: isEditing ? 'Editar raza' : 'Nueva raza' },
        ]}
      />

      {submitError && (
        <Alert type="error" message={submitError} onClose={() => setSubmitError(null)} />
      )}

      {especiesError && (
        <div className="flex items-start gap-2">
          <Alert type="error" message={especiesError} className="flex-1" />
          <button
            type="button"
            onClick={refetchEspecies}
            className="shrink-0 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-neutral-200 bg-neutral-card p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="nombre"
            name="nombre"
            label="Nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Nombre de la raza"
            maxLength={100}
          />

          <SelectField
            id="especie"
            name="especie"
            label="Especie"
            value={form.especie}
            onChange={handleChange}
            options={especieOptions}
            loading={loadingEspecies}
            loadingText="Cargando..."
            error={errors.especie}
            required
            disabled={Boolean(especiesError)}
            placeholder="Selecciona una especie"
          />

          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="descripcion" className="block text-sm font-medium text-neutral-text">
              Descripcion
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripcion opcional de la raza"
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-card px-3 py-2 text-neutral-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/razas')}
            className="rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar raza' : 'Crear raza'}
          </button>
        </div>
      </form>
    </div>
  )
}

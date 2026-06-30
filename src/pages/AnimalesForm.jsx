import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAnimales } from '../hooks/useAnimales'
import { useEspecies } from '../hooks/useEspecies'
import { useRazas } from '../hooks/useRazas'
import { getAnimales } from '../services/animales'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import SelectField from '../components/SelectField'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

const INITIAL_FORM = {
  nombre: '',
  especie: '',
  raza: '',
  sexo: '',
  fechaNacimiento: '',
  peso: '',
  color: '',
  identificador: '',
  fotoUrl: '',
  notas: '',
  padre: '',
  madre: '',
}

/**
 * Pagina de formulario de animales para crear y editar.
 * @returns {JSX.Element}
 */
export default function AnimalesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loadingAnimal, setLoadingAnimal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [padreOptions, setPadreOptions] = useState([])
  const [madreOptions, setMadreOptions] = useState([])
  const [loadingParents, setLoadingParents] = useState(false)

  const { create, update, getById } = useAnimales()
  const { data: especies, loading: loadingEspecies } = useEspecies({ limit: 100 })
  const { data: razas, loading: loadingRazas, refetch: refetchRazas } = useRazas({ limit: 0 })

  useEffect(() => {
    if (!id) return
    const loadAnimal = async () => {
      setLoadingAnimal(true)
      try {
        const animal = await getById(id)
        if (!animal) return
        setForm({
          nombre: animal.nombre || '',
          especie: animal.especie?._id || '',
          raza: animal.raza?._id || '',
          sexo: animal.sexo || '',
          fechaNacimiento: animal.fechaNacimiento ? animal.fechaNacimiento.split('T')[0] : '',
          peso: animal.peso ?? '',
          color: animal.color || '',
          identificador: animal.identificador || '',
          fotoUrl: animal.fotoUrl || '',
          notas: animal.notas || '',
          padre: animal.padre || '',
          madre: animal.madre || '',
        })
      } catch {
        // handled by hook
      } finally {
        setLoadingAnimal(false)
      }
    }
    loadAnimal()
  }, [id, getById])

  useEffect(() => {
    let cancelled = false
    const loadParents = async () => {
      if (!form.especie) return
      setLoadingParents(true)
      try {
        const [padresRes, madresRes] = await Promise.all([
          getAnimales({ especie: form.especie, sexo: 'macho', limit: 100, page: 1 }),
          getAnimales({ especie: form.especie, sexo: 'hembra', limit: 100, page: 1 }),
        ])
        if (cancelled) return
        setPadreOptions(padresRes.data.data || [])
        setMadreOptions(madresRes.data.data || [])
      } catch {
        if (cancelled) return
        setPadreOptions([])
        setMadreOptions([])
      } finally {
        if (!cancelled) setLoadingParents(false)
      }
    }
    loadParents()
    return () => { cancelled = true }
  }, [form.especie])

  useEffect(() => {
    if (!form.especie) return
    refetchRazas({ especie: form.especie, limit: 100 })
  }, [form.especie, refetchRazas])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const validate = useCallback(() => {
    const newErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!form.especie) newErrors.especie = 'La especie es obligatoria'
    if (!form.raza) newErrors.raza = 'La raza es obligatoria'
    if (!form.sexo) newErrors.sexo = 'El sexo es obligatorio'
    if (!form.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    } else if (form.fechaNacimiento > today) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura'
    }
    if (form.peso && (isNaN(Number(form.peso)) || Number(form.peso) <= 0)) {
      newErrors.peso = 'El peso debe ser un número positivo'
    }
    if (!form.identificador.trim()) newErrors.identificador = 'El identificador es obligatorio'
    if (form.fotoUrl && !/^https?:\/\/.+/.test(form.fotoUrl)) {
      newErrors.fotoUrl = 'Ingresa una URL válida (http:// o https://)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form, today])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'especie' ? { raza: '', padre: '', madre: '' } : {}),
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      if (name === 'especie') {
        delete next.raza
        delete next.padre
        delete next.madre
      }
      return next
    })
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setApiError(null)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza,
        sexo: form.sexo,
        fechaNacimiento: form.fechaNacimiento,
      }
      if (form.peso) payload.peso = Number(form.peso)
      if (form.color.trim()) payload.color = form.color.trim()
      if (form.identificador.trim()) payload.identificador = form.identificador.trim()
      if (form.fotoUrl.trim()) payload.fotoUrl = form.fotoUrl.trim()
      if (form.notas.trim()) payload.notas = form.notas.trim()
      payload.padre = form.padre || null
      payload.madre = form.madre || null

      if (isEditing) {
        await update(id, payload)
      } else {
        await create(payload)
      }
      navigate('/animales', {
        state: { success: isEditing ? 'Animal actualizado exitosamente' : 'Animal creado exitosamente' },
      })
    } catch (err) {
      const message = err?.response?.data?.message || 'Error al guardar el animal'
      setApiError(message)
    } finally {
      setSubmitting(false)
    }
  }, [form, validate, isEditing, id, update, create, navigate])

  const especieOptions = useMemo(
    () => especies.map((e) => ({ value: e._id, label: e.nombre })),
    [especies]
  )

  const razaOptions = useMemo(
    () => razas.map((r) => ({ value: r._id, label: r.nombre })),
    [razas]
  )

  const sexoOptions = [
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' },
  ]

  const padreSelectOptions = useMemo(
    () => padreOptions.map((a) => ({ value: a._id, label: a.nombre })),
    [padreOptions]
  )

  const madreSelectOptions = useMemo(
    () => madreOptions.map((a) => ({ value: a._id, label: a.nombre })),
    [madreOptions]
  )

  if (loadingAnimal) {
    return <Loading message={isEditing ? 'Cargando datos del animal...' : 'Cargando...'} />
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={isEditing ? 'Editar animal' : 'Nuevo animal'}
        breadcrumbs={[
          { label: 'Animales', href: '/animales' },
          { label: isEditing ? 'Editar' : 'Nuevo' },
        ]}
      />

      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="nombre"
            name="nombre"
            label="Nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Nombre del animal"
            maxLength={100}
          />

          <div className="space-y-1">
            <SelectField
              id="especie"
              name="especie"
              label="Especie"
              value={form.especie}
              onChange={handleChange}
              options={especieOptions}
              loading={loadingEspecies}
              error={errors.especie}
              required
              placeholder="Selecciona una especie"
            />
          </div>

          <div className="space-y-1">
            <SelectField
              id="raza"
              name="raza"
              label="Raza"
              value={form.raza}
              onChange={handleChange}
              options={razaOptions}
              loading={loadingRazas}
              error={errors.raza}
              required
              disabled={!form.especie}
              placeholder={form.especie ? 'Selecciona una raza' : 'Primero selecciona una especie'}
            />
          </div>

          <div className="space-y-1">
            <SelectField
              id="sexo"
              name="sexo"
              label="Sexo"
              value={form.sexo}
              onChange={handleChange}
              options={sexoOptions}
              error={errors.sexo}
              required
              placeholder="Selecciona el sexo"
            />
          </div>

          <FormField
            id="fechaNacimiento"
            name="fechaNacimiento"
            label="Fecha de nacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={handleChange}
            error={errors.fechaNacimiento}
            required
            max={today}
          />

          <FormField
            id="peso"
            name="peso"
            label="Peso"
            type="number"
            value={form.peso}
            onChange={handleChange}
            error={errors.peso}
            placeholder="Peso en kg"
            min="0"
            step="0.01"
          />

          <FormField
            id="color"
            name="color"
            label="Color"
            value={form.color}
            onChange={handleChange}
            error={errors.color}
            placeholder="Color del animal"
            maxLength={50}
          />

          <FormField
            id="identificador"
            name="identificador"
            label="Identificador"
            value={form.identificador}
            onChange={handleChange}
            error={errors.identificador}
            required
            placeholder="Número de identificación"
            maxLength={50}
          />

          <FormField
            id="fotoUrl"
            name="fotoUrl"
            label="URL de foto"
            type="url"
            value={form.fotoUrl}
            onChange={handleChange}
            error={errors.fotoUrl}
            placeholder="https://ejemplo.com/foto.jpg"
          />

          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="notas" className="block text-sm font-medium text-neutral-text">
              Notas
            </label>
            <textarea
              id="notas"
              name="notas"
              value={form.notas}
              onChange={handleChange}
              placeholder="Notas adicionales (opcional)"
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-card px-3 py-2 text-neutral-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="space-y-1">
            <SelectField
              id="padre"
              name="padre"
              label="Padre"
              value={form.padre}
              onChange={handleChange}
              options={padreSelectOptions}
              loading={loadingParents}
              disabled={!form.especie}
              placeholder={form.especie ? 'Selecciona el padre' : 'Primero selecciona una especie'}
            />
          </div>

          <div className="space-y-1">
            <SelectField
              id="madre"
              name="madre"
              label="Madre"
              value={form.madre}
              onChange={handleChange}
              options={madreSelectOptions}
              loading={loadingParents}
              disabled={!form.especie}
              placeholder={form.especie ? 'Selecciona la madre' : 'Primero selecciona una especie'}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/animales')}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-text transition-colors hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar animal' : 'Crear animal'}
          </button>
        </div>
      </form>
    </div>
  )
}

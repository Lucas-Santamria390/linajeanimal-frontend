import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useUsuarios } from '../hooks/useUsuarios'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import SelectField from '../components/SelectField'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

const initialForm = {
  nombre: '',
  email: '',
  rol: 'user',
  password: '',
}

/**
 * Formulario basico de usuarios para crear y editar registros.
 * @returns {JSX.Element}
 */
export default function UsuariosForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loadingUser, setLoadingUser] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [alertMessage, setAlertMessage] = useState(() => {
    const message = location.state?.success || ''
    return message ? { type: 'success', message } : null
  })
  const [submitError, setSubmitError] = useState(null)

  const { getById, create, update } = useUsuarios()

  useEffect(() => {
    if (location.state?.success) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state?.success])

  useEffect(() => {
    if (!isEdit) return undefined

    let cancelled = false

    const loadUser = async () => {
      setLoadingUser(true)
      try {
        const userData = await getById(id)
        if (cancelled || !userData) return
        setForm({
          nombre: userData.nombre || '',
          email: userData.email || '',
          rol: userData.rol || 'user',
          password: '',
        })
      } finally {
        if (!cancelled) setLoadingUser(false)
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [getById, id, isEdit])

  const handleChange = useCallback((event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }, [])

  const validate = useCallback(() => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

    if (!form.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.'
    if (!form.email.trim()) {
      nextErrors.email = 'El email es obligatorio.'
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Ingresa un email valido.'
    }
    if (!form.rol) nextErrors.rol = 'Selecciona un rol.'
    if (!isEdit) {
      if (!form.password) {
        nextErrors.password = 'La contraseña es obligatoria.'
      } else if (!passwordPattern.test(form.password)) {
        nextErrors.password = 'La contraseña debe tener 8 caracteres, mayuscula, numero y simbolo.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [form.nombre, form.email, form.rol, form.password, isEdit])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
      }

      if (!isEdit) {
        payload.password = form.password
        await create(payload)
      } else {
        await update(id, payload)
      }

      navigate('/usuarios', {
        state: {
          success: isEdit ? 'Usuario actualizado con exito.' : 'Usuario creado con exito.',
        },
      })
    } catch (err) {
      setSubmitError(err?.response?.data?.message || (isEdit
        ? 'No se pudo actualizar el usuario. Intenta nuevamente.'
        : 'No se pudo crear el usuario. Intenta nuevamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingUser) {
    return <Loading message="Cargando usuario..." />
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        breadcrumbs={[
          { label: 'Usuarios', to: '/usuarios' },
          { label: isEdit ? 'Editar' : 'Nuevo' },
        ]}
        action={(
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="inline-flex items-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Volver a usuarios
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

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError(null)} />}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-neutral-card p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="nombre"
            name="nombre"
            label="Nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Ej. Maria Lopez"
          />
          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="ejemplo@correo.com"
          />
          <SelectField
            id="rol"
            name="rol"
            label="Rol"
            value={form.rol}
            onChange={handleChange}
            error={errors.rol}
            required
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          {!isEdit ? (
            <FormField
              id="password"
              name="password"
              type="password"
              label="Contraseña"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="Minimo 8 caracteres"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-muted md:col-span-1">
              La contraseña no se modifica desde este formulario.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="inline-flex items-center justify-center rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Guardando...' : isEdit ? 'Actualizar usuario' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}

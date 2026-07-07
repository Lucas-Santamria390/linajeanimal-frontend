import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/auth'
import Alert from '../../components/ui/Alert'
import Loading from '../../components/ui/Loading'
import { PASSWORD_REQUIREMENTS } from '../../utils/constants'

/**
 * Pagina de registro de nuevo usuario
 * Formulario con validacion de email y password (checklist en vivo).
 * Llama a POST /auth/register y redirige a /login en exito.
 * @returns {JSX.Element}
 */
export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const successTimeout = useRef(null)

  useEffect(() => {
    return () => {
      if (successTimeout.current) clearTimeout(successTimeout.current)
    }
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (!form.email) errs.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo invalido'
    if (!form.password) errs.password = 'La contrasena es obligatoria'
    else {
      for (const req of PASSWORD_REQUIREMENTS) {
        if (!req.test(form.password)) {
          errs.password = 'La contrasena no cumple los requisitos'
          break
        }
      }
    }
    if (form.password !== form.password_confirmation) {
      errs.password_confirmation = 'Las contrasenas no coinciden'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setLoading(true)
    try {
      await register({ nombre: form.nombre, email: form.email, password: form.password })
      setSuccess(true)
      successTimeout.current = setTimeout(() => navigate('/login', { state: { registered: true } }), 1500)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4 py-8">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-neutral-card p-8 text-center shadow-md">
          <div className="text-brand-500 text-4xl mb-3">&#10003;</div>
          <h2 className="text-xl font-bold text-neutral-text mb-2">Registro exitoso</h2>
          <p className="text-neutral-muted text-sm">Redirigiendo al inicio de sesion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-neutral-card p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-neutral-text">
          Crear cuenta
        </h1>

        <Alert message={apiError} type="error" onClose={() => setApiError(null)} />

        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-neutral-text mb-1">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-text outline-none transition ${
              errors.nombre
                ? 'border-red-500'
                : 'border-neutral-300 bg-neutral-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }`}
          />
          {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-text mb-1">Correo</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-text outline-none transition ${
              errors.email
                ? 'border-red-500'
                : 'border-neutral-300 bg-neutral-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }`}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-text mb-1">Contrasena</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-text outline-none transition ${
              errors.password
                ? 'border-red-500'
                : 'border-neutral-300 bg-neutral-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }`}
          />
          <ul className="mt-1 space-y-0.5">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const passed = form.password ? req.test(form.password) : false
              return (
                <li
                  key={req.label}
                  className={`text-xs ${passed ? 'text-brand-600' : 'text-neutral-muted'}`}
                >
                  <span aria-hidden="true">{passed ? '\u2713' : '\u2022'}</span> {req.label}
                </li>
              )
            })}
          </ul>
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-neutral-text mb-1">
            Confirmar contrasena
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-text outline-none transition ${
              errors.password_confirmation
                ? 'border-red-500'
                : 'border-neutral-300 bg-neutral-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }`}
          />
          {errors.password_confirmation && (
            <p className="text-red-600 text-xs mt-1">{errors.password_confirmation}</p>
          )}
        </div>

        {loading ? (
          <Loading message="Creando cuenta..." />
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            Registrarse
          </button>
        )}

        <p className="text-center text-sm text-neutral-muted mt-4">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-500 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/ui/Alert'
import Loading from '../../components/ui/Loading'

const PASSWORD_REQUIREMENTS = [
  { label: 'Minimo 8 caracteres', test: (v) => v.length >= 8 },
  { label: 'Al menos una mayuscula', test: (v) => /[A-Z]/.test(v) },
  { label: 'Al menos un numero', test: (v) => /\d/.test(v) },
  { label: 'Al menos un caracter especial', test: (v) => /[!@#$%^&*(),.?":{}|<>_]/.test(v) },
]

/**
 * Pagina de inicio de sesion
 * Validacion de campos email/password antes de enviar.
 * Muestra errores por campo, checklist de requisitos de password y error general del API.
 * @returns {JSX.Element}
 */
export default function Login() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const registeredMessage = location.state?.registered
  const sessionExpired = sessionStorage.getItem('sessionExpired')
  if (sessionExpired) sessionStorage.removeItem('sessionExpired')
  const { login, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  if (registeredMessage) {
    window.history.replaceState({}, document.title)
  }

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Correo invalido'
    if (!password) errs.password = 'La contrasena es obligatoria'
    else {
      for (const req of PASSWORD_REQUIREMENTS) {
        if (!req.test(password)) {
          errs.password = 'La contrasena no cumple los requisitos'
          break
        }
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const success = await login(email, password)
    if (success) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-neutral-card p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-neutral-text">
          Iniciar sesión
        </h1>

        <Alert message={error} type="error" onClose={() => setError(null)} />
        {sessionExpired && (
          <Alert type="warning" message="Tu sesion ha expirado. Inicia sesion nuevamente." />
        )}
        {registeredMessage && (
          <Alert type="success" message="Cuenta creada exitosamente. Inicia sesion." />
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-text mb-1">Correo</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-text outline-none transition ${
              errors.password
                ? 'border-red-500'
                : 'border-neutral-300 bg-neutral-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }`}
          />
          <ul className="mt-1 space-y-0.5">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const passed = password ? req.test(password) : false
              return (
                <li
                  key={req.label}
                  className={`text-xs ${passed ? 'text-brand-600' : 'text-neutral-muted'}`}
                >
                  <span aria-hidden="true">{passed ? '?' : '?'}</span> {req.label}
                </li>
              )
            })}
          </ul>
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        {loading ? (
          <Loading message="Iniciando sesion..." />
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            Ingresar
          </button>
        )}

        <p className="text-center text-sm text-neutral-muted mt-4">
          No tienes cuenta?{' '}
          <Link to="/register" className="text-brand-500 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  )
}

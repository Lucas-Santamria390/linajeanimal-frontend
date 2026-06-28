import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/auth'
import Alert from '../components/Alert'
import Loading from '../components/Loading'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const passwordRequirements = [
    { label: 'Minimo 8 caracteres', test: (v) => v.length >= 8 },
    { label: 'Al menos una mayuscula', test: (v) => /[A-Z]/.test(v) },
    { label: 'Al menos un numero', test: (v) => /\d/.test(v) },
    { label: 'Al menos un caracter especial', test: (v) => /[!@#$%^&*(),.?":{}|<>_]/.test(v) },
  ]

  const validate = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (!form.email) errs.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo invalido'
    if (!form.password) errs.password = 'La contrasena es obligatoria'
    else {
      for (const req of passwordRequirements) {
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
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login', { state: { registered: true } }), 1500)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <div className="text-brand-500 text-4xl mb-3">&#10003;</div>
          <h2 className="text-xl font-bold text-neutral-text mb-2">Registro exitoso</h2>
          <p className="text-neutral-muted text-sm">Redirigiendo al inicio de sesion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-neutral-text">
          Crear cuenta
        </h1>

        <Alert message={apiError} type="error" onClose={() => setApiError(null)} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-text mb-1">Nombre</label>
          <input
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 text-sm ${
              errors.nombre ? 'border-red-500' : 'border-neutral-300'
            }`}
          />
          {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-text mb-1">Correo</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 text-sm ${
              errors.email ? 'border-red-500' : 'border-neutral-300'
            }`}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-text mb-1">Contrasena</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 text-sm ${
              errors.password ? 'border-red-500' : 'border-neutral-300'
            }`}
          />
          <ul className="mt-1 space-y-0.5">
            {passwordRequirements.map((req) => {
              const passed = form.password ? req.test(form.password) : false
              return (
                <li
                  key={req.label}
                  className={`text-xs ${passed ? 'text-brand-600' : 'text-neutral-muted'}`}
                >
                  {passed ? '?' : '?'} {req.label}
                </li>
              )
            })}
          </ul>
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-text mb-1">
            Confirmar contrasena
          </label>
          <input
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 text-sm ${
              errors.password_confirmation ? 'border-red-500' : 'border-neutral-300'
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
            className="w-full bg-brand-500 text-white py-2 rounded font-medium hover:bg-brand-600"
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

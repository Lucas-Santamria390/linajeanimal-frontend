import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/Alert'
import Loading from '../components/Loading'

export default function Login() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [registeredMessage] = useState(location.state?.registered)
  const { login, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Correo inválido'
    if (!password) errs.password = 'La contraseña es obligatoria'
    else if (password.length < 8) errs.password = 'Mínimo 8 caracteres'
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-neutral-text">
          Iniciar sesión
        </h1>

        <Alert message={error} type="error" onClose={() => setError(null)} />
        {registeredMessage && (
          <Alert type="success" message="Cuenta creada exitosamente. Inicia sesion." />
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-text mb-1">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.email ? 'border-red-500' : 'border-neutral-300'}`}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-text mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.password ? 'border-red-500' : 'border-neutral-300'}`}
          />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        {loading ? (
          <Loading message="Iniciando sesión..." />
        ) : (
          <button
            type="submit"
            className="w-full bg-brand-500 text-white py-2 rounded font-medium hover:bg-brand-600"
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

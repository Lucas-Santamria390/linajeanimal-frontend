import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../services/auth'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import Alert from '../components/Alert'
import Loading from '../components/Loading'

const PASSWORD_REQUIREMENTS = [
  { label: 'Minimo 8 caracteres', test: (v) => v.length >= 8 },
  { label: 'Al menos una mayuscula', test: (v) => /[A-Z]/.test(v) },
  { label: 'Al menos un numero', test: (v) => /\d/.test(v) },
  { label: 'Al menos un caracter especial', test: (v) => /[!@#$%^&*(),.?":{}|<>_]/.test(v) },
]

/**
 * Pagina de perfil del usuario autenticado
 * Seccion 1: datos personales en solo lectura
 * Seccion 2: formulario para cambiar contrasena
 * Boton de cerrar sesion
 * @returns {JSX.Element}
 */
export default function Perfil() {
  const { user, logout, updateAuth } = useAuth()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [success, setSuccess] = useState(null)

  const validate = () => {
    const errs = {}
    if (!oldPassword) errs.oldPassword = 'La contrasena actual es obligatoria'
    if (!newPassword) errs.newPassword = 'La nueva contrasena es obligatoria'
    else {
      for (const req of PASSWORD_REQUIREMENTS) {
        if (!req.test(newPassword)) {
          errs.newPassword = 'La contrasena no cumple los requisitos'
          break
        }
      }
    }
    if (!confirmNew) errs.confirmNew = 'Debe confirmar la nueva contrasena'
    else if (newPassword !== confirmNew) errs.confirmNew = 'Las contrasenas no coinciden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    setSuccess(null)
    if (!validate()) return
    setLoading(true)
    try {
      const res = await changePassword(oldPassword, newPassword)
      const { token: newToken, usuario: userData } = res.data.data
      updateAuth(newToken, userData)
      setSuccess('Contrasena actualizada exitosamente')
      setOldPassword('')
      setNewPassword('')
      setConfirmNew('')
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Error al cambiar contrasena')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Mi Perfil" breadcrumbs={[{ label: 'Perfil' }]} />

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-text">Datos personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre"
            value={user?.nombre || ''}
            readOnly
            disabled
          />
          <FormField
            label="Correo electronico"
            type="email"
            value={user?.email || ''}
            readOnly
            disabled
          />
        </div>
        <p className="text-xs text-neutral-muted">
          Rol: <span className="capitalize font-medium">{user?.rol || 'user'}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-text mb-4">Cambiar contrasena</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="oldPassword"
            label="Contrasena actual"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={errors.oldPassword}
            autoComplete="current-password"
          />

          <div>
            <FormField
              id="newPassword"
              label="Nueva contrasena"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              autoComplete="new-password"
              describedBy="password-reqs"
            />
            <ul id="password-reqs" className="mt-1 space-y-0.5 ml-1">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const passed = newPassword ? req.test(newPassword) : false
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
          </div>

          <FormField
            id="confirmNew"
            label="Confirmar nueva contrasena"
            type="password"
            value={confirmNew}
            onChange={(e) => setConfirmNew(e.target.value)}
            error={errors.confirmNew}
            autoComplete="new-password"
          />

          {loading ? (
            <Loading message="Actualizando contrasena..." />
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 px-6 py-2 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50 md:w-auto cursor-pointer"
            >
              Actualizar contrasena
            </button>
          )}
        </form>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-secondary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-secondary-600 cursor-pointer"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}

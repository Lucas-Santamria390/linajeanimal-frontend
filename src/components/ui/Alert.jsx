/**
 * Componente de alerta/notificacion con tipos predefinidos
 * @param {object} props - Propiedades del componente
 * @param {('success'|'error'|'warning'|'info')} [props.type='info'] - Tipo de alerta
 * @param {string|null} props.message - Mensaje a mostrar
 * @param {() => void} [props.onClose] - Callback al cerrar la alerta
 * @returns {JSX.Element|null}
 */
export default function Alert({ type = 'info', message, onClose }) {
  const colors = {
    success: 'bg-state-success-bg border-state-success-border text-state-success-text',
    error: 'bg-state-error-bg border-state-error-border text-state-error-text',
    warning: 'bg-state-warning-bg border-state-warning-border text-state-warning-text',
    info: 'bg-state-info-bg border-state-info-border text-state-info-text',
  }

  if (!message) return null

  return (
    <div role="alert" className={`flex items-start justify-between rounded border-l-4 p-3 ${colors[type] || colors.info}`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-sm font-bold text-neutral-muted transition hover:opacity-70">
          &times;
        </button>
      )}
    </div>
  )
}

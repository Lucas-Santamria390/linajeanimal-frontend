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
    success: 'bg-brand-50 border-brand-500 text-brand-700',
    error: 'bg-red-100 border-red-400 text-red-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
  }

  if (!message) return null

  return (
    <div className={`border-l-4 p-3 rounded ${colors[type] || colors.info} flex justify-between items-start`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-sm font-bold hover:opacity-70">&times;</button>
      )}
    </div>
  )
}

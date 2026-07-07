/**
 * Estado vacío para tablas y listas sin datos
 * @param {object} props - Propiedades del componente
 * @param {React.ElementType} [props.icon] - Icono opcional
 * @param {string} [props.title] - Título informativo
 * @param {string} [props.message] - Mensaje descriptivo
 * @param {React.ReactNode} [props.action] - Botón o acción opcional
 * @returns {JSX.Element}
 */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[350px] bg-neutral-card rounded-xl border border-neutral-200 shadow-sm">
      <div className="p-4 bg-neutral-50 rounded-full text-neutral-400 mb-4">
        {Icon ? (
          <Icon className="w-10 h-10" />
        ) : (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0a1.5 1.5 0 00-1.5-1.5H5.25A1.5 1.5 0 003.75 7.5m16.5 0l-2.25-4.5h-10.5L3.75 7.5" />
          </svg>
        )}
      </div>

      <h3 className="mb-1 text-lg font-semibold text-neutral-text">
        {title || 'No hay datos disponibles'}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-neutral-muted">
        {message || 'No se encontraron registros en este momento.'}
      </p>

      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  );
}

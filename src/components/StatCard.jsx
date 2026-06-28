/**
 * Tarjeta de estadistica con borde destacado e icono opcional.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.label - Etiqueta descriptiva de la metrica.
 * @param {string|number|JSX.Element} props.value - Valor mostrado en la tarjeta.
 * @param {string} [props.borderClassName='border-brand-500'] - Clase Tailwind para el borde lateral.
 * @param {JSX.Element|null} [props.icon] - Icono opcional.
 * @param {string} [props.className=''] - Clases adicionales para el contenedor.
 * @returns {JSX.Element}
 */
export default function StatCard({
  label,
  value,
  borderClassName = 'border-brand-500',
  icon = null,
  className = '',
}) {
  return (
    <article
      className={`rounded-2xl border border-neutral-300 bg-neutral-card p-5 shadow-sm ${borderClassName} border-l-4 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-text">{value}</p>
        </div>
        {icon && (
          <div className="rounded-xl bg-brand-50 p-3 text-brand-600">
            {icon}
          </div>
        )}
      </div>
    </article>
  )
}

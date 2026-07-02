const STYLES = {
  success: 'border-brand-500 bg-brand-50 text-brand-700',
  warning: 'border-secondary-500 bg-secondary-500/10 text-secondary-600',
  info: 'border-secondary-500 bg-secondary-500/10 text-secondary-600',
  neutral: 'border-neutral-300 bg-neutral-100 text-neutral-muted',
}

/**
 * Badge reutilizable para estados y etiquetas.
 * @param {object} props - Propiedades del componente.
 * @param {string} [props.children] - Texto a mostrar dentro del badge.
 * @param {('success'|'warning'|'info'|'neutral')} [props.variant='neutral'] - Variante visual.
 * @param {boolean} [props.active] - Atajo para estado activo/inactivo.
 * @param {string} [props.className=''] - Clases adicionales.
 * @returns {JSX.Element}
 */
export default function Badge({
  children,
  variant = 'neutral',
  active,
  className = '',
}) {
  const resolvedVariant = typeof active === 'boolean' ? (active ? 'success' : 'neutral') : variant
  const content = children || (typeof active === 'boolean' ? (active ? 'Activo' : 'Inactivo') : '')

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[resolvedVariant] || STYLES.neutral} ${className}`.trim()}
    >
      {content}
    </span>
  )
}

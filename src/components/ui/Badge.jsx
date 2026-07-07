const STYLES = {
  success: 'border-state-success-border bg-state-success-bg text-state-success-text',
  warning: 'border-state-warning-border bg-state-warning-bg text-state-warning-text',
  info: 'border-state-info-border bg-state-info-bg text-state-info-text',
  neutral: 'border-neutral-300 bg-neutral-hover text-neutral-muted',
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

/**
 * Componente de spinner de carga
 * @param {object} props - Propiedades del componente
 * @param {string} [props.message='Cargando...'] - Mensaje opcional
 * @returns {JSX.Element}
 */
export default function Loading({ message = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-muted text-sm">{message}</p>
      </div>
    </div>
  )
}

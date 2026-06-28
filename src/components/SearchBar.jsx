import { useEffect, useState } from 'react'

/**
 * Barra de busqueda con icono y debounce configurable.
 * @param {object} props - Propiedades del componente.
 * @param {(value: string) => void} props.onSearch - Callback que recibe el texto buscado.
 * @param {string} [props.placeholder='Buscar...'] - Texto placeholder.
 * @param {number} [props.delay=300] - Tiempo de debounce en milisegundos.
 * @param {string} [props.initialValue=''] - Valor inicial del campo.
 * @param {string} [props.className=''] - Clases adicionales para el contenedor.
 * @param {string} [props.ariaLabel='Buscar'] - Etiqueta accesible del input.
 * @returns {JSX.Element}
 */
export default function SearchBar({
  onSearch,
  placeholder = 'Buscar...',
  delay = 300,
  initialValue = '',
  className = '',
  ariaLabel = 'Buscar',
}) {
  const [query, setQuery] = useState(initialValue)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(query.trim())
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [query, delay, onSearch])

  return (
    <div className={`relative ${className}`.trim()}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-muted">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-neutral-300 bg-neutral-card py-2 pl-10 pr-3 text-neutral-text outline-none transition focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
      />
    </div>
  )
}

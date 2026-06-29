/**
 * Campo de seleccion reutilizable con etiqueta, error y estado de carga.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.id - Identificador unico del select.
 * @param {string} props.label - Texto de la etiqueta.
 * @param {string|number} props.value - Valor seleccionado.
 * @param {(event: React.ChangeEvent<HTMLSelectElement>) => void} props.onChange - Callback al cambiar la seleccion.
 * @param {Array<object|string>} [props.options=[]] - Opciones a renderizar.
 * @param {string} [props.placeholder='Selecciona una opcion'] - Texto del placeholder.
 * @param {boolean} [props.loading=false] - Indica si las opciones estan cargando.
 * @param {string} [props.error] - Mensaje de error a mostrar.
 * @param {boolean} [props.disabled=false] - Indica si el campo esta deshabilitado.
 * @param {boolean} [props.required=false] - Indica si el campo es obligatorio.
 * @param {string} [props.name] - Nombre del campo.
 * @param {string} [props.className=''] - Clases adicionales para el contenedor.
 * @returns {JSX.Element}
 */
export default function SelectField({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opcion',
  loading = false,
  error,
  disabled = false,
  required = false,
  name,
  className = '',
}) {
  const selectId = id || name
  const errorId = `${selectId}-error`

  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: option, label: String(option), disabled: false }
    }

    return {
      value: option.value,
      label: option.label ?? String(option.value),
      disabled: Boolean(option.disabled),
    }
  })

  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <label htmlFor={selectId} className="block text-sm font-medium text-neutral-text">
        {label}
        {required && <span className="ml-1 text-brand-600">*</span>}
      </label>
      <select
        id={selectId}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled || loading}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-lg border border-neutral-300 bg-neutral-card px-3 py-2 text-neutral-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-muted"
      >
        {loading ? (
          <option value="" disabled>
            Cargando opciones...
          </option>
        ) : (
          <>
            <option value="">{placeholder}</option>
            {normalizedOptions.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

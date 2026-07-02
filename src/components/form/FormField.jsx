/**
 * Campo de formulario reutilizable con etiqueta y mensaje de error.
 * Soporta entradas de texto, email, password, number, date y url.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.id - Identificador unico del campo.
 * @param {string} props.label - Texto de la etiqueta.
 * @param {('text'|'email'|'password'|'number'|'date'|'url')} [props.type='text'] - Tipo de input.
 * @param {string|number} props.value - Valor actual del campo.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Callback al cambiar el valor.
 * @param {(event: React.FocusEvent<HTMLInputElement>) => void} [props.onBlur] - Callback al perder el foco.
 * @param {string} [props.name] - Nombre del campo.
 * @param {string} [props.placeholder] - Texto placeholder.
 * @param {string} [props.error] - Mensaje de error a mostrar.
 * @param {boolean} [props.disabled=false] - Indica si el campo esta deshabilitado.
 * @param {boolean} [props.required=false] - Indica si el campo es obligatorio.
 * @param {string} [props.autoComplete] - Valor para autoComplete.
 * @param {string} [props.className=''] - Clases adicionales para el contenedor.
 * @param {number|string} [props.min] - Valor minimo permitido.
 * @param {number|string} [props.max] - Valor maximo permitido.
 * @param {number|string} [props.step] - Paso permitido.
 * @param {string} [props.pattern] - Patron HTML para validacion.
 * @param {number} [props.maxLength] - Longitud maxima permitida.
 * @param {boolean} [props.readOnly=false] - Indica si el campo es solo lectura.
 * @param {string} [props.describedBy] - ID del elemento que describe el campo (aria-describedby).
 * @returns {JSX.Element}
 */
export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  error,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  min,
  max,
  step,
  pattern,
  maxLength,
  readOnly = false,
  describedBy,
}) {
  const inputId = id || name
  const errorId = `${inputId}-error`
  const describedById = [error ? errorId : null, describedBy].filter(Boolean).join(' ') || undefined

  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-text">
        {label}
        {required && <span className="ml-1 text-brand-600">*</span>}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        maxLength={maxLength}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={describedById}
        className="w-full rounded-lg border border-neutral-300 bg-neutral-card px-3 py-2 text-neutral-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-muted"
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

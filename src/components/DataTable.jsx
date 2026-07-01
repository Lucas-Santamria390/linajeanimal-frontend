import EmptyState from './EmptyState';

/**
 * Tabla de datos responsiva con vista de tarjetas en móvil y tabla en escritorio
 * @param {object} props - Propiedades del componente
 * @param {Array<{key: string, header: string, sortable?: boolean, render?: (value: unknown, row: object) => import('react').ReactNode, className?: string}>} props.columns - Configuración de columnas
 * @param {Array<object>} props.data - Datos a renderizar
 * @param {(key: string) => void} [props.onSort] - Callback al ordenar por columna
 * @param {string} [props.emptyMessage] - Mensaje cuando no hay datos
 * @param {string} [props.emptyTitle] - Título cuando no hay datos
 * @param {React.ElementType} [props.emptyIcon] - Icono cuando no hay datos
 * @returns {JSX.Element}
 */
export default function DataTable({ 
  columns = [], 
  data = [], 
  onSort, 
  emptyMessage,
  emptyTitle,
  emptyIcon
}) {
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        title={emptyTitle || 'No se encontraron registros'} 
        message={emptyMessage || 'No hay información disponible para mostrar en esta tabla.'} 
        icon={emptyIcon} 
      />
    );
  }

  return (
    <div className="w-full">
      {/* MÓVIL: Vista de tarjetas (< 768px) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((row, rowIndex) => (
          <div 
            key={row._id || row.id || rowIndex} 
            className="bg-neutral-card p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3"
          >
            {columns.map((col, colIndex) => (
              <div key={col.key || colIndex} className="flex justify-between items-start text-sm">
                <span className="font-semibold text-neutral-muted text-xs uppercase tracking-wider pr-2">
                  {col.header}:
                </span>
                <span className="font-medium text-right text-neutral-text">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/*  ESCRITORIO: Vista de Tabla tradicional (>= 768px) */}
      <div className="hidden md:block w-full overflow-x-auto bg-neutral-card rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-bg border-b border-neutral-200 text-xs font-semibold text-neutral-muted uppercase tracking-wider">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key ?? index}
                  scope="col"
                  className={`px-6 py-4 ${col.sortable ? 'cursor-pointer select-none hover:bg-neutral-100' : ''} ${col.className || ''}`}
                  {...(col.sortable ? {
                    tabIndex: 0,
                    role: 'button',
                    onClick: () => onSort?.(col.key),
                    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort?.(col.key) } }
                  } : {})}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-sm text-neutral-text">
            {data.map((row, rowIndex) => (
              <tr key={row._id || row.id || rowIndex} className="hover:bg-neutral-50/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

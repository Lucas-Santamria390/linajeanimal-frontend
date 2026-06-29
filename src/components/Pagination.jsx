/**
 * Paginación con soporte dual (clásico y mongoose-paginate)
 * @param {object} props - Propiedades del componente
 * @param {number} [props.page=1] - Página actual
 * @param {number} [props.totalPages] - Total de páginas (formato clásico)
 * @param {number} [props.pages] - Total de páginas (mongoose-paginate)
 * @param {number} [props.total] - Total de documentos (formato clásico)
 * @param {number} [props.totalDocs] - Total de documentos (mongoose-paginate)
 * @param {(page: number) => void} [props.onPageChange] - Callback al cambiar página
 * @returns {JSX.Element|null}
 */
export default function Pagination({ 
  page = 1, 
  totalPages, 
  pages,
  total, 
  totalDocs,
  onPageChange 
}) {
  // Normalización adaptativa de propiedades del formato clásico vs mongoose-paginate
  const activePage = Number(page);
  const finalTotalPages = Number(totalPages || pages || 1);
  const finalTotalDocs = Number(total !== undefined ? total : (totalDocs || 0));

  if (finalTotalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1">
      {/* Resumen de registros */}
      <div className="text-sm text-neutral-500 font-medium">
        Mostrando página <span className="font-semibold text-neutral-900">{activePage}</span> de{' '}
        <span className="font-semibold text-neutral-900">{finalTotalPages}</span>
        {finalTotalDocs > 0 && (
          <> (<span className="font-semibold text-neutral-900">{finalTotalDocs}</span> registros en total)</>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="inline-flex rounded-lg border border-neutral-200 bg-white shadow-sm p-1 gap-1">
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(activePage - 1)}
          disabled={activePage === 1}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(activePage + 1)}
          disabled={activePage === finalTotalPages}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';

/**
 * Cabecera de página con título, breadcrumbs y botón de acción
 * @param {object} props - Propiedades del componente
 * @param {string} props.title - Título de la página
 * @param {Array<{label: string, to?: string}>} [props.breadcrumbs] - Migas de pan
 * @param {React.ReactNode} [props.action] - Botón o acción en la esquina derecha
 * @returns {JSX.Element}
 */
export default function PageHeader({ title, breadcrumbs = [], action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      {/* Título y Breadcrumb */}
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs md:text-sm font-medium text-neutral-500">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={index} className="inline-flex items-center">
                    {index > 0 && <span className="mx-2 text-neutral-400">/</span>}
                    {isLast ? (
                      <span className="text-neutral-900 font-semibold" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link to={crumb.to || '#'} className="hover:text-brand-600 transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
          {title}
        </h1>
      </div>

      {/* Botón de acción a la derecha */}
      {action && (
        <div className="flex items-center shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
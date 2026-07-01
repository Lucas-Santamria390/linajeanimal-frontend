import { Link } from 'react-router-dom'

/**
 * Cabecera de pagina con titulo, breadcrumbs y boton de accion.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.title - Titulo de la pagina.
 * @param {Array<{label: string, to?: string, href?: string}>} [props.breadcrumbs] - Migas de pan.
 * @param {React.ReactNode} [props.action] - Boton o accion en la esquina derecha.
 * @returns {JSX.Element}
 */
export default function PageHeader({ title, breadcrumbs = [], action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex flex-wrap items-center gap-1 text-xs font-medium text-neutral-muted md:text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1

                return (
                  <li key={`${crumb.label}-${index}`} className="inline-flex items-center">
                    {index > 0 && <span className="mx-2 text-neutral-400">/</span>}
                    {isLast ? (
                      <span className="font-semibold text-neutral-text" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.to || crumb.href || '#'}
                        className="transition-colors hover:text-brand-600"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-neutral-text sm:text-3xl">{title}</h1>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

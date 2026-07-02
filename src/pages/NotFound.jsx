import { Link } from 'react-router-dom'

/**
 * Pagina 404 para rutas no encontradas.
 * @returns {JSX.Element}
 */
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary-600">404</p>
      <h1 className="mt-3 text-3xl font-black text-neutral-text sm:text-4xl">
        Pagina no encontrada
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-neutral-muted">
        La ruta que intentaste abrir no existe o fue movida. Puedes volver al inicio y seguir navegando
        desde ahi.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

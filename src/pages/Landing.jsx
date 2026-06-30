import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Trazabilidad completa',
    description:
      'Visualiza la línea genealógica de cada animal con relaciones claras entre padres, hijos y hermanos.',
    icon: GenealogyIcon,
  },
  {
    title: 'Gestión centralizada',
    description: 'Administra animales, especies y razas desde una interfaz ordenada, rápida y consistente.',
    icon: ManagementIcon,
  },
  {
    title: 'Acceso seguro',
    description: 'Inicia sesión o regístrate con un flujo pensado para separar acceso público y rutas privadas.',
    icon: ShieldIcon,
  },
  {
    title: 'Diseño responsivo',
    description: 'Una experiencia mobile-first que se adapta con naturalidad desde teléfonos hasta pantallas grandes.',
    icon: DeviceIcon,
  },
]

const footerLinks = [
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'API', href: 'https://linajeanimal-api.onrender.com/api/v1' },
  { label: 'GitHub', href: 'https://github.com/Lucas-Santamria390/linajeanimal-frontend' },
]

/**
 * Landing page publica del proyecto LinajeAnimal.
 * @returns {JSX.Element}
 */
export default function Landing() {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(30,86,49,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_#fafafa_0%,_#f7faf8_48%,_#edf5ef_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[linear-gradient(120deg,rgba(30,86,49,0.08),rgba(14,165,233,0.06),transparent)]" />

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-sm font-medium text-brand-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-secondary-500" />
            LinajeAnimal Frontend
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-neutral-text sm:text-5xl lg:text-6xl">
              Gestiona el linaje de tus animales con una experiencia clara, rápida y responsiva.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-neutral-muted sm:text-lg">
              Explora una landing pensada para presentar el sistema de gestión genealógica de animales:
              acceso público, navegación simple y una interfaz lista para escalar con el resto de la
              plataforma.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-brand-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50"
            >
              Register
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-2xl font-black text-brand-700">Genealogía</p>
              <p className="mt-1 text-sm text-neutral-muted">Relaciones familiares visibles.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-2xl font-black text-secondary-600">CRUD</p>
              <p className="mt-1 text-sm text-neutral-muted">Gestión de entidades principales.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-2xl font-black text-brand-700">Mobile-first</p>
              <p className="mt-1 text-sm text-neutral-muted">Diseño fluido en cualquier pantalla.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="absolute -right-4 bottom-10 h-28 w-28 rounded-full bg-brand-500/15 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-neutral-card">
              <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-bg px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-brand-500" />
                <div className="ml-3 h-2 flex-1 rounded-full bg-neutral-200" />
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-lg shadow-brand-500/20">
                  <p className="text-sm font-medium text-brand-100">Panel de administración</p>
                  <h2 className="mt-2 text-2xl font-bold">Visibilidad total sobre tu sistema</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-brand-50/90">
                    Una interfaz visual que resume el espíritu del producto: orden, control y lectura
                    rápida de la información.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Animales" value="128" tone="brand" />
                  <MetricCard label="Especies" value="14" tone="secondary" />
                  <MetricCard label="Razas" value="32" tone="brand" />
                  <MetricCard label="Usuarios" value="08" tone="secondary" />
                </div>

                <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 p-4">
                  <p className="text-sm font-semibold text-brand-700">Ruta publica lista</p>
                  <p className="mt-1 text-sm text-neutral-muted">
                    La landing vive en `/` y no necesita hooks ni llamadas a API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary-600">
              Características
            </p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-text sm:text-3xl">
              Todo lo que la landing necesita mostrar
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-neutral-muted sm:text-base">
            Cuatro tarjetas para presentar el producto sin depender de backend, manteniendo el foco en
            navegación, claridad y conversión.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-brand-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-lg font-bold text-neutral-text">LinajeAnimal</p>
            <p className="mt-1 text-sm text-neutral-muted">
              Landing pública del frontend de gestión genealógica de animales.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {footerLinks.map((link) => (
              <FooterLink key={link.label} {...link} />
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterLink({ label, to, href }) {
  const sharedClassName =
    'inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-text transition-colors hover:border-brand-200 hover:text-brand-700 hover:bg-brand-50'

  if (to) {
    return (
      <Link to={to} className={sharedClassName}>
        {label}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={sharedClassName}>
      {label}
    </a>
  )
}

function MetricCard({ label, value, tone }) {
  const toneClasses =
    tone === 'secondary'
      ? 'border-secondary-100 bg-secondary-50 text-secondary-700'
      : 'border-brand-100 bg-brand-50 text-brand-700'

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

function GenealogyIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7.5 18.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm9 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 10.5v2.8m0 0H9.2m2.8 0h2.8M9.1 13.3 7.9 15.1m5-1.8 1.2 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ManagementIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 6.5h15v11h-15z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 9h8m-8 3.5h5m-5 3.5h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ShieldIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5 18 7v5.1c0 4-2.5 6.8-6 7.9-3.5-1.1-6-3.9-6-7.9V7l6-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m9.5 12 1.7 1.7 3.3-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeviceIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 4.5h9A1.5 1.5 0 0 1 18 6v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18V6a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 8h6m-6 3h6m-6 6h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    title: 'Árbol genealógico',
    description:
      'Visualiza el linaje completo de cada animal mediante un árbol interactivo.',
    icon: '🌳',
  },
  {
    title: 'Gestión de animales',
    description:
      'Registra y administra animales, especies y razas desde un solo lugar.',
    icon: '🐄',
  },
  {
    title: 'Información detallada',
    description:
      'Consulta padres, hijos, fotografías y datos importantes de cada animal.',
    icon: '📋',
  },
  {
    title: 'Diseño adaptable',
    description:
      'Accede desde computadoras, tablets y dispositivos móviles.',
    icon: '📱',
  },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100">

      {/* HERO */}
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 lg:flex-row lg:gap-16">

        <div className="max-w-xl">
          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            LinajeAnimal
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-gray-900">
            Gestiona el linaje de tus animales de forma sencilla.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Organiza animales, especies y razas, asigna relaciones familiares
            y consulta el árbol genealógico desde una plataforma intuitiva.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Crear cuenta
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-green-600 px-6 py-3 font-semibold text-green-700 transition hover:bg-green-50"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Imagen */}
        <div className="mt-14 lg:mt-0">
          <img
            src="/dashboard.png"
            alt="Dashboard"
            className="w-full max-w-xl rounded-3xl border bg-white shadow-2xl"
          />
        </div>

      </section>

      {/* CARACTERÍSTICAS */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h2 className="text-center text-4xl font-bold text-gray-900">
          Todo lo que necesitas
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Diseñado para administrar genealogías animales de manera rápida y organizada.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="rounded-3xl bg-white p-8 shadow transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="text-5xl">{feature.icon}</div>

              <h3 className="mt-5 text-xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-gray-600">
                {feature.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* CÓMO FUNCIONA */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-6xl px-6">

          <h2 className="text-center text-4xl font-bold">
            ¿Cómo funciona?
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-4">

            <Step
              number="1"
              title="Registra"
              text="Agrega especies, razas y animales."
            />

            <Step
              number="2"
              title="Relaciona"
              text="Asigna padres e hijos."
            />

            <Step
              number="3"
              title="Consulta"
              text="Visualiza el árbol genealógico."
            />

            <Step
              number="4"
              title="Administra"
              text="Edita toda la información fácilmente."
            />

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="py-24">

        <div className="mx-auto max-w-3xl rounded-3xl bg-green-700 px-8 py-16 text-center text-white">

          <h2 className="text-4xl font-bold">
            Comienza hoy mismo
          </h2>

          <p className="mt-5 text-lg text-green-100">
            Organiza toda la genealogía de tus animales desde una sola plataforma.
          </p>

          <Link
            to="/register"
            className="mt-10 inline-block rounded-xl bg-white px-8 py-4 font-bold text-green-700 transition hover:scale-105"
          >
            Crear cuenta gratis
          </Link>

        </div>

      </section>

    </div>
  )
}

function Step({ number, title, text }) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-gray-600">
        {text}
      </p>

    </div>
  )
}
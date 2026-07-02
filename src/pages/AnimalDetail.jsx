import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAnimales } from '../hooks/useAnimales'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import ConfirmModal from '../components/ConfirmModal'
import GenealogyTree from '../components/GenealogyTree'

function RelationshipItem({ animal = {} }) {
  const label = animal.nombre
    ? `${animal.identificador || ''} ${animal.nombre}`.trim()
    : animal.identificador || '—'
  return (
    <li className="flex items-center justify-between gap-3 border-b border-neutral-200 py-2 last:border-none">
      <span className="font-medium text-neutral-900">{label}</span>
      <Link
        to={`/animales/${animal._id}`}
        className="text-sm font-semibold text-secondary-600 hover:text-secondary-700"
      >
        Ver detalle
      </Link>
    </li>
  )
}

function InfoItem({ label = '', value = '' }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-neutral-500">{label}</span>
      <p className="font-medium text-neutral-900">{value || 'Sin registrar'}</p>
    </div>
  )
}

/**
 * Página de detalle de un animal. Muestra su información, padres (desde getById),
 * hijos/hermanos (vía fetchChildren/fetchSiblings del hook) y árbol genealógico.
 * No importa servicios directamente; usa hooks.
 * @returns {JSX.Element}
 */
export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getById, remove, fetchChildren, fetchSiblings, loading: animalLoading, error: animalError } = useAnimales()

  const [animal, setAnimal] = useState(null)
  const [hijos, setHijos] = useState([])
  const [hermanos, setHermanos] = useState([])
  const [localError, setLocalError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [showTree, setShowTree] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadAnimal = async () => {
      setLocalError(null)
      setNotFound(false)

      try {
        const animalData = await getById(id)
        if (cancelled) return

        if (!animalData) {
          setNotFound(true)
          return
        }

        setAnimal(animalData)

        const [childrenData, siblingsData] = await Promise.all([
          fetchChildren(id),
          fetchSiblings(id),
        ])
        if (cancelled) return

        setHijos(childrenData)
        setHermanos(siblingsData)
      } catch (err) {
        if (cancelled) return
        if (err?.response?.status === 404) {
          setNotFound(true)
        } else if (err?.response?.status === 403) {
          setLocalError('No tienes permiso para acceder a este animal')
        } else {
          setLocalError(err?.response?.data?.message || err.message || 'Error al cargar el detalle del animal')
        }
      }
    }

    loadAnimal()
    return () => { cancelled = true }
  }, [getById, id, fetchChildren, fetchSiblings])

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await remove(id)
      navigate('/animales', { state: { success: 'Animal eliminado correctamente' } })
    } catch (err) {
      setLocalError(err?.response?.data?.message || err.message || 'No se pudo eliminar el animal')
      setIsConfirmOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (animalLoading) {
    return <Loading message="Cargando expediente del animal..." />
  }

  if (notFound) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          title="Animal no encontrado"
          message="El animal solicitado no existe o ya no está disponible."
          action={
            <button
              type="button"
              onClick={() => navigate('/animales')}
              className="rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
            >
              Volver a animales
            </button>
          }
        />
      </div>
    )
  }

  if (localError || animalError) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <Alert type="error" message={localError || animalError} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => navigate('/animales')}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Volver a animales
          </button>
        </div>
      </div>
    )
  }

  if (!animal) return null

  const pageTitle = animal.nombre ? `${animal.identificador} — ${animal.nombre}` : animal.identificador

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={pageTitle}
        breadcrumbs={[
          { label: 'Animales', to: '/animales' },
          { label: pageTitle },
        ]}
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/animales/${animal._id}/editar`)}
              className="flex-1 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:flex-none"
            >
              Editar
            </button>
            {user?.rol === 'admin' && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="flex-1 rounded-md bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600 sm:flex-none"
              >
                Eliminar
              </button>
            )}
          </div>
        }
      />

      {/* Información General y Padres */}
      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm md:col-span-2">
          <h2 className="border-b border-neutral-200 pb-2 text-xl font-bold text-neutral-800">Información general</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <InfoItem label="Identificador" value={animal.identificador || animal.codigo || animal._id} />
            <InfoItem label="Sexo" value={animal.sexo} />
            <InfoItem label="Especie" value={animal.especie?.nombre} />
            <InfoItem label="Raza" value={animal.raza?.nombre} />
            <InfoItem
              label="Fecha de nacimiento"
              value={animal.fechaNacimiento ? new Date(animal.fechaNacimiento).toLocaleDateString() : ''}
            />
            <InfoItem label="Peso" value={animal.peso ? `${animal.peso} kg` : ''} />
            <InfoItem label="Color" value={animal.color} />
            <InfoItem label="Propietario" value={animal.propietario?.nombre} />
            <InfoItem label="Estado" value={animal.estado || 'Activo'} />
          </div>

          {(animal.notas || animal.observaciones) && (
            <div>
              <span className="text-xs font-semibold uppercase text-neutral-500">Notas</span>
              <p className="mt-1 rounded border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
                {animal.notas || animal.observaciones}
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm">
          <h2 className="border-b border-neutral-200 pb-2 text-xl font-bold text-neutral-800">Padres</h2>
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-neutral-500">Padre</span>
              {animal.padre ? (
                <Link
                  to={`/animales/${animal.padre._id}`}
                  className="block rounded border border-neutral-200 bg-neutral-50 p-3 text-center font-medium text-neutral-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                >
                  {animal.padre.nombre}
                </Link>
              ) : (
                <p className="rounded border border-dashed bg-neutral-50 p-3 text-center text-sm text-neutral-400">
                  Sin registrar
                </p>
              )}
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-neutral-500">Madre</span>
              {animal.madre ? (
                <Link
                  to={`/animales/${animal.madre._id}`}
                  className="block rounded border border-neutral-200 bg-neutral-50 p-3 text-center font-medium text-neutral-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
                >
                  {animal.madre.nombre}
                </Link>
              ) : (
                <p className="rounded border border-dashed bg-neutral-50 p-3 text-center text-sm text-neutral-400">
                  Sin registrar
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Hijos y Hermanos */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm">
          <h3 className="border-b border-neutral-200 pb-2 text-lg font-bold text-neutral-800">
            Hijos <span className="text-sm font-normal text-neutral-500">({hijos.length})</span>
          </h3>
          {hijos.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto pr-1">
              {hijos.map((hijo) => <RelationshipItem key={hijo._id} animal={hijo} />)}
            </ul>
          ) : (
            <EmptyState title="Sin hijos registrados" message="Este animal no cuenta con descendencia registrada." />
          )}
        </section>

        <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm">
          <h3 className="border-b border-neutral-200 pb-2 text-lg font-bold text-neutral-800">
            Hermanos <span className="text-sm font-normal text-neutral-500">({hermanos.length})</span>
          </h3>
          {hermanos.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto pr-1">
              {hermanos.map((hermano) => <RelationshipItem key={hermano._id} animal={hermano} />)}
            </ul>
          ) : (
            <EmptyState
              title="Sin hermanos registrados"
              message="No se encontraron hermanos compartiendo la misma línea de padres."
            />
          )}
        </section>
      </div>

      {/* Árbol Genealógico */}
      <section className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm">
        <h2 className="border-b border-neutral-200 pb-2 text-xl font-bold text-neutral-800">Árbol genealógico</h2>
        {showTree ? (
          <GenealogyTree animalId={animal._id} fallbackRelatives={{ hijos, hermanos }} />
        ) : (
          <button
            type="button"
            onClick={() => setShowTree(true)}
            className="w-full rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-4 text-center text-sm font-semibold text-neutral-600 transition-colors hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700"
          >
            Generar árbol genealógico
          </button>
        )}
      </section>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar animal"
        message={`¿Estás seguro de eliminar a ${pageTitle}? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}

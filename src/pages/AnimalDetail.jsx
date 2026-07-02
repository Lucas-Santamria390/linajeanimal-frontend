import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAnimales } from '../hooks/useAnimales'
import { getChildren, getSiblings, getFamilyTree } from '../services/animales'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import ConfirmModal from '../components/ConfirmModal'
import GenealogyTree from '../components/GenealogyTree'

/**
 * Item de lista que representa un animal relacionado (hijo o hermano) con enlace a su detalle.
 * @param {object} props - Propiedades del componente.
 * @param {object} [props.animal={}] - Datos del animal relacionado.
 * @returns {JSX.Element} Elemento de lista con nombre y enlace al detalle.
 */
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
 * Pagina de detalle de un animal. Muestra su informacion completa, padres, hijos,
 * hermanos y su arbol genealogico completo, y permite editar o eliminar (con confirmacion).
 * Cubre los estados de loading, error, not-found y empty (hijos/hermanos).
 * @returns {JSX.Element} Vista de detalle del animal.
 */
export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getById, remove, loading: animalLoading, error: animalError } = useAnimales()

  const [animal, setAnimal] = useState(null)
  const [family, setFamily] = useState({ padres: {}, hijos: [], hermanos: [] })
  const [localError, setLocalError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
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

        const [childrenRes, siblingsRes, familyRes] = await Promise.all([
          getChildren(id),
          getSiblings(id),
          getFamilyTree(id, 1),
        ])

        if (cancelled) return

        const treePayload = familyRes.data?.data
        const arbol = treePayload?.arbol ?? treePayload ?? null

        setFamily({
          padres: {
            padre: arbol?.padre || null,
            madre: arbol?.madre || null,
          },
          hijos: childrenRes.data?.data || [],
          hermanos: siblingsRes.data?.data || [],
        })
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
  }, [getById, id])

  /**
   * Ejecuta la eliminacion del animal luego de la confirmacion del usuario en el modal.
   * @returns {Promise<void>} Promesa que se resuelve cuando termina el intento de eliminacion.
   */
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
              {family.padres?.padre ? (
                <Link
                  to={`/animales/${family.padres.padre._id}`}
                  className="block rounded border border-neutral-200 bg-neutral-50 p-3 text-center font-medium text-neutral-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                >
                  {family.padres.padre.nombre}
                </Link>
              ) : (
                <p className="rounded border border-dashed bg-neutral-50 p-3 text-center text-sm text-neutral-400">
                  Sin registrar
                </p>
              )}
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-neutral-500">Madre</span>
              {family.padres?.madre ? (
                <Link
                  to={`/animales/${family.padres.madre._id}`}
                  className="block rounded border border-neutral-200 bg-neutral-50 p-3 text-center font-medium text-neutral-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
                >
                  {family.padres.madre.nombre}
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
            Hijos <span className="text-sm font-normal text-neutral-500">({family.hijos.length})</span>
          </h3>
          {family.hijos.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto pr-1">
              {family.hijos.map((hijo) => <RelationshipItem key={hijo._id} animal={hijo} />)}
            </ul>
          ) : (
            <EmptyState title="Sin hijos registrados" message="Este animal no cuenta con descendencia registrada." />
          )}
        </section>

        <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm">
          <h3 className="border-b border-neutral-200 pb-2 text-lg font-bold text-neutral-800">
            Hermanos <span className="text-sm font-normal text-neutral-500">({family.hermanos.length})</span>
          </h3>
          {family.hermanos.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto pr-1">
              {family.hermanos.map((hermano) => <RelationshipItem key={hermano._id} animal={hermano} />)}
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
        <GenealogyTree animalId={animal._id} />
      </section>

      {/* Modal de Confirmación */}
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
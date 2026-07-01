import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAnimales } from '../hooks/useAnimales'
import { useGenealogy } from '../hooks/useGenealogy'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'

/**
 * Item de lista que representa un animal relacionado (hijo o hermano) con enlace a su detalle.
 * @param {object} props - Propiedades del componente.
 * @param {object} [props.animal={}] - Datos del animal relacionado.
 * @returns {JSX.Element} Elemento de lista con nombre y enlace al detalle.
 */
function RelationshipItem({ animal = {} }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-neutral-200 py-2 last:border-none">
      <span className="font-medium text-neutral-900">{animal.nombre}</span>
      <Link
        to={`/animales/${animal._id}`}
        className="text-sm font-semibold text-secondary-600 hover:text-secondary-700"
      >
        Ver detalle
      </Link>
    </li>
  )
}

/**
 * Par etiqueta/valor usado en la seccion de informacion general del animal.
 * @param {object} props - Propiedades del componente.
 * @param {string} [props.label=''] - Etiqueta descriptiva del dato.
 * @param {string} [props.value=''] - Valor a mostrar; si esta vacio se muestra un texto por defecto.
 * @returns {JSX.Element} Bloque con etiqueta y valor.
 */
function InfoItem({ label = '', value = '' }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-neutral-500">{label}</span>
      <p className="font-medium text-neutral-900">{value || 'Sin registrar'}</p>
    </div>
  )
}

/**
 * Pagina de detalle de un animal. Muestra su informacion completa, padres, hijos
 * y hermanos, y permite editar, eliminar (con confirmacion) o ver su arbol genealogico.
 * Cubre los estados de loading, error, not-found y empty (hijos/hermanos).
 * @returns {JSX.Element} Vista de detalle del animal.
 */
export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, remove, loading: animalLoading, error: animalError } = useAnimales()
  const { fetchFamilyTree, loading: genealogyLoading, error: genealogyError } = useGenealogy()

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

        const familyData = await fetchFamilyTree(id)
        if (cancelled || !familyData) return

        setFamily({
          padres: {
            padre: familyData.padre || familyData.padres?.padre,
            madre: familyData.madre || familyData.padres?.madre,
          },
          hijos: familyData.hijos || [],
          hermanos: familyData.hermanos || [],
        })
      } catch (err) {
        if (!cancelled) {
          setLocalError(err?.response?.data?.message || err.message || 'Error al cargar el detalle del animal')
        }
      }
    }

    loadAnimal()

    return () => {
      cancelled = true
    }
  }, [fetchFamilyTree, getById, id])

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

  if (animalLoading || genealogyLoading) {
    return <Loading message="Cargando expediente y arbol genealogico..." />
  }

  if (notFound) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          title="Animal no encontrado"
          message="El animal solicitado no existe o ya no esta disponible."
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

  if (localError || animalError || genealogyError) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <Alert type="error" message={localError || animalError || genealogyError} />
        <button
          type="button"
          onClick={() => navigate('/animales')}
          className="rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
        >
          Volver a animales
        </button>
      </div>
    )
  }

  if (!animal) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Expediente animal</span>
          <h1 className="text-2xl font-bold text-brand-700 md:text-3xl">{animal.nombre}</h1>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(`/animales/${animal._id}/editar`)}
            className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 sm:flex-none"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => navigate(`/genealogia/${animal._id}`)}
            className="flex-1 rounded-md bg-secondary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-700 sm:flex-none"
          >
            Ver arbol
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="flex-1 rounded-md bg-secondary-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-800 sm:flex-none"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-card p-6 shadow-sm md:col-span-2">
          <h2 className="border-b border-neutral-200 pb-2 text-xl font-bold text-neutral-800">Informacion general</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Identificador" value={animal.identificador || animal.codigo || animal._id} />
            <InfoItem label="Sexo" value={animal.sexo} />
            <InfoItem label="Especie" value={animal.especie?.nombre} />
            <InfoItem label="Raza" value={animal.raza?.nombre} />
            <InfoItem
              label="Fecha de nacimiento"
              value={animal.fechaNacimiento ? new Date(animal.fechaNacimiento).toLocaleDateString() : ''}
            />
            <InfoItem label="Estado" value={animal.estado || 'Activo'} />
          </div>

          {animal.observaciones && (
            <div>
              <span className="text-xs font-semibold uppercase text-neutral-500">Observaciones</span>
              <p className="mt-1 rounded border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
                {animal.observaciones}
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
                  className="block rounded border border-brand-200 bg-brand-50 p-3 text-center font-medium text-brand-800 transition-colors hover:bg-brand-100"
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
                  className="block rounded border border-secondary-200 bg-secondary-50 p-3 text-center font-medium text-secondary-800 transition-colors hover:bg-secondary-100"
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
              message="No se encontraron hermanos compartiendo la misma linea de padres."
            />
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar animal"
        message={`Estas seguro de eliminar a ${animal.nombre}? Esta accion no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}

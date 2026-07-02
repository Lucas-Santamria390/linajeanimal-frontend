import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAnimales } from '../../hooks/useAnimales'
import GenealogyTree from '../../components/genealogy/GenealogyTree'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import Loading from '../../components/ui/Loading'
import PageHeader from '../../components/ui/PageHeader'

/**
 * Página del árbol genealógico de un animal. Carga el animal y sus hermanos,
 * luego renderiza el grafo SVG completo con controles de profundidad.
 * @returns {JSX.Element}
 */
export default function AnimalTree() {
  const { id } = useParams()
  const { getById, fetchSiblings, loading: animalLoading, error: animalError } = useAnimales()

  const [animal, setAnimal] = useState(null)
  const [hermanos, setHermanos] = useState([])
  const [localError, setLocalError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
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

        const siblingsData = await fetchSiblings(id)
        if (cancelled) return
        setHermanos(siblingsData || [])
      } catch (err) {
        if (cancelled) return
        if (err?.response?.status === 404) {
          setNotFound(true)
        } else {
          setLocalError(err?.response?.data?.message || 'Error al cargar información del animal')
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, getById, fetchSiblings])

  if (animalLoading && !animal) {
    return (
      <div className="p-4 md:p-6">
        <Loading message="Cargando animal..." />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Animal no encontrado"
          message="El animal que buscas no existe o fue eliminado."
          action={{ label: 'Volver a animales', to: '/animales' }}
        />
      </div>
    )
  }

  const errorMsg = localError || animalError
  if (errorMsg) {
    return (
      <div className="p-4 md:p-6">
        <Alert type="error" message={errorMsg} />
        <div className="mt-4">
          <Link to={`/animales/${id}`} className="text-sm font-semibold text-secondary-600 hover:text-secondary-700">
            &larr; Volver al detalle
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={`Árbol genealógico de ${animal?.nombre || '...'}`}
        breadcrumbs={[
          { label: 'Animales', to: '/animales' },
          { label: animal?.nombre || 'Detalle', to: `/animales/${id}` },
          { label: 'Árbol genealógico' },
        ]}
      />

      <div className="mt-6">
        <GenealogyTree animalId={id} hermanos={hermanos} />
      </div>
    </div>
  )
}

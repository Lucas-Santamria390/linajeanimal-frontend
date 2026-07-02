import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAnimales } from '../hooks/useAnimales'
import { useEspecies } from '../hooks/useEspecies'
import { useRazas } from '../hooks/useRazas'
import { getUsuarios } from '../services/usuarios'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import SelectField from '../components/SelectField'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

/**
 * Pagina de listado de animales con busqueda, filtros, paginacion y soft delete
 * @returns {JSX.Element}
 */
export default function AnimalesList() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  const [search, setSearch] = useState('')
  const [especieFiltro, setEspecieFiltro] = useState('')
  const [razaFiltro, setRazaFiltro] = useState('')
  const [sexoFiltro, setSexoFiltro] = useState('')
  const [activeFiltro, setActiveFiltro] = useState('')
  const [propietarioFiltro, setPropietarioFiltro] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [successMsg, setSuccessMsg] = useState(() => {
    const msg = location.state?.success || ''
    if (msg) window.history.replaceState({}, document.title)
    return msg
  })
  const [deleting, setDeleting] = useState(false)

  const { data, loading, error, pagination, remove, refetch } = useAnimales()

  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    const loadUsuarios = async () => {
      setLoadingUsuarios(true)
      try {
        const res = await getUsuarios({ limit: 200 })
        if (cancelled) return
        setUsuarios(res.data.data || [])
      } catch {
        if (cancelled) return
      } finally {
        if (!cancelled) setLoadingUsuarios(false)
      }
    }
    loadUsuarios()
    return () => { cancelled = true }
  }, [isAdmin])

  useEffect(() => {
    refetch({
      page,
      limit: 20,
      identificador: search || undefined,
      ...(especieFiltro && { especie: especieFiltro }),
      ...(razaFiltro && { raza: razaFiltro }),
      ...(sexoFiltro && { sexo: sexoFiltro }),
      ...(activeFiltro && { active: activeFiltro }),
      ...(isAdmin && propietarioFiltro && { propietario: propietarioFiltro }),
    })
  }, [page, search, especieFiltro, razaFiltro, sexoFiltro, activeFiltro, propietarioFiltro, isAdmin, refetch])

  const { data: especies, loading: loadingEspecies, error: errorEspecies } = useEspecies({ limit: 100 })
  const { data: razas, loading: loadingRazas, error: errorRazas, refetch: refetchRazas } = useRazas()

  useEffect(() => {
    if (!especieFiltro) return
    refetchRazas({ especie: especieFiltro, limit: 100 })
  }, [especieFiltro, refetchRazas])

  const handleSearch = useCallback((value) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleEspecieChange = useCallback((e) => {
    setEspecieFiltro(e.target.value)
    setRazaFiltro('')
    setPage(1)
  }, [])

  const handleRazaChange = useCallback((e) => {
    setRazaFiltro(e.target.value)
    setPage(1)
  }, [])

  const handleSexoChange = useCallback((e) => {
    setSexoFiltro(e.target.value)
    setPage(1)
  }, [])

  const handleActiveChange = useCallback((e) => {
    setActiveFiltro(e.target.value)
    setPage(1)
  }, [])

  const handlePropietarioChange = useCallback((e) => {
    setPropietarioFiltro(e.target.value)
    setPage(1)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await remove(deleteTarget._id)
      setSuccessMsg('Animal eliminado correctamente')
      setDeleteTarget(null)
    } catch {
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(() => [
    { key: 'identificador', header: 'Identificador' },
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'especie',
      header: 'Especie',
      render: (value) => value?.nombre || '-',
    },
    {
      key: 'raza',
      header: 'Raza',
      render: (value) => value?.nombre || '-',
    },
    {
      key: 'sexo',
      header: 'Sexo',
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/animales/${row._id}`)}
            className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
          >
            Ver detalle
          </button>
          <button
            type="button"
            onClick={() => navigate(`/animales/${row._id}/editar`)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="text-sm text-brand-700 hover:text-brand-800 font-medium"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], [navigate])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Animales"
        breadcrumbs={[{ label: 'Animales' }]}
        action={
          <button
            type="button"
            onClick={() => navigate('/animales/nuevo')}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            + Nuevo animal
          </button>
        }
      />

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
      )}
      {error && (
        <div className="flex items-start gap-2 mb-4">
          <Alert type="error" message={error} className="flex-1" />
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary-600"
          >
            Reintentar
          </button>
        </div>
      )}
      {(errorEspecies || errorRazas) && (
        <Alert type="error" message={errorEspecies || errorRazas} className="mb-4" />
      )}

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <SearchBar onSearch={handleSearch} placeholder="Buscar por identificador..." />
        </div>
        <div className="w-full sm:max-w-xs">
          <SelectField
            id="filtro-especie"
            label="Especie"
            value={especieFiltro}
            onChange={handleEspecieChange}
            options={especies.map((e) => ({ value: e._id, label: e.nombre }))}
            loading={loadingEspecies}
            placeholder="Todas las especies"
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <SelectField
            id="filtro-raza"
            label="Raza"
            value={razaFiltro}
            onChange={handleRazaChange}
            options={razas.map((r) => ({ value: r._id, label: r.nombre }))}
            loading={loadingRazas}
            placeholder="Todas las razas"
            disabled={!especieFiltro}
          />
        </div>
        <div className="w-full sm:max-w-[140px]">
          <SelectField
            id="filtro-sexo"
            label="Sexo"
            value={sexoFiltro}
            onChange={handleSexoChange}
            options={[
                { value: 'macho', label: 'Macho' },
                { value: 'hembra', label: 'Hembra' },
              ]}
            placeholder="Todos"
          />
        </div>
        <div className="w-full sm:max-w-[160px]">
          <SelectField
            id="filtro-active"
            label="Estado"
            value={activeFiltro}
            onChange={handleActiveChange}
            options={[
              { value: 'true', label: 'Activos' },
              { value: 'false', label: 'Inactivos' },
            ]}
            placeholder="Todos"
          />
        </div>
        {isAdmin && (
          <div className="w-full sm:max-w-xs">
            <SelectField
              id="filtro-propietario"
              label="Propietario"
              value={propietarioFiltro}
              onChange={handlePropietarioChange}
              options={usuarios.map((u) => ({ value: u._id, label: u.nombre || u.email }))}
              loading={loadingUsuarios}
              placeholder="Todos los propietarios"
            />
          </div>
        )}
      </div>

      {loading ? (
        <Loading message="Cargando animales..." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data}
            emptyTitle="No se encontraron animales"
            emptyMessage="No hay animales registrados con los filtros seleccionados."
          />
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              total={pagination.total}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        loading={deleting}
        title="Eliminar animal"
        message={
          deleteTarget
            ? `¿Estás seguro de eliminar a "${deleteTarget.identificador}${deleteTarget.nombre ? ` — ${deleteTarget.nombre}` : ''}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

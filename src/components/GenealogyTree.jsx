import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGenealogy } from '../hooks/useGenealogy'
import Loading from './Loading'
import Alert from './Alert'
import EmptyState from './EmptyState'

const MIN_GENERACIONES = 1
const MAX_GENERACIONES = 5
const DEFAULT_GENERACIONES = 3

const GRAPH_COL_WIDTH = 180
const GRAPH_ROW_HEIGHT = 140
const GRAPH_NODE_WIDTH = 160
const GRAPH_NODE_HEIGHT = 80

function clampGeneraciones(value) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return DEFAULT_GENERACIONES
  return Math.min(Math.max(parsed, MIN_GENERACIONES), MAX_GENERACIONES)
}

function sexoClasses(sexo = '') {
  const esMacho = typeof sexo === 'string' && sexo.trim().toLowerCase().startsWith('m')

  return esMacho
    ? {
        border: 'border-sky-300',
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        fill: 'fill-sky-100',
        stroke: 'stroke-sky-500',
        icon: '\u2642',
        label: 'Macho',
      }
    : {
        border: 'border-rose-300',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        fill: 'fill-rose-100',
        stroke: 'stroke-rose-400',
        icon: '\u2640',
        label: 'Hembra',
      }
}

function buildGraphLayout(root, hermanos = []) {
  if (!root) return null

  const levels = new Map()
  const addToLevel = (level, entry) => {
    if (!levels.has(level)) levels.set(level, [])
    levels.get(level).push(entry)
  }

  const walkUp = (node, level, path, parentPath) => {
    if (!node) return
    addToLevel(level, { path, node, parentPath })
    if (node.padre) walkUp(node.padre, level - 1, `${path}-p`, path)
    if (node.madre) walkUp(node.madre, level - 1, `${path}-m`, path)
  }

  const walkDown = (node, level, path, parentPath) => {
    if (!node) return
    addToLevel(level, { path, node, parentPath })
    ;(node.hijos || []).forEach((hijo, i) => walkDown(hijo, level + 1, `${path}-h${i}`, path))
  }

  walkUp(root, 0, 'root', null)
  ;(root.hijos || []).forEach((hijo, i) => walkDown(hijo, 1, `root-h${i}`, 'root'))
  hermanos.forEach((hermano, i) => addToLevel(0, { path: `sib-${i}`, node: hermano, parentPath: 'root', dashed: true }))

  const sortedLevels = [...levels.keys()].sort((a, b) => a - b)
  const positioned = new Map()
  let minX = Infinity
  let maxX = -Infinity

  sortedLevels.forEach((level) => {
    levels.get(level).forEach((entry, index) => {
      const x = index * GRAPH_COL_WIDTH
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      positioned.set(entry.path, { ...entry, x, level })
    })
  })

  const offsetX = -minX
  const topOffset = Math.abs(sortedLevels[0]) * GRAPH_ROW_HEIGHT

  const nodes = [...positioned.values()].map((entry) => ({
    ...entry,
    x: entry.x + offsetX + GRAPH_NODE_WIDTH / 2,
    y: entry.level * GRAPH_ROW_HEIGHT + topOffset + GRAPH_NODE_HEIGHT,
  }))

  const nodeByPath = new Map(nodes.map((n) => [n.path, n]))
  const edges = nodes
    .filter((n) => n.parentPath && nodeByPath.has(n.parentPath))
    .map((n) => ({ from: nodeByPath.get(n.parentPath), to: n, dashed: Boolean(n.dashed) }))

  return {
    nodes,
    edges,
    width: maxX - minX + GRAPH_NODE_WIDTH + 40,
    height: (sortedLevels[sortedLevels.length - 1] - sortedLevels[0] + 1) * GRAPH_ROW_HEIGHT + 40,
  }
}

function MobileTreeNode({ node, path, direction, expandedPaths, onToggle, onNavigate }) {
  const colors = sexoClasses(node.sexo)
  const childEntries =
    direction === 'down'
      ? (node.hijos || []).map((hijo, i) => ({ node: hijo, path: `${path}-${i}` }))
      : [
          node.padre && { node: node.padre, path: `${path}-p` },
          node.madre && { node: node.madre, path: `${path}-m` },
        ].filter(Boolean)

  const hasChildren = childEntries.length > 0
  const isExpanded = expandedPaths.has(path)

  return (
    <li className="ml-3 border-l border-neutral-200 pl-3">
      <div className={`flex items-center justify-between gap-2 rounded-md border ${colors.border} ${colors.bg} px-3 py-2`}>
        <button
          type="button"
          onClick={() => onNavigate(node._id)}
          className={`flex items-center gap-1.5 text-left text-sm font-medium ${colors.text} hover:underline`}
        >
          <span aria-hidden="true" className="text-base leading-none">{colors.icon}</span>
          <span className="sr-only">{colors.label}</span>
          {node.nombre}
        </button>
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(path)}
            aria-expanded={isExpanded}
            className="rounded px-2 py-1 text-xs font-bold text-neutral-500 hover:bg-neutral-100"
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <ul className="mt-2 space-y-2">
          {childEntries.map(({ node: childNode, path: childPath }) => (
            <MobileTreeNode
              key={childPath}
              node={childNode}
              path={childPath}
              direction={direction}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Componente de árbol genealógico. En móvil lista jerárquica, en desktop grafo SVG.
 * Si la API retorna null pero hay fallbackRelatives, muestra lista plana con hijos/hermanos.
 * @param {object} props - Propiedades del componente
 * @param {string} props.animalId - ID del animal raíz
 * @param {object} [props.fallbackRelatives] - Datos alternativos { hijos, hermanos } cuando el árbol es null
 * @returns {JSX.Element}
 */
export default function GenealogyTree({ animalId, fallbackRelatives }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { familyTree, loading, error, fetchFamilyTree } = useGenealogy()
  const [expandedPaths, setExpandedPaths] = useState(() => new Set())

  const generaciones = clampGeneraciones(searchParams.get('generaciones') ?? DEFAULT_GENERACIONES)

  useEffect(() => {
    if (animalId) fetchFamilyTree(animalId, generaciones)
  }, [animalId, generaciones, fetchFamilyTree])

  const [prevKey, setPrevKey] = useState(`${animalId}-${generaciones}`)
  if (`${animalId}-${generaciones}` !== prevKey) {
    setPrevKey(`${animalId}-${generaciones}`)
    setExpandedPaths(new Set())
  }

  const handleGeneracionesChange = (event) => {
    const next = clampGeneraciones(event.target.value)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('generaciones', String(next))
      return params
    })
  }

  const handleToggle = (path) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const handleNavigate = (id) => navigate(`/animales/${id}`)

  const graph = useMemo(() => buildGraphLayout(familyTree, familyTree?.hermanos), [familyTree])

  const hasFallback = fallbackRelatives && (fallbackRelatives.hijos?.length > 0 || fallbackRelatives.hermanos?.length > 0)

  if (loading) {
    return <Loading message="Cargando árbol genealógico..." />
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  if (!familyTree && !hasFallback) {
    return <EmptyState title="Sin información genealógica" message="No se encontró un árbol para este animal." />
  }

  const dataTree = familyTree || null
  const rootColors = dataTree ? sexoClasses(dataTree.sexo) : { icon: '', label: '', text: '', border: '', bg: '' }
  const ascendientes = dataTree
    ? [
        dataTree.padre && { node: dataTree.padre, path: 'root-p' },
        dataTree.madre && { node: dataTree.madre, path: 'root-m' },
      ].filter(Boolean)
    : []
  const descendientes = dataTree
    ? (dataTree.hijos || []).map((hijo, i) => ({ node: hijo, path: `root-h${i}` }))
    : (fallbackRelatives?.hijos || []).map((hijo, i) => ({ node: hijo, path: `fallback-h${i}` }))
  const hermanos = dataTree?.hermanos || fallbackRelatives?.hermanos || []
  const sinRelaciones = ascendientes.length === 0 && descendientes.length === 0 && hermanos.length === 0

  const rootName = dataTree?.nombre || 'Animal'

  return (
    <div className="space-y-4">
      {dataTree && (
        <div className="flex items-center justify-end gap-2">
          <label htmlFor="generaciones" className="text-sm font-medium text-neutral-600">
            Generaciones
          </label>
          <select
            id="generaciones"
            value={generaciones}
            onChange={handleGeneracionesChange}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-800"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      {sinRelaciones ? (
        <EmptyState
          title="Sin relaciones registradas"
          message="Este animal no tiene padres, hijos ni hermanos registrados."
        />
      ) : (
        <>
          {/* Vista móvil y fallback: lista jerárquica */}
          <div className={dataTree ? 'space-y-4 md:hidden' : 'space-y-4'}>
            {dataTree ? (
              <div className={`flex items-center gap-1.5 rounded-md border ${rootColors.border} ${rootColors.bg} px-3 py-2`}>
                <span aria-hidden="true" className="text-base leading-none">{rootColors.icon}</span>
                <span className="sr-only">{rootColors.label}</span>
                <div>
                  <span className="block text-xs font-semibold uppercase text-neutral-500">Animal</span>
                  <p className={`font-semibold ${rootColors.text}`}>{rootName}</p>
                </div>
              </div>
            ) : null}

            {ascendientes.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase text-neutral-500">Ascendientes</h3>
                <ul className="space-y-2">
                  {ascendientes.map(({ node, path }) => (
                    <MobileTreeNode
                      key={path}
                      node={node}
                      path={path}
                      direction="up"
                      expandedPaths={expandedPaths}
                      onToggle={handleToggle}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </ul>
              </div>
            )}

            {descendientes.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase text-neutral-500">Descendientes</h3>
                <ul className="space-y-2">
                  {descendientes.map(({ node, path }) => (
                    <MobileTreeNode
                      key={path}
                      node={node}
                      path={path}
                      direction="down"
                      expandedPaths={expandedPaths}
                      onToggle={handleToggle}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </ul>
              </div>
            )}

            {hermanos.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase text-neutral-500">Hermanos</h3>
                <ul className="space-y-2">
                  {hermanos.map((hermano) => {
                    const colors = sexoClasses(hermano.sexo)
                    return (
                      <li key={hermano._id} className={`rounded-md border ${colors.border} ${colors.bg} px-3 py-2`}>
                        <button
                          type="button"
                          onClick={() => handleNavigate(hermano._id)}
                          className={`flex items-center gap-1.5 text-sm font-medium ${colors.text} hover:underline`}
                        >
                          <span aria-hidden="true" className="text-base leading-none">{colors.icon}</span>
                          <span className="sr-only">{colors.label}</span>
                          {hermano.nombre}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Vista tablet/PC: grafo SVG puro con scroll */}
          {graph && (
            <div className="hidden overflow-auto rounded-lg border border-neutral-200 md:block" style={{ maxHeight: '600px' }}>
              <svg
                viewBox={`0 0 ${graph.width} ${graph.height}`}
                className="h-auto w-full"
                role="img"
                aria-label={`Grafo genealógico de ${rootName}`}
              >
                <g>
                  {graph.edges.map((edge) => (
                    <line
                      key={`${edge.from.path}-${edge.to.path}`}
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      className="stroke-neutral-300"
                      strokeWidth={edge.dashed ? 1.5 : 2}
                      strokeDasharray={edge.dashed ? '4 4' : undefined}
                    />
                  ))}
                </g>
                <g>
                  {graph.nodes.map((n) => {
                    const colors = sexoClasses(n.node.sexo)
                    return (
                      <g
                        key={n.path}
                        transform={`translate(${n.x - GRAPH_NODE_WIDTH / 2}, ${n.y - GRAPH_NODE_HEIGHT / 2})`}
                        className="cursor-pointer"
                        role="link"
                        tabIndex={0}
                        onClick={() => handleNavigate(n.node._id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleNavigate(n.node._id)
                        }}
                      >
                        <title>{n.node.nombre}{n.node.sexo ? ` (${n.node.sexo})` : ''}</title>
                        <rect
                          width={GRAPH_NODE_WIDTH}
                          height={GRAPH_NODE_HEIGHT}
                          rx={10}
                          className={`${colors.fill} ${colors.stroke}`}
                          strokeWidth={n.path === 'root' ? 3 : 1.5}
                        />
                        <text
                          x={GRAPH_NODE_WIDTH / 2}
                          y={GRAPH_NODE_HEIGHT / 2 - 6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`text-xs font-semibold ${colors.text}`}
                        >
                          {n.node.nombre}
                        </text>
                        <text
                          x={GRAPH_NODE_WIDTH / 2}
                          y={GRAPH_NODE_HEIGHT / 2 + 14}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`text-[10px] ${colors.text} opacity-75`}
                        >
                          {n.node.identificador || ''}
                        </text>
                        <text
                          x={GRAPH_NODE_WIDTH - 8}
                          y={GRAPH_NODE_HEIGHT - 8}
                          textAnchor="end"
                          dominantBaseline="end"
                          aria-hidden="true"
                          className={`text-sm font-bold ${colors.text}`}
                        >
                          {colors.icon}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>
            </div>
          )}
          {/* Leyenda del grafo */}
          {graph && graph.edges.some((e) => e.dashed) && (
            <div className="hidden items-center gap-4 text-xs text-neutral-500 md:flex">
              <span className="flex items-center gap-1">
                <span className="inline-block h-0.5 w-4 bg-neutral-300" />
                Parentesco directo
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-0.5 w-4 border-t border-dashed border-neutral-300" />
                Hermanos
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

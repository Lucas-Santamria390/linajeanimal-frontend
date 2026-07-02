import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGenealogy } from '../hooks/useGenealogy'
import Loading from './Loading'
import Alert from './Alert'
import EmptyState from './EmptyState'

const MIN_GENERACIONES = 1
const MAX_GENERACIONES = 5
const DEFAULT_GENERACIONES = 3

const GRAPH_COL_WIDTH = 200
const GRAPH_ROW_HEIGHT = 140
const GRAPH_NODE_WIDTH = 190
const GRAPH_NODE_HEIGHT = 72
const NODE_HEADER_H = 26
const NODE_PHOTO_SIZE = 38
const PADDING = 80

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
        headerBg: 'fill-sky-200',
        headerText: 'fill-sky-900',
        icon: '\u2642',
        label: 'Macho',
      }
    : {
        border: 'border-rose-300',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        fill: 'fill-rose-100',
        stroke: 'stroke-rose-400',
        headerBg: 'fill-rose-200',
        headerText: 'fill-rose-900',
        icon: '\u2640',
        label: 'Hembra',
      }
}

function getRelLabel(path, dashed = false) {
  if (dashed) return 'Hermano'
  if (path.endsWith('-p')) return 'Padre'
  if (path.endsWith('-m')) return 'Madre'
  if (path.includes('-h')) return 'Hijo'
  return ''
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

  const offsetX = -minX + PADDING
  const topOffset = Math.abs(sortedLevels[0]) * GRAPH_ROW_HEIGHT

  const nodes = [...positioned.values()].map((entry) => ({
    ...entry,
    x: entry.x + offsetX + GRAPH_NODE_WIDTH / 2,
    y: entry.level * GRAPH_ROW_HEIGHT + topOffset + GRAPH_NODE_HEIGHT,
  }))

  const nodeByPath = new Map(nodes.map((n) => [n.path, n]))
  const edges = nodes
    .filter((n) => n.parentPath && nodeByPath.has(n.parentPath))
    .map((n) => {
      const from = nodeByPath.get(n.parentPath)
      const mx = (from.x + n.x) / 2
      const my = n.dashed ? from.y - 20 : (from.y + n.y) / 2
      return {
        from,
        to: n,
        dashed: Boolean(n.dashed),
        label: getRelLabel(n.path, Boolean(n.dashed)),
        mx,
        my,
      }
    })

  return {
    nodes,
    edges,
    width: maxX - minX + GRAPH_NODE_WIDTH + PADDING * 2,
    height: (sortedLevels[sortedLevels.length - 1] - sortedLevels[0] + 1) * GRAPH_ROW_HEIGHT + 40,
  }
}

/**
 * Componente de árbol genealógico. Muestra un grafo SVG único para todos los tamaños
 * de pantalla con nodos compactos (nombre, identificador, raza en header + foto circular)
 * y etiquetas de parentesco en las conexiones. Cuando la API retorna null pero hay fallbackRelatives,
 * muestra una lista plana de hijos/hermanos.
 * @param {object} props - Propiedades del componente
 * @param {string} props.animalId - ID del animal raíz
 * @param {object[]} [props.hermanos] - Lista de hermanos para mostrar en el grafo
 * @param {object} [props.fallbackRelatives] - Datos alternativos { hijos, hermanos } cuando el árbol es null
 * @returns {JSX.Element}
 */
export default function GenealogyTree({ animalId, hermanos = [], fallbackRelatives }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { familyTree, loading, error, fetchFamilyTree } = useGenealogy()

  const generaciones = clampGeneraciones(searchParams.get('generaciones') ?? DEFAULT_GENERACIONES)

  useEffect(() => {
    if (animalId) fetchFamilyTree(animalId, generaciones)
  }, [animalId, generaciones, fetchFamilyTree])

  const handleGeneracionesChange = (event) => {
    const next = clampGeneraciones(event.target.value)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('generaciones', String(next))
      return params
    })
  }

  const handleNavigate = (id) => navigate(`/animales/${id}`)

  const graph = useMemo(() => buildGraphLayout(familyTree, hermanos), [familyTree, hermanos])

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

  const rootName = familyTree?.nombre || 'Animal'
  const hasDashed = graph?.edges?.some((e) => e.dashed)

  const fallbackHijos = fallbackRelatives?.hijos || []
  const fallbackHermanos = fallbackRelatives?.hermanos || []

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="hidden font-medium sm:inline">Animal:</span>
          <span className="rounded-md bg-neutral-100 px-2 py-1 text-sm font-semibold text-neutral-800">
            {rootName}
          </span>
          {familyTree?.identificador && (
            <span className="text-xs text-neutral-400">({familyTree.identificador})</span>
          )}
        </div>
        {familyTree && (
          <div className="flex items-center gap-2">
            <label htmlFor="generaciones-arbol" className="text-sm font-medium text-neutral-600">
              Generaciones
            </label>
            <select
              id="generaciones-arbol"
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
      </div>

      {graph ? (
        <>
          {/* SVG — visible en todos los tamaños */}
          <div className="overflow-auto rounded-xl border border-neutral-200 bg-neutral-50/50 shadow-sm">
            <svg
              viewBox={`0 0 ${graph.width} ${graph.height}`}
              className="h-auto w-full"
              role="img"
              aria-label={`Grafo genealógico de ${rootName}`}
              style={{ minWidth: graph.width }}
            >
              <defs>
                <filter id="shadowNode" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
                </filter>
                {graph.nodes.map((n) => {
                  if (!n.node.fotoUrl) return null
                  const px = Math.round((GRAPH_NODE_WIDTH - NODE_PHOTO_SIZE) / 2)
                  const py = NODE_HEADER_H + 4
                  const c = NODE_PHOTO_SIZE / 2
                  return (
                    <clipPath key={`clip-${n.path}`} id={`clip-${n.path}`}>
                      <circle cx={px + c} cy={py + c} r={c} />
                    </clipPath>
                  )
                })}
              </defs>

              {/* Edges */}
              <g>
                {graph.edges.map((edge) => (
                  <g key={`${edge.from.path}-${edge.to.path}`}>
                    <line
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      className="stroke-neutral-300"
                      strokeWidth={edge.dashed ? 1.5 : 2}
                      strokeDasharray={edge.dashed ? '5 5' : undefined}
                    />
                    {edge.label && (
                      <g>
                        <rect
                          x={edge.mx - 26}
                          y={edge.my - 9}
                          width={52}
                          height={18}
                          rx={9}
                          className="fill-white stroke-neutral-300"
                          strokeWidth={1}
                        />
                        <text
                          x={edge.mx}
                          y={edge.my + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[10px] fill-neutral-600 font-semibold"
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </g>

              {/* Nodes */}
              <g filter="url(#shadowNode)">
                {graph.nodes.map((n) => {
                  const colors = sexoClasses(n.node.sexo)
                  const isRoot = n.path === 'root'
                  const displayId = n.node.identificador || ''
                  const nodeName = n.node.nombre || '—'
                  const raza = n.node?.raza?.nombre || n.node?.raza || ''
                  const fotoUrl = n.node.fotoUrl

                  const headerParts = [nodeName]
                  if (displayId) headerParts.push(displayId)
                  if (raza) headerParts.push(raza)
                  const headerText = `${colors.icon} ${headerParts.join(' · ')}`

                  const photoX = Math.round((GRAPH_NODE_WIDTH - NODE_PHOTO_SIZE) / 2)
                  const photoY = NODE_HEADER_H + 4

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
                      <title>
                        {nodeName}{n.node.sexo ? ` (${n.node.sexo})` : ''}
                        {displayId ? ` — ${displayId}` : ''}
                      </title>

                      {/* Cuerpo blanco */}
                      <rect
                        width={GRAPH_NODE_WIDTH}
                        height={GRAPH_NODE_HEIGHT}
                        rx={10}
                        className="fill-white"
                        strokeWidth={0}
                      />

                      {/* Borde (aplicado como rect separado para no afectar el header) */}
                      <rect
                        width={GRAPH_NODE_WIDTH}
                        height={GRAPH_NODE_HEIGHT}
                        rx={10}
                        className={colors.stroke}
                        strokeWidth={isRoot ? 3 : 1.5}
                        fill="none"
                      />

                      {/* Header con color de sexo */}
                      <rect
                        x={1}
                        y={1}
                        width={GRAPH_NODE_WIDTH - 2}
                        height={NODE_HEADER_H - 1}
                        rx={9}
                        className={colors.headerBg}
                      />
                      <rect
                        x={1}
                        y={NODE_HEADER_H - 6}
                        width={GRAPH_NODE_WIDTH - 2}
                        height={6}
                        className={colors.headerBg}
                      />

                      {/* Línea divisoria sutil */}
                      <line
                        x1={12}
                        y1={NODE_HEADER_H + 0.5}
                        x2={GRAPH_NODE_WIDTH - 12}
                        y2={NODE_HEADER_H + 0.5}
                        className="stroke-neutral-200"
                        strokeWidth={1}
                      />

                      {/* Nombre · ID · Raza en header */}
                      <text
                        x={12}
                        y={NODE_HEADER_H / 2 + 1}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className={`text-[10px] font-bold ${colors.headerText}`}
                      >
                        {headerText}
                      </text>

                      {/* Foto circular centrada debajo del header */}
                      {fotoUrl && (
                        <image
                          href={fotoUrl}
                          x={photoX}
                          y={photoY}
                          width={NODE_PHOTO_SIZE}
                          height={NODE_PHOTO_SIZE}
                          clipPath={`url(#clip-${n.path})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      )}
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>

          {/* Leyenda */}
          {hasDashed && (
            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 bg-neutral-300" />
                Parentesco directo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 border-t border-dashed border-neutral-300" />
                Hermanos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-sky-200" />
                Macho
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-rose-200" />
                Hembra
              </span>
            </div>
          )}
        </>
      ) : (
        /* Fallback: lista plana cuando no hay árbol de la API */
        <div className="space-y-4">
          {fallbackHijos.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase text-neutral-500">Hijos</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {fallbackHijos.map((hijo) => {
                  const c = sexoClasses(hijo.sexo)
                  return (
                    <button
                      key={hijo._id}
                      type="button"
                      onClick={() => handleNavigate(hijo._id)}
                      className={`flex items-center gap-2 rounded-lg border ${c.border} ${c.bg} px-3 py-2 text-left text-sm font-medium ${c.text} transition-colors hover:shadow-sm`}
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="sr-only">{c.label}</span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{hijo.nombre}</span>
                        <span className="block truncate text-xs opacity-75">{hijo.identificador || ''}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {fallbackHermanos.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase text-neutral-500">Hermanos</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {fallbackHermanos.map((hermano) => {
                  const c = sexoClasses(hermano.sexo)
                  return (
                    <button
                      key={hermano._id}
                      type="button"
                      onClick={() => handleNavigate(hermano._id)}
                      className={`flex items-center gap-2 rounded-lg border ${c.border} ${c.bg} px-3 py-2 text-left text-sm font-medium ${c.text} transition-colors hover:shadow-sm`}
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="sr-only">{c.label}</span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{hermano.nombre}</span>
                        <span className="block truncate text-xs opacity-75">{hermano.identificador || ''}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

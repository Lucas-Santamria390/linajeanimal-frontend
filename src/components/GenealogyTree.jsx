import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGenealogy } from '../hooks/useGenealogy'
import Loading from './Loading'
import Alert from './Alert'
import EmptyState from './EmptyState'

const MIN_GENERACIONES = 1
const MAX_GENERACIONES = 5
const DEFAULT_GENERACIONES = 3

const GRAPH_COL_WIDTH = 150
const GRAPH_ROW_HEIGHT = 110
const GRAPH_NODE_WIDTH = 120
const GRAPH_NODE_HEIGHT = 56

/**
 * Limita el valor de profundidad de generaciones al rango permitido (1-5).
 * @param {string|number} value - Valor crudo leido del query param o del selector.
 * @returns {number} Valor de generaciones acotado entre 1 y 5.
 */
function clampGeneraciones(value) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return DEFAULT_GENERACIONES
  return Math.min(Math.max(parsed, MIN_GENERACIONES), MAX_GENERACIONES)
}

/**
 * Determina las clases de Tailwind y el icono a usar segun el sexo del animal.
 * @param {string} [sexo=''] - Sexo del animal en texto libre (ej. 'Macho'/'Hembra').
 * @returns {{border: string, bg: string, text: string, fill: string, stroke: string, icon: string, label: string}} Clases de color e icono.
 */
function sexoClasses(sexo = '') {
  const esMacho = typeof sexo === 'string' && sexo.trim().toLowerCase().startsWith('m')
  
  return esMacho
    ? {
        border: 'border-sky-300',      // Borde azul
        bg: 'bg-sky-50',               // Fondo ligero para la lista móvil
        text: 'text-sky-800',          // Texto azul oscuro para legibilidad
        fill: 'fill-sky-100',          // Relleno del nodo rectangular SVG
        stroke: 'stroke-sky-500',      // Contorno del nodo SVG
        icon: '♂',
        label: 'Macho',
      }
    : {
        border: 'border-rose-300',     // Borde rosado
        bg: 'bg-rose-50',              // Fondo ligero para la lista móvil
        text: 'text-rose-800',         // Texto rosado oscuro para legibilidad
        fill: 'fill-rose-100',         // Relleno del nodo rectangular SVG
        stroke: 'stroke-rose-400',     // Contorno del nodo SVG
        icon: '♀',
        label: 'Hembra',
      }
}
/**
 * Calcula la posicion de cada nodo del arbol y las conexiones entre ellos para el grafo SVG.
 * Los ascendientes (padre/madre) quedan en niveles negativos y los descendientes (hijos)
 * en niveles positivos, con el animal raiz en el nivel 0.
 * @param {object|null} root - Nodo raiz del arbol genealogico.
 * @param {object[]} [hermanos=[]] - Hermanos del animal raiz.
 * @returns {{nodes: object[], edges: object[], width: number, height: number}|null} Layout calculado.
 */
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

/**
 * Nodo colapsable de la lista jerarquica movil. Se reutiliza tanto para la rama
 * de ascendientes (padre/madre) como para la de descendientes (hijos).
 * @param {object} props - Propiedades del componente.
 * @param {object} props.node - Animal representado por este nodo.
 * @param {string} props.path - Ruta unica del nodo dentro del arbol (clave de expansion).
 * @param {'up'|'down'} props.direction - 'up' para ascendientes, 'down' para descendientes.
 * @param {Set<string>} props.expandedPaths - Conjunto de paths actualmente expandidos.
 * @param {(path: string) => void} props.onToggle - Alterna la expansion de un path.
 * @param {(id: string) => void} props.onNavigate - Navega al detalle de un animal.
 * @returns {JSX.Element} Item de lista con sus nodos anidados.
 */
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
 * Componente de arbol genealogico. En movil muestra una lista jerarquica indentada
 * con expand/collapse por nodo; en tablet/PC muestra un grafo SVG puro con nodos
 * conectados. La profundidad se controla con el query param `generaciones` (1-5, default 3).
 * @param {object} props - Propiedades del componente.
 * @param {string} props.animalId - Identificador del animal raiz del arbol.
 * @returns {JSX.Element} Vista responsiva del arbol genealogico.
 */
export default function GenealogyTree({ animalId }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { familyTree, loading, error, fetchFamilyTree } = useGenealogy()
  const [expandedPaths, setExpandedPaths] = useState(() => new Set())

  const generaciones = clampGeneraciones(searchParams.get('generaciones') ?? DEFAULT_GENERACIONES)

  useEffect(() => {
    if (animalId) fetchFamilyTree(animalId, generaciones)
  }, [animalId, generaciones, fetchFamilyTree])

  useEffect(() => {
    setExpandedPaths(new Set())
  }, [animalId, generaciones])

  /**
   * Actualiza el query param `generaciones` en la URL cuando el usuario cambia el selector.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} event - Evento de cambio del select.
   * @returns {void}
   */
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

  if (loading) {
    return <Loading message="Cargando arbol genealogico..." />
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  if (!familyTree) {
    return <EmptyState title="Sin informacion genealogica" message="No se encontro un arbol para este animal." />
  }

  const rootColors = sexoClasses(familyTree.sexo)
  const ascendientes = [
    familyTree.padre && { node: familyTree.padre, path: 'root-p' },
    familyTree.madre && { node: familyTree.madre, path: 'root-m' },
  ].filter(Boolean)
  const descendientes = (familyTree.hijos || []).map((hijo, i) => ({ node: hijo, path: `root-h${i}` }))
  const hermanos = familyTree.hermanos || []
  const sinRelaciones = ascendientes.length === 0 && descendientes.length === 0 && hermanos.length === 0

  return (
    <div className="space-y-4">
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

      {sinRelaciones ? (
        <EmptyState
          title="Sin relaciones registradas"
          message="Este animal no tiene padres, hijos ni hermanos registrados."
        />
      ) : (
        <>
          {/* Vista movil: lista jerarquica indentada con expand/collapse */}
          <div className="space-y-4 md:hidden">
            <div className={`flex items-center gap-1.5 rounded-md border ${rootColors.border} ${rootColors.bg} px-3 py-2`}>
              <span aria-hidden="true" className="text-base leading-none">{rootColors.icon}</span>
              <span className="sr-only">{rootColors.label}</span>
              <div>
                <span className="block text-xs font-semibold uppercase text-neutral-500">Animal</span>
                <p className={`font-semibold ${rootColors.text}`}>{familyTree.nombre}</p>
              </div>
            </div>

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

          {/* Vista tablet/PC: grafo SVG puro, sin librerias externas */}
          {graph && (
            <svg
              viewBox={`0 0 ${graph.width} ${graph.height}`}
              className="hidden h-auto w-full md:block"
              role="img"
              aria-label={`Grafo genealogico de ${familyTree.nombre}`}
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
                      <rect
                        width={GRAPH_NODE_WIDTH}
                        height={GRAPH_NODE_HEIGHT}
                        rx={10}
                        className={`${colors.fill} ${colors.stroke}`}
                        strokeWidth={n.path === 'root' ? 3 : 1.5}
                      />
                      <text
                        x={GRAPH_NODE_WIDTH / 2 - 8}
                        y={GRAPH_NODE_HEIGHT / 2}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className={`text-xs font-semibold ${colors.text}`}
                      >
                        {n.node.nombre}
                      </text>
                      <text
                        x={GRAPH_NODE_WIDTH / 2 + 8}
                        y={GRAPH_NODE_HEIGHT / 2}
                        textAnchor="start"
                        dominantBaseline="middle"
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
          )}
        </>
      )}
    </div>
  )
}

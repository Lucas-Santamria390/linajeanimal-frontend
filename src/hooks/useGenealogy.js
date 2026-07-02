import { useState, useCallback, useRef, useEffect } from 'react'
import { getFamilyTree } from '../services/animales'

/**
 * Hook para consultar el árbol genealógico de un animal
 * @returns {{
 *   familyTree: (object|null),
 *   loading: boolean,
 *   error: (string|null),
 *   fetchFamilyTree: (id: string, generaciones?: number) => Promise<object>,
 *   clear: () => void
 * }}
 */
export function useGenealogy() {
  const [familyTree, setFamilyTree] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const safeSet = useCallback((setter, value) => {
    if (mountedRef.current) setter(value)
  }, [])

  const fetchFamilyTree = useCallback(async (id, generaciones = 3) => {
    const clamped = Math.min(Math.max(generaciones, 1), 5)
    safeSet(setLoading, true)
    safeSet(setError, null)
    try {
      const res = await getFamilyTree(id, clamped)
      const payload = res.data.data
      const arbol = payload?.arbol ?? payload ?? null
      safeSet(setFamilyTree, arbol)
      return arbol
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar árbol genealógico'
      safeSet(setError, msg)
    } finally {
      safeSet(setLoading, false)
    }
  }, [safeSet])

  const clear = useCallback(() => {
    safeSet(setFamilyTree, null)
    safeSet(setError, null)
    safeSet(setLoading, false)
  }, [safeSet])

  return {
    familyTree,
    loading,
    error,
    fetchFamilyTree,
    clear,
  }
}
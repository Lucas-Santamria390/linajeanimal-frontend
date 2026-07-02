import { useState, useCallback, useRef, useEffect } from 'react'
import { getChildren, getSiblings, getFamilyTree } from '../services/animales'

/**
 * Hook para consultas genealógicas: hijos, hermanos y árbol familiar
 * @returns {{
 *   children: (object[]|undefined),
 *   siblings: (object[]|undefined),
 *   familyTree: (object|null),
 *   loading: boolean,
 *   error: (string|null),
 *   fetchChildren: (id: string) => Promise<object[]>,
 *   fetchSiblings: (id: string) => Promise<object[]>,
 *   fetchFamilyTree: (id: string, generaciones?: number) => Promise<object>,
 *   clear: () => void
 * }}
 */
export function useGenealogy() {
  const [children, setChildren] = useState()
  const [siblings, setSiblings] = useState()
  const [familyTree, setFamilyTree] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeSet = useCallback((setter, value) => {
    if (mountedRef.current) setter(value)
  }, [])

  const fetchChildren = useCallback(async (id) => {
    safeSet(setLoading, true)
    safeSet(setError, null)
    try {
      const res = await getChildren(id)
      safeSet(setChildren, res.data.data)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar hijos'
      safeSet(setError, msg)
      throw err
    } finally {
      safeSet(setLoading, false)
    }
  }, [safeSet])

  const fetchSiblings = useCallback(async (id) => {
    safeSet(setLoading, true)
    safeSet(setError, null)
    try {
      const res = await getSiblings(id)
      safeSet(setSiblings, res.data.data)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar hermanos'
      safeSet(setError, msg)
      throw err
    } finally {
      safeSet(setLoading, false)
    }
  }, [safeSet])

  const fetchFamilyTree = useCallback(async (id, generaciones = 3) => {
    const clamped = Math.min(Math.max(generaciones, 1), 5)
    safeSet(setLoading, true)
    safeSet(setError, null)
    try {
      const res = await getFamilyTree(id, clamped)
      safeSet(setFamilyTree, res.data.data)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar árbol genealógico'
      safeSet(setError, msg)
      throw err
    } finally {
      safeSet(setLoading, false)
    }
  }, [safeSet])

  const clear = useCallback(() => {
    safeSet(setChildren, undefined)
    safeSet(setSiblings, undefined)
    safeSet(setFamilyTree, null)
    safeSet(setError, null)
    safeSet(setLoading, false)
  }, [safeSet])

  return {
    children,
    siblings,
    familyTree,
    loading,
    error,
    fetchChildren,
    fetchSiblings,
    fetchFamilyTree,
    clear,
  }
}

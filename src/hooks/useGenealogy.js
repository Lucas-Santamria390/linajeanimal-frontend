import { useState, useCallback } from 'react'
import { getChildren, getSiblings, getFamilyTree } from '../services/animales'

/**
 * Hook para consultas genealógicas: hijos, hermanos y árbol familiar
 * @returns {{
 *   children: object[],
 *   siblings: object[],
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
  const [children, setChildren] = useState([])
  const [siblings, setSiblings] = useState([])
  const [familyTree, setFamilyTree] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChildren = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getChildren(id)
      setChildren(res.data.data)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar hijos'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSiblings = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSiblings(id)
      setSiblings(res.data.data)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar hermanos'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFamilyTree = useCallback(async (id, generaciones = 3) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getFamilyTree(id, generaciones)
      setFamilyTree(res.data.data)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar árbol genealógico'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setChildren([])
    setSiblings([])
    setFamilyTree(null)
    setError(null)
    setLoading(false)
  }, [])

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

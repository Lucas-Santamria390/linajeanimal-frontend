import { useState, useEffect, useCallback } from 'react'
import {
  getAnimales,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../services/animales'

/**
 * Hook CRUD para animales
 * @param {object} [initialParams] - Parametros iniciales de busqueda (page, limit, filtros)
 * @returns {{
 *   data: object[],
 *   loading: boolean,
 *   error: (string|null),
 *   pagination: (object|null),
 *   refetch: (newParams?: object) => void,
 *   getById: (id: number|string) => Promise<object>,
 *   create: (formData: object) => Promise<object>,
 *   update: (id: number|string, formData: object) => Promise<object>,
 *   remove: (id: number|string) => Promise<void>
 * }} Retorna estado del hook y operaciones CRUD
 */
export function useAnimales(initialParams = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [params, setParams] = useState(initialParams)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getAnimales(params)
        if (cancelled) return
        setData(res.data.data)
        setPagination(res.data.pagination)
      } catch (err) {
        if (cancelled) return
        setError(err.response?.data?.message || 'Error al cargar animales')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [params, refreshCount])

  const refetch = useCallback((newParams) => {
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }))
    } else {
      setRefreshCount((c) => c + 1)
    }
  }, [])

  const getById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAnimal(id)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener animal')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (formData) => {
    setError(null)
    try {
      const res = await createAnimal(formData)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear animal'
      setError(msg)
      throw err
    }
  }, [])

  const update = useCallback(async (id, formData) => {
    setError(null)
    try {
      const res = await updateAnimal(id, formData)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar animal'
      setError(msg)
      throw err
    }
  }, [])

  const remove = useCallback(async (id) => {
    setError(null)
    try {
      await deleteAnimal(id)
      setRefreshCount((c) => c + 1)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar animal'
      setError(msg)
      throw err
    }
  }, [])

  return { data, loading, error, pagination, refetch, getById, create, update, remove }
}

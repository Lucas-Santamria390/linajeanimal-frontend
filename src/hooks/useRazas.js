import { useState, useEffect, useCallback } from 'react'
import {
  getRazas,
  getRaza,
  createRaza,
  updateRaza,
  deleteRaza,
} from '../services/razas'

/**
 * Hook CRUD para razas
 * @param {object} [initialParams] - Parametros iniciales (incluye especie para filtrar)
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
export function useRazas(initialParams = {}) {
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
        const res = await getRazas(params)
        if (cancelled) return
        setData(res.data.data)
        setPagination(res.data.pagination)
      } catch (err) {
        if (cancelled) return
        setError(err.response?.data?.message || 'Error al cargar razas')
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
      const res = await getRaza(id)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener raza')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (formData) => {
    setError(null)
    try {
      const res = await createRaza(formData)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear raza'
      setError(msg)
      throw err
    }
  }, [])

  const update = useCallback(async (id, formData) => {
    setError(null)
    try {
      const res = await updateRaza(id, formData)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar raza'
      setError(msg)
      throw err
    }
  }, [])

  const remove = useCallback(async (id) => {
    setError(null)
    try {
      await deleteRaza(id)
      setRefreshCount((c) => c + 1)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar raza'
      setError(msg)
      throw err
    }
  }, [])

  return { data, loading, error, pagination, refetch, getById, create, update, remove }
}

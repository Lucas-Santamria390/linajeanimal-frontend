import { useState, useEffect, useCallback } from 'react'
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  toggleUsuarioActivo,
} from '../services/usuarios'

export function useUsuarios(initialParams = {}) {
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
        const res = await getUsuarios(params)
        if (cancelled) return
        setData(res.data.data)
        setPagination(res.data.pagination)
      } catch (err) {
        if (cancelled) return
        setError(err.response?.data?.message || 'Error al cargar usuarios')
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
      const res = await getUsuario(id)
      return res.data.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener usuario')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (formData) => {
    setError(null)
    try {
      const res = await createUsuario(formData)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear usuario'
      setError(msg)
      throw err
    }
  }, [])

  const update = useCallback(async (id, formData) => {
    setError(null)
    try {
      const res = await updateUsuario(id, formData)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar usuario'
      setError(msg)
      throw err
    }
  }, [])

  const remove = useCallback(async (id) => {
    setError(null)
    try {
      await deleteUsuario(id)
      setRefreshCount((c) => c + 1)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar usuario'
      setError(msg)
      throw err
    }
  }, [])

  const toggleActive = useCallback(async (id, active) => {
    setError(null)
    try {
      const res = await toggleUsuarioActivo(id, active)
      setRefreshCount((c) => c + 1)
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cambiar estado del usuario'
      setError(msg)
      throw err
    }
  }, [])

  return { data, loading, error, pagination, refetch, getById, create, update, remove, toggleActive }
}

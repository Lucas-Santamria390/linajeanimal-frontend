import { useState, useEffect } from 'react'
import { getAnimales } from '../services/animales'
import { getEspecies } from '../services/especies'
import { getRazas } from '../services/razas'
import { getUsuarios } from '../services/usuarios'

/**
 * Hook que obtiene estadisticas del dashboard
 * @param {boolean} [includeUsuarios=false] - Si es true, incluye el conteo de usuarios (solo admin)
 * @returns {{ stats: (object|null), loading: boolean, error: (string|null) }} Estado del dashboard
 */
export function useDashboard(includeUsuarios = false) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [animalesRes, especiesRes, razasRes] = await Promise.all([
          getAnimales({ limit: 1 }),
          getEspecies(),
          getRazas(),
        ])

        let usuariosCount = 0
        if (includeUsuarios) {
          try {
            const usuariosRes = await getUsuarios({ limit: 1 })
            usuariosCount = usuariosRes.data.pagination?.totalDocs ?? 0
          } catch {
            // non-admin users get 403, silently skip
          }
        }

        setStats({
          animales: animalesRes.data.pagination?.total ?? 0,
          especies: especiesRes.data.data?.length ?? 0,
          razas: razasRes.data.data?.length ?? 0,
          usuarios: usuariosCount,
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [includeUsuarios])

  return { stats, loading, error }
}

import { useState, useEffect } from 'react'
import { getAnimales } from '../services/animales'
import { getEspecies } from '../services/especies'
import { getRazas } from '../services/razas'
import { getUsuarios } from '../services/usuarios'

/**
 * Hook que obtiene estadisticas del dashboard
 * @returns {{ stats: (object|null), loading: boolean, error: (string|null) }} Estado del dashboard
 */
export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [animalesRes, especiesRes, razasRes, usuariosRes] = await Promise.all([
          getAnimales({ limit: 1 }),
          getEspecies(),
          getRazas(),
          getUsuarios({ limit: 1 }),
        ])

        setStats({
          animales: animalesRes.data.pagination?.total ?? 0,
          especies: especiesRes.data.data?.length ?? 0,
          razas: razasRes.data.data?.length ?? 0,
          usuarios: usuariosRes.data.pagination?.totalDocs ?? 0,
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

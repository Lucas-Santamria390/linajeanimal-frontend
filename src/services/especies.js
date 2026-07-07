import api from './api'

/**
 * Obtiene lista de especies (con filtros opcionales)
 * @param {object} [params] - Filtros (nombre, etc.)
 * @returns {Promise<object>} { success, data: especie[], pagination }
 */
export const getEspecies = (params = {}) => api.get('/especies', { params })

/**
 * Obtiene una especie por ID
 * @param {number|string} id - ID de la especie
 * @returns {Promise<object>} { success, data: { ...especie } }
 */
export const getEspecie = (id) => api.get(`/especies/${id}`)

/**
 * Crea una nueva especie
 * @param {object} data - { nombre, descripcion }
 * @returns {Promise<object>} { success, data: { ...especie } }
 */
export const createEspecie = (data) => api.post('/especies', data)

/**
 * Actualiza una especie existente
 * @param {number|string} id - ID de la especie
 * @param {object} data - Campos a actualizar
 * @returns {Promise<object>} { success, data: { ...especie } }
 */
export const updateEspecie = (id, data) => api.put(`/especies/${id}`, data)

/**
 * Elimina una especie
 * @param {number|string} id - ID de la especie
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const deleteEspecie = (id) => api.delete(`/especies/${id}`)

/**
 * Activa o desactiva una especie (solo admin)
 * @param {number|string} id - ID de la especie
 * @param {boolean} active - true para activar, false para desactivar
 * @returns {Promise<object>} { success, data: { ...especie } }
 */
export const toggleActivateEspecie = (id, active) => api.patch(`/especies/${id}`, { active })

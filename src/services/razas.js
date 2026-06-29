import api from './api'

/**
 * Obtiene lista de razas (con filtro opcional por especie)
 * @param {object} [params] - { especie, nombre }
 * @returns {Promise<object>} { success, data: raza[], pagination }
 */
export const getRazas = (params = {}) => api.get('/razas', { params })

/**
 * Obtiene una raza por ID
 * @param {number|string} id - ID de la raza
 * @returns {Promise<object>} { success, data: { ...raza } }
 */
export const getRaza = (id) => api.get(`/razas/${id}`)

/**
 * Crea una nueva raza
 * @param {object} data - { nombre, especie }
 * @returns {Promise<object>} { success, data: { ...raza } }
 */
export const createRaza = (data) => api.post('/razas', data)

/**
 * Actualiza una raza existente
 * @param {number|string} id - ID de la raza
 * @param {object} data - Campos a actualizar
 * @returns {Promise<object>} { success, data: { ...raza } }
 */
export const updateRaza = (id, data) => api.put(`/razas/${id}`, data)

/**
 * Elimina una raza
 * @param {number|string} id - ID de la raza
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const deleteRaza = (id) => api.delete(`/razas/${id}`)

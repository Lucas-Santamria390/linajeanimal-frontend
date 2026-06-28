import api from './api'

/**
 * Obtiene lista paginada de usuarios
 * @param {object} [params] - Parametros (page, limit, filtros)
 * @returns {Promise<object>} { success, data: usuario[], pagination }
 */
export const getUsuarios = (params = {}) => api.get('/usuarios', { params })

/**
 * Obtiene un usuario por ID
 * @param {number|string} id - ID del usuario
 * @returns {Promise<object>} { success, data: { ...usuario } }
 */
export const getUsuario = (id) => api.get(`/usuarios/${id}`)

/**
 * Crea un nuevo usuario
 * @param {object} data - { nombre, email, password, rol }
 * @returns {Promise<object>} { success, data: { ...usuario } }
 */
export const createUsuario = (data) => api.post('/usuarios', data)

/**
 * Actualiza un usuario existente
 * @param {number|string} id - ID del usuario
 * @param {object} data - Campos a actualizar
 * @returns {Promise<object>} { success, data: { ...usuario } }
 */
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)

/**
 * Elimina un usuario
 * @param {number|string} id - ID del usuario
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

/**
 * Activa o desactiva un usuario
 * @param {number|string} id - ID del usuario
 * @param {boolean} active - true para activar, false para desactivar
 * @returns {Promise<object>} { success, data: { ...usuario } }
 */
export const toggleUsuarioActivo = (id, active) =>
  api.patch(`/usuarios/${id}`, { active })

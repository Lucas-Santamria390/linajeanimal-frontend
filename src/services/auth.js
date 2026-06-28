import api from './api'

/**
 * Inicia sesion con email y password
 * @param {string} email - Correo electronico del usuario
 * @param {string} password - Contrasena del usuario
 * @returns {Promise<object>} { success, data: { usuario, token } }
 */
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

/**
 * Registra un nuevo usuario
 * @param {object} data - { nombre, email, password }
 * @returns {Promise<object>} { success, data: { usuario, token } }
 */
export const register = ({ nombre, email, password }) =>
  api.post('/auth/register', { nombre, email, password })

/**
 * Obtiene perfil del usuario autenticado
 * @returns {Promise<object>} { success, data: { ...usuario } }
 */
export const getProfile = () => api.get('/auth/profile')

/**
 * Cambia la contrasena del usuario autenticado
 * @param {string} oldPassword - Contrasena actual
 * @param {string} newPassword - Nueva contrasena
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const changePassword = (oldPassword, newPassword) =>
  api.put('/auth/password', { oldPassword, newPassword })

/**
 * Cierra sesion en el backend
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const logout = () => api.post('/auth/logout')

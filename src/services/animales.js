import api from './api'

/**
 * Obtiene lista paginada de animales
 * @param {object} [params] - Parametros de busqueda (page, limit, filtros)
 * @returns {Promise<object>} { success, data: animal[], pagination }
 */
export const getAnimales = (params = {}) => api.get('/animales', { params })

/**
 * Obtiene un animal por ID
 * @param {number|string} id - ID del animal
 * @returns {Promise<object>} { success, data: { ...animal } }
 */
export const getAnimal = (id) => api.get(`/animales/${id}`)

/**
 * Crea un nuevo animal
 * @param {object} data - Datos del animal
 * @returns {Promise<object>} { success, data: { ...animal } }
 */
export const createAnimal = (data) => api.post('/animales', data)

/**
 * Actualiza un animal existente
 * @param {number|string} id - ID del animal
 * @param {object} data - Campos a actualizar
 * @returns {Promise<object>} { success, data: { ...animal } }
 */
export const updateAnimal = (id, data) => api.put(`/animales/${id}`, data)

/**
 * Elimina un animal
 * @param {number|string} id - ID del animal
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const deleteAnimal = (id) => api.delete(`/animales/${id}`)

/**
 * Obtiene hijos de un animal
 * @param {number|string} id - ID del animal padre
 * @returns {Promise<object>} { success, data: animal[] }
 */
export const getChildren = (id) => api.get(`/animales/${id}/children`)

/**
 * Obtiene hermanos de un animal
 * @param {number|string} id - ID del animal
 * @returns {Promise<object>} { success, data: animal[] }
 */
export const getSiblings = (id) => api.get(`/animales/${id}/siblings`)

/**
 * Obtiene arbol genealogico de un animal
 * @param {number|string} id - ID del animal
 * @param {number} [generaciones=3] - Profundidad del arbol
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const getFamilyTree = (id, generaciones = 3) =>
  api.get(`/animales/${id}/family-tree`, { params: { generaciones } })

/**
 * Asigna padres a un animal
 * @param {number|string} id - ID del animal
 * @param {object} data - { padre_id, madre_id }
 * @returns {Promise<object>} { success, data: { ... } }
 */
export const setParents = (id, data) => api.post(`/animales/${id}/parents`, data)

import api from './api'

export const getAnimales = (params = {}) => api.get('/animales', { params })

export const getAnimal = (id) => api.get(`/animales/${id}`)

export const createAnimal = (data) => api.post('/animales', data)

export const updateAnimal = (id, data) => api.put(`/animales/${id}`, data)

export const deleteAnimal = (id) => api.delete(`/animales/${id}`)

export const getChildren = (id) => api.get(`/animales/${id}/children`)

export const getSiblings = (id) => api.get(`/animales/${id}/siblings`)

export const getFamilyTree = (id, generaciones = 3) =>
  api.get(`/animales/${id}/family-tree`, { params: { generaciones } })

export const setParents = (id, data) => api.post(`/animales/${id}/parents`, data)

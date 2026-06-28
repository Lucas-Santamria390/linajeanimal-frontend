import api from './api'

export const getEspecies = (params = {}) => api.get('/especies', { params })

export const getEspecie = (id) => api.get(`/especies/${id}`)

export const createEspecie = (data) => api.post('/especies', data)

export const updateEspecie = (id, data) => api.put(`/especies/${id}`, data)

export const deleteEspecie = (id) => api.delete(`/especies/${id}`)

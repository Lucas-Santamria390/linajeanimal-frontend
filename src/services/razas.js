import api from './api'

export const getRazas = (params = {}) => api.get('/razas', { params })

export const getRaza = (id) => api.get(`/razas/${id}`)

export const createRaza = (data) => api.post('/razas', data)

export const updateRaza = (id, data) => api.put(`/razas/${id}`, data)

export const deleteRaza = (id) => api.delete(`/razas/${id}`)

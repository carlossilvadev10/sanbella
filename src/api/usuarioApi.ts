import axiosInstance from './axiosInstance'
import { User, UserFormValues, UserFilters } from '@/types'

export const usuarioApi = {
  find: (filters: object) =>
    axiosInstance.post('/api/usuario/find', filters),

  findClientes: (filters: object) =>
    axiosInstance.post('/api/usuario/clientes/find', filters),

  get: (userId: number) =>
    axiosInstance.get<User>(`/api/usuario/get/${userId}`),

  load: (params?: Record<string, unknown>) =>
    axiosInstance.get('/api/usuario/load', { params }),

  init: () =>
    axiosInstance.get('/api/usuario/init'),

  saveOrUpdate: (data: UserFormValues) =>
    axiosInstance.post<User>('/api/usuario/saveOrUpdate', data),

  delete: (userId: number) =>
    axiosInstance.delete(`/api/usuario/delete/${userId}`),

  updatePassword: (userId: number) =>
    axiosInstance.patch(`/api/usuario/updatePassword/${userId}`),

  suspension: (userId: number) =>
    axiosInstance.patch(`/api/usuario/suspension/${userId}`),
}

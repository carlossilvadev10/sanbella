import axiosInstance from './axiosInstance'

export const usuarioServicioApi = {
  saveOrUpdate: (data: { usuarioId: number; servicioIds: string[] }) =>
    axiosInstance.post('/api/usuario-servicio/saveOrUpdate', data),

  loadByUsuario: (userId: number) =>
    axiosInstance.get(`/api/usuario-servicio/loadByUsuario/${userId}`),

  find: (filters: Record<string, unknown>) =>
    axiosInstance.post('/api/usuario-servicio/find', filters),

  delete: (id: number) =>
    axiosInstance.delete(`/api/usuario-servicio/delete/${id}`),
}

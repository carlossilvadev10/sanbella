import axiosInstance from './axiosInstance'
import {
  Reservation, ReservationRequest, CreatedReservation,
  PortalReservaRequest,
  AvailabilityRequest, AdvancePaymentRequest, PaymentRequest,
  CancelRequest, RescheduleRequest,
} from '@/types'

// Public portal (no auth)
export const portalApi = {
  loadCategorias: () =>
    axiosInstance.get('/api/loadCategoria'),

  loadServicios: (params?: Record<string, unknown>) =>
    axiosInstance.get('/api/load', { params }),

  loadEspecialistas: (params?: Record<string, unknown>) =>
    axiosInstance.get('/api/loadEspecialista', { params }),

  findDisponibilidad: (data: AvailabilityRequest) =>
    axiosInstance.post('/api/findDisponibilidad', data),

  saveOrUpdateReserva: (data: ReservationRequest | PortalReservaRequest) =>
    axiosInstance.post<CreatedReservation>('/api/saveOrUpdateReserva', data),
}

// Reservations (admin / receptionist)
export const reservaApi = {
  find: (filters: object) =>
    axiosInstance.post('/api/reserva/find', filters),

  findMisReservas: (filters: Record<string, unknown>) =>
    axiosInstance.post('/api/reserva/findMisReservas', filters),

  getById: (reservationId: number | string) =>
    axiosInstance.get<Reservation>(`/api/reserva/getById/${reservationId}`),

  getByCodigoVerificacion: (code: string) =>
    axiosInstance.get<Reservation>(`/api/reserva/getByCodigoVerificacion/${code}`),

  confirmarAdelanto: (reservationId: number, data: AdvancePaymentRequest) =>
    axiosInstance.patch(`/api/reserva/updateConfirmarAdelanto/${reservationId}`, data),

  registrarPago: (reservationId: number, data: PaymentRequest) =>
    axiosInstance.patch(`/api/reserva/updateRegistrarPago/${reservationId}`, data),

  updateAsistencia: (reservationId: number, data: Record<string, unknown>) =>
    axiosInstance.patch(`/api/reserva/updateAsistencia/${reservationId}`, data),

  anular: (reservationId: number, data: CancelRequest) =>
    axiosInstance.patch(`/api/reserva/updateAnular/${reservationId}`, data),

  reagendar: (reservationId: number, data: RescheduleRequest) =>
    axiosInstance.patch(`/api/reserva/updateReagendar/${reservationId}`, data),

  getMensajeWhatsapp: (reservationId: number) =>
    axiosInstance.get(`/api/reserva/getMensajeWhatsapp/${reservationId}`),
}

// Common catalogs
export const comunApi = {
  loadEstadoReserva: () =>
    axiosInstance.get('/api/comun/loadEstadoReserva'),

  loadMetodoPago: () =>
    axiosInstance.get('/api/comun/loadMetodoPago'),

  loadMotivoAnulacion: () =>
    axiosInstance.get('/api/comun/loadMotivoAnulacion'),

  loadTipoDocumento: () =>
    axiosInstance.get('/api/comun/loadTipoDocumento'),

  loadServicio: () =>
    axiosInstance.get('/api/comun/loadServicio'),

  loadRol: () =>
    axiosInstance.get('/api/comun/loadRol'),

  loadEspecialistaByServicioId: (serviceId: number) =>
    axiosInstance.get(`/api/comun/loadEspecialistaByServicioId/${serviceId}`),

  loadServicioByCategoriaId: (categoryId: number) =>
    axiosInstance.get(`/api/comun/loadServicioByCategoriaId/${categoryId}`),

  loadCategoria: () =>
    axiosInstance.get('/api/comun/loadCategoria'),

  loadCatalogo: (referenciaCodigo: string) =>
    axiosInstance.get(`/api/comun/loadCatalogo/${referenciaCodigo}`),
}

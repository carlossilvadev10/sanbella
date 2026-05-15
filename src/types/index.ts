// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  usuarioId: number
  nombre: string
  apellido: string
  correo: string
  rolCodigo: string
  rolNombre: string
  estadoCodigo: string
  token: string
}

// ── Catalog (ComboBaseResponse / ComboResponse) ───────────────────────────────
export interface ComboResponse {
  id: number
  codigo: string
  nombre: string
  apellidos?: string
  descripcion?: string
  precio?: number
  duracion?: number
}

export interface ComboBaseResponse {
  list: ComboResponse[]
  size: number
}

// ── User ──────────────────────────────────────────────────────────────────────
export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'

export interface UsuarioResponse {
  usuarioId: number
  rolId: number
  rolNombre: string
  nombre: string
  apellido: string
  correo: string
  tipoDocumentoCodigo: string
  documento: string
  telefono: string
  usuario: string
  estadoCodigo: string
  totalFaltas: number
  habilitado: boolean
  fechaSuspension?: string
  diasSuspension?: number
  fechaNacimiento?: string
}

// Alias used by usuarioApi.ts
export type User = UsuarioResponse

export interface CollectionResponse<T> {
  elements: T[]
  start: number
  limit: number
  totalCount: number
}

export interface UserFormValues {
  usuarioId?: number
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  documento?: string
  tipoDocumentoCodigo?: string
  rolId: string
  estadoCodigo?: string
  password?: string
  servicios?: string[]
}

// Matches UsuarioFiltroRequest exactly
export interface UserFilters {
  start: number
  limit: number
  totalCount?: number
  nombre?: string
  correo?: string
  documento?: string
  rolId?: string
  estadoCodigo?: string
  habilitado?: boolean
}

// ── Reservation ───────────────────────────────────────────────────────────────
export interface ReservaDataGridResponse {
  reservaId: number
  categoriaId: number
  categoriaNombre: string
  fecha: string
  hora?: string
  estadoCodigo: string
  observacion?: string
  motivoCodigo?: string
  codigoVerificacion: string
  fechaEmision: string
  clienteId: number
  clienteNombre: string
  clienteApellido: string
  clienteTelefono: string
  clienteCorreo: string
  especialistaId: number
  especialistaNombre: string
  especialistaApellido: string
  servicioId: number
  servicioNombre: string
  tarifa: number
  usuarioServicioId: number
  duracion: number
}

// Detail response returned by getById / getByCodigoVerificacion
export interface Reservation {
  id?: number
  reservaId?: number
  codigoVerificacion: string
  fecha: string
  hora?: string
  slot?: string
  estado?: string
  estadoCodigo?: string
  // cliente (varios nombres posibles según el backend)
  nombres?: string
  apellidos?: string
  clienteNombre?: string
  clienteApellido?: string
  invitadoNombre?: string
  invitadoApellido?: string
  nroDocumento?: string
  documento?: string
  celular?: string
  clienteTelefono?: string
  invitadoTelefono?: string
  email?: string
  clienteCorreo?: string
  invitadoCorreo?: string
  // servicio / especialista
  servicio?: { nombre: string; id?: number }
  servicioNombre?: string
  especialista?: { nombre: string; id?: number }
  especialistaNombre?: string
  especialistaApellido?: string
  // tarifa
  monto?: number
  tarifa?: number
  montoAdelanto?: number
  nota?: string
  observacion?: string
}

export interface ReservaCreadaResponse {
  reservaId: number
  codigoVerificacion: string
  estadoCodigo: string
  urlWhatsapp?: string
  mensajeWhatsapp?: string
  numeroWhatsapp?: string
  montoAdelanto?: number
  titularYape?: string
}

// Alias used by reservaApi.ts
export type CreatedReservation = ReservaCreadaResponse

// Matches ReservaFiltroRequest exactly
export interface ReservationFilters {
  start: number
  limit: number
  totalCount?: number
  fechaDesde?: string
  fechaHasta?: string
  estadoCodigo?: string
  especialistaId?: number
  servicioId?: number
  clienteNombre?: string
}

// Request sent from the public portal booking form
export interface PortalReservaRequest {
  servicioId: string | number
  especialistaId?: string | number
  fecha: string
  slot: string
  hora?: string
  nombres: string
  apellidos: string
  celular: string
  email: string
  codigoValidacion?: string
  observacion?: string
}

// Matches ReservaRequest schema exactly
export interface ReservationRequest {
  usuarioId?: number
  usuarioServicioId: number
  fecha: string                    // ISO datetime: "YYYY-MM-DDTHH:mm:ss"
  observacion?: string
  invitadoNombre?: string
  invitadoApellido?: string
  invitadoTelefono?: string
  invitadoCorreo?: string
}

// ── Availability ──────────────────────────────────────────────────────────────
export interface EspecialistaDisponibleResponse {
  especialistaId: number
  nombre: string
  apellido: string
  usuarioServicioId: number
}

export interface SlotDisponibleResponse {
  hora: string
  especialistas: EspecialistaDisponibleResponse[]
}

export interface DisponibilidadResponse {
  slots: SlotDisponibleResponse[]
}

export interface AvailabilityRequest {
  servicioId: string | number
  fecha: string
  especialistaId?: string | number
}

// ── Payment / Cancel / Reschedule ─────────────────────────────────────────────
export interface AdvancePaymentRequest {
  metodoPagoId: string
  montoAdelanto: string
}

// Matches RegistrarPagoRequest exactly
export interface PaymentRequest {
  metodoPagoCodigo: string
  montoTotal:       number
  aplicarDescuento: boolean
  observacion?:     string
}

export interface CancelRequest {
  motivoAnulacionId: string
  observacion?: string
}

export interface RescheduleRequest {
  fecha: string
  especialistaId: string
  slot: string
}

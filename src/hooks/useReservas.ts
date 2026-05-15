import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservaApi, portalApi, comunApi } from '@/api/reservaApi'
import { fromCombo, fromCollection, cleanFilters } from '@/utils/apiHelpers'
import {
  ReservationFilters, ReservationRequest, AvailabilityRequest,
  AdvancePaymentRequest, PaymentRequest, CancelRequest, RescheduleRequest,
  CollectionResponse, ReservaDataGridResponse, ReservaCreadaResponse,
  DisponibilidadResponse, Reservation,
} from '@/types'

export const RESERVATION_KEYS = {
  all:            ['reservations'] as const,
  list:           (f: ReservationFilters) => ['reservations', 'list', f] as const,
  detail:         (id: number | string)    => ['reservations', 'detail', id] as const,
  byCode:         (code: string)           => ['reservations', 'code', code] as const,
  availability:   (p: AvailabilityRequest) => ['availability', p] as const,
  statusCatalog:  ['reservation-statuses'] as const,
  paymentMethods: ['payment-methods'] as const,
  cancelReasons:  ['cancel-reasons'] as const,
}

export const useReservations = (filters: ReservationFilters) => {
  const cleaned = cleanFilters(filters)
  if (cleaned.fechaDesde) cleaned.fechaDesde = `${cleaned.fechaDesde}T00:00:00`
  if (cleaned.fechaHasta) cleaned.fechaHasta = `${cleaned.fechaHasta}T23:59:59`
  return useQuery({
    queryKey: RESERVATION_KEYS.list(filters),
    queryFn:  () => reservaApi.find(cleaned).then((r) =>
      r.data as CollectionResponse<ReservaDataGridResponse>
    ),
    placeholderData: (prev) => prev,
  })
}

export const useReservationById = (id?: number | string) =>
  useQuery({
    queryKey: RESERVATION_KEYS.detail(id!),
    queryFn:  () => reservaApi.getById(id!).then((r) => r.data as Reservation),
    enabled:  !!id,
  })

export const useReservationByCode = (code?: string) =>
  useQuery({
    queryKey: RESERVATION_KEYS.byCode(code!),
    queryFn:  () => reservaApi.getByCodigoVerificacion(code!).then((r) =>
      r.data as Reservation
    ),
    enabled: !!code,
    retry:   false,
  })

export const useAvailability = (params: Partial<AvailabilityRequest>) =>
  useQuery({
    queryKey: RESERVATION_KEYS.availability(params as AvailabilityRequest),
    queryFn:  () => portalApi.findDisponibilidad(params as AvailabilityRequest).then((r) =>
      r.data as DisponibilidadResponse
    ),
    enabled: !!(params?.servicioId && params?.fecha),
  })

// All catalog endpoints return ComboBaseResponse { list: ComboResponse[] }
export const useReservationStatuses = () =>
  useQuery({
    queryKey: RESERVATION_KEYS.statusCatalog,
    queryFn:  () => comunApi.loadEstadoReserva().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

export const usePaymentMethods = () =>
  useQuery({
    queryKey: RESERVATION_KEYS.paymentMethods,
    queryFn:  () => comunApi.loadMetodoPago().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

export const useCancelReasons = () =>
  useQuery({
    queryKey: RESERVATION_KEYS.cancelReasons,
    queryFn:  () => comunApi.loadMotivoAnulacion().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

export const useCreateReservation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReservationRequest) =>
      portalApi.saveOrUpdateReserva(payload).then((r) => r.data as ReservaCreadaResponse),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESERVATION_KEYS.all }),
  })
}

export const useConfirmAdvancePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: number; payload: AdvancePaymentRequest }) =>
      reservaApi.confirmarAdelanto(reservationId, payload).then((r) => r.data),
    onSuccess: (_, { reservationId }) => {
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(reservationId) })
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    },
  })
}

export const useRegisterPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: number; payload: PaymentRequest }) =>
      reservaApi.registrarPago(reservationId, payload).then((r) => r.data),
    onSuccess: (_, { reservationId }) => {
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(reservationId) })
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    },
  })
}

export const useCancelReservation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: number; payload: CancelRequest }) =>
      reservaApi.anular(reservationId, payload).then((r) => r.data),
    onSuccess: (_, { reservationId }) => {
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(reservationId) })
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    },
  })
}

export const useRegisterAttendance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: number; payload: Record<string, unknown> }) =>
      reservaApi.updateAsistencia(reservationId, payload).then((r) => r.data),
    onSuccess: (_, { reservationId }) => {
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.detail(reservationId) })
      qc.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    },
  })
}

export const useRescheduleReservation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: number; payload: RescheduleRequest }) =>
      reservaApi.reagendar(reservationId, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESERVATION_KEYS.all }),
  })
}

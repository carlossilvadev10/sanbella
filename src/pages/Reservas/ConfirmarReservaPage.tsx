import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, CheckCircle2, Banknote, UserCheck, XCircle } from 'lucide-react'

import { reservaApi } from '@/api/reservaApi'
import {
  useConfirmAdvancePayment, useRegisterPayment,
  useRegisterAttendance, useCancelReservation,
  usePaymentMethods, useCancelReasons, useReservationStatuses,
} from '@/hooks/useReservas'
import { getApiError, formatDate, formatCurrency } from '@/utils/helpers'
import { Spinner, Alert, StatusBadge, ConfirmDialog } from '@/components/ui'
import type { Reservation } from '@/types'

import InfoRow            from './InfoRow'
import AdelantoModal      from './AdelantoModal'
import PagoModal          from './PagoModal'
import AnularReservaModal from './AnularReservaModal'

const searchSchema = z.object({ code: z.string().min(1, 'Ingresa el código de verificación') })

// Si fecha viene como "2026-05-16T14:40:00" extrae "14:40"
const extractTimeFromDateTime = (fecha?: string): string | undefined => {
  if (!fecha) return undefined
  return fecha.match(/T(\d{2}:\d{2})/)?.[1]
}

export default function ConfirmReservationPage() {
  const [reservation,        setReservation]        = useState<Reservation | null>(null)
  const [isSearching,        setIsSearching]        = useState(false)
  const [searchError,        setSearchError]        = useState('')
  const [actionError,        setActionError]        = useState('')
  const [actionSuccess,      setActionSuccess]      = useState('')
  const [showAdvanceModal,   setShowAdvanceModal]   = useState(false)
  const [showPaymentModal,   setShowPaymentModal]   = useState(false)
  const [showCancelModal,    setShowCancelModal]    = useState(false)
  const [showAttendance,     setShowAttendance]     = useState(false)

  const { data: paymentMethods = [] } = usePaymentMethods()
  const { data: cancelReasons  = [] } = useCancelReasons()
  const { data: statuses       = [] } = useReservationStatuses()
  const estadoNombre = (codigo?: string) =>
    statuses.find((s) => s.codigo === codigo)?.nombre ?? codigo

  const confirmAdvance     = useConfirmAdvancePayment()
  const registerPayment    = useRegisterPayment()
  const registerAttendance = useRegisterAttendance()
  const cancelReservation  = useCancelReservation()

  const searchForm = useForm<z.infer<typeof searchSchema>>({ resolver: zodResolver(searchSchema) })

  // ── Derivados de la reserva actual ─────────────────────────────────────────
  const reservationApiId = reservation?.reservaId ?? reservation?.id
  const estadoCodigo     = reservation?.estado ?? reservation?.estadoCodigo
  const estadoLegible    = (estadoNombre(estadoCodigo) ?? '').toUpperCase()
  const isCancelled      = estadoLegible === 'ANULADO'

  // Workflow: PENDIENTE → ADELANTADO → EN ESPERA → COMPLETADO/PAGADO
  const canConfirmAdvance     = estadoLegible === 'PENDIENTE'
  const canRegisterAttendance = ['ADELANTADO', 'CONFIRMADA', 'CONFIRMADO'].includes(estadoLegible)
  const canRegisterPayment    = ['EN ESPERA', 'EN_ESPERA', 'EN ATENCION', 'ATENDIENDO'].includes(estadoLegible)
  const isWaitingForSpecialist = ['EN ESPERA', 'EN_ESPERA'].includes(estadoLegible)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const refreshReservation = async () => {
    if (!reservation?.codigoVerificacion) return
    try {
      const { data } = await reservaApi.getByCodigoVerificacion(reservation.codigoVerificacion)
      setReservation(data)
    } catch (_) { /* noop */ }
  }

  const onSearch = async (values: z.infer<typeof searchSchema>) => {
    setSearchError(''); setActionError(''); setActionSuccess(''); setReservation(null)
    setIsSearching(true)
    try {
      const { data } = await reservaApi.getByCodigoVerificacion(values.code.trim().toUpperCase())
      setReservation(data)
    } catch (err) {
      setSearchError(getApiError(err))
    } finally {
      setIsSearching(false)
    }
  }

  const handleConfirmAdvance = async (data: Parameters<typeof confirmAdvance.mutateAsync>[0]['payload']) => {
    if (!reservationApiId) return
    setActionError('')
    try {
      await confirmAdvance.mutateAsync({ reservationId: reservationApiId, payload: data })
      setActionSuccess('Adelanto confirmado correctamente.')
      setShowAdvanceModal(false)
      refreshReservation()
    } catch (err) { setActionError(getApiError(err)) }
  }

  const handleRegisterPayment = async (data: Parameters<typeof registerPayment.mutateAsync>[0]['payload']) => {
    if (!reservationApiId) return
    setActionError('')
    try {
      await registerPayment.mutateAsync({ reservationId: reservationApiId, payload: data })
      setActionSuccess('Pago registrado correctamente.')
      setShowPaymentModal(false)
      refreshReservation()
    } catch (err) { setActionError(getApiError(err)) }
  }

  const handleRegisterAttendance = async () => {
    if (!reservationApiId) return
    setActionError('')
    try {
      await registerAttendance.mutateAsync({ reservationId: reservationApiId, payload: {} })
      setActionSuccess('Asistencia registrada. Estado cambiado a EN ESPERA.')
      setShowAttendance(false)
      refreshReservation()
    } catch (err) { setActionError(getApiError(err)); setShowAttendance(false) }
  }

  const handleCancelReservation = async (data: Parameters<typeof cancelReservation.mutateAsync>[0]['payload']) => {
    if (!reservationApiId) return
    setActionError('')
    try {
      await cancelReservation.mutateAsync({ reservationId: reservationApiId, payload: data })
      setActionSuccess('Reserva anulada.')
      setShowCancelModal(false)
      refreshReservation()
    } catch (err) { setActionError(getApiError(err)) }
  }

  const openModal = (setter: (v: boolean) => void) => {
    setActionError(''); setActionSuccess('')
    setter(true)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fade-enter max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Confirmación de Reserva</h1>
        <p className="page-subtitle">Busca la reserva por su código de verificación para gestionarla.</p>
      </div>

      {/* Buscador */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex gap-3">
            <div className="flex-1">
              <input
                {...searchForm.register('code')}
                className={`input uppercase tracking-widest font-mono ${searchForm.formState.errors.code ? 'input-error' : ''}`}
                placeholder="Ej: ABC123"
              />
              {searchForm.formState.errors.code && (
                <p className="field-error">{searchForm.formState.errors.code.message}</p>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={isSearching}>
              {isSearching ? <Spinner size="sm" className="text-white" /> : <><Search size={16} /> Buscar</>}
            </button>
          </form>
          {searchError && <div className="mt-3"><Alert type="error">{searchError}</Alert></div>}
        </div>
      </div>

      {/* Detalle + acciones */}
      {reservation && (
        <div className="space-y-4 fade-enter">
          {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}
          {actionError   && <Alert type="error">{actionError}</Alert>}

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-800">Reserva #{reservationApiId}</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{reservation.codigoVerificacion}</p>
              </div>
              <StatusBadge estado={estadoNombre(estadoCodigo)} />
            </div>
            <div className="card-body grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <InfoRow
                label="Cliente"
                value={`${reservation.clienteNombre ?? reservation.invitadoNombre ?? reservation.nombres ?? ''} ${reservation.clienteApellido ?? reservation.invitadoApellido ?? reservation.apellidos ?? ''}`.trim()}
              />
              <InfoRow label="Celular" value={reservation.clienteTelefono ?? reservation.invitadoTelefono ?? reservation.celular} />
              <InfoRow label="Email"   value={reservation.clienteCorreo ?? reservation.invitadoCorreo ?? reservation.email} />
              {(reservation.documento ?? reservation.nroDocumento) && (
                <InfoRow label="Documento" value={reservation.documento ?? reservation.nroDocumento} />
              )}
              <InfoRow label="Servicio" value={reservation.servicio?.nombre ?? reservation.servicioNombre} />
              <InfoRow
                label="Especialista"
                value={`${reservation.especialista?.nombre ?? reservation.especialistaNombre ?? ''} ${reservation.especialistaApellido ?? ''}`.trim()}
              />
              <InfoRow label="Fecha" value={formatDate(reservation.fecha)} />
              <InfoRow label="Hora"  value={reservation.hora ?? reservation.slot ?? extractTimeFromDateTime(reservation.fecha)} />
              {(reservation.tarifa ?? reservation.monto) != null && (
                <InfoRow label="Monto total" value={formatCurrency(Number(reservation.tarifa ?? reservation.monto))} />
              )}
              {reservation.montoAdelanto != null && (
                <InfoRow label="Adelanto" value={formatCurrency(reservation.montoAdelanto)} />
              )}
              {(reservation.observacion ?? reservation.nota) && (
                <InfoRow label="Observación" value={reservation.observacion ?? reservation.nota} className="col-span-2" />
              )}
            </div>
          </div>

          {!isCancelled && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-neutral-700">Acciones disponibles</h2>
              </div>
              {isWaitingForSpecialist && (
                <div className="px-6 pt-3">
                  <Alert type="info">
                    Esperando que el especialista inicie y finalice la atención. El pago se podrá registrar cuando termine el servicio.
                  </Alert>
                </div>
              )}
              <div className="card-body flex flex-wrap gap-2">
                <button className="btn-secondary gap-2" onClick={() => openModal(setShowAdvanceModal)} disabled={!canConfirmAdvance}>
                  <Banknote size={16} className="text-amber-600" /> Confirmar adelanto
                </button>
                <button className="btn-secondary gap-2" onClick={() => openModal(setShowAttendance)} disabled={!canRegisterAttendance}>
                  <UserCheck size={16} className="text-blue-600" /> Registrar asistencia
                </button>
                <button className="btn-secondary gap-2" onClick={() => openModal(setShowPaymentModal)} disabled={!canRegisterPayment}>
                  <CheckCircle2 size={16} className="text-emerald-600" /> Registrar pago
                </button>
                <button className="btn-danger gap-2" onClick={() => openModal(setShowCancelModal)}>
                  <XCircle size={16} /> Anular
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <AdelantoModal
        open={showAdvanceModal}
        paymentMethods={paymentMethods}
        loading={confirmAdvance.isPending}
        onClose={() => setShowAdvanceModal(false)}
        onSubmit={handleConfirmAdvance}
      />
      <PagoModal
        open={showPaymentModal}
        paymentMethods={paymentMethods}
        loading={registerPayment.isPending}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleRegisterPayment}
      />
      <AnularReservaModal
        open={showCancelModal}
        motivos={cancelReasons}
        loading={cancelReservation.isPending}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancelReservation}
      />
      <ConfirmDialog
        open={showAttendance}
        onClose={() => setShowAttendance(false)}
        onConfirm={handleRegisterAttendance}
        title="Registrar asistencia"
        description="¿Confirmas que el cliente se presentó a su cita?"
        confirmLabel="Sí, registrar"
        loading={registerAttendance.isPending}
      />
    </div>
  )
}

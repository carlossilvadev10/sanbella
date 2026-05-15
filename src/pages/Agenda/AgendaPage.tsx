import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LayoutList, CalendarDays, RefreshCw } from 'lucide-react'
import { addDays, format, startOfWeek } from 'date-fns'

import { reservaApi, comunApi } from '@/api/reservaApi'
import { fromCombo } from '@/utils/apiHelpers'
import { formatDate, getApiError } from '@/utils/helpers'
import {
  ReservationFilters, CollectionResponse, ReservaDataGridResponse,
  ComboResponse, CancelRequest, RescheduleRequest,
} from '@/types'
import {
  LoadingScreen, EmptyState, StatusBadge, Pagination, ConfirmDialog,
  ToastContainer, useToast,
} from '@/components/ui'

import {
  MOTIVOS_ANULACION_DEFAULT, toApiDateStart, toApiDateEnd, displayDate,
} from './agenda.utils'
import AnularModal     from './AnularModal'
import ReagendarModal  from './ReagendarModal'
import CalendarView    from './CalendarView'
import AccionesCita    from './AccionesCita'

const PAGE_SIZE = 15

export default function AgendaPage() {
  const qc = useQueryClient()

  const [viewMode,         setViewMode]         = useState<'tabla' | 'calendario'>('tabla')
  const [filters,          setFilters]          = useState<ReservationFilters>({ start: 0, limit: PAGE_SIZE })
  const [page,             setPage]             = useState(1)
  const [weekBase,         setWeekBase]         = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const [cancelTarget,     setCancelTarget]     = useState<ReservaDataGridResponse | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<ReservaDataGridResponse | null>(null)
  const [attendanceTarget, setAttendanceTarget] = useState<ReservaDataGridResponse | null>(null)

  const { toasts, dismiss, toast } = useToast()

  const today = new Date().toISOString().split('T')[0]

  // ── Queries ────────────────────────────────────────────────────────────────
  const calendarFilters = useMemo<ReservationFilters>(() => ({
    start: 0,
    limit: 200,
    fechaDesde: format(weekBase, 'yyyy-MM-dd'),
    fechaHasta: format(addDays(weekBase, 6), 'yyyy-MM-dd'),
  }), [weekBase])

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['agenda', filters],
    queryFn:  () => reservaApi.find({
      ...filters,
      fechaDesde: toApiDateStart(filters.fechaDesde),
      fechaHasta: toApiDateEnd(filters.fechaHasta),
    }).then((r) => r.data as CollectionResponse<ReservaDataGridResponse>),
    placeholderData: (prev) => prev,
  })

  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['agenda-calendar', calendarFilters],
    queryFn:  () => reservaApi.find({
      ...calendarFilters,
      fechaDesde: toApiDateStart(calendarFilters.fechaDesde),
      fechaHasta: toApiDateEnd(calendarFilters.fechaHasta),
    }).then((r) => r.data as CollectionResponse<ReservaDataGridResponse>),
    enabled:  viewMode === 'calendario',
    placeholderData: (prev) => prev,
  })

  const { data: estadosCatalog = [] } = useQuery({
    queryKey: ['estado-reserva-catalog'],
    queryFn:  () => comunApi.loadEstadoReserva().then((r) => fromCombo(r.data) as ComboResponse[]),
    staleTime: Infinity,
  })

  const { data: motivosCatalog = [] } = useQuery({
    queryKey: ['cancel-reasons-list'],
    queryFn:  () => comunApi.loadMotivoAnulacion().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

  const estadoMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(estadosCatalog.map((e) => [e.codigo, e.nombre])),
    [estadosCatalog],
  )
  const estadoNombre = (codigo: string) => estadoMap[codigo] ?? codigo

  const reservations         = data?.elements ?? []
  const totalCount           = data?.totalCount ?? 0
  const totalPages           = Math.ceil(totalCount / PAGE_SIZE) || 1
  const calendarReservations = calendarData?.elements ?? []

  const motivos: ComboResponse[] = (motivosCatalog as ComboResponse[]).length
    ? (motivosCatalog as ComboResponse[])
    : MOTIVOS_ANULACION_DEFAULT

  // ── Mutaciones ─────────────────────────────────────────────────────────────
  const invalidateAgenda = () => {
    qc.invalidateQueries({ queryKey: ['agenda'] })
    qc.invalidateQueries({ queryKey: ['agenda-calendar'] })
  }

  const registerAttendance = useMutation({
    mutationFn: (reservaId: number) => reservaApi.updateAsistencia(reservaId, {}).then((r) => r.data),
    onSuccess: () => { invalidateAgenda(); toast('success', 'Asistencia registrada. Estado cambiado a EN ESPERA.') },
    onError:   (e) => toast('error', getApiError(e)),
    onSettled: () => setAttendanceTarget(null),
  })

  const cancelReservation = useMutation({
    mutationFn: ({ reservaId, data }: { reservaId: number; data: CancelRequest }) =>
      reservaApi.anular(reservaId, data).then((r) => r.data),
    onSuccess: () => { invalidateAgenda(); toast('success', 'Reserva anulada correctamente.') },
    onError:   (e) => toast('error', getApiError(e)),
    onSettled: () => setCancelTarget(null),
  })

  const rescheduleReservation = useMutation({
    mutationFn: ({ reservaId, data }: { reservaId: number; data: RescheduleRequest }) =>
      reservaApi.reagendar(reservaId, data).then((r) => r.data),
    onSuccess: () => { invalidateAgenda(); toast('success', 'Reserva reagendada correctamente.') },
    onError:   (e) => toast('error', getApiError(e)),
    onSettled: () => setRescheduleTarget(null),
  })

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openCancel     = (r: ReservaDataGridResponse) => setCancelTarget(r)
  const openReschedule = (r: ReservaDataGridResponse) => setRescheduleTarget(r)
  const openAttendance = (r: ReservaDataGridResponse) => setAttendanceTarget(r)

  const onPageChange = (p: number) => {
    setPage(p)
    setFilters((prev) => ({ ...prev, start: p - 1 }))
  }

  const onCalendarCellClick = (r: ReservaDataGridResponse) => {
    if (estadoNombre(r.estadoCodigo).toUpperCase() === 'PENDIENTE') {
      setFilters((p) => ({ ...p, fechaDesde: r.fecha, fechaHasta: r.fecha, start: 0 }))
      setPage(1)
      setViewMode('tabla')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fade-enter">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">Control de citas y gestión de asistencias</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-neutral-500" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <div className="flex rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <button
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'tabla' ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setViewMode('tabla')}
            >
              <LayoutList size={15} /> Tabla
            </button>
            <button
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'calendario' ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setViewMode('calendario')}
            >
              <CalendarDays size={15} /> Calendario
            </button>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Vista Tabla */}
      {viewMode === 'tabla' && (
        <>
          <div className="card mb-5">
            <div className="card-body flex flex-col sm:flex-row gap-3 flex-wrap items-end">
              <div className="flex flex-col gap-1">
                <label className="label">Fecha</label>
                <input
                  type="date"
                  value={filters.fechaDesde ?? ''}
                  onChange={(e) => {
                    const val = e.target.value || undefined
                    setPage(1)
                    setFilters((p) => ({ ...p, fechaDesde: val, fechaHasta: val, start: 0 }))
                  }}
                  className="input sm:w-44"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label">Estado</label>
                <select
                  value={filters.estadoCodigo ?? ''}
                  onChange={(e) => {
                    setPage(1)
                    setFilters((p) => ({ ...p, estadoCodigo: e.target.value || undefined, start: 0 }))
                  }}
                  className="input sm:w-44"
                >
                  <option value="">Todos los estados</option>
                  {estadosCatalog.map((e) => (
                    <option key={e.codigo} value={e.codigo}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn-secondary gap-2"
                onClick={() => { setPage(1); setFilters({ start: 0, limit: PAGE_SIZE, fechaDesde: today, fechaHasta: today }) }}
              >
                Hoy
              </button>
              {filters.fechaDesde && (
                <button
                  className="btn-ghost text-neutral-400 text-xs"
                  onClick={() => { setPage(1); setFilters({ start: 0, limit: PAGE_SIZE }) }}
                >
                  Ver todas
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <LoadingScreen />
          ) : reservations.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin citas"
              description={filters.fechaDesde
                ? `No hay citas para el ${displayDate(filters.fechaDesde)}.`
                : 'No hay citas registradas.'}
            />
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Especialista</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.reservaId}>
                        <td className="whitespace-nowrap">
                          <p className="text-sm font-medium text-neutral-800">{formatDate(r.fecha)}</p>
                          <p className="text-xs text-neutral-400">{r.hora ?? ''}</p>
                        </td>
                        <td>
                          <p className="font-medium text-sm text-neutral-800">{r.clienteNombre} {r.clienteApellido}</p>
                          <p className="text-xs text-neutral-400">{r.clienteTelefono}</p>
                        </td>
                        <td className="text-sm text-neutral-700">{r.servicioNombre}</td>
                        <td className="text-sm text-neutral-700">{r.especialistaNombre} {r.especialistaApellido}</td>
                        <td><StatusBadge estado={estadoNombre(r.estadoCodigo)} /></td>
                        <td>
                          <AccionesCita
                            reserva={r}
                            estadoLegible={estadoNombre(r.estadoCodigo)}
                            onAsistencia={openAttendance}
                            onReagendar={openReschedule}
                            onAnular={openCancel}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
            </>
          )}
        </>
      )}

      {/* Vista Calendario */}
      {viewMode === 'calendario' && (
        <CalendarView
          reservations={calendarReservations}
          loading={calendarLoading}
          weekBase={weekBase}
          onWeekChange={setWeekBase}
          onDayClick={onCalendarCellClick}
        />
      )}

      {/* Modales */}
      <AnularModal
        reserva={cancelTarget}
        motivos={motivos}
        loading={cancelReservation.isPending}
        onClose={() => setCancelTarget(null)}
        onSubmit={(data) => cancelTarget && cancelReservation.mutate({ reservaId: cancelTarget.reservaId, data })}
      />

      <ReagendarModal
        reserva={rescheduleTarget}
        loading={rescheduleReservation.isPending}
        onClose={() => setRescheduleTarget(null)}
        onSubmit={(data) => rescheduleTarget && rescheduleReservation.mutate({ reservaId: rescheduleTarget.reservaId, data })}
      />

      <ConfirmDialog
        open={!!attendanceTarget}
        onClose={() => setAttendanceTarget(null)}
        onConfirm={() => attendanceTarget && registerAttendance.mutate(attendanceTarget.reservaId)}
        title="Registrar asistencia"
        description={`¿Confirmas que "${attendanceTarget?.clienteNombre} ${attendanceTarget?.clienteApellido}" se presentó? El estado cambiará a EN ESPERA.`}
        confirmLabel="Registrar asistencia"
        loading={registerAttendance.isPending}
      />
    </div>
  )
}

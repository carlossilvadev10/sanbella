import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useReservationById, useReservationStatuses } from '@/hooks/useReservas'
import { formatDate, formatCurrency } from '@/utils/helpers'
import { LoadingScreen, Alert, StatusBadge } from '@/components/ui'
import InfoRow from './InfoRow'

// Si fecha viene como "2026-05-16T14:40:00" extrae "14:40"
const extractTimeFromDateTime = (fecha?: string): string | undefined => {
  if (!fecha) return undefined
  return fecha.match(/T(\d{2}:\d{2})/)?.[1]
}

export default function ReservationDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { data: reservation, isLoading, isError, error } = useReservationById(id)
  const { data: statuses = [] } = useReservationStatuses()
  const estadoNombre = (codigo?: string) =>
    statuses.find((s) => s.codigo === codigo)?.nombre ?? codigo

  if (isLoading) return <LoadingScreen />
  if (isError)   return (
    <div className="max-w-xl mx-auto mt-10">
      <Alert type="error" title="Error al cargar la reserva">{error?.message}</Alert>
    </div>
  )

  return (
    <div className="fade-enter max-w-2xl mx-auto">
      <button className="btn-ghost mb-4 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Reserva #{reservation?.reservaId ?? reservation?.id}</h1>
          <p className="page-subtitle font-mono">{reservation?.codigoVerificacion}</p>
        </div>
        <StatusBadge estado={estadoNombre(reservation?.estado ?? reservation?.estadoCodigo)} />
      </div>
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-neutral-700">Información de la reserva</h2>
        </div>
        <div className="card-body grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <InfoRow
            label="Cliente"
            value={`${reservation?.clienteNombre ?? reservation?.invitadoNombre ?? reservation?.nombres ?? ''} ${reservation?.clienteApellido ?? reservation?.invitadoApellido ?? reservation?.apellidos ?? ''}`.trim()}
          />
          <InfoRow label="Celular"   value={reservation?.clienteTelefono ?? reservation?.invitadoTelefono ?? reservation?.celular} />
          <InfoRow label="Email"     value={reservation?.clienteCorreo ?? reservation?.invitadoCorreo ?? reservation?.email} />
          {(reservation?.documento ?? reservation?.nroDocumento) && (
            <InfoRow label="Documento" value={reservation?.documento ?? reservation?.nroDocumento} />
          )}
          <InfoRow label="Servicio"  value={reservation?.servicio?.nombre ?? reservation?.servicioNombre} />
          <InfoRow
            label="Especialista"
            value={`${reservation?.especialista?.nombre ?? reservation?.especialistaNombre ?? ''} ${reservation?.especialistaApellido ?? ''}`.trim()}
          />
          <InfoRow label="Fecha" value={formatDate(reservation?.fecha)} />
          <InfoRow label="Hora"  value={reservation?.hora ?? reservation?.slot ?? extractTimeFromDateTime(reservation?.fecha)} />
          {(reservation?.tarifa ?? reservation?.monto)        != null && <InfoRow label="Monto total" value={formatCurrency(Number(reservation?.tarifa ?? reservation?.monto))} />}
          {reservation?.montoAdelanto                         != null && <InfoRow label="Adelanto"   value={formatCurrency(reservation.montoAdelanto)} />}
          {(reservation?.observacion ?? reservation?.nota)         && <InfoRow label="Observación" value={reservation?.observacion ?? reservation?.nota} className="col-span-2" />}
        </div>
      </div>
    </div>
  )
}


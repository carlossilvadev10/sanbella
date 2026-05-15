import { UserCheck, CalendarClock, XCircle, AlertTriangle } from 'lucide-react'
import { ReservaDataGridResponse } from '@/types'
import { isPenalizacion, isCitaSuperaTiempo } from './agenda.utils'

interface Props {
  reserva: ReservaDataGridResponse
  estadoLegible: string             // Nombre legible del estado, ej. "Pendiente"
  onAsistencia:   (r: ReservaDataGridResponse) => void
  onReagendar:    (r: ReservaDataGridResponse) => void
  onAnular:       (r: ReservaDataGridResponse) => void
}

export default function AccionesCita({ reserva, estadoLegible, onAsistencia, onReagendar, onAnular }: Props) {
  if (estadoLegible.toUpperCase() !== 'PENDIENTE') return null

  const willPenalize    = isPenalizacion(reserva)
  const hasExceededTime = isCitaSuperaTiempo(reserva)

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        className="btn-secondary btn-sm gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={() => onAsistencia(reserva)}
      >
        <UserCheck size={13} /> Asistencia
      </button>
      <button
        className="btn-secondary btn-sm gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
        onClick={() => onReagendar(reserva)}
      >
        <CalendarClock size={13} /> Reagendar
      </button>
      <button
        className="btn-secondary btn-sm gap-1 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => onAnular(reserva)}
      >
        <XCircle size={13} /> Anular
      </button>
      {(willPenalize || hasExceededTime) && (
        <span className="badge badge-yellow flex items-center gap-1 ml-1">
          <AlertTriangle size={10} />
          {hasExceededTime ? 'Superó tiempo' : 'Penalización posible'}
        </span>
      )}
    </div>
  )
}

import { CheckCircle2, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ReservaCreadaResponse } from '@/types'
import { ReservaFormState } from './nuevaReserva.utils'

interface Props {
  values:     ReservaFormState
  reservation: ReservaCreadaResponse | null
  selectedService?: Record<string, unknown>
  onReset:    () => void
}

export default function StepExito({ values, reservation, selectedService, onReset }: Props) {
  return (
    <div className="card-body flex flex-col items-center text-center py-10 gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold text-neutral-900">¡Reserva registrada!</h2>
        <p className="text-sm text-neutral-500 mt-2 max-w-xs">
          Tu cita fue agendada en estado PENDIENTE. Recibirás una confirmación por correo.
        </p>
      </div>
      {reservation?.codigoVerificacion && (
        <div className="px-6 py-3 rounded-xl bg-brand-50 border border-brand-200 text-center">
          <p className="text-xs text-brand-600 font-medium mb-1">Código de verificación</p>
          <p className="font-mono text-2xl font-bold text-brand-700 tracking-widest">
            {reservation.codigoVerificacion}
          </p>
          <p className="text-xs text-brand-500 mt-1">Guárdalo para gestionar tu cita</p>
        </div>
      )}
      <div className="text-xs text-neutral-400 space-y-0.5">
        {values.fecha && <p>📅 {values.fecha} — {values.slot}</p>}
        {selectedService && <p>✂️ {String(selectedService.nombre ?? '')}</p>}
      </div>
      <div className="flex gap-2 mt-2">
        <button className="btn-primary" onClick={onReset}>
          Nueva reserva
        </button>
        <Link to="/login" className="btn-secondary gap-2">
          <LogIn size={15} /> Iniciar sesión
        </Link>
      </div>
    </div>
  )
}

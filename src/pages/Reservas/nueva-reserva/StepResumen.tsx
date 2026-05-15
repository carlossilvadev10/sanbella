import { ChevronLeft, UserCheck } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import { Spinner, Alert } from '@/components/ui'
import { ReservaFormState } from './nuevaReserva.utils'

interface Props {
  values:           ReservaFormState
  selectedService?: Record<string, unknown>
  selectedSpecialist?: Record<string, unknown>
  errorMessage?:    string
  isLoading:        boolean
  onBack:           () => void
  onConfirm:        () => void
}

function Fila({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between items-baseline gap-4 text-sm">
      <dt className="text-neutral-500 font-medium flex-shrink-0">{label}</dt>
      <dd className="text-neutral-800 text-right">{value || '—'}</dd>
    </div>
  )
}

export default function StepResumen({
  values, selectedService, selectedSpecialist,
  errorMessage, isLoading, onBack, onConfirm,
}: Props) {
  const especialistaLabel = values.especialistaId === 'CUALQUIERA' || !values.especialistaId
    ? 'Cualquiera / Predeterminado'
    : selectedSpecialist
      ? `${String(selectedSpecialist.nombre ?? '')} ${String(selectedSpecialist.apellido ?? selectedSpecialist.apellidos ?? '')}`.trim()
      : values.especialistaId

  return (
    <div>
      <div className="card-header">
        <h2 className="text-base font-semibold text-neutral-800">Confirma tu reserva</h2>
      </div>
      <div className="card-body space-y-4">
        {errorMessage && <Alert type="error">{errorMessage}</Alert>}
        <div className="space-y-3">
          <Fila label="Servicio" value={String(selectedService?.nombre ?? values.servicioId ?? '')} />
          {(selectedService?.tarifa ?? selectedService?.precio) != null && (
            <Fila label="Precio" value={formatCurrency(Number(selectedService?.tarifa ?? selectedService?.precio))} />
          )}
          {selectedService?.duracion ? (
            <Fila label="Duración" value={`${String(selectedService.duracion)} min`} />
          ) : null}
          <Fila label="Especialista" value={especialistaLabel} />
          <Fila label="Fecha"        value={values.fecha} />
          <Fila label="Hora"         value={values.slot} />
          <div className="divider" />
          <Fila label="Cliente" value={`${values.nombres} ${values.apellidos}`} />
          <Fila label="Celular" value={values.celular} />
          <Fila label="Correo"  value={values.email} />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-neutral-100 flex justify-between">
        <button type="button" className="btn-ghost" onClick={onBack}>
          <ChevronLeft size={16} /> Atrás
        </button>
        <button className="btn-primary" onClick={onConfirm} disabled={isLoading}>
          {isLoading
            ? <Spinner size="sm" className="text-white" />
            : <><UserCheck size={16} /> Confirmar reserva</>}
        </button>
      </div>
    </div>
  )
}

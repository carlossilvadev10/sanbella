import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Modal, Alert, FormField, Spinner } from '@/components/ui'
import {
  ReservaDataGridResponse, ComboResponse, RescheduleRequest, SlotDisponibleResponse,
} from '@/types'
import { portalApi } from '@/api/reservaApi'
import { fromCombo } from '@/utils/apiHelpers'
import { formatDate } from '@/utils/helpers'

// Formulario local: el usuario elige fecha + especialista + slot.
// Al submit, lo transformamos al payload real { nuevaFecha, usuarioServicioId }.
const schemaReagendar = z.object({
  fecha:          z.string().min(1, 'Selecciona una fecha'),
  especialistaId: z.string().min(1, 'Selecciona un especialista'),
  slot:           z.string().min(1, 'Selecciona un horario'),
})

type Values = z.infer<typeof schemaReagendar>

interface Props {
  reserva: ReservaDataGridResponse | null
  loading: boolean
  onClose: () => void
  onSubmit: (data: RescheduleRequest) => void
}

export default function ReagendarModal({ reserva, loading, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ resolver: zodResolver(schemaReagendar) })
  const watchDate       = form.watch('fecha')
  const watchSpecialist = form.watch('especialistaId')

  useEffect(() => { if (reserva) form.reset() }, [reserva, form])

  const { data: specialists = [] } = useQuery({
    queryKey: ['specialists-reschedule', reserva?.servicioId],
    queryFn:  () => portalApi.loadEspecialistas({ servicioId: reserva?.servicioId }).then((r) => fromCombo(r.data)),
    enabled:  !!reserva?.servicioId,
  })

  // Sin especialistaId — el backend devuelve todos los slots con sus especialistas embebidos
  const { data: disponibilidad } = useQuery({
    queryKey: ['availability-reschedule', reserva?.reservaId, watchDate],
    queryFn:  () => portalApi.findDisponibilidad({
      servicioId: reserva!.servicioId,
      fecha:      watchDate,
    }).then((r) => r.data),
    enabled: !!(reserva && watchDate),
  })

  const allSlots: SlotDisponibleResponse[] = disponibilidad?.slots ?? []

  // Si eligió un especialista específico, filtra los slots que lo incluyan
  const slots = !watchSpecialist || watchSpecialist === 'CUALQUIERA'
    ? allSlots
    : allSlots.filter((s) =>
        s.especialistas?.some((e) => String(e.especialistaId) === String(watchSpecialist)),
      )

  const handleClose = () => { form.reset(); onClose() }

  const handleSubmit = (values: Values) => {
    // Buscamos el slot elegido para obtener el usuarioServicioId del especialista
    const slot = allSlots.find((s) => s.hora === values.slot)
    let usuarioServicioId: number | undefined

    if (values.especialistaId && values.especialistaId !== 'CUALQUIERA') {
      const esp = slot?.especialistas?.find(
        (e) => String(e.especialistaId) === String(values.especialistaId),
      )
      usuarioServicioId = esp?.usuarioServicioId
    } else {
      usuarioServicioId = slot?.especialistas?.[0]?.usuarioServicioId
    }

    if (!usuarioServicioId) {
      form.setError('slot', { message: 'No se pudo determinar el especialista para este horario.' })
      return
    }

    // Combinamos fecha + hora como datetime ISO
    const hora       = values.slot.length === 5 ? `${values.slot}:00` : values.slot
    const nuevaFecha = `${values.fecha}T${hora}`

    onSubmit({ nuevaFecha, usuarioServicioId })
  }

  return (
    <Modal
      open={!!reserva}
      onClose={handleClose}
      title="Reagendar cita"
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="text-white" /> : 'Confirmar reagendamiento'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {reserva && (
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <p><span className="font-medium">Cliente:</span> {reserva.clienteNombre} {reserva.clienteApellido}</p>
            <p><span className="font-medium">Servicio:</span> {reserva.servicioNombre}</p>
            <p><span className="font-medium">Fecha actual:</span> {formatDate(reserva.fecha)} {reserva.hora ?? ''}</p>
          </div>
        )}

        <FormField label="Nueva fecha" error={form.formState.errors.fecha?.message} required>
          <input
            {...form.register('fecha')}
            type="date"
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]}
            className={`input ${form.formState.errors.fecha ? 'input-error' : ''}`}
          />
        </FormField>

        <FormField label="Especialista" error={form.formState.errors.especialistaId?.message} required>
          <select
            {...form.register('especialistaId')}
            className={`input ${form.formState.errors.especialistaId ? 'input-error' : ''}`}
          >
            <option value="">Selecciona un especialista...</option>
            <option value="CUALQUIERA">Cualquiera / Predeterminado</option>
            {(specialists as ComboResponse[]).map((e) => (
              <option key={e.id} value={String(e.id)}>{e.nombre} {e.apellidos ?? ''}</option>
            ))}
          </select>
        </FormField>

        {watchDate && (
          <FormField label="Nuevo horario" error={form.formState.errors.slot?.message} required>
            {slots.length === 0 ? (
              <Alert type="warning">No hay horarios disponibles para esa fecha.</Alert>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => {
                  const val      = s.hora
                  const selected = form.watch('slot') === val
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => form.setValue('slot', val)}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-neutral-200 text-neutral-700 hover:border-brand-300'}`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            )}
          </FormField>
        )}
      </div>
    </Modal>
  )
}

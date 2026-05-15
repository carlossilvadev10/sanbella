import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Alert, FormField, Spinner } from '@/components/ui'
import { ReservaDataGridResponse, ComboResponse, CancelRequest } from '@/types'
import { isPenalizacion, isCitaSuperaTiempo } from './agenda.utils'

const schemaAnular = z.object({
  motivoAnulacionId: z.string().min(1, 'Selecciona un motivo'),
  observacion:       z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.motivoAnulacionId === 'OTROS' && !data.observacion?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Debes detallar el motivo', path: ['observacion'] })
  }
})

type AnularValues = z.infer<typeof schemaAnular>

interface Props {
  reserva: ReservaDataGridResponse | null
  motivos: ComboResponse[]
  loading: boolean
  onClose: () => void
  onSubmit: (data: CancelRequest) => void
}

export default function AnularModal({ reserva, motivos, loading, onClose, onSubmit }: Props) {
  const form = useForm<AnularValues>({ resolver: zodResolver(schemaAnular) })
  const watchMotivo = form.watch('motivoAnulacionId')

  // Reset form al cambiar de reserva
  useEffect(() => { if (reserva) form.reset() }, [reserva, form])

  const handleClose = () => { form.reset(); onClose() }

  const isOtros =
    watchMotivo === 'OTROS' ||
    motivos.find((m) => m.codigo === watchMotivo)?.nombre?.toLowerCase() === 'otros'

  return (
    <Modal
      open={!!reserva}
      onClose={handleClose}
      title="Anular cita"
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>Cancelar</button>
          <button
            className="btn-danger"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="text-white" /> : 'Anular cita'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {reserva && isPenalizacion(reserva) && (
          <Alert type="warning" title="Advertencia de penalización">
            Esta cita inicia en menos de 2 horas. Al anularla se sumará una falta al cliente.
          </Alert>
        )}
        {reserva && isCitaSuperaTiempo(reserva) && (
          <Alert type="warning" title="Tiempo de tolerancia superado">
            El horario de esta cita ya pasó. Anularla registrará una falta al cliente.
          </Alert>
        )}

        <FormField
          label="Motivo de anulación"
          error={form.formState.errors.motivoAnulacionId?.message}
          required
        >
          <select {...form.register('motivoAnulacionId')} className="input">
            <option value="">Selecciona un motivo...</option>
            {motivos.map((m) => <option key={m.id} value={m.codigo}>{m.nombre}</option>)}
          </select>
        </FormField>

        {isOtros && (
          <FormField
            label="Detalle del motivo"
            error={form.formState.errors.observacion?.message}
            required
          >
            <textarea
              {...form.register('observacion')}
              rows={3}
              className={`input resize-none ${form.formState.errors.observacion ? 'input-error' : ''}`}
              placeholder="Describe el motivo de la anulación..."
            />
          </FormField>
        )}
      </div>
    </Modal>
  )
}

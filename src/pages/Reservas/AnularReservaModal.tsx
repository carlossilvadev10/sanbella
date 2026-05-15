import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Alert, FormField, Spinner } from '@/components/ui'
import { ComboResponse, CancelRequest } from '@/types'

const schema = z.object({
  motivoAnulacionId: z.string().optional(),
  observacion:       z.string().optional(),
})

type Values = z.infer<typeof schema>

interface Props {
  open:    boolean
  motivos: ComboResponse[]
  loading: boolean
  onClose: () => void
  onSubmit: (data: CancelRequest) => void
}

export default function AnularReservaModal({ open, motivos, loading, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => { if (open) form.reset() }, [open, form])

  const handleClose = () => { form.reset(); onClose() }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Anular reserva"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>Cancelar</button>
          <button
            className="btn-danger"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="text-white" /> : 'Anular reserva'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert type="warning" title="¿Seguro de anular?">Esta acción no se puede revertir.</Alert>
        <FormField label="Motivo de anulación" error={form.formState.errors.motivoAnulacionId?.message}>
          <select {...form.register('motivoAnulacionId')} className="input">
            <option value="">Selecciona...</option>
            {motivos.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </FormField>
        <FormField label="Observación">
          <textarea
            {...form.register('observacion')}
            rows={2}
            className="input resize-none"
            placeholder="Detalles adicionales..."
          />
        </FormField>
      </div>
    </Modal>
  )
}

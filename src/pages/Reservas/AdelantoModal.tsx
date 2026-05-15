import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, FormField, Spinner } from '@/components/ui'
import { ComboResponse, AdvancePaymentRequest } from '@/types'

const schema = z.object({
  metodoPagoId:  z.string().min(1, 'Selecciona el método de pago'),
  montoAdelanto: z.string().min(1, 'Ingresa el monto'),
})

type Values = z.infer<typeof schema>

interface Props {
  open:           boolean
  paymentMethods: ComboResponse[]
  loading:        boolean
  onClose:        () => void
  onSubmit:       (data: AdvancePaymentRequest) => void
}

export default function AdelantoModal({ open, paymentMethods, loading, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => { if (open) form.reset() }, [open, form])

  const handleClose = () => { form.reset(); onClose() }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Confirmar adelanto"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="text-white" /> : 'Confirmar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Método de pago" error={form.formState.errors.metodoPagoId?.message} required>
          <select {...form.register('metodoPagoId')} className="input">
            <option value="">Selecciona...</option>
            {paymentMethods.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </FormField>
        <FormField label="Monto recibido" error={form.formState.errors.montoAdelanto?.message} required>
          <input
            {...form.register('montoAdelanto')}
            type="number" step="0.01" min="0"
            className="input"
            placeholder="0.00"
          />
        </FormField>
      </div>
    </Modal>
  )
}

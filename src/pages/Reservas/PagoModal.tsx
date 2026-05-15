import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, FormField, Spinner } from '@/components/ui'
import { ComboResponse, PaymentRequest } from '@/types'

const schema = z.object({
  metodoPagoCodigo: z.string().min(1, 'Selecciona el método de pago'),
  montoTotal:       z.string().min(1, 'Ingresa el monto total'),
  aplicarDescuento: z.boolean().optional(),
  observacion:      z.string().optional(),
})

type Values = z.infer<typeof schema>

interface Props {
  open:           boolean
  paymentMethods: ComboResponse[]
  loading:        boolean
  onClose:        () => void
  onSubmit:       (data: PaymentRequest) => void
}

export default function PagoModal({ open, paymentMethods, loading, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => { if (open) form.reset() }, [open, form])

  const handleClose = () => { form.reset(); onClose() }

  const handleSubmit = (values: Values) => {
    onSubmit({
      metodoPagoCodigo: values.metodoPagoCodigo,
      montoTotal:       Number(values.montoTotal),
      aplicarDescuento: !!values.aplicarDescuento,
      observacion:      values.observacion || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Registrar pago final"
      footer={
        <>
          <button className="btn-secondary" onClick={handleClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="text-white" /> : 'Registrar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Método de pago" error={form.formState.errors.metodoPagoCodigo?.message} required>
          <select {...form.register('metodoPagoCodigo')} className="input">
            <option value="">Selecciona...</option>
            {paymentMethods.map((m) => <option key={m.id} value={m.codigo}>{m.nombre}</option>)}
          </select>
        </FormField>
        <FormField label="Monto total" error={form.formState.errors.montoTotal?.message} required>
          <input
            {...form.register('montoTotal')}
            type="number" step="0.01" min="0"
            className="input"
            placeholder="0.00"
          />
        </FormField>
        <FormField label="">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" {...form.register('aplicarDescuento')} className="w-4 h-4 rounded accent-brand-600" />
            <span className="text-sm text-neutral-700">Aplicar descuento (por cumpleaños u otro)</span>
          </label>
        </FormField>
        <FormField label="Observación">
          <textarea
            {...form.register('observacion')}
            rows={2}
            className="input resize-none"
            placeholder="Detalles del pago..."
          />
        </FormField>
      </div>
    </Modal>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { FormField } from '@/components/ui'
import { ReservaFormState } from './nuevaReserva.utils'

const schema = z.object({
  nombres:          z.string().min(2, 'Ingresa tus nombres'),
  apellidos:        z.string().min(2, 'Ingresa tus apellidos'),
  celular:          z.string().min(9, 'Celular inválido').max(12),
  email:            z.string().email('Correo inválido'),
  codigoValidacion: z.string().optional(),
})

type Values = z.infer<typeof schema>

interface Props {
  values: ReservaFormState
  onBack: () => void
  onNext: (next: Values) => void
}

export default function StepDatos({ values, onBack, onNext }: Props) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres:          values.nombres          ?? '',
      apellidos:        values.apellidos        ?? '',
      celular:          values.celular          ?? '',
      email:            values.email            ?? '',
      codigoValidacion: values.codigoValidacion ?? '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      <div className="card-header">
        <h2 className="text-base font-semibold text-neutral-800">Tus datos</h2>
      </div>
      <div className="card-body space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nombres" error={form.formState.errors.nombres?.message} required>
            <input
              {...form.register('nombres')}
              className={`input ${form.formState.errors.nombres ? 'input-error' : ''}`}
              placeholder="Ana"
            />
          </FormField>
          <FormField label="Apellidos" error={form.formState.errors.apellidos?.message} required>
            <input
              {...form.register('apellidos')}
              className={`input ${form.formState.errors.apellidos ? 'input-error' : ''}`}
              placeholder="García"
            />
          </FormField>
        </div>

        <FormField label="Celular" error={form.formState.errors.celular?.message} required>
          <input
            {...form.register('celular')}
            type="tel"
            className={`input ${form.formState.errors.celular ? 'input-error' : ''}`}
            placeholder="999 999 999"
          />
        </FormField>

        <FormField label="Correo electrónico" error={form.formState.errors.email?.message} required>
          <input
            {...form.register('email')}
            type="email"
            className={`input ${form.formState.errors.email ? 'input-error' : ''}`}
            placeholder="ana@correo.com"
          />
        </FormField>

        <FormField
          label="Código de validación"
          error={form.formState.errors.codigoValidacion?.message}
          hint="Se enviará un código a tu correo para confirmar tu identidad"
        >
          <input
            {...form.register('codigoValidacion')}
            className="input font-mono tracking-widest"
            placeholder="Ingresa el código recibido (si aplica)"
            autoComplete="one-time-code"
          />
        </FormField>
      </div>
      <div className="px-6 py-4 border-t border-neutral-100 flex justify-between">
        <button type="button" className="btn-ghost" onClick={onBack}>
          <ChevronLeft size={16} /> Atrás
        </button>
        <button type="submit" className="btn-primary">Ver resumen <ChevronRight size={16} /></button>
      </div>
    </form>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { portalApi } from '@/api/reservaApi'
import { FormField, Spinner, Alert } from '@/components/ui'
import type { SlotDisponibleResponse } from '@/types'
import {
  ReservaFormState, MAX_DIAS, MIN_DATE, MAX_DATE,
  parsePortalResponse, getSpecialistId,
} from './nuevaReserva.utils'

const schema = z.object({
  fecha:          z.string().min(1, 'Selecciona una fecha'),
  especialistaId: z.string().min(1, 'Selecciona un especialista'),
  slot:           z.string().min(1, 'Selecciona un horario disponible'),
})

type Values = z.infer<typeof schema>

interface Props {
  values:    ReservaFormState
  onBack:    () => void
  onNext:    (next: Values) => void
}

export default function StepHorario({ values, onBack, onNext }: Props) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha:          values.fecha          ?? '',
      especialistaId: values.especialistaId ?? '',
      slot:           values.slot           ?? '',
    },
  })

  const watchFecha       = form.watch('fecha')
  const watchEspecialista = form.watch('especialistaId')
  const watchSlot        = form.watch('slot')

  const { data: specialists = [], isLoading: loadingSpecialists } = useQuery({
    queryKey: ['portal-specialists', values.servicioId],
    queryFn:  () => portalApi.loadEspecialistas({ servicioId: Number(values.servicioId) })
      .then((r) => parsePortalResponse(r.data)),
    enabled: !!values.servicioId,
  })

  // findDisponibilidad solo acepta servicioId + fecha (sin especialistaId)
  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ['availability', values.servicioId, watchFecha],
    queryFn:  () => portalApi.findDisponibilidad({
      servicioId: Number(values.servicioId!),
      fecha:      watchFecha,
    }).then((r) => r.data),
    enabled: !!(values.servicioId && watchFecha),
  })

  const allSlots: SlotDisponibleResponse[] = availability?.slots ?? []

  // El id devuelto por loadEspecialista puede coincidir con especialistaId
  // o con usuarioServicioId — chequeamos ambos para ser resilientes
  const slots = !watchEspecialista || watchEspecialista === 'CUALQUIERA'
    ? allSlots
    : allSlots.filter((s) =>
        s.especialistas?.some(
          (e) =>
            String(e.especialistaId)    === String(watchEspecialista) ||
            String(e.usuarioServicioId) === String(watchEspecialista),
        ),
      )

  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      <div className="card-header">
        <h2 className="text-base font-semibold text-neutral-800">Elige fecha y horario</h2>
      </div>
      <div className="card-body space-y-4">
        <FormField
          label="Fecha"
          error={form.formState.errors.fecha?.message}
          required
          hint={`Disponible hasta ${MAX_DIAS} días desde hoy`}
        >
          <input
            {...form.register('fecha')}
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            onChange={(e) => {
              form.setValue('fecha', e.target.value)
              form.setValue('slot', '')
            }}
            className={`input ${form.formState.errors.fecha ? 'input-error' : ''}`}
          />
        </FormField>

        <FormField
          label="Especialista"
          error={form.formState.errors.especialistaId?.message}
          required
        >
          <select
            {...form.register('especialistaId')}
            onChange={(e) => {
              form.setValue('especialistaId', e.target.value)
              form.setValue('slot', '')
            }}
            disabled={loadingSpecialists}
            className={`input ${form.formState.errors.especialistaId ? 'input-error' : ''}`}
          >
            <option value="">{loadingSpecialists ? 'Cargando...' : 'Selecciona...'}</option>
            <option value="CUALQUIERA">Cualquiera / Predeterminado</option>
            {specialists.map((e) => {
              const id = getSpecialistId(e)
              const label = `${String(e.nombre ?? '')} ${String(e.apellido ?? e.apellidos ?? '')}`.trim()
              return <option key={String(id)} value={String(id)}>{label}</option>
            })}
          </select>
        </FormField>

        {watchFecha && watchEspecialista && (
          <FormField label="Horario disponible" error={form.formState.errors.slot?.message} required>
            {loadingAvailability ? (
              <div className="flex items-center gap-2 text-sm text-neutral-500 py-2">
                <Spinner size="sm" /> Consultando disponibilidad...
              </div>
            ) : slots.length === 0 ? (
              <Alert type="warning">No hay horarios disponibles para esta fecha. Prueba otro día.</Alert>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => {
                  const val      = slot.hora
                  const selected = watchSlot === val
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => form.setValue('slot', val)}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all
                        ${selected
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:border-brand-300'}`}
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
      <div className="px-6 py-4 border-t border-neutral-100 flex justify-between">
        <button type="button" className="btn-ghost" onClick={onBack}>
          <ChevronLeft size={16} /> Atrás
        </button>
        <button type="submit" className="btn-primary">Continuar <ChevronRight size={16} /></button>
      </div>
    </form>
  )
}

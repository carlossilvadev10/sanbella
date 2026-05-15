import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Clock, DollarSign, AlignLeft } from 'lucide-react'
import { portalApi } from '@/api/reservaApi'
import { formatCurrency } from '@/utils/helpers'
import { FormField } from '@/components/ui'
import {
  ReservaFormState, parsePortalResponse, getCategoryId, getServiceId,
} from './nuevaReserva.utils'

const schema = z.object({
  categoriaId: z.string().min(1, 'Selecciona una categoría'),
  servicioId:  z.string().min(1, 'Selecciona un servicio'),
})

type Values = z.infer<typeof schema>

interface Props {
  values:   ReservaFormState
  onNext:   (next: Values) => void
}

export default function StepServicio({ values, onNext }: Props) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoriaId: values.categoriaId ?? '',
      servicioId:  values.servicioId  ?? '',
    },
  })
  const watchCategoria = form.watch('categoriaId')

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['portal-categories'],
    queryFn:  () => portalApi.loadCategorias().then((r) => parsePortalResponse(r.data)),
  })

  // /api/load devuelve TODOS los servicios — filtramos por categoría en frontend
  const { data: allServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ['portal-services'],
    queryFn:  () => portalApi.loadServicios().then((r) => parsePortalResponse(r.data)),
  })

  const services = allServices.filter((s) => String(s.categoriaId) === String(watchCategoria))
  const selectedService = services.find((s) => String(getServiceId(s)) === String(form.watch('servicioId')))

  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      <div className="card-header">
        <h2 className="text-base font-semibold text-neutral-800">Elige tu servicio</h2>
      </div>
      <div className="card-body space-y-4">
        <FormField label="Categoría" error={form.formState.errors.categoriaId?.message} required>
          <select
            {...form.register('categoriaId')}
            onChange={(e) => {
              form.setValue('categoriaId', e.target.value)
              form.setValue('servicioId', '')
            }}
            className={`input ${form.formState.errors.categoriaId ? 'input-error' : ''}`}
          >
            <option value="">{loadingCategories ? 'Cargando...' : 'Selecciona una categoría...'}</option>
            {categories.map((c) => {
              const id = getCategoryId(c)
              return <option key={String(id)} value={String(id)}>{String(c.nombre ?? '')}</option>
            })}
          </select>
        </FormField>

        <FormField label="Servicio" error={form.formState.errors.servicioId?.message} required>
          <select
            {...form.register('servicioId')}
            disabled={!watchCategoria}
            className={`input ${form.formState.errors.servicioId ? 'input-error' : ''}`}
          >
            <option value="">
              {!watchCategoria
                ? 'Primero elige una categoría'
                : loadingServices ? 'Cargando...' : 'Selecciona un servicio...'}
            </option>
            {services.map((s) => {
              const id = getServiceId(s)
              return <option key={String(id)} value={String(id)}>{String(s.nombre ?? '')}</option>
            })}
          </select>
        </FormField>

        {selectedService && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 space-y-2">
            <p className="font-semibold text-brand-800">{String(selectedService.nombre ?? '')}</p>
            {selectedService.descripcion ? (
              <p className="text-xs text-brand-600 flex gap-1.5">
                <AlignLeft size={13} className="flex-shrink-0 mt-0.5" />
                {String(selectedService.descripcion)}
              </p>
            ) : null}
            <div className="flex gap-4 text-xs text-brand-700 font-medium">
              {(selectedService.tarifa ?? selectedService.precio) != null && (
                <span className="flex items-center gap-1">
                  <DollarSign size={13} />
                  {formatCurrency(Number(selectedService.tarifa ?? selectedService.precio))}
                </span>
              )}
              {selectedService.duracion ? (
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {String(selectedService.duracion)} min
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-neutral-100 flex justify-end">
        <button type="submit" className="btn-primary">Continuar <ChevronRight size={16} /></button>
      </div>
    </form>
  )
}

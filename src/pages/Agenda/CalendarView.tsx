import { useMemo } from 'react'
import { addDays, format, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { ReservaDataGridResponse } from '@/types'
import { formatDate } from '@/utils/helpers'

interface Props {
  reservations: ReservaDataGridResponse[]
  loading:      boolean
  weekBase:     Date
  onWeekChange: (date: Date) => void
  onDayClick?:  (reserva: ReservaDataGridResponse) => void
}

export default function CalendarView({ reservations, loading, weekBase, onWeekChange, onDayClick }: Props) {
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekBase, i)),
    [weekBase],
  )

  const reservasPorDia = (dia: Date) =>
    reservations.filter((r) => {
      try { return isSameDay(parseISO(r.fecha), dia) } catch { return false }
    })

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <button className="btn-ghost btn-sm" onClick={() => onWeekChange(addDays(weekBase, -7))}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-neutral-800">
          Semana del {format(weekBase, "d 'de' MMMM", { locale: es })}
        </span>
        <button className="btn-ghost btn-sm" onClick={() => onWeekChange(addDays(weekBase, 7))}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="card-body p-0">
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {weekDays.map((dia) => {
            const esHoy = isSameDay(dia, new Date())
            return (
              <div
                key={dia.toISOString()}
                className={`text-center py-2 text-xs font-semibold border-r last:border-r-0 border-neutral-100 ${esHoy ? 'bg-brand-50 text-brand-700' : 'text-neutral-500'}`}
              >
                <p>{format(dia, 'EEE', { locale: es }).toUpperCase()}</p>
                <p className={`text-lg font-display ${esHoy ? 'text-brand-600' : 'text-neutral-800'}`}>
                  {format(dia, 'd')}
                </p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-7 min-h-64">
          {weekDays.map((dia) => {
            const citas = reservasPorDia(dia)
            const esHoy = isSameDay(dia, new Date())
            return (
              <div
                key={dia.toISOString()}
                className={`border-r last:border-r-0 border-neutral-100 p-1.5 space-y-1 min-h-32 ${esHoy ? 'bg-brand-50/30' : ''}`}
              >
                {loading ? (
                  <div className="flex justify-center pt-4"><Spinner size="sm" /></div>
                ) : citas.length === 0 ? (
                  <p className="text-xs text-neutral-300 text-center pt-4">—</p>
                ) : (
                  citas.map((r) => (
                    <button
                      key={r.reservaId}
                      type="button"
                      onClick={() => onDayClick?.(r)}
                      className={`w-full text-left rounded p-1.5 text-xs cursor-pointer transition-opacity hover:opacity-80
                        ${(r.estadoCodigo || '').toUpperCase() === 'PENDIENTE'  ? 'bg-amber-100 border-l-2 border-amber-400' :
                          (r.estadoCodigo || '').toUpperCase() === 'EN ESPERA'  ? 'bg-blue-100 border-l-2 border-blue-400' :
                          (r.estadoCodigo || '').toUpperCase() === 'COMPLETADO' ? 'bg-emerald-100 border-l-2 border-emerald-400' :
                          (r.estadoCodigo || '').toUpperCase() === 'ANULADO'    ? 'bg-red-100 border-l-2 border-red-300 opacity-60' :
                          'bg-neutral-100 border-l-2 border-neutral-300'}`}
                    >
                      <p className="font-semibold truncate">{r.hora ?? formatDate(r.fecha)}</p>
                      <p className="truncate text-neutral-700">{r.clienteNombre} {r.clienteApellido}</p>
                      <p className="truncate text-neutral-500">{r.servicioNombre}</p>
                    </button>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { startOfWeek }

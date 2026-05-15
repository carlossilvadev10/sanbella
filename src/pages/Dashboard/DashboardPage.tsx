import { CalendarCheck, Users, Clock, CheckCircle2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useReservations, useReservationStatuses } from '@/hooks/useReservas'
import { useUsers } from '@/hooks/useUsuarios'
import { format } from 'date-fns'

export default function DashboardPage() {
  const user  = useAuthStore((s) => s.user)
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: statuses = [] } = useReservationStatuses()
  const codeBy = (nombre: string) =>
    statuses.find((s) => s.nombre.toUpperCase() === nombre.toUpperCase())?.codigo
  const codigoPendiente   = codeBy('Pendiente')
  const codigoAdelantado  = codeBy('Adelantado') ?? codeBy('Confirmada') ?? codeBy('Confirmado')

  const { data: todayReservations }     = useReservations({ start: 0, limit: 1, fechaDesde: today, fechaHasta: today })
  const { data: pendingReservations }   = useReservations({ start: 0, limit: 1, estadoCodigo: codigoPendiente })
  const { data: confirmedReservations } = useReservations({ start: 0, limit: 1, estadoCodigo: codigoAdelantado })
  const { data: usersData }             = useUsers({ start: 0, limit: 1, habilitado: true })

  const stats = [
    { label: 'Reservas hoy',     icon: CalendarCheck, value: todayReservations?.totalCount,     color: 'text-brand-600',   bg: 'bg-brand-50'   },
    { label: 'Pendientes',       icon: Clock,         value: pendingReservations?.totalCount,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
    { label: 'Confirmadas',      icon: CheckCircle2,  value: confirmedReservations?.totalCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Usuarios activos', icon: Users,         value: usersData?.totalCount,             color: 'text-blue-600',    bg: 'bg-blue-50'    },
  ]

  return (
    <div className="fade-enter">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}. Resumen del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, icon: Icon, value, color, bg }) => (
          <div key={label} className="card">
            <div className="card-body flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-2xl font-display font-semibold text-neutral-900">
                  {value != null ? value : '—'}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-neutral-800">Accesos rápidos</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/reservations" className="btn-secondary justify-start gap-3 py-3">
            <CalendarCheck size={18} className="text-brand-600" />
            <span>Ver reservas</span>
          </a>
          <a href="/reservations/confirm" className="btn-secondary justify-start gap-3 py-3">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Confirmar adelanto</span>
          </a>
          <a href="/users" className="btn-secondary justify-start gap-3 py-3">
            <Users size={18} className="text-blue-600" />
            <span>Gestionar usuarios</span>
          </a>
        </div>
      </div>
    </div>
  )
}

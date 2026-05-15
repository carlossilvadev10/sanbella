import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CalendarCheck, Eye, RefreshCw } from 'lucide-react'
import { useReservations, useReservationStatuses } from '@/hooks/useReservas'
import { ReservationFilters, CollectionResponse, ReservaDataGridResponse } from '@/types'
import { formatDate, formatCurrency } from '@/utils/helpers'
import { LoadingScreen, EmptyState, StatusBadge, Pagination } from '@/components/ui'

const PAGE_SIZE = 15

const INITIAL_FILTERS: ReservationFilters = {
  start: 0,
  limit: PAGE_SIZE,
}

export default function ReservationsListPage() {
  const navigate                          = useNavigate()
  const [filters,      setFilters]        = useState<ReservationFilters>(INITIAL_FILTERS)
  const [searchInput,  setSearchInput]    = useState('')
  const [page,         setPage]           = useState(1)

  const { data, isLoading, isFetching, refetch } = useReservations(filters)
  const { data: statuses = [] }                   = useReservationStatuses()

  const collection   = data as CollectionResponse<ReservaDataGridResponse> | undefined
  const reservations = [...(collection?.elements ?? [])].sort((a, b) => b.reservaId - a.reservaId)
  const totalCount   = collection?.totalCount ?? 0
  const totalPages   = Math.ceil(totalCount / PAGE_SIZE) || 1

  const estadoNombre = (codigo: string) =>
    statuses.find((s) => s.codigo === codigo)?.nombre ?? codigo

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setFilters((prev) => ({ ...prev, clienteNombre: searchInput || undefined, start: 0 }))
  }

  const onPageChange = (p: number) => {
    setPage(p)
    setFilters((prev) => ({ ...prev, start: p - 1 }))
  }

  const onFilterChange = (key: keyof ReservationFilters, value: string) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value || undefined, start: 0 }))
  }

  const onClear = () => {
    setFilters(INITIAL_FILTERS)
    setSearchInput('')
    setPage(1)
  }

  const hasActiveFilters = filters.estadoCodigo || filters.fechaDesde ||
    filters.fechaHasta || filters.clienteNombre

  return (
    <div className="fade-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Reservas</h1>
          <p className="page-subtitle">Bandeja de todas las reservas del sistema</p>
        </div>
        <button className="btn-ghost gap-2 text-neutral-500" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="card mb-5">
        <div className="card-body flex flex-col sm:flex-row gap-3 flex-wrap">
          <form onSubmit={onSearch} className="flex gap-2 flex-1">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input"
              placeholder="Buscar por nombre del cliente..."
            />
            <button type="submit" className="btn-secondary gap-2">
              <Search size={15} /> Buscar
            </button>
          </form>
          <select
            value={filters.estadoCodigo ?? ''}
            onChange={(e) => onFilterChange('estadoCodigo', e.target.value)}
            className="input sm:w-44"
          >
            <option value="">Todos los estados</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.codigo}>{s.nombre}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.fechaDesde ?? ''}
            onChange={(e) => onFilterChange('fechaDesde', e.target.value)}
            className="input sm:w-40"
          />
          <input
            type="date"
            value={filters.fechaHasta ?? ''}
            onChange={(e) => onFilterChange('fechaHasta', e.target.value)}
            className="input sm:w-40"
          />
          {hasActiveFilters && (
            <button className="btn-ghost text-xs" onClick={onClear}>Limpiar</button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Sin reservas"
          description="No se encontraron reservas con los filtros aplicados."
        />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Especialista</th>
                  <th>Fecha</th>
                  <th>Tarifa</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.reservaId}>
                    <td className="text-xs text-neutral-400 font-mono">{r.reservaId}</td>
                    <td className="font-mono text-xs font-medium text-neutral-700">
                      {r.codigoVerificacion}
                    </td>
                    <td>
                      <p className="font-medium text-neutral-800 text-sm">
                        {r.clienteNombre} {r.clienteApellido}
                      </p>
                      <p className="text-xs text-neutral-400">{r.clienteTelefono}</p>
                    </td>
                    <td className="text-neutral-700">{r.servicioNombre}</td>
                    <td className="text-neutral-700">
                      {r.especialistaNombre} {r.especialistaApellido}
                    </td>
                    <td className="text-xs text-neutral-600 whitespace-nowrap">
                      {formatDate(r.fecha)}
                    </td>
                    <td className="text-sm">
                      {r.tarifa != null ? formatCurrency(r.tarifa) : '—'}
                    </td>
                    <td><StatusBadge estado={estadoNombre(r.estadoCodigo)} /></td>
                    <td>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => navigate(`/reservations/${r.reservaId}`)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
        </>
      )}
    </div>
  )
}

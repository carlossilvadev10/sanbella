import { clsx, type ClassValue } from 'clsx'

export const cn = (...classes: ClassValue[]): string => clsx(...classes)

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export const formatCurrency = (amount?: number | null): string => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency', currency: 'PEN',
  }).format(amount)
}

export const getApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; error?: string } }; message?: string }
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Ocurrió un error inesperado'
    )
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}

const STATUS_BADGE_MAP: Record<string, string> = {
  PENDIENTE:  'badge-yellow',
  CONFIRMADO: 'badge-blue',
  COMPLETADO: 'badge-green',
  ANULADO:    'badge-red',
  PAGADO:     'badge-green',
  ACTIVO:     'badge-green',
  INACTIVO:   'badge-gray',
  BLOQUEADO:  'badge-red',
}

export const getStatusBadgeClass = (status?: string): string =>
  STATUS_BADGE_MAP[status?.toUpperCase() ?? ''] || 'badge-gray'

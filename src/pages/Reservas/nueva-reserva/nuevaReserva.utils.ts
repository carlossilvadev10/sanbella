import { addDays, format } from 'date-fns'

export const MAX_DIAS  = 15
export const MIN_DATE  = format(new Date(), 'yyyy-MM-dd')
export const MAX_DATE  = format(addDays(new Date(), MAX_DIAS), 'yyyy-MM-dd')

export interface ReservaFormState {
  categoriaId?: string
  servicioId?: string
  fecha?: string
  especialistaId?: string
  slot?: string
  nombres?: string
  apellidos?: string
  celular?: string
  email?: string
  codigoValidacion?: string
}

// Acepta ComboBaseResponse { list:[] }, CollectionResponse { elements:[] } o array directo
export const parsePortalResponse = (data: unknown): Record<string, unknown>[] => {
  if (Array.isArray(data)) return data
  const d = data as Record<string, unknown>
  if (Array.isArray(d?.list))     return d.list     as Record<string, unknown>[]
  if (Array.isArray(d?.elements)) return d.elements as Record<string, unknown>[]
  return []
}

// Los endpoints devuelven distintos nombres de id (id, categoriaId, servicioId, especialistaId)
export const getCategoryId   = (c: Record<string, unknown>) => (c.categoriaId    ?? c.id) as number | string
export const getServiceId    = (s: Record<string, unknown>) => (s.servicioId     ?? s.id) as number | string
export const getSpecialistId = (e: Record<string, unknown>) => (e.especialistaId ?? e.usuarioId ?? e.id) as number | string

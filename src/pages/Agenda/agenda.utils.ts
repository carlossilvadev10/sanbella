import { differenceInMinutes } from 'date-fns'
import { ReservaDataGridResponse, ComboResponse } from '@/types'

// Reglas de negocio HU-OPER-005
export const TOLERANCE_MINUTES = 120 // 2 horas

export const MOTIVOS_ANULACION_DEFAULT: ComboResponse[] = [
  { id: 1, codigo: 'CLIENTE_CANCELO',     nombre: 'Cliente canceló' },
  { id: 2, codigo: 'INCONVENIENTE_LOCAL', nombre: 'Inconveniente en el local' },
  { id: 3, codigo: 'OTROS',               nombre: 'Otros' },
]

// Convierte "2026-05-07" (input HTML) a ISO datetime para el API
export const toApiDateStart = (iso?: string): string | undefined =>
  iso ? `${iso}T00:00:00` : undefined

export const toApiDateEnd = (iso?: string): string | undefined =>
  iso ? `${iso}T23:59:59` : undefined

// Muestra "2026-05-07" como "07/05/2026" en mensajes (timezone-safe)
export const displayDate = (iso?: string): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// La cita inicia dentro del tiempo de tolerancia → anularla penaliza al cliente
export const isPenalizacion = (reserva: ReservaDataGridResponse | null): boolean => {
  if (!reserva?.fecha || !reserva?.hora) return false
  try {
    const citaDate = new Date(`${reserva.fecha}T${reserva.hora}`)
    const diff = differenceInMinutes(citaDate, new Date())
    return diff < TOLERANCE_MINUTES && diff > 0
  } catch { return false }
}

// La hora de la cita ya pasó
export const isCitaSuperaTiempo = (reserva: ReservaDataGridResponse | null): boolean => {
  if (!reserva?.fecha || !reserva?.hora) return false
  try {
    const citaDate = new Date(`${reserva.fecha}T${reserva.hora}`)
    return new Date() > citaDate
  } catch { return false }
}

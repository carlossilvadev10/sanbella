import { ComboBaseResponse, ComboResponse, CollectionResponse } from '@/types'

/** Extracts list array from ComboBaseResponse { list: [], size } */
export const fromCombo = (data: ComboBaseResponse): ComboResponse[] => data?.list ?? []

/** Extracts elements array from CollectionResponse<T> { elements: [], totalCount } */
export const fromCollection = <T>(data: CollectionResponse<T>): T[] => data?.elements ?? []

/** Strips undefined / empty string / null fields before sending to API */
export function cleanFilters(filters: object): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== null) {
      result[key] = value
    }
  }
  return result
}

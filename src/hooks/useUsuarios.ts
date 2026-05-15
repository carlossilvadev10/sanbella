import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuarioApi } from '@/api/usuarioApi'
import { UserFilters, UserFormValues, CollectionResponse, UsuarioResponse } from '@/types'
import { fromCollection, fromCombo } from '@/utils/apiHelpers'

export const USER_KEYS = {
  all:    ['users'] as const,
  list:   (filters: UserFilters) => ['users', 'list', filters] as const,
  detail: (id: number)           => ['users', 'detail', id] as const,
  roles:  ['roles'] as const,
}

/** Strip undefined/empty fields before sending to API */
function cleanFilters(filters: object): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== null) {
      cleaned[key] = value
    }
  }
  return cleaned
}

export const useUsers = (filters: UserFilters) =>
  useQuery({
    queryKey: USER_KEYS.list(filters),
    queryFn:  () => usuarioApi.find(cleanFilters(filters)).then((r) =>
      r.data as CollectionResponse<UsuarioResponse>
    ),
    placeholderData: (prev) => prev,
  })

export const useClients = (filters: Record<string, unknown>) =>
  useQuery({
    queryKey: ['clients', 'list', filters],
    queryFn:  () => usuarioApi.findClientes(cleanFilters(filters)).then((r) =>
      r.data as CollectionResponse<UsuarioResponse>
    ),
    placeholderData: (prev) => prev,
  })

export const useUserById = (userId?: number) =>
  useQuery({
    queryKey: USER_KEYS.detail(userId!),
    queryFn:  () => usuarioApi.get(userId!).then((r) => r.data as UsuarioResponse),
    enabled:  !!userId,
  })

export const useRoles = () =>
  useQuery({
    queryKey: USER_KEYS.roles,
    queryFn:  () => usuarioApi.init().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

export const useSaveUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserFormValues) =>
      usuarioApi.saveOrUpdate(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => usuarioApi.delete(userId).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  })
}

export const useResetUserPassword = () =>
  useMutation({
    mutationFn: (userId: number) => usuarioApi.updatePassword(userId).then((r) => r.data),
  })

export const useLiftSuspension = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => usuarioApi.suspension(userId).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  })
}

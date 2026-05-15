import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, KeyRound, ShieldOff, RefreshCw, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import {
  useUsers, useRoles, useSaveUser, useDeleteUser,
  useResetUserPassword, useLiftSuspension,
} from '@/hooks/useUsuarios'
import { comunApi } from '@/api/reservaApi'
import { fromCombo } from '@/utils/apiHelpers'
import { getApiError } from '@/utils/helpers'
import {
  LoadingScreen, EmptyState, StatusBadge,
  ConfirmDialog, Pagination, ToastContainer, useToast,
} from '@/components/ui'
import {
  UserFilters, UserFormValues, CollectionResponse,
  UsuarioResponse, ComboResponse,
} from '@/types'

import UsuarioFormModal from './UsuarioFormModal'

const PAGE_SIZE = 15

const STATUS_FALLBACK: ComboResponse[] = [
  { id: 1, codigo: 'ACTIVO',    nombre: 'Activo'    },
  { id: 2, codigo: 'INACTIVO',  nombre: 'Inactivo'  },
  { id: 3, codigo: 'BLOQUEADO', nombre: 'Bloqueado' },
]

const FRIENDLY_LABEL: Record<string, string> = {
  ACTIVO: 'Activo', INACTIVO: 'Inactivo', BLOQUEADO: 'Bloqueado',
  SUSPENDIDO: 'Suspendido', ELIMINADO: 'Eliminado',
}

const INITIAL_FILTERS: UserFilters = { start: 0, limit: PAGE_SIZE }

export default function UsersListPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [filters,              setFilters]              = useState(INITIAL_FILTERS)
  const [searchInput,          setSearchInput]          = useState('')
  const [page,                 setPage]                 = useState(1)
  const [editMode,             setEditMode]             = useState(false)
  const [showFormModal,        setShowFormModal]        = useState(false)
  const [selectedUser,         setSelectedUser]         = useState<UsuarioResponse | null>(null)
  const [deleteTarget,         setDeleteTarget]         = useState<UsuarioResponse | null>(null)
  const [passwordResetTarget,  setPasswordResetTarget]  = useState<UsuarioResponse | null>(null)
  const [liftBlockTarget,      setLiftBlockTarget]      = useState<UsuarioResponse | null>(null)
  const [formError,            setFormError]            = useState('')
  const { toasts, dismiss, toast } = useToast()

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useUsers(filters)
  const { data: roles = [] } = useRoles()

  const { data: documentTypes = [] } = useQuery({
    queryKey: ['document-types'],
    queryFn:  () => comunApi.loadTipoDocumento().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

  const { data: servicesOptions = [] } = useQuery({
    queryKey: ['services-catalog'],
    queryFn:  () => comunApi.loadServicio().then((r) => fromCombo(r.data)),
    staleTime: Infinity,
  })

  const { data: estadosCatalogRaw = [] } = useQuery({
    queryKey: ['catalogo-estado-usuario'],
    queryFn:  () => comunApi.loadCatalogo('ESTADO_USUARIO').then((r) => fromCombo(r.data) as ComboResponse[]),
    staleTime: Infinity,
  })
  const statusOptions: ComboResponse[] = estadosCatalogRaw.length ? estadosCatalogRaw : STATUS_FALLBACK
  const estadoMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(statusOptions.map((s) => [s.codigo, s.nombre])),
    [statusOptions],
  )
  const estadoNombre = (codigo: string) =>
    estadoMap[codigo] ?? FRIENDLY_LABEL[codigo] ?? codigo

  // ── Mutaciones ──────────────────────────────────────────────────────────
  const saveUserMutation       = useSaveUser()
  const deleteUserMutation     = useDeleteUser()
  const resetPasswordMutation  = useResetUserPassword()
  const liftSuspensionMutation = useLiftSuspension()

  // ── Datos derivados ──────────────────────────────────────────────────────
  const collection = data as CollectionResponse<UsuarioResponse> | undefined
  const users      = collection?.elements ?? []
  const totalCount = collection?.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1

  // ── Handlers ─────────────────────────────────────────────────────────────
  const onPageChange = (p: number) => {
    setPage(p)
    setFilters((prev) => ({ ...prev, start: p - 1 }))
  }

  const openCreate = () => {
    setEditMode(false); setSelectedUser(null)
    setFormError('')
    setShowFormModal(true)
  }

  const openEdit = (u: UsuarioResponse) => {
    setEditMode(true); setSelectedUser(u)
    setFormError('')
    setShowFormModal(true)
  }

  const onSubmit = async (values: UserFormValues) => {
    setFormError('')
    try {
      const payload: Record<string, unknown> = {
        nombre:              values.nombre,
        apellido:            values.apellido,
        correo:              values.correo,
        rolId:               Number(values.rolId),
        telefono:            values.telefono            || undefined,
        documento:           values.documento           || undefined,
        tipoDocumentoCodigo: values.tipoDocumentoCodigo || undefined,
      }
      if (editMode) {
        payload.usuarioId = selectedUser!.usuarioId
        payload.usuario   = selectedUser!.usuario
        if (values.password) payload.password = values.password
      } else {
        payload.password = values.password
      }
      await saveUserMutation.mutateAsync(payload as unknown as UserFormValues)
      setShowFormModal(false)
      toast('success', editMode ? 'Usuario actualizado correctamente.' : 'Usuario creado exitosamente.')
      await refetch()
    } catch (err) { setFormError(getApiError(err)) }
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    try {
      const wasHabilitado = deleteTarget.habilitado
      await deleteUserMutation.mutateAsync(deleteTarget.usuarioId)
      setDeleteTarget(null)
      toast('success', wasHabilitado === false
        ? 'Usuario habilitado correctamente.'
        : 'Usuario deshabilitado correctamente.')
      await refetch()
    } catch (err) { toast('error', getApiError(err)); setDeleteTarget(null) }
  }

  const onResetPassword = async () => {
    if (!passwordResetTarget) return
    try {
      await resetPasswordMutation.mutateAsync(passwordResetTarget.usuarioId)
      setPasswordResetTarget(null)
      toast('success', 'Contraseña generada y enviada al correo del usuario.')
    } catch (err) { toast('error', getApiError(err)) }
  }

  const onLiftBlock = async () => {
    if (!liftBlockTarget) return
    try {
      await liftSuspensionMutation.mutateAsync(liftBlockTarget.usuarioId)
      setLiftBlockTarget(null)
      toast('success', 'Bloqueo levantado correctamente.')
      await refetch()
    } catch (err) { toast('error', getApiError(err)) }
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((p) => ({ ...p, nombre: searchInput || undefined, start: 0 }))
    setPage(1)
  }

  const canShowLiftBlock = (u: UsuarioResponse) =>
    ['BLOQUEADO', 'SUSPENDIDO'].some((n) =>
      estadoNombre(u.estadoCodigo).toUpperCase().includes(n),
    )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fade-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de personal y accesos del sistema</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost gap-2 text-neutral-500" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button className="btn-primary gap-2" onClick={openCreate}>
            <Plus size={16} /> Nuevo usuario
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Filtros */}
      <div className="card mb-5">
        <div className="card-body flex flex-col sm:flex-row gap-3 flex-wrap">
          <form onSubmit={onSearch} className="flex gap-2 flex-1 min-w-0">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input"
              placeholder="Buscar por nombre, correo, documento..."
            />
            <button type="submit" className="btn-secondary gap-2 flex-shrink-0">
              <Search size={15} /> Buscar
            </button>
          </form>
          <select
            value={filters.rolId}
            onChange={(e) => setFilters((p) => ({ ...p, rolId: e.target.value, start: 0 }))}
            className="input sm:w-44"
          >
            <option value="">Todos los roles</option>
            {roles.map((r: ComboResponse) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select
            value={filters.estadoCodigo}
            onChange={(e) => setFilters((p) => ({ ...p, estadoCodigo: e.target.value || undefined, start: 0 }))}
            className="input sm:w-40"
          >
            <option value="">Todos los estados</option>
            {statusOptions.map((o) => <option key={o.codigo} value={o.codigo}>{o.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? <LoadingScreen /> : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin usuarios"
          description="No hay usuarios que coincidan con los filtros aplicados."
        />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th><th>Correo</th><th>Documento</th>
                  <th>Rol</th><th>Teléfono</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: UsuarioResponse) => (
                  <tr key={u.usuarioId}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-brand-700">
                            {(u.nombre?.[0] ?? '?').toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-neutral-800 text-sm">{u.nombre} {u.apellido}</p>
                      </div>
                    </td>
                    <td className="text-sm text-neutral-600">{u.correo}</td>
                    <td className="text-xs text-neutral-600">{u.documento ?? '—'}</td>
                    <td><span className="badge badge-gray text-xs">{u.rolNombre}</span></td>
                    <td className="text-sm">{u.telefono ?? '—'}</td>
                    <td>
                      <StatusBadge estado={u.habilitado === false ? 'Inhabilitado' : estadoNombre(u.estadoCodigo)} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost btn-sm" title="Editar" onClick={() => openEdit(u)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          className={`btn-ghost btn-sm ${u.habilitado === false ? 'text-green-600 hover:text-green-800' : 'text-red-500 hover:text-red-700'}`}
                          title={u.habilitado === false ? 'Habilitar usuario' : 'Deshabilitar usuario'}
                          onClick={() => setDeleteTarget(u)}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          className="btn-ghost btn-sm text-amber-600 hover:text-amber-800"
                          title="Generar nueva contraseña"
                          onClick={() => setPasswordResetTarget(u)}
                        >
                          <KeyRound size={14} />
                        </button>
                        {canShowLiftBlock(u) && (
                          <button
                            className="btn-ghost btn-sm text-blue-600"
                            title="Levantar bloqueo"
                            onClick={() => setLiftBlockTarget(u)}
                          >
                            <ShieldOff size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
        </>
      )}

      {/* Modal Crear/Editar */}
      <UsuarioFormModal
        open={showFormModal}
        editMode={editMode}
        selectedUser={selectedUser}
        formError={formError}
        roles={roles as ComboResponse[]}
        documentTypes={documentTypes as ComboResponse[]}
        servicesOptions={servicesOptions as ComboResponse[]}
        estadoNombre={estadoNombre}
        loading={saveUserMutation.isPending}
        onClose={() => setShowFormModal(false)}
        onSubmit={onSubmit}
      />

      {/* Dialogs de confirmación */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title={deleteTarget?.habilitado === false ? 'Habilitar usuario' : 'Deshabilitar usuario'}
        description={
          deleteTarget?.habilitado === false
            ? `¿Confirmas habilitar a "${deleteTarget?.nombre} ${deleteTarget?.apellido}"? Recuperará acceso al sistema.`
            : `¿Confirmas deshabilitar a "${deleteTarget?.nombre} ${deleteTarget?.apellido}"? Se destruirá su sesión activa.`
        }
        confirmLabel={deleteTarget?.habilitado === false ? 'Habilitar' : 'Deshabilitar'}
        danger={deleteTarget?.habilitado !== false}
        loading={deleteUserMutation.isPending}
      />

      <ConfirmDialog
        open={!!passwordResetTarget}
        onClose={() => setPasswordResetTarget(null)}
        onConfirm={onResetPassword}
        title="Generar nueva contraseña"
        description={`Se invalidará la clave actual de "${passwordResetTarget?.nombre}" y se enviará una contraseña temporal al correo "${passwordResetTarget?.correo}".`}
        confirmLabel="Generar y enviar"
        loading={resetPasswordMutation.isPending}
      />

      <ConfirmDialog
        open={!!liftBlockTarget}
        onClose={() => setLiftBlockTarget(null)}
        onConfirm={onLiftBlock}
        title="Levantar bloqueo"
        description={`¿Confirmas levantar el bloqueo de "${liftBlockTarget?.nombre}"? Se restaurará su acceso.`}
        confirmLabel="Levantar bloqueo"
        loading={liftSuspensionMutation.isPending}
      />
    </div>
  )
}

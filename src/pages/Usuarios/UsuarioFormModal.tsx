import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Alert, FormField, Spinner, StatusBadge } from '@/components/ui'
import { ComboResponse, UserFormValues, UsuarioResponse } from '@/types'
import PasswordInput from './PasswordInput'
import { buildUsuarioSchema } from './usuario.schema'

interface Props {
  open:           boolean
  editMode:       boolean
  selectedUser:   UsuarioResponse | null
  formError:      string
  roles:          ComboResponse[]
  documentTypes:  ComboResponse[]
  servicesOptions: ComboResponse[]
  estadoNombre:   (codigo: string) => string
  loading:        boolean
  onClose:        () => void
  onSubmit:       (values: UserFormValues) => void
}

export default function UsuarioFormModal({
  open, editMode, selectedUser, formError, roles, documentTypes, servicesOptions,
  estadoNombre, loading, onClose, onSubmit,
}: Props) {
  const schema = buildUsuarioSchema(editMode)
  type Values = z.infer<typeof schema>

  const form = useForm<Values>({ resolver: zodResolver(schema) })
  const watchRoleId = form.watch('rolId')

  // Inicializar el form cuando se abre el modal o cambia el usuario seleccionado
  useEffect(() => {
    if (!open) return
    if (editMode && selectedUser) {
      form.reset({
        nombre:              selectedUser.nombre,
        apellido:            selectedUser.apellido,
        correo:              selectedUser.correo,
        documento:           selectedUser.documento,
        tipoDocumentoCodigo: selectedUser.tipoDocumentoCodigo,
        telefono:            selectedUser.telefono,
        rolId:               String(selectedUser.rolId ?? ''),
        password:            '',
        servicios:           [],
      })
    } else {
      form.reset({ servicios: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editMode, selectedUser?.usuarioId])

  const specialistRole = roles.find((r) => r.nombre.toLowerCase().includes('especialista'))
  const showSpecialtiesSection = !!watchRoleId && !!specialistRole &&
    String(watchRoleId) === String(specialistRole.id)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editMode ? 'Editar usuario' : 'Nuevo usuario'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading
              ? <Spinner size="sm" className="text-white" />
              : editMode ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </>
      }
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {formError && <Alert type="error">{formError}</Alert>}

        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Datos personales</p>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nombres" error={form.formState.errors.nombre?.message} required>
            <input
              {...form.register('nombre')}
              className={`input ${form.formState.errors.nombre ? 'input-error' : ''}`}
              placeholder="Ana"
            />
          </FormField>
          <FormField label="Apellidos" error={form.formState.errors.apellido?.message} required>
            <input
              {...form.register('apellido')}
              className={`input ${form.formState.errors.apellido ? 'input-error' : ''}`}
              placeholder="García"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo de documento">
            <select {...form.register('tipoDocumentoCodigo')} className="input">
              <option value="">Selecciona...</option>
              {documentTypes.map((t) => <option key={t.id} value={t.codigo}>{t.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Nro. documento">
            <input {...form.register('documento')} className="input" placeholder="12345678" />
          </FormField>
        </div>

        <FormField
          label="Correo electrónico"
          error={form.formState.errors.correo?.message}
          required
          hint="El correo es el identificador de acceso"
        >
          <input
            {...form.register('correo')}
            type="email"
            className={`input ${form.formState.errors.correo ? 'input-error' : ''}`}
            placeholder="ana@empresa.com"
          />
        </FormField>

        <FormField label="Teléfono" error={form.formState.errors.telefono?.message} required>
          <input
            {...form.register('telefono')}
            type="tel"
            className={`input ${form.formState.errors.telefono ? 'input-error' : ''}`}
            placeholder="999 999 999"
          />
        </FormField>

        <div className="divider" />
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Datos de acceso</p>

        <FormField label="Rol" error={form.formState.errors.rolId?.message} required>
          <select
            {...form.register('rolId')}
            className={`input ${form.formState.errors.rolId ? 'input-error' : ''}`}
          >
            <option value="">Selecciona un rol...</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </FormField>

        <FormField
          label={editMode ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
          error={form.formState.errors.password?.message}
          required={!editMode}
          hint={!editMode ? 'Mín. 8 caracteres, una mayúscula, un número y un carácter especial' : undefined}
        >
          <PasswordInput
            registration={form.register('password')}
            hasError={!!form.formState.errors.password}
            placeholder={editMode ? '(sin cambios)' : '••••••••'}
          />
        </FormField>

        {showSpecialtiesSection && (
          <>
            <div className="divider" />
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Servicios que atiende
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {servicesOptions.map((s) => (
                <label
                  key={s.id}
                  htmlFor={`srv-${s.id}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-neutral-200 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer transition-colors"
                >
                  <input
                    id={`srv-${s.id}`}
                    type="checkbox"
                    value={String(s.id)}
                    {...form.register('servicios')}
                    className="w-4 h-4 rounded accent-brand-600"
                  />
                  <span className="text-xs text-neutral-700 font-medium">{s.nombre}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {editMode && selectedUser && (
          <>
            <div className="divider" />
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Estado actual</p>
                <StatusBadge estado={selectedUser.habilitado === false ? 'Inhabilitado' : estadoNombre(selectedUser.estadoCodigo)} />
              </div>
              <p className="text-xs text-neutral-400 max-w-[180px] text-right leading-snug">
                El estado se gestiona con los botones de la tabla (habilitar/deshabilitar y levantar bloqueo).
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

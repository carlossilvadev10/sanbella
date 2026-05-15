import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { authApi } from '@/api/authApi'
import { getApiError } from '@/utils/helpers'
import { Spinner, Alert, FormField } from '@/components/ui'

const PASSWORD_RULES = z
  .string()
  .min(8,   'Mínimo 8 caracteres')
  .regex(/[A-Z]/,           'Debe contener al menos una mayúscula')
  .regex(/[0-9]/,           'Debe contener al menos un número')
  .regex(/[@#$%^&*!?.,;]/, 'Debe contener al menos un carácter especial (@, #, $, %, etc.)')

const schema = z.object({
  currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
  newPassword:     PASSWORD_RULES,
  confirmPassword: z.string(),
})
.refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden', path: ['confirmPassword'],
})
.refine((d) => d.currentPassword !== d.newPassword, {
  message: 'La nueva contraseña no puede ser igual a la actual', path: ['newPassword'],
})

interface PasswordInputProps {
  registration: object
  hasError: boolean
  placeholder?: string
}

function PasswordInput({ registration, hasError, placeholder = '••••••••' }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <div className="relative">
      <input {...registration} type={isVisible ? 'text' : 'password'} placeholder={placeholder}
        className={`input pr-10 ${hasError ? 'input-error' : ''}`} />
      <button type="button" onClick={() => setIsVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" tabIndex={-1}>
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export default function ChangePasswordPage() {
  const [errorMessage,  setErrorMessage]  = useState('')
  const [isSuccess,     setIsSuccess]     = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setErrorMessage('')
    try {
      await authApi.updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      setIsSuccess(true)
      reset()
    } catch (err) {
      setErrorMessage(getApiError(err))
    }
  }

  return (
    <div className="fade-enter max-w-md mx-auto">
      <div className="page-header">
        <h1 className="page-title">Cambiar contraseña</h1>
        <p className="page-subtitle">Actualiza tu clave de acceso al sistema.</p>
      </div>

      <div className="card">
        <div className="card-body space-y-5">
          {isSuccess  && <Alert type="success" title="Contraseña actualizada">Tu contraseña fue cambiada exitosamente.</Alert>}
          {errorMessage && <Alert type="error">{errorMessage}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Contraseña actual" error={errors.currentPassword?.message} required>
              <PasswordInput registration={register('currentPassword')} hasError={!!errors.currentPassword} />
            </FormField>

            <div className="divider" />

            <FormField label="Nueva contraseña" error={errors.newPassword?.message} required
              hint="Mínimo 8 caracteres, una mayúscula, un número y un carácter especial">
              <PasswordInput registration={register('newPassword')} hasError={!!errors.newPassword} />
            </FormField>

            <FormField label="Confirmar nueva contraseña" error={errors.confirmPassword?.message} required>
              <PasswordInput registration={register('confirmPassword')} hasError={!!errors.confirmPassword} />
            </FormField>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <p className="text-xs font-medium text-neutral-600 mb-2">La contraseña debe cumplir:</p>
              <ul className="space-y-1">
                {['Mínimo 8 caracteres','Al menos una letra mayúscula','Al menos un número','Al menos un carácter especial (@, #, $, %, etc.)']
                  .map((req) => (
                    <li key={req} className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="w-1 h-1 rounded-full bg-neutral-400 flex-shrink-0" />{req}
                    </li>
                  ))}
              </ul>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : <><Lock size={16} /> Actualizar contraseña</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

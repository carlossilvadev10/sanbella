import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/api/authApi'
import { getApiError } from '@/utils/helpers'
import { Spinner, Alert, FormField } from '@/components/ui'

const emailSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
})

const resetSchema = z.object({
  email:           z.string().email('Ingresa un correo válido'),
  code:            z.string().min(1, 'Ingresa el código recibido'),
  newPassword:     z.string()
    .min(8,   'Mínimo 8 caracteres')
    .regex(/[A-Z]/,           'Debe contener al menos una mayúscula')
    .regex(/[0-9]/,           'Debe contener al menos un número')
    .regex(/[@#$%^&*!?.,;]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState('email') // 'email' | 'reset' | 'done'
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading,    setIsLoading]    = useState(false)

  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { email: '' } })

  const onSendCode = async (values: z.infer<typeof emailSchema>) => {
    const { email } = values
    setErrorMessage('')
    setIsLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSubmittedEmail(email)
      resetForm.setValue('email', email)
      setCurrentStep('reset')
    } catch (err) {
      setErrorMessage(getApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const onResetPassword = async (values: z.infer<typeof resetSchema>) => {
    setErrorMessage('')
    setIsLoading(true)
    try {
      await authApi.resetPassword({ email: values.email, codigo: values.code, newPassword: values.newPassword })
      setCurrentStep('done')
    } catch (err) {
      setErrorMessage(getApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">S</span>
          </div>
          <span className="font-display text-lg font-semibold">Sanbella</span>
        </div>

        {currentStep === 'email' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-neutral-900">Recuperar contraseña</h1>
              <p className="mt-1 text-sm text-neutral-500">Ingresa tu correo y te enviaremos un código de recuperación.</p>
            </div>
            {errorMessage && <div className="mb-4"><Alert type="error">{errorMessage}</Alert></div>}
            <form onSubmit={emailForm.handleSubmit(onSendCode)} className="space-y-4" noValidate>
              <FormField label="Correo electrónico" error={emailForm.formState.errors.email?.message} required>
                <div className="relative">
                  <input {...emailForm.register('email')} type="email" placeholder="correo@empresa.com"
                    autoComplete="email" className={`input pl-10 ${emailForm.formState.errors.email ? 'input-error' : ''}`} />
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </FormField>
              <button type="submit" className="btn-primary w-full btn-lg" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" className="text-white" /> : 'Enviar código'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-neutral-500 hover:text-neutral-700 inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}

        {currentStep === 'reset' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-neutral-900">Nueva contraseña</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Revisa tu correo <strong>{submittedEmail}</strong> e ingresa el código recibido.
              </p>
            </div>
            {errorMessage && <div className="mb-4"><Alert type="error">{errorMessage}</Alert></div>}
            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4" noValidate>
              <FormField label="Correo electrónico" error={resetForm.formState.errors.email?.message} required>
                <input {...resetForm.register('email')} type="email" className="input" readOnly />
              </FormField>
              <FormField label="Código de recuperación" error={resetForm.formState.errors.code?.message} required>
                <input {...resetForm.register('code')} type="text" placeholder="Ej: 482910"
                  autoComplete="one-time-code"
                  className={`input font-mono tracking-widest ${resetForm.formState.errors.code ? 'input-error' : ''}`} />
              </FormField>
              <FormField label="Nueva contraseña" error={resetForm.formState.errors.newPassword?.message} required
                hint="Mín. 8 caracteres, una mayúscula, un número y un carácter especial">
                <input {...resetForm.register('newPassword')} type="password" placeholder="••••••••"
                  className={`input ${resetForm.formState.errors.newPassword ? 'input-error' : ''}`} />
              </FormField>
              <FormField label="Confirmar contraseña" error={resetForm.formState.errors.confirmPassword?.message} required>
                <input {...resetForm.register('confirmPassword')} type="password" placeholder="••••••••"
                  className={`input ${resetForm.formState.errors.confirmPassword ? 'input-error' : ''}`} />
              </FormField>
              <button type="submit" className="btn-primary w-full btn-lg" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" className="text-white" /> : 'Cambiar contraseña'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button className="text-xs text-neutral-400 hover:text-neutral-600"
                onClick={() => { setCurrentStep('email'); setErrorMessage('') }}>
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          </>
        )}

        {currentStep === 'done' && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-neutral-900">¡Contraseña actualizada!</h1>
              <p className="mt-2 text-sm text-neutral-500">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </div>
            <Link to="/login" className="btn-primary btn-lg w-full">Ir al inicio de sesión</Link>
          </div>
        )}
      </div>
    </div>
  )
}

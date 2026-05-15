import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { authApi } from '@/api/authApi'
import { getApiError } from '@/utils/helpers'
import { Spinner, Alert, FormField } from '@/components/ui'

const MAX_ATTEMPTS = 3

const schema = z.object({
  login:    z.string().min(1, 'El correo es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate                          = useNavigate()
  const setAuth                           = useAuthStore((s) => s.setAuth)
  const [showPassword,  setShowPassword]  = useState(false)
  const [errorMessage,  setErrorMessage]  = useState('')
  const [isLocked,      setIsLocked]      = useState(false)
  const attemptCount                      = useRef(0)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: LoginFormValues) => {
    if (isLocked) return
    setErrorMessage('')
    try {
      const { data } = await authApi.login({
        login:    values.login,
        password: values.password,
      })

      // LoginResponse has token at root level
      const { token, ...user } = data

      attemptCount.current = 0
      setAuth(token, { token, ...user })
      navigate('/dashboard')
    } catch (err) {
      attemptCount.current += 1
      const remaining = MAX_ATTEMPTS - attemptCount.current
      const msg = getApiError(err)

      if (
        attemptCount.current >= MAX_ATTEMPTS ||
        msg.toLowerCase().includes('bloqueado') ||
        msg.toLowerCase().includes('blocked')
      ) {
        setIsLocked(true)
        setErrorMessage(
          'Tu cuenta ha sido bloqueada por 3 intentos fallidos. Comunícate con el Administrador para restablecer tu acceso.'
        )
      } else {
        setErrorMessage(
          `${msg}${remaining > 0
            ? ` (${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''})`
            : ''}`
        )
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-950 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="font-display font-bold text-white">S</span>
          </div>
          <span className="font-display text-xl font-semibold text-white">Sanbella</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold text-white leading-tight mb-4">
            Sistema de<br /><span className="text-brand-400">Reservas</span>
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
            Gestión integral de reservas, confirmaciones y administración de usuarios para el equipo Sanbella.
          </p>
        </div>
        <p className="text-neutral-600 text-xs">
          © {new Date().getFullYear()} Sanbella. Todos los derechos reservados.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">S</span>
            </div>
            <span className="font-display text-lg font-semibold">Sanbella</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-neutral-900">Bienvenido</h2>
            <p className="mt-1 text-sm text-neutral-500">Ingresa tus credenciales para continuar</p>
          </div>

          {errorMessage && (
            <div className="mb-5">
              <Alert type={isLocked ? 'warning' : 'error'}>{errorMessage}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Correo" error={errors.login?.message} required>
              <input
                {...register('login')}
                type="text"
                placeholder="admin@sanbella.com"
                autoComplete="username"
                disabled={isLocked}
                className={`input ${errors.login ? 'input-error' : ''}`}
              />
            </FormField>

            <FormField label="Contraseña" error={errors.password?.message} required>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLocked}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary btn-lg w-full"
              disabled={isSubmitting || isLocked}
            >
              {isSubmitting
                ? <Spinner size="sm" className="text-white" />
                : <><LogIn size={18} /> Iniciar sesión</>
              }
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-500 mb-3">¿Eres cliente y quieres agendar una cita?</p>
            <a
              href="/book"
              className="inline-flex items-center gap-2 btn-secondary w-full justify-center"
            >
              📅 Reservar mi cita
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

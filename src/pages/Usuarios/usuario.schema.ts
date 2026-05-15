import { z } from 'zod'

const PASSWORD_RULES = z
  .string()
  .min(8,                  'Mínimo 8 caracteres')
  .regex(/[A-Z]/,          'Debe contener al menos una mayúscula')
  .regex(/[0-9]/,          'Debe contener al menos un número')
  .regex(/[@#$%^&*!?.,;]/, 'Debe contener al menos un carácter especial')

export function buildUsuarioSchema(isEditing: boolean) {
  return z.object({
    nombre:              z.string().min(2, 'Mínimo 2 caracteres'),
    apellido:            z.string().min(2, 'Mínimo 2 caracteres'),
    correo:              z.string().email('Correo inválido'),
    tipoDocumentoCodigo: z.string().optional(),
    documento:           z.string().optional(),
    telefono:            z.string().min(9, 'Teléfono inválido'),
    rolId:               z.string().min(1, 'Selecciona un rol'),
    estadoCodigo:        z.string().optional(),
    password:            z.string().optional(),
    servicios:           z.array(z.string()).optional(),
  }).superRefine((data, ctx) => {
    if (!isEditing) {
      const result = PASSWORD_RULES.safeParse(data.password ?? '')
      if (!result.success)
        result.error.issues.forEach((i) => ctx.addIssue({ ...i, path: ['password'] }))
    } else if (data.password && data.password.length > 0) {
      const result = PASSWORD_RULES.safeParse(data.password)
      if (!result.success)
        result.error.issues.forEach((i) => ctx.addIssue({ ...i, path: ['password'] }))
    }
  })
}

import { CheckCircle2 } from 'lucide-react'

const STEPS = [
  { id: 0, label: 'Servicio'  },
  { id: 1, label: 'Horario'   },
  { id: 2, label: 'Tus datos' },
  { id: 3, label: 'Resumen'   },
]

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8 max-w-lg mx-auto">
      {STEPS.map(({ id, label }, idx) => (
        <div key={id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${id < current ? 'bg-brand-200 text-brand-700' : id === current ? 'bg-brand-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
              {id < current ? <CheckCircle2 size={14} /> : id + 1}
            </div>
            <span className={`mt-1 text-xs font-medium ${id === current ? 'text-brand-600' : 'text-neutral-400'}`}>{label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`h-px w-8 mb-4 mx-1 ${id < current ? 'bg-brand-400' : 'bg-neutral-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

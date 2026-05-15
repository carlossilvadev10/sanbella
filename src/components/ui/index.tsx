import React, { useEffect, useState, useCallback } from 'react'
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/helpers'

// ── Spinner ───────────────────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes: Record<'sm' | 'md' | 'lg', string> = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' }
  return (
    <span
      className={cn(
        'inline-block border-2 border-current border-t-transparent rounded-full animate-spin text-brand-600',
        sizes[size],
        className
      )}
    />
  )
}

// ── Loading screen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
}

export function EmptyState({ title = 'Sin resultados', description = '', icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-neutral-400" />
        </div>
      )}
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {description && <p className="mt-1 text-xs text-neutral-400 max-w-xs">{description}</p>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!open) return null
  const sizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className={cn('relative bg-white rounded-2xl shadow-card-lg w-full fade-enter', sizes[size])}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirmar', danger = false, loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="text-white" /> : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          danger ? 'bg-red-100' : 'bg-brand-100'
        )}>
          <AlertTriangle size={20} className={danger ? 'text-red-600' : 'text-brand-600'} />
        </div>
        <p className="text-sm text-neutral-600 pt-2">{description}</p>
      </div>
    </Modal>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  estado?: string
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const map: Record<string, [string, string]> = {
    PENDIENTE:    ['badge-yellow', 'Pendiente'],
    CONFIRMADO:   ['badge-blue',   'Confirmado'],
    COMPLETADO:   ['badge-green',  'Completado'],
    ANULADO:      ['badge-red',    'Anulado'],
    PAGADO:       ['badge-green',  'Pagado'],
    ACTIVO:       ['badge-green',  'Activo'],
    INACTIVO:     ['badge-gray',   'Inactivo'],
    BLOQUEADO:    ['badge-red',    'Bloqueado'],
    SUSPENDIDO:   ['badge-red',    'Suspendido'],
    INHABILITADO: ['badge-gray',   'Inhabilitado'],
  }
  const [cls, label] = map[estado?.toUpperCase() ?? ''] ?? ['badge-gray', estado ?? '—']
  return <span className={cls}>{label}</span>
}

// ── Form field wrapper ────────────────────────────────────────────────────────
interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[]
  placeholder?: string
  error?: boolean | string
}

export function Select({ options = [], placeholder = 'Selecciona...', error, ...props }: SelectProps) {
  return (
    <select className={cn('input', error && 'input-error', 'cursor-pointer')} {...props}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export interface ToastItem {
  id: number
  type: 'success' | 'error'
  message: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), [])
  const toast = useCallback((type: ToastItem['type'], message: string) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, type, message }])
  }, [])
  return { toasts, dismiss, toast }
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), 3500)
    return () => clearTimeout(t)
  }, [item.id, onDismiss])
  const isSuccess = item.type === 'success'
  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm fade-enter w-80',
      isSuccess
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800',
    )}>
      {isSuccess
        ? <CheckCircle size={17} className="flex-shrink-0 mt-0.5" />
        : <AlertTriangle size={17} className="flex-shrink-0 mt-0.5" />}
      <p className="flex-1 leading-snug">{item.message}</p>
      <button onClick={() => onDismiss(item.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 items-end">
      {toasts.map((t) => <ToastCard key={t.id} item={t} onDismiss={dismiss} />)}
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
interface AlertProps {
  type?: 'info' | 'success' | 'error' | 'warning'
  title?: string
  children: React.ReactNode
}

export function Alert({ type = 'info', title, children }: AlertProps) {
  const styles: Record<'info' | 'success' | 'error' | 'warning', { cls: string; Icon: LucideIcon }> = {
    info:    { cls: 'bg-blue-50 border-blue-200 text-blue-800',                Icon: Info },
    success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800',       Icon: CheckCircle },
    error:   { cls: 'bg-red-50 border-red-200 text-red-800',                   Icon: AlertTriangle },
    warning: { cls: 'bg-amber-50 border-amber-200 text-amber-800',             Icon: AlertTriangle },
  }
  const { cls, Icon } = styles[type]
  return (
    <div className={cn('flex gap-3 p-4 rounded-xl border text-sm', cls)}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const visible = getVisiblePages(page, totalPages)
  return (
    <div className="flex items-center gap-1 justify-end mt-4 flex-wrap">
      <button
        className="btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Anterior"
      >
        ‹
      </button>
      {visible.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-neutral-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'min-w-[34px] h-[34px] px-2 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100',
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Siguiente"
      >
        ›
      </button>
    </div>
  )
}

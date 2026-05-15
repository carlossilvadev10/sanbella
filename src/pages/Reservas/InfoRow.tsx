interface Props {
  label: string
  value?: string | number | null
  className?: string
}

export default function InfoRow({ label, value, className = '' }: Props) {
  return (
    <div className={className}>
      <dt className="text-xs text-neutral-400 font-medium mb-0.5">{label}</dt>
      <dd className="text-sm text-neutral-800">{value || '—'}</dd>
    </div>
  )
}

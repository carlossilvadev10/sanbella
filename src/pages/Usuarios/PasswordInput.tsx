import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  registration: object
  hasError:     boolean
  placeholder?: string
}

export default function PasswordInput({ registration, hasError, placeholder = '••••••••' }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <div className="relative">
      <input
        {...(registration as React.InputHTMLAttributes<HTMLInputElement>)}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`input pr-10 ${hasError ? 'input-error' : ''}`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        tabIndex={-1}
      >
        {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

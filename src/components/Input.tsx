import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={[
          'h-input w-full rounded-md border bg-surface px-3',
          'font-sans text-body text-text-primary',
          'outline-none transition-colors duration-150',
          'placeholder:text-text-secondary',
          hasError
            ? 'border-red-600 focus:border-red-600'
            : 'border-border focus:border-text-primary',
          className,
        ].join(' ')}
      />
    )
  },
)

Input.displayName = 'Input'

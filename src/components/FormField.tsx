import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="font-sans text-label text-text-primary">
        {label}
      </label>

      {children}

      {hint && !error && (
        <span className="font-sans text-caption text-text-secondary">{hint}</span>
      )}

      {error && (
        <span role="alert" className="font-sans text-caption text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}

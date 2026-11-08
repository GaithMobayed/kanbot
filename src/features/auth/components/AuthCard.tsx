import type { ReactNode } from 'react'
import logoUrl from '../../../assets/logo.svg'

interface AuthCardProps {
  children: ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-card flex-col gap-6 rounded-lg border border-border bg-surface p-8">
        {}
        <div className="flex items-center justify-center gap-2">
          <img src={logoUrl} alt="" width={32} height={32} aria-hidden="true" className="shrink-0" />
          <span className="font-sans text-brand font-bold text-text-primary">Kanbot</span>
        </div>

        {children}
      </div>
    </div>
  )
}

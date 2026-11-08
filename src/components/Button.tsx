import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  isPending = false,
  variant = 'primary',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isPending

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'flex h-btn w-full  items-center justify-center gap-2',
        'rounded-md font-sans text-btn',
        'text-nowrap',
        'transition-[background-color,opacity] duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        variant === 'primary'
          ? isDisabled
            ? 'cursor-not-allowed border-none bg-text-secondary text-text-inverse'
            : 'cursor-pointer border-none bg-primary text-text-inverse hover:opacity-90'
          : isDisabled
            ? 'cursor-not-allowed border border-border bg-surface text-text-secondary'
            : 'cursor-pointer border border-border bg-surface text-text-primary hover:bg-surface-subtle',
        className,
      ].join(' ')}
    >
      {isPending && <Spinner />}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="shrink-0 animate-spin"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

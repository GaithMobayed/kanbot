interface ErrorBannerProps {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex h-alert items-center gap-2 rounded-md border border-border bg-surface-alert px-3 font-sans text-body text-text-primary"
    >
      {}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-text-secondary"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
    </div>
  )
}

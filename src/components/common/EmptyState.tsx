
import type { ReactNode } from "react";
import logoUrl from "../../assets/logo.svg"

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  
  variant?: "card" | "plain";
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  variant = "plain",
  className = "",
}: EmptyStateProps) {
  const cardClass =
    variant === "card"
      ? "max-w-md rounded-lg border border-border bg-surface p-8 shadow"
      : "";

  return (
    <div
      className={`flex h-full min-h-full flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className={`flex flex-col items-center gap-3 ${cardClass}`}>
        <div className="shrink-0">
          <img src={logoUrl} alt="" width={48} height={48} aria-hidden="true" />
        </div>
        <h2 className="m-0 font-sans text-heading font-bold text-text-primary">
          {title}
        </h2>

        {description && (
          <p className="m-0 font-sans text-body text-text-secondary">
            {description}
          </p>
        )}

        {action && <div className="mt-2 flex gap-3">{action}</div>}
      </div>
    </div>
  );
}

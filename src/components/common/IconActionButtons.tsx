import type { LucideIcon } from "lucide-react";

export interface IconAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: "success" | "danger" | "purple";
  disabled?: boolean;
  descriptionId?: string;
  tooltip?: string;
}

interface IconActionButtonsProps {
  label: string;
  actions: IconAction[];
  className?: string;
}

export function IconActionButtons({
  label,
  actions,
  className = "",
}: IconActionButtonsProps) {
  if (actions.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={label}
      className={["inline-flex items-center gap-2", className].join(" ")}
    >
      {actions.map(
        ({
          label: actionLabel,
          icon: Icon,
          onClick,
          tone = "success",
          disabled = false,
          descriptionId,
          tooltip,
        }) => (
          <button
            key={actionLabel}
            type="button"
            onClick={onClick}
            aria-label={actionLabel}
            aria-describedby={descriptionId}
            title={tooltip ?? actionLabel}
            disabled={disabled}
            className={[
              "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
              tone === "danger"
                ? "border-danger-border bg-danger-bg text-text-danger hover:bg-danger-hover"
                : tone === "purple"
                  ? "border-primary bg-primary text-text-inverse hover:opacity-90"
                  : "border-success-border bg-success-bg text-success hover:bg-success-hover",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ),
      )}
    </div>
  );
}

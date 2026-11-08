import { ChevronDown, Pencil, Play, Trash2 } from "lucide-react";
import { memo } from "react";
import { IconActionButtons } from "../../../../components/common/IconActionButtons";

interface TableHeaderProps {
  title: string;
  todosCount: number;
  totalPoints: number;
  collapsed: boolean;
  onToggle: () => void;
  bodyId: string;
  showActions: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStartSprint?: () => void;
  startDisabled: boolean;
  startDisabledReason?: string;
}

export const TableHeader = memo(function TableHeader({
  title,
  todosCount,
  totalPoints,
  collapsed,
  onToggle,
  bodyId,
  showActions,
  onEdit,
  onDelete,
  onStartSprint,
  startDisabled,
  startDisabledReason,
}: TableHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 py-4 bg-nav-active rounded-t-lg">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${collapsed ? "Expand" : "Collapse"} ${title}`}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          className="shrink-0 rounded-md p-1 text-text-secondary transition-colors duration-150 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        >
          <ChevronDown
            className={[
              "h-5 w-5 transition-transform duration-150",
              collapsed ? "-rotate-90" : "rotate-0",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
        <div className="min-w-0">
          <h2 className="m-0 font-sans  font-bold text-text-primary">
            {title}
          </h2>
          <p className="m-0 font-sans text-label text-text-secondary">
            {todosCount} todos · {totalPoints} points
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex shrink-0 items-center gap-2">
          <IconActionButtons
            label={`${title} actions`}
            actions={[
              ...(onEdit
                ? [{ label: `Edit ${title}`, icon: Pencil, onClick: onEdit }]
                : []),
              ...(onDelete
                ? [
                    {
                      label: `Delete ${title}`,
                      icon: Trash2,
                      onClick: onDelete,
                      tone: "danger" as const,
                    },
                  ]
                : []),
              ...(onStartSprint
                ? [
                    {
                      label: "Start Sprint",
                      icon: Play,
                      onClick: onStartSprint,
                      tone: "purple" as const,
                      disabled: startDisabled,
                      tooltip: startDisabled
                        ? startDisabledReason ?? `Cannot start ${title}`
                        : `Start ${title}`,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </header>
  );
})

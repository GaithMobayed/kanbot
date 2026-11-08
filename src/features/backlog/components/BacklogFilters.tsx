import { TODO_PRIORITIES, TODO_TYPES } from "../../../types/api";
import type { TodoPriority, TodoType } from "../../../types/api";
import { SearchInput } from "../../../components/SearchInput";
import type { UseBacklogFiltersResult } from "../hooks/useBacklogFilters";

interface BacklogFiltersProps {
  
  state: UseBacklogFiltersResult;
}

export function BacklogFilters({ state }: BacklogFiltersProps) {
  const { values, set } = state;
  return (
    <div className="flex  items-start gap-3">
      <label className="flex min-w-56 flex-1 flex-col gap-1 font-sans text-caption text-text-secondary">
        Search backlog
        <SearchInput
          value={values.search}
          onChange={set.setSearch}
          placeholder="Search key, title, description, or labels"
        />
      </label>

      <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
        Priority
        <select
          value={values.priority}
          onChange={(e) => set.setPriority(e.target.value as TodoPriority | "")}
          className="h-input rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="">All priorities</option>
          {TODO_PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 font-sans text-caption text-text-secondary">
        Type
        <select
          value={values.type}
          onChange={(e) => set.setType(e.target.value as TodoType | "")}
          className="h-input rounded-md border border-border bg-surface px-3 font-sans text-body text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="">All types</option>
          {TODO_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

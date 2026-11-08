import { useMemo, useState } from "react";
import { useDebounce } from '../../../hooks/useDebounce'
import type { TodoPriority, TodoType } from "../../../types/api";

export interface BacklogFilters {
  search?: string;
  priority?: TodoPriority;
  type?: TodoType;
}

export interface UseBacklogFiltersResult {
  
  values: {
    search: string;
    priority: TodoPriority | "";
    type: TodoType | "";
  };
  
  set: {
    setSearch: (value: string) => void;
    setPriority: (value: TodoPriority | "") => void;
    setType: (value: TodoType | "") => void;
  };
  
  filters: BacklogFilters;
  
  hasActive: boolean;
}


export function useBacklogFilters(): UseBacklogFiltersResult {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<TodoPriority | "">("");
  const [type, setType] = useState<TodoType | "">("");

  const debouncedSearch = useDebounce(search.trim(), 300);

  
  const filters = useMemo<BacklogFilters>(
    () => ({
      search: debouncedSearch || undefined,
      priority: priority || undefined,
      type: type || undefined,
    }),
    [debouncedSearch, priority, type]
  );

  const hasActive = Boolean(debouncedSearch || priority || type);

  return {
    values: { search, priority, type },
    set: { setSearch, setPriority, setType },
    filters,
    hasActive,
  };
}

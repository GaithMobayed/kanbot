import { useState } from "react";
import { useNavigate } from "react-router";
import { ActiveSprintHeader } from "../components/ActiveSprintHeader";
import { ActiveSprintBoard } from "../components/ActiveSprintBoard";
import { CompleteSprintModal } from "../components/CompleteSprintModal";
import { TodoDetailsModal } from "../../../components/TodoDetailsModal";
import { QueryState } from "../../../components/common/QueryState";
import { useActiveSprint } from "../hooks/useProjectSprints";
import { useActiveSprintBoard } from "../hooks/useActiveSprintBoard";
import { useBoardDragDrop } from "../../board/hooks/useBoardDragDrop";
import type { Todo } from "../../../types/api";
import { useProjectId } from "../../../hooks/useProjectId";import { EmptyState } from "../../../components/common/EmptyState";
import { Button } from "../../../components/Button";
import { useAssistantStore } from "../../ai/store/assistantStore";

export function ActiveSprintPage() {
  const projectId = useProjectId();

  const {
    activeSprint,
    isLoading: isSprintLoading,
    isError: isSprintError,
    error: sprintError,
  } = useActiveSprint(projectId);

  const boardQuery = useActiveSprintBoard(activeSprint?.id);

  const board = useBoardDragDrop({
    projectId,
    sprintId: activeSprint?.id,
    initialColumns: boardQuery.data?.columns,
  });

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const openSprintSummary = useAssistantStore((s) => s.openSprintSummary)

  return (
    <QueryState
      isLoading={
        isSprintLoading || (Boolean(activeSprint) && boardQuery.isLoading)
      }
      isError={isSprintError || boardQuery.isError}
      error={sprintError ?? boardQuery.error}
      loadingMessage="Loading active sprint…"
    >
      {!activeSprint ? (
        <EmptyState
          title="No active sprint"
          description="There is currently no active sprint in this project. You can start a planned sprint or plan a new one from your backlog."
          action={
            <Button
            type="button"
            onClick={()=>navigate(`/projects/${projectId}/backlog`)}
            variant="primary"
            className="w-auto gap-1.5 px-4 py-2"
          >
            Go To Backlog
          </Button>
          }
        />
      ) : (
        <div className="flex min-h-full flex-col gap-5 p-6">
          <ActiveSprintHeader
            sprint={boardQuery.data?.sprint ?? activeSprint}
            onSummarize={() => openSprintSummary(projectId, activeSprint.id)}
            onComplete={() => setIsCompleteModalOpen(true)}
          />
          <ActiveSprintBoard board={board} onTodoClick={setSelectedTodo} />

          {selectedTodo && (
            <TodoDetailsModal
              key={selectedTodo.id}
              isOpen
              projectId={projectId}
              todo={selectedTodo}
              onClose={() => setSelectedTodo(null)}
            />
          )}

          {isCompleteModalOpen && (
            <CompleteSprintModal
              isOpen
              onClose={() => setIsCompleteModalOpen(false)}
              sprint={boardQuery.data?.sprint ?? activeSprint}
              projectId={projectId}
            />
          )}
        </div>
      )}
    </QueryState>
  );
}

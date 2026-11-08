import { useNavigate, useParams } from "react-router";
import { useProjectSprints } from "../hooks/useProjectSprints";
import { extractErrorMessage } from "../../../lib/extractError";
import { ErrorBanner } from "../../../components/ErrorBanner";
import { SprintListItem } from "../components/SprintListItem";
import { SprintDetailsView } from "../components/SprintDetailsView";
import { EmptyState } from "../../../components/common/EmptyState";
import { Button } from "../../../components/Button";

export function SprintsPage() {
  const { projectId = "", sprintId } = useParams();
  const navigate = useNavigate();

  const sprintsQuery = useProjectSprints(projectId);
  const sprints = sprintsQuery.data?.sprints ?? [];

  
  const selectedSprint =
    sprints.find((s) => s.id === sprintId) ??
    sprints.find((s) => s.status === "active") ??
    sprints[0] ??
    null;

  if (sprintsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-sans text-body text-text-secondary">
          Loading sprints…
        </p>
      </div>
    );
  }

  if (sprintsQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorBanner message={extractErrorMessage(sprintsQuery.error)} />
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <EmptyState
        title="No sprints yet"
        description="This project does not have any sprints. Plan and start your first sprint
            from the backlog."
        action={
          <Button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/backlog`)}
            variant="primary"
            className="w-auto gap-1.5 px-4 py-2"
          >
            Go To Backlog
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 animate-fade-slide-in motion-reduce:animate-none">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {}
        <section
          aria-label="All sprints list"
          className="flex flex-col gap-3 lg:col-span-4"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="m-0 font-sans text-label font-bold text-text-primary">
              All sprints
            </h2>
            <span className="font-sans text-caption text-text-secondary">
              {sprints.length} {sprints.length === 1 ? "sprint" : "sprints"}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {sprints.map((sprint, index) => (
              <SprintListItem
                key={sprint.id}
                sprint={sprint}
                isSelected={sprint.id === selectedSprint?.id}
                style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
                onClick={(s) =>
                  navigate(`/projects/${projectId}/sprints/${s.id}`)
                }
              />
            ))}
          </div>
        </section>

        {}
        <section aria-label="Selected sprint details" className="lg:col-span-8">
          {selectedSprint ? (
            <SprintDetailsView
              key={selectedSprint.id}
              sprint={selectedSprint}
              projectId={projectId}
              className="animate-fade-slide-in motion-reduce:animate-none"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
              <p className="font-sans text-body text-text-secondary">
                Select a sprint to view details and retrospective summary.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

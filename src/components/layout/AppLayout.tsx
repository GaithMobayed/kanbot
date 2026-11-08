import { Outlet, useNavigation, useParams } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { NewProjectModal } from "../../features/projects/components/NewProjectModal";
import { useNewProjectModalStore } from "../../features/projects/store/newProjectModalStore";
import { useProjectStore } from "../../features/projects/store/projectStore";
import { useAssistantStore } from "../../features/ai/store/assistantStore";
import { useProjects } from "../../features/projects/hooks/useProjects";
import { AiFeatureHost } from "../../features/ai/components/AiFeatureHost";


export function AppLayout() {
  const projectsQuery = useProjects();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const isModalOpen = useNewProjectModalStore((s) => s.isOpen);
  const closeModal = useNewProjectModalStore((s) => s.close);

  const { projectId } = useParams();
  const projects = useProjectStore((state) => state.projects);
  const selectedProject = projects.find((p) => p.id === projectId) ?? null;

  const openAssistant = useAssistantStore((s) => s.openDrawer);

  function handleAskAi() {
    if (selectedProject) {
      openAssistant(selectedProject.id);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {}
      <Sidebar
        projects={projects}
        selectedProject={selectedProject ?? undefined}
      />

      {}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          hasSelectedProject={Boolean(selectedProject)}
          onAskAi={handleAskAi}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-sans text-body text-text-secondary">
                Loading ...
              </p>
            </div>
          ) : (
            <Outlet context={projectsQuery} />
          )}
        </main>
      </div>

      {}
      <AiFeatureHost project={selectedProject} />

      <NewProjectModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

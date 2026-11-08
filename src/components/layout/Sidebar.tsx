import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ProjectWithStats } from "../../types/api";
import logoUrl from "../../assets/logo.svg";
import { NavTab } from "./NavTab";
import { ProjectSelector } from "./ProjectSelector";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useProjectStore } from "../../features/projects/store/projectStore";
import { useSidebarStore } from "../../features/layout/store/sidebarStore";
import { ConfirmDialog } from "../common/ConfirmDialog";
import {
  ActiveSprintIcon,
  BacklogIcon,
  ProjectsIcon,
  SprintsIcon,
  UserCircleIcon,
  LogOutIcon,
} from "./icons";

interface SidebarProps {
  projects: ProjectWithStats[];
  selectedProject?: ProjectWithStats;
}

export function Sidebar({ projects, selectedProject }: SidebarProps) {
  const projectBase = selectedProject
    ? `/projects/${selectedProject.id}`
    : null;

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setProjects = useProjectStore((s) => s.setProjects);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  function handleRequestLogOut() {
    setIsLogoutConfirmOpen(true);
  }

  function handleConfirmLogOut() {
    clearAuth();
    setProjects([]);
    queryClient.clear();
    closeMobile();
    setIsLogoutConfirmOpen(false);
    void navigate("/login", { replace: true });
  }

  function renderSidebarContent(collapsed: boolean, showToggle: boolean) {
    return (
      <div
        className={[
          "flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-4",
          "transition-[padding] duration-300 ease-in-out motion-reduce:transition-none",
          collapsed ? "items-center px-2" : "",
        ].join(" ")}
      >
        {/* Header: logo + brand + toggle */}
        <div
          className={[
            "flex shrink-0 items-center gap-2",
            collapsed ? "flex-col" : "justify-between",
          ].join(" ")}
        >
          {collapsed ? (
            /* When collapsed, we use a group wrapper to swap the logo and expand button on hover */
            <div className="group relative flex h-8 w-8 items-center justify-center">
              <img
                src={logoUrl}
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
                className="absolute shrink-0 transition-opacity duration-200 group-hover:opacity-0"
              />
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                className={[
                  "absolute inset-0 flex h-8 w-8 items-center justify-center rounded-md",
                  "text-text-secondary opacity-0 transition-opacity duration-200",
                  "group-hover:opacity-100 hover:bg-nav-hover hover:text-text-primary",
                  "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                ].join(" ")}
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src={logoUrl}
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
                className="shrink-0"
              />
              <h1 className="font-sans text-brand font-bold text-text-primary">
                Kanbot
              </h1>
            </div>
          )}

          {showToggle && !collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                "text-text-secondary transition-colors duration-150",
                "hover:bg-nav-hover hover:text-text-primary",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              ].join(" ")}
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {selectedProject && projectBase && (
          <>
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              isCollapsed={collapsed}
            />

            <nav
              aria-label="Project navigation"
              className="flex w-full flex-col gap-1"
            >
              <NavTab
                to={`${projectBase}/backlog`}
                label="Project Backlog"
                icon={<BacklogIcon size={18} />}
                isCollapsed={collapsed}
                onClick={closeMobile}
              />
              <NavTab
                to={`${projectBase}/sprints`}
                label="Project Sprints"
                icon={<SprintsIcon size={18} />}
                isCollapsed={collapsed}
                onClick={closeMobile}
              />
              <NavTab
                to={`${projectBase}/board`}
                label="Active Sprint"
                icon={<ActiveSprintIcon size={18} />}
                isCollapsed={collapsed}
                onClick={closeMobile}
              />
            </nav>

            <hr className="w-full border-t border-border" />
          </>
        )}

        <nav
          aria-label="Main navigation"
          className="flex w-full flex-col gap-1"
        >
          <NavTab
            to="/projects"
            label="Projects"
            icon={<ProjectsIcon size={18} />}
            end
            isCollapsed={collapsed}
            onClick={closeMobile}
          />
        </nav>

        <div
          className={[
            "mt-auto w-full border-t border-border pt-4",
            collapsed ? "flex justify-center" : "flex flex-col gap-2",
          ].join(" ")}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={handleRequestLogOut}
              aria-label="Log out"
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                "text-text-secondary transition-colors duration-150",
                "hover:bg-nav-hover hover:text-text-primary",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              ].join(" ")}
            >
              <LogOutIcon size={20} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <UserCircleIcon
                size={36}
                strokeWidth={1.5}
                className="shrink-0 text-text-secondary"
              />
              <div className="min-w-0">
                <p className="truncate font-sans text-body font-bold text-text-primary leading-tight">
                  {user?.name ?? "—"}
                </p>
                <p className="truncate font-sans text-caption text-text-secondary leading-tight">
                  {user?.email ?? "—"}
                </p>
                <button
                  type="button"
                  onClick={handleRequestLogOut}
                  className="mt-1 font-sans text-caption text-text-secondary underline transition-colors duration-150 hover:text-text-primary"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeMobile}
        className={[
          "fixed inset-0 z-30 bg-text-primary/40 md:hidden",
          "transition-opacity duration-300",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <aside
        aria-label="Mobile navigation"
        data-open={isMobileOpen}
        className="sidebar-drawer-panel fixed inset-y-0 left-0 z-40 w-[240px] shrink-0 border-r border-border bg-background shadow md:hidden"
      >
        {renderSidebarContent(false, false)}
      </aside>

      <aside
        aria-label="Desktop navigation"
        className={[
          "hidden h-screen shrink-0 flex-col border-r border-border bg-background md:flex",
          "transition-[width] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isCollapsed ? "w-[64px]" : "w-[240px]",
        ].join(" ")}
      >
        {renderSidebarContent(isCollapsed, true)}
      </aside>

      <ConfirmDialog
        title="Log out"
        message="Are you sure you want to log out? You will need to sign in again to continue."
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogOut}
        confirmLabel="Log out"
      />
    </>
  );
}
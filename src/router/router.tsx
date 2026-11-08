import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { AuthSessionGate } from '../features/auth/components/AuthSessionGate'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    element: <AuthSessionGate />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            path: '/login',
            lazy: () =>
              import('../features/auth/pages/LoginPage').then((m) => ({
                Component: m.LoginPage,
              })),
          },
          {
            path: '/register',
            lazy: () =>
              import('../features/auth/pages/RegisterPage').then((m) => ({
                Component: m.RegisterPage,
              })),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <Navigate to="/projects" replace />,
          },
          {
            lazy: () =>
              import('../components/layout/AppLayout').then((m) => ({
                Component: m.AppLayout,
              })),
            children: [
              {
                path: '/projects',
                lazy: () =>
                  import('../features/projects/pages/ProjectsPage').then((m) => ({
                    Component: m.ProjectsPage,
                  })),
              },
              {
                path: '/projects/:projectId',
                element: <Outlet />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="backlog" replace />,
                  },
                  {
                    path: 'backlog',
                    lazy: () =>
                      import('../features/backlog/pages/BacklogPage').then((m) => ({
                        Component: m.BacklogPage,
                      })),
                  },
                  {
                    path: 'board',
                    lazy: () =>
                      import('../features/sprints/pages/ActiveSprintPage').then((m) => ({
                        Component: m.ActiveSprintPage,
                      })),
                  },
                  {
                    path: 'sprints',
                    lazy: () =>
                      import('../features/sprints/pages/SprintsPage').then((m) => ({
                        Component: m.SprintsPage,
                      })),
                  },
                  {
                    path: 'sprints/:sprintId',
                    lazy: () =>
                      import('../features/sprints/pages/SprintsPage').then((m) => ({
                        Component: m.SprintsPage,
                      })),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: () =>
      import('./NotFoundPage').then((m) => ({
        Component: m.NotFoundPage,
      })),
  },
])
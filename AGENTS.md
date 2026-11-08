# Client — Agent Guide

This document is the authoritative reference for any AI agent working on the
`client` package. Read it before touching any file. It describes the project's
architecture, the patterns in use, and the rules that must be followed so that
new code stays consistent with the rest of the codebase.

---

## Project Overview

Kanbot client is a React 19 + TypeScript single-page application built with
Vite. It is a project-management / Kanban tool that lets users manage projects,
plan sprints, work a backlog, move todos on a board, and generate content with
an AI assistant.

---

## Tech Stack

| Library | Purpose | Notes |
|---|---|---|
| React 19 | UI framework | Strict Mode enabled |
| TypeScript ^5.9 | Type safety | `strict` mode |
| Vite 8 | Build tool & dev server | |
| React Router ^8 | Client-side routing | `createBrowserRouter` |
| TanStack Query v5 | Server state & caching | `QueryClientProvider` in `main.tsx` |
| Zustand v5 | Client / UI state | One store per concern |
| Axios | HTTP client | Single shared instance `apiClient` |
| React Hook Form v7 | Form state | Always paired with Zod |
| Zod v4 | Schema validation | Schemas live in `features/*/schemas/` |
| @dnd-kit | Drag and drop | Only DnD library in use |
| Tailwind CSS v4 | Styling | Utility classes only, no custom CSS files |
| lucide-react | Icons | Only icon library in use |
| date-fns | Date utilities | |
| react-markdown | Markdown rendering | Used for AI-generated content |

---

## Directory Map

```
client/
├── src/
│   ├── api/
│   │   └── client.ts          # Single axios instance + auth interceptors
│   ├── components/            # Reusable, domain-agnostic UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── FormField.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── TodoDetailsModal.tsx
│   │   ├── common/            # Generic building blocks (Modal, QueryState, etc.)
│   │   └── layout/            # AppLayout, Header, Sidebar, NavTab, ProjectSelector
│   ├── features/              # Feature slices — each is self-contained
│   │   ├── ai/                # AI API, hooks, host, chat, todo drafts, sprint plans, summaries
│   │   │   ├── api/           # AI endpoints and bulk-saving approved AI todo drafts
│   │   │   ├── components/    # AiFeatureHost, AssistantDrawer, dialogs
│   │   │   ├── hooks/         # AI status/chat/generation/planning/summary queries and mutations
│   │   │   ├── schemas/       # Generate-todos and sprint-plan form schemas
│   │   │   └── store/         # Active AI workflow and project-scoped chat history
│   │   ├── auth/              # Login, register, session gate
│   │   │   └── hooks/         # useLogin, useRegister
│   │   ├── backlog/           # Backlog board, todo rows, sprint modals, drag-and-drop
│   │   ├── board/             # Sprint board drag-and-drop
│   │   │   └── hooks/         # useBoardDragDrop
│   │   ├── projects/          # Project list, create/edit/delete project
│   │   │   └── hooks/         # useProjects, useCreateProject, useUpdateProject, useDeleteProject
│   │   ├── sprints/           # Active sprint board, sprint history, AI workflow triggers
│   │   │   └── hooks/         # useProjectSprints, useActiveSprint, useActiveSprintBoard,
│   │   │                      # useCreateSprint, useUpdateSprint, useDeleteSprint,
│   │   │                      # useStartSprint, useCompleteSprint
│   │   └── todos/             # Todo API functions + hooks (no components)
│   │       └── hooks/         # useCreateTodo, useUpdateTodo, useDeleteTodo,
│   │                          # useMoveTodo, useBacklogTodos
│   ├── hooks/                 # Global cross-feature hooks only (useAuthSession, useDebounce, useProjectId)
│   ├── lib/
│   │   └── extractError.ts    # Single utility for human-readable API errors
│   ├── router/                # Route definitions, guards, and 404 page
│   ├── types/
│   │   └── api.ts             # API contract — single source of truth for all types
│   ├── main.tsx               # App entry point
│   ├── queryClient.ts         # Shared QueryClient instance
│   └── index.css              # Global Tailwind base styles
```

### Feature slice internal layout

Each feature follows the same internal structure. Only create the subdirectories
that are needed — do not add empty folders.

```
features/<name>/
├── api/        # Plain async functions that call apiClient. No hooks here.
├── components/ # React components used only within this feature.
├── hooks/      # Hooks that are local to this feature only.
├── pages/      # Top-level page components mounted by the router.
├── schemas/    # Zod schemas + inferred TypeScript form-value types.
└── store/      # Zustand stores for UI / client state.
```

---

## Data Flow

```
Page / Component
      │
      │ calls
      ▼
features/*/hooks/use*.ts   ← Feature-scoped TanStack Query hooks (useQuery / useMutation)
src/hooks/use*.ts          ← Global / cross-feature hooks (useAuthSession, useDebounce, useProjectId)
      │                         All query keys defined in the hook.
      │ calls
      ▼
features/*/api/*Api.ts     ← Pure async functions, no React
      │
      │ calls
      ▼
src/api/client.ts          ← Single axios instance
      │                         Attaches Bearer token (from authStore).
      │                         Handles global 401 → redirect to login.
      ▼
Backend API (VITE_API_URL)

AI workflow UI is mounted once by AppLayout:
features/<caller>/components trigger
      │ dispatches workflow/context
      ▼
features/ai/store/assistantStore.ts
      │
      ▼
features/ai/components/AiFeatureHost.tsx
      │ renders AI drawer/dialog; components use AI hooks

      ╔═══════════════════════════════════╗
      ║  Zustand store sync (side-effect) ║
      ║  useQuery data → useEffect →      ║
      ║  store.setXxx(data)               ║
      ╚═══════════════════════════════════╝
```

---

## Pattern Rules

### API calls

- ✅ Always import `apiClient` from `src/api/client.ts` and call it inside a
  function in `features/<name>/api/<name>Api.ts`.
- ✅ Type the axios call with the exact response type from `src/types/api.ts`:
  `apiClient.get<ProjectListResponse>(…)`.
- ✅ Destructure `{ data }` from the axios response and return only `data` (or
  the relevant nested property, e.g. `data.project`).
- ❌ Never create a second axios instance.
- ❌ Never use `fetch` directly.
- ❌ Never call `apiClient` from inside a component or hook — only from an api
  module.
- ❌ Never inline API base URL strings — always rely on `apiClient.baseURL`.

---

### Data fetching & mutations

- ✅ Hooks that serve a single feature live in `features/<name>/hooks/`. This
  is where the vast majority of `useQuery` and `useMutation` hooks belong.
- ✅ Only hooks that are genuinely used across multiple features (currently
  `useAuthSession`, `useDebounce`, `useProjectId`) live in `src/hooks/`.
- ✅ Use `useQuery` for reads. Return the full query object or a narrowed shape,
  depending on what callers need.
- ✅ Mutation hooks return a stable object:
  `{ <verb>: mutation.mutate, isPending, errorMessage, reset }`.
  Use `extractErrorMessage` from `src/lib/extractError.ts` to produce
  `errorMessage`.
- ✅ On mutation success, invalidate the relevant query keys with
  `queryClient.invalidateQueries`. Follow the key hierarchy in the Query Keys
  section below.
- ✅ Keep AI HTTP functions in `features/ai/api/aiApi.ts` and AI query/mutation
  hooks in `features/ai/hooks/`, including sprint summaries.
- ✅ Reuse existing todo and sprint hooks for saving approved AI drafts and
  creating a sprint; AI suggestions themselves must not mutate project data.
- ✅ Gate queries on required IDs with `enabled: Boolean(projectId)` so they
  don't fire on empty strings.
- ❌ Never store server data in Zustand directly from a mutation — invalidate
  the query instead and let React Query refetch.
- ❌ Never call `queryClient.setQueryData` unless you have a very specific
  optimistic-update reason and you know the exact cache shape.
- ❌ Never duplicate query key arrays — define them once in the hook, not
  scattered across components.

---

### State management (Zustand)

- ✅ Client / UI state (modal open, selected item, auth token) goes in a Zustand
  store inside `features/<name>/store/`.
- ✅ Define a TypeScript `interface` for the store state and actions before
  calling `create<Interface>(…)`.
- ✅ The auth store uses the `persist` middleware (localStorage key
  `'kanbot-token'`). All other stores are plain `create(…)` — no middleware.
- ✅ Modal stores follow the pattern: `{ isOpen, open(payload?), close() }` or
  a discriminated union `modal: SprintModal | null` for multi-modal hosts.
- ✅ The AI feature uses `assistantStore` with a discriminated `workflow`
  (`drawer`, `generateTodos`, `planSprint`, `sprintSummary`) and the context
  needed by that workflow. `AiFeatureHost` is mounted once in `AppLayout`.
- ✅ Other features open AI UI through store actions (for example,
  `openGenerateTodos`, `openPlanSprint`, or `openSprintSummary`). They must not
  import AI drawer/dialog components directly.
- ✅ Keep project-scoped chat history in the AI store and clear it when opening
  an AI workflow for a different project. Keep server entities and query
  results in TanStack Query, not Zustand.
- ❌ Never store server data (todos, sprints, projects) in Zustand unless it is
  a derived mirror synced from React Query (see below).
- ❌ Never add `persist` to a store that doesn't need cross-session state.
- ❌ Never add a Zustand store to `src/hooks/` — stores belong in
  `features/<name>/store/`.

---

### React Query ↔ Zustand sync

When React Query fetched data also needs to be accessible synchronously (e.g.
the project list, used by the sidebar before a query resolves), mirror it into
a Zustand store via `useEffect` inside the hook:

```ts
// ✅ Correct sync pattern — from useProjects.ts
useEffect(() => {
  if (query.data) {
    setProjects(query.data.projects)
  }
}, [query.data, setProjects])
```

- ✅ React Query is always the source of truth. The Zustand store is a mirror.
- ❌ Never write to the mirror store from anywhere other than the dedicated
  sync hook.
- ❌ Never read from the mirror store as a substitute for calling the query hook.

---

### Forms & validation

- ✅ Use `react-hook-form` + `zodResolver` for every form.
- ✅ Define the Zod schema in `features/<name>/schemas/<name>Schema.ts` and
  export both the schema and its inferred type: `z.infer<typeof schema>`.
- ✅ Pass the inferred type as the generic to `useForm<FormValues>`.
- ✅ Use the `<FormField>` and `<Input>` components from `src/components/` to
  render labelled, accessible inputs.
- ❌ Never define a Zod schema inline inside a component file.
- ❌ Never use uncontrolled refs or plain `useState` for form fields — always
  use `react-hook-form`.

---

### Routing & route guards

- ✅ All routes are declared in `src/router/router.tsx`.
- ✅ The route tree nests: `AuthSessionGate` → `GuestRoute` | `ProtectedRoute`
  → `AppLayout` → page components.
- ✅ `AuthSessionGate` verifies the session on load via `useAuthSession`.
  `ProtectedRoute` redirects unauthenticated users to `/login?redirect=…`.
  `GuestRoute` redirects authenticated users away from `/login` and `/register`.
- ✅ Read the current project id with `useProjectId()` (wraps `useParams`).
- ✅ `AppLayout` passes the `projectsQuery` result as Outlet context — read it
  in child pages with `useOutletContext<ProjectsQuery>()`.
- ❌ Never call `useParams()` and destructure `projectId` yourself — use
  `useProjectId()`.
- ❌ Never add route-level auth logic inside page components — use the guard
  wrappers in `src/router/`.

---

### Components — shared vs feature

- ✅ If a component is domain-agnostic (Button, Input, Modal, QueryState, etc.),
  put it in `src/components/` or `src/components/common/`.
- ✅ If a component only makes sense inside one feature, put it in
  `features/<name>/components/`.
- ✅ Use `<QueryState isLoading isError error>` at the page level to render
  loading and error states — do not write ad-hoc loading spinners in pages.
- ✅ Prefer `lucide-react` for every icon — do not add another icon library.
- ❌ Never import a feature-specific component from a different feature's
  folder. Cross-feature UI must be promoted to `src/components/`.
- ✅ To open AI UI from another feature, dispatch an action through
  `features/ai/store/assistantStore.ts`; `AiFeatureHost` in `AppLayout` owns
  rendering AI drawers and dialogs. Keep only the trigger in the calling
  feature.
- ❌ Never embed Tailwind `@apply` or custom CSS — use utility classes only.

---

### Error handling

- ✅ Use `extractErrorMessage(error)` from `src/lib/extractError.ts` to convert
  any unknown error (especially Axios errors) into a user-facing string.
- ✅ Display errors with the `<ErrorBanner message={…} />` component.
- ✅ The API contract type `ApiErrorBody` (from `src/types/api.ts`) defines the
  error envelope shape — `error.response.data.error.message` is safe to show
  to users.
- ❌ Never `console.error` as a substitute for showing errors to the user.
- ❌ Never write your own axios-error parsing logic — use `extractErrorMessage`.

---

### Drag and drop

- ✅ Use `@dnd-kit/core` and `@dnd-kit/sortable` — the only DnD library in use.
- ✅ Backlog reordering uses `useSortable` with a `containerId` in the item
  data. Board column moves use `useBoardDragDrop` from
  `features/board/hooks/useBoardDragDrop.ts`.
- ✅ Apply optimistic UI updates immediately in `handleDragEnd`, then call the
  mutation. On error, roll back to the previous state.
- ✅ Disable drag when filters are active (`dragDisabled={filters.hasActive}`).
- ❌ Never use `react-beautiful-dnd`, HTML5 drag API, or any other DnD library.

---

### Modal state

- ✅ Modal open/close state lives in a Zustand store in
  `features/<name>/store/`. This lets any component open the modal without
  prop drilling.
- ✅ For a feature with multiple mutually exclusive modals, use a discriminated
  union as the store payload (see `sprintModalStore.ts`).
- ✅ The `<Modal>` primitive is in `src/components/common/Modal.tsx`.
- ❌ Never lift modal state into a page component unless the modal is truly
  local and will never be triggered from a sibling component.

---

## Query Key Conventions

All query keys follow a hierarchical array pattern. Use these exact keys when
calling `invalidateQueries` — broader keys (shorter arrays) invalidate all
matching sub-keys.

| Data | Query Key |
|---|---|
| Project list | `['projects']` |
| Single project | `['projects', projectId]` |
| Project sprints | `['projects', projectId, 'sprints']` |
| All todos in a project | `['projects', projectId, 'todos']` |
| Backlog todos (filtered) | `['projects', projectId, 'todos', 'backlog', filters]` |
| Sprint board | `['sprints', sprintId, 'board']` |
| Sprint detail used by AI summary | `['sprints', sprintId]` |
| AI mode/status | `['ai', 'status']` |
| Auth session | `['auth', 'me']` |

When a mutation affects a resource, invalidate it and every parent key that
includes a count or stat derived from that resource. For example, creating a
todo invalidates both `['projects', projectId, 'todos']` and `['projects']`
(the project list carries `backlogCount` stats).

---

## Where Does New Code Go?

| What you are adding | Where it lives |
|---|---|
| New HTTP call to the API | `features/<name>/api/<name>Api.ts` |
| New `useQuery` or `useMutation` hook for a feature | `features/<name>/hooks/use<Name>.ts` |
| Hook used across multiple features | `src/hooks/use<Name>.ts` |
| Reusable UI primitive (no domain knowledge) | `src/components/` or `src/components/common/` |
| UI component specific to one feature | `features/<name>/components/` |
| New page mounted by the router | `features/<name>/pages/<Name>Page.tsx` + add route in `src/router/router.tsx` |
| Zod form schema | `features/<name>/schemas/<name>Schema.ts` |
| Zustand store | `features/<name>/store/<name>Store.ts` |
| New API request/response type | `src/types/api.ts` only |
| New route guard | `src/router/` |
| Shared utility function | `src/lib/<name>.ts` |
| AI workflow opened from another feature | Dispatch through `features/ai/store/assistantStore.ts`; render in `AiFeatureHost` |

---

## API Contract

All request/response types are defined in `src/types/api.ts`. This file is the
single source of truth — never define duplicate types elsewhere. Refer to it
for entity shapes (`Todo`, `Sprint`, `Project`, `User`), request bodies
(`CreateTodoRequest`, `MoveTodoRequest`, etc.), and error envelopes
(`ApiErrorBody`, `ErrorCode`).

## AI Feature

The client AI feature is implemented in `features/ai/`; keep its API calls,
TanStack Query hooks, schemas, UI, and workflow state there:

- `api/aiApi.ts` contains typed functions for AI status, chat, todo generation,
  sprint planning, sprint summaries, and saving approved todo drafts.
- `hooks/` owns status queries and AI mutations, error extraction, and cache
  invalidation.
- `components/` contains `AiFeatureHost`, `AssistantDrawer`,
  `GenerateTodosDialog`, `PlanSprintDialog`, and `SprintSummaryDialog`.
- `schemas/` contains the Zod form schemas used by the AI dialogs.
- `store/assistantStore.ts` holds the active workflow, project/sprint context,
  and chat history. TanStack Query remains the source of truth for server data.

`AppLayout` mounts `AiFeatureHost` once. Backlog and sprint UI open AI workflows
through store actions rather than importing AI components. The assistant drawer
offers chat, todo generation, sprint planning, and a summary action for the
active sprint. Sprint screens can also trigger a summary for a specific sprint.
Todo suggestions are saved only after user review; sprint plans are created
only after confirmation. The summary dialog loads an existing sprint summary,
can generate or regenerate it, and the server persists it.

AI requests use the shared authenticated `apiClient` and API contract types.
The server can return mock responses when no provider key is configured; the
client displays the mock-mode indicator and should never contain provider
credentials.

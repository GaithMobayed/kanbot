import { apiClient } from '../../../api/client'
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintBoardResponse,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from '../../../types/api'

export async function fetchProjectSprints(
  projectId: string,
): Promise<SprintListResponse> {
  const { data } = await apiClient.get<SprintListResponse>(
    `/projects/${projectId}/sprints`,
  )
  return data
}

export async function fetchSprintBoard(
  sprintId: string,
): Promise<SprintBoardResponse> {
  const { data } = await apiClient.get<SprintBoardResponse>(
    `/sprints/${sprintId}/todos`,
  )
  return data
}

export async function createSprint(
  projectId: string,
  body: CreateSprintRequest,
): Promise<{ sprint: Sprint }> {
  const { data } = await apiClient.post<{ sprint: Sprint }>(
    `/projects/${projectId}/sprints`,
    body,
  )
  return data
}

export async function updateSprint(
  sprintId: string,
  body: UpdateSprintRequest,
): Promise<{ sprint: Sprint }> {
  const { data } = await apiClient.patch<{ sprint: Sprint }>(
    `/sprints/${sprintId}`,
    body,
  )
  return data
}

export async function deleteSprint(sprintId: string): Promise<void> {
  await apiClient.delete(`/sprints/${sprintId}`)
}

export async function startSprint(
  sprintId: string,
  body?: StartSprintRequest,
): Promise<{ sprint: Sprint }> {
  const { data } = await apiClient.post<{ sprint: Sprint }>(
    `/sprints/${sprintId}/start`,
    body ?? {},
  )
  return data
}

export async function completeSprint(
  sprintId: string,
  body: CompleteSprintRequest,
): Promise<{ sprint: Sprint }> {
  const { data } = await apiClient.post<{ sprint: Sprint }>(
    `/sprints/${sprintId}/complete`,
    body,
  )
  return data
}

import { apiClient } from '../../../api/client'
import type {
  AiStatusResponse,
  BulkCreateTodosRequest,
  BulkCreateTodosResponse,
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
  Sprint,
  SprintSummaryResponse,
} from '../../../types/api'


export async function fetchAiStatus(): Promise<AiStatusResponse> {
  const { data } = await apiClient.get<AiStatusResponse>('/ai/status')
  return data
}


export async function generateTodos(
  projectId: string,
  body: GenerateTodosRequest,
): Promise<GenerateTodosResponse> {
  const { data } = await apiClient.post<GenerateTodosResponse>(
    `/projects/${projectId}/ai/generate-todos`,
    body,
  )
  return data
}


export async function planSprint(
  projectId: string,
  body: PlanSprintRequest,
): Promise<PlanSprintResponse> {
  const { data } = await apiClient.post<PlanSprintResponse>(
    `/projects/${projectId}/ai/plan-sprint`,
    body,
  )
  return data
}


export async function chat(
  projectId: string,
  body: ChatRequest,
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(
    `/projects/${projectId}/ai/chat`,
    body,
  )
  return data
}


export async function fetchSprintForSummary(
  sprintId: string,
): Promise<{ sprint: Sprint }> {
  const { data } = await apiClient.get<{ sprint: Sprint }>(`/sprints/${sprintId}`)
  return data
}


export async function summarizeSprint(
  sprintId: string,
): Promise<SprintSummaryResponse> {
  const { data } = await apiClient.post<SprintSummaryResponse>(
    `/sprints/${sprintId}/ai/summary`,
  )
  return data
}


export async function bulkCreateTodos(
  projectId: string,
  body: BulkCreateTodosRequest,
): Promise<BulkCreateTodosResponse> {
  const { data } = await apiClient.post<BulkCreateTodosResponse>(
    `/projects/${projectId}/todos/bulk`,
    body,
  )
  return data
}

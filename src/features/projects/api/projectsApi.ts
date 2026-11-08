import { apiClient } from '../../../api/client'
import type {
  CreateProjectRequest,
  ProjectListResponse,
  ProjectWithStats,
  UpdateProjectRequest,
} from '../../../types/api'

interface ProjectResponse {
  project: ProjectWithStats
}


export async function fetchProjects(): Promise<ProjectListResponse> {
  const { data } = await apiClient.get<ProjectListResponse>('/projects')
  return data
}


export async function createProject(body: CreateProjectRequest): Promise<ProjectWithStats> {
  const { data } = await apiClient.post<ProjectResponse>('/projects', body)
  return data.project
}


export async function updateProject(
  id: string,
  body: UpdateProjectRequest,
): Promise<ProjectWithStats> {
  const { data } = await apiClient.patch<ProjectResponse>(`/projects/${id}`, body)
  return data.project
}


export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`)
}

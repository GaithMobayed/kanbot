import { apiClient } from '../../../api/client'
import type {
  CreateTodoRequest,
  MoveTodoRequest,
  Todo,
  TodoListQuery,
  TodoListResponse,
  UpdateTodoRequest,
} from '../../../types/api'

interface TodoResponse {
  todo: Todo
}

export async function fetchTodo(todoId: string): Promise<Todo> {
  const { data } = await apiClient.get<TodoResponse>(`/todos/${todoId}`)
  return data.todo
}






export async function fetchTodos(
  projectId: string,
  query?: TodoListQuery,
): Promise<TodoListResponse> {
  const { data } = await apiClient.get<TodoListResponse>(
    `/projects/${projectId}/todos`,
    { params: query },
  )
  return data
}







export async function createTodo(
  projectId: string,
  body: CreateTodoRequest,
): Promise<Todo> {
  const { data } = await apiClient.post<Todo>(
    `/projects/${projectId}/todos`,
    body,
  )
  return data
}

export async function updateTodo(
  todoId: string,
  body: UpdateTodoRequest,
): Promise<Todo> {
  const { data } = await apiClient.patch<TodoResponse>(`/todos/${todoId}`, body)
  return data.todo
}

export async function deleteTodo(todoId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}`)
}

export async function moveTodo(
  todoId: string,
  body: MoveTodoRequest,
): Promise<Todo> {
  const { data } = await apiClient.post<TodoResponse>(
    `/todos/${todoId}/move`,
    body,
  )
  return data.todo
}


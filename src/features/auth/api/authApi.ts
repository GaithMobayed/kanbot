import { apiClient } from '../../../api/client'
import type {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from '../../../types/api'

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', body)
  return data
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', body)
  return data
}

export async function fetchCurrentUser(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/auth/me')
  return data
}

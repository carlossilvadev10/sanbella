import axiosInstance from './axiosInstance'
import { LoginRequest, LoginResponse } from '@/types'

export const authApi = {
  login: (credentials: LoginRequest) =>
    axiosInstance.post<LoginResponse>('/api/auth/login', credentials),

  registro: (data: Record<string, unknown>) =>
    axiosInstance.post('/api/auth/registro', data),

  forgotPassword: (data: { email: string }) =>
    axiosInstance.post('/api/auth/forgotPassword', data),

  resetPassword: (data: { email: string; codigo: string; newPassword: string }) =>
    axiosInstance.post('/api/auth/resetPassword', data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.patch('/api/auth/updatePassword', data),
}

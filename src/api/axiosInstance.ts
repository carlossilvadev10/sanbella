import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// En producción usamos ruta relativa (proxy de Vercel a través de vercel.json)
// En desarrollo, fallback al backend directo
const BASE_URL: string = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD
    ? ''
    : 'http://ec2-16-59-188-126.us-east-2.compute.amazonaws.com:9323/sanbella-web-api'
)

// Endpoints de autenticación: nunca enviar token (incluso si existe uno guardado expirado)
const AUTH_API_PATHS = [
  '/api/auth/login',
  '/api/auth/registro',
  '/api/auth/forgotPassword',
  '/api/auth/resetPassword',
]

// Rutas públicas del frontend: si hay 401 estando aquí, NO redirigir a login
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/book']

const isAuthApi = (url?: string) =>
  !!url && AUTH_API_PATHS.some((p) => url.includes(p))

const isOnPublicRoute = () =>
  PUBLIC_ROUTES.some((r) => window.location.pathname.startsWith(r))

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isAuthApi(config.url)) return config
    const token = localStorage.getItem('sanbella_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isOnPublicRoute() && !isAuthApi(error.config?.url)) {
      localStorage.removeItem('sanbella_token')
      localStorage.removeItem('sanbella_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

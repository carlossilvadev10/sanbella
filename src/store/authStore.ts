import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LoginResponse } from '@/types'

interface AuthState {
  token: string | null
  user: LoginResponse | null
  isAuthenticated: boolean
  setAuth: (token: string, user: LoginResponse) => void
  logout: () => void
  hasRole: (role: string) => boolean
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: LoginResponse) => {
        localStorage.setItem('sanbella_token', token)
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('sanbella_token')
        set({ token: null, user: null, isAuthenticated: false })
      },

      hasRole: (role: string): boolean => {
        const { user } = get()
        return user?.rolCodigo === role || user?.rolNombre === role
      },
    }),
    {
      name: 'sanbella_auth',
      partialize: (state) => ({
        token:           state.token,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore

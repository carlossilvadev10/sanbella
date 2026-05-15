import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

import AdminLayout from '@/components/Layout/AdminLayout'

// Auth
import LoginPage           from '@/pages/Login/LoginPage'
import ForgotPasswordPage  from '@/pages/Login/ForgotPasswordPage'
import ChangePasswordPage  from '@/pages/Login/CambiarPasswordPage'

// Admin
import DashboardPage          from '@/pages/Dashboard/DashboardPage'
import ReservationsListPage   from '@/pages/Reservas/ReservasListPage'
import ReservationDetailPage  from '@/pages/Reservas/ReservaDetallePage'
import ConfirmReservationPage from '@/pages/Reservas/ConfirmarReservaPage'
import SchedulePage           from '@/pages/Agenda/AgendaPage'
import UsersListPage          from '@/pages/Usuarios/UsuariosListPage'

// Public portal
import NewReservationPage from '@/pages/Reservas/NuevaReservaPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition:   true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/book"            element={<NewReservationPage />} />

        {/* Admin — protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"               element={<DashboardPage />} />
          <Route path="schedule"                element={<SchedulePage />} />
          <Route path="reservations"            element={<ReservationsListPage />} />
          <Route path="reservations/:id"        element={<ReservationDetailPage />} />
          <Route path="reservations/confirm"    element={<ConfirmReservationPage />} />
          <Route path="users"                   element={<UsersListPage />} />
          <Route path="profile/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

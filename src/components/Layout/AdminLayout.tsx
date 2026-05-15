import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Users, LogOut,
  Menu, X, CalendarDays, Lock, ClipboardCheck, ChevronDown,
  Inbox,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import useAuthStore from '@/store/authStore'

interface NavLeaf { to: string; icon: LucideIcon; label: string; end?: boolean }
interface NavGroup { label: string; icon: LucideIcon; children: NavLeaf[] }
type NavEntry = NavLeaf | NavGroup

const NAV_ITEMS: NavEntry[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/schedule',  icon: CalendarDays,    label: 'Agenda' },
  {
    label: 'Reservas',
    icon:  CalendarCheck,
    children: [
      { to: '/reservations',         icon: Inbox,           label: 'Bandeja',           end: true },
      { to: '/reservations/confirm', icon: ClipboardCheck,  label: 'Confirmar reserva', end: true },
    ],
  },
  { to: '/users', icon: Users, label: 'Usuarios' },
]

const isGroup = (item: NavEntry): item is NavGroup => 'children' in item

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  // Estado de cada grupo (abierto/cerrado). Se inicializa abierto si una de sus rutas está activa.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    NAV_ITEMS.forEach((it) => {
      if (isGroup(it)) {
        initial[it.label] = it.children.some((c) => location.pathname.startsWith(c.to))
      }
    })
    return initial
  })

  // Al navegar dentro de un grupo, lo mantenemos abierto
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      NAV_ITEMS.forEach((it) => {
        if (isGroup(it) && it.children.some((c) => location.pathname.startsWith(c.to))) {
          next[it.label] = true
        }
      })
      return next
    })
  }, [location.pathname])

  const toggleGroup = (label: string) =>
    setOpenGroups((p) => ({ ...p, [label]: !p[label] }))

  const renderLeaf = (leaf: NavLeaf, indent = false) => {
    const Icon = leaf.icon
    return (
      <NavLink
        key={leaf.to}
        to={leaf.to}
        end={leaf.end}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
          ${indent && isSidebarOpen ? 'pl-9' : ''}
          ${isActive ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`
        }
      >
        <Icon size={indent ? 16 : 18} className="flex-shrink-0" />
        {isSidebarOpen && <span className="truncate">{leaf.label}</span>}
      </NavLink>
    )
  }

  const renderGroup = (group: NavGroup) => {
    const Icon = group.icon
    const isOpen = openGroups[group.label]
    const isChildActive = group.children.some((c) => location.pathname.startsWith(c.to))

    // Sidebar colapsado: muestra solo el ícono del grupo (al hacer click navega al primer hijo)
    if (!isSidebarOpen) {
      return (
        <NavLink
          key={group.label}
          to={group.children[0].to}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${isChildActive ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          title={group.label}
        >
          <Icon size={18} className="flex-shrink-0" />
        </NavLink>
      )
    }

    return (
      <div key={group.label}>
        <button
          type="button"
          onClick={() => toggleGroup(group.label)}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${isChildActive ? 'text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
        >
          <Icon size={18} className="flex-shrink-0" />
          <span className="truncate flex-1 text-left">{group.label}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? '' : '-rotate-90'} opacity-60`}
          />
        </button>
        {isOpen && (
          <div className="mt-0.5 space-y-0.5">
            {group.children.map((c) => renderLeaf(c, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-neutral-950 text-white transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'w-60' : 'w-16'}`}>
        <div className="flex items-center gap-3 px-4 h-16 border-b border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-sm">S</span>
          </div>
          {isSidebarOpen && <span className="font-display font-semibold text-white text-lg truncate">Sanbella</span>}
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => isGroup(item) ? renderGroup(item) : renderLeaf(item))}
        </nav>

        <div className="border-t border-neutral-800 p-3 space-y-1">
          {isSidebarOpen && user && (
            <div className="px-2 pb-2">
              <p className="text-xs font-medium text-white truncate">{user.nombre ?? user.correo}</p>
              <p className="text-xs text-neutral-500 truncate">{user.rolNombre ?? 'Sin rol'}</p>
            </div>
          )}
          <NavLink
            to="/profile/change-password"
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`
            }
          >
            <Lock size={18} className="flex-shrink-0" />
            {isSidebarOpen && <span>Cambiar contraseña</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all duration-150"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {isSidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center gap-4 px-6 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen((s) => !s)} className="btn-ghost p-2" aria-label="Toggle sidebar">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="font-medium text-neutral-900 text-sm">Sistema de Reservas</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 fade-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

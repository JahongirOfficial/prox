import { Link, useLocation } from 'react-router-dom'
import { Home, GraduationCap, Wallet, FolderOpen, User, LayoutDashboard, FileText, X, LogOut } from 'lucide-react'

interface SidebarProps {
  isLoggedIn: boolean
  userRole?: string | null
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  'home': <Home className="w-5 h-5" />,
  'school': <GraduationCap className="w-5 h-5" />,
  'account_balance_wallet': <Wallet className="w-5 h-5" />,
  'folder': <FolderOpen className="w-5 h-5" />,
  'person': <User className="w-5 h-5" />,
  'dashboard': <LayoutDashboard className="w-5 h-5" />,
  'assignment': <FileText className="w-5 h-5" />,
}

export default function Sidebar({ isLoggedIn, userRole = null, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation()

  const publicMenuItems = [
    { path: '/academy', label: 'Akademiya', icon: 'school' },
    { path: '/students', label: "O'quvchilar", icon: 'school' },
    { path: '/debtors', label: "Qarzdor o'quvchilar", icon: 'account_balance_wallet' },
    { path: '/projects', label: 'Loyihalarimiz', icon: 'folder' },
    { path: '/login', label: 'Profil', icon: 'person' },
  ]

  const privateMenuItems = [
    { path: '/dashboard', label: 'Bosh sahifa', icon: 'dashboard' },
    { path: '/students', label: "O'quvchilar", icon: 'school' },
    { path: '/debtors', label: "Qarzdor o'quvchilar", icon: 'account_balance_wallet' },
    { path: '/projects', label: 'Loyihalarimiz', icon: 'folder' },
    { path: '/tasks', label: 'Qadam topshirish', icon: 'assignment' },
  ]

  const adminMenuItems = [
    { path: '/dashboard', label: 'Bosh sahifa', icon: 'dashboard' },
    { path: '/students', label: "O'quvchilar", icon: 'school' },
    { path: '/debtors', label: "Qarzdor o'quvchilar", icon: 'account_balance_wallet' },
    { path: '/student-steps', label: "O'quvchilar qadamlari", icon: 'assignment' },
    { path: '/projects', label: 'Loyihalarimiz', icon: 'folder' },
    { path: '/tasks', label: 'Qadam topshirish', icon: 'assignment' },
  ]

  const studentMenuItems = [
    { path: '/', label: 'Bosh sahifa', icon: 'home' },
    { path: '/tasks', label: 'Qadam topshirish', icon: 'assignment' },
    { path: '/students', label: "O'quvchilar", icon: 'school' },
    { path: '/debtors', label: "Qarzdor o'quvchilar", icon: 'account_balance_wallet' },
    { path: '/projects', label: 'Loyihalarimiz', icon: 'folder' },
    { path: '/profile', label: 'Profilim', icon: 'person' },
  ]

  const menuItems = isLoggedIn
    ? (userRole === 'student' ? studentMenuItems : userRole === 'admin' ? adminMenuItems : privateMenuItems)
    : publicMenuItems

  let currentUser: any = null
  try {
    const raw = localStorage.getItem('user')
    currentUser = raw ? JSON.parse(raw) : null
  } catch { currentUser = null }

  return (
    <>
      {isMobileOpen && (
        <div onClick={onMobileClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-50 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">proX Academy</h1>
              <p className="text-xs text-slate-400">O'quv platformasi</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 sm:p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600" style={{ height: isLoggedIn ? 'calc(100vh - 240px)' : 'calc(100vh - 100px)' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                onClick={() => { if (window.innerWidth < 1024 && onMobileClose) onMobileClose() }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                <span className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}>
                  {iconMap[item.icon]}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {isLoggedIn ? (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-slate-700/50 bg-slate-900/95">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">{(currentUser?.fullName || 'A')[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{currentUser?.fullName || 'Foydalanuvchi'}</p>
                <p className="text-xs text-slate-400">{userRole === 'student' ? "O'quvchi" : 'Tizim administratori'}</p>
              </div>
              <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login' }}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-slate-700/50 bg-slate-900/95">
            <Link to="/" className="flex items-center justify-center p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-blue-400 transition-colors">
                  {iconMap['home']}
                </span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Bosh sahifa</span>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

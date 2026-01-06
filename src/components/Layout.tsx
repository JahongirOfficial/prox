import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  isLoggedIn: boolean
  userRole?: string | null
}

export default function Layout({ children, isLoggedIn, userRole = null }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Bosh sahifa'
    if (path === '/login') return 'Kirish'
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/students') return "O'quvchilar"
    if (path === '/debtors') return "Qarzdor o'quvchilar"
    if (path === '/projects') return 'Loyihalar'
    if (path === '/tasks') return 'Topshiriqlar'
    return 'proX Academy'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Top Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-white">{getPageTitle()}</h2>
            </div>
          </div>
          <div className="w-16 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
            <img src="/prox.png" alt="proX" className="w-full h-full object-contain" />
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar 
        isLoggedIn={isLoggedIn} 
        userRole={userRole}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-72 transition-all duration-300 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
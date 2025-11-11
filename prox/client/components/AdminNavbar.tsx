import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../Sidebar';
import { Menu, X, Home, BookOpen, Users, Settings, User, CreditCard, Monitor } from 'lucide-react';

export function AdminNavbar() {
  const navigate = useNavigate();
  const { isOpen, setIsOpen, activeTab, setActiveTab, activeProject, setActiveProject } = useSidebar();

  const handleMenuClick = (tab) => {
    try {
      setActiveTab(tab);
      setActiveProject('');
      setIsOpen(false);
      console.log('Admin menu clicked:', tab);

      // Use React Router navigation with error handling
      switch (tab) {
        case 'Bosh sahifa':
          navigate('/');
          break;
        case 'Kurslar':
          navigate('/courses');
          break;
        case 'O\'quvchilar loyihalari':
          navigate('/projects');
          break;
        case 'Kurslarim':
          navigate('/my-courses');
          break;
        default:
          console.warn('Unknown tab:', tab);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleProjectClick = (project) => {
    try {
      setActiveTab('O\'quvchilar loyihalari');
      setActiveProject(project);
      setIsOpen(false);
      console.log('Admin project clicked:', project);

      // Use React Router navigation with error handling
      switch (project) {
        case 'Blogs':
          navigate('/projects/blogs');
          break;
        case 'Resume Builder':
          navigate('/projects/resume');
          break;
        case 'Payments':
          navigate('/projects/payments');
          break;
        default:
          console.warn('Unknown project:', project);
      }
    } catch (error) {
      console.error('Project navigation error:', error);
    }
  };

  const handleProxOfflineClick = () => {
    try {
      setIsOpen(false);
      console.log('ProX Offline clicked from admin');
      navigate('/offline');
    } catch (error) {
      console.error('ProX Offline navigation error:', error);
    }
  };

  return (
    <>
      {/* Admin Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-white font-bold text-lg">ProX Admin</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Admin Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="pt-16 p-4 h-full overflow-y-auto">
          <div className="space-y-6">
            {/* MENU Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">MENU</h3>
              </div>
              <div className="space-y-1">
                {[
                  { title: 'Bosh sahifa', icon: Home },
                  { title: 'Kurslar', icon: BookOpen },
                  { title: 'O\'quvchilar loyihalari', icon: Users },
                  { title: 'Kurslarim', icon: BookOpen },
                ].map((item) => (
                  <button
                    key={item.title}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                      activeTab === item.title && !activeProject
                        ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => handleMenuClick(item.title)}
                    aria-label={`Navigate to ${item.title}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ProX Tools Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-orange-400 rounded-full"></div>
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">PROX TOOLS</h3>
              </div>
              <div className="space-y-1">
                <button
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start text-gray-300 hover:bg-slate-800 hover:text-white"
                  onClick={handleProxOfflineClick}
                  aria-label="Open ProX Offline"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="font-medium text-sm">ProX Offline</span>
                </button>
              </div>
            </div>

            {/* Admin Panel Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">ADMIN PANEL</h3>
              </div>
              <div className="space-y-1">
                <button
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                    activeProject === 'Blogs'
                      ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => handleProjectClick('Blogs')}
                  aria-label="Open Profile management"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">Profil</span>
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                    activeProject === 'Resume Builder'
                      ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => handleProjectClick('Resume Builder')}
                  aria-label="Open Security settings"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium text-sm">Xavfsizlik</span>
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                    activeProject === 'Payments'
                      ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => handleProjectClick('Payments')}
                  aria-label="Open Payment management"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium text-sm">To'lovlar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

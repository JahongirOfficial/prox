import React from 'react';
import { useSidebar } from './Sidebar';
import { Menu, X, Home, BookOpen, Users, Settings, User, CreditCard } from 'lucide-react';

export function MobileNavbar() {
  const { isOpen, setIsOpen, activeTab, setActiveTab, activeProject, setActiveProject, isLoggedIn } = useSidebar();

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    setActiveProject('');
    setIsOpen(false);
    console.log('Menu clicked:', tab);
  };

  const handleProjectClick = (project) => {
    setActiveTab('O\'quvchilar loyihalari');
    setActiveProject(project);
    setIsOpen(false);
    console.log('Project clicked:', project);
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-white font-bold text-lg">ProX Academy</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
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
        />
      )}

      {/* Mobile Sidebar */}
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
                ].map((item) => (
                  <button
                    key={item.title}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                      activeTab === item.title && !activeProject
                        ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => {
                      handleMenuClick(item.title);
                      setIsOpen(false); // Sidebar yopish
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User specific menu items */}
            {isLoggedIn && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Mening kurslarim</h3>
                </div>
                <div className="space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                      activeTab === 'Kurslarim'
                        ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => {
                      handleMenuClick('Kurslarim');
                      setIsOpen(false);
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium text-sm">Kurslarim</span>
                  </button>
                </div>
              </div>
            )}

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
                  onClick={() => {
                    handleProjectClick('Blogs');
                    setIsOpen(false);
                  }}
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
                  onClick={() => {
                    handleProjectClick('Resume Builder');
                    setIsOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium text-sm">Xavfsizlik</span>
                </button>
                {isLoggedIn && (
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                      activeProject === 'Payments'
                        ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => {
                      handleProjectClick('Payments');
                      setIsOpen(false);
                    }}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium text-sm">To'lovlar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

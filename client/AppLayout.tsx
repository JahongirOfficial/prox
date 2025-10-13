import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MobileNavbar, menuItems, userMenuItems } from "./pages/Index";
import { useState, useEffect } from "react";
import { User, Settings, CreditCard } from "lucide-react";

export default function AppLayout() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Bosh sahifa");
  const [activeProject, setActiveProject] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleMenuClick = (title: string) => {
    setActiveTab(title);
    setActiveProject("");
    if (title === "Bosh sahifa") navigate("/home");
    else if (title === "Kurslar") navigate("/courses");
    else if (title === "Kurslarim") navigate("/my-courses");
    else if (title === "O'quvchilar loyihalari" || title === "Loyihalar") navigate("/projects");
  };

  const handleProjectClick = (project: string) => {
    setActiveTab("Loyihalar");
    setActiveProject(project);
    if (project === "Blogs") navigate("/projects/blogs");
    else if (project === "Resume Builder") navigate("/projects/resume");
    else if (project === "Payments") navigate("/projects/payments");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <div className="md:hidden">
          <MobileNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            isLoggedIn={isLoggedIn}
            handleMenuClick={handleMenuClick}
            handleProjectClick={handleProjectClick}
          />
        </div>
        <div className="hidden md:block">
          <div className="w-64 h-screen sticky top-0 left-0 bg-slate-900 border-r border-slate-700 flex flex-col font-jetbrains text-left">
            {/* Menu Content - Same style as home page */}
            <div className="flex-1 p-4 space-y-6">
              {/* MENU Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider font-jetbrains">MENU</h3>
                </div>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.title}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${activeTab === item.title && !activeProject
                        ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      onClick={() => handleMenuClick(item.title)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">{item.title}</span>
                      {activeTab === item.title && !activeProject && (
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full ml-auto"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* User specific menu items - only show when logged in */}
              {isLoggedIn && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                    <h3 className="text-white font-semibold text-xs uppercase tracking-wider font-jetbrains">Mening kurslarim</h3>
                  </div>
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.title}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${activeTab === item.title && !activeProject
                          ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                          : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        onClick={() => handleMenuClick(item.title)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SOZLAMALAR Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider font-jetbrains">SOZLAMALAR</h3>
                </div>
                <div className="space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${activeProject === "Blogs"
                      ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    onClick={() => handleProjectClick("Blogs")}
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">Profil</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${activeProject === "Resume Builder"
                      ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    onClick={() => handleProjectClick("Resume Builder")}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">Xavfsizlik</span>
                  </button>
                  {isLoggedIn && (
                    <button
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${activeProject === "Payments"
                        ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      onClick={() => handleProjectClick("Payments")}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">To'lovlar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <SidebarInset id="main-scroll" className="flex-1 overflow-y-auto">
          {/* Top Navbar */}
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-sidebar-border">
            <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/images/prox.png" alt="ProX" className="h-8 w-auto" />
              </div>
              {/* Right actions removed as requested */}
            </div>
          </div>
          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
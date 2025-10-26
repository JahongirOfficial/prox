import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileNavbar } from '../components/MobileNavbar'
import { SidebarInset, SidebarProvider } from '../components/Sidebar'
import ProxOffline from './ProxOffline'

// Home content component
function HomeContent({ onProxOfflineClick }) {
  return (
    <div className="space-y-8">
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-white mb-4">ProX Academy</h1>
        <p className="text-xl text-gray-300 mb-8">Zamonaviy dasturlash akademiyasi</p>
        <button
          onClick={onProxOfflineClick}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
        >
          ProX Offline ni ishga tushirish
        </button>
      </div>
    </div>
  );
}

// Courses content component
function CoursesContent() {
  const courses = [
    {
      id: 1,
      title: "React va Next.js",
      description: "Zamonaviy frontend dasturlash",
      progress: 75,
      students: 245,
      duration: "3 oy",
      level: "Boshlang'ich",
      image: "/courses/react.jpg"
    },
    {
      id: 2,
      title: "Node.js va Express",
      description: "Backend dasturlash asoslari",
      progress: 60,
      students: 189,
      duration: "2.5 oy",
      level: "O'rta",
      image: "/courses/nodejs.jpg"
    },
    {
      id: 3,
      title: "Python va Django",
      description: "Full-stack web dasturlash",
      progress: 45,
      students: 156,
      duration: "4 oy",
      level: "Yuqori",
      image: "/courses/python.jpg"
    },
    {
      id: 4,
      title: "UI/UX Design",
      description: "Foydalanuvchi interfeysi dizayni",
      progress: 30,
      students: 98,
      duration: "2 oy",
      level: "Boshlang'ich",
      image: "/courses/uiux.jpg"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Kurslar</h1>
        <p className="text-base sm:text-xl text-gray-300">Sizning kelajagingizni shakllantiruvchi kurslar</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-800 rounded-lg p-4 sm:p-6 hover:bg-slate-750 transition-all duration-300">
            <div className="mb-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-full aspect-video md:aspect-[4/3] object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x200?text=Kurs+Rasmi";
                }}
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
            <p className="text-gray-300 mb-4">{course.description}</p>

            {/* Progress Bar - Kichikroq qilingan */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Kurs tugallanishi</span>
                <span className="text-sm font-medium text-cyan-400">{course.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400 mb-4">
              <span>👥 {course.students} o'quvchi</span>
              <span>⏱️ {course.duration}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                course.level === 'Boshlang\'ich' ? 'bg-green-900 text-green-300' :
                course.level === 'O\'rta' ? 'bg-yellow-900 text-yellow-300' :
                'bg-red-900 text-red-300'
              }`}>
                {course.level}
              </span>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300">
              Kursga yozilish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Index component
function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Bosh sahifa');
  const [activeProject, setActiveProject] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL path changes
  useEffect(() => {
    const path = location.pathname.replace(/^\/+/, '');
    if (path === '') {
      navigate('/home', { replace: true });
      return;
    }

    const parts = path.split('/');
    const [root, sub] = parts;

    switch (root) {
      case 'home':
        setActiveTab('Bosh sahifa');
        setActiveProject('');
        break;
      case 'courses':
        setActiveTab('Kurslar');
        setActiveProject('');
        break;
      case 'projects':
        setActiveTab('O\'quvchilar loyihalari');
        if (sub === 'blogs') setActiveProject('Blogs');
        else if (sub === 'resume') setActiveProject('Resume Builder');
        else if (sub === 'payments') setActiveProject('Payments');
        else setActiveProject('');
        break;
      case 'my-courses':
        setActiveTab('Kurslarim');
        setActiveProject('');
        break;
      case 'offline':
        setActiveTab('proX offline');
        setActiveProject('');
        break;
      default:
        break;
    }
  }, [location.pathname, navigate]);

  const handleSidebarMenuClick = (title) => {
    setActiveTab(title);
    setActiveProject('');
    scrollToTop();

    if (title === 'Bosh sahifa') navigate('/home');
    else if (title === 'Kurslar') navigate('/courses');
    else if (title === 'O\'quvchilar loyihalari') navigate('/projects');
    else if (title === 'Kurslarim') navigate('/my-courses');
  };

  const handleProjectMenuClick = (project) => {
    setActiveTab('O\'quvchilar loyihalari');
    setActiveProject(project);
    scrollToTop();

    if (project === 'Blogs') navigate('/projects/blogs');
    else if (project === 'Resume Builder') navigate('/projects/resume');
    else if (project === 'Payments') navigate('/projects/payments');
  };

  const handleProxOfflineClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab('proX offline');
      navigate('/offline');
      setIsLoading(false);
    }, 700);
  };

  const scrollToTop = () => {
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile Navbar - only for non-admin routes */}
        {location.pathname !== '/admin' && <MobileNavbar />}

        <SidebarInset id="main-scroll" className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 md:pt-4 pt-20 pb-16">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {!isLoading && location.pathname === '/' && (
              <HomeContent onProxOfflineClick={handleProxOfflineClick} />
            )}

            {!isLoading && location.pathname === '/courses' && <CoursesContent />}

            {!isLoading && location.pathname === '/offline' && <ProxOffline />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default Index;
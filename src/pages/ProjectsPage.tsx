import { useState, useEffect } from 'react'
import { projectsService, Project } from '../services/projectsService'
import { AlertCircle, Folder, FolderX, ArrowRight, LinkIcon, ExternalLink } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsService.getAllProjects()
      setProjects(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Loyihalarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const getProjectLogo = (project: Project): string | null => {
    if (project.logo) return project.logo
    
    const title = project.title?.toLowerCase() || ''
    
    if (title.includes('mental') || title.includes('mentaljon')) return '/loyihalar/Mentaljon.png'
    if (title.includes('alibobo')) return '/loyihalar/alibobo.png'
    if (title.includes('alochi') || title.includes('bolajon')) return '/loyihalar/alochi.jpg'
    if (title.includes('prox') || title.includes('academy')) return '/loyihalar/prox.jpg'
    
    return null
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { text: 'Faol', color: 'text-emerald-400', bg: 'bg-emerald-500/20', dot: 'bg-emerald-400' }
      case 'completed': return { text: 'Tugallangan', color: 'text-violet-400', bg: 'bg-violet-500/20', dot: 'bg-violet-400' }
      case 'planning': return { text: 'Rejada', color: 'text-amber-400', bg: 'bg-amber-500/20', dot: 'bg-amber-400' }
      default: return { text: 'Noma\'lum', color: 'text-slate-400', bg: 'bg-slate-500/20', dot: 'bg-slate-400' }
    }
  }

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-rose-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchProjects}
            className="px-5 py-2.5 bg-violet-600 text-white text-sm rounded-xl font-medium active:scale-95 transition-transform"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-transparent pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Loyihalar</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Bizning ishlarimiz</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
            <Folder className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">{projects.length}</span>
          </div>
        </div>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mb-4">
            <FolderX className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-500">Hozircha loyihalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {projects.map((project, index) => {
            const status = getStatusConfig(project.status)
            const logo = getProjectLogo(project)
            const gradient = gradients[index % gradients.length]
            
            return (
              <div 
                key={project._id}
                onClick={() => project.url && window.open(project.url, '_blank')}
                className={`group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 overflow-hidden transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-600/50 hover:shadow-xl hover:shadow-violet-500/5 ${
                  project.url ? 'cursor-pointer active:scale-[0.98]' : ''
                }`}
                style={{ animation: `slideUp 0.4s ease ${index * 0.06}s both` }}
              >
                {/* Card Content */}
                <div className="p-4 sm:p-5">
                  {/* Top Row: Logo + Info + Status */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Logo */}
                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex-shrink-0 overflow-hidden shadow-lg ${
                      !logo ? `bg-gradient-to-br ${gradient}` : ''
                    }`}>
                      {logo ? (
                        <img 
                          src={logo} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                            {project.title?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        </div>
                      )}
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Title & Status */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                        {project.title}
                      </h3>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full ${status.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}></span>
                        <span className={`text-[11px] font-medium ${status.color}`}>{status.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                    {project.description || 'Loyiha haqida ma\'lumot mavjud emas'}
                  </p>

                  {/* Bottom Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                    {project.url ? (
                      <div className="flex items-center gap-2 text-violet-400 group-hover:text-violet-300 transition-colors">
                        <span className="text-sm font-medium">Saytga o'tish</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4" />
                        Havola yo'q
                      </span>
                    )}
                    
                    {project.url && (
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                        <ExternalLink className="w-5 h-5 text-violet-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(16px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  )
}

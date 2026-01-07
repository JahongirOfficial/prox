import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { FileText, User, BadgeCheck, TrendingUp, Users, GraduationCap, FolderOpen, Brain, Sparkles, Target, Rocket, Globe, ArrowRight, BookOpen, Play } from 'lucide-react'

export default function AcademyPage() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresHeaderRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const techStack = [
    { name: 'React', logo: '/texnologiya/reactjs-icon.svg', glow: 'rgba(97, 218, 251, 0.35)' },
    { name: 'Next.js', logo: '/texnologiya/nextjs-icon.svg', glow: 'rgba(226, 232, 240, 0.18)' },
    { name: 'Node.js', logo: '/texnologiya/nodejs-icon.svg', glow: 'rgba(104, 160, 99, 0.30)' },
    { name: 'TypeScript', logo: '/texnologiya/Typescript_logo_2020.svg', glow: 'rgba(49, 120, 198, 0.30)' },
    { name: 'JavaScript', logo: '/texnologiya/javascript-icon.svg', glow: 'rgba(247, 223, 30, 0.25)' },
    { name: 'MongoDB', logo: '/texnologiya/mongodb-icon.svg', glow: 'rgba(77, 179, 61, 0.25)' },
    { name: 'PostgreSQL', logo: '/texnologiya/postgresql-icon.svg', glow: 'rgba(51, 103, 145, 0.30)' },
    { name: 'Express.js', logo: '/texnologiya/expressjs-icon.svg', glow: 'rgba(148, 163, 184, 0.18)' },
    { name: 'Python', logo: '/texnologiya/python-icon.svg', glow: 'rgba(55, 118, 171, 0.28)' },
    { name: 'HTML5', logo: '/texnologiya/HTML5_Badge.svg', glow: 'rgba(227, 79, 38, 0.28)' },
    { name: 'Electron', logo: '/texnologiya/electronjs-icon.svg', glow: 'rgba(47, 75, 89, 0.25)' },
  ]

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-animate-id')
        if (!id) return
        setIsVisible((prev) => ({ ...prev, [id]: entry.isIntersecting }))
      })
    }, observerOptions)

    const elements = [
      heroRef.current,
      statsRef.current,
      featuresHeaderRef.current,
      featuresRef.current,
      ctaRef.current
    ].filter(Boolean) as Element[]

    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="space-y-8 sm:space-y-12 pb-8 sm:pb-12">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] sm:min-h-[70vh] bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div 
            ref={heroRef}
            data-animate-id="hero"
            className={`max-w-5xl mx-auto transition-all duration-1000 ${
              isVisible.hero 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 sm:mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium text-cyan-300">Ochiq akademiya</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              proX -{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                dasturlash akademiyasi
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-xl lg:text-2xl text-white/90 mb-3 sm:mb-4 max-w-3xl leading-relaxed">
              Dasturlashni bepul o'rganing va professional dasturchi bo'ling.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-white/70 mb-6 sm:mb-10 max-w-3xl leading-relaxed">
              Login qilmasdan ham barcha ma'lumotlarni ko'rishingiz mumkin!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
              <button
                onClick={() => navigate('/students')}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>O'quvchilar</span>
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 text-white font-semibold text-sm sm:text-base rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Profil</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="no-scrollbar flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/60 overflow-x-auto flex-nowrap -mx-1 px-1">
              <div className="flex items-center gap-2 shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="whitespace-nowrap">Bepul ma'lumotlar</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="whitespace-nowrap">Ochiq kirish</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="whitespace-nowrap">Jamoa bilan ishlash</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div 
        ref={statsRef}
        data-animate-id="stats"
        className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6"
      >
        <div className={`group relative bg-gradient-to-br from-slate-800/85 to-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-blue-500/35 transition-all duration-500 shadow-lg shadow-blue-500/15 overflow-hidden ${
          isVisible.stats ? 'animate-fade-in-up delay-100' : 'opacity-0 translate-y-5'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/15 opacity-100"></div>
          <div className="relative z-10 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/25 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center scale-110 transition-transform duration-300 shadow-md shadow-blue-500/10">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">50+</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 leading-tight">O'quvchilar</p>
            </div>
          </div>
        </div>

        <div className={`group relative bg-gradient-to-br from-slate-800/85 to-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-green-500/30 transition-all duration-500 shadow-lg shadow-green-500/15 overflow-hidden ${
          isVisible.stats ? 'animate-fade-in-up delay-200' : 'opacity-0 translate-y-5'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/15 opacity-100"></div>
          <div className="relative z-10 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/25 to-green-600/20 rounded-lg sm:rounded-xl flex items-center justify-center scale-110 transition-transform duration-300 shadow-md shadow-green-500/10">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400" />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">15+</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 leading-tight">Loyihalar</p>
            </div>
          </div>
        </div>

        <div className={`group relative bg-gradient-to-br from-slate-800/85 to-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-orange-500/30 transition-all duration-500 shadow-lg shadow-orange-500/15 overflow-hidden ${
          isVisible.stats ? 'animate-fade-in-up delay-300' : 'opacity-0 translate-y-5'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/15 opacity-100"></div>
          <div className="relative z-10 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/25 to-orange-600/20 rounded-lg sm:rounded-xl flex items-center justify-center scale-110 transition-transform duration-300 shadow-md shadow-orange-500/10">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-400" />
            </div>
            <div>
              <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">100%</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 leading-tight">Ochiq kirish</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technologies Carousel */}
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-slate-800/50 backdrop-blur-sm py-5 sm:py-7 lg:py-9">
        <div className="flex animate-scroll group-hover:[animation-play-state:paused]">
          {/* First set */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8">
            {techStack.map((tech, idx) => (
              <div
                key={`tech-1-${idx}`}
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-slate-600/60 rounded-2xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center hover:scale-[1.06] hover:border-cyan-500/45"
                title={tech.name}
                style={{ boxShadow: `0 18px 48px -18px ${tech.glow}` }}
              >
                <img 
                  src={tech.logo} 
                  alt={tech.name}
                  className="w-full h-full object-contain p-2 sm:p-3"
                />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8" aria-hidden="true">
            {techStack.map((tech, idx) => (
              <div
                key={`tech-2-${idx}`}
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-slate-600/60 rounded-2xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center hover:scale-[1.06] hover:border-cyan-500/45"
                title={tech.name}
                style={{ boxShadow: `0 18px 48px -18px ${tech.glow}` }}
              >
                <img 
                  src={tech.logo} 
                  alt={tech.name}
                  className="w-full h-full object-contain p-2 sm:p-3"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        ref={ctaRef}
        data-animate-id="cta"
        className={`relative bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-700/50 overflow-hidden transition-all duration-1000 ${
          isVisible.cta 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-10 scale-95'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
            Ro'yxatdan o'tishni xohlaysizmi?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 px-4">
            To'liq imkoniyatlardan foydalanish uchun ro'yxatdan o'ting
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Ro'yxatdan o'tish</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .hero-code-float {
          animation: heroFloat 7s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
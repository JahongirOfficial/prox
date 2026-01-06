import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { ArrowLeft, ArrowRight, User, Lock, AlertCircle, Info, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim()) { setError('Username kiritilishi shart'); return }
    if (!formData.password) { setError('Parol kiritilishi shart'); return }

    setLoading(true)
    setError('')

    try {
      const response = await authService.login(formData)
      if (response.success && response.token) {
        const role = response.user?.role
        window.location.href = role === 'student' ? '/' : '/dashboard'
      } else {
        setError('Username yoki parol noto\'g\'ri')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username yoki parol noto\'g\'ri')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Back Button */}
      <button type="button" onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition">
        <ArrowLeft className="w-5 h-5" />
        <span>Bosh sahifaga qaytish</span>
      </button>

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30">
            <span className="text-3xl font-black text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">proX Academy</h1>
          <p className="text-slate-400 mt-2">O'quv platformasiga xush kelibsiz</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-300 mb-2">Foydalanuvchi nomi</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input id="username" type="text" autoComplete="username" value={formData.username}
                  onChange={(e) => { setFormData({ ...formData, username: e.target.value }); if (error) setError('') }}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="username" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input id="password" type="password" autoComplete="current-password" value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (error) setError('') }}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Yuklanmoqda...</span></>
              ) : (
                <><span>Kirish</span><ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Info className="w-5 h-5" />
              <span>Login va parol admin tomonidan beriladi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

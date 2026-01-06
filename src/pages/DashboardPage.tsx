import { GraduationCap, CheckSquare, Folder, Wallet, UserPlus, CreditCard, FileText, FileSpreadsheet } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Xush kelibsiz, Admin!</h1>
            <p className="text-xl text-slate-300">Bugun sizning platformangizda faol ish olib borilmoqda</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Bugungi sana</p>
            <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString('uz-UZ')}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">150</p>
              <p className="text-sm text-slate-400">Jami o'quvchilar</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-green-400 text-sm">↗ +12</span>
            <span className="text-slate-400 text-sm">bu oyda</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">89</p>
              <p className="text-sm text-slate-400">Tugallangan vazifalar</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-green-400 text-sm">↗ +23</span>
            <span className="text-slate-400 text-sm">bu hafta</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Folder className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">25</p>
              <p className="text-sm text-slate-400">Faol loyihalar</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-blue-400 text-sm">→ 5</span>
            <span className="text-slate-400 text-sm">yangi loyiha</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-sm text-slate-400">Qarzdor o'quvchilar</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-red-400 text-sm">↗ +1</span>
            <span className="text-slate-400 text-sm">bu hafta</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-6">So'nggi faoliyatlar</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Alisher Karimov "React loyihasi"ni topshirdi</p>
                <p className="text-sm text-slate-400">15 daqiqa oldin</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Yangi o'quvchi ro'yxatdan o'tdi - Malika Tosheva</p>
                <p className="text-sm text-slate-400">1 soat oldin</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Folder className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Yangi loyiha yaratildi - "Mobile Banking App"</p>
                <p className="text-sm text-slate-400">3 soat oldin</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Bobur Rahimov to'lov qildi - 500,000 so'm</p>
                <p className="text-sm text-slate-400">5 soat oldin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-6">Tezkor amallar</h2>
          <div className="space-y-4">
            <button className="w-full p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition text-left">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Yangi o'quvchi</p>
                  <p className="text-sm text-slate-400">O'quvchi qo'shish</p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition text-left">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-white">Yangi vazifa</p>
                  <p className="text-sm text-slate-400">Vazifa yaratish</p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition text-left">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Yangi loyiha</p>
                  <p className="text-sm text-slate-400">Loyiha yaratish</p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 transition text-left">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="font-semibold text-white">Hisobot</p>
                  <p className="text-sm text-slate-400">Hisobot yaratish</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Umumiy ko'rsatkichlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">87%</span>
            </div>
            <h3 className="font-semibold text-white mb-2">O'quvchilar faolligi</h3>
            <p className="text-sm text-slate-400">Haftalik o'rtacha faollik darajasi</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">92%</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Vazifalar bajarilishi</h3>
            <p className="text-sm text-slate-400">Vaqtida topshirilgan vazifalar</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">78%</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Loyihalar holati</h3>
            <p className="text-sm text-slate-400">Tugallangan loyihalar foizi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
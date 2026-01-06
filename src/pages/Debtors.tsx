import { Link } from 'react-router-dom'

export default function Debtors() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-xl font-bold text-white">proX Academy</h1>
          </div>
          <p className="text-slate-400 text-sm ml-13">Admin Panel</p>
        </div>
        
        <nav className="space-y-2">
          <Link to="/dashboard" className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/students" className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition">
            <span className="material-symbols-outlined">group</span>
            <span>O'quvchilar</span>
          </Link>
          <Link to="/leaderboard" className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition">
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Leaderboard</span>
          </Link>
          <Link to="/debtors" className="block px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white rounded-lg flex items-center gap-3 transition">
            <span className="material-symbols-outlined">payments</span>
            <span>Qarzdorlar</span>
          </Link>
          <Link to="/projects" className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition">
            <span className="material-symbols-outlined">folder</span>
            <span>Loyihalar</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-red-400">account_balance_wallet</span>
              <span>Qarzdorlar Ro'yxati</span>
            </h2>
            <p className="text-slate-400">To'lov qilmagan o'quvchilar</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-slate-300 font-medium">Talaba</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-medium">Qarz Miqdori</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-medium">Muddat</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-medium">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-6xl mb-3 opacity-50">payments</span>
                      <p className="text-lg">Qarzdorlar yo'q</p>
                      <p className="text-sm mt-2">Barcha o'quvchilar to'lovlarini o'z vaqtida amalga oshirmoqda</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

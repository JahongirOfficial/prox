import { useLocation, useNavigate } from "react-router-dom";

export default function Students() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  // Dummy stats generator
  function getUserStats(user) {
    const weekPoints = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 100),
    );
    const monthPoints = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 300),
    );
    const avg = Math.round(
      weekPoints.reduce((a, b) => a + b, 0) / weekPoints.length,
    );
    const worstDayIdx = weekPoints.indexOf(Math.min(...weekPoints));
    const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
    return {
      step: Math.floor(Math.random() * 10) + 1,
      weekPoints,
      monthPoints,
      avg,
      worstDay: days[worstDayIdx],
      worstDayValue: weekPoints[worstDayIdx],
    };
  }

  // Real total score from Mongo (sum of all todayScores)
  function getTotalScore(u: any) {
    const arr = Array.isArray(u?.todayScores) ? u.todayScores : [];
    return arr.reduce((sum: number, s: any) => sum + Number(s?.score || 0), 0);
  }

  // Format arrival date for display - iOS optimized
  function formatArrivalDate(dateString: string) {
    if (!dateString) return "Belgilanmagan";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Belgilanmagan";
      
      // iOS Safari compatible date formatting
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Uzbek month names for iOS compatibility
      const uzbekMonths = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
      ];
      
      const monthName = uzbekMonths[month - 1];
      
      // Format: "15 Yanvar 2024" - iOS friendly
      return `${day} ${monthName} ${year}`;
    } catch (error) {
      return "Belgilanmagan";
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground mb-4">
          Foydalanuvchi topilmadi.
        </p>
        <button
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors border px-4 py-2 rounded-md"
          onClick={() => navigate("/prox-offline")}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Orqaga
        </button>
      </div>
    );
  }

  const stats = getUserStats(user);
  const totalScore = getTotalScore(user);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 sm:px-4 py-8 sm:py-12 animate-fade-in safe-area-top safe-area-bottom">
      <button
        className="mb-6 sm:mb-8 self-start flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
        onClick={() => navigate("/prox-offline")}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Orqaga
      </button>
      <div
        className="relative rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl animate-fade-in overflow-hidden transform transition-all duration-700 hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Animated background patterns */}
        <div
          className="absolute inset-0 opacity-20 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, rgba(120, 198, 255, 0.2) 0%, transparent 50%)`,
            backgroundSize: '50% 50%'
          }}
        />

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20 animate-pulse opacity-30" />

        <div className="relative z-10">
          {/* Mobile-first layout - always vertical on small screens */}
          <div className="flex flex-col gap-6 mb-6">
            {/* User info section */}
            <div className="flex items-center gap-3 sm:gap-4 hover-bounce">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-emerald-500/30 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3">
                <span className="text-2xl sm:text-3xl animate-bounce-emoji filter drop-shadow-lg">👨‍💻</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg sm:text-xl text-white drop-shadow-md truncate">{user.fullName}</div>
                <div className="text-xs sm:text-sm text-white/70 drop-shadow-sm">Dasturchi</div>
              </div>
            </div>
            
            {/* Stats section - optimized for mobile */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 drop-shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse"></div>
                  Qadam:
                </span>
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{stats.step}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 drop-shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse"></div>
                  Jami ball:
                </span>
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{totalScore}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 drop-shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
                  Shu oy ball:
                </span>
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{stats.monthPoints.reduce((a, b) => a + b, 0)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 drop-shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-400 animate-pulse"></div>
                  O'rtacha ball:
                </span>
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{stats.avg}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 drop-shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-pulse"></div>
                  Eng yomon kun:
                </span>
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{stats.worstDay} ({stats.worstDayValue})</span>
              </div>
              
              {/* Kelgan sana - iOS optimized */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 drop-shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-green-400 to-teal-400 animate-pulse"></div>
                  Kelgan sana:
                </span>
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm text-right">
                  {formatArrivalDate(user.arrivalDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

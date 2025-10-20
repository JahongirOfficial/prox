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
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{
        padding: '16px',
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        background: '#0a0a0a'
      }}
    >
      <button
        className="mb-6 self-start flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
        onClick={() => navigate("/prox-offline")}
        style={{
          padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)'
        }}
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
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: '400px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
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

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* User info section - iPhone optimized */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
            {/* User profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(16, 185, 129, 0.3) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>👨‍💻</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div 
                  style={{ 
                    fontWeight: 'bold', 
                    fontSize: '20px', 
                    color: 'white', 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.fullName}
                </div>
                <div 
                  style={{ 
                    fontSize: '14px', 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' 
                  }}
                >
                  Dasturchi
                </div>
              </div>
            </div>
            
            {/* Stats section - iPhone optimized with inline styles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Qadam */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #a855f7, #06b6d4)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Qadam:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{stats.step}</span>
              </div>
              
              {/* Jami ball */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #10b981, #06b6d4)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Jami ball:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{totalScore}</span>
              </div>
              
              {/* Shu oy ball */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #3b82f6, #a855f7)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Shu oy ball:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{stats.monthPoints.reduce((a, b) => a + b, 0)}</span>
              </div>
              
              {/* O'rtacha ball */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  O'rtacha ball:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{stats.avg}</span>
              </div>
              
              {/* Eng yomon kun */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #ef4444, #ec4899)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Eng yomon kun:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{stats.worstDay} ({stats.worstDayValue})</span>
              </div>
              
              {/* Kelgan sana - iPhone optimized */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #10b981, #14b8a6)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Kelgan sana:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  color: 'white',
                  textAlign: 'right',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
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

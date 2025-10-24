import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Students() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  // 📊 Tasodifiy statistikalar (faqat demo uchun)
  function getUserStats(u: any) {
    const weekPoints = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 100)
    );
    const monthPoints = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 300)
    );
    const avg = Math.round(
      weekPoints.reduce((a: number, b: number) => a + b, 0) / weekPoints.length
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

  // 🧮 Umumiy ballni hisoblash
  function getTotalScore(u: any) {
    const arr = Array.isArray(u?.todayScores) ? u.todayScores : [];
    return arr.reduce((sum: number, s: any) => sum + Number(s?.score || 0), 0);
  }

  // ✅ iOS bilan 100% mos sana formatlash funksiyasi
  function formatArrivalDate(dateString: string) {
    if (!dateString) return "Belgilanmagan";

    try {
      // 1️⃣ iOS uchun xavfsiz formatga o‘tkazish
      let safeString = dateString
        .trim()
        .replace("T", " ")
        .replace(/-/g, "/"); // Safari uchun kerak

      // 2️⃣ Faqat sana bo‘lsa (vaqt yo‘q bo‘lsa), vaqt qo‘shamiz
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(safeString)) {
        safeString += " 00:00:00";
      }

      const date = new Date(safeString);
      if (isNaN(date.getTime())) return "Belgilanmagan";

      // 3️⃣ Sana qismlarini ajratish
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const uzbekMonths = [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr",
      ];

      return `${day} ${uzbekMonths[month - 1]} ${year}`;
    } catch (error) {
      return "Belgilanmagan";
    }
  }

  // dd/mm/yy ko'rinishidagi qisqa sana (universal)
  function formatShortDate(input: string | Date) {
    try {
      let d: Date;
      if (input instanceof Date) {
        d = new Date(input.getFullYear(), input.getMonth(), input.getDate());
      } else {
        if (!input) return "--/--/--";
        let s = input.trim().replace("T", " ").replace(/-/g, "/");
        if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) s += " 00:00:00";
        const parsed = new Date(s);
        if (isNaN(parsed.getTime())) return "--/--/--";
        d = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    } catch {
      return "--/--/--";
    }
  }

  // Kelgan sanadan bugungacha bo'lgan jami kunlar
  function getTotalDaysSince(input: string) {
    if (!input) return 0;
    try {
      let s = input.trim().replace("T", " ").replace(/-/g, "/");
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) s += " 00:00:00";
      const start = new Date(s);
      if (isNaN(start.getTime())) return 0;
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diff = Math.floor((today.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    } catch {
      return 0;
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
  const arrivalShort = formatShortDate(user?.arrivalDate);
  const todayShort = formatShortDate(new Date());
  const totalDays = getTotalDaysSince(user?.arrivalDate);

  // Faqat mobil holat uchun layoutni yoqish
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 480px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // @ts-ignore
      setIsMobile(e.matches ?? (e as MediaQueryList).matches);
    };
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange as any);
    else if ((mql as any).addListener) (mql as any).addListener(onChange as any);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange as any);
      else if ((mql as any).removeListener) (mql as any).removeListener(onChange as any);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#000",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <button
        style={{
          marginBottom: "30px",
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "16px",
          color: "#ccc",
          padding: "12px 20px",
          border: "1px solid #333",
          borderRadius: "8px",
          backgroundColor: "#111",
          cursor: "pointer",
        }}
        onClick={() => navigate("/prox-offline")}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Orqaga
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              👨‍💻
            </div>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                {user.fullName}
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>Dasturchi</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isMobile && (
              <>
                <MobileInfoRow icon="📅" title="Kelgan sana" value={arrivalShort} />
                <MobileInfoRow icon="🗓️" title="Bugungi sana" value={todayShort} />
                <MobileInfoRow icon="⏱️" title="Jami kunlar" value={totalDays} />
              </>
            )}
            <CardRow label="Qadam:" color="#8b5cf6" value={stats.step} />
            <CardRow label="Jami ball:" color="#10b981" value={totalScore} />
            <CardRow
              label="Shu oy ball:"
              color="#3b82f6"
              value={stats.monthPoints.reduce((a: number, b: number) => a + b, 0)}
            />
            <CardRow label="O'rtacha ball:" color="#f59e0b" value={stats.avg} />
            <CardRow
              label="Eng yomon kun:"
              color="#ef4444"
              value={`${stats.worstDay} (${stats.worstDayValue})`}
            />
            <CardRow
              label="Kelgan sana:"
              color="#059669"
              value={formatArrivalDate(user.arrivalDate)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔹 Yordamchi komponent
function CardRow({
  label,
  color,
  value,
}: {
  label: string;
  color: string;
  value: any;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        backgroundColor: "#222",
        borderRadius: "8px",
        border: "1px solid #333",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: color,
          }}
        ></div>
        <span style={{ fontSize: "14px", color: "#ccc" }}>{label}</span>
      </div>
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "white",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

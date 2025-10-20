import { useLocation, useNavigate } from "react-router-dom"

export default function Students() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  // Dummy stats generator
  function getUserStats(u: any) {
    const weekPoints = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 100)
    );
    const monthPoints = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 300)
    );
    const avg = Math.round(
      weekPoints.reduce((a: number, b: number) => a + b, 0) /
        weekPoints.length
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

  // ✅ Sana formatlash (iOS bilan to‘liq mos)
  function formatArrivalDate(dateString: string) {
    if (!dateString) return "Belgilanmagan";

    try {
      let date: Date;

      // iOS uchun "YYYY-MM-DD" ni "YYYY/MM/DD" formatga o‘zgartirish
      if (dateString.includes("-")) {
        date = new Date(dateString.replace(/-/g, "/"));
      } else {
        date = new Date(dateString);
      }

      // Agar hamon noto‘g‘ri bo‘lsa
      if (isNaN(date.getTime())) return "Belgilanmagan";

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

      const monthName = uzbekMonths[month - 1];
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
            {/* Qadam */}
            <CardRow label="Qadam:" color="#8b5cf6" value={stats.step} />

            {/* Jami ball */}
            <CardRow
              label="Jami ball:"
              color="#10b981"
              value={totalScore}
            />

            {/* Shu oy ball */}
            <CardRow
              label="Shu oy ball:"
              color="#3b82f6"
              value={stats.monthPoints.reduce(
                (a: number, b: number) => a + b,
                0
              )}
            />

            {/* O'rtacha ball */}
            <CardRow
              label="O'rtacha ball:"
              color="#f59e0b"
              value={stats.avg}
            />

            {/* Eng yomon kun */}
            <CardRow
              label="Eng yomon kun:"
              color="#ef4444"
              value={`${stats.worstDay} (${stats.worstDayValue})`}
            />

            {/* Kelgan sana */}
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

// 🔹 Kichik yordamchi komponent — kodni soddalashtiradi
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

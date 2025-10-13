import { useEffect, useLayoutEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { getJwtToken, removeJwtToken, saveJwtToken } from "@/lib/cookie"
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Code,
  CreditCard,
  Download,
  Eye,
  FolderOpen,
  Home,
  Lightbulb,
  Lock,
  Menu,
  Monitor,
  Phone,
  Send,
  Settings,
  Target,
  TrendingUp,
  User,
  X,
  Zap
} from "lucide-react"

export const menuItems = [
  { title: "Bosh sahifa", icon: Home },
  { title: "Kurslar", icon: BookOpen },
  { title: "O'quvchilar loyihalari", icon: FolderOpen },
];

export const userMenuItems = [{ title: "Kurslarim", icon: BookOpen }];

const projects = [
  {
    title: "proX.uz",
    icon: Code,
    image: "/images/image2.jpg", // ProX logo
    description:
      "Dasturlash akademiyasi - zamonaviy texnologiyalarni o'rganish va professional dasturchi bo'lish platformasi.",
    badge: "Faol",
    price: "800$",
    url: "https://prox.uz/",
  },
  {
    title: "A'lochi",
    icon: BookOpen,
    image: "/images/image.jpg", // Updated Alochi PNG logo
    description:
      "Ta'lim platformasi - 1-6 sinf o'quvchilari uchun zamonaviy ta'lim tizimi.",
    badge: "Faol",
    price: "500$",
    url: "https://alochibolajon.uz/",
  },
  {
    title: "Yetti Pir",
    icon: BookOpen,
    image: "/images/image1.png", // Yetti Pir logo
    description:
      "Buxorodagi yetti muqaddas ziyoratgohlar - ruhiy sayohat va ma'naviy boyitish platformasi.",
    badge: "Faol",
    price: "150$",
    url: "https://yettipir.uz/",
  },
  {
    title: "Alibobo",
    icon: Code,
    image: "/images/alibobo.png",
    description: "Qurilish materiallar va xizmatlari platformasi.",
    badge: "Faol",
    price: "800$",
    url: "https://aliboboqurilish.uz/",
  },
  {
    title: "javohirhakimov.uz",
    icon: Code,
    image: "/images/javohirhakimov.png",
    description: "Shaxsiy blog va portfolio sayti.",
    badge: "Faol",
    price: "350$",
    url: "https://javohirhakimov.uz/",
  },
  {
    title: "Qarz daftarcha",
    icon: Code,
    image: "images/qarzdaftarcha_logo.png",
    description: "Qarzlarni boshqarish va monitoring qilish uchun raqamli daftarcha.",
    badge: "Faol",
    price: "500$",
    url: "https://qarzdaftarcha.uz/",
  },
];

// Helpers for offline attendance views
// Safely extract allowed days from a user object
function getAllowedDays(user: any): string[] {
  return Array.isArray(user?.attendanceDays) ? user.attendanceDays : [];
}

// Convert a JS Date to our day code (Du, Se, Ch, Pa, Ju, Sh, Ya)
function dateToDayCode(d: Date): string {
  // JS getDay(): 0=Sun, 1=Mon, ... 6=Sat
  const map = {
    0: "Ya", // Yakshanba (Sunday)
    1: "Du", // Dushanba (Monday)
    2: "Se", // Seshanba (Tuesday)
    3: "Ch", // Chorshanba (Wednesday)
    4: "Pa", // Payshanba (Thursday)
    5: "Ju", // Juma (Friday)
    6: "Sh", // Shanba (Saturday)
  } as Record<number, string>;
  return map[d.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6];
}

// Build current week days (Monday to Saturday ONLY), fully excluding Sunday from weekly UI/logic
function getCurrentWeekDates() {
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"]; // No 'Ya'
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];
  const now = new Date();
  const week: { label: string; date: string; iso: string }[] = [];
  // Find Monday of this week
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  for (let i = 0; i < 6; i++) {
    // Only 6 days (Mon-Sat)
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const day = d.getDate();
    const month = months[d.getMonth()];
    week.push({
      label: days[i],
      date: `${day}-${month}`,
      iso: d.toISOString().slice(0, 10),
    });
  }
  return week;
}

// Helper function to get technology icon URLs for certificates
function getTechnologyIcon(title: string): string {
  if (title.includes("CSS") || title.includes("Bootstrap")) {
    return "/uploads/courses/course-1758049492431-797019375.png";
  }
  if (title.includes("Deploy") || title.toLowerCase().includes("deployment")) {
    return "https://prox.uz/uploads/courses/course-1759063244343-824788727.jpg";
  }
  // Default fallback for other certificates
  return "https://via.placeholder.com/400x300/4f46e5/ffffff?text=Certificate";
}

function CoursesList({
  setActiveTab,
  setActiveProject,
  navigate,
  setSkipScroll,
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "card",
    description: "",
  });
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateMessage, setGateMessage] = useState("");
  const [highlightTarget, setHighlightTarget] = useState<
    | null
    | "html"
    | "css"
    | "bootstrap"
    | "javascript"
    | "nodejs"
    | "express"
    | "mongo"
  >(null);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    // Payment form submission logic can be added here
    console.log("Payment form submitted:", paymentForm);
    setShowPaymentForm(false);
  };

  

  // Helper: progress based on arrival date vs current step
  const getDaysSinceArrival = (arrival?: string) => {
    if (!arrival) return 0;
    const a = new Date(arrival);
    if (isNaN(a.getTime())) return 0;
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // include first day
    return Math.max(0, days);
  };

  const getProgressPercent = (user: any) => {
    const days = getDaysSinceArrival(user?.arrivalDate);
    if (!days) return 0;
    const step = Number(user?.step || 0);
    const pct = Math.round(Math.min(100, Math.max(0, (step / days) * 100)));
    return pct;
  };

  useLayoutEffect(() => {
    const container = document.getElementById("main-scroll");
    if (container && "scrollTo" in container) {
      try {
        (container as any).scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        (container as HTMLElement).scrollTop = 0;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  const handleCourseClick = () => {
    setActiveTab("Kurslar");
    navigate("/courses");
    // Ensure the main scroll container starts from the very top
    const container = document.getElementById("main-scroll");
    if (container) {
      try {
        (container as any).scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        (container as HTMLElement).scrollTop = 0;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const openCourseDetails = (id: string) => {
    // Open dedicated course details page
    navigate(`/courses/${id}`);
  };

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
  }, []);

  useEffect(() => {
    console.log("Courses state updated:", courses);
  }, [courses]);

  // After loading completes, ensure we are at the very top of the scroll container
  useEffect(() => {
    if (!loading) {
      const container = document.getElementById("main-scroll");
      if (container && "scrollTo" in container) {
        try {
          (container as any).scrollTo({ top: 0, left: 0, behavior: "auto" });
        } catch {
          (container as HTMLElement).scrollTop = 0;
        }
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [loading]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        setError("Kurslarni yuklashda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const token = getJwtToken();
      if (!token) return;
      const response = await fetch("/api/user/enrolled-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch {}
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Gating helpers
  const isHTMLCourse = (c: any) => /html/i.test(c?.title || "");
  const isCSSCourse = (c: any) => /(^|\s)css(\s|$)/i.test(c?.title || "");
  const isBootstrapCourse = (c: any) => /bootstrap/i.test(c?.title || "");
  const isJavaScriptCourse = (c: any) =>
    /(^|\s)javascript(\s|$)|\bjs\b/i.test(c?.title || "");
  const isNodejsCourse = (c: any) => /node/i.test(c?.title || "");
  const isExpressCourse = (c: any) => /express/i.test(c?.title || "");
  const isMongoCourse = (c: any) => /mongo/i.test(c?.title || "");
  const isDeploymentCourse = (c: any) => /deployment/i.test(c?.title || "");

  const hasHTML = enrolledCourses.some((c: any) => isHTMLCourse(c));
  const hasCSS = enrolledCourses.some((c: any) => isCSSCourse(c));
  const hasBootstrap = enrolledCourses.some((c: any) => isBootstrapCourse(c));
  const hasCSSBootstrap = enrolledCourses.some((c: any) => {
    const title = (c?.title || "").toLowerCase();
    return title.includes("css") && title.includes("bootstrap");
  });
  const hasJavaScript = enrolledCourses.some((c: any) => isJavaScriptCourse(c));
  const hasNodejs = enrolledCourses.some((c: any) => isNodejsCourse(c));
  const hasExpress = enrolledCourses.some((c: any) => isExpressCourse(c));
  const hasMongo = enrolledCourses.some((c: any) => isMongoCourse(c));

  // Gating chain: HTML -> CSS & Bootstrap -> JavaScript -> Nodejs -> Express -> Mongo -> Deployment
  const allowEnroll = (course: any) => {
    if (isHTMLCourse(course)) return true;
    if (isCSSCourse(course) || isBootstrapCourse(course)) return hasHTML;
    if (isJavaScriptCourse(course)) return hasCSSBootstrap;
    if (isNodejsCourse(course)) return hasJavaScript;
    if (isExpressCourse(course)) return hasNodejs;
    if (isMongoCourse(course)) return hasExpress;
    if (isDeploymentCourse(course)) return hasMongo;
    // Other courses: keep locked by default
    return false;
  };

  const handleEnrollCourse = (course) => {
    setSelectedCourse(course);
    setShowEnrollmentModal(true);
    setEnrollmentError("");
    setEnrollmentSuccess("");
  };

  const confirmEnrollment = async () => {
    if (!selectedCourse) return;

    try {
      setEnrolling(true);
      setEnrollmentError("");
      setEnrollmentSuccess("");

      const token = getJwtToken();

      const response = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEnrollmentSuccess(data.message);
        setShowEnrollmentModal(false);
        setSelectedCourse(null);

        // Reload courses to update enrolled students count
        loadCourses();
        // Reload enrolled list so gating reflects new access (e.g., CSS unlocks after HTML)
        loadEnrolledCourses();

        // Show success message for 3 seconds
        setTimeout(() => {
          setEnrollmentSuccess("");
        }, 3000);
      } else {
        // Check if error is related to insufficient balance
        if (
          data.message &&
          (data.message.includes("yetmaydi") ||
            data.message.includes("insufficient") ||
            data.message.includes("balance") ||
            data.message.includes("mablag") ||
            data.message.includes("Mablag' yetarli emas"))
        ) {
          // Close enrollment modal and open payment modal
          setShowEnrollmentModal(false);
          setSelectedCourse(null);
          // Open payment modal directly
          setShowPaymentForm(true);
        } else {
          setShowPaymentForm(true);
          setEnrollmentError(data.message);
        }
      }
    } catch (error) {
      setEnrollmentError("Server bilan bog'lanishda xatolik");
    } finally {
      setEnrolling(false);
    }
  };

  const cancelEnrollment = () => {
    setShowEnrollmentModal(false);
    setSelectedCourse(null);
    setEnrollmentError("");
    setEnrollmentSuccess("");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4">
                <Skeleton className="w-full h-48 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          {error}
        </div>
        <Button variant="outline" onClick={loadCourses}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground font-jetbrains">
            Kurslar
          </h2>
          {/* <Button variant="ghost" size="sm" className="text-primary">
            Barchasini ko'rish →
          </Button> */}
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
            const locked = !isEnrolled && !allowEnroll(course);
            return (
              <Card
                key={course.id}
                className={`relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10 ${
                  (highlightTarget === "html" && isHTMLCourse(course)) ||
                  (highlightTarget === "css" &&
                    (isCSSCourse(course) || isBootstrapCourse(course))) ||
                  (highlightTarget === "bootstrap" &&
                    isBootstrapCourse(course)) ||
                  (highlightTarget === "javascript" &&
                    isJavaScriptCourse(course)) ||
                  (highlightTarget === "nodejs" && isNodejsCourse(course)) ||
                  (highlightTarget === "express" && isExpressCourse(course)) ||
                  (highlightTarget === "mongo" && isMongoCourse(course))
                    ? "ring-2 ring-cyan-500"
                    : ""
                }`}
                onClick={() => openCourseDetails(course.id)}
              >
                <CardContent className="p-0">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover object-center rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-800/30 flex items-center justify-center rounded-t-xl">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}

                

                
                  <div className="p-8">
                    <h3 className="text-xl font-semibold font-jetbrains text-card-foreground mb-2 flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="truncate">{course.title}</span>
                      {locked && <Lock className="w-4 h-4 text-yellow-400" />}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description ||
                        "Bu kurs sizga zamonaviy dasturlash texnologiyalarini o'rganishga yordam beradi. Amaliy mashg'ulotlar va real loyihalar orqali bilimlaringizni mustahkamlang."}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          O'qituvchi:
                        </span>
                        <span className="font-medium">{course.instructor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Narxi:</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(course.price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Davomiyligi:
                        </span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          O'quvchilar:
                        </span>
                        <span className="font-medium">
                          {course.enrolledStudents || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">★</span>
                        <span className="text-sm font-medium">
                          {course.rating || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                      {isEnrolled ? (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/learning/${course.id}`, "_blank");
                          }}
                        >
                          Davom etish
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Check if user is logged in (has JWT token)
                            const token = getJwtToken();
                            if (!token) {
                              // No JWT token found, redirect to login page
                              setActiveTab("O'quvchilar loyihalari");
                              setActiveProject("Blogs");
                              return;
                            }
                            // Gating check
                            if (locked) {
                              if (
                                isCSSCourse(course) ||
                                isBootstrapCourse(course)
                              ) {
                                setGateMessage(
                                  "CSS & Bootstrap kursini ochishdan oldin HTML kursiga obuna bo'ling.",
                                );
                                setHighlightTarget("html");
                              } else if (isJavaScriptCourse(course)) {
                                setGateMessage(
                                  "JavaScript kursini ochishdan oldin CSS & Bootstrap kursiga obuna bo'ling.",
                                );
                                setHighlightTarget("css");
                              } else if (isNodejsCourse(course)) {
                                setGateMessage(
                                  "Node.js kursini ochishdan oldin JavaScript kursiga obuna bo'ling.",
                                );
                                setHighlightTarget("javascript");
                              } else if (isExpressCourse(course)) {
                                setGateMessage(
                                  "Express kursini ochishdan oldin Node.js kursiga obuna bo'ling.",
                                );
                                setHighlightTarget("nodejs");
                              } else if (isMongoCourse(course)) {
                                setGateMessage(
                                  "MongoDB kursini ochishdan oldin Express kursiga obuna bo'ling.",
                                );
                                setHighlightTarget("express");
                              } else if (isDeploymentCourse(course)) {
                                setGateMessage(
                                  "Deployment kursini ochishdan oldin MongoDB kursiga obuna bo'ling.",
                                );
                                setHighlightTarget("mongo");
                              } else {
                                setGateMessage(
                                  "Birinchi bo'lib HTML kursiga obuna bo'ling. Shundan keyin boshqa kurslar ochiladi.",
                                );
                                setHighlightTarget("html");
                              }
                              setShowGateModal(true);
                              return;
                            }
                            // User is logged in and allowed - go to course details
                            navigate(`/courses/${course.id}`);
                          }}
                        >
                          Kursga obuna bo'lish
                        </Button>
                      )}
                    </div>
                  </div>
                  {locked && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-3 right-3 bg-black/50 rounded-full p-1">
                        <Lock className="w-4 h-4 text-white/80" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Hali hech qanday kurs mavjud emas
          </p>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {showEnrollmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Kursga a'zo bo'lish</h3>
              <Button variant="ghost" size="icon" onClick={cancelEnrollment}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-medium mb-2">
                  {selectedCourse.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">Kurs narxi:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(selectedCourse.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">O'qituvchi:</span>
                  <span className="text-sm">{selectedCourse.instructor}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">Davomiyligi:</span>
                  <span className="text-sm">{selectedCourse.duration}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Eslatma:</strong> Kursga a'zo bo'lgandan so'ng, siz
                  barcha darslarni ko'rishingiz va amaliy mashg'ulotlarni
                  bajarishingiz mumkin. Progress 0% dan boshlanadi.
                </p>
              </div>

              {enrollmentError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {enrollmentError}
                </div>
              )}

              {enrollmentSuccess && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                  {enrollmentSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={cancelEnrollment}
                  className="flex-1"
                  disabled={enrolling}
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={confirmEnrollment}
                  className="flex-1"
                  disabled={enrolling}
                >
                  {enrolling ? "Jarayonda..." : "A'zo bo'lish"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {enrollmentSuccess && !showEnrollmentModal && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
            <p className="font-medium">{enrollmentSuccess}</p>
          </div>
        </div>
      )}

      {/* Gate Modal (HTML first) */}
      {showGateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Kirish cheklangan</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGateModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{gateMessage}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowGateModal(false)}
              >
                Yopish
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowGateModal(false);
                }}
              >
                {highlightTarget === "css"
                  ? "CSS & Bootstrap kursini ochish"
                  : highlightTarget === "bootstrap"
                    ? "Bootstrap kursini ochish"
                    : highlightTarget === "javascript"
                      ? "JavaScript kursini ochish"
                      : highlightTarget === "nodejs"
                        ? "Node.js kursini ochish"
                        : highlightTarget === "express"
                          ? "Express kursini ochish"
                          : highlightTarget === "mongo"
                            ? "MongoDB kursini ochish"
                            : "HTML kursini ochish"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Kurslar haqida ma'lumot */}
      <div className="mt-16 font-jetbrains">
        <h2 className="text-2xl font-bold text-foreground mb-6 font-jetbrains">
          Kurslar haqida
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 font-jetbrains">
              Nima o'rganasiz?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground font-jetbrains">
                  Zamonaviy dasturlash texnologiyalari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground font-jetbrains">
                  Real loyihalar orqali amaliy tajriba
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground font-jetbrains">
                  Professional dasturchi bo'lish yo'li
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground font-jetbrains">
                  Ish topish va karyera rivojlanishi
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-jetbrains">
              Kurslar tuzilishi
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-2xl font-jetbrains">
                <span className="text-muted-foreground font-black font-jetbrains">
                  Nazariya darslari
                </span>
                <span className="font-black text-6xl font-jetbrains">30%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-2xl font-jetbrains">
                <span className="text-muted-foreground font-black font-jetbrains">
                  Praktik mashg'ulotlar
                </span>
                <span className="font-black text-6xl font-jetbrains">50%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full"
                  style={{ width: "50%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-2xl font-jetbrains">
                <span className="text-muted-foreground font-black font-jetbrains">
                  Loyihalar
                </span>
                <span className="font-black text-6xl font-jetbrains">20%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kurslar afzalliklari */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Kurslar afzalliklari
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">To'liq materiallar</h3>
            <p className="text-sm text-muted-foreground">
              Har bir kurs uchun to'liq video darslar, hujjatlar va qo'llanmalar
            </p>
          </Card>
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Praktik loyihalar</h3>
            <p className="text-sm text-muted-foreground">
              Real loyihalar orqali amaliy tajriba va portfolio yaratish
            </p>
          </Card>
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mentorlik</h3>
            <p className="text-sm text-muted-foreground">
              Tajribali dasturchilar bilan individual maslahat va yo'riqlik
            </p>
          </Card>
        </div>
      </div>

      {/* Kurslar statistikasi */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Kurslar statistikasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="text-center p-8">
            <div className="text-3xl font-bold text-primary mb-2">
              {courses.length}+
            </div>
            <div className="text-sm text-muted-foreground">Kurslar</div>
          </Card>
          <Card className="text-center p-8">
            <div className="text-3xl font-bold text-primary mb-2">200+</div>
            <div className="text-sm text-muted-foreground">Video darslar</div>
          </Card>
          <Card className="text-center p-8">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">
              Praktik loyihalar
            </div>
          </Card>
          <Card className="text-center p-8">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Mamnuniyat</div>
          </Card>
        </div>
      </div>

      {/* Enhanced Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-ultra-thin">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    To'lovni amalga oshirish
                  </h3>
                  <p className="text-sm text-white/70">Hisobni to'ldirish</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
              >
                <X className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors duration-300" />
              </button>
            </div>

            {/* Card Information Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-800/30 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    To'lov kartasi
                  </h4>
                  <p className="text-sm text-white/70">
                    Quyidagi kartaga to'lov qiling
                  </p>
                </div>
              </div>

              {/* Payment Card Display (Flip Card) */}
              <div className="flex justify-center mb-4">
                <style>
                  {`
                  .flip-card { background-color: transparent; width: 360px; height: 200px; perspective: 1000px; color: white; max-width: 90vw; }
                  .heading_8264 { position: absolute; letter-spacing: .2em; font-size: 0.75em; top: 2em; left: 18.6em; }
                  .logo { position: absolute; top: 6.8em; right: 1.5em; }
                  .chip { position: absolute; top: 2.3em; left: 1.5em; }
                  .contactless { position: absolute; top: 3.5em; right: 1.5em; }
                  .number { position: absolute; font-weight: bold; font-size: .9em; top: 8.3em; left: 1.6em; }
                  .valid_thru { position: absolute; font-weight: bold; top: 635.8em; font-size: .01em; left: 140.3em; }
                  .date_8264 { position: absolute; font-weight: bold; font-size: 1em; top: 10em; left: 3em; }
                  .name { position: absolute; font-weight: bold; font-size: 0.75em; top: 16.1em; left: 2em; }
                  .strip { position: absolute; width: 15rem; height: 1.5em; top: 2.4em; background: repeating-linear-gradient(45deg,#303030,#303030 10px,#202020 10px,#202020 20px); }
                  .mstrip { position: absolute; background-color: #fff; width: 8em; height: 0.8em; top: 5em; left: .8em; border-radius: 2.5px; }
                  .sstrip { position: absolute; background-color: #fff; width: 4.1em; height: 0.8em; top: 5em; left: 10em; border-radius: 2.5px; }
                  .code { font-weight: bold; text-align: center; margin: .2em; color: black; }
                  .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.8s; transform-style: preserve-3d; }
                  .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
                  .flip-card-front, .flip-card-back { box-shadow: 0 8px 14px 0 rgba(0,0,0,0.2); position: absolute; display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 1rem; }
                  .flip-card-front { box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset; background-color: #171717; }
                  .flip-card-back { box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset; background-color: #171717; transform: rotateY(180deg); }
                  
                  @media (max-width: 480px) {
                    .flip-card { width: 300px; height: 160px; }
                    .flip-card:hover .flip-card-inner { transform: none; }
                    .heading_8264 { font-size: 0.6em; }
                    .number { font-size: 0.75em; }
                    .date_8264 { top: 9em; font-size: 0.8em; }
                    .valid_thru { display: none; }
                    .logo { right: 1em; }
                    .contactless { right: 1em; }
                  }
                  `}
                </style>
                <div className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <p className="heading_8264">MKBANK</p>
                      <svg
                        className="logo"
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="36"
                        height="36"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#ff9800"
                          d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"
                        ></path>
                        <path
                          fill="#d50000"
                          d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"
                        ></path>
                        <path
                          fill="#ff3d00"
                          d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"
                        ></path>
                      </svg>
                      <svg
                        version="1.1"
                        className="chip"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                      >
                        <rect
                          x="2"
                          y="6"
                          width="26"
                          height="18"
                          rx="3"
                          ry="3"
                          fill="#c0c0c0"
                        />
                        <rect
                          x="6"
                          y="10"
                          width="6"
                          height="10"
                          rx="2"
                          fill="#9aa0a6"
                        />
                        <rect
                          x="18"
                          y="10"
                          width="6"
                          height="10"
                          rx="2"
                          fill="#9aa0a6"
                        />
                      </svg>
                      <svg
                        version="1.1"
                        className="contactless"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M6 6c3 2 3 6 0 8"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9 4c4 3 4 9 0 12"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <p className="number">5614 6827 1416 5471</p>
                      <p className="valid_thru">VALID THRU</p>
                      <p className="date_8264">Javohir Hakimov</p>
                    </div>
                    <div className="flip-card-back">
                      <div className="strip"></div>
                      <div className="mstrip"></div>
                      <div className="sstrip">
                        <p className="code">***</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Contact Button */}
              <a
                href="https://t.me/KamolovNamoz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 8.368-1.268 8.368-.159.708-.534.708-.534.708s-2.697-.217-3.613-.217c0 0-1.604-.217-1.604-.217-.534-.159-.534-.708-.534-.708s.159-1.066.159-1.066l3.059-2.697s.217-.159.217-.375c0-.217-.217-.217-.217-.217l-3.613 2.055s-.708.375-1.066.375c-.375 0-.708-.375-.708-.375s-.375-1.066-.375-1.066 3.059-13.456 3.059-13.456c.159-.708.708-.708.708-.708s1.066.217 1.066.217 8.368 3.059 8.368 3.059c.708.217.708.708.708.708z" />
                </svg>
                Admin bilan bog'lanish
              </a>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                To'lov qilish tartibi
              </h5>
              <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
                <li>
                  Yuqoridagi karta raqamiga kerakli miqdorda to'lov qiling
                </li>
                <li>To'lov chekini surat qilib oling</li>
                <li>"Admin bilan bog'lanish" tugmasini bosing</li>
                <li>Telegramda chekni adminga yuboring</li>
                <li>Admin tasdiqlashidan keyin hisobingiz to'ldiriladi</li>
              </ol>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  To'lovni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ProjectsList() {
  useLayoutEffect(() => {
    const container = document.getElementById("main-scroll");
    if (container && "scrollTo" in container) {
      try {
        (container as any).scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        (container as HTMLElement).scrollTop = 0;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            O'quvchilar loyihalari
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card
            key={index}
            className="relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
            onClick={() => {
              if (project.url) {
                window.open(project.url, "_blank");
              }
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {project.url && project.url.includes("javohirhakimov.uz") ? (
                  <div className="relative flex-shrink-0 w-20 h-20">
                    <img
                      src="/images/border.png"
                      alt="Border"
                      className="absolute inset-0 w-full h-full animate-spin-slow"
                    />
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={`${project.title} logo`}
                        className="absolute w-4/5 h-4/5 object-contain z-10"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ) : (
                      <project.icon
                        className="absolute w-7 h-7 text-primary z-10"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow overflow-hidden flex-shrink-0">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={`${project.title} logo`}
                        className="w-16 h-16 object-contain rounded-md"
                      />
                    ) : (
                      <project.icon className="w-7 h-7 text-primary" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {project.title}
                  </h3>
                  {project.url && (
                    <p className="text-sm text-primary/70 font-mono">
                      {project.url
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "")}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {project.badge}
                </Badge>
                      <span className="text-lg font-bold text-primary">
                        {project.price}
                      </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-muted-foreground mb-4">
          Ko'proq loyihalar tez orada...
        </h3>
      </div>
    </>
  );
}

function HomeContent({ setActiveTab, onProxOfflineClick, setSkipScroll }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      {/* Hero Section - Rasmdagidek dizayn */}
      <div className="relative min-h-[60vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden rounded-2xl mb-12">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80"></div>

        {/* Content container */}
        <div className="relative z-10 container mx-auto px-6 pt-12 pb-16">
          <div className="max-w-4xl">
            {/* Sarlavha */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight font-poppins">
              proX -{" "}
              <span className="text-cyan-300">dasturlash akademiyasi</span>
            </h1>

            {/* Tavsif */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed font-open-sans">
              proX - dasturlash akademiyasi dasturlashni o'rganib daromadga
              chiqishingizga yordam berishni 100% KAFOLATLAYDI! Akademiya metodi
              sun'iy intellektga asoslangan va sizga eng zamonaviy
              texnologiyalardan foydalanish o'rgatiladi.
            </p>

            {/* Tugmalar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <style>
                {`
                .button-wrapper {
                  position: relative;
                  display: inline-block;
                }
                .animated-border-svg {
                  position: absolute;
                  top: -4px;
                  left: -4px;
                  width: calc(100% + 8px);
                  height: calc(100% + 8px);
                  pointer-events: none;
                  z-index: 1;
                }
                .rotating-border {
                  width: 100%;
                  height: 100%;
                  stroke: #06b6d4;
                  stroke-width: 2px;
                  fill: transparent;
                  rx: 2rem;
                  ry: 2rem;
                  stroke-dasharray: 20 10;
                  animation: 3s linear infinite rotate-border;
                }
                .rotating-border-secondary {
                  stroke: #ffffff;
                }
                @keyframes rotate-border {
                  0% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: 30; }
                }
                `}
              </style>

              <div className="button-wrapper">
                <svg
                  className="animated-border-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect className="rotating-border" pathLength="100"></rect>
                </svg>
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background motion-safe:transition-[background-color,transform,box-shadow] motion-safe:duration-200 motion-safe:ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:motion-safe:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                  onClick={() => {
                    window.open("https://t.me/proX_akademiya", "_blank");
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram kanalimiz
                </button>
              </div>

              <div className="button-wrapper">
                <svg
                  className="animated-border-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    className="rotating-border rotating-border-secondary"
                    pathLength="100"
                  ></rect>
                </svg>
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background motion-safe:transition-[background-color,transform,box-shadow] motion-safe:duration-200 motion-safe:ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:motion-safe:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:text-accent-foreground h-11 w-full sm:w-auto border-white text-white hover:bg-white/10 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-full relative z-10"
                  onClick={onProxOfflineClick}
                >
                  <User className="w-5 h-5 mr-2" />
                  O'quvchilar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik element - yuqori o'ng burchakda */}
        <div className="absolute top-8 right-8 w-32 h-32 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-cyan-300"
            >
              <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
              <circle cx="100" cy="100" r="60" strokeOpacity="0.4" />
              <circle cx="100" cy="100" r="40" strokeOpacity="0.5" />
            </g>
            <circle
              cx="100"
              cy="100"
              r="6"
              fill="currentColor"
              className="text-cyan-300"
            />
          </svg>
        </div>
      </div>

      {/* KURSLAR PREVIEW */}
      <CoursesPreview
        onShowAll={() => {
          setActiveTab("Kurslar");
          navigate("/courses");
        }}
        setActiveTab={setActiveTab}
        navigate={navigate}
        setSkipScroll={setSkipScroll}
      />

      {/* Statistika bo'limi - OLIB TASHLANDI */}
      {/* Xizmatlar bo'limi */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Bizning xizmatlar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Online kurslar */}
          <div className="group rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-blue-500 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Online kurslar</h3>
            <p className="text-base opacity-80">
              Zamonaviy texnologiyalar bo'yicha to'liq kurslar va praktik
              mashg'ulotlar
            </p>
          </div>
          {/* Loyihalar */}
          <div className="group rounded-2xl p-8 bg-gradient-to-br from-blue-900 via-cyan-500 to-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-tr hover:from-blue-500 hover:to-cyan-500 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              <Code className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Loyihalar</h3>
            <p className="text-base opacity-80">
              Real loyihalar orqali amaliy tajriba va portfolio yaratish
            </p>
          </div>
          {/* Mentorlik */}
          <div className="group rounded-2xl p-8 bg-gradient-to-br from-cyan-500 via-blue-900 to-slate-900 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-tr hover:from-blue-500 hover:to-slate-900 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Mentorlik</h3>
            <p className="text-base opacity-80">
              Tajribali dasturchilar bilan individual maslahat va yo'riqlik
            </p>
          </div>
        </div>
      </div>

      {/* Afzalliklar bo'limi */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-12 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Nima uchun proX?
          </h2>
          <p className="text-xl text-white/80">
            proX akademiyasining afzalliklari va imkoniyatlari
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Praktik yondashuv */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Praktik yondashuv
            </h3>
            <p className="text-gray-300">
              Nazariya emas, real loyihalar orqali o'rganish
            </p>
          </div>
          {/* Qulay o'rganish */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Qulay o'rganish
            </h3>
            <p className="text-gray-300">
              O'z tezoringizda va istalgan joydan o'rganish
            </p>
          </div>
          {/* Zamonaviy texnologiyalar */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Zamonaviy texnologiyalar
            </h3>
            <p className="text-gray-300">
              Eng so'nggi va talabgir texnologiyalar
            </p>
          </div>
          {/* Karyera yordami */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Karyera yordami
            </h3>
            <p className="text-gray-300">
              Ish topish va karyera rivojlanishida yordam
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function BlogsContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">Blogs</h2>
      <p className="text-muted-foreground max-w-2xl">
        Markdown asosida bloglar yaratish, o'qish va boshqarish imkoniyati. Tez
        orada ko'proq bloglar va funksiyalar qo'shiladi!
      </p>
      <div className="rounded-lg border bg-card p-6 text-muted-foreground">
        <span>Bloglar tez orada...</span>
      </div>
    </div>
  );
}

function ResumeBuilderContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Resume Builder
      </h2>
      <p className="text-muted-foreground max-w-2xl">
        Oson va tez professional rezyume tayyorlash uchun qulay vosita. Tez
        orada ishga tushadi!
      </p>
      <div className="rounded-lg border bg-card p-6 text-muted-foreground">
        <span>Resume builder funksiyasi tez orada...</span>
      </div>
    </div>
  );
}

function MyCoursesContent({ navigate }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ensure the main scroll container starts at the top
  useLayoutEffect(() => {
    const container = document.getElementById("main-scroll");
    if (container && "scrollTo" in container) {
      try {
        (container as any).scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        (container as HTMLElement).scrollTop = 0;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getJwtToken();
      if (!token) {
        setError("Tizimga kirish kerak");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/user/enrolled-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses || []);
      } else {
        setError("Kurslarni yuklashda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 sm:px-4 lg:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Kurslarim</h2>
        <Button
          variant="link"
          className="text-cyan-300 p-0 h-auto hover:text-cyan-200"
          onClick={() => navigate("/courses")}
        >
          Barcha kurslar →
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Skeleton className="w-full h-40 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-center text-muted-foreground">
          Hozircha hech qanday kursga yozilmagansiz
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Card
              key={course.id}
              className="relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10"
            >
              <CardContent className="p-0">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover object-center rounded-t-2xl"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-800/30 flex items-center justify-center rounded-t-2xl">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <span className="inline-flex items-center gap-2 text-sm text-white/90 drop-shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"></div>
                      Qadam: <span className="font-bold text-white drop-shadow-sm">{stats.step}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm text-white/90 drop-shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                      Jami ball: <span className="font-bold text-white drop-shadow-sm">{totalScore}</span>
                    </span>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">O'qituvchi:</span>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Narxi:</span>
                      <span className="font-medium text-primary">
                        <img
                          src="/images/orange-dollar.png"
                          alt="$"
                          className="inline-block w-4 h-4 mr-1"
                        />
                        {new Intl.NumberFormat("uz-UZ", {
                          style: "currency",
                          currency: "UZS",
                          minimumFractionDigits: 0,
                        }).format(course.price || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Davomiyligi:
                      </span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {course.level || "Boshlang'ich"}
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => navigate(`/learning/${course.id}`)}
                    >
                      Davom etish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OfflineContent() {
  return (
    <div>
      <h2>Offline Content</h2>
      <p>This is offline content.</p>
    </div>
  );
}

function BeautifulCodeContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Beautiful Code
      </h2>
      <p className="text-muted-foreground max-w-2xl">
        Kodlarni chiroyli va o'qiladigan formatda ko'rsatish uchun maxsus
        vosita. Tez orada ishga tushadi!
      </p>
      <div className="rounded-lg border bg-card p-6 text-muted-foreground">
        <span>Beautiful code funksiyasi tez orada...</span>
      </div>
    </div>
  );
}

function ProfileContent({
  setIsLoggedIn,
  setActiveTab,
  setActiveProject,
  navigate,
}) {
  const [isLoggedIn, setIsLoggedInLocal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [formData, setFormData] = useState({
    fullName: "",
    region: "",
    district: "",
    school: "",
    grade: "",
    phone: "+998",
    password: "",
    confirmPassword: "",
  });

  // Cascading selects data
  const UZ_REGIONS: Record<string, string[]> = {
    Andijon: ["Andijon shahri", "Asaka", "Marhamat"],
    Buxoro: ["Buxoro shahri", "G'ijduvon", "Jondor"],
    "Farg'ona": ["Farg'ona shahri", "Qo'qon", "Quva"],
    Jizzax: ["Jizzax shahri", "Zomin", "Forish"],
    Namangan: ["Namangan shahri", "Chortoq", "Chust"],
    Navoiy: ["Navoiy shahri", "Qiziltepa", "Konimex"],
    Qashqadaryo: ["Qarshi shahri", "Shahrisabz", "Koson"],
    Samarqand: ["Samarqand shahri", "Kattaqo'rg'on", "Urgut"],
    Surxondaryo: ["Termiz shahri", "Denov", "Sherobod"],
    Sirdaryo: ["Guliston shahri", "Sirdaryo", "Boyovut"],
    Toshkent: ["Nurafshon", "Qibray", "Bo'stonliq"],
    Xorazm: ["Urganch shahri", "Xiva", "Xonqa"],
  };

  const SCHOOL_OPTIONS = Array.from(
    { length: 100 },
    (_, i) => `${i + 1}-maktab`,
  );
  const GRADE_OPTIONS = Array.from({ length: 11 }, (_, i) => `${i + 1}-sinf`);
  const districtOptions = formData.region
    ? UZ_REGIONS[formData.region] || []
    : [];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Ma'lumot yo'q";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const months = [
      "yanvar",
      "fevral",
      "mart",
      "aprel",
      "may",
      "iyun",
      "iyul",
      "avgust",
      "sentyabr",
      "oktyabr",
      "noyabr",
      "dekabr",
    ];

    return `${year}-yil ${day}-${months[month]} ${hours}:${minutes}`;
  };

  const loadEnrolledCourses = async () => {
    try {
      const token = getJwtToken();
      if (!token) return;

      const response = await fetch("/api/user/enrolled-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses);
      }
    } catch (error) {
      // Error loading enrolled courses handled silently
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = getJwtToken();
    if (token) {
      checkAuthStatus();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getJwtToken();
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedInLocal(true);
        setIsLoggedIn(true);
        setUserData(data.user);

        // Load enrolled courses
        await loadEnrolledCourses();

        // Redirect admin users to admin panel
        if (data.user.role === "admin") {
          window.location.href = "/admin";
          return;
        }
      } else {
        // Tokenni o'chirmaymiz, faqat foydalanuvchiga xabar chiqamiz
        setIsLoggedInLocal(false);
        setIsLoggedIn(false);
        setUserData(null);
        // Masalan, toast yoki alert bilan xabar berish mumkin
        // toast({ title: "Avtorizatsiya xatosi", description: "Token yaroqsiz yoki foydalanuvchi topilmadi." });
      }
    } catch (error) {
      setIsLoggedInLocal(false);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Format phone number as user types
      let formattedValue = value.replace(/\D/g, ""); // Remove all non-digits

      if (formattedValue.startsWith("998")) {
        formattedValue = "+" + formattedValue;
      } else if (formattedValue.startsWith("7")) {
        formattedValue = "+998" + formattedValue;
      } else if (
        formattedValue.length > 0 &&
        !formattedValue.startsWith("998")
      ) {
        formattedValue = "+998" + formattedValue;
      }

      // Add spaces for better readability
      if (formattedValue.length > 4) {
        formattedValue = formattedValue.replace(
          /(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/,
          "$1 $2 $3 $4 $5",
        );
      }

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError("");
  };

  const validateForm = () => {
    // Remove spaces and check if phone number is complete
    const cleanPhone = formData.phone.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length < 13) {
      setError("Telefon raqam to'liq emas");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Parol kamida 6 ta belgi bo'lishi kerak");
      return false;
    }
    if (!isLoginMode) {
      if (!formData.fullName.trim()) {
        setError("Ism-familya kiritilishi shart");
        return false;
      }
      if (!formData.region) {
        setError("Viloyat tanlanmagan");
        return false;
      }
      if (!formData.district) {
        setError("Tuman/shahar tanlanmagan");
        return false;
      }
      if (!formData.school) {
        setError("Maktab tanlanmagan");
        return false;
      }
      if (!formData.grade) {
        setError("Sinf tanlanmagan");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Parollar mos kelmadi");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
      const body = isLoginMode
        ? { phone: formData.phone, password: formData.password }
        : {
            fullName: formData.fullName.trim(),
            phone: formData.phone,
            password: formData.password,
            role: "student",
            meta: {
              region: formData.region,
              district: formData.district,
              school: formData.school,
              grade: formData.grade,
            },
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // Set JWT token in cookie
        saveJwtToken(data.token);
        setSuccess(data.message);
        setIsLoggedInLocal(true);
        setIsLoggedIn(true);
        setUserData(data.user);

        // Redirect admin users to admin panel
        if (data.user.role === "admin") {
          window.location.href = "/admin";
          return;
        }

        // Redirect to profile page
        window.location.hash = "#profile";

        // Reset form
        setFormData({
          fullName: "",
          region: "",
          district: "",
          school: "",
          grade: "",
          phone: "+998",
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeJwtToken();
    setIsLoggedInLocal(false);
    setIsLoggedIn(false);
    setUserData(null);
    setSuccess("");
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <Card>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isLoginMode ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
            </h2>
            <p className="text-muted-foreground">
              {isLoginMode
                ? "Akkauntingizga kirish uchun ma'lumotlaringizni kiriting"
                : "Yangi akkaunt yaratish uchun ma'lumotlaringizni kiriting"}
            </p>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Ism-familya
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Masalan: Ali Valiyev"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  
                  {/* Region / District / School / Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Viloyat
                      </label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={(e) => {
                          // reset district when region changes
                          const v = e.target.value;
                          setFormData((p) => ({
                            ...p,
                            region: v,
                            district: "",
                          }));
                          setError("");
                        }}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Tanlang</option>
                        {Object.keys(UZ_REGIONS).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Tuman/Shahar
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        disabled={!formData.region}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="">
                          {formData.region
                            ? "Tanlang"
                            : "Avval viloyatni tanlang"}
                        </option>
                        {districtOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Maktab
                      </label>
                      <select
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Tanlang</option>
                        {SCHOOL_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Sinf
                      </label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Tanlang</option>
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+998"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Parol
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    isLoginMode ? "Parolingizni kiriting" : "Parol yarating"
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {!isLoginMode && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Parolni tasdiqlang
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Parolni qayta kiriting"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Kutilmoqda..."
                  : isLoginMode
                    ? "Tizimga kirish"
                    : "Ro'yxatdan o'tish"}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              {isLoginMode
                ? "Sizda hali akkaunt yo'qmi?"
                : "Akkauntingiz bormi?"}{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                  setSuccess("");
                  setFormData({
                    fullName: "",
                    region: "",
                    district: "",
                    school: "",
                    grade: "",
                    phone: "+998",
                    password: "",
                    confirmPassword: "",
                    arrivalDate: "",
                  });
                }}
              >
                {isLoginMode ? "Ro'yxatdan o'ting" : "Tizimga kirish"}
              </Button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Profil</h2>
          <p className="text-muted-foreground max-w-2xl">
            Bu bo'limda siz o'z profil ma'lumotlaringizni ko'rish va
            tahrirlashingiz mumkin.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Chiqish
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Shaxsiy ma'lumotlar</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">To'liq ism:</span>
              <p className="font-medium">
                {userData?.fullName || "Ma'lumot yo'q"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Telefon:</span>
              <p className="font-medium">
                {userData?.phone || "Ma'lumot yo'q"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Balans:</span>
              <p className="font-medium text-primary">
                {userData?.balance || 0} so'm
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Ro'yxatdan o'tgan sana:
              </span>
              <p className="font-medium text-sm text-muted-foreground">
                {formatDate(userData?.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">A'zo bo'lgan kurslar</h3>
          <div className="space-y-2">
            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course, index) => (
                  <div key={course.id} className="relative bg-muted rounded-md overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {course.instructor}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {course.level}
                        </Badge>
                      </div>
                    </div>

                    <div className="relative bg-background rounded-md p-8">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-muted-foreground font-black mb-4">Progress:</span>
                        <span
                          className="font-black leading-none"
                          style={{ fontSize: '300px', lineHeight: '1' }}
                        >
                          {course.progress || 0}%
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="w-full bg-muted rounded-full h-4">
                          <div
                            className="bg-primary h-4 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {course.duration}
                        </span>
                        <span className="text-primary font-medium">
                          {new Intl.NumberFormat("uz-UZ", {
                            style: "currency",
                            currency: "UZS",
                            minimumFractionDigits: 0,
                          }).format(course.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Hali hech qanday kursga a'zo bo'lmagansiz
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("Kurslar");
                    setActiveProject("");
                    navigate("/courses");
                  }}
                >
                  Kurslarni ko'rish
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecurityContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Check if user is logged in and load data
  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setDataLoading(true);
    try {
      const token = getJwtToken();
      if (!token) {
        setDataLoading(false);
        return;
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setDataLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yangi parollar mos kelmadi");
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Yangi parol kamida 6 ta belgi bo'lishi kerak");
      setLoading(false);
      return;
    }

    try {
      const token = getJwtToken();

      if (!token) {
        setError("Tizimga kirish kerak");
        setLoading(false);
        return;
      }

      console.log("Sending password change request...");
      console.log("Token:", token);
      console.log("Request body:", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        setSuccess("Parol muvaffaqiyatli o'zgartirildi");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowChangePassword(false);
      } else {
        setError(data.message || "Parol o'zgartirishda xatolik");
      }
    } catch (error) {
      setError(
        "Server bilan bog'lanishda xatolik. Iltimos, serverni ishga tushiring.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading while data is being fetched
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Xavfsizlik ma'lumotlari yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Xavfsizlik
          </h2>
          <p className="text-muted-foreground">
            Xavfsizlik sozlamalariga kirish uchun tizimga kiring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Xavfsizlik
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Bu bo'limda siz o'z akkauntingiz xavfsizligini boshqarishingiz
            mumkin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parol o'zgartirish */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parol o'zgartirish</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              {showChangePassword ? "Bekor qilish" : "O'zgartirish"}
            </Button>
          </div>

          {showChangePassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Joriy parol
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Joriy parolingizni kiriting"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Yangi parol
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Yangi parol yarating"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Yangi parolni tasdiqlang
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Yangi parolni qayta kiriting"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Kutilmoqda..." : "Parolni o'zgartirish"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setError("");
                    setSuccess("");
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Parolingizni xavfsiz saqlash uchun muntazam o'zgartiring
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Parol faol</span>
              </div>
            </div>
          )}
        </Card>

        {/* Boshqa qurilmalar */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Boshqa qurilmalar</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Windows 10 - Chrome</p>
                  <p className="text-xs text-muted-foreground">
                    Toshkent, O'zbekiston
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Joriy
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">iPhone 14 - Safari</p>
                  <p className="text-xs text-muted-foreground">
                    Toshkent, O'zbekiston
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                Chiqarish
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">MacBook Pro - Safari</p>
                  <p className="text-xs text-muted-foreground">
                    Toshkent, O'zbekiston
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                Chiqarish
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="w-full">
              Barcha qurilmalardan chiqish
            </Button>
          </div>
        </Card>
      </div>

      {/* Xavfsizlik maslahatlari */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Xavfsizlik maslahatlari</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-green-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Kuchli parol ishlatish</h4>
              <p className="text-sm text-muted-foreground">
                Harflar, raqamlar va belgilar bilan
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-green-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                Ikki bosqichli autentifikatsiya
              </h4>
              <p className="text-sm text-muted-foreground">
                Qo'shimcha xavfsizlik uchun
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-1">
              <span className="text-yellow-600 text-xs font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                Noma'lum qurilmalarni tekshirish
              </h4>
              <p className="text-sm text-muted-foreground">
                Tanish bo'lmagan qurilmalarni chiqarib tashlang
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Muntazam yangilanish</h4>
              <p className="text-sm text-muted-foreground">
                Parolingizni 3 oyda bir marta o'zgartiring
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PaymentsContent() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "card",
    description: "",
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [monthlyPayments, setMonthlyPayments] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Check user authentication and load payment data
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setDataLoading(true);
    try {
      const token = getJwtToken();
      if (!token) {
        setDataLoading(false);
        return;
      }

      // Load user profile and balance
      const profileResponse = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserBalance(profileData.user.balance || 0);
      }

      // Load payment statistics
      const statsResponse = await fetch("/api/payments/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setTotalPayments(statsData.stats.totalPayments);
        setMonthlyPayments(statsData.stats.monthlyPayments);
      }

      // Load payment history
      const historyResponse = await fetch("/api/payments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setPaymentHistory(historyData.payments);
      }
    } catch (error) {
      // Error loading payment data handled silently
    } finally {
      setDataLoading(false);
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getJwtToken();
      if (!token) {
        alert("Iltimos, avval tizimga kiring");
        return;
      }

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          description: paymentForm.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("To'lov muvaffaqiyatli amalga oshirildi!");
        setPaymentForm({
          amount: "",
          paymentMethod: "card",
          description: "",
        });
        setShowPaymentForm(false);
        loadPaymentData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "To'lovda xatolik yuz berdi");
      }
    } catch (error) {
      alert("To'lovda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (dataLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">To'lovlar</h2>
          <p className="text-muted-foreground max-w-2xl">
            Bu yerda yangi to'lovlar qilishingiz mumkin.
          </p>
        </div>
        <Button variant="default" onClick={() => setShowPaymentForm(true)}>
          Hisobni to'ldirish
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="secondary">Joriy</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">Joriy balans</h3>
          <p className="text-3xl font-bold text-primary mb-2">
            {formatCurrency(userBalance)}
          </p>
          <p className="text-sm text-muted-foreground">
            Oxirgi yangilanish: bugun
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="outline">Umumiy</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">Umumiy to'lovlar</h3>
          <p className="text-3xl font-bold text-primary mb-2">
            {formatCurrency(totalPayments)}
          </p>
          <p className="text-sm text-muted-foreground">
            Barcha vaqtlar bo'yicha
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <Badge variant="outline">Bu oy</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">Bu oy to'lovlar</h3>
          <p className="text-3xl font-bold text-primary mb-2">
            {formatCurrency(monthlyPayments)}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("uz-UZ", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </Card>
      </div>

      {/* Enhanced Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-ultra-thin">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    To'lovni amalga oshirish
                  </h3>
                  <p className="text-sm text-white/70">Hisobni to'ldirish</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
              >
                <X className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors duration-300" />
              </button>
            </div>

            {/* Card Information Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-800/30 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    To'lov kartasi
                  </h4>
                  <p className="text-sm text-white/70">
                    Quyidagi kartaga to'lov qiling
                  </p>
                </div>
              </div>

              {/* Card Number Display */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Karta raqami</p>
                    <p className="text-lg font-mono font-bold text-white tracking-wider">
                      5614 6827 1416 5471
                    </p>
                  </div>
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">UZCARD</span>
                  </div>
                </div>
              </div>

              {/* Admin Contact Button */}
              <a
                href="https://t.me/KamolovNamoz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 8.368-1.268 8.368-.159.708-.534.708-.534.708s-2.697-.217-3.613-.217c0  0-1.604-.217-1.604-.217-.534-.159-.534-.708-.534-.708s.159-1.066.159-1.066l3.059-2.697s.217-.159.217-.375c0-.217-.217-.217-.217-.217l-3.613 2.055s-.708.375-1.066.375c-.375 0-.708-.375-.708-.375s-.375-1.066-.375-1.066 3.059-13.456 3.059-13.456c.159-.708.708-.708.708-.708s1.066.217 1.066.217 8.368 3.059 8.368 3.059c.708.217.708.708.708.708z" />
                </svg>
                Admin bilan bog'lanish
              </a>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                To'lov qilish tartibi
              </h5>
              <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
                <li>
                  Yuqoridagi karta raqamiga kerakli miqdorda to'lov qiling
                </li>
                <li>To'lov chekini surat qilib oling</li>
                <li>"Admin bilan bog'lanish" tugmasini bosing</li>
                <li>Telegramda chekni adminga yuboring</li>
                <li>Admin tasdiqlashidan keyin hisobingiz to'ldiriladi</li>
              </ol>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading || !paymentForm.amount}
                  className={`flex-1 px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                    loading || !paymentForm.amount
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105"
                  }`}
                >
                  {loading ? "Jarayonda..." : "To'lovni tasdiqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">To'lovlar tarixi</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Hisobot yuklash
          </Button>
        </div>

        <div className="space-y-4">
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {payment.description || "To'lov"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "uz-UZ",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{formatCurrency(payment.amount)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Hali hech qanday to'lov qilmagansiz
              </p>
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(true)}
              >
                Birinchi to'lovni qiling
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function MobileNavbar({
  activeTab,
  setActiveTab,
  activeProject,
  setActiveProject,
  isLoggedIn,
  handleMenuClick,
  handleProjectClick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuClick = (title) => {
    handleMenuClick(title);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const onProjectClick = (project) => {
    handleProjectClick(project);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div className="md:hidden">
      {/* Mobile Navbar - Enhanced */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-700 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-0 h-12 relative">
          {/* Logo Section - Enhanced */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMenuClick("Bosh sahifa")}
              aria-label="Bosh sahifa"
              className="relative w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50"
              title="Bosh sahifa"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Centered Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/images/prox.png"
              alt="ProX logo"
              className="h-7 object-contain"
            />
          </div>

          {/* Right actions: Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
              aria-label="Menyuni ochish"
            >
              <Menu
                className={`w-5 h-5 text-white transition-all duration-300 ${isMenuOpen ? "rotate-90 text-cyan-400" : "group-hover:text-cyan-400"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay - Background dimming when drawer is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer - Enhanced */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer Header - Enhanced */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-slate-800/30 rounded-lg flex items-center justify-center shadow-lg cursor-pointer"
              onClick={() => onMenuClick("Bosh sahifa")}
              title="Bosh sahifa"
            >
              <Home className="w-5 h-5 text-white" />
            </div>

            <img
              src="/images/prox.png"
              alt="ProX logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
          >
            <X className="w-4 h-4 text-white group-hover:text-cyan-400 transition-colors duration-300" />
          </button>
        </div>

        {/* Drawer Content - Enhanced */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* Asosiy menyu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider font-jetbrains">
                ASOSIY
              </h3>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === item.title && !activeProject
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
                  onClick={() => onMenuClick(item.title)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium font-jetbrains">
                    {item.title}
                  </span>
                  {activeTab === item.title && !activeProject && (
                    <div className="w-2 h-2 bg-cyan-300 rounded-full ml-auto"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User specific menu items - only show when logged in */}
          {isLoggedIn && (
            <div className="space-y-2 pt-4 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-jetbrains">
                Mening kurslarim
              </h3>
              {userMenuItems.map((item) => (
                <Button
                  key={item.title}
                  variant={
                    activeTab === item.title && !activeProject
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start h-12"
                  onClick={() => onMenuClick(item.title)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="text-base font-jetbrains">{item.title}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Sozlamalar */}
          <div className="space-y-2 pt-4 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-jetbrains">
              Sozlamalar
            </h3>
            <Button
              variant={activeProject === "Blogs" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => onProjectClick("Blogs")}
            >
              <User className="w-5 h-5 mr-3" />
              <span className="text-base font-jetbrains">Profil</span>
            </Button>
            <Button
              variant={
                activeProject === "Resume Builder" ? "secondary" : "ghost"
              }
              className="w-full justify-start h-12"
              onClick={() => onProjectClick("Resume Builder")}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="text-base font-jetbrains">Xavfsizlik</span>
            </Button>
            {isLoggedIn && (
              <Button
                variant={activeProject === "Payments" ? "secondary" : "ghost"}
                className="w-full justify-start h-12"
                onClick={() => onProjectClick("Payments")}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                <span className="text-base font-jetbrains">To'lovlar</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProxOffline() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  // Helper to safely get selected user's ID (backend may return id or _id)
  const currentUserId = selectedUser ? (selectedUser as any).id || (selectedUser as any)._id : null;
  // Warnings state per user (local, UI-only)
  const [warningsByUser, setWarningsByUser] = useState<Record<string, string[]>>({});
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningTarget, setWarningTarget] = useState<number>(1);
  const [warningReason, setWarningReason] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  // Certificate info modal
  const [certInfoOpen, setCertInfoOpen] = useState(false);
  const [certInfo, setCertInfo] = useState<{ title: string; index: number }>({ title: "", index: 0 });
  // Certificates state
  const certificateTitles = [
    "HTML sertifikati",
    "CSS & Bootstrap sertifikati",
    "JavaScript Asoslari sertifikati",
    "Nodejs Asoslari sertifikati",
    "Express Foundation sertifikati",
    "Mongo DB sertifikati",
    "Deployment Foundation sertifikati",
  ];
  const [certsByUser, setCertsByUser] = useState<Record<string, boolean[]>>({});
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certTarget, setCertTarget] = useState<number>(-1);
  const [certAction, setCertAction] = useState<"unlock"|"lock">("unlock");

  // Local helpers for progress to avoid scope issues
  const daysSinceArrival = (arrival?: string) => {
    if (!arrival) return 0;
    const a = new Date(arrival);
    if (isNaN(a.getTime())) return 0;
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, days);
  };

  const progressPercent = (user: any) => {
    const days = daysSinceArrival(user?.arrivalDate);
    if (!days) return 0;
    const step = Number(user?.step || 0);
    // Allow values > 100 when step > days
    return Math.round(Math.max(0, (step / days) * 100));
  };

  const progressGainLoss = (user: any) => {
    const days = daysSinceArrival(user?.arrivalDate);
    const step = Number(user?.step || 0);
    if (!days) return { text: "", classes: "" };
    const diff = step - days;
    if (diff > 0) return { text: `O'quvchi ${diff} kun yutgan`, classes: "text-emerald-300" };
    if (diff < 0) return { text: `O'quvchining ${Math.abs(diff)} kuni kuygan`, classes: "text-red-300" };
    return { text: "Balans teng", classes: "text-white/60" };
  };

  // Helper function to format date as DD/MM/YY
  const formatDateDDMMYY = (dateString: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);

      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  // Helper function to get technology logo/icon for each certificate
  const getTechnologyIcon = (title: string) => {
    const iconMap: Record<string, string> = {
      "HTML sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      "CSS & Bootstrap sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
      "JavaScript Asoslari sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      "Nodejs Asoslari sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      "Express Foundation sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
      "Mongo DB sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
      "Deployment Foundation sertifikati": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    };
    return iconMap[title] || "https://via.placeholder.com/200x150/666666/ffffff?text=LOGO";
  };

  const performanceInfo = (user: any) => {
    const days = daysSinceArrival(user?.arrivalDate);
    const step = Number(user?.step || 0);
    const ratio = days > 0 ? step / days : 0;
    if (ratio >= 1) {
      return {
        level: "good",
        text: "Ota-onasining pulini alo darajada oqlayapti",
        classes:
          "border-green-500/40 bg-green-500/10 text-green-200",
      };
    } else if (ratio >= 0.66) {
      return {
        level: "avg",
        text: "Ota-onasining pulini o'rtacha oqlayapti",
        classes:
          "border-amber-500/40 bg-amber-500/10 text-amber-200",
      };
    }
    return {
      level: "bad",
      text: "Ota-onasining pulini yomon oqlayapti",
      classes: "border-red-500/40 bg-red-500/10 text-red-200",
    };
  };

  // Helper: persist warnings to server (admin only)
  const updateWarnings = async (userId: string, nextWarnings: string[]): Promise<boolean> => {
    try {
      const token = getJwtToken();
      if (!token) return false;
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ warnings: nextWarnings }),
      });
      if (!res.ok) return false;
      // refresh that single user from backend list to ensure consistency
      try {
        const ref = await fetch(`/api/admin/users/${userId}`);
        if (ref.ok) {
          const d = await ref.json();
          setWarningsByUser((prev) => ({ ...prev, [userId]: d?.user?.warnings || nextWarnings }));
        }
      } catch {}
      return true;
    } catch {
      return false;
    }
  };

  // Persist certificates (admin only)
  const updateCertificates = async (userId: string, unlocked: boolean[]): Promise<boolean> => {
    try {
      const token = getJwtToken();
      if (!token) return false;
      const titles = certificateTitles.filter((_, i) => unlocked[i]);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ certificates: titles }),
      });
      if (!res.ok) return false;
      try {
        const ref = await fetch(`/api/admin/users/${userId}`);
        if (ref.ok) {
          const d = await ref.json();
          const serverTitles: string[] = d?.user?.certificates || titles;
          const arr = certificateTitles.map((t) => serverTitles.includes(t));
          setCertsByUser((prev) => ({ ...prev, [userId]: arr }));
        }
      } catch {}
      return true;
    } catch {
      return false;
    }
  };

  // Check current user role to restrict giving warnings to admins only
  useEffect(() => {
    const check = async () => {
      try {
        const token = getJwtToken();
        if (!token) return;
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data?.user?.role === "admin");
        }
      } catch {}
    };
    check();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/offline-students");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
          // Initialize warnings map from backend (support id or _id)
          try {
            const map: Record<string, string[]> = {};
            (data.users || []).forEach((u: any) => {
              const uid = u.id || u._id;
              if (!uid) return;
              map[uid] = Array.isArray(u.warnings) ? u.warnings : [];
            });
            setWarningsByUser(map);
            // Initialize certificates map from backend
            try {
              const cmap: Record<string, boolean[]> = {};
              (data.users || []).forEach((u: any) => {
                const uid = u.id || u._id;
                if (!uid) return;
                const raw = Array.isArray(u.certificates) ? u.certificates : [];
                // Support both string[] of titles and boolean[] from backend
                let arr: boolean[];
                if (raw.length > 0 && typeof raw[0] === "boolean") {
                  // boolean[] -> pad/trim to our titles length
                  arr = certificateTitles.map((_, i) => !!raw[i]);
                } else {
                  const titles = raw as string[];
                  arr = certificateTitles.map((t) => titles.includes(t));
                }
                cmap[uid] = arr;
              });
              setCertsByUser(cmap);
            } catch {}
          } catch {}
        } else {
          setError("Foydalanuvchilarni yuklashda xatolik");
        }
      } catch {
        setError("Server bilan bog'lanishda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  // Helper to get current week dates (Monday to Saturday ONLY)
  function getCurrentWeekDates() {
    const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"]; // Sunday removed
    const months = [
      "yanvar",
      "fevral",
      "mart",
      "aprel",
      "may",
      "iyun",
      "iyul",
      "avgust",
      "sentabr",
      "oktabr",
      "noyabr",
      "dekabr",
    ];
    const now = new Date();
    const week = [] as { label: string; date: string; iso: string }[];
    // Find Monday of this week
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    for (let i = 0; i < 6; i++) {
      // Only 6 days (Mon-Sat)
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const day = d.getDate();
      const month = months[d.getMonth()];
      week.push({
        label: days[i],
        date: `${day}-${month}`,
        iso: d.toISOString().slice(0, 10),
      });
    }
    return week;
  }

  function getAllowedDays(user: any): string[] {
    return Array.isArray(user?.attendanceDays) ? user.attendanceDays : [];
  }

  function buildWeekPointsForUser(user: any) {
    const week = getCurrentWeekDates();
    const allowedDays = getAllowedDays(user);
    return week.map((day) => {
      const found = (user?.todayScores || []).find(
        (s: any) => s.date === day.date,
      );
      const score = found ? Number(found.score) || 0 : 0;
      if (allowedDays.length > 0 && !allowedDays.includes(day.label)) return 0;
      return score;
    });
  }

  function dateToDayCode(d: Date): string {
    const idx = (d.getDay() + 6) % 7; // Monday=0
    return ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"][idx];
  }

  return (
    <div className="w-full animate-fade-in">
      {!selectedUser ? (
        <div>
          {/* Students List Section - Compact */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="container mx-auto px-6 pb-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Offline O'quvchilar
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Bizning dasturlash akademiyasimizda o'qiyotgan talabalar
                    ro'yxati
                  </p>

                  {/* Search Input */}
                  <div className="relative w-full max-w-md mx-auto">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-5 h-5"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </span>
                    <Input
                      placeholder="O'quvchini qidirish..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 text-lg sm:py-5 sm:text-xl bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl backdrop-blur-sm focus:bg-white/20 focus:border-cyan-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="mb-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-muted-foreground">Dasturchi</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                          Offline Student
                        </span>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-50 p-3 rounded-xl border border-red-200 mt-1">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-white/80 bg-white/10 p-4 rounded-xl backdrop-blur-sm mt-1">
              Offline o'quvchilar topilmadi
            </div>
          ) : null}
        </div>
      ) : (
        <div className="w-full animate-fade-in pb-16">
          {/* Student Detail Hero Section */}
          <div className="relative min-h-[60vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80"></div>

            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-cyan-300"
                >
                  <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
                  <circle cx="100" cy="100" r="60" strokeOpacity="0.4" />
                  <circle cx="100" cy="100" r="40" strokeOpacity="0.5" />
                </g>
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="currentColor"
                  className="text-cyan-300"
                />
              </svg>
            </div>

            {/* Back button */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
              <button
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedUser(null)}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm sm:text-base">Orqaga</span>
              </button>
            </div>

            {/* Content container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-8 pb-8 flex flex-col items-center">
              {/* Decorative background */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -left-16 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[65%] h-40 bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-3xl blur-2xl" />
              </div>
              <div className="w-full text-center mb-4">
                {/* Student Name */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] mt-2 mb-10 sm:mb-12 tracking-tight">
                  {selectedUser.fullName}
                </h1>

                {/* Statistics Cards - moved under name */}
                {/* Local keyframes for continuous glow */}
                <style>{`
                  @keyframes glowPulse {
                    0% { opacity: .35; filter: blur(22px); }
                    50% { opacity: .8; filter: blur(28px); }
                    100% { opacity: .35; filter: blur(22px); }
                  }
                  @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes spinSlowReverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                  }
                  .animate-spin-slow {
                    animation: spinSlow 8s linear infinite;
                  }
                  .animate-spin-slow-reverse {
                    animation: spinSlowReverse 6s linear infinite;
                  }
                `}</style>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto mb-4 mt-4">
                  {/* Step Card - Modern Design with Green & Black */}
                  <div className="relative rounded-3xl p-6 text-center h-52 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/20 via-green-500/15 via-teal-500/10 to-slate-900/30 border-2 border-emerald-400/50 backdrop-blur-xl shadow-2xl">
                    {/* Main icon with gradient */}
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-white drop-shadow-lg"
                        >
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      {/* Pulsing ring */}
                      <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 animate-ping opacity-75"></div>
                    </div>

                    {/* Step value with gradient text */}
                    <div className="text-5xl font-black mb-2 bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(16,185,129,0.3)]">
                      {selectedUser.step ?? 1}
                    </div>

                    {/* Label with modern styling */}
                    <div className="text-sm font-semibold text-emerald-200/90 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(16,185,129,0.2)]">
                      Qadam
                    </div>
                  </div>

                  {/* Total Score Card - Modern Design with Black Gradient */}
                  <div className="relative rounded-3xl p-6 text-center h-52 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/40 via-gray-900/30 via-black/20 to-slate-900/50 border-2 border-slate-600/60 backdrop-blur-xl shadow-2xl">
                    {/* Main icon with gradient */}
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-600 via-gray-700 to-black rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-white drop-shadow-lg"
                        >
                          <path d="M21 21V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14" />
                          <path d="M3 21h18" />
                          <path d="M7 12v9" />
                          <path d="M11 12v9" />
                          <path d="M15 12v9" />
                          <path d="M19 12v9" />
                        </svg>
                      </div>
                      {/* Pulsing ring */}
                      <div className="absolute inset-0 rounded-2xl bg-slate-400/30 animate-ping opacity-75"></div>
                    </div>

                    {/* Score value with gradient text */}
                    <div className="text-5xl font-black mb-2 bg-gradient-to-r from-slate-200 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(148,163,184,0.3)]">
                      {(selectedUser.todayScores || []).reduce(
                        (sum, s) => sum + (s.score || 0),
                        0,
                      )}
                    </div>

                    {/* Label with modern styling */}
                    <div className="text-sm font-semibold text-slate-300/90 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(148,163,184,0.2)]">
                      Jami ball
                    </div>
                  </div>
                </div>

                {/* Performance Banner - removed as per request */}


                {/* Termination overlay if 3 warnings (users only) */}
                {!isAdmin && warningsByUser[selectedUser.id] &&
                  warningsByUser[selectedUser.id].filter(Boolean).length >= 3 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                      <div className="relative w-full max-w-lg mx-4 rounded-lg border border-red-500 bg-red-950 p-6 text-red-100 shadow-lg">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-center text-red-200">Sizning o'qishingiz to'xtatildi</h3>
                        </div>
                        <div className="space-y-2 text-sm text-red-100">
                          {warningsByUser[selectedUser.id]
                            .filter(Boolean)
                            .map((r, idx) => (
                              <div key={idx} className="p-2 bg-red-900/50 rounded">
                                <span className="font-semibold">{idx + 1}-Ogohlantirish:</span> {r}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                

                {/* Progress */}
                <div className="mt-5 max-w-5xl mx-auto w-full">
                  <div className="flex items-center justify-start mb-3 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white/95">
                      <strong className="text-cyan-300">ProX akademiyasida</strong> o'quvchining natijasi va ota-onasining pulini oqlash darajasi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-8 sm:h-10 rounded-full bg-slate-900/30 border border-white/10 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-500 ${
                          progressPercent(selectedUser) > 55
                            ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400'
                            : 'bg-gradient-to-r from-red-400 via-red-500 to-red-400'
                        }`}
                        style={{ width: `${Math.min(100, progressPercent(selectedUser))}%` }}
                      />
                    </div>
                    <div className={`backdrop-blur-sm rounded-md px-3 py-2 border ${
                      progressPercent(selectedUser) > 55
                        ? 'bg-emerald-500/20 border-emerald-400/30'
                        : 'bg-red-500/20 border-red-400/30'
                    }`}>
                      <span className={`font-black tracking-wide text-2xl sm:text-3xl ${
                        progressPercent(selectedUser) > 55 ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        {Math.round(progressPercent(selectedUser))}%
                      </span>
                    </div>
                  </div>
                  {(() => { const info = progressGainLoss(selectedUser); return info.text ? (
                    <div className={`mt-3 text-center text-base ${info.classes}`}>{info.text}</div>
                  ) : null })()}
                </div>

                {/* Info Cards: Arrival, Today, Total Days (reordered) */}
                <div className="mt-6 sm:mt-8 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Boshlangan sana */}
                  <div className="relative rounded-3xl p-5 border-4 border-amber-400/40 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-white/90" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-white/90">Boshlangan sana</div>
                        <div className="text-white/95 font-extrabold text-2xl sm:text-3xl mt-1 truncate">
                          {formatDateDDMMYY(selectedUser.arrivalDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bugungi sana */}
                  <div className="relative rounded-3xl p-5 border-4 border-emerald-400/40 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-white/90" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-white/90">Bugungi sana</div>
                        <div className="text-white/95 font-extrabold text-2xl sm:text-3xl mt-1 truncate">
                          {formatDateDDMMYY(new Date().toISOString())}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Jami kunlar */}
                  <div className="relative rounded-3xl p-5 border-4 border-violet-400/40 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-white/90" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-white/90">Jami kunlar</div>
                        <div className="text-white/95 font-extrabold text-3xl sm:text-4xl mt-1 truncate">
                          {daysSinceArrival(selectedUser.arrivalDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings - Ogohlantirishlar */}
                <div className="mt-5 max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1-Ogohlantirish */}
                    {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setWarningTarget(1);
                        setWarningReason(currentUserId ? (warningsByUser[currentUserId]?.[0] || "") : "");
                        setWarningModalOpen(true);
                      }}
                      className="relative rounded-3xl border-4 border-amber-500/80 bg-gradient-to-br from-amber-600/40 via-yellow-600/35 to-orange-600/40 p-6 text-center shadow-2xl"
                    >
                      <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border-4 border-amber-500/80 bg-gradient-to-br from-amber-500/40 to-yellow-500/40 flex items-center justify-center shadow-xl">
                          {currentUserId && (warningsByUser[currentUserId]?.[0]) ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-200 animate-bounce">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              <path d="M12 14v2" />
                            </svg>
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <circle cx="12" cy="16" r="1" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div className="text-xl font-bold text-amber-100 mb-2 tracking-wide">1-Ogohlantirish</div>
                        <div className="text-sm text-white/90 min-h-[24px] font-medium leading-relaxed">
                          {currentUserId && (warningsByUser[currentUserId]?.[0]) ? "1-Ogohlantirish olindi" : ""}
                        </div>
                      </div>
                    </button>
                    ) : (
                      <div className="relative rounded-3xl border-4 border-amber-500/80 bg-gradient-to-br from-amber-600/40 via-yellow-600/35 to-orange-600/40 p-6 text-center opacity-85 cursor-not-allowed shadow-2xl">
                        <div className="relative z-10">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border-4 border-amber-500/80 bg-gradient-to-br from-amber-500/40 to-yellow-500/40 flex items-center justify-center shadow-xl">
                            {currentUserId && (warningsByUser[currentUserId]?.[0]) ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-300 animate-bounce">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                <path d="M12 14v2" />
                              </svg>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            )}
                          </div>
                          <div className="text-xl font-bold text-amber-200 mb-2">1-Ogohlantirish</div>
                          <div className="text-sm text-white/90 min-h-[20px] font-medium">
                            {currentUserId && (warningsByUser[currentUserId]?.[0]) ? "1-Ogohlantirish olindi" : ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 2-Ogohlantirish */}
                    {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUserId || !(warningsByUser[currentUserId]?.[0])) {
                          alert("Avval 1-ogohlantirishni bering.");
                          return;
                        }
                        setWarningTarget(2);
                        setWarningReason(currentUserId ? (warningsByUser[currentUserId]?.[1] || "") : "");
                        setWarningModalOpen(true);
                      }}
                      disabled={!currentUserId || !(warningsByUser[currentUserId]?.[0])}
                      className={`relative rounded-3xl border-4 border-rose-500/80 p-6 text-center shadow-2xl ${currentUserId && warningsByUser[currentUserId]?.[0]
                        ? "bg-gradient-to-br from-rose-600/50 via-red-600/45 to-pink-600/50"
                        : "opacity-75 cursor-not-allowed bg-rose-700/40 border-rose-400/70"}
                      `}
                    >
                      <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border-4 bg-gradient-to-br flex items-center justify-center border-rose-500/80 from-rose-500/50 to-red-500/50 shadow-xl">
                          {currentUserId && (warningsByUser[currentUserId]?.[1]) ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-200 animate-bounce">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              <path d="M12 14v2" />
                            </svg>
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <circle cx="12" cy="16" r="1" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div className="text-xl font-bold mb-2 tracking-wide text-rose-200">
                          2-Ogohlantirish
                        </div>
                        <div className="text-sm text-white/90 min-h-[24px] font-medium leading-relaxed">
                          {currentUserId && (warningsByUser[currentUserId]?.[1]) ? "2-Ogohlantirish olindi" : ""}
                        </div>
                      </div>
                    </button>
                    ) : (
                      <div className="relative rounded-3xl border-4 border-rose-500/80 bg-gradient-to-br from-rose-600/50 via-red-600/45 to-pink-600/50 p-6 text-center opacity-85 cursor-not-allowed shadow-2xl">
                        <div className="relative z-10">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border-4 bg-gradient-to-br flex items-center justify-center border-rose-500/80 from-rose-500/50 to-red-500/50 shadow-xl">
                            {currentUserId && (warningsByUser[currentUserId]?.[1]) ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300 animate-bounce">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                <path d="M12 14v2" />
                              </svg>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            )}
                          </div>
                          <div className="text-xl font-bold mb-2 text-rose-300">
                            2-Ogohlantirish
                          </div>
                          <div className="text-sm text-white/90 min-h-[20px] font-medium">
                            {currentUserId && (warningsByUser[currentUserId]?.[1]) ? "2-Ogohlantirish olindi" : ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 3-Ogohlantirish */}
                    {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUserId || !(warningsByUser[currentUserId]?.[1])) {
                          alert("Avval 2-ogohlantirishni bering.");
                          return;
                        }
                        setWarningTarget(3);
                        setWarningReason(currentUserId ? (warningsByUser[currentUserId]?.[2] || "") : "");
                        setWarningModalOpen(true);
                      }}
                      disabled={!currentUserId || !(warningsByUser[currentUserId]?.[1])}
                      className={`relative rounded-3xl border-4 border-slate-600/80 p-6 text-center ${currentUserId && warningsByUser[currentUserId]?.[1]
                        ? "bg-gradient-to-br from-slate-900/80 via-gray-900/70 to-black/60 shadow-2xl"
                        : "opacity-75 cursor-not-allowed bg-slate-800/40 border-slate-500/60"}
                      `}
                    >
                      <div className="relative z-10">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl border-4 bg-gradient-to-br flex items-center justify-center ${currentUserId && warningsByUser[currentUserId]?.[1]
                          ? "border-slate-500/80 from-slate-700/40 to-gray-700/40 shadow-xl"
                          : "border-slate-400/70 bg-slate-600/30"}
                        `}>
                          {currentUserId && (warningsByUser[currentUserId]?.[2]) ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 animate-bounce">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              <path d="M12 14v2" />
                            </svg>
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${currentUserId && warningsByUser[currentUserId]?.[1] ? 'text-slate-400' : 'text-slate-500'}`}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <circle cx="12" cy="16" r="1" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div className={`text-xl font-bold mb-2 ${currentUserId && warningsByUser[currentUserId]?.[1] ? 'text-slate-100' : 'text-slate-400'}`}>
                          3-Ogohlantirish
                        </div>
                        <div className="text-sm text-white/90 min-h-[24px] font-medium leading-relaxed">
                          {currentUserId && (warningsByUser[currentUserId]?.[2]) ? "3-Ogohlantirish olindi" : ""}
                        </div>
                      </div>
                    </button>
                    ) : (
                      <div className="relative rounded-3xl border-4 border-slate-600/80 bg-gradient-to-br from-slate-900/80 via-gray-900/70 to-black/60 p-6 text-center backdrop-blur-sm opacity-85 cursor-not-allowed shadow-2xl">
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br opacity-35 ${currentUserId && warningsByUser[currentUserId]?.[1]
                          ? "from-slate-600/15 via-gray-600/8 to-black/15"
                          : "from-slate-400/8 via-slate-500/5 to-slate-600/8"}
                        `} />
                        <div className="relative z-10">
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl border-4 bg-gradient-to-br flex items-center justify-center ${currentUserId && warningsByUser[currentUserId]?.[1]
                            ? "border-slate-400/60 from-slate-600/20 to-gray-600/20 shadow-xl"
                            : "border-slate-300/60 bg-slate-500/15 shadow-lg"}
                          `}>
                            {currentUserId && (warningsByUser[currentUserId]?.[2]) ? (
                              <div className="text-center animate-pulse">
                                <div className="text-slate-200 font-bold text-sm mb-1">3-Ogohlantirish</div>
                                <div className="text-slate-100 font-semibold text-xs">olindi</div>
                              </div>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${currentUserId && warningsByUser[currentUserId]?.[1] ? 'text-slate-400' : 'text-slate-500'}`}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            )}
                          </div>
                          <div className={`text-xl font-bold mb-2 ${currentUserId && warningsByUser[currentUserId]?.[1] ? 'text-slate-200' : 'text-slate-400'}`}>
                            3-Ogohlantirish
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="relative rounded-xl p-[2px] overflow-hidden">
                      <div className="relative z-10 flex items-center justify-center text-amber-400 bg-amber-900/20 border border-amber-500/40 rounded-xl px-3 py-2 text-base sm:text-lg">
                        <span className="font-semibold text-center">Agar 3 ta ogohlantirish olsangiz ProX academiyasidan haydalasiz! ❗</span>
                      </div>
                    </div>
                  </div>
                  {/* Reasons list */}
                  {currentUserId && warningsByUser[currentUserId] && warningsByUser[currentUserId].some(Boolean) && (
                    <div className="mt-4 space-y-3">
                      {warningsByUser[currentUserId].map((r, idx) => (
                        r ? (
                          <div
                            key={idx}
                            className={`relative flex items-start justify-between gap-3 rounded-xl px-4 py-3 border backdrop-blur-sm shadow-sm
                              ${idx === 0 ? "bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-amber-300/10 border-amber-300/30" : ""}
                              ${idx === 1 ? "bg-gradient-to-br from-rose-500/10 via-red-500/5 to-rose-300/10 border-rose-300/30" : ""}
                              ${idx === 2 ? "bg-gradient-to-br from-slate-500/10 via-slate-400/5 to-slate-300/10 border-slate-300/30" : ""}
                            `}
                          >
                            <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                              ${idx === 0 ? "bg-amber-400/15 border border-amber-300/40" : ""}
                              ${idx === 1 ? "bg-rose-400/15 border border-rose-300/40" : ""}
                              ${idx === 2 ? "bg-slate-400/15 border border-slate-300/40" : ""}
                            `}>
                              <AlertTriangle className={`w-4 h-4
                                ${idx === 0 ? "text-amber-300" : ""}
                                ${idx === 1 ? "text-rose-300" : ""}
                                ${idx === 2 ? "text-slate-200" : ""}
                              `} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-semibold text-white/90 mb-0.5">
                                {idx + 1}-Ogohlantirish sababi:
                              </div>
                              <div className="text-base text-white/80 break-words">
                                {r}
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-2.5 py-1 text-xs rounded-md border border-red-400/40 text-red-300 hover:bg-red-400/10 transition-colors"
                                  onClick={async () => {
                                    if (!currentUserId) return;
                                    const next = [...(warningsByUser[currentUserId] || [])];
                                    next[idx] = "";
                                    const ok = await updateWarnings(currentUserId, next);
                                    if (ok) {
                                      setWarningsByUser((prev) => ({ ...prev, [currentUserId]: next }));
                                    } else {
                                      alert("Ogohlantirishni bekor qilishda xatolik");
                                    }
                                  }}
                                >
                                  Bekor qilish
                                </button>
                              </div>
                            )}
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}
                </div>

                {/* Certificates - Locked Card */}
                <div className="mt-8 max-w-5xl mx-auto">
                  <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Sertifikatlar</h3>
                    </div>
                    {/* Keys Section - Kalitlar */}
                    <div className="mb-3 flex items-center justify-center gap-3">
                      {certificateTitles.map((_, idx) => (
                        <div key={idx} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          currentUserId && certsByUser[currentUserId]?.[idx]
                            ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-400/50'
                            : 'bg-slate-600 border-slate-500'
                        }`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                          </svg>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {certificateTitles.map((title, idx) => {
                        const unlocked = currentUserId ? !!certsByUser[currentUserId]?.[idx] : false;
                        const content = (
                          <div
                            className={`group relative rounded-3xl p-[2px] transition-all duration-300 hover:scale-[1.01] overflow-hidden`}
                          >
                            {/* Programming-themed border pattern */}
                            <div className="absolute inset-0 rounded-3xl overflow-hidden">
                              {/* Subtle tech grid pattern */}
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-500/5 to-transparent opacity-20"></div>
                            </div>
                            <div
                              className={`relative z-10 flex items-center gap-4 rounded-3xl p-4 sm:p-5 min-h-[160px] sm:min-h-[180px] shadow-sm hover:shadow-md ${unlocked
                                ? "border border-emerald-300/20"
                                : "border border-white/10"
                              }`}
                              style={{ backgroundImage: `url('${getTechnologyIcon(title)}')`, backgroundRepeat: 'no-repeat', backgroundSize: '60%', backgroundPosition: 'center' }}
                            >
                              {/* Bottom gradient overlay for text readability */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/30 to-transparent" />
                              <div className="relative z-10 flex items-center justify-center h-full">
                                <div className="w-20 h-20 rounded-3xl bg-white/90 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center">
                                  {unlocked ? (
                                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                                  ) : (
                                    <Lock className="w-12 h-12 text-slate-700" />
                                  )}
                                </div>
                              </div>
                              <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] text-xs">
                                {isAdmin ? "Bosing" : ""}
                              </div>
                            </div>
                          </div>
                        );
                        if (!isAdmin)
                          return (
                            <div key={idx} className="text-left">
                              <div className="mb-3">
                                {content}
                              </div>
                              <div className="text-center">
                                <span className="text-white/80 text-sm font-medium">
                                  {title}
                                </span>
                              </div>
                            </div>
                          );
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCertTarget(idx);
                              setCertAction(unlocked ? "lock" : "unlock");
                              setCertModalOpen(true);
                            }}
                            className="text-left cursor-pointer"
                          >
                            <div className="mb-3">
                              {content}
                            </div>
                            <div className="text-center">
                              <span className="text-white/80 text-sm font-medium">
                                {title}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Employment guarantee banner when 7+ certificates unlocked */}
                {currentUserId && (certsByUser[currentUserId]?.filter(Boolean).length || 0) >= 7 && (
                  <div className="mt-6 max-w-5xl mx-auto">
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 px-4 py-5 text-center backdrop-blur-md shadow-xl">
                      <div className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                        100% ish bilan ta'minlanadi
                      </div>
                      <div className="text-sm sm:text-base mt-1 text-emerald-200/90">
                        Kamida $100 daromad bilan!
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificate Modal (admin) */}
                {certModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          {certAction === "unlock"
                            ? "Rostan ham ushbu sertifikatni ochmoqchimisiz?"
                            : "Rostan ham sertifikatni yopmoqchimisiz?"}
                        </h3>
                        <button className="p-2 rounded hover:bg-muted" onClick={() => setCertModalOpen(false)}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {certificateTitles[certTarget]}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCertModalOpen(false)}>Yo'q</Button>
                        <Button
                          onClick={async () => {
                            if (!currentUserId) return;

                            // Sertifikat ochish tartibini tekshirish
                            const currentCerts = certsByUser[currentUserId] || new Array(certificateTitles.length).fill(false);

                            // Agar bu sertifikatdan avvalgi sertifikatlar ochilmagan bo'lsa, xabar berish
                            for (let i = 0; i < certTarget; i++) {
                              if (!currentCerts[i]) {
                                // Toast notification yaratish
                                const notification = document.createElement('div');
                                notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg border border-red-400 animate-in slide-in-from-top-2 duration-300';
                                notification.innerHTML = `
                                  <div class="flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span class="font-medium">Avval "${certificateTitles[i]}" sertifikatini olishingiz kerak!</span>
                                  </div>
                                `;

                                document.body.appendChild(notification);

                                // 3 soniya keyin notification o'chirish
                                setTimeout(() => {
                                  if (notification.parentNode) {
                                    notification.parentNode.removeChild(notification);
                                  }
                                }, 3000);

                                return;
                              }
                            }

                            const current = certsByUser[currentUserId] || new Array(certificateTitles.length).fill(false);
                            const next = [...current];
                            next[certTarget] = certAction === "unlock";
                            const ok = await updateCertificates(currentUserId, next);
                            if (ok) {
                              setCertsByUser((p) => ({ ...p, [currentUserId]: next }));
                              setCertModalOpen(false);
                            } else {
                              alert("Sertifikat holatini saqlashda xatolik");
                            }
                          }}
                        >
                          Ha
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificate Info Modal for regular users */}
                {certInfoOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-500"
                    onClick={() => setCertInfoOpen(false)}
                  >
                    <div
                      className="bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-slate-900/95 rounded-3xl p-8 w-full max-w-4xl mx-4 border border-slate-600/50 shadow-2xl max-h-[95vh] overflow-hidden transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-emerald-500/10 animate-pulse"></div>

                      {/* Header */}
                      <div className="relative flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/40 via-cyan-500/30 to-emerald-500/40 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20">
                            <Eye className="w-10 h-10 text-white drop-shadow-lg" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                              {certificateTitles[certInfo.index]} ma'lumotlari
                            </h3>
                            <p className="text-white/70 text-lg">Batafsil ma'lumotlar va talablar</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCertInfoOpen(false)}
                          className="w-14 h-14 bg-slate-700/60 hover:bg-slate-600/60 rounded-2xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <X className="w-7 h-7 text-white group-hover:text-cyan-400 transition-colors duration-300" />
                        </button>
                      </div>

                      {/* Main Content */}
                      <div className="relative space-y-8">
                        {/* Certificate Title & Status */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
                          <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-emerald-500/30 flex items-center justify-center shadow-lg border border-white/20">
                              {certsByUser[currentUserId]?.[certInfo.index] ? (
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                              ) : (
                                <Lock className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-3xl font-bold text-white mb-3">
                                {certificateTitles[certInfo.index]}
                              </h4>
                              <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full ${certsByUser[currentUserId]?.[certInfo.index] ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'} shadow-lg`}></div>
                                <span className={`text-xl font-semibold ${certsByUser[currentUserId]?.[certInfo.index] ? 'text-emerald-300' : 'text-slate-300'}`}>
                                  {certsByUser[currentUserId]?.[certInfo.index] ? '✅ Sertifikat ochilgan' : '🔒 Sertifikat qulf holatida'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Certificate Description */}
                          <div className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/50">
                            <p className="text-white/90 leading-relaxed text-lg">
                              {getCertificateDescription(certificateTitles[certInfo.index])}
                            </p>
                          </div>

                          {/* Certificate Requirements */}
                          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                            <h5 className="text-blue-300 font-bold mb-4 text-xl flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-blue-300 text-lg">📋</span>
                              </div>
                              Sertifikat talablari:
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {getCertificateRequirements(certificateTitles[certInfo.index]).map((req, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-1 flex-shrink-0"></div>
                                  <span className="text-white/90 text-base leading-relaxed">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Certificate Visual & Progress */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Visual Certificate */}
                          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-8 text-center border border-slate-700/50 shadow-2xl">
                            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500/40 via-cyan-500/30 to-emerald-500/40 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                              {certsByUser[currentUserId]?.[certInfo.index] ? (
                                <CheckCircle className="w-16 h-16 text-emerald-400 drop-shadow-lg" />
                              ) : (
                                <Lock className="w-16 h-16 text-slate-400 drop-shadow-lg" />
                              )}
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-3">
                              {certificateTitles[certInfo.index]}
                            </h4>
                            <p className={`text-lg ${certsByUser[currentUserId]?.[certInfo.index] ? 'text-emerald-300' : 'text-slate-400'}`}>
                              {certsByUser[currentUserId]?.[certInfo.index] ? '🎉 Sertifikat muvaffaqiyatli ochilgan!' : '🔒 Sertifikat qulf holatida'}
                            </p>
                            <div className="mt-6">
                              <div className="w-full bg-slate-700/50 rounded-full h-3 mb-2">
                                <div
                                  className={`h-3 rounded-full transition-all duration-1000 ${certsByUser[currentUserId]?.[certInfo.index] ? 'bg-gradient-to-r from-emerald-400 to-green-400 w-full' : 'bg-slate-500 w-0'}`}
                                ></div>
                              </div>
                              <p className="text-sm text-white/60">
                                {certsByUser[currentUserId]?.[certInfo.index] ? '100% to\'liq' : '0% to\'liq'}
                              </p>
                            </div>
                          </div>

                          {/* Certificate Info */}
                          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8">
                            <h5 className="text-indigo-300 font-bold mb-6 text-xl flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-300 text-lg">ℹ️</span>
                              </div>
                              Sertifikat haqida:
                            </h5>

                            <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                  <span className="text-purple-300 text-lg">🏆</span>
                                </div>
                                <div>
                                  <p className="text-white/80 text-sm">Darajasi</p>
                                  <p className="text-white font-semibold">Professional</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                  <span className="text-cyan-300 text-lg">⏱️</span>
                                </div>
                                <div>
                                  <p className="text-white/80 text-sm">Davomiyligi</p>
                                  <p className="text-white font-semibold">3-6 oy</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                  <span className="text-emerald-300 text-lg">🎯</span>
                                </div>
                                <div>
                                  <p className="text-white/80 text-sm">Maqsadi</p>
                                  <p className="text-white font-semibold">Kasbiy ko'nikmalar</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-6 pt-6 border-t border-slate-700/50">
                          <Button
                            variant="outline"
                            onClick={() => setCertInfoOpen(false)}
                            className="flex-1 bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50 hover:border-slate-500/50 text-lg py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                          >
                            Modal oynani yopish
                          </Button>
                          {!certsByUser[currentUserId]?.[certInfo.index] && (
                            <Button
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-lg py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              Sertifikatni ochish
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Modal */}
                {warningModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          {warningTarget}-Ogohlantirish
                        </h3>
                        <button className="p-2 rounded hover:bg-muted" onClick={() => setWarningModalOpen(false)}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm text-muted-foreground">Sababi</label>
                        <textarea
                          rows={4}
                          value={warningReason}
                          onChange={(e) => setWarningReason(e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                          placeholder="Sababni yozing..."
                        />
                        <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
                          {currentUserId && warningsByUser[currentUserId]?.[warningTarget - 1] && (
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                if (!currentUserId) return;
                                const next = [...(warningsByUser[currentUserId] || [])];
                                next[warningTarget - 1] = "";
                                const ok = await updateWarnings(currentUserId, next);
                                if (ok) {
                                  setWarningsByUser((prev) => ({ ...prev, [currentUserId]: next }));
                                  setWarningModalOpen(false);
                                  setWarningReason("");
                                } else {
                                  alert("Ogohlantirishni bekor qilishda xatolik");
                                }
                              }}
                            >
                              Ogohlantirishni bekor qilish
                            </Button>
                          )}
                          <div className="ml-auto flex gap-2">
                            <Button variant="outline" onClick={() => setWarningModalOpen(false)}>Yopish</Button>
                            <Button
                              onClick={async () => {
                                if (!selectedUser?.id) return;
                                const next = [...(warningsByUser[selectedUser.id] || [])];
                                next[warningTarget - 1] = (warningReason || "").trim();
                                const ok = await updateWarnings(selectedUser.id, next);
                                if (ok) {
                                  setWarningsByUser((prev) => ({ ...prev, [selectedUser.id]: next }));
                                  setWarningModalOpen(false);
                                  setWarningReason("");
                                } else {
                                  alert("Ogohlantirishni saqlashda xatolik");
                                }
                              }}
                            >
                              Ogohlantirish berish
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Chart Section - REMOVED AS PER REQUEST */}

        </div>
      )}
    </div>
  );
}

function CoursesPreview({ onShowAll, setActiveTab, navigate, setSkipScroll }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/courses?limit=3")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => setError("Kurslarni yuklashda xatolik yuz berdi"))
      .finally(() => setLoading(false));
  }, []);

  const handleCourseClick = () => {
    setActiveTab("Kurslar");
    navigate("/courses");
    // Ensure the main scroll container starts from the very top
    const container = document.getElementById("main-scroll");
    if (container) {
      try {
        (container as any).scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        (container as HTMLElement).scrollTop = 0;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-12">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="w-full h-40 rounded-t-2xl mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-500 my-12">{error}</div>;
  }
  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Kurslar</h2>
        <Button
          variant="link"
          className="text-cyan-300 text-lg p-0 h-auto hover:text-cyan-200 transition-colors duration-200"
          onClick={handleCourseClick}
        >
          Barchasini ko'rish →
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div
              className={`rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-600 ${
                course.imageUrl
                  ? "bg-gradient-to-br from-slate-700 to-slate-900"
                  : "bg-slate-800"
              }`}
            >
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover object-center"
                />
              ) : (
                <div className="w-full h-48 bg-slate-800 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-gray-400" />
                </div>
              )}
              <div className="p-4 bg-slate-900">
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis">
                  {course.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Bosh sahifa");
  const [activeProject, setActiveProject] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [skipScroll, setSkipScroll] = useState(false);

  // Check if user is logged in and handle URL hash
  useEffect(() => {
    const token = getJwtToken();
    if (token) {
      setIsLoggedIn(true);
      // Get user data from token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({
          fullName: payload.fullName || "Foydalanuvchi",
          phone: payload.phone || "",
        });
      } catch (error) {
        console.error("Error parsing token:", error);
        setUserData({
          fullName: "Foydalanuvchi",
          phone: "",
        });
      }
    }

    // Handle URL hash or path for profile/login redirect
    const handleHashOrPathChange = () => {
      if (window.location.hash === "#profile") {
        setActiveTab("O'quvchilar loyihalari");
        setActiveProject("Blogs");
        // Clear the hash
        window.history.replaceState(null, "", window.location.pathname);
      } else if (window.location.hash === "#courses") {
        setActiveTab("Kurslar");
        setActiveProject("");
        window.history.replaceState(null, "", window.location.pathname);
      } else if (
        window.location.hash === "#login" ||
        window.location.pathname.endsWith("/login")
      ) {
        setActiveTab("O'quvchilar loyihalari");
        setActiveProject("Blogs");
        // Clear the hash or path if needed
        if (window.location.hash === "#login") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };

    // Check hash/path on initial load
    handleHashOrPathChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashOrPathChange);
    // Listen for path changes (popstate)
    window.addEventListener("popstate", handleHashOrPathChange);

    return () => {
      window.removeEventListener("hashchange", handleHashOrPathChange);
      window.removeEventListener("popstate", handleHashOrPathChange);
    };
  }, []);

  // Scroll to top when activeTab changes (unless skipScroll is true)
  useLayoutEffect(() => {
    if (!skipScroll) {
      scrollToTop();
    }
    setSkipScroll(false); // Reset the flag
  }, [activeTab, activeProject]);

  // Sync UI state from URL path so back/forward works reliably
  useEffect(() => {
    const path = location.pathname.replace(/^\/+/, "");
    if (path === "") {
      navigate("/home", { replace: true });
      return;
    }
    const parts = path.split("/");
    const [root, sub] = parts;
    switch (root) {
      case "home":
        setActiveTab("Bosh sahifa");
        setActiveProject("");
        break;
      case "courses":
        setActiveTab("Kurslar");
        setActiveProject("");
        break;
      case "my-courses":
        setActiveTab("Kurslarim");
        setActiveProject("");
        break;
      case "projects":
        setActiveTab("O'quvchilar loyihalari");
        if (sub === "blogs") setActiveProject("Blogs");
        else if (sub === "resume") setActiveProject("Resume Builder");
        else if (sub === "payments") setActiveProject("Payments");
        else setActiveProject("");
        break;
      case "offline":
        setActiveTab("proX offline");
        setActiveProject("");
        break;
      default:
        break;
    }
  }, [location.pathname]);

  const scrollToTop = () => {
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const handleSidebarMenuClick = (title) => {
    setActiveTab(title);
    setActiveProject("");
    scrollToTop();
    // Navigate to route
    if (title === "Bosh sahifa") navigate("/home");
    else if (title === "Kurslar") navigate("/courses");
    else if (title === "Kurslarim") navigate("/my-courses");
    else if (title === "O'quvchilar loyihalari") navigate("/projects");
  };

  const handleProjectMenuClick = (project) => {
    setActiveTab("O'quvchilar loyihalari");
    setActiveProject(project);
    scrollToTop();
    // Navigate to project route
    if (project === "Blogs") navigate("/projects/blogs");
    else if (project === "Resume Builder") navigate("/projects/resume");
    else if (project === "Payments") navigate("/projects/payments");
    else navigate("/projects");
  };

  const handleProxOfflineClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab("proX offline");
      navigate("/offline");
      setIsLoading(false);
    }, 700);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        {/* Mobile Navbar */}
        <MobileNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          isLoggedIn={isLoggedIn}
          handleMenuClick={handleSidebarMenuClick}
          handleProjectClick={handleProjectMenuClick}
        />

        {/* Desktop Sidebar - Rasmdagidek dizayn */}
        <div className="hidden md:block">
          <div className="w-64 h-full bg-slate-900 border-r border-slate-700 flex flex-col">
            {/* Menu Content */}
            <div className="flex-1 p-4 space-y-6">
              {/* MENU Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider font-jetbrains">
                    MENU
                  </h3>
                </div>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.title}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                        activeTab === item.title && !activeProject
                          ? "bg-gradient-to-r from-slate-800 to-cyan-900 text-white"
                          : "text-gray-300 hover:bg-slate-800 hover:text-white"
                      }`}
                      onClick={() => handleSidebarMenuClick(item.title)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">
                        {item.title}
                      </span>
                      {activeTab === item.title && !activeProject && (
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full ml-auto"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* User specific menu items - only show when logged in */}
              {isLoggedIn && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                    <h3 className="text-white font-semibold text-xs uppercase tracking-wider font-jetbrains">
                      Mening kurslarim
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.title}
                        className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 justify-start ${
                          activeTab === item.title && !activeProject
                            ? "bg-gradient-to-r from-slate-800 to-cyan-900 text-white"
                            : "text-gray-300 hover:bg-slate-800 hover:text-white"
                        }`}
                        onClick={() => handleSidebarMenuClick(item.title)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap leading-snug flex-1 min-w-0">
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SOZLAMALAR Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider font-jetbrains">
                    SOZLAMALAR
                  </h3>
                </div>
                <div className="space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                      activeProject === "Blogs"
                        ? "bg-gradient-to-r from-slate-800 to-purple-900 text-white"
                        : "text-gray-300 hover:bg-slate-800 hover:text-white"
                    }`}
                    onClick={() => handleProjectMenuClick("Blogs")}
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">
                      Profil
                    </span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                      activeProject === "Resume Builder"
                        ? "bg-gradient-to-r from-slate-800 to-purple-900 text-white"
                        : "text-gray-300 hover:bg-slate-800 hover:text-white"
                    }`}
                    onClick={() => handleProjectMenuClick("Resume Builder")}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">
                      Xavfsizlik
                    </span>
                  </button>
                  {isLoggedIn && (
                    <button
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 justify-start ${
                        activeProject === "Payments"
                          ? "bg-gradient-to-r from-slate-800 to-purple-900 text-white"
                          : "text-gray-300 hover:bg-slate-800 hover:text-white"
                      }`}
                      onClick={() => handleProjectMenuClick("Payments")}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium text-sm font-jetbrains text-left block whitespace-nowrap overflow-hidden text-ellipsis leading-snug flex-1 min-w-0">
                        To'lovlar
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* User Profile - Bottom */}
            {isLoggedIn && userData && (
              <div className="p-4 border-t border-slate-700">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-800/30 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {userData.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-xs truncate">
                        {userData.fullName}
                      </div>
                      <div className="text-gray-400 text-xs">Online</div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <SidebarInset id="main-scroll" className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 md:pt-4 pt-20 pb-16">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            {!isLoading && activeTab === "Bosh sahifa" && (
              <HomeContent
                setActiveTab={setActiveTab}
                onProxOfflineClick={handleProxOfflineClick}
                setSkipScroll={setSkipScroll}
              />
            )}
            {activeTab === "Kurslar" && (
              <CoursesList
                setActiveTab={setActiveTab}
                setActiveProject={setActiveProject}
                navigate={navigate}
                setSkipScroll={setSkipScroll}
              />
            )}
            {activeTab === "Kurslarim" && (
              <MyCoursesContent navigate={navigate} />
            )}
            {activeTab === "O'quvchilar loyihalari" && !activeProject && (
              <ProjectsList />
            )}
            {activeTab === "O'quvchilar loyihalari" &&
              activeProject === "Blogs" && (
                <ProfileContent
                  setIsLoggedIn={setIsLoggedIn}
                  setActiveTab={setActiveTab}
                  setActiveProject={setActiveProject}
                  navigate={navigate}
                />
              )}
            {activeTab === "O'quvchilar loyihalari" &&
              activeProject === "Resume Builder" && <SecurityContent />}
            {activeTab === "O'quvchilar loyihalari" &&
              activeProject === "Payments" && <PaymentsContent />}
            {!isLoading && activeTab === "proX offline" && <ProxOffline />}
          </div>
        </SidebarInset>
      </div>

      {/* Floating Admin Contact Card */}
      <AdminContactCard />
    </SidebarProvider>
  );
}

function AdminContactCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [dismissed, setDismissed] = useState(false);

  // Only suppress within current session if user closed it
  useEffect(() => {
    try {
      const sessionDismissed =
        sessionStorage.getItem("adminContactDismissedSession") === "1";
      if (sessionDismissed) setDismissed(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 13000); // Auto-hide after a period

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [dismissed]);

  const handleContact = () => {
    // Always direct to Telegram handle @KamolovNamoz
    const tgUser = "KamolovNamoz";
    const tgDeepLink = `https://t.me/${tgUser}`;
    window.open(tgDeepLink, "_blank");
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("adminContactDismissedSession", "1");
    } catch {}
  };

  // When hidden or dismissed, do not render at all to avoid invisible clickable area
  if (dismissed || !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-2xl p-3 cursor-pointer transform transition-all duration-300 relative ${
          isHovered ? "scale-105 shadow-3xl" : "scale-100"
        }`}
        onClick={handleContact}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200 z-10"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div className="text-white">
            <p className="font-semibold text-xs font-poppins">
              Admin bilan bog'lanish
            </p>
          </div>
        </div>

        {/* Pulse animation */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-30 animate-ping"></div>
      </div>
    </div>
  );
}

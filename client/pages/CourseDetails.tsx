import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, DollarSign, Star, Users, ArrowLeft, X, CreditCard } from "lucide-react";
import { getJwtToken } from "@/lib/cookie";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: string;
  level: string;
  status: string;
  enrolledStudents: number;
  rating: number;
  totalRatings: number;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledList, setEnrolledList] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        // Fetch all courses and pick the one by id (no extra server endpoint needed)
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (!res.ok || !data?.courses) throw new Error(data?.message || 'Kurslar topilmadi');
        const list = (data.courses as Course[]);
        setAllCourses(list);
        const found = list.find(c => String(c.id) === String(courseId));
        if (!cancelled) {
          if (found) setCourse(found);
          else setError("Kurs topilmadi");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Server xatosi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  useEffect(() => {
    // Check if user is enrolled and load completed courses
    async function checkEnrollment() {
      try {
        const token = getJwtToken();
        if (!token) return;
        const res = await fetch('/api/user/enrolled-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const list: Course[] = data?.courses || [];
        setEnrolledList(list);
        setIsEnrolled(!!list.find(c => String(c.id) === String(courseId)));

        // Profile for completed courses
        const prof = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (prof.ok) {
          const p = await prof.json();
          const completed: string[] = p?.user?.completedCourses || [];
          setCompletedCourses(completed);
        }
      } catch {}
    }
    checkEnrollment();
  }, [courseId]);

  const priceFormatted = useMemo(() => {
    if (!course) return '';
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(course.price);
  }, [course]);

  // Derived flags for prerequisites
  const gateInfo = useMemo(() => {
    if (!course) return { isHtmlCourse: false, isCssBsCourse: false, isJsCourse: false, htmlEnrolled: false, cssBsEnrolled: false };
    const tl = course.title.toLowerCase();
    const isHtmlCourse = tl.includes('html');
    const isCssBsCourse = tl.includes('css') && tl.includes('bootstrap');
    const isJsCourse = tl.includes('javascript') || tl.includes('java script');
    const htmlEnrolled = enrolledList.some((c) => (c.title || '').toLowerCase().includes('html'));
    const cssBsEnrolled = enrolledList.some((c) => {
      const courseTitle = (c.title || '').toLowerCase();
      return courseTitle.includes('css') && courseTitle.includes('bootstrap');
    });
    return { isHtmlCourse, isCssBsCourse, isJsCourse, htmlEnrolled, cssBsEnrolled };
  }, [course, enrolledList, allCourses, completedCourses]);

  const handleComplete = async () => {
    if (!course) return;
    try {
      setCompleting(true);
      const token = getJwtToken();
      const res = await fetch(`/api/courses/${course.id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCompletedCourses((prev) => Array.from(new Set([...prev, String(course.id)])));
        alert("Kurs yakunlandi deb belgilandi");
      } else {
        alert(data?.message || "Belgilashda xatolik");
      }
    } finally {
      setCompleting(false);
    }
  };

  const handleEnroll = () => {
    if (!course) return;
    const token = getJwtToken();
    if (!token) {
      alert("Kirish talab qilinadi. Iltimos, avval tizimga kiring.");
      navigate("/");
      return;
    }
    setEnrollmentError("");
    setEnrollmentSuccess("");
    setShowEnrollmentModal(true);
  };

  const confirmEnrollment = async () => {
    if (!course) return;
    try {
      setEnrolling(true);
      setEnrollmentError("");
      const token = getJwtToken();
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIsEnrolled(true);
        setEnrollmentSuccess(data?.message || "Kursga a'zo bo'ldingiz");
        setShowEnrollmentModal(false);
      } else {
        // If balance related error -> open payment modal
        const msg = (data?.message || '').toLowerCase();
        if (msg.includes('yetmaydi') || msg.includes('insufficient') || msg.includes('balance') || msg.includes("mablag")) {
          setShowEnrollmentModal(false);
          setShowPaymentForm(true);
        } else {
          setEnrollmentError(data?.message || 'Xatolik yuz berdi');
        }
      }
    } catch (e: any) {
      setEnrollmentError(e?.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setEnrolling(false);
    }
  };

  const cancelEnrollment = () => {
    setShowEnrollmentModal(false);
    setEnrollmentError("");
    setEnrollmentSuccess("");
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-700/40 rounded w-48" />
          <div className="h-64 bg-slate-700/40 rounded" />
          <div className="h-24 bg-slate-700/40 rounded" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4">
        <Button
          variant="default"
          onClick={() => navigate(-1)}
          className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Orqaga
        </Button>
        <div className="text-red-500 text-sm bg-red-50/5 border border-red-200/20 rounded p-4">
          {error || 'Kurs topilmadi'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(-1)}
            className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Orqaga
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold font-jetbrains whitespace-nowrap overflow-hidden text-ellipsis">{course.title}</h1>
        </div>
      </div>

      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4 order-2 md:order-1">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{course.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.enrolledStudents} o'quvchi</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration}</div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4" /> {course.rating} ({course.totalRatings})</div>
              <div className="flex items-center gap-2 whitespace-nowrap"><BookOpen className="w-4 h-4" /> {course.instructor}</div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {priceFormatted}</div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 items-center">
              {isEnrolled ? (
                <>
                  <Button onClick={() => navigate(`/learning/${course.id}`)}>
                    Davom etish
                  </Button>
                  {!completedCourses.includes(String(course.id)) && (
                    <Button variant="outline" onClick={handleComplete} disabled={completing}>
                      {completing ? "Jarayonda..." : "Kursni tugatdim"}
                    </Button>
                  )}
                </>
              ) : gateInfo.isCssBsCourse && !gateInfo.htmlEnrolled ? (
                <Button disabled className="whitespace-nowrap">
                  Avval HTML ga obuna bo'ling
                </Button>
              ) : gateInfo.isJsCourse && !gateInfo.cssBsEnrolled ? (
                <Button disabled className="whitespace-nowrap">
                  Avval CSS & Bootstrap ga obuna bo'ling
                </Button>
              ) : (
                <Button onClick={handleEnroll} disabled={enrolling} className="whitespace-nowrap">
                  {enrolling ? "Jarayonda..." : "Kursga obuna bo'lish"}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/courses')}>Boshqa kurslar</Button>
            </div>
          </div>
          <div className="md:col-span-1 order-1 md:order-2">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="w-full rounded-lg object-cover aspect-video md:aspect-square" />
            ) : (
              <div className="w-full aspect-video md:aspect-square bg-slate-800/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-14 h-14 text-white" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 md:p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Nimalarni o'rganasiz</h2>
          {(() => {
            const tl = course.title.toLowerCase();
            
            // HTML Course
            if (tl.includes('html')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> HTML semantika va strukturasi</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Formlar, jadval va media bilan ishlash</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> SEO uchun to'g'ri markup</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Amaliy mini-loyihalar</li>
                </ul>
              );
            }
            
            // CSS & Bootstrap Course
            if (tl.includes('css') && tl.includes('bootstrap')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> CSS selektorlar, box model, layout</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Flexbox, Grid tizimi</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Bootstrap komponentlari va utilities</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Responsiv dizayn va breakpoints</li>
                </ul>
              );
            }
            
            // JavaScript Course
            if (tl.includes('javascript') || tl.includes('java script')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> O'zgaruvchilar, turlar, shart operatorlari</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Funksiyalar, massivlar, obyektlar</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> DOM bilan ishlash va hodisalar</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Amaliy mini-loyihalar</li>
                </ul>
              );
            }
            
            // Node.js Course
            if (tl.includes('node') || tl.includes('nodejs')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Node.js muhitini o'rnatish va sozlash</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> NPM paketlar bilan ishlash</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Server-side dasturlar yaratish</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> File system va modullar</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> HTTP server yaratish</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Real-world loyihalar</li>
                </ul>
              );
            }
            
            // Express Course
            if (tl.includes('express')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Express framework asoslari</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> REST API yaratish</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Routing va middleware</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Autentifikatsiya va avtorizatsiya</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Ma'lumotlar bazasi bilan integratsiya</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Professional web serverlar</li>
                </ul>
              );
            }
            
            // MongoDB Course
            if (tl.includes('mongo') || tl.includes('mongodb')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> NoSQL ma'lumotlar bazasi asoslari</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Document-based ma'lumot saqlash</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> MongoDB CRUD operatsiyalari</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Aggregation va indexing</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Node.js bilan integratsiya</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Mongoose ODM</li>
                </ul>
              );
            }
            
            // Deployment Course
            if (tl.includes('deployment')) {
              return (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Lokal muhitdan serverga o'tkazish</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Domen va hosting sozlash</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> SSL sertifikatlarni ulash</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> CI/CD pipeline yaratish</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> 24/7 ishlaydigan loyihalar</li>
                  <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-2" /> Monitoring va xavfsizlik</li>
                </ul>
              );
            }
            
            // Default fallback
            return (
              <div className="text-sm text-muted-foreground">Kurs bo'yicha batafsil ma'lumotlar tez orada qo'shiladi.</div>
            );
          })()}
        </Card>
        <Card className="p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Kurs ma'lumotlari</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Status</span><Badge variant={course.status === 'active' ? 'default' : 'secondary'}>{course.status}</Badge></div>
            <div className="flex items-center justify-between"><span>Daraja</span><span className="font-medium">{course.level}</span></div>
            <div className="flex items-center justify-between"><span>Kategoriya</span><span className="font-medium">{course.category || '-'}</span></div>
          </div>
        </Card>
      </div>
      {/* Enrollment Confirmation Modal */}
      {showEnrollmentModal && course && (
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
                <h4 className="text-lg font-medium mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{course.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{course.description}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">Kurs narxi:</span>
                  <span className="text-lg font-bold text-primary">{priceFormatted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">O'qituvchi:</span>
                  <span className="text-sm">{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">Davomiyligi:</span>
                  <span className="text-sm">{course.duration}</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Eslatma:</strong> Kursga a'zo bo'lgandan so'ng, siz barcha darslarni ko'rishingiz va amaliy mashg'ulotlarni bajarishingiz mumkin. Progress 0% dan boshlanadi.
                </p>
              </div>
              {enrollmentError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">{enrollmentError}</div>
              )}
              {enrollmentSuccess && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md border border-green-200">{enrollmentSuccess}</div>
              )}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={cancelEnrollment} className="flex-1" disabled={enrolling}>Bekor qilish</Button>
                <Button onClick={confirmEnrollment} className="flex-1" disabled={enrolling}>{enrolling ? "Jarayonda..." : "A'zo bo'lish"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="text-xl font-bold text-white">To'lovni amalga oshirish</h3>
                  <p className="text-sm text-white/70">Hisobni to'ldirish</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentForm(false)} className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group">
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
                  <h4 className="text-lg font-semibold text-white">To'lov kartasi</h4>
                  <p className="text-sm text-white/70">Quyidagi kartaga to'lov qiling</p>
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
                      <svg className="logo" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="36" height="36" viewBox="0 0 48 48">
                        <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"></path>
                        <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"></path>
                        <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"></path>
                      </svg>
                      <svg version="1.1" className="chip" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <rect x="2" y="6" width="26" height="18" rx="3" ry="3" fill="#c0c0c0" />
                        <rect x="6" y="10" width="6" height="10" rx="2" fill="#9aa0a6" />
                        <rect x="18" y="10" width="6" height="10" rx="2" fill="#9aa0a6" />
                      </svg>
                      <svg version="1.1" className="contactless" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                        <path d="M6 6c3 2 3 6 0 8" fill="none" stroke="#fff" strokeWidth="1.5" />
                        <path d="M9 4c4 3 4 9 0 12" fill="none" stroke="#fff" strokeWidth="1.5" />
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
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 8.368-1.268 8.368-.159.708-.534.708-.534.708s-2.697-.217-3.613-.217c0 0-1.604-.217-1.604-.217-.534-.159-.534-.708-.534-.708s.159-1.066.159-1.066l3.059-2.697s.217-.159.217-.375c0-.217-.217-.217-.217-.217l-3.613 2.055s-.708.375-1.066.375c-.375 0-.708-.375-.708-.375s-.375-1.066-.375-1.066 3.059-13.456 3.059-13.456c.159-.708.708-.708.708-.708s1.066.217 1.066.217 8.368 3.059 8.368 3.059c.708.217.708.708.708.708z" />
                </svg>
                Admin bilan bog'lanish
              </a>

            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                To'lov qilish tartibi
              </h5>
              <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
                <li>Yuqoridagi karta raqamiga kerakli miqdorda to'lov qiling</li>
                <li>To'lov chekini surat qilib oling</li>
                <li>"Admin bilan bog'lanish" tugmasini bosing</li>
                <li>Telegramda chekni adminga yuboring</li>
                <li>Admin tasdiqlashidan keyin hisobingiz to'ldiriladi</li>
              </ol>
            </div>

            {/* Payment Form */}
            <form onSubmit={(e) => { e.preventDefault(); setShowPaymentForm(false); }} className="space-y-6">
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowPaymentForm(false)} className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  To'lovni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

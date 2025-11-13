import "./global.css"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useLayoutEffect } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import AppLayout from "./AppLayout"
import AdminPanel from "./pages/Admin"
import AdminNotifications from "./pages/AdminNotifications"
import AutoLogin from "./pages/auto-login"
import CourseDetails from "./pages/CourseDetails"
import Index from "./pages/Index"
import Learning from "./pages/Learning"
import NotFound from "./pages/NotFound"
import Students from "./pages/Students"

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();
  useLayoutEffect(() => {
    // Always reset scroll position to top on every navigation
    // Prefer a dedicated scroll container if present
    const doReset = () => {
      const container = document.getElementById('main-scroll');
      if (container && 'scrollTo' in container) {
        try {
          (container as any).scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch {
          (container as HTMLElement).scrollTop = 0;
        }
      } else {
        // Fallback to document/window for pages without the container
        try {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } catch {}
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    // Run immediately, then schedule a couple of follow-ups to beat late layout shifts
    doReset();
    requestAnimationFrame(() => doReset());
    setTimeout(doReset, 50);
  }, [location.pathname, location.search, location.hash]);
  return null;
};

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    // Disable browser's automatic scroll restoration so every navigation starts at top
    let prev: ScrollRestoration | undefined;
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      prev = window.history.scrollRestoration as ScrollRestoration;
      try {
        window.history.scrollRestoration = 'manual';
      } catch {}
    }
    return () => {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history && prev) {
        try {
          window.history.scrollRestoration = prev;
        } catch {}
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            
            <Route path="/projects" element={<Index />} />
            <Route path="/projects/:sub" element={<Index />} />
            <Route path="/offline" element={<Index />} />
            <Route path="/debtors" element={<Index />} />
            <Route path="/deptors" element={<Index />} />
            {/* Wrap details page with layout to show sidebar + top navbar */}
            <Route element={<AppLayout />}>
              <Route path="courses/:courseId" element={<CourseDetails />} />
            </Route>

            <Route path="/students/:id" element={<Students />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/learning/:courseId" element={<Learning />} />
            <Route path="/auto-login" element={<AutoLogin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);

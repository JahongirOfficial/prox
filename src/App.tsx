import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import StudentProfile from './pages/StudentProfile'
import DebtorsPage from './pages/DebtorsPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import TasksPage from './pages/TasksPage'
import StudentHomePage from './pages/StudentHomePage'
import StudentStepsPage from './pages/StudentStepsPage'

function App() {
  let initialUser: any = null
  try {
    const raw = localStorage.getItem('user')
    initialUser = raw ? JSON.parse(raw) : null
  } catch {
    initialUser = null
  }

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userRole, setUserRole] = useState<string | null>(initialUser?.role || null)
  const [userId, setUserId] = useState<string | null>(initialUser?.id || null)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    try {
      const raw = localStorage.getItem('user')
      const parsed = raw ? JSON.parse(raw) : null
      setUserRole(parsed?.role || null)
      setUserId(parsed?.id || null)
    } catch {
      setUserRole(null)
      setUserId(null)
    }
  }, [])

  return (
    <Router>
      <Routes>
        {/* Login page - faqat login bo'lmagan holat uchun */}
        <Route 
          path="/login" 
          element={
            isLoggedIn
              ? <Navigate to={userRole === 'student' ? '/tasks' : '/dashboard'} replace />
              : <LoginPage />
          } 
        />
        
        {/* Public routes - login bo'lmagan holat uchun */}
        {!isLoggedIn ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={
              <Layout isLoggedIn={false}>
                <StudentsPage />
              </Layout>
            } />
            <Route path="/student/:id" element={
              <Layout isLoggedIn={false}>
                <StudentProfile />
              </Layout>
            } />
            <Route path="/debtors" element={
              <Layout isLoggedIn={false}>
                <DebtorsPage />
              </Layout>
            } />
            <Route path="/projects" element={
              <Layout isLoggedIn={false}>
                <ProjectsPage />
              </Layout>
            } />
            <Route path="/project/:id" element={
              <Layout isLoggedIn={false}>
                <ProjectDetailPage />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : userRole === 'student' ? (
          // Student routes
          <>
            <Route path="/" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <StudentHomePage />
              </Layout>
            } />
            <Route path="/tasks" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <TasksPage />
              </Layout>
            } />
            <Route path="/students" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <StudentsPage />
              </Layout>
            } />
            <Route path="/debtors" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <DebtorsPage />
              </Layout>
            } />
            <Route
              path="/profile"
              element={userId ? <Navigate to={`/student/${userId}`} replace /> : <Navigate to="/tasks" replace />}
            />
            <Route path="/student/:id" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <StudentProfile />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </>
        ) : (
          // Admin/Teacher routes
          <>
            <Route path="/dashboard" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <DashboardPage />
              </Layout>
            } />
            <Route path="/tasks" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <TasksPage />
              </Layout>
            } />
            <Route path="/student-steps" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <StudentStepsPage />
              </Layout>
            } />
            <Route path="/students" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <StudentsPage />
              </Layout>
            } />
            <Route path="/student/:id" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <StudentProfile />
              </Layout>
            } />
            <Route path="/debtors" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <DebtorsPage />
              </Layout>
            } />
            <Route path="/projects" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <ProjectsPage />
              </Layout>
            } />
            <Route path="/project/:id" element={
              <Layout isLoggedIn={true} userRole={userRole}>
                <ProjectDetailPage />
              </Layout>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App

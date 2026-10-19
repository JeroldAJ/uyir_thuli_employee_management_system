import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import AttendancePage from './components/AttendancePage.jsx'
import Dashboard from './components/Dashboard.jsx'
import EmployeeList from './components/EmployeeList.jsx'
import LeavesPage from './components/LeavesPage.jsx'
import Login from './components/Login.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import { getCurrentUser } from './services/api.js'

function RequireAuth({ roles }) {
  const user = getCurrentUser()
  if (!localStorage.getItem('accessToken') || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<Dashboard />}>
            <Route path="/dashboard" element={null} />
            <Route element={<RequireAuth roles={['Admin', 'HR']} />}>
              <Route path="/employees" element={<EmployeeList />} />
            </Route>
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leaves" element={<LeavesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

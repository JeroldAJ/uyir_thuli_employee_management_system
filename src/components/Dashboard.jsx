import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api, { clearSession, getCurrentUser } from '../services/api.js'

const adminRoles = ['Admin', 'HR']

function Dashboard() {
  const user = getCurrentUser()
  const location = useLocation()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ employees: null, attendance: null, leaves: null })
  const [error, setError] = useState('')
  const isOverview = location.pathname === '/dashboard'
  const links = [
    { to: '/dashboard', label: 'Overview', icon: '▦', roles: ['Admin', 'HR', 'Employee'] },
    { to: '/employees', label: 'Employees', icon: '◉', roles: adminRoles },
    { to: '/attendance', label: 'Attendance', icon: '◷', roles: ['Admin', 'HR', 'Employee'] },
    { to: '/leaves', label: 'Leave requests', icon: '▤', roles: ['Admin', 'HR', 'Employee'] },
  ].filter((link) => link.roles.includes(user?.role))

  useEffect(() => {
    let active = true
    async function loadStats() {
      setError('')
      try {
        const [employeesResponse, attendanceResponse, leavesResponse] = await Promise.all([
          adminRoles.includes(user?.role) ? api.get('/employees/') : Promise.resolve({ data: [] }),
          api.get('/attendance/'),
          api.get('/leaves/'),
        ])
        if (active) setStats({
          employees: adminRoles.includes(user?.role) ? employeesResponse.data.length : null,
          attendance: attendanceResponse.data.filter((record) => record.date === new Date().toISOString().slice(0, 10) && record.status === 'Present').length,
          leaves: leavesResponse.data.filter((leave) => leave.status === 'Pending').length,
        })
      } catch {
        if (active) setError('Dashboard data could not be loaded. Please refresh to try again.')
      }
    }
    if (isOverview) loadStats()
    return () => { active = false }
  }, [isOverview, user?.role])

  function signOut() {
    clearSession()
    navigate('/login', { replace: true })
  }

  const displayName = user?.full_name || user?.email || 'Team member'
  const pageTitle = links.find((link) => link.to === location.pathname)?.label || 'Workspace'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="app-brand" to="/dashboard" aria-label="Uyir Thuli Donors Network home"><img alt="" className="company-logo dashboard-logo" src="/uyir-thuli-logo.png" /><span>Donors Network</span></Link>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav aria-label="Main navigation" className="sidebar-links">
          {links.map((link) => <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} key={link.to} to={link.to}><span aria-hidden="true">{link.icon}</span>{link.label}</NavLink>)}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{displayName.slice(0, 1).toUpperCase()}</div>
          <div className="user-details"><strong>{displayName}</strong><small>{user?.role || 'Employee'}</small></div>
          <button aria-label="Sign out" className="btn btn-sm btn-outline-secondary" onClick={signOut} title="Sign out" type="button">↪</button>
        </div>
      </aside>
      <main className="app-main">
        <header className="app-topbar"><div className="text-secondary small">Workspace <span className="mx-2">/</span><strong className="text-dark">{pageTitle}</strong></div><div className="small text-secondary">People operations</div></header>
        {isOverview ? (
          <div className="page-content">
            <div className="page-heading"><div><p className="eyebrow mb-2">YOUR WORKSPACE</p><h1 className="h2 fw-semibold mb-1">Welcome, {displayName.split(' ')[0]}</h1><p className="text-secondary mb-0">Here’s what’s happening with your team today.</p></div>{adminRoles.includes(user?.role) && <Link className="btn btn-success" to="/employees">＋ Add employee</Link>}</div>
            {error && <div className="alert alert-warning" role="alert">{error}</div>}
            <section aria-label="Workspace statistics" className="row g-3 mb-4">
              {adminRoles.includes(user?.role) && <div className="col-12 col-md-4"><StatCard label="Total employees" value={stats.employees} icon="◉" /></div>}
              <div className="col-12 col-md-4"><StatCard label="Present today" value={stats.attendance} icon="✓" /></div>
              <div className="col-12 col-md-4"><StatCard label="Pending leave requests" value={stats.leaves} icon="◷" /></div>
            </section>
            <section className="welcome-panel">
              <div><p className="eyebrow mb-2">PEOPLE OPERATIONS</p><h2 className="h4 fw-semibold">Everything your team needs, in one place.</h2><p className="text-secondary mb-0">Manage attendance, keep employee details current, and stay on top of leave requests.</p></div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link className="btn btn-outline-success" to="/attendance">View attendance</Link>
                <Link className="btn btn-outline-success" to="/leaves">Review leave requests</Link>
              </div>
            </section>
          </div>
        ) : <div className="page-content"><Outlet /></div>}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return <article className="stat-card"><div className="stat-icon">{icon}</div><p className="text-secondary mb-2">{label}</p><strong>{value ?? '—'}</strong></article>
}

export default Dashboard

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api.js'

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [summary, setSummary] = useState(null)
  const [loadError, setLoadError] = useState('')
  const email = location.state?.email || localStorage.getItem('employeeEmail') || ''
  const firstName = email.split('@')[0]?.split(/[._-]/)[0] || 'there'
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  useEffect(() => {
    Promise.all([api.get('/employees/'), api.get('/employees/summary/')])
      .then(([employeeResponse, summaryResponse]) => {
        setEmployees(employeeResponse.data)
        setSummary(summaryResponse.data)
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('employeeEmail')
          navigate('/')
          return
        }
        setLoadError('We couldn’t load employee data. Please try again.')
      })
  }, [navigate])

  function signOut() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('employeeEmail')
    navigate('/')
  }

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <a aria-label="Uyir Thuli Donors Network home" className="brand dashboard-brand" href="/home"><img alt="" className="company-logo dashboard-logo" src="/uyir-thuli-logo.png" /><span className="brand-light">Donors Network</span></a>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-item active" href="/home"><span aria-hidden="true">▦</span> Overview</a>
          <a className="nav-item" href="#employees"><span aria-hidden="true">◉</span> Employees <span className="nav-count">24</span></a>
          <a className="nav-item" href="#team"><span aria-hidden="true">⌂</span> My team</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-chip"><span className="profile-avatar">{displayName.slice(0, 1)}</span><span><strong>{displayName}</strong><small>Employee</small></span><span className="profile-more" aria-hidden="true">···</span></div>
          <button className="signout-button" onClick={signOut} type="button"><span aria-hidden="true">↪</span> Sign out</button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-actions"><span className="today-label">Monday, September 28</span><button className="notification-button" type="button" aria-label="Notifications"><span aria-hidden="true">♧</span><i /></button></div>
        </header>
        <div className="dashboard-content">
          <section className="welcome-row">
            <div><p className="eyebrow form-eyebrow">MONDAY, SEPTEMBER 28, 2026</p><h1>Good morning, {displayName} <span aria-hidden="true">✳</span></h1><p className="welcome-subtitle">Here’s what’s happening across your workspace.</p></div>
            <button className="invite-button" type="button"><span aria-hidden="true">＋</span> Invite employee</button>
          </section>
          <section className="metrics-grid" aria-label="Employee overview">
            <article className="metric-card"><div className="metric-heading"><span>Total employees</span><span className="metric-icon green-icon" aria-hidden="true">◉</span></div><strong>{summary?.total ?? '—'}</strong><p>Across your workspace</p></article>
            <article className="metric-card"><div className="metric-heading"><span>Onboarding</span><span className="metric-icon coral-icon" aria-hidden="true">↗</span></div><strong>{summary?.onboarding ?? '—'}</strong><p>Starting this week: {summary?.starting_this_week ?? '—'}</p></article>
            <article className="metric-card"><div className="metric-heading"><span>On leave</span><span className="metric-icon yellow-icon" aria-hidden="true">◷</span></div><strong>{summary?.on_leave ?? '—'}</strong><p>Employees currently away</p></article>
            <article className="metric-card highlight-card"><div className="metric-heading"><span>Team pulse</span><span className="pulse-dots" aria-hidden="true">•••</span></div><strong>Looking good</strong><p><span className="pulse-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span> Responses are up this week</p></article>
          </section>
          <section className="employee-section" id="employees">
            <div className="section-heading"><div><p className="eyebrow form-eyebrow">YOUR PEOPLE</p><h2>Recently active</h2></div><a className="text-link" href="#employees">View all employees <span aria-hidden="true">→</span></a></div>
            <div className="employee-table-wrap">
              <table className="employee-table">
                <thead><tr><th>EMPLOYEE</th><th>TEAM</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>{loadError ? (
                  <tr><td colSpan="4" role="alert">{loadError}</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="4">No employees to show yet.</td></tr>
                ) : employees.map((employee, index) => (
                  <tr key={employee.name}>
                    <td><div className="employee-cell"><span className={`employee-avatar ${['coral', 'mint', 'blue', 'yellow'][index % 4]}`}>{employee.initials}</span><span><strong>{employee.name}</strong><small>{employee.role}</small></span></div></td>
                    <td>{employee.team}</td>
                    <td><span className={`employee-status ${employee.status === 'Active' ? 'status-active' : 'status-leave'}`}><i />{employee.status}</span></td>
                    <td><button className="row-menu" type="button" aria-label={`More options for ${employee.name}`}>···</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
          <p className="dashboard-footnote">People data is updated daily. <a href="#employees">Learn more</a></p>
        </div>
      </section>
    </main>
  )
}

export default HomePage
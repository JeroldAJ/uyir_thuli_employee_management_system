import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api.js'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/token/', { email, password })
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      localStorage.setItem('employeeEmail', email)
      navigate('/home', { state: { email } })
    } catch {
      setError('We couldn’t sign you in with those details. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="Employee portal">
        <Link className="brand" to="/" aria-label="Uyir Thuli Donors Network home">
          <img alt="" className="company-logo auth-logo" src="/uyir-thuli-logo.png" />
          <span className="brand-light">Donors Network</span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow">YOUR WORKPLACE, IN ONE PLACE</p>
          <h1>Good work<br />starts with<br /><em>good people.</em></h1>
          <p className="story-description">The people hub for your day-to-day: your team, your details, and what comes next.</p>
        </div>
        <div className="team-note">
          <div className="avatar-stack" aria-hidden="true"><span>JM</span><span>AL</span><span>SK</span></div>
          <p><strong>Your team is here.</strong><br />Pick up right where you left off.</p>
          <span className="note-arrow" aria-hidden="true">↗</span>
        </div>
        <span className="story-index" aria-hidden="true">01 — 03</span>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top"><span>EMPLOYEE PORTAL</span><span className="status-dot">Secure sign in</span></div>
        <div className="auth-form-wrap">
          <p className="eyebrow form-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your<br />workspace.</h2>
          <p className="form-intro">Use your work email to continue.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Work email</label>
            <input autoComplete="username" id="email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} />
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <Link className="text-link" to="/forgot-password">Forgot password?</Link>
            </div>
            <input autoComplete="current-password" id="password" name="password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type="password" value={password} />
            {error && <p className="form-footnote" role="alert">{error}</p>}
            <button className="primary-button" disabled={submitting} type="submit">{submitting ? 'Signing in…' : 'Log in'} <span aria-hidden="true">→</span></button>
          </form>
          <p className="form-footnote">Having trouble? Contact your people team.</p>
        </div>
        <footer className="auth-footer"><span>© 2026 Uyir Thuli Donors Network</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Help</span></footer>
      </section>
    </main>
  )
}

export default LoginPage
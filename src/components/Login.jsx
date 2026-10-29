import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { clearSession } from '../services/api.js'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    clearSession()
    try {
      const { data } = await api.post('/token/', { email, password })
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to sign in. Check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><img alt="Uyir Thuli" className="company-logo login-logo" src="/uyir-thuli-logo.png" /><span>Donors Network</span></div>
        <p className="eyebrow mt-5 mb-2">EMPLOYEE PORTAL</p>
        <h1 className="h2 fw-semibold mb-2">Welcome back</h1>
        <p className="text-secondary mb-4">Sign in with your work account to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Work email</label>
            <input autoComplete="username" className="form-control form-control-lg" id="login-email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} />
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link className="small text-decoration-none" to="/forgot-password">Forgot password?</Link>
            </div>
            <div className="input-group input-group-lg">
              <input autoComplete="current-password" className="form-control" id="login-password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type={showPassword ? 'text' : 'password'} value={password} />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
          <button className="btn btn-success btn-lg w-100 mt-2" disabled={submitting} type="submit">{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="small text-secondary mt-4 mb-0">Need access? Contact your HR administrator.</p>
      </section>
      <p className="login-footer">A simpler way to support your people.</p>
    </main>
  )
}

export default Login

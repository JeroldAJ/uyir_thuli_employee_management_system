import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api.js'

function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/auth/password-reset/confirm/', { uid, token, password })
      navigate('/', { state: { passwordReset: true } })
    } catch (requestError) {
      const passwordError = requestError.response?.data?.password?.[0]
      setError(passwordError || 'This reset link is invalid or expired. Request a new one.')
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
          <p className="eyebrow">A FRESH START</p>
          <h1>Back to<br />your team,<br /><em>in a moment.</em></h1>
          <p className="story-description">Choose a new password for your workspace.</p>
        </div>
        <span className="story-index" aria-hidden="true">03 — 03</span>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><span>ACCOUNT RECOVERY</span><span className="status-dot">Secure sign in</span></div>
        <div className="auth-form-wrap">
          <p className="eyebrow form-eyebrow">PASSWORD HELP</p>
          <h2>Set a new<br />password.</h2>
          <p className="form-intro">Use at least 8 characters. Your password must meet your workspace requirements.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">New password</label>
            <input autoComplete="new-password" id="new-password" minLength="8" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            {error && <p className="form-footnote" role="alert">{error}</p>}
            <button className="primary-button" disabled={submitting} type="submit">{submitting ? 'Updating…' : 'Update password'} <span aria-hidden="true">→</span></button>
          </form>
        </div>
        <footer className="auth-footer"><span>© 2026 Uyir Thuli Donors Network</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Help</span></footer>
      </section>
    </main>
  )
}

export default ResetPasswordPage
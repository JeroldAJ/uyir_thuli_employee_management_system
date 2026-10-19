import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api.js'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      await api.post('/auth/password-reset/', { email })
      setSubmitted(true)
    } catch {
      setError('We couldn’t process that request right now. Please try again.')
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
          <p className="story-description">A password reset is the first step back into your workspace.</p>
        </div>
        <span className="story-index" aria-hidden="true">02 — 03</span>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><span>ACCOUNT RECOVERY</span><span className="status-dot">Secure sign in</span></div>
        <div className="auth-form-wrap">
          <p className="eyebrow form-eyebrow">PASSWORD HELP</p>
          {submitted ? (
            <div className="reset-confirmation" aria-live="polite">
              <span className="confirmation-mark" aria-hidden="true">✓</span>
              <h2>Check your inbox.</h2>
              <p>If an account exists for <strong>{email}</strong>, reset instructions will be sent there.</p>
              <Link className="primary-button button-link" to="/">Back to sign in <span aria-hidden="true">→</span></Link>
            </div>
          ) : (
            <>
              <h2>Forgot your<br />password?</h2>
              <p className="form-intro">Enter your work email and we’ll send you a link to reset it.</p>
              <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="recovery-email">Work email</label>
                <input autoComplete="email" id="recovery-email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required type="email" value={email} />
                {error && <p className="form-footnote" role="alert">{error}</p>}
                <button className="primary-button" type="submit">Send reset link <span aria-hidden="true">→</span></button>
              </form>
              <Link className="back-link" to="/">← Back to sign in</Link>
            </>
          )}
        </div>
        <footer className="auth-footer"><span>© 2026 Uyir Thuli Donors Network</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Help</span></footer>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
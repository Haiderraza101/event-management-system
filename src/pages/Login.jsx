import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  loginUser,
  authErrorCleared,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated
} from '../features/auth/authSlice'
import { toastPushed } from '../features/ui/uiSlice'
import { validateEmail, hasErrors } from '../utils/validate'
import useDocumentTitle from '../hooks/useDocumentTitle'
import './Auth.css'

function Login() {
  useDocumentTitle('Login')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useSelector(selectAuthStatus)
  const serverError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})

  const redirectTo = location.state?.from || '/events'

  useEffect(() => {
    dispatch(authErrorCleared())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

  function runValidation(next) {
    return {
      email: validateEmail(next.email),
      password: next.password ? '' : 'Password is required.'
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    const next = { ...form, [name]: value }
    setForm(next)
    if (touched[name]) setErrors(runValidation(next))
  }

  function handleBlur(event) {
    setTouched((prev) => ({ ...prev, [event.target.name]: true }))
    setErrors(runValidation(form))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = runValidation(form)
    setErrors(nextErrors)
    setTouched({ email: true, password: true })
    if (hasErrors(nextErrors)) return

    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      dispatch(toastPushed(`Signed in as ${result.payload.name}.`, 'success'))
    }
  }

  const submitting = status === 'loading'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-aside">
          <div>
            <h2>Welcome back</h2>
            <p>Pick up where you left off and keep an eye on everything you have booked.</p>
          </div>
          <ul className="auth-points">
            <li>Your registrations stay saved on this device</li>
            <li>Cancel a booking any time before the doors open</li>
            <li>Upcoming and completed events kept apart</li>
          </ul>
        </aside>

        <div className="auth-form-panel">
          <div>
            <h1>Log in</h1>
            <p className="muted">Use the account you registered with.</p>
          </div>

          {location.state?.from ? (
            <p className="auth-alert" style={{ background: 'var(--warn-soft)', color: 'var(--warn)', borderColor: 'transparent' }}>
              Log in to continue to that page.
            </p>
          ) : null}

          {serverError ? <p className="auth-alert">{serverError}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email && touched.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
              />
              {errors.email && touched.email ? (
                <span className="error-text">{errors.email}</span>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`input ${errors.password && touched.password ? 'input-error' : ''}`}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your password"
              />
              {errors.password && touched.password ? (
                <span className="error-text">{errors.password}</span>
              ) : null}
            </div>

            <button type="submit" className="btn btn-block" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            New to Eventide? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

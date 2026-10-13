import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  registerUser,
  authErrorCleared,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated
} from '../features/auth/authSlice'
import { toastPushed } from '../features/ui/uiSlice'
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmation,
  passwordStrength,
  hasErrors
} from '../utils/validate'
import './Auth.css'

const STRENGTH_COLORS = ['#c23b48', '#c23b48', '#9a6a12', '#1a7f55', '#1a7f55', '#1a7f55']

const EMPTY_FORM = { name: '', email: '', password: '', confirmation: '' }

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const serverError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    dispatch(authErrorCleared())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) navigate('/events', { replace: true })
  }, [isAuthenticated, navigate])

  const strength = passwordStrength(form.password)

  function runValidation(next) {
    return {
      name: validateName(next.name),
      email: validateEmail(next.email),
      password: validatePassword(next.password),
      confirmation: validateConfirmation(next.password, next.confirmation)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    const next = { ...form, [name]: value }
    setForm(next)
    if (touched[name]) setErrors(runValidation(next))
  }

  function handleBlur(event) {
    const { name } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors(runValidation(form))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = runValidation(form)
    setErrors(nextErrors)
    setTouched({ name: true, email: true, password: true, confirmation: true })
    if (hasErrors(nextErrors)) return

    const result = await dispatch(
      registerUser({ name: form.name, email: form.email, password: form.password })
    )

    if (registerUser.fulfilled.match(result)) {
      dispatch(toastPushed(`Welcome aboard, ${result.payload.name}.`, 'success'))
    }
  }

  const submitting = status === 'loading'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-aside">
          <div>
            <h2>Your next night out starts here</h2>
            <p>
              Create an account to save events, register in one tap and keep every booking in one
              place.
            </p>
          </div>
          <ul className="auth-points">
            <li>Browse concerts, sports and theatre worldwide</li>
            <li>Register and cancel without leaving the app</li>
            <li>Track upcoming and past bookings separately</li>
          </ul>
        </aside>

        <div className="auth-form-panel">
          <div>
            <h1>Create account</h1>
            <p className="muted">It only takes a moment.</p>
          </div>

          {serverError ? <p className="auth-alert">{serverError}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={`input ${errors.name && touched.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ayesha Khan"
              />
              {errors.name && touched.name ? <span className="error-text">{errors.name}</span> : null}
            </div>

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
                autoComplete="new-password"
                className={`input ${errors.password && touched.password ? 'input-error' : ''}`}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="At least 8 characters"
              />
              {form.password ? (
                <div className="strength">
                  <div className="strength-track">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        background: STRENGTH_COLORS[strength.score]
                      }}
                    />
                  </div>
                  <span className="strength-label">{strength.label}</span>
                </div>
              ) : null}
              {errors.password && touched.password ? (
                <span className="error-text">{errors.password}</span>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="confirmation">Confirm password</label>
              <input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                className={`input ${
                  errors.confirmation && touched.confirmation ? 'input-error' : ''
                }`}
                value={form.confirmation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repeat your password"
              />
              {errors.confirmation && touched.confirmation ? (
                <span className="error-text">{errors.confirmation}</span>
              ) : null}
            </div>

            <button type="submit" className="btn btn-block" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Log in instead</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

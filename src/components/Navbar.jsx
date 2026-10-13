import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loggedOut, selectCurrentUser } from '../features/auth/authSlice'
import { toastPushed } from '../features/ui/uiSlice'
import './Navbar.css'

function initialsOf(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function Navbar() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleLogout() {
    setMenuOpen(false)
    dispatch(loggedOut())
    dispatch(toastPushed('You have been signed out.', 'info'))
    navigate('/events')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Eventide</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/events">Events</NavLink>
          {user ? <NavLink to="/my-events">My Events</NavLink> : null}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className="avatar-button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="avatar">{initialsOf(user.name)}</span>
                <span className="avatar-name">{user.name.split(' ')[0]}</span>
              </button>

              {menuOpen ? (
                <div className="menu-pop" role="menu">
                  <div className="menu-head">
                    <strong>{user.name}</strong>
                    <span className="faint">{user.email}</span>
                  </div>
                  <Link to="/my-events" role="menuitem" onClick={() => setMenuOpen(false)}>
                    My events
                  </Link>
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

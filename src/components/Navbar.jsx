import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Eventide</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/my-events">My Events</NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">
            Log in
          </Link>
          <Link to="/register" className="btn btn-sm">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar

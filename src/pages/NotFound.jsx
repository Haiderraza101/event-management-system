import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="container page notfound">
      <p className="notfound-code">404</p>
      <h1>This page slipped off the lineup</h1>
      <p className="muted">The page you were looking for does not exist or has moved.</p>
      <Link to="/events" className="btn">
        Browse events
      </Link>
    </div>
  )
}

export default NotFound

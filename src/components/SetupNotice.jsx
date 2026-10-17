import { isApiConfigured } from '../api/ticketmaster'
import './SetupNotice.css'

function SetupNotice() {
  if (isApiConfigured()) return null

  return (
    <div className="setup-notice" role="alert">
      <div className="container setup-inner">
        <strong>Ticketmaster API key not found.</strong>
        <span>
          Copy <code>.env.example</code> to <code>.env</code>, add your Consumer Key as{' '}
          <code>VITE_TICKETMASTER_API_KEY</code> and restart the dev server.
        </span>
        <a href="https://developer.ticketmaster.com/" target="_blank" rel="noreferrer">
          Get a key
        </a>
      </div>
    </div>
  )
}

export default SetupNotice

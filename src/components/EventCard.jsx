import { Link } from 'react-router-dom'
import {
  formatDateBadge,
  formatTime,
  formatLocation,
  formatPrice,
  countdownLabel,
  statusLabel
} from '../utils/format'
import './EventCard.css'

function EventCard({ event, footer }) {
  const badge = formatDateBadge(event.localDate)
  const time = event.timeTba ? 'Time TBA' : formatTime(event.localTime)
  const price = formatPrice(event.priceRange)
  const status = statusLabel(event.status)

  return (
    <article className="event-card">
      <Link to={`/events/${event.id}`} className="event-media" aria-label={event.name}>
        {event.image ? (
          <img src={event.image} alt="" loading="lazy" />
        ) : (
          <div className="event-media-fallback" aria-hidden="true">
            ♪
          </div>
        )}
        <span className="date-chip">
          <strong>{badge.day}</strong>
          <em>{badge.month}</em>
        </span>
        {status.tone !== 'success' ? (
          <span className={`badge badge-${status.tone === 'danger' ? 'warn' : status.tone} status-chip`}>
            {status.text}
          </span>
        ) : null}
      </Link>

      <div className="event-body">
        <div className="event-tags">
          <span className="badge badge-accent">{event.classification.segment}</span>
          {event.classification.genre ? (
            <span className="badge">{event.classification.genre}</span>
          ) : null}
        </div>

        <h3 className="event-title">
          <Link to={`/events/${event.id}`}>{event.name}</Link>
        </h3>

        <ul className="event-meta">
          <li>
            <span aria-hidden="true">◷</span>
            {time || 'Time TBA'} · {countdownLabel(event.localDate)}
          </li>
          <li>
            <span aria-hidden="true">⌖</span>
            {event.venue?.name || 'Venue TBA'}
          </li>
          <li>
            <span aria-hidden="true">⌘</span>
            {formatLocation(event.venue)}
          </li>
        </ul>

        <div className="event-foot">
          {price ? <span className="event-price">{price}</span> : <span className="faint">Price TBA</span>}
          {footer ?? (
            <Link to={`/events/${event.id}`} className="btn btn-ghost btn-sm">
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default EventCard

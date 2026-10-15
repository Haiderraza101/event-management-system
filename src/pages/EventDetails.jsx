import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import {
  loadEventDetails,
  selectDetailsError,
  selectDetailsStatus,
  selectEventById
} from '../features/events/eventsSlice'
import {
  formatDateLong,
  formatTime,
  formatLocation,
  formatPrice,
  countdownLabel,
  statusLabel
} from '../utils/format'
import './EventDetails.css'

function EventDetails() {
  const { eventId } = useParams()
  const dispatch = useDispatch()
  const event = useSelector(selectEventById(eventId))
  const status = useSelector(selectDetailsStatus)
  const error = useSelector(selectDetailsError)

  useEffect(() => {
    const promise = dispatch(loadEventDetails(eventId))
    window.scrollTo({ top: 0 })
    return () => promise.abort()
  }, [dispatch, eventId])

  if (!event && status === 'loading') {
    return (
      <div className="container page">
        <Spinner label="Loading event" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container page">
        <ErrorState message={error} onRetry={() => dispatch(loadEventDetails(eventId))} />
      </div>
    )
  }

  const status_ = statusLabel(event.status)
  const price = formatPrice(event.priceRange)

  return (
    <article className="event-detail">
      <div className="detail-banner">
        {event.image ? <img src={event.image} alt="" /> : null}
        <div className="detail-banner-veil" />
        <div className="container detail-banner-inner">
          <Link to="/events" className="back-link">
            ← Back to events
          </Link>
          <div className="detail-tags">
            <span className="badge badge-accent">{event.classification.segment}</span>
            {event.classification.genre ? (
              <span className="badge">{event.classification.genre}</span>
            ) : null}
            <span className={`badge badge-${status_.tone === 'success' ? 'success' : 'warn'}`}>
              {status_.text}
            </span>
          </div>
          <h1>{event.name}</h1>
          <p className="detail-sub">
            {formatDateLong(event.localDate)}
            {event.timeTba ? ' · Time TBA' : ` · ${formatTime(event.localTime)}`}
          </p>
        </div>
      </div>

      <div className="container detail-body">
        <div className="detail-main">
          <section className="card detail-section">
            <h2>When and where</h2>
            <dl className="detail-list">
              <div>
                <dt>Date</dt>
                <dd>{formatDateLong(event.localDate)}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{event.timeTba ? 'To be announced' : formatTime(event.localTime)}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{event.venue?.name ?? 'To be announced'}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{formatLocation(event.venue)}</dd>
              </div>
              {event.venue?.address ? (
                <div>
                  <dt>Address</dt>
                  <dd>
                    {event.venue.address}
                    {event.venue.postalCode ? `, ${event.venue.postalCode}` : ''}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Category</dt>
                <dd>
                  {[event.classification.segment, event.classification.genre, event.classification.subGenre]
                    .filter(Boolean)
                    .join(' · ')}
                </dd>
              </div>
            </dl>
          </section>

          {event.info ? (
            <section className="card detail-section">
              <h2>About this event</h2>
              <p>{event.info}</p>
            </section>
          ) : null}

          {event.pleaseNote ? (
            <section className="card detail-section note-section">
              <h2>Good to know</h2>
              <p>{event.pleaseNote}</p>
            </section>
          ) : null}
        </div>

        <aside className="detail-aside">
          <div className="card booking-card">
            <span className="badge badge-accent">{countdownLabel(event.localDate)}</span>
            <p className="booking-price">{price || 'Price to be announced'}</p>
            {event.priceRange ? <p className="faint">Official face value range</p> : null}
            {event.url ? (
              <a href={event.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-block">
                View on Ticketmaster
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  )
}

export default EventDetails

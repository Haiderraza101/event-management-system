import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../components/Spinner'
import RegistrationButton from '../components/RegistrationButton'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorState from '../components/ErrorState'
import {
  registrationRemoved,
  selectIsRegistered
} from '../features/registrations/registrationsSlice'
import { selectCurrentUser } from '../features/auth/authSlice'
import { toastPushed } from '../features/ui/uiSlice'
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
  const registered = useSelector(selectIsRegistered(eventId))
  const user = useSelector(selectCurrentUser)
  const [confirming, setConfirming] = useState(false)

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
  const mapQuery = event.venue
    ? [event.venue.name, event.venue.address, event.venue.city, event.venue.country]
        .filter(Boolean)
        .join(' ')
    : ''

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

          {event.attractions.length > 0 ? (
            <section className="card detail-section">
              <h2>Lineup</h2>
              <ul className="lineup">
                {event.attractions.map((attraction) => (
                  <li key={attraction.id}>
                    {attraction.image ? (
                      <img src={attraction.image} alt="" loading="lazy" />
                    ) : (
                      <span className="lineup-fallback" aria-hidden="true">
                        {attraction.name.charAt(0)}
                      </span>
                    )}
                    <span className="lineup-name">{attraction.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {event.pleaseNote ? (
            <section className="card detail-section note-section">
              <h2>Good to know</h2>
              <p>{event.pleaseNote}</p>
            </section>
          ) : null}

          {event.seatmap ? (
            <section className="card detail-section">
              <h2>Seating map</h2>
              <img className="seatmap" src={event.seatmap} alt={`Seating map for ${event.name}`} loading="lazy" />
            </section>
          ) : null}
        </div>

        <aside className="detail-aside">
          <div className="card booking-card">
            <span className="badge badge-accent">{countdownLabel(event.localDate)}</span>
            <p className="booking-price">{price || 'Price to be announced'}</p>
            {event.priceRange ? <p className="faint">Official face value range</p> : null}

            <RegistrationButton event={event} onCancelRequest={() => setConfirming(true)} />

            {registered ? (
              <p className="registered-note">
                <span aria-hidden="true">✓</span> You are on the list for this event.
              </p>
            ) : null}

            {event.url ? (
              <a href={event.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-block">
                View on Ticketmaster
              </a>
            ) : null}
          </div>

          {mapQuery ? (
            <a
              className="card map-card"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="map-pin" aria-hidden="true">
                ⌖
              </span>
              <span>
                <strong>{event.venue.name}</strong>
                <span className="faint">Open in Google Maps</span>
              </span>
            </a>
          ) : null}

          {event.salesStart || event.promoter ? (
            <div className="card detail-section">
              <h2>Ticket information</h2>
              <dl className="detail-list single">
                {event.salesStart ? (
                  <div>
                    <dt>Sales opened</dt>
                    <dd>{formatDateLong(event.salesStart.slice(0, 10))}</dd>
                  </div>
                ) : null}
                {event.salesEnd ? (
                  <div>
                    <dt>Sales close</dt>
                    <dd>{formatDateLong(event.salesEnd.slice(0, 10))}</dd>
                  </div>
                ) : null}
                {event.promoter ? (
                  <div>
                    <dt>Promoter</dt>
                    <dd>{event.promoter}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Cancel this registration?"
        message={`You will be removed from ${event.name}. You can register again later while tickets last.`}
        confirmLabel="Cancel registration"
        onConfirm={() => {
          dispatch(registrationRemoved({ userId: user.id, eventId: event.id }))
          dispatch(toastPushed('Your registration has been cancelled.', 'info'))
          setConfirming(false)
        }}
        onCancel={() => setConfirming(false)}
      />
    </article>
  )
}

export default EventDetails

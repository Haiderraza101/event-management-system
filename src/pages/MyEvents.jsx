import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import EventGrid from '../components/EventGrid'
import EmptyState from '../components/EmptyState'
import RegistrationButton from '../components/RegistrationButton'
import ConfirmDialog from '../components/ConfirmDialog'
import { selectCurrentUser } from '../features/auth/authSlice'
import {
  registrationRemoved,
  selectRegistrationSplit
} from '../features/registrations/registrationsSlice'
import { toastPushed } from '../features/ui/uiSlice'
import { countdownLabel, formatDateShort } from '../utils/format'
import './MyEvents.css'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' }
]

function MyEvents() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const { upcoming, completed } = useSelector(selectRegistrationSplit)
  const [tab, setTab] = useState('upcoming')
  const [pendingCancel, setPendingCancel] = useState(null)

  function confirmCancel() {
    dispatch(registrationRemoved({ userId: user.id, eventId: pendingCancel.id }))
    dispatch(toastPushed(`Registration for ${pendingCancel.name} was cancelled.`, 'info'))
    setPendingCancel(null)
  }

  const counts = { upcoming: upcoming.length, completed: completed.length }
  const active = tab === 'upcoming' ? upcoming : completed
  const events = useMemo(() => active.map((item) => item.event), [active])
  const nextEvent = upcoming[0]?.event

  return (
    <div className="container page">
      <header className="page-head">
        <div>
          <h1>My events</h1>
          <p className="muted">
            Everything {user.name.split(' ')[0]} has registered for, kept on this device.
          </p>
        </div>
        <Link to="/events" className="btn btn-ghost btn-sm">
          Browse more events
        </Link>
      </header>

      <section className="summary-grid">
        <div className="card summary-card">
          <span className="summary-label">Total registrations</span>
          <strong className="summary-value">{counts.upcoming + counts.completed}</strong>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Still to come</span>
          <strong className="summary-value">{counts.upcoming}</strong>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Next up</span>
          {nextEvent ? (
            <>
              <strong className="summary-value small">{nextEvent.name}</strong>
              <span className="faint">
                {formatDateShort(nextEvent.localDate)} · {countdownLabel(nextEvent.localDate)}
              </span>
            </>
          ) : (
            <strong className="summary-value small">Nothing booked</strong>
          )}
        </div>
      </section>

      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            <span className="tab-count">{counts[item.key]}</span>
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming events' : 'Nothing completed yet'}
          message={
            tab === 'upcoming'
              ? 'Register for an event and it will appear here straight away.'
              : 'Events you attended will move into this tab once the date has passed.'
          }
          action={
            tab === 'upcoming' ? (
              <Link to="/events" className="btn">
                Find an event
              </Link>
            ) : null
          }
        />
      ) : (
        <EventGrid
          events={events}
          renderFooter={(event) =>
            tab === 'upcoming' ? (
              <RegistrationButton event={event} size="sm" onCancelRequest={setPendingCancel} />
            ) : (
              <span className="badge badge-success">Attended</span>
            )
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this registration?"
        message={
          pendingCancel
            ? `You will be removed from ${pendingCancel.name}. You can register again later while tickets last.`
            : ''
        }
        confirmLabel="Cancel registration"
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  )
}

export default MyEvents

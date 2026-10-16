import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '../features/auth/authSlice'
import {
  registrationAdded,
  registrationRemoved,
  selectIsRegistered
} from '../features/registrations/registrationsSlice'
import { toastPushed } from '../features/ui/uiSlice'
import { isPastEvent } from '../utils/format'

function RegistrationButton({ event, size = '', onCancelRequest }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const registered = useSelector(selectIsRegistered(event.id))

  const past = isPastEvent(event)
  const unavailable = event.status === 'cancelled'
  const sizeClass = size === 'sm' ? 'btn-sm' : 'btn-block'

  if (!user) {
    return (
      <button
        type="button"
        className={`btn ${sizeClass}`}
        onClick={() => navigate('/login', { state: { from: location.pathname } })}
      >
        Log in to register
      </button>
    )
  }

  if (past) {
    return (
      <button type="button" className={`btn btn-ghost ${sizeClass}`} disabled>
        Event finished
      </button>
    )
  }

  if (unavailable) {
    return (
      <button type="button" className={`btn btn-ghost ${sizeClass}`} disabled>
        Event cancelled
      </button>
    )
  }

  if (registered) {
    return (
      <button
        type="button"
        className={`btn btn-danger ${sizeClass}`}
        onClick={() => {
          if (onCancelRequest) {
            onCancelRequest(event)
            return
          }
          dispatch(registrationRemoved({ userId: user.id, eventId: event.id }))
          dispatch(toastPushed('Your registration has been cancelled.', 'info'))
        }}
      >
        Cancel registration
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`btn ${sizeClass}`}
      onClick={() => {
        dispatch(registrationAdded(user.id, event))
        dispatch(toastPushed(`You are registered for ${event.name}.`, 'success'))
      }}
    >
      Register for this event
    </button>
  )
}

export default RegistrationButton

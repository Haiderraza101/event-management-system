import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectToasts, toastDismissed } from '../features/ui/uiSlice'
import './ToastHost.css'

function Toast({ toast }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(toastDismissed(toast.id)), 4000)
    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div className={`toast toast-${toast.tone}`} role="status">
      <span>{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={() => dispatch(toastDismissed(toast.id))}
      >
        ×
      </button>
    </div>
  )
}

function ToastHost() {
  const toasts = useSelector(selectToasts)

  if (toasts.length === 0) return null

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastHost

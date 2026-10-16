import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleKey(event) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKey)
    confirmRef.current?.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="dialog-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Keep registration
          </button>
          <button type="button" className="btn btn-danger" ref={confirmRef} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

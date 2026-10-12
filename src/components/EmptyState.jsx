import './StateBlock.css'

function EmptyState({ title, message, action }) {
  return (
    <div className="state-block">
      <div className="state-icon" aria-hidden="true">
        ◎
      </div>
      <h3>{title}</h3>
      {message ? <p className="muted">{message}</p> : null}
      {action}
    </div>
  )
}

export default EmptyState

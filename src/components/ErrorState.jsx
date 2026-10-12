import './StateBlock.css'

function ErrorState({ message, onRetry }) {
  return (
    <div className="state-block state-error">
      <div className="state-icon" aria-hidden="true">
        !
      </div>
      <h3>Something went wrong</h3>
      <p className="muted">{message || 'The request could not be completed.'}</p>
      {onRetry ? (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}

export default ErrorState

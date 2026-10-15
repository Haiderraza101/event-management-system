import EventCard from './EventCard'
import './EventGrid.css'

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-media" />
      <div className="skeleton-lines">
        <span className="skeleton-line short" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line short" />
      </div>
    </div>
  )
}

function EventGrid({ events, loading, skeletonCount = 6, renderFooter }) {
  if (loading) {
    return (
      <div className="event-grid">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} footer={renderFooter ? renderFooter(event) : null} />
      ))}
    </div>
  )
}

export default EventGrid

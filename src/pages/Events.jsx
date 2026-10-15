import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SearchBar from '../components/SearchBar'
import EventGrid from '../components/EventGrid'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import {
  loadEvents,
  filterChanged,
  pageChanged,
  selectEvents,
  selectEventsError,
  selectEventsStatus,
  selectFilters,
  selectPage,
  selectPageInfo
} from '../features/events/eventsSlice'
import useDebounce from '../hooks/useDebounce'
import './Events.css'

function Events() {
  const dispatch = useDispatch()
  const events = useSelector(selectEvents)
  const status = useSelector(selectEventsStatus)
  const error = useSelector(selectEventsError)
  const page = useSelector(selectPage)
  const pageInfo = useSelector(selectPageInfo)
  const filters = useSelector(selectFilters)

  const [searchTerm, setSearchTerm] = useState(filters.keyword)
  const debouncedTerm = useDebounce(searchTerm)

  useEffect(() => {
    if (debouncedTerm !== filters.keyword) {
      dispatch(filterChanged({ key: 'keyword', value: debouncedTerm }))
    }
  }, [debouncedTerm, filters.keyword, dispatch])

  useEffect(() => {
    const promise = dispatch(loadEvents())
    return () => promise.abort()
  }, [dispatch, page, filters])

  function handlePageChange(next) {
    dispatch(pageChanged(next))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loading = status === 'loading'

  return (
    <div className="container page">
      <section className="events-hero">
        <h1>Find something worth leaving the house for</h1>
        <p className="muted">
          Concerts, matches, theatre and festivals pulled live from the Ticketmaster Discovery API.
        </p>
      </section>

      <div className="events-toolbar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={() => dispatch(loadEvents())} />
      ) : (
        <>
          <div className="results-bar">
            <p className="muted">
              {loading
                ? 'Searching events…'
                : `${pageInfo.totalElements.toLocaleString()} events found`}
            </p>
          </div>

          {!loading && events.length === 0 ? (
            <EmptyState
              title="No events found"
              message="Nothing matched this search. Try a different keyword or date range."
            />
          ) : (
            <EventGrid events={events} loading={loading} skeletonCount={12} />
          )}

          <Pagination page={page} totalPages={pageInfo.totalPages} onChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default Events

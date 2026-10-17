import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import CategoryStrip from '../components/CategoryStrip'
import EventGrid from '../components/EventGrid'
import RegistrationButton from '../components/RegistrationButton'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import {
  DEFAULT_FILTERS,
  loadEvents,
  loadCategories,
  filterChanged,
  filtersReplaced,
  filtersCleared,
  pageChanged,
  selectActiveFilterCount,
  selectCategories,
  selectEvents,
  selectEventsError,
  selectEventsStatus,
  selectFilters,
  selectPage,
  selectPageInfo
} from '../features/events/eventsSlice'
import useDebounce from '../hooks/useDebounce'
import useDocumentTitle from '../hooks/useDocumentTitle'
import './Events.css'

function readParams(searchParams) {
  const filters = { ...DEFAULT_FILTERS }
  Object.keys(DEFAULT_FILTERS).forEach((key) => {
    const value = searchParams.get(key)
    if (value !== null) filters[key] = value
  })
  const page = Number(searchParams.get('page') ?? 0)
  return { filters, page: Number.isFinite(page) && page > 0 ? page : 0 }
}

function writeParams(filters, page) {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== DEFAULT_FILTERS[key]) params[key] = value
  })
  if (page > 0) params.page = String(page)
  return params
}

function Events() {
  useDocumentTitle('Events')

  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const events = useSelector(selectEvents)
  const status = useSelector(selectEventsStatus)
  const error = useSelector(selectEventsError)
  const page = useSelector(selectPage)
  const pageInfo = useSelector(selectPageInfo)
  const filters = useSelector(selectFilters)
  const categories = useSelector(selectCategories)
  const activeCount = useSelector(selectActiveFilterCount)

  const hydrated = useRef(false)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('keyword') ?? '')
  const debouncedTerm = useDebounce(searchTerm)

  useEffect(() => {
    const initial = readParams(searchParams)
    dispatch(filtersReplaced(initial.filters))
    dispatch(pageChanged(initial.page))
    hydrated.current = true
  }, [])

  useEffect(() => {
    dispatch(loadCategories())
  }, [dispatch])

  useEffect(() => {
    if (!hydrated.current) return
    if (debouncedTerm !== filters.keyword) {
      dispatch(filterChanged({ key: 'keyword', value: debouncedTerm }))
    }
  }, [debouncedTerm, filters.keyword, dispatch])

  useEffect(() => {
    if (!hydrated.current) return
    setSearchParams(writeParams(filters, page), { replace: true })
  }, [filters, page, setSearchParams])

  useEffect(() => {
    if (!hydrated.current) return
    const promise = dispatch(loadEvents())
    return () => promise.abort()
  }, [dispatch, page, filters])

  function handleFilterChange(key, value) {
    dispatch(filterChanged({ key, value }))
  }

  function handleQuickRange(range) {
    dispatch(filterChanged({ key: 'startDate', value: range.start }))
    dispatch(filterChanged({ key: 'endDate', value: range.end }))
  }

  function handleReset() {
    setSearchTerm('')
    dispatch(filtersCleared())
  }

  function handlePageChange(next) {
    dispatch(pageChanged(next))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loading = status === 'loading' || status === 'idle'

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

      <CategoryStrip
        categories={categories}
        active={filters.segment}
        onSelect={(value) => handleFilterChange('segment', value)}
      />

      <FilterPanel
        filters={filters}
        categories={categories}
        activeCount={activeCount}
        onChange={handleFilterChange}
        onReset={handleReset}
        onQuickRange={handleQuickRange}
      />

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
            {activeCount > 0 && !loading ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
                Clear filters
              </button>
            ) : null}
          </div>

          {!loading && events.length === 0 ? (
            <EmptyState
              title="No events found"
              message="Nothing matched this search. Try a different keyword, city or date range."
              action={
                activeCount > 0 ? (
                  <button type="button" className="btn" onClick={handleReset}>
                    Reset filters
                  </button>
                ) : null
              }
            />
          ) : (
            <EventGrid
              events={events}
              loading={loading}
              skeletonCount={12}
              renderFooter={(event) => <RegistrationButton event={event} size="sm" />}
            />
          )}

          <Pagination page={page} totalPages={pageInfo.totalPages} onChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default Events

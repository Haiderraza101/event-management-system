import { useState } from 'react'
import { SORT_OPTIONS } from '../features/events/eventsSlice'
import './FilterPanel.css'

const COUNTRIES = [
  { code: '', name: 'Any country' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AE', name: 'United Arab Emirates' }
]

function todayValue() {
  return new Date().toISOString().slice(0, 10)
}

function offsetValue(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function weekendRange() {
  const date = new Date()
  const offsetToFriday = (5 - date.getDay() + 7) % 7
  const friday = new Date(date)
  friday.setDate(date.getDate() + offsetToFriday)
  const sunday = new Date(friday)
  sunday.setDate(friday.getDate() + 2)
  return { start: friday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) }
}

function FilterPanel({ filters, categories, activeCount, onChange, onReset, onQuickRange }) {
  const [open, setOpen] = useState(false)

  const quickRanges = [
    { label: 'Today', start: todayValue(), end: todayValue() },
    { label: 'This weekend', ...weekendRange() },
    { label: 'Next 7 days', start: todayValue(), end: offsetValue(7) },
    { label: 'Next 30 days', start: todayValue(), end: offsetValue(30) }
  ]

  return (
    <section className="filter-panel">
      <div className="filter-head">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          Filters
          {activeCount > 0 ? <span className="filter-count">{activeCount}</span> : null}
        </button>

        <div className="quick-ranges">
          {quickRanges.map((range) => {
            const isActive = filters.startDate === range.start && filters.endDate === range.end
            return (
              <button
                key={range.label}
                type="button"
                className={`quick-chip ${isActive ? 'active' : ''}`}
                onClick={() => onQuickRange(isActive ? { start: '', end: '' } : range)}
              >
                {range.label}
              </button>
            )
          })}
        </div>

        <div className="field sort-field">
          <label htmlFor="sort" className="sr-only">
            Sort events
          </label>
          <select
            id="sort"
            className="select"
            value={filters.sort}
            onChange={(event) => onChange('sort', event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {open ? (
        <div className="filter-body">
          <div className="field">
            <label htmlFor="segment">Category</label>
            <select
              id="segment"
              className="select"
              value={filters.segment}
              onChange={(event) => onChange('segment', event.target.value)}
            >
              <option value="">Any category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              className="input"
              value={filters.city}
              onChange={(event) => onChange('city', event.target.value)}
              placeholder="e.g. Chicago"
            />
          </div>

          <div className="field">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              className="select"
              value={filters.countryCode}
              onChange={(event) => onChange('countryCode', event.target.value)}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="startDate">From</label>
            <input
              id="startDate"
              type="date"
              className="input"
              value={filters.startDate}
              onChange={(event) => onChange('startDate', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="endDate">Until</label>
            <input
              id="endDate"
              type="date"
              className="input"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(event) => onChange('endDate', event.target.value)}
            />
          </div>

          <div className="filter-reset">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
              Clear all
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default FilterPanel

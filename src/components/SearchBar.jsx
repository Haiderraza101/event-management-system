import './SearchBar.css'

function SearchBar({ value, onChange, placeholder = 'Search events, artists or teams' }) {
  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className="input search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search events"
      />
      {value ? (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          ×
        </button>
      ) : null}
    </div>
  )
}

export default SearchBar

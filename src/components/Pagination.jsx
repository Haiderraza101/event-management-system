import './Pagination.css'

function buildRange(current, total) {
  const pages = new Set([0, total - 1, current, current - 1, current + 1])
  return [...pages].filter((page) => page >= 0 && page < total).sort((a, b) => a - b)
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const range = buildRange(page, totalPages)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
      >
        Previous
      </button>

      <ul className="page-list">
        {range.map((item, index) => {
          const previous = range[index - 1]
          const gap = previous !== undefined && item - previous > 1
          return (
            <li key={item}>
              {gap ? <span className="page-gap">…</span> : null}
              <button
                type="button"
                className={`page-btn page-num ${item === page ? 'active' : ''}`}
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item + 1}
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination

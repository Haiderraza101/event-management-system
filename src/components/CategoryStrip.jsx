import './CategoryStrip.css'

function CategoryStrip({ categories, active, onSelect }) {
  return (
    <div className="category-strip" role="group" aria-label="Event categories">
      <button
        type="button"
        className={`category-chip ${active === '' ? 'active' : ''}`}
        onClick={() => onSelect('')}
      >
        All categories
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`category-chip ${active === category.name ? 'active' : ''}`}
          onClick={() => onSelect(category.name)}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

export default CategoryStrip

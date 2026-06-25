import { useMemo, useState } from 'react'
import BookCard from './BookCard.jsx'

export default function Home({ books, onSelect }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category))
    return ['All', ...Array.from(set).sort()]
  }, [books])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((b) => {
      const matchesCategory = category === 'All' || b.category === category
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [books, query, category])

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="brand">ReadFlow</h1>
        <p className="tagline">Read faster, one word at a time.</p>
      </header>

      <div className="controls">
        <input
          className="search"
          type="search"
          placeholder="Search by title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search books"
        />
        <div className="categories">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${c === category ? 'chip-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No books match your search.</p>
      ) : (
        <div className="book-list">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} onSelect={onSelect} />
          ))}
        </div>
      )}

      <footer className="home-footer">
        {books.length} books · more coming soon
      </footer>
    </div>
  )
}

import { getProgress, getFlowProgress } from '../utils/progress.js'

export default function BookCard({ book, onSelect }) {
  const rsvpPct = Math.round((getProgress(book.id) / book.wordCount) * 100)
  const flowPct = Math.round(getFlowProgress(book.id) * 100)
  const pct = Math.min(100, Math.max(rsvpPct, flowPct))

  return (
    <button className="book-card" onClick={() => onSelect(book)}>
      <div className="book-card-top">
        <span className={`badge difficulty-${book.difficulty.toLowerCase()}`}>
          {book.difficulty}
        </span>
        <span className="badge category">{book.category}</span>
      </div>
      <h2 className="book-title">{book.title}</h2>
      <p className="book-author">{book.author}</p>
      <p className="book-summary">{book.summary}</p>
      <div className="book-meta">
        <span>{book.wordCount.toLocaleString()} words</span>
        <span>·</span>
        <span>~{book.readingTime} min</span>
      </div>
      {pct > 0 && (
        <div className="card-progress" title={`${pct}% read`}>
          <div className="card-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  )
}

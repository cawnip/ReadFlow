// Shown after a book is selected: pick how to read it.
export default function FormatChooser({ book, onPick, onCancel }) {
  return (
    <div className="chooser">
      <button className="btn btn-ghost chooser-back" onClick={onCancel}>
        ← Library
      </button>

      <div className="chooser-body">
        <p className="chooser-kicker">Choose how to read</p>
        <h2 className="chooser-title">{book.title}</h2>
        <p className="chooser-author">by {book.author}</p>

        <div className="format-cards">
          <button className="format-card" onClick={() => onPick('flow')}>
            <div className="format-demo flow-demo">
              <span>…easy ways to</span>
              <span className="demo-active">improve your English.</span>
              <span>But many people</span>
            </div>
            <h3>Flow</h3>
            <p>Text scrolls smoothly upward. Natural, you see the context.</p>
          </button>

          <button className="format-card" onClick={() => onPick('rsvp')}>
            <div className="format-demo rsvp-demo">
              <span className="demo-word">
                ha<span className="demo-pivot">b</span>its
              </span>
            </div>
            <h3>Single word</h3>
            <p>One word at a time, fixed point. Fastest, maximum focus.</p>
          </button>
        </div>
      </div>
    </div>
  )
}

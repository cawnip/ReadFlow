import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  toWords,
  getProgress,
  saveProgress,
  loadSpeed,
  saveSpeed,
} from '../utils/progress.js'

// Split a word at its optimal recognition point (slightly left of center)
// so the eye can lock onto a stable focal letter — the core RSVP trick.
function pivotOf(word) {
  const len = word.length
  if (len <= 1) return 0
  if (len <= 5) return 1
  if (len <= 9) return 2
  return 3
}

export default function Reader({ book, onExit }) {
  const words = useMemo(() => toWords(book.content), [book.content])
  const [index, setIndex] = useState(() => {
    const saved = getProgress(book.id)
    return saved < words.length ? saved : 0
  })
  const [playing, setPlaying] = useState(false)
  const [wpm, setWpm] = useState(() => loadSpeed())

  const finished = index >= words.length

  // Advance one word per tick while playing.
  useEffect(() => {
    if (!playing || finished) return
    const delay = 60000 / wpm
    const t = setTimeout(() => setIndex((i) => i + 1), delay)
    return () => clearTimeout(t)
  }, [playing, finished, wpm, index])

  // Stop at the end.
  useEffect(() => {
    if (finished) setPlaying(false)
  }, [finished])

  // Persist progress and speed.
  useEffect(() => {
    saveProgress(book.id, finished ? 0 : index)
  }, [book.id, index, finished])

  useEffect(() => {
    saveSpeed(wpm)
  }, [wpm])

  const restart = useCallback(() => {
    setIndex(0)
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (finished) {
      setIndex(0)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }, [finished])

  // Keyboard: space = play/pause, arrows = seek, Esc = menu.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(words.length, i + 5))
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(0, i - 5))
      } else if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, words.length, onExit])

  const pct = Math.min(100, Math.round((index / words.length) * 100))

  if (finished) {
    return (
      <div className="reader">
        <div className="finish">
          <p className="finish-kicker">Finished</p>
          <h2 className="finish-title">{book.title}</h2>
          <p className="finish-sub">by {book.author}</p>
          <div className="finish-actions">
            <button className="btn btn-primary" onClick={restart}>
              Read again
            </button>
            <button className="btn" onClick={onExit}>
              Back to library
            </button>
          </div>
        </div>
      </div>
    )
  }

  const word = words[index] ?? ''
  const p = pivotOf(word)

  return (
    <div className="reader">
      <div className="reader-bar">
        <button className="btn btn-ghost" onClick={onExit}>
          ← Library
        </button>
        <div className="reader-info">
          <span className="reader-title">{book.title}</span>
          <span className="reader-author">{book.author}</span>
        </div>
        <span className={`badge difficulty-${book.difficulty.toLowerCase()}`}>
          {book.difficulty}
        </span>
      </div>

      <div className="word-stage" onClick={toggle}>
        <div className="word-guide" />
        <div className="word">
          <span className="word-left">{word.slice(0, p)}</span>
          <span className="word-pivot">{word.slice(p, p + 1)}</span>
          <span className="word-right">{word.slice(p + 1)}</span>
        </div>
        <div className="word-guide" />
        {!playing && <div className="word-hint">tap or press space to play</div>}
      </div>

      <div className="reader-controls">
        <div className="progress">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-meta">
          <span>
            {index} / {words.length} words
          </span>
          <span>{pct}%</span>
        </div>

        <div className="control-row">
          <button
            className="btn"
            onClick={() => setIndex((i) => Math.max(0, i - 10))}
          >
            ⟲ Back
          </button>
          <button className="btn btn-primary play" onClick={toggle}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button className="btn" onClick={restart}>
            Restart
          </button>
        </div>

        <div className="speed">
          <label htmlFor="speed">Speed</label>
          <input
            id="speed"
            type="range"
            min="100"
            max="800"
            step="25"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
          />
          <span className="speed-value">{wpm} wpm</span>
        </div>
      </div>
    </div>
  )
}

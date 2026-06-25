import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  toLines,
  toWords,
  getFlowProgress,
  saveFlowProgress,
  loadSpeed,
  saveSpeed,
} from '../utils/progress.js'

export default function FlowReader({ book, onExit }) {
  const paragraphs = useMemo(() => toLines(book.content), [book.content])
  const wordCount = useMemo(() => toWords(book.content).length, [book.content])

  const scrollRef = useRef(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const fractionRef = useRef(0)
  const posRef = useRef(0) // float scroll position; scrollTop rounds and loses sub-pixel steps

  const [playing, setPlaying] = useState(false)
  const [wpm, setWpm] = useState(() => loadSpeed())
  const [finished, setFinished] = useState(false)
  const [pct, setPct] = useState(0)

  const scrollable = useCallback(() => {
    const el = scrollRef.current
    if (!el) return 0
    return Math.max(1, el.scrollHeight - el.clientHeight)
  }, [])

  // Restore saved position once the text has laid out.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const saved = getFlowProgress(book.id)
    el.scrollTop = saved * scrollable()
    fractionRef.current = saved
    setPct(Math.round(saved * 100))
  }, [book.id, scrollable])

  // Continuous auto-scroll: pixels-per-second derived from words-per-minute.
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current)
      lastTsRef.current = 0
      return
    }
    const el = scrollRef.current
    if (!el) return

    // Cover the whole scrollable distance in the time it takes to read every
    // word at the chosen pace: distance / (wordCount / wpm minutes).
    const seconds = (wordCount / wpm) * 60
    const pxPerSec = scrollable() / Math.max(1, seconds)
    posRef.current = el.scrollTop // sync float accumulator to current position

    const step = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      posRef.current += pxPerSec * dt
      el.scrollTop = posRef.current
      const max = scrollable()
      const f = el.scrollTop / max
      fractionRef.current = f
      setPct(Math.min(100, Math.round(f * 100)))

      const scrollable2 = el.scrollHeight - el.clientHeight
      if (scrollable2 > 4 && el.scrollTop >= max - 1) {
        setPlaying(false)
        setFinished(true)
        saveFlowProgress(book.id, 1)
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, wpm, wordCount, book.id, scrollable])

  // Persist position when pausing / unmounting.
  useEffect(() => {
    if (!playing) saveFlowProgress(book.id, fractionRef.current)
  }, [playing, book.id])

  useEffect(() => {
    return () => saveFlowProgress(book.id, fractionRef.current)
  }, [book.id])

  useEffect(() => {
    saveSpeed(wpm)
  }, [wpm])

  const toggle = useCallback(() => {
    if (finished) {
      const el = scrollRef.current
      if (el) el.scrollTop = 0
      fractionRef.current = 0
      setPct(0)
      setFinished(false)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }, [finished])

  const restart = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = 0
    fractionRef.current = 0
    setPct(0)
    setFinished(false)
    setPlaying(false)
    saveFlowProgress(book.id, 0)
  }, [book.id])

  // Manual scrolling keeps progress in sync when paused.
  const onUserScroll = useCallback(() => {
    if (playing) return
    const el = scrollRef.current
    if (!el) return
    const f = el.scrollTop / scrollable()
    fractionRef.current = f
    setPct(Math.min(100, Math.round(f * 100)))
  }, [playing, scrollable])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, onExit])

  if (finished) {
    return (
      <div className="reader flow-reader">
        <div className="finish">
          <p className="finish-kicker">Finished</p>
          <h2 className="finish-title">{book.title}</h2>
          <p className="finish-sub">by {book.author}</p>
          <div className="finish-actions">
            <button className="btn btn-primary" onClick={toggle}>
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

  return (
    <div className="reader flow-reader">
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

      <div
        className="flow-stage"
        ref={scrollRef}
        onScroll={onUserScroll}
        onClick={toggle}
      >
        <div className="flow-spacer" />
        {paragraphs.map((lines, pi) => (
          <p className="flow-para" key={pi}>
            {lines.map((line, li) => (
              <span className="flow-line" key={li}>
                {line}
              </span>
            ))}
          </p>
        ))}
        <div className="flow-spacer" />
        {!playing && <div className="flow-hint">tap or press space to play</div>}
      </div>

      <div className="reader-controls">
        <div className="progress">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-meta">
          <span>Flow</span>
          <span>{pct}%</span>
        </div>

        <div className="control-row">
          <button className="btn btn-primary play" onClick={toggle}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button className="btn" onClick={restart}>
            Restart
          </button>
        </div>

        <div className="speed">
          <label htmlFor="flow-speed">Speed</label>
          <input
            id="flow-speed"
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

// Reading progress + speed preference persisted in localStorage.

const PROGRESS_KEY = 'readflow.progress'
const SPEED_KEY = 'readflow.speed'

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveProgress(bookId, wordIndex) {
  const all = loadProgress()
  if (wordIndex <= 0) {
    delete all[bookId]
  } else {
    all[bookId] = wordIndex
  }
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
  } catch {
    /* ignore quota errors */
  }
}

export function getProgress(bookId) {
  return loadProgress()[bookId] || 0
}

export function loadSpeed() {
  const v = Number(localStorage.getItem(SPEED_KEY))
  return v >= 100 && v <= 800 ? v : 300
}

export function saveSpeed(wpm) {
  try {
    localStorage.setItem(SPEED_KEY, String(wpm))
  } catch {
    /* ignore */
  }
}

// Split book content into a flat array of words for RSVP playback.
export function toWords(content) {
  return content.split(/\s+/).filter(Boolean)
}

// Break content into paragraphs, each split into sentence-sized lines so the
// Flow reader can render one centered phrase per line (reels/teleprompter look).
export function toLines(content) {
  return content
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) =>
      para
        .replace(/([.!?—])\s+/g, '$1\n')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    )
}

// --- Flow reader progress, stored separately as a 0..1 fraction so it never
// collides with the RSVP word-index progress for the same book. ---
const FLOW_KEY = 'readflow.flowProgress'

function loadFlow() {
  try {
    return JSON.parse(localStorage.getItem(FLOW_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveFlowProgress(bookId, fraction) {
  const all = loadFlow()
  const f = Math.max(0, Math.min(1, fraction))
  if (f <= 0.005 || f >= 0.995) {
    delete all[bookId]
  } else {
    all[bookId] = Number(f.toFixed(4))
  }
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export function getFlowProgress(bookId) {
  return loadFlow()[bookId] || 0
}

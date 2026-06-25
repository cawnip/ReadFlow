import { useState } from 'react'
import booksData from './data/books.json'
import Home from './components/Home.jsx'
import FormatChooser from './components/FormatChooser.jsx'
import Reader from './components/Reader.jsx'
import FlowReader from './components/FlowReader.jsx'

// Reading speed (words per minute) used to estimate reading time on cards.
const ESTIMATE_WPM = 250

const books = booksData.map((b) => ({
  ...b,
  readingTime: Math.max(1, Math.round(b.wordCount / ESTIMATE_WPM)),
}))

export default function App() {
  const [activeBook, setActiveBook] = useState(null)
  const [mode, setMode] = useState(null) // 'flow' | 'rsvp' | null (choosing)

  const open = (book) => {
    setActiveBook(book)
    setMode(null)
  }

  const exit = () => {
    setActiveBook(null)
    setMode(null)
  }

  let view
  if (!activeBook) {
    view = <Home books={books} onSelect={open} />
  } else if (!mode) {
    view = <FormatChooser book={activeBook} onPick={setMode} onCancel={exit} />
  } else if (mode === 'flow') {
    view = <FlowReader book={activeBook} onExit={exit} />
  } else {
    view = <Reader book={activeBook} onExit={exit} />
  }

  return <div className="app">{view}</div>
}

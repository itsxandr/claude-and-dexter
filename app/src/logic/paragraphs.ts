// Split extracted pages into numbered Source_Paragraphs. See design.md,
// "Importer", and requirement 2.2. Pure logic: no browser APIs.
import type { RawPage, LessonParagraph } from './types'

// Paragraphs longer than this are cut into smaller pieces, so a Hint link
// points to a small piece of text.
export const MAX_PARAGRAPH_CHARS = 800

// Turn all runs of whitespace into one space and trim the ends.
function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

// Cut a long paragraph at the last sentence end (. ? !) that keeps the piece
// at most MAX_PARAGRAPH_CHARS long. Repeat on the rest. If no sentence end
// is found, the rest is kept as one piece.
function splitLong(text: string): string[] {
  const pieces: string[] = []
  let rest = text
  while (rest.length > MAX_PARAGRAPH_CHARS) {
    // Search only the first 800 characters, so the cut piece is <= 800.
    const head = rest.slice(0, MAX_PARAGRAPH_CHARS)
    const cut = Math.max(head.lastIndexOf('.'), head.lastIndexOf('?'), head.lastIndexOf('!'))
    if (cut < 0) break
    pieces.push(rest.slice(0, cut + 1).trim())
    rest = rest.slice(cut + 1).trim()
  }
  if (rest.length > 0) pieces.push(rest)
  return pieces
}

export function splitParagraphs(pages: RawPage[]): LessonParagraph[] {
  // First collect raw paragraphs (text + page), before numbering.
  const raw: { text: string; page: number }[] = []

  for (const { page, lines } of pages) {
    // A page change always starts a new paragraph.
    let current: string[] = []
    const flush = () => {
      const text = collapse(current.join(' '))
      if (text.length > 0) {
        for (const piece of splitLong(text)) raw.push({ text: piece, page })
      }
      current = []
    }
    for (const line of lines) {
      // An empty (or only-spaces) line ends the paragraph.
      if (line.trim() === '') flush()
      else current.push(line)
    }
    flush()
  }

  // Number 1..N in reading order.
  return raw.map((p, i) => ({ n: i + 1, text: p.text, page: p.page }))
}

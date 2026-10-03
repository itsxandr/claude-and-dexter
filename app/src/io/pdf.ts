// Thin IO over pdf.js: read a PDF File and return its text, one page at a time.
// See design.md, "io/pdf.ts", and requirement 2.1.
//
// pdf.js is heavy, so it loads with a dynamic import() — only the Make Pack
// screen pays for it, and students who just study never parse it on start-up.
// The worker (a background script pdf.js uses to parse off the main thread) is
// imported as a URL so Vite bundles and precaches it for offline use.

import type { RawPage } from '../logic/types'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let workerReady = false

// Read a PDF File and return one RawPage per page, with its text split into
// lines. Lines come from the text items pdf.js reports: an item marked `hasEOL`
// ends the current line. splitParagraphs (logic/paragraphs.ts) turns these
// lines into numbered paragraphs later.
export async function extractPdf(file: File): Promise<RawPage[]> {
  const pdfjs = await import('pdfjs-dist')

  // Point pdf.js at its worker once, the first time we parse anything.
  if (!workerReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    workerReady = true
  }

  const data = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data })

  try {
    const doc = await loadingTask.promise
    const pages: RawPage[] = []
    for (let page = 1; page <= doc.numPages; page++) {
      const pdfPage = await doc.getPage(page)
      const content = await pdfPage.getTextContent()

      const lines: string[] = []
      let current = ''
      for (const item of content.items) {
        // Skip marked-content markers; only real text items carry `str`.
        if (!('str' in item)) continue
        current += item.str
        if (item.hasEOL) {
          lines.push(current)
          current = ''
        }
      }
      // A page may end mid-line, with no trailing hasEOL.
      if (current !== '') lines.push(current)

      pages.push({ page, lines })
      pdfPage.cleanup()
    }
    return pages
  } finally {
    // Abort any pending work and free the worker.
    await loadingTask.destroy()
  }
}

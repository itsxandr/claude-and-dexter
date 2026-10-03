// Page range and lesson text. See design.md, "Importer", and requirement 3.1.
// Pure logic: no browser APIs. (applyPageRange is added in task 14.)
import type { LessonParagraph } from './types'

// The Lesson_Text we hash and send: "[n] text" for each paragraph,
// separated by blank lines.
export function lessonText(paras: LessonParagraph[]): string {
  return paras.map((p) => `[${p.n}] ${p.text}`).join('\n\n')
}

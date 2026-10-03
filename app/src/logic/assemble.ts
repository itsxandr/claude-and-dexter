// Build a StudyPack from the Pack_Service draft plus the phone's own text.
// See design.md, "Assembler", and requirements 3.7 and 3.8.
// Pure logic: no browser APIs. It does not check anything; formatCheck runs after.
import { PACK_FORMAT_VERSION } from '../config'
import type { LessonParagraph, PackDraft, Question, StudyPack } from './types'

export function assemblePack(
  draft: PackDraft,
  paragraphs: LessonParagraph[],
  id: string,
  title: string,
  createdAt: string,
): StudyPack {
  // Paragraph text comes from the phone, never from the AI. Drop `page`.
  const packParagraphs = paragraphs.map(({ n, text }) => ({ n, text }))

  // Give each Question a stable id in draft order: q1, q2, ...
  // Copy only the known fields, so stray keys from the AI are not saved.
  const questions: Question[] = draft.questions.map((q, i) => ({
    id: `q${i + 1}`,
    skill: q.skill,
    level: q.level,
    prompt: q.prompt,
    choices: [...q.choices],
    answerIndex: q.answerIndex,
    hints: [
      { text: q.hints[0].text, paragraph: q.hints[0].paragraph },
      { text: q.hints[1].text, paragraph: q.hints[1].paragraph },
    ],
    explanation: { text: q.explanation.text, paragraph: q.explanation.paragraph },
  }))

  return {
    formatVersion: PACK_FORMAT_VERSION,
    id,
    title,
    createdAt,
    paragraphs: packParagraphs,
    summaries: draft.summaries.map((s) => ({
      level: s.level,
      text: s.text,
      paragraphs: [...s.paragraphs],
    })),
    questions,
    glossary: draft.glossary.map((g) => ({ en: g.en, fil: g.fil, meaning: g.meaning })),
  }
}

// Build a StudyPack from the Pack_Service draft plus the phone's own text.
// See design.md, "Assembler", and requirements 3.7 and 3.8.
// Pure logic: no browser APIs. It does not check anything; formatCheck runs after.
import { PACK_FORMAT_VERSION } from '../config'
import type { LessonParagraph, PackDraft, Question, StudyPack } from './types'

// The AI tends to put the right answer first, so every answer would be "A".
// Move the right answer to a spot picked from the pack id and question number.
// Same PDF gives the same pack every time (no random numbers).
function placeAnswer(
  choices: string[],
  answerIndex: number,
  seed: string,
): { choices: string[]; answerIndex: number } {
  const out = [...choices]
  if (out.length < 2 || answerIndex < 0 || answerIndex >= out.length) {
    return { choices: out, answerIndex }
  }
  let hash = 0
  for (let k = 0; k < seed.length; k++) hash = (hash * 31 + seed.charCodeAt(k)) >>> 0
  const target = hash % out.length
  const moved = out[target]
  out[target] = out[answerIndex]
  out[answerIndex] = moved
  return { choices: out, answerIndex: target }
}

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
  const questions: Question[] = draft.questions.map((q, i) => {
    const placed = placeAnswer(q.choices, q.answerIndex, `${id}:${i + 1}`)
    return {
    id: `q${i + 1}`,
    skill: q.skill,
    level: q.level,
    prompt: q.prompt,
    choices: placed.choices,
    answerIndex: placed.answerIndex,
    hints: [
      { text: q.hints[0].text, paragraph: q.hints[0].paragraph },
      { text: q.hints[1].text, paragraph: q.hints[1].paragraph },
    ],
    explanation: { text: q.explanation.text, paragraph: q.explanation.paragraph },
    }
  })

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

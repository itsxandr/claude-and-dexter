import { describe, it, expect } from 'vitest'
import { assemblePack } from './assemble'
import { PACK_FORMAT_VERSION } from '../config'
import type { PackDraft, LessonParagraph } from './types'

const paragraphs: LessonParagraph[] = [
  { n: 1, text: 'Plants need sunlight.', page: 1 },
  { n: 2, text: 'Roots take in water.', page: 2 },
]

const question = (prompt: string): PackDraft['questions'][number] => ({
  skill: 'detail',
  level: 1,
  prompt,
  choices: ['Sun', 'Moon'],
  answerIndex: 0,
  hints: [
    { text: 'Look at paragraph 1.', paragraph: 1 },
    { text: 'What gives light?', paragraph: 1 },
  ],
  explanation: { text: 'Plants need sunlight.', paragraph: 1 },
})

const draft: PackDraft = {
  summaries: [{ level: 1, text: 'Plants need sun and water.', paragraphs: [1, 2] }],
  questions: [question('What do plants need?'), question('What helps plants grow?')],
  glossary: [{ en: 'root', fil: 'ugat', meaning: 'The part of a plant under the ground.' }],
}

describe('assemblePack', () => {
  it('uses the phone text, adds ids in order, and copies the draft', () => {
    const pack = assemblePack(draft, paragraphs, 'abc123', 'Plants', '2025-01-01T00:00:00.000Z')

    expect(pack.formatVersion).toBe(PACK_FORMAT_VERSION)
    expect(pack.id).toBe('abc123')
    expect(pack.title).toBe('Plants')
    expect(pack.createdAt).toBe('2025-01-01T00:00:00.000Z')
    // `page` is dropped.
    expect(pack.paragraphs).toEqual([
      { n: 1, text: 'Plants need sunlight.' },
      { n: 2, text: 'Roots take in water.' },
    ])
    expect(pack.questions.map((q) => q.id)).toEqual(['q1', 'q2'])
    // The right answer may move, but it must still be the same text.
    const q2 = pack.questions[1]
    expect(q2.choices[q2.answerIndex]).toBe('Sun')
    expect([...q2.choices].sort()).toEqual(['Moon', 'Sun'])
    expect(q2.prompt).toBe(draft.questions[1].prompt)
    expect(q2.hints).toEqual(draft.questions[1].hints)
    expect(pack.summaries).toEqual(draft.summaries)
    expect(pack.glossary).toEqual(draft.glossary)
  })

  it('does not leave every right answer in the first spot', () => {
    const many: PackDraft = {
      ...draft,
      questions: Array.from({ length: 24 }, (_, i) => ({
        ...question(`Question ${i}`),
        choices: ['Right', 'Wrong 1', 'Wrong 2', 'Wrong 3'],
      })),
    }
    const pack = assemblePack(many, paragraphs, 'abc123', 'Plants', '2025-01-01T00:00:00.000Z')
    const spots = new Set(pack.questions.map((q) => q.answerIndex))
    expect(spots.size).toBeGreaterThan(2)
    for (const q of pack.questions) expect(q.choices[q.answerIndex]).toBe('Right')
  })
})

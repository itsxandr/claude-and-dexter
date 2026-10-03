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
    expect(pack.questions[1]).toEqual({ ...draft.questions[1], id: 'q2' })
    expect(pack.summaries).toEqual(draft.summaries)
    expect(pack.glossary).toEqual(draft.glossary)
  })
})

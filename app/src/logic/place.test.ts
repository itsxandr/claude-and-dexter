import { describe, expect, it } from 'vitest'
import { checkPlace } from './place.ts'
import type { Place } from './place.ts'
import { startSession } from './session.ts'
import type { StudyPack } from './types.ts'
import sample from '../../fixtures/sample.studypack.json'

const pack = sample as unknown as StudyPack

function place(screen: Place['screen'], packId: string | null = pack.id): Place {
  return { screen, tab: 'study', packId, session: startSession('catchup') }
}

describe('checkPlace', () => {
  it('returns null when nothing was saved', () => {
    expect(checkPlace(undefined, [pack])).toBeNull()
  })

  it('keeps the Lessons screen even with no pack', () => {
    const saved = place({ name: 'lessons' }, null)
    expect(checkPlace(saved, [])).toBe(saved)
  })

  it('keeps a study screen when its pack is still on the phone', () => {
    const saved = place({ name: 'question', questionIndex: 0, answeredCount: 2 })
    expect(checkPlace(saved, [pack])).toBe(saved)
  })

  it('returns null when the pack is gone', () => {
    const saved = place({ name: 'progress' }, 'deleted-pack')
    expect(checkPlace(saved, [pack])).toBeNull()
  })

  it('returns null when the question is gone', () => {
    const saved = place({ name: 'question', questionIndex: pack.questions.length, answeredCount: 0 })
    expect(checkPlace(saved, [pack])).toBeNull()
  })
})

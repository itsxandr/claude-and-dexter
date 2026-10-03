import { describe, it, expect } from 'vitest'
import sample from '../../fixtures/sample.studypack.json'
import { formatCheck, coverageCheck } from './packCheck'

describe('formatCheck on the sample fixture', () => {
  it('passes and returns the same pack', () => {
    const result = formatCheck(sample)
    expect(result).toEqual({ ok: true, pack: sample })
  })

  it('drops unknown fields, top-level and nested', () => {
    const extra = {
      ...sample,
      secret: 'x',
      questions: sample.questions.map((q) => ({ ...q, junk: 1 })),
    }
    const result = formatCheck(extra)
    expect(result).toEqual({ ok: true, pack: sample })
  })

  it('rejects non-objects without throwing', () => {
    for (const bad of [null, undefined, 42, 'pack', [], [sample]]) {
      expect(formatCheck(bad).ok).toBe(false)
    }
  })

  it('rejects a dangling paragraph reference', () => {
    const bad = structuredClone(sample)
    bad.questions[0].hints[0].paragraph = 99
    expect(formatCheck(bad).ok).toBe(false)
  })

  it('reports the empty Coverage_Slots of the partial sample', () => {
    const result = formatCheck(sample)
    if (!result.ok) throw new Error('fixture should pass')
    const coverage = coverageCheck(result.pack)
    // The fixture fills 5 of the 12 slots.
    expect(coverage.ok).toBe(false)
    expect(coverage.emptySlots).toHaveLength(7)
    expect(coverage.emptySlots).toContainEqual({ skill: 'inference', level: 1 })
  })
})

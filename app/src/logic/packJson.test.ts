import { describe, it, expect } from 'vitest'
import sample from '../../fixtures/sample.studypack.json'
import { formatCheck } from './packCheck'
import { packFromJson, packToJson } from './packJson'

describe('packToJson / packFromJson', () => {
  it('round-trips the sample fixture', () => {
    const checked = formatCheck(sample)
    if (!checked.ok) throw new Error('fixture should pass')
    expect(packFromJson(packToJson(checked.pack))).toEqual({ ok: true, pack: checked.pack })
  })

  it('returns ok: false for text that is not JSON, without throwing', () => {
    for (const bad of ['', 'not json', '{', '{"formatVersion":1', '\u0000']) {
      const result = packFromJson(bad)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.errors.length).toBeGreaterThan(0)
    }
  })

  it('returns ok: false for valid JSON that is not a pack', () => {
    for (const bad of ['null', '42', '"pack"', '[]', '{}']) {
      expect(packFromJson(bad).ok).toBe(false)
    }
  })
})

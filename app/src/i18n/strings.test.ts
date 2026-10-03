import { describe, expect, it } from 'vitest'
import { STRINGS, guessLanguage } from './strings.ts'
import { PRAISE_COUNT } from '../logic/coach.ts'

describe('guessLanguage', () => {
  it('picks Tagalog for a Tagalog or Filipino phone', () => {
    expect(guessLanguage('tl')).toBe('tl')
    expect(guessLanguage('fil-PH')).toBe('tl')
  })

  it('picks English for anything else, or nothing', () => {
    expect(guessLanguage('en-US')).toBe('en')
    expect(guessLanguage('ja')).toBe('en')
    expect(guessLanguage(undefined)).toBe('en')
  })
})

describe('STRINGS', () => {
  it('has one praise line per coach praise number, in every language', () => {
    expect(STRINGS.en.question.praise).toHaveLength(PRAISE_COUNT)
    expect(STRINGS.tl.question.praise).toHaveLength(PRAISE_COUNT)
  })

  it('has the same onboarding steps in every language', () => {
    expect(STRINGS.tl.onboarding.steps).toHaveLength(STRINGS.en.onboarding.steps.length)
  })
})

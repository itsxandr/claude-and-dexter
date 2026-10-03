import { describe, expect, it } from 'vitest'
import { startSession } from './session.ts'

describe('startSession', () => {
  it('starts the Catch-up_Path at Reading_Level 1', () => {
    expect(startSession('catchup').level).toBe(1)
  })

  it('starts the Practice_Path at Reading_Level 2', () => {
    expect(startSession('practice').level).toBe(2)
  })
})

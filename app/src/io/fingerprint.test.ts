import { describe, it, expect } from 'vitest'
import { fingerprint } from './fingerprint'

describe('fingerprint', () => {
  it('matches known SHA-256 values', async () => {
    expect(await fingerprint('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
    expect(await fingerprint('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('hashes the UTF-8 bytes of non-ASCII text', async () => {
    // "ñ" is the two UTF-8 bytes 0xC3 0xB1; hashing those bytes directly
    // must give the same result as hashing the string.
    const expected = await crypto.subtle.digest('SHA-256', new Uint8Array([0xc3, 0xb1]))
    const hex = Array.from(new Uint8Array(expected), (b) => b.toString(16).padStart(2, '0')).join('')
    expect(await fingerprint('ñ')).toBe(hex)
    expect(await fingerprint('Ang niño ay masaya.')).toMatch(/^[0-9a-f]{64}$/)
  })
})

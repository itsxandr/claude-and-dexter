import { describe, it, expect } from 'vitest'
import { splitParagraphs } from './paragraphs'
import { lessonText } from './pageRange'

describe('splitParagraphs', () => {
  it('starts a new paragraph at an empty line and at a page change', () => {
    const result = splitParagraphs([
      { page: 1, lines: ['The sun', 'is hot.', '', 'Water   boils.'] },
      { page: 2, lines: ['Plants grow.'] },
    ])
    expect(result).toEqual([
      { n: 1, text: 'The sun is hot.', page: 1 },
      { n: 2, text: 'Water boils.', page: 1 },
      { n: 3, text: 'Plants grow.', page: 2 },
    ])
  })

  it('drops empty paragraphs and empty pages', () => {
    const result = splitParagraphs([
      { page: 1, lines: ['', '   ', ''] },
      { page: 2, lines: ['', 'Hello.', '', ''] },
      { page: 3, lines: [] },
    ])
    expect(result).toEqual([{ n: 1, text: 'Hello.', page: 2 }])
  })

  it('splits a paragraph over 800 characters at the last sentence end before 800', () => {
    const sentence = 'a'.repeat(99) + '.' // 100 chars
    const long = Array(10).fill(sentence).join(' ') // 1009 chars
    const result = splitParagraphs([{ page: 4, lines: [long] }])
    expect(result.length).toBe(2)
    expect(result[0].text.length).toBeLessThanOrEqual(800)
    expect(result[0].text.endsWith('.')).toBe(true)
    expect(result.map((p) => p.n)).toEqual([1, 2])
    expect(result.every((p) => p.page === 4)).toBe(true)
    expect(result.map((p) => p.text).join(' ')).toBe(long)
  })

  it('keeps a long paragraph as is when there is no sentence end before 800', () => {
    const long = 'word '.repeat(300).trim()
    const result = splitParagraphs([{ page: 1, lines: [long] }])
    expect(result).toEqual([{ n: 1, text: long, page: 1 }])
  })
})

describe('lessonText', () => {
  it('joins "[n] text" lines with blank lines', () => {
    expect(
      lessonText([
        { n: 1, text: 'First.', page: 1 },
        { n: 2, text: 'Second.', page: 2 },
      ]),
    ).toBe('[1] First.\n\n[2] Second.')
  })

  it('returns an empty string for no paragraphs', () => {
    expect(lessonText([])).toBe('')
  })
})

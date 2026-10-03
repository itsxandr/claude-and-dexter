// Pack checks. See design.md, "Pack checks".
// formatCheck = the Pack_Format_Check (rules 1-7), written by hand (no schema library).
// coverageCheck = the Full_Coverage_Check (all 12 Coverage_Slots have a Question).
// Pure functions: no browser APIs, and formatCheck never throws.

import { PACK_FORMAT_VERSION } from '../config'
import type { Question, ReadingLevel, Ref, Skill, Slot, StudyPack } from './types'

export const SKILLS: readonly Skill[] = ['main_idea', 'detail', 'vocabulary', 'inference']
export const LEVELS: readonly ReadingLevel[] = [1, 2, 3]

type Obj = Record<string, unknown>

const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x)
const isText = (x: unknown): x is string => typeof x === 'string' && x.length > 0
const isInt = (x: unknown): x is number => Number.isInteger(x)
const isLevel = (x: unknown): x is ReadingLevel => x === 1 || x === 2 || x === 3
const isSkill = (x: unknown): x is Skill => SKILLS.includes(x as Skill)

export function formatCheck(x: unknown): { ok: true; pack: StudyPack } | { ok: false; errors: string[] } {
  const errors: string[] = []

  if (!isObj(x)) return { ok: false, errors: ['pack is not an object'] }

  // Rule 1: header fields.
  if (x.formatVersion !== PACK_FORMAT_VERSION) errors.push('formatVersion must be 1')
  for (const key of ['id', 'title', 'createdAt'] as const) {
    if (!isText(x[key])) errors.push(`${key} must be a non-empty string`)
  }

  // Rule 2: paragraphs numbered exactly 1..N, each with text.
  const paragraphs: StudyPack['paragraphs'] = []
  if (!Array.isArray(x.paragraphs) || x.paragraphs.length === 0) {
    errors.push('paragraphs must be a non-empty array')
  } else {
    x.paragraphs.forEach((p: unknown, i) => {
      if (!isObj(p)) return errors.push(`paragraphs[${i}] is not an object`)
      if (p.n !== i + 1) errors.push(`paragraphs[${i}].n must be ${i + 1}`)
      if (!isText(p.text)) errors.push(`paragraphs[${i}].text must be a non-empty string`)
      paragraphs.push({ n: p.n as number, text: p.text as string })
    })
  }
  const count = Array.isArray(x.paragraphs) ? x.paragraphs.length : 0

  // Rule 6: every referenced paragraph number is an integer in 1..N.
  const checkParaNumber = (v: unknown, where: string) => {
    if (!isInt(v) || v < 1 || v > count) errors.push(`${where} must be a paragraph number from 1 to ${count}`)
  }

  // A Hint or Explanation: non-empty text and a valid paragraph number.
  const checkRef = (r: unknown, where: string): Ref => {
    if (!isObj(r)) {
      errors.push(`${where} is not an object`)
      return { text: '', paragraph: 0 }
    }
    if (!isText(r.text)) errors.push(`${where}.text must be a non-empty string`)
    checkParaNumber(r.paragraph, `${where}.paragraph`)
    return { text: r.text as string, paragraph: r.paragraph as number }
  }

  // Rule 3: exactly 3 summaries, one for each level 1, 2, 3.
  const summaries: StudyPack['summaries'] = []
  if (!Array.isArray(x.summaries) || x.summaries.length !== 3) {
    errors.push('summaries must have exactly 3 items')
  } else {
    const seen = new Set<unknown>()
    x.summaries.forEach((s: unknown, i) => {
      const where = `summaries[${i}]`
      if (!isObj(s)) return errors.push(`${where} is not an object`)
      if (!isLevel(s.level)) errors.push(`${where}.level must be 1, 2, or 3`)
      else if (seen.has(s.level)) errors.push(`${where}.level ${s.level} is repeated`)
      seen.add(s.level)
      if (!isText(s.text)) errors.push(`${where}.text must be a non-empty string`)
      if (!Array.isArray(s.paragraphs) || s.paragraphs.length === 0) {
        errors.push(`${where}.paragraphs must be a non-empty array`)
      } else {
        s.paragraphs.forEach((n: unknown, j) => checkParaNumber(n, `${where}.paragraphs[${j}]`))
      }
      summaries.push({
        level: s.level as ReadingLevel,
        text: s.text as string,
        paragraphs: Array.isArray(s.paragraphs) ? [...(s.paragraphs as number[])] : [],
      })
    })
  }

  // Rule 4: at least 1 well-formed Question with a unique id.
  const questions: Question[] = []
  if (!Array.isArray(x.questions) || x.questions.length === 0) {
    errors.push('questions must have at least 1 item')
  } else {
    const ids = new Set<string>()
    x.questions.forEach((q: unknown, i) => {
      const where = `questions[${i}]`
      if (!isObj(q)) return errors.push(`${where} is not an object`)
      if (!isText(q.id)) errors.push(`${where}.id must be a non-empty string`)
      else if (ids.has(q.id)) errors.push(`${where}.id "${q.id}" is repeated`)
      else ids.add(q.id)
      if (!isSkill(q.skill)) errors.push(`${where}.skill must be one of ${SKILLS.join(', ')}`)
      if (!isLevel(q.level)) errors.push(`${where}.level must be 1, 2, or 3`)
      if (!isText(q.prompt)) errors.push(`${where}.prompt must be a non-empty string`)

      const choicesOk =
        Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.length <= 4 && q.choices.every(isText)
      if (!choicesOk) errors.push(`${where}.choices must be 2 to 4 non-empty strings`)
      const choiceCount = Array.isArray(q.choices) ? q.choices.length : 0
      if (!isInt(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= choiceCount) {
        errors.push(`${where}.answerIndex must point to one of the choices`)
      }

      let hints: [Ref, Ref] = [
        { text: '', paragraph: 0 },
        { text: '', paragraph: 0 },
      ]
      if (!Array.isArray(q.hints) || q.hints.length !== 2) {
        errors.push(`${where}.hints must have exactly 2 items`)
      } else {
        hints = [checkRef(q.hints[0], `${where}.hints[0]`), checkRef(q.hints[1], `${where}.hints[1]`)]
      }
      const explanation = checkRef(q.explanation, `${where}.explanation`)

      questions.push({
        id: q.id as string,
        skill: q.skill as Skill,
        level: q.level as ReadingLevel,
        prompt: q.prompt as string,
        choices: Array.isArray(q.choices) ? [...(q.choices as string[])] : [],
        answerIndex: q.answerIndex as number,
        hints,
        explanation,
      })
    })
  }

  // Rule 5: glossary is an array (may be empty) of complete cards.
  const glossary: StudyPack['glossary'] = []
  if (!Array.isArray(x.glossary)) {
    errors.push('glossary must be an array')
  } else {
    x.glossary.forEach((c: unknown, i) => {
      const where = `glossary[${i}]`
      if (!isObj(c)) return errors.push(`${where} is not an object`)
      for (const key of ['en', 'fil', 'meaning'] as const) {
        if (!isText(c[key])) errors.push(`${where}.${key} must be a non-empty string`)
      }
      glossary.push({ en: c.en as string, fil: c.fil as string, meaning: c.meaning as string })
    })
  }

  if (errors.length > 0) return { ok: false, errors }

  // Rule 7: build a fresh pack with only the known fields (extra fields are dropped).
  return {
    ok: true,
    pack: {
      formatVersion: PACK_FORMAT_VERSION,
      id: x.id as string,
      title: x.title as string,
      createdAt: x.createdAt as string,
      paragraphs,
      summaries,
      questions,
      glossary,
    },
  }
}

// The (Skill, Reading_Level) pairs that have no Question, in a fixed order.
export function emptySlots(pack: StudyPack): Slot[] {
  const filled = new Set(pack.questions.map((q) => `${q.skill}:${q.level}`))
  const empty: Slot[] = []
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      if (!filled.has(`${skill}:${level}`)) empty.push({ skill, level })
    }
  }
  return empty
}

// Full_Coverage_Check: passes when all 12 Coverage_Slots have at least one Question.
export function coverageCheck(pack: StudyPack): { ok: boolean; emptySlots: Slot[] } {
  const empty = emptySlots(pack)
  return { ok: empty.length === 0, emptySlots: empty }
}

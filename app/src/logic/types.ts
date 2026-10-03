// Shared data types. See design.md, "Data Models".
// Every saved field is JSON-safe (no undefined, no Date), so packs round-trip.

export type Skill = 'main_idea' | 'detail' | 'vocabulary' | 'inference'
export type ReadingLevel = 1 | 2 | 3
export type Mode = 'lite' | 'standard'

// One Coverage_Slot: one Skill at one Reading_Level.
export type Slot = { skill: Skill; level: ReadingLevel }

// ---- Importer output (phone only, never saved as-is) ----

// Text lines of one PDF page or one PPTX slide.
export interface RawPage {
  page: number
  lines: string[]
}

export interface LessonParagraph {
  n: number
  text: string
  page: number
}

// ---- What the Pack_Service returns (no paragraph text, no ids) ----

// A Hint or Explanation. Points to a paragraph by NUMBER only.
export interface Ref {
  text: string
  paragraph: number
}

export interface PackDraft {
  summaries: { level: ReadingLevel; text: string; paragraphs: number[] }[]
  questions: {
    skill: Skill
    level: ReadingLevel
    prompt: string
    choices: string[] // 2-4
    answerIndex: number
    hints: [Ref, Ref] // exactly 2
    explanation: Ref // correct answer + short reason
  }[]
  glossary: { en: string; fil: string; meaning: string }[]
}

// ---- What the App saves and shares (Pack_File content) ----

export type Question = PackDraft['questions'][number] & { id: string }

export interface StudyPack {
  formatVersion: 1
  id: string // Fingerprint (SHA-256 hex)
  title: string
  createdAt: string // ISO date string
  paragraphs: { n: number; text: string }[]
  summaries: PackDraft['summaries']
  questions: Question[]
  glossary: PackDraft['glossary']
}

// ---- On-phone progress ----

export type MasteryRecord = Record<Skill, { answered: number; firstTryRight: number }>

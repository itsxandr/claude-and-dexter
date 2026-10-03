// Make-pack flow: one lesson file in, one saved Study_Pack out.
// See design.md, "Making a pack". Requirements 2.1, 2.2, 3.2, 3.3, 3.4, 3.9, 3.10.
//
// Every outside helper (reading the file, hashing, the database, the network)
// is passed in as `deps`. This is called "dependency injection": tests can pass
// simple fakes, so the flow runs without a browser.
import { MAX_LESSON_CHARS } from '../config'
import type { MakeResult } from '../io/packClient'
import { assemblePack } from '../logic/assemble'
import { coverageCheck, formatCheck } from '../logic/packCheck'
import { lessonText } from '../logic/pageRange'
import { splitParagraphs } from '../logic/paragraphs'
import type { PackDraft, RawPage, StudyPack } from '../logic/types'

export interface MakePackDeps {
  // Reads the Lesson_File into pages of text lines (for example io/pdf.ts).
  extract: (file: File) => Promise<RawPage[]>
  // SHA-256 hex of the final Lesson_Text (io/fingerprint.ts).
  fingerprint: (text: string) => Promise<string>
  // The two Progress_Store helpers this flow needs (io/store.ts).
  store: {
    getPack: (id: string) => Promise<StudyPack | undefined>
    putPack: (pack: StudyPack) => Promise<void>
  }
  // One request to the Pack_Service (io/packClient.ts).
  requestDraft: (lessonText: string) => Promise<MakeResult>
  // Clock for `createdAt`. Optional, so tests can fix the time.
  now?: () => string
}

export type MakePackFailReason =
  | 'too_long' // stand-in until the Page_Range picker (task 14)
  | Extract<MakeResult, { ok: false }>['reason'] // offline, timeout, server, bad_json
  | 'bad_format' // draft failed the Pack_Format_Check
  | 'bad_coverage' // draft failed the Full_Coverage_Check

export type MakePackResult =
  | { ok: true; pack: StudyPack; isNew: boolean }
  | { ok: false; reason: MakePackFailReason }

// "Lesson 3.pdf" -> "Lesson 3". formatCheck needs a non-empty title.
export function titleFromFileName(name: string): string {
  const title = name.replace(/\.[^.]+$/, '').trim()
  return title.length > 0 ? title : 'Lesson'
}

export async function makePack(file: File, deps: MakePackDeps): Promise<MakePackResult> {
  // 1. Read the file and split it into numbered Source_Paragraphs.
  const pages = await deps.extract(file)
  const paragraphs = splitParagraphs(pages)
  const text = lessonText(paragraphs)

  // 2. Too long for the Pack_Service. Task 14 replaces this with a Page_Range picker.
  if (text.length > MAX_LESSON_CHARS) return { ok: false, reason: 'too_long' }

  // 3. Fingerprint the final text. It is also the pack id.
  const id = await deps.fingerprint(text)

  // 4. Already made on this phone: open it with no network call (Req 3.3).
  const saved = await deps.store.getPack(id)
  if (saved) return { ok: true, pack: saved, isNew: false }

  // 5. Ask the Pack_Service one time (Req 3.4).
  const result = await deps.requestDraft(text)
  if (!result.ok) return { ok: false, reason: result.reason }

  // 6. Join the draft with the phone's own paragraphs. The draft is untrusted,
  //    so a badly shaped one may make assemblePack throw; treat that as bad format.
  const createdAt = (deps.now ?? (() => new Date().toISOString()))()
  let assembled: StudyPack
  try {
    assembled = assemblePack(result.draft as PackDraft, paragraphs, id, titleFromFileName(file.name), createdAt)
  } catch {
    return { ok: false, reason: 'bad_format' }
  }

  // 7. Both checks must pass before anything is saved (Req 3.9, 3.10).
  const format = formatCheck(assembled)
  if (!format.ok) return { ok: false, reason: 'bad_format' }
  if (!coverageCheck(format.pack).ok) return { ok: false, reason: 'bad_coverage' }

  await deps.store.putPack(format.pack)
  return { ok: true, pack: format.pack, isNew: true }
}

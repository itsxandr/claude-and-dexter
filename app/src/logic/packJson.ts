// Pack JSON. See design.md, "Pack JSON and Pack_File", and requirements 3.12, 4.6-4.8.
// packToJson writes the Pack_File text; packFromJson reads it back through the
// Pack_Format_Check. Pure logic: no browser APIs, and packFromJson never throws.
import { formatCheck } from './packCheck'
import type { StudyPack } from './types'

export function packToJson(pack: StudyPack): string {
  return JSON.stringify(pack)
}

export function packFromJson(text: string): ReturnType<typeof formatCheck> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['file is not valid JSON'] }
  }
  return formatCheck(parsed)
}

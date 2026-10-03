// Progress_Store: all on-phone data lives here. See design.md, "Store".
// Requirements 8.1 and 8.2: no account, and every pack, progress record,
// Problem_Flag, and setting is kept only in IndexedDB on this phone.
//
// IndexedDB is the browser's built-in database. We reach it through the small
// `idb` package, which wraps the clunky browser API in promises.

import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import { APP_NAME } from '../config'
import type { StudyPack, MasteryRecord, Mode } from '../logic/types'
import type { Place } from '../logic/place'

// The four object stores, their keys, and the shape of each stored value.
// Settings keys: 'mode' (Mode), 'place' (Place).
interface StoreSchema extends DBSchema {
  packs:    { key: string; value: StudyPack }
  mastery:  { key: string; value: MasteryRecord }
  flags:    { key: string; value: true }
  settings: { key: string; value: Mode | Place }
}

// One database, created with all four stores at version 1, so no later
// upgrade is ever needed.
let dbPromise: Promise<IDBPDatabase<StoreSchema>> | null = null

function db() {
  if (dbPromise === null) {
    dbPromise = openDB<StoreSchema>(APP_NAME, 1, {
      upgrade(database) {
        database.createObjectStore('packs')
        database.createObjectStore('mastery')
        database.createObjectStore('flags')
        database.createObjectStore('settings')
      },
    })
  }
  return dbPromise
}

// ── Packs ────────────────────────────────────────────────────────────────

export async function getPack(id: string): Promise<StudyPack | undefined> {
  return (await db()).get('packs', id)
}

export async function putPack(pack: StudyPack): Promise<void> {
  await (await db()).put('packs', pack, pack.id)
}

export async function listPacks(): Promise<StudyPack[]> {
  return (await db()).getAll('packs')
}

// ── Mastery (keyed by pack id) ─────────────────────────────────────────────

export async function getMastery(packId: string): Promise<MasteryRecord | undefined> {
  return (await db()).get('mastery', packId)
}

export async function putMastery(packId: string, mastery: MasteryRecord): Promise<void> {
  await (await db()).put('mastery', mastery, packId)
}

// ── Problem_Flags (keyed by `${packId}:${questionId}`) ─────────────────────

export async function getFlags(packId: string): Promise<Set<string>> {
  const keys = await (await db()).getAllKeys('flags')
  const prefix = `${packId}:`
  const flagged = new Set<string>()
  for (const key of keys) {
    if (key.startsWith(prefix)) flagged.add(key.slice(prefix.length))
  }
  return flagged
}

export async function putFlag(packId: string, questionId: string): Promise<void> {
  await (await db()).put('flags', true, `${packId}:${questionId}`)
}

// ── Settings ───────────────────────────────────────────────────────────────

export async function getMode(): Promise<Mode | undefined> {
  return (await (await db()).get('settings', 'mode')) as Mode | undefined
}

export async function putMode(mode: Mode): Promise<void> {
  await (await db()).put('settings', mode, 'mode')
}

// The Place: the screen and Study_Session to reopen on.
export async function getPlace(): Promise<Place | undefined> {
  return (await (await db()).get('settings', 'place')) as Place | undefined
}

export async function putPlace(place: Place): Promise<void> {
  await (await db()).put('settings', place, 'place')
}

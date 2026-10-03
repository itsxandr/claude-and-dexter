// The Place: where the student is in the app. App saves it to the store on
// every move, so closing the app fully and opening it again lands on the same
// screen. Pure functions, no React, no storage.

import type { ReadingLevel, StudyPack } from './types'
import type { PathKind, SessionState } from './session'

export type Tab = 'lessons' | 'study' | 'progress'

export type Screen =
  | { name: 'lessons' }
  | { name: 'make_pack' }
  | { name: 'path_pick' }
  | { name: 'summary';    path: PathKind; level: ReadingLevel }
  | { name: 'question';   questionIndex: number; answeredCount: number }
  | { name: 'progress' }
  | { name: 'flashcards' };

export interface Place {
  screen: Screen
  tab: Tab
  packId: string | null        // the current pack, if any
  session: SessionState        // the Study_Session in progress
}

// Check a saved Place against the packs on this phone. Returns null when it
// no longer fits (nothing saved, the pack is gone, or the question is gone),
// so the app starts fresh on the Lessons screen instead.
export function checkPlace(saved: Place | undefined, packs: StudyPack[]): Place | null {
  if (saved === undefined) return null
  const { screen } = saved

  // These screens work with the saved packs, not one current pack.
  if (screen.name === 'lessons' || screen.name === 'make_pack') return saved

  const pack = packs.find(p => p.id === saved.packId)
  if (pack === undefined) return null

  if (screen.name === 'question') {
    const inRange = screen.questionIndex >= 0 && screen.questionIndex < pack.questions.length
    if (!inRange) return null
  }
  return saved
}

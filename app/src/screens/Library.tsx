import type { StudyPack } from '../logic/types'
import { LessonsScreen } from './LessonsScreen'

interface LibraryProps {
  // Saved packs read from the Progress_Store.
  packs: StudyPack[]
  // Open a saved pack for studying.
  onStudy: (packId: string) => void
  // Go to the Make Pack screen (the "Make a pack" button).
  onMakePack: () => void
}

/**
 * Library (design.md, Req 3.3): the first screen. It lists the saved Study_Packs
 * and offers "Make a pack". The visuals come straight from LessonsScreen so we
 * do not duplicate its markup or styling; here the file picker button routes to
 * the MakePack screen, which runs the real make-pack flow.
 */
export function Library({ packs, onStudy, onMakePack }: LibraryProps) {
  return <LessonsScreen packs={packs} onStudy={onStudy} onMakePack={onMakePack} />
}

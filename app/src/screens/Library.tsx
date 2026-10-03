import type { StudyPack } from '../logic/types'
import { packToJson } from '../logic/packJson'
import { PACK_EXTENSION } from '../config'
import { LessonsScreen } from './LessonsScreen'

interface LibraryProps {
  // Saved packs read from the Progress_Store.
  packs: StudyPack[]
  // Open a saved pack for studying.
  onStudy: (packId: string) => void
  // Go to the Make Pack screen (the "Make a pack" button).
  onMakePack: () => void
  // Import a Pack_File's text: parse, save, refresh the list. Returns whether
  // the file was a valid pack. The store work lives in App.
  onImport: (text: string) => Promise<boolean>
}

// A file-system-safe name for the shared Pack_File, e.g. "Water Cycle.studypack".
function safeName(title: string): string {
  const base = title.replace(/[^a-z0-9]+/gi, ' ').trim() || 'pack'
  return base + PACK_EXTENSION
}

// Turn a pack into a Pack_File and share it, or download it when the Web Share
// API cannot take files (for example on desktop).
async function sharePack(pack: StudyPack): Promise<void> {
  const json = packToJson(pack)
  const file = new File([json], safeName(pack.title), { type: 'application/json' })

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: pack.title })
      return
    } catch {
      // Cancelled or not allowed: fall through to a download.
    }
  }

  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Library (design.md, Req 3.3): the first screen. It lists the saved Study_Packs
 * and offers "Make a pack", "Open a pack file", and per-pack "Share". The visuals
 * come straight from LessonsScreen so we do not duplicate its markup or styling.
 */
export function Library({ packs, onStudy, onMakePack, onImport }: LibraryProps) {
  return (
    <LessonsScreen
      packs={packs}
      onStudy={onStudy}
      onMakePack={onMakePack}
      onOpenPack={onImport}
      onShare={(pack) => void sharePack(pack)}
    />
  )
}

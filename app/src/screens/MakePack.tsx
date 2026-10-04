import { useRef, useState } from 'react'
import './LessonsScreen.css'
import { makePack } from '../flow/makePack'
import type { MakePackFailReason } from '../flow/makePack'
import { extractPdf } from '../io/pdf'
import { fingerprint } from '../io/fingerprint'
import { getPack, putPack } from '../io/store'
import { requestDraft } from '../io/packClient'
import { useStrings } from '../i18n/language'

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'loading' | 'error'

interface MakePackProps {
  // Called with the new (or already-saved) pack id when a pack is ready.
  onDone: (packId: string) => void
  // Go back to the Library.
  onCancel: () => void
}

// The real make-pack flow wired to the browser IO: read the PDF, hash the
// text, check the store, ask the Pack_Service once. See src/flow/makePack.ts.
const deps = {
  extract: extractPdf,
  fingerprint,
  store: { getPack, putPack },
  requestDraft,
}

/**
 * MakePack (design.md, Req 2.1, 3.3, 3.10): pick a PDF, run the make-pack flow,
 * and open the pack. On any failure it shows one plain message with "Try again";
 * friendly per-reason messages come later (task 12).
 */
export function MakePack({ onDone, onCancel }: MakePackProps) {
  const strings = useStrings()
  const t = strings.makePack
  const [phase, setPhase] = useState<Phase>('idle')
  const [loadingName, setLoadingName] = useState('')
  // The failure, kept as a reason (not text) so it shows in the current language.
  // 'thrown' means a step threw, for example pdf.js on a file with no real text.
  const [failure, setFailure] = useState<MakePackFailReason | 'thrown'>('thrown')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function run(file: File) {
    setLoadingName(file.name)
    setPhase('loading')
    try {
      const result = await makePack(file, deps)
      if (result.ok) {
        onDone(result.pack.id)
        return
      }
      setFailure(result.reason)
      setPhase('error')
    } catch {
      // pdf.js or any step can throw on a broken file.
      setFailure('thrown')
      setPhase('error')
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // let the same file be picked again
    void run(file)
  }

  function openPicker() {
    setPhase('idle')
    fileInputRef.current?.click()
  }

  return (
    <main className="lessons-screen">
      {/* Hidden PDF-only file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="lessons-screen__file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={onFileChange}
      />

      {/* ── App header ── */}
      <header className="lessons-screen__appbar">
        <div className="lessons-screen__brand">
          <img src="/logo.png" alt="KodiGo" height={28} />
        </div>
      </header>

      <h1 className="lessons-screen__heading">{t.heading}</h1>

      {/* ── Info card ── */}
      <div className="lessons-screen__info-card">
        <p className="lessons-screen__info-title">
          {strings.lessons.internetTitle}
        </p>
        <p className="lessons-screen__info-body">
          {strings.lessons.internetBody}
        </p>
      </div>

      {phase === 'loading' ? (
        <div className="lessons-screen__loading">
          <span className="lessons-screen__spinner" aria-hidden="true" />
          <span className="lessons-screen__loading-name">{t.making(loadingName)}</span>
          <span className="lessons-screen__loading-note">
            {strings.lessons.keepInternet}
          </span>
        </div>
      ) : phase === 'error' ? (
        <>
          <div className="lessons-screen__error" role="alert">
            {failure === 'thrown' ? t.thrown : t.fail[failure]}
          </div>
          <button className="lessons-screen__pick-btn" onClick={openPicker}>
            <span className="lessons-screen__pick-plus" aria-hidden="true">↻</span>
            <span className="lessons-screen__pick-label">{t.tryAgain}</span>
            <span className="lessons-screen__pick-sub">PDF</span>
          </button>
          <button className="lessons-screen__open-btn" onClick={onCancel}>
            {t.backToLibrary}
          </button>
        </>
      ) : (
        <>
          {/* ── Dashed file picker ── */}
          <button
            className="lessons-screen__pick-btn"
            onClick={openPicker}
            aria-label={strings.lessons.pickAria}
          >
            <span className="lessons-screen__pick-plus" aria-hidden="true">+</span>
            <span className="lessons-screen__pick-label">{strings.lessons.pickLabel}</span>
            <span className="lessons-screen__pick-sub">PDF</span>
          </button>

          <button className="lessons-screen__open-btn" onClick={onCancel}>
            {t.backToLibrary}
          </button>
        </>
      )}
    </main>
  )
}

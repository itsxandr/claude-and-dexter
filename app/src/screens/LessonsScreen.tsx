import { useState, useRef } from 'react';
import './LessonsScreen.css';
import type { StudyPack } from '../logic/types'
import { useStrings } from '../i18n/language';
import { LanguageSwitch } from '../components/LanguageSwitch';

// ── Constants matching design.md error table ───────────────────────────────

/** 20 MB limit for Standard mode (Req 1.8) */
const SIZE_LIMIT_BYTES = 20 * 1024 * 1024;

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'loading' | 'error';

// Which error to show. Kept as data (not text) so it shows in the current
// language, even if the student switches language while it is on screen.
type LessonError =
  | { kind: 'notPdf' }
  | { kind: 'tooBig'; size: string; mode: string; limit: string }
  | { kind: 'notPack' };

interface LessonsScreenProps {
  packs: StudyPack[];
  onStudy: (packId: string) => void;
  /**
   * When set, the "Choose a file" button hands off to this instead of opening
   * the built-in picker. The Library screen uses it to route to MakePack, which
   * runs the real make-pack flow. Left unset, the stand-in picker is used.
   */
  onMakePack?: () => void;
  /**
   * When set, "Open a pack file" reads the file text and hands it off here. The
   * caller runs packFromJson + saves the pack, and returns whether it was a
   * valid pack. Left unset, the stand-in parser is used.
   */
  onOpenPack?: (text: string) => Promise<boolean>;
  /**
   * When set, each saved pack row shows a "Share" button that calls this. The
   * caller turns the pack into a Pack_File with packToJson and shares it.
   */
  onShare?: (pack: StudyPack) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Detect file type from name and leading bytes (mirrors design.md detectType) */
function detectType(name: string, firstBytes: Uint8Array): 'pdf' | 'pptx' | 'unsupported' {
  const isPdf  = firstBytes[0] === 0x25 && firstBytes[1] === 0x50 &&
                 firstBytes[2] === 0x44 && firstBytes[3] === 0x46; // %PDF
  const isPptx = name.toLowerCase().endsWith('.pptx') &&
                 firstBytes[0] === 0x50 && firstBytes[1] === 0x4B; // PK zip
  if (isPdf)  return 'pdf';
  if (isPptx) return 'pptx';
  return 'unsupported';
}

function mbStr(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Component ──────────────────────────────────────────────────────────────

/**
 * LessonsScreen  (design-ref 1a)
 *
 * File picker (PDF):
 *  - Checks type: "Please pick a PDF file."
 *  - Checks size (20 MB): "This file is X MB. The limit in Lite mode is 5 MB."
 *    or "…Standard mode is 20 MB." depending on data-mode attr. (design.md error table)
 *  - If OK → loading state → TODO: Xan's importer + packClient; for now goes to Path pick
 *    via onStudy after a short simulated delay.
 *
 * Open a pack file (.studypack):
 *  - JSON.parse + basic id check. Bad file → "This file is not a valid pack."
 *  - TODO: replace with Xan's packFromJson + formatCheck.
 */
export function LessonsScreen({ packs, onStudy, onMakePack, onOpenPack, onShare }: LessonsScreenProps) {
  const t = useStrings().lessons;
  const [phase, setPhase]   = useState<Phase>('idle');
  const [error, setError]   = useState<LessonError>({ kind: 'notPack' });
  const [loadingName, setLoadingName] = useState('');

  const lessonInputRef = useRef<HTMLInputElement>(null);
  const packInputRef   = useRef<HTMLInputElement>(null);

  // ── Lesson file picker ───────────────────────────────────────────────────

  async function handleLessonFile(file: File) {

    // Read first 8 bytes for magic-number check
    const slice = file.slice(0, 8);
    const buf   = await slice.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const type  = detectType(file.name, bytes);

    // Type check — exact text from design.md error table
    if (type === 'unsupported') {
      setError({ kind: 'notPdf' });
      setPhase('error');
      return;
    }

    // Size check — detect lite mode from html[data-mode]
    const isLite = document.documentElement.dataset.mode === 'lite';
    const limit  = isLite ? 5 * 1024 * 1024 : SIZE_LIMIT_BYTES;
    if (file.size > limit) {
      const modeLabel = isLite ? 'Lite' : 'Standard';
      setError({ kind: 'tooBig', size: mbStr(file.size), mode: modeLabel, limit: mbStr(limit) });
      setPhase('error');
      return;
    }

    // OK → loading state
    setLoadingName(file.name);
    setPhase('loading');

    // TODO: Replace with Xan's importer (pdf.ts / pptx.ts) + packClient.ts
    // For now: simulate a brief load, then open the mock pack via onStudy.
    await new Promise(r => setTimeout(r, 1200));
    setPhase('idle');
    onStudy('mock'); // passes any id; App.tsx uses the mock pack regardless
  }

  function onLessonChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so re-picking same file fires change again
    handleLessonFile(file);
  }

  // ── Pack file picker ─────────────────────────────────────────────────────

  async function handlePackFile(file: File) {

    // Real path: hand the file text to the caller, which runs packFromJson and
    // saves the pack. It returns whether the file was a valid pack.
    if (onOpenPack) {
      const text = await file.text();
      const ok = await onOpenPack(text);
      if (!ok) {
        setError({ kind: 'notPack' });
        setPhase('error');
      } else {
        setPhase('idle');
      }
      return;
    }

    // Stand-in path (no caller): a parseable JSON with an id is "valid".
    try {
      const text   = await file.text();
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null || !('id' in parsed)) {
        throw new Error('invalid');
      }
      setPhase('idle');
      onStudy(parsed.id as string);
    } catch {
      setError({ kind: 'notPack' });
      setPhase('error');
    }
  }

  function onPackChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    handlePackFile(file);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="lessons-screen">
      {/* Hidden file inputs */}
      <input
        ref={lessonInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="lessons-screen__file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={onLessonChange}
      />
      <input
        ref={packInputRef}
        type="file"
        accept=".studypack,application/json"
        className="lessons-screen__file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={onPackChange}
      />

      {/* ── App header ── */}
      <header className="lessons-screen__appbar">
        <div className="lessons-screen__brand">
          <img src="/logo.png" alt="KodiGo" height={28} />
        </div>
        <LanguageSwitch />
      </header>

      <h1 className="lessons-screen__heading">{t.heading}</h1>

      {/* ── Info card ── */}
      <div className="lessons-screen__info-card">
        <p className="lessons-screen__info-title">
          {t.internetTitle}
        </p>
        <p className="lessons-screen__info-body">
          {t.internetBody}
        </p>
      </div>

      {/* ── Error message ── */}
      {phase === 'error' && (
        <div className="lessons-screen__error" role="alert">
          {error.kind === 'tooBig'
            ? t.tooBig(error.size, error.mode, error.limit)
            : t[error.kind]}
        </div>
      )}

      {/* ── Loading state ── */}
      {phase === 'loading' ? (
        <div className="lessons-screen__loading">
          <span className="lessons-screen__spinner" aria-hidden="true" />
          <span className="lessons-screen__loading-name">{t.reading(loadingName)}</span>
          <span className="lessons-screen__loading-note">
            {t.keepInternet}
          </span>
        </div>
      ) : (
        <>
          {/* ── Dashed file picker ── */}
          <button
            className="lessons-screen__pick-btn"
            onClick={() => onMakePack ? onMakePack() : lessonInputRef.current?.click()}
            aria-label={t.pickAria}
          >
            <span className="lessons-screen__pick-plus" aria-hidden="true">+</span>
            <span className="lessons-screen__pick-label">{t.pickLabel}</span>
            <span className="lessons-screen__pick-sub">PDF</span>
          </button>

          {/* ── Open a pack file ── */}
          <button
            className="lessons-screen__open-btn"
            onClick={() => packInputRef.current?.click()}
          >
            {t.openPack}
          </button>
        </>
      )}

      {/* ── Your study packs ── */}
      {packs.length > 0 && (
        <section className="lessons-screen__packs">
          <h2 className="lessons-screen__packs-label">{t.yourPacks}</h2>
          <ul className="lessons-screen__pack-list">
            {packs.map(pack => (
              // One card per pack: the Study button on top, Share along the bottom.
              // They are two separate buttons (a button cannot hold another button).
              <li key={pack.id} className="lessons-screen__pack-card">
                <button
                  className="lessons-screen__pack-row"
                  onClick={() => onStudy(pack.id)}
                >
                  <span className="lessons-screen__pack-info">
                    <span className="lessons-screen__pack-name">{pack.title}</span>
                    <span className="lessons-screen__pack-meta">
                      {pack.id.startsWith('sample-') ? `${t.sample} · ` : ''}
                      {t.packMeta(pack.questions.length)}
                    </span>
                  </span>
                  <span className="lessons-screen__pack-study-btn" aria-hidden="true">
                    {t.study}
                  </span>
                </button>
                {onShare && (
                  <button
                    className="lessons-screen__pack-share"
                    onClick={() => onShare(pack)}
                    aria-label={t.shareAria(pack.title)}
                  >
                    {/* Share icon: arrow up out of a box */}
                    <svg
                      width="18" height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 3v12" />
                      <path d="M7 8l5-5 5 5" />
                      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
                    </svg>
                    {t.share}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

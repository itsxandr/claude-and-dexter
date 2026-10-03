import { useState, useRef } from 'react';
import './LessonsScreen.css';
import type { StudyPack } from '../logic/types'

// ── Constants matching design.md error table ───────────────────────────────

/** 20 MB limit for Standard mode (Req 1.8) */
const SIZE_LIMIT_BYTES = 20 * 1024 * 1024;

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'loading' | 'error';

interface LessonsScreenProps {
  packs: StudyPack[];
  onStudy: (packId: string) => void;
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
 * File picker (PDF / PPTX):
 *  - Checks type: "Please pick a PDF or PPTX file." (exact error text from design.md)
 *  - Checks size (20 MB): "This file is X MB. The limit in Lite mode is 5 MB."
 *    or "…Standard mode is 20 MB." depending on data-mode attr. (design.md error table)
 *  - If OK → loading state → TODO: Xan's importer + packClient; for now goes to Path pick
 *    via onStudy after a short simulated delay.
 *
 * Open a pack file (.studypack):
 *  - JSON.parse + basic id check. Bad file → "This file is not a valid pack."
 *  - TODO: replace with Xan's packFromJson + formatCheck.
 */
export function LessonsScreen({ packs, onStudy }: LessonsScreenProps) {
  const [phase, setPhase]   = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingName, setLoadingName] = useState('');

  const lessonInputRef = useRef<HTMLInputElement>(null);
  const packInputRef   = useRef<HTMLInputElement>(null);

  // ── Lesson file picker ───────────────────────────────────────────────────

  async function handleLessonFile(file: File) {
    setErrorMsg('');

    // Read first 8 bytes for magic-number check
    const slice = file.slice(0, 8);
    const buf   = await slice.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const type  = detectType(file.name, bytes);

    // Type check — exact text from design.md error table
    if (type === 'unsupported') {
      setErrorMsg('Please pick a PDF or PPTX file.');
      setPhase('error');
      return;
    }

    // Size check — detect lite mode from html[data-mode]
    const isLite = document.documentElement.dataset.mode === 'lite';
    const limit  = isLite ? 5 * 1024 * 1024 : SIZE_LIMIT_BYTES;
    if (file.size > limit) {
      const modeLabel = isLite ? 'Lite' : 'Standard';
      setErrorMsg(
        `This file is ${mbStr(file.size)}. The limit in ${modeLabel} mode is ${mbStr(limit)}.`,
      );
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
    setErrorMsg('');
    try {
      const text   = await file.text();
      const parsed = JSON.parse(text);
      // Basic check — a real pack must have an id field
      // TODO: Replace with Xan's packFromJson + formatCheck
      if (typeof parsed !== 'object' || parsed === null || !('id' in parsed)) {
        throw new Error('invalid');
      }
      // For now, treat any parseable JSON with an id as "valid" and go to study
      setPhase('idle');
      onStudy(parsed.id as string);
    } catch {
      setErrorMsg('This file is not a valid pack.');
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
        accept=".pdf,.pptx"
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

      {/* ── AppName header ── */}
      <header className="lessons-screen__appbar">
        <div className="lessons-screen__brand">
          <span className="lessons-screen__diamond" aria-hidden="true" />
          <span className="lessons-screen__appname">AppName</span>
        </div>
        <span className="lessons-screen__offline-chip">
          <span className="lessons-screen__offline-dot" aria-hidden="true" />
          Offline ready
        </span>
      </header>

      <h1 className="lessons-screen__heading">Add a lesson</h1>

      {/* ── Info card ── */}
      <div className="lessons-screen__info-card">
        <p className="lessons-screen__info-title">
          Needs internet once to make the pack.
        </p>
        <p className="lessons-screen__info-body">
          After that, study with no internet.
        </p>
      </div>

      {/* ── Error message ── */}
      {phase === 'error' && (
        <div className="lessons-screen__error" role="alert">
          {errorMsg}
        </div>
      )}

      {/* ── Loading state ── */}
      {phase === 'loading' ? (
        <div className="lessons-screen__loading">
          <span className="lessons-screen__spinner" aria-hidden="true" />
          <span className="lessons-screen__loading-name">Reading {loadingName}</span>
          <span className="lessons-screen__loading-note">
            Keep internet on until this finishes
          </span>
        </div>
      ) : (
        <>
          {/* ── Dashed file picker ── */}
          <button
            className="lessons-screen__pick-btn"
            onClick={() => lessonInputRef.current?.click()}
            aria-label="Choose a PDF or PPTX file from your phone"
          >
            <span className="lessons-screen__pick-plus" aria-hidden="true">+</span>
            <span className="lessons-screen__pick-label">Choose a file from your phone</span>
            <span className="lessons-screen__pick-sub">PDF or PowerPoint</span>
          </button>

          {/* ── Open a pack file ── */}
          <button
            className="lessons-screen__open-btn"
            onClick={() => packInputRef.current?.click()}
          >
            Open a pack file
          </button>
        </>
      )}

      {/* ── Your study packs ── */}
      {packs.length > 0 && (
        <section className="lessons-screen__packs">
          <h2 className="lessons-screen__packs-label">Your study packs</h2>
          <ul className="lessons-screen__pack-list">
            {packs.map(pack => (
              <li key={pack.id}>
                <button
                  className="lessons-screen__pack-row"
                  onClick={() => onStudy(pack.id)}
                >
                  <span className="lessons-screen__pack-info">
                    <span className="lessons-screen__pack-name">{pack.title}</span>
                    <span className="lessons-screen__pack-meta">
                      {pack.questions.length} questions · saved on phone
                    </span>
                  </span>
                  <span className="lessons-screen__pack-study-btn" aria-hidden="true">
                    Study
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

import './PathPickScreen.css';
import type { StudyPack } from '../logic/types'
import { useStrings } from '../i18n/language';

type PathKind = 'catchup' | 'practice';

interface PathPickScreenProps {
  pack: StudyPack;
  onPick: (path: PathKind) => void;
}

/**
 * PathPickScreen
 *
 * Shown when the student opens a pack. They choose Catch-up (Level 1)
 * or Practice (Level 2) before the session begins (Req 5.1–5.3).
 */
export function PathPickScreen({ pack, onPick }: PathPickScreenProps) {
  const t = useStrings().pathPick;

  return (
    <main className="path-pick">
      {/* Pack name */}
      <header className="path-pick__header">
        <h1 className="path-pick__title">{pack.title}</h1>
        <p className="path-pick__subtitle">
          {t.packMeta(pack.questions.length, pack.glossary.length)}
        </p>
      </header>

      <p className="path-pick__prompt">{t.prompt}</p>

      {/* Catch-up path */}
      <button
        className="path-pick__card path-pick__card--catchup"
        onClick={() => onPick('catchup')}
      >
        <span className="path-pick__card-badge">{t.catchupBadge}</span>
        <span className="path-pick__card-heading">{t.catchupHeading}</span>
        <span className="path-pick__card-desc">
          {t.catchupDesc}
        </span>
        <span className="path-pick__card-level">{t.startsAt(1)}</span>
      </button>

      {/* Practice path */}
      <button
        className="path-pick__card path-pick__card--practice"
        onClick={() => onPick('practice')}
      >
        <span className="path-pick__card-badge">{t.practiceBadge}</span>
        <span className="path-pick__card-heading">{t.practiceHeading}</span>
        <span className="path-pick__card-desc">
          {t.practiceDesc}
        </span>
        <span className="path-pick__card-level">{t.startsAt(2)}</span>
      </button>
    </main>
  );
}

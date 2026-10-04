import './ProgressScreen.css';
import type { Skill, StudyPack, MasteryRecord } from '../logic/types'
import { percent } from '../logic/mastery'
import { MasteryBar } from '../components/MasteryBar';
import { useStrings } from '../i18n/language';

// ── Types ──────────────────────────────────────────────────────────────────

interface ProgressScreenProps {
  pack: StudyPack;
  mastery: MasteryRecord;
  /** Called when "Study again" is tapped */
  onStudyAgain: () => void;
  /** Called when "Flashcards" is tapped (placeholder) */
  onFlashcards?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const SKILL_ORDER: Skill[] = ['main_idea', 'detail', 'vocabulary', 'inference'];

// ── Component ──────────────────────────────────────────────────────────────

/**
 * ProgressScreen
 *
 * App header, 4 MasteryBars, Study again, Flashcards (hidden if glossary empty).
 */
export function ProgressScreen({ pack, mastery, onStudyAgain, onFlashcards }: ProgressScreenProps) {
  const t = useStrings().progress;
  const totalAnswered = SKILL_ORDER.reduce((sum, s) => sum + mastery[s].answered, 0);
  const hasGlossary   = pack.glossary.length > 0;

  return (
    <main className="progress-screen">
      {/* ── App header ── */}
      <header className="progress-screen__appbar">
        <div className="progress-screen__brand">
          <img src="/logo.png" alt="KodiGo" height={28} />
        </div>
      </header>

      {/* ── Page heading ── */}
      <h1 className="progress-screen__heading">{t.heading}</h1>
      <p className="progress-screen__pack-name">{pack.title}</p>

      {/* ── Mastery card ── */}
      <div className="progress-screen__card">
        {SKILL_ORDER.map(skill => (
          <MasteryBar
            key={skill}
            label={t.skills[skill]}
            percent={percent(mastery[skill])}
          />
        ))}
      </div>

      {/* ── Summary line ── */}
      <p className="progress-screen__summary">
        {totalAnswered === 0
          ? t.none
          : t.answered(totalAnswered)}
      </p>

      {/* ── Actions ── */}
      <div className="progress-screen__actions">
        <button
          className="progress-screen__btn progress-screen__btn--primary"
          onClick={onStudyAgain}
        >
          {t.studyAgain}
        </button>

        {hasGlossary && (
          <button
            className="progress-screen__btn progress-screen__btn--outline"
            onClick={onFlashcards}
          >
            {t.flashcards}
          </button>
        )}
      </div>
    </main>
  );
}

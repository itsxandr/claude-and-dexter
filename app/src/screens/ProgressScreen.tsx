import './ProgressScreen.css';
import type { Skill, StudyPack, MasteryRecord } from '../logic/types'
import { percent } from '../logic/mastery'
import { MasteryBar } from '../components/MasteryBar';

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

const SKILL_LABELS: Record<Skill, string> = {
  main_idea:  'Main idea',
  detail:     'Detail',
  vocabulary: 'Vocabulary',
  inference:  'Inference',
};

const SKILL_ORDER: Skill[] = ['main_idea', 'detail', 'vocabulary', 'inference'];

// ── Component ──────────────────────────────────────────────────────────────

/**
 * ProgressScreen
 *
 * AppName header, 4 MasteryBars, Study again, Flashcards (hidden if glossary empty).
 */
export function ProgressScreen({ pack, mastery, onStudyAgain, onFlashcards }: ProgressScreenProps) {
  const totalAnswered = SKILL_ORDER.reduce((sum, s) => sum + mastery[s].answered, 0);
  const hasGlossary   = pack.glossary.length > 0;

  return (
    <main className="progress-screen">
      {/* ── AppName header ── */}
      <header className="progress-screen__appbar">
        <div className="progress-screen__brand">
          <span className="progress-screen__diamond" aria-hidden="true" />
          <span className="progress-screen__appname">AppName</span>
        </div>
        <span className="progress-screen__offline-chip">
          <span className="progress-screen__offline-dot" aria-hidden="true" />
          Offline ready
        </span>
      </header>

      {/* ── Page heading ── */}
      <h1 className="progress-screen__heading">Your progress</h1>
      <p className="progress-screen__pack-name">{pack.title}</p>

      {/* ── Mastery card ── */}
      <div className="progress-screen__card">
        {SKILL_ORDER.map(skill => (
          <MasteryBar
            key={skill}
            label={SKILL_LABELS[skill]}
            percent={percent(mastery[skill])}
          />
        ))}
      </div>

      {/* ── Summary line ── */}
      <p className="progress-screen__summary">
        {totalAnswered === 0
          ? 'No questions answered yet. Pick a path to start.'
          : `${totalAnswered} question${totalAnswered === 1 ? '' : 's'} answered across all sessions.`}
      </p>

      {/* ── Actions ── */}
      <div className="progress-screen__actions">
        <button
          className="progress-screen__btn progress-screen__btn--primary"
          onClick={onStudyAgain}
        >
          Study again
        </button>

        {hasGlossary && (
          <button
            className="progress-screen__btn progress-screen__btn--outline"
            onClick={onFlashcards}
          >
            Flashcards
          </button>
        )}
      </div>
    </main>
  );
}

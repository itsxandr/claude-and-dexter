import './PathPickScreen.css';
import type { StudyPack } from '../mock/samplePack';

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
  return (
    <main className="path-pick">
      {/* Pack name */}
      <header className="path-pick__header">
        <h1 className="path-pick__title">{pack.title}</h1>
        <p className="path-pick__subtitle">
          {pack.questions.length} questions · {pack.glossary.length} vocabulary cards
        </p>
      </header>

      <p className="path-pick__prompt">How do you want to study?</p>

      {/* Catch-up path */}
      <button
        className="path-pick__card path-pick__card--catchup"
        onClick={() => onPick('catchup')}
      >
        <span className="path-pick__card-badge">Catch-up</span>
        <span className="path-pick__card-heading">Start from the basics</span>
        <span className="path-pick__card-desc">
          Simple language, one idea at a time. Good if the lesson is new to you.
        </span>
        <span className="path-pick__card-level">Starts at Level 1</span>
      </button>

      {/* Practice path */}
      <button
        className="path-pick__card path-pick__card--practice"
        onClick={() => onPick('practice')}
      >
        <span className="path-pick__card-badge">Practice</span>
        <span className="path-pick__card-heading">Test what you know</span>
        <span className="path-pick__card-desc">
          Closer to the exam level. Good if you've already read the lesson.
        </span>
        <span className="path-pick__card-level">Starts at Level 2</span>
      </button>
    </main>
  );
}

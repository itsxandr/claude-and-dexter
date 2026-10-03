import { useState } from 'react';
import './FlashcardsScreen.css';
import type { StudyPack } from '../logic/types'
import { PackHeader } from '../components/PackHeader';
import { useStrings } from '../i18n/language';

interface FlashcardsScreenProps {
  pack: StudyPack;
  onBack: () => void;
}

/**
 * FlashcardsScreen  (design.md § Flashcards, Req 7.1–7.5)
 *
 * - English side shown first; tap card to flip to Filipino + meaning.
 * - "Got it"    → removes the front card (doneCount + 1).
 * - "Show again" → moves the front card to index 3 of the remaining queue,
 *                  or to the end when fewer than 3 cards remain.
 * - Every move resets `flipped` to false (English side first again).
 * - When queue is empty: show done state with card count.
 *
 * TODO: persist doneCount / progress to store.ts when that layer is ready.
 */
export function FlashcardsScreen({ pack, onBack }: FlashcardsScreenProps) {
  const strings = useStrings();
  const t       = strings.flashcards;

  // queue holds indices into pack.glossary
  const [queue, setQueue]       = useState<number[]>(() =>
    pack.glossary.map((_, i) => i),
  );
  const [flipped, setFlipped]   = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const isDone    = queue.length === 0;
  const cardIndex = queue[0];
  const card      = isDone ? null : pack.glossary[cardIndex];
  const total     = pack.glossary.length;

  // ── Actions ───────────────────────────────────────────────────────────────

  function handleFlip() {
    if (isDone) return;
    setFlipped(f => !f);
  }

  function handleGotIt() {
    if (isDone) return;
    setQueue(q => q.slice(1));       // remove front card
    setDoneCount(n => n + 1);
    setFlipped(false);
  }

  function handleShowAgain() {
    if (isDone) return;
    setQueue(q => {
      const [head, ...rest] = q;
      // If 3 or more cards remain after removing head, insert at index 3
      if (rest.length >= 3) {
        return [...rest.slice(0, 3), head, ...rest.slice(3)];
      }
      // Otherwise append to end
      return [...rest, head];
    });
    setFlipped(false);
  }

  // ── Done state ────────────────────────────────────────────────────────────

  if (isDone) {
    return (
      <>
        <PackHeader title={pack.title} onClose={onBack} />
        <div className="flashcards-done">
          <span className="flashcards-done__icon" aria-hidden="true">✓</span>
          <p className="flashcards-done__count">
            {t.done(doneCount)}
          </p>
          <p className="flashcards-done__sub">{t.doneSub}</p>
          <button className="flashcards-done__back" onClick={onBack}>
            {t.backToProgress}
          </button>
        </div>
      </>
    );
  }

  // ── Active state ──────────────────────────────────────────────────────────

  const progressLabel = strings.common.counter(doneCount + 1, total);
  const progress      = doneCount / total;

  return (
    <>
      <PackHeader
        title={pack.title}
        counter={progressLabel}
        progress={progress}
        onClose={onBack}
      />

      <div className="flashcards-screen">
        {/* Tap-to-flip card */}
        <button
          className={`flashcard${flipped ? ' flashcard--flipped' : ''}`}
          onClick={handleFlip}
          aria-label={flipped ? t.flipAriaBack : t.flipAriaFront}
        >
          <div className="flashcard__inner">
            {/* Front: English */}
            <div className="flashcard__face flashcard__face--front">
              <span className="flashcard__lang">{t.english}</span>
              <p className="flashcard__term">{card!.en}</p>
              <span className="flashcard__hint">{t.tapToFlip}</span>
            </div>
            {/* Back: Filipino + meaning */}
            <div className="flashcard__face flashcard__face--back">
              <span className="flashcard__lang">{t.filipino}</span>
              <p className="flashcard__term">{card!.fil}</p>
              <p className="flashcard__meaning">{card!.meaning}</p>
            </div>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flashcards-screen__actions">
          <button
            className="flashcards-screen__btn flashcards-screen__btn--again"
            onClick={handleShowAgain}
          >
            {t.showAgain}
          </button>
          <button
            className="flashcards-screen__btn flashcards-screen__btn--got-it"
            onClick={handleGotIt}
          >
            {t.gotIt}
          </button>
        </div>

        {/* Cards remaining */}
        <p className="flashcards-screen__remaining">
          {t.remaining(queue.length)}
        </p>
      </div>
    </>
  );
}

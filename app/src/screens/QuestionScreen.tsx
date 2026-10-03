import { useState, useCallback, useMemo } from 'react';
import './QuestionScreen.css';
import type { StudyPack } from '../logic/types'
import { coach } from '../logic/coach'
import { shuffledOrder } from '../logic/choiceOrder'
import { PackHeader } from '../components/PackHeader';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { ParagraphSheet } from '../components/ParagraphSheet';

// ── Types ──────────────────────────────────────────────────────────────────

type ReadingLevel = 1 | 2 | 3;
type FeedbackKind = 'hint' | 'reveal' | 'praise';

interface QuestionScreenProps {
  pack: StudyPack;
  /** Index into pack.questions for the current question */
  questionIndex: number;
  /** Total questions in this session (for the counter label) */
  sessionLength: number;
  /** How many questions have been answered so far in the session */
  answeredCount: number;
  /** Current reading level — displayed on the question screen */
  level: ReadingLevel;
  /** Called when the question is finished (right or 3rd wrong) */
  onFinish: (questionId: string, firstTryRight: boolean) => void;
  /** Called when "Report a problem" is tapped */
  onReport: (questionId: string) => void;
  /** Called when the × close button is tapped */
  onClose: () => void;
}

// ── Inner component (keyed externally so state resets per question) ────────

/**
 * QuestionScreen
 *
 * Coach ladder (design.md Req 6.1–6.4):
 *   1st wrong  → Hint 1  + "Try again"   (wrongTries becomes 1)
 *   2nd wrong  → Hint 2  + "Try again"   (wrongTries becomes 2)
 *   3rd wrong  → Reveal  + "Continue"    (wrongTries becomes 3)
 *   Correct    → Praise  + "Continue"
 *
 * State never leaks between questions because App.tsx passes
 * key={questionIndex}, forcing a full remount on each new question.
 *
 * TODO: Replace placeholder picking/level logic with Xan's session.ts.
 */
export function QuestionScreen({
  pack,
  questionIndex,
  sessionLength,
  answeredCount,
  level,
  onFinish,
  onReport,
  onClose,
}: QuestionScreenProps) {
  const question = pack.questions[questionIndex];

  // ── Per-question state (reset automatically via key= on parent) ──────────
  //
  // wrongTries: number of times the student has picked a wrong answer.
  // pickedIndex: the choice index the student last tapped (null = not yet).
  //
  // We store wrongTries separately from pickedIndex so we can clear
  // pickedIndex on "Try again" while keeping wrongTries accumulated.
  const [wrongTries, setWrongTries]     = useState(0);
  const [pickedIndex, setPickedIndex]   = useState<number | null>(null);
  const [openPara, setOpenPara]         = useState<number | null>(null);

  // order: the choice indexes in the order they are shown (A, B, C, D).
  // Picked once per showing, so the right answer is not always "A".
  // pickedIndex and answerIndex still use the pack's own indexes.
  const [order] = useState(() => shuffledOrder(question.choices.length));

  // ── Derived state ────────────────────────────────────────────────────────
  const hasPicked  = pickedIndex !== null;
  const isRight    = hasPicked && pickedIndex === question.answerIndex;
  const isWrong    = hasPicked && !isRight;

  // After 3 wrongs the answer is revealed; choices lock.
  const isRevealed = wrongTries >= 3;

  // Button labels / active state
  //   canContinue = right answer OR 3rd wrong (revealed)
  //   canRetry    = wrong but < 3 tries
  const canContinue = isRight || isRevealed;
  const canRetry    = isWrong && !isRevealed;

  let primaryLabel = 'Choose an answer';
  if (canContinue) primaryLabel = 'Continue';
  else if (canRetry) primaryLabel = 'Try again';

  // ── Feedback (from logic/coach.ts) ─────────────────────────────────────────
  //
  // Shown only when the student has picked something. `coach` takes the number
  // of wrong tries *before* this answer, so we subtract the pick we just made:
  // a wrong pick already bumped wrongTries, a right pick did not.
  //
  // useMemo keeps one coach result per answer, so the random praise message
  // stays the same across unrelated re-renders (like opening the paragraph sheet).
  const feedback = useMemo(() => {
    if (pickedIndex === null) return null;
    const wrongTriesBefore = isRight ? wrongTries : wrongTries - 1;
    return coach(question, wrongTriesBefore, pickedIndex);
  }, [question, pickedIndex, wrongTries, isRight]);

  let feedbackKind: FeedbackKind | null = null;
  let feedbackText = '';
  let feedbackParagraph = 1;
  let hintLabel = '';

  if (feedback !== null) {
    feedbackKind      = feedback.kind;
    feedbackParagraph = feedback.paragraph;
    if (feedback.kind === 'praise') {
      feedbackText = `${feedback.message} ${feedback.text}`;
    } else if (feedback.kind === 'hint') {
      hintLabel    = `Hint ${feedback.hintIndex + 1} of 2`;
      feedbackText = feedback.text;
    } else {
      feedbackText = feedback.text;
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleChoice(idx: number) {
    // Lock choices once revealed or correct
    if (isRight || isRevealed) return;

    setPickedIndex(idx);

    if (idx !== question.answerIndex) {
      setWrongTries(w => w + 1);
    }
  }

  function handlePrimary() {
    if (canContinue) {
      // firstTryRight = answered correctly with zero prior wrong tries
      const firstTryRight = isRight && wrongTries === 0;
      onFinish(question.id, firstTryRight);
      return;
    }
    if (canRetry) {
      // Clear the pick so the student can try again; keep wrongTries count
      setPickedIndex(null);
    }
  }

  const handleSeeInLesson = useCallback((n: number) => {
    setOpenPara(n);
  }, []);

  function handleReport() {
    onReport(question.id);
  }

  // ── Progress ──────────────────────────────────────────────────────────────
  const progress      = answeredCount / sessionLength;
  const counterLabel  = `${answeredCount + 1} of ${sessionLength}`;

  // ── Read-aloud text ───────────────────────────────────────────────────────
  const choiceLetters = ['A', 'B', 'C', 'D'];
  const readAloudText = [
    question.prompt,
    ...order.map((idx, pos) => `${choiceLetters[pos]}. ${question.choices[idx]}`),
  ].join('. ');

  // ── Choice appearance helpers ─────────────────────────────────────────────
  //
  // After reveal (wrongTries >= 3): correct answer shows green, others dim.
  // While retrying (pick cleared): all choices show as neutral.
  // After wrong pick (not yet revealed): only the picked choice shows state.

  function choiceClass(idx: number): string {
    const base = 'question-screen__choice';
    // No pick yet, no reveal → all neutral
    if (!hasPicked && !isRevealed) return base;
    if (isRight && idx === question.answerIndex) return `${base} ${base}--correct`;
    if (isRevealed && idx === question.answerIndex) return `${base} ${base}--correct`;
    // Only mark the wrong choice when a pick is currently showing
    if (hasPicked && isWrong && idx === pickedIndex) return `${base} ${base}--wrong`;
    // Dim all other choices whenever any answer is being shown
    if (hasPicked || isRevealed) return `${base} ${base}--dim`;
    return base;
  }

  function chipClass(idx: number): string {
    const base = 'question-screen__chip';
    if (isRight && idx === question.answerIndex) return `${base} ${base}--correct`;
    if (isRevealed && idx === question.answerIndex) return `${base} ${base}--correct`;
    if (hasPicked && isWrong && idx === pickedIndex) return `${base} ${base}--wrong`;
    return base;
  }

  // idx = the pack's choice index; pos = where it is shown (0 = "A").
  function chipLabel(idx: number, pos: number): string {
    if (isRight && idx === question.answerIndex) return '✓';
    if (isRevealed && idx === question.answerIndex) return '✓';
    if (hasPicked && isWrong && idx === pickedIndex) return '✕';
    return choiceLetters[pos];
  }

  // Choices are disabled only when right or fully revealed.
  // During hint/retry phase they must stay tappable.
  const choicesLocked = isRight || isRevealed;

  const levelBadge = `Level ${level}`;

  return (
    <>
      <PackHeader
        title={pack.title}
        counter={counterLabel}
        progress={progress}
        onClose={onClose}
        levelBadge={levelBadge}
      />

      <div className="question-screen">
        <div className="question-screen__scroll">

          {/* Question: full-width prompt, then Read aloud under it */}
          <div className="question-screen__question">
            <h1 className="question-screen__prompt">{question.prompt}</h1>
            <ReadAloudButton text={readAloudText} />
          </div>

          {/* Choices, in the shuffled order */}
          <div className="question-screen__choices" role="list">
            {order.map((idx, pos) => (
              <button
                key={idx}
                className={choiceClass(idx)}
                onClick={() => handleChoice(idx)}
                role="listitem"
                aria-pressed={hasPicked && pickedIndex === idx}
                disabled={choicesLocked}
              >
                <span className={chipClass(idx)} aria-hidden="true">
                  {chipLabel(idx, pos)}
                </span>
                <span className="question-screen__choice-text">{question.choices[idx]}</span>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedbackKind !== null && (
            <FeedbackPanel
              kind={feedbackKind}
              hintLabel={hintLabel || undefined}
              text={feedbackText}
              paragraph={feedbackParagraph}
              onSeeInLesson={handleSeeInLesson}
            />
          )}
        </div>

        {/* Footer */}
        <div className="question-screen__footer">
          <button
            className={`question-screen__primary${!hasPicked ? ' question-screen__primary--disabled' : ''}`}
            onClick={handlePrimary}
            disabled={!hasPicked}
            aria-disabled={!hasPicked}
          >
            {primaryLabel}
          </button>

          <button
            className="question-screen__report"
            onClick={handleReport}
            aria-label="Report a problem with this question"
          >
            Report a problem
          </button>
        </div>
      </div>

      {/* Paragraph sheet */}
      {openPara !== null && (() => {
        const para = pack.paragraphs.find(p => p.n === openPara);
        return para ? (
          <ParagraphSheet
            paragraphNumber={openPara}
            text={para.text}
            onClose={() => setOpenPara(null)}
          />
        ) : null;
      })()}
    </>
  );
}

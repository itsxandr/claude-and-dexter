import './FeedbackPanel.css';
import { useStrings } from '../i18n/language';

type FeedbackKind = 'hint' | 'reveal' | 'praise';

interface FeedbackPanelProps {
  kind: FeedbackKind;
  /** "Hint 1 of 2" / "Hint 2 of 2" / empty for praise/reveal */
  hintLabel?: string;
  /** Main feedback text */
  text: string;
  /** Source paragraph number for the "See in lesson ¶n" link */
  paragraph: number;
  /** Called when the user taps the "See in lesson ¶n" link */
  onSeeInLesson: (paragraphNumber: number) => void;
}

/**
 * FeedbackPanel
 *
 * Renders the coaching response after an answer:
 *   - hint   → amber card (Req 6.1 / 6.2)
 *   - reveal → amber card with correct answer exposed (Req 6.3)
 *   - praise → green card (Req 6.4)
 *
 * Always shows a "See in lesson ¶n" link that opens the ParagraphSheet (Req 6.5).
 */
export function FeedbackPanel({
  kind,
  hintLabel,
  text,
  paragraph,
  onSeeInLesson,
}: FeedbackPanelProps) {
  const t = useStrings().feedback;
  const isGreen = kind === 'praise';

  return (
    <div className={`feedback-panel feedback-panel--${kind}`} role="status" aria-live="polite">
      {/* Label row: "Correct!" or "Hint 1 of 2" */}
      {isGreen ? (
        <div className="feedback-panel__heading feedback-panel__heading--correct">{t.correct}</div>
      ) : hintLabel ? (
        <div className="feedback-panel__hint-label">{hintLabel}</div>
      ) : (
        <div className="feedback-panel__heading feedback-panel__heading--reveal">{t.reveal}</div>
      )}

      {/* Body text */}
      <p className="feedback-panel__text">{text}</p>

      {/* See in lesson link */}
      <button
        className="feedback-panel__see-link"
        onClick={() => onSeeInLesson(paragraph)}
        aria-label={t.seeInLessonAria(paragraph)}
      >
        {t.seeInLesson}{' '}¶{paragraph}
      </button>
    </div>
  );
}

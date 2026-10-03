import { useEffect } from 'react';
import './ParagraphSheet.css';
import { useStrings } from '../i18n/language';

interface ParagraphSheetProps {
  /** The paragraph number to display, e.g. 3 */
  paragraphNumber: number;
  /** The paragraph text */
  text: string;
  /** Called when the sheet should close */
  onClose: () => void;
}

/**
 * ParagraphSheet
 *
 * Bottom sheet that shows a single source paragraph when the student
 * taps "See in lesson ¶n" (Req 6.5 / 6.6).
 *
 * Trap focus inside and close on Escape for accessibility.
 * Backdrop tap also closes.
 */
export function ParagraphSheet({ paragraphNumber, text, onClose }: ParagraphSheetProps) {
  const t = useStrings().common;

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="para-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={t.paragraphAria(paragraphNumber)}
      onClick={onClose}
    >
      {/* Sheet panel — stop propagation so tapping inside doesn't close */}
      <div
        className="para-sheet"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (visual affordance) */}
        <div className="para-sheet__handle" aria-hidden="true" />

        {/* Header */}
        <div className="para-sheet__header">
          <span className="para-sheet__label">{t.fromLesson}</span>
          <button
            className="para-sheet__close"
            onClick={onClose}
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        {/* Paragraph marker + text */}
        <div className="para-sheet__para-num" aria-hidden="true">¶{paragraphNumber}</div>
        <p className="para-sheet__text">{text}</p>
      </div>
    </div>
  );
}

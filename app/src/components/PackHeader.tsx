import './PackHeader.css';

interface PackHeaderProps {
  title: string;
  counter?: string;
  progress?: number;
  onClose?: () => void;
  /** Optional small badge shown next to the title, e.g. "Level 2" */
  levelBadge?: string;
}

/**
 * PackHeader
 *
 * Shown at the top of every study-session screen.
 * Always renders the AI_Label ("AI-made, check with your teacher") per Req 6.7.
 * When `onClose` is provided, shows a close button (48 px tap target).
 */
export function PackHeader({ title, counter, progress = 0, onClose, levelBadge }: PackHeaderProps) {
  return (
    <header className="pack-header">
      {/* Row: close button + title + counter */}
      <div className="pack-header__row">
        {onClose ? (
          <button
            className="pack-header__close"
            onClick={onClose}
            aria-label="Close session"
          >
            ×
          </button>
        ) : (
          /* Spacer keeps title left-aligned even without a close button */
          <span className="pack-header__close-spacer" aria-hidden="true" />
        )}

        <div className="pack-header__meta">
          <div className="pack-header__title-row">
            <span className="pack-header__title">{title}</span>
            {levelBadge && (
              <span className="pack-header__level-badge">{levelBadge}</span>
            )}
            {counter && (
              <span className="pack-header__counter" aria-live="polite">
                {counter}
              </span>
            )}
          </div>

          {/* Progress bar — only shown when counter is present */}
          {counter !== undefined && (
            <div className="pack-header__bar-track" role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="pack-header__bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI label — always visible (Req 6.7) */}
      <div className="pack-header__ai-label" aria-label="AI-generated content notice">
        AI-made, check with your teacher
      </div>
    </header>
  );
}

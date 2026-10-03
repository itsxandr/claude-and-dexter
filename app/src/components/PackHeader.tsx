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
 * Shown at the top of every study-session screen. Two parts, top to bottom:
 *   1. Nav row:  close button, progress bar, counter ("3 of 8")
 *   2. Pack info: lesson title + level badge, then the AI_Label under it
 * Everything except the close button lines up on the same left edge as the
 * screen content below, so the eye reads straight down.
 *
 * Always renders the AI_Label ("AI-made, check with your teacher") per Req 6.7.
 * When `onClose` is provided, shows a close button (48 px tap target).
 */
export function PackHeader({ title, counter, progress = 0, onClose, levelBadge }: PackHeaderProps) {
  const hasProgress = counter !== undefined;

  return (
    <header className="pack-header">
      {/* 1. Nav row — only drawn when there is something to put in it */}
      {(onClose || hasProgress) && (
        <div className="pack-header__nav">
          {onClose ? (
            <button
              className="pack-header__close"
              onClick={onClose}
              aria-label="Close session"
            >
              ×
            </button>
          ) : (
            <span className="pack-header__close-spacer" aria-hidden="true" />
          )}

          {hasProgress && (
            <>
              <div className="pack-header__bar-track" role="progressbar"
                aria-label="Progress"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="pack-header__bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                />
              </div>
              <span className="pack-header__counter" aria-live="polite">
                {counter}
              </span>
            </>
          )}
        </div>
      )}

      {/* 2. Pack info: which lesson, which level, and the AI notice */}
      <div className="pack-header__info">
        <div className="pack-header__title-row">
          <span className="pack-header__title">{title}</span>
          {levelBadge && (
            <span className="pack-header__level-badge">{levelBadge}</span>
          )}
        </div>

        {/* AI label — always visible (Req 6.7) */}
        <p className="pack-header__ai-label" aria-label="AI-generated content notice">
          <svg
            className="pack-header__ai-icon"
            width="14" height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9.5" />
            <line x1="12" y1="11" x2="12" y2="16.5" />
            <line x1="12" y1="7.5" x2="12" y2="7.6" />
          </svg>
          AI-made, check with your teacher
        </p>
      </div>
    </header>
  );
}

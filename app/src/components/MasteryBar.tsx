import './MasteryBar.css';

interface MasteryBarProps {
  /** Skill label, e.g. "Main idea" */
  label: string;
  /** 0–100 percent */
  percent: number;
}

/**
 * MasteryBar
 *
 * One skill row: label on the left, percent on the right, filled bar below.
 * A skill with 0% shows "0% · not started yet" per design.md.
 */
export function MasteryBar({ label, percent }: MasteryBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const sublabel = clamped === 0 ? '0% · not started yet' : `${clamped}%`;

  return (
    <div className="mastery-bar">
      <div className="mastery-bar__header">
        <span className="mastery-bar__label">{label}</span>
        <span className="mastery-bar__pct">{sublabel}</span>
      </div>
      <div
        className="mastery-bar__track"
        role="progressbar"
        aria-label={`${label} mastery`}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="mastery-bar__fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

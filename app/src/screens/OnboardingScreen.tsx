import './OnboardingScreen.css';
import { useState } from 'react';

interface OnboardingScreenProps {
  onDone: () => void;
}

// One card per step. Short sentences and plain words for a student who reads
// below grade level.
const STEPS = [
  {
    heading: 'Welcome!',
    text: 'This app helps you understand your lesson, one small step at a time.',
  },
  {
    heading: 'Get your lesson',
    text: 'Tap "Choose a file from your phone" and pick the file your teacher sent. The app turns it into a study pack. You need internet for this step only.',
  },
  {
    heading: 'Study any time',
    text: 'Read a short summary, then answer questions. If you get one wrong, you get a hint. No internet needed.',
  },
  {
    heading: 'Your work is saved',
    text: 'You can close the app any time. When you come back, you start where you stopped.',
  },
];

/**
 * OnboardingScreen
 *
 * Shown once, the first time the app opens. App saves "onboarded" when the
 * student taps the last button or Skip, so it never shows again.
 */
export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const { heading, text } = STEPS[step];

  return (
    <main className="onboarding">
      {!isLast && (
        <button className="onboarding__skip" onClick={onDone}>
          Skip
        </button>
      )}

      <div className="onboarding__body">
        <h1 className="onboarding__heading">{heading}</h1>
        <p className="onboarding__text">{text}</p>
      </div>

      {/* Step dots: which card this is, out of how many */}
      <ol className="onboarding__dots" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <li
            key={s.heading}
            className={`onboarding__dot${i === step ? ' onboarding__dot--active' : ''}`}
            aria-hidden="true"
          />
        ))}
      </ol>

      <button
        className="onboarding__next"
        onClick={isLast ? onDone : () => setStep(step + 1)}
      >
        {isLast ? "Let's start" : 'Next'}
      </button>
    </main>
  );
}

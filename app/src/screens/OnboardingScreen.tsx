import './OnboardingScreen.css';
import { useState } from 'react';
import { useStrings } from '../i18n/language';
import { LanguageSwitch } from '../components/LanguageSwitch';

interface OnboardingScreenProps {
  onDone: () => void;
}

/**
 * OnboardingScreen
 *
 * Shown once, the first time the app opens. The first card picks the App
 * language; the text switches as soon as the student taps one. The other
 * cards explain the app in short, plain sentences. App saves "onboarded" when
 * the student taps the last button or Skip, so it never shows again.
 */
export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const t = useStrings().onboarding;
  const [step, setStep] = useState(0);

  // Card 0 is the language picker; the rest come from the strings.
  const total  = t.steps.length + 1;
  const isLast = step === total - 1;
  const card   = step === 0
    ? { heading: t.languageHeading, text: t.languageText }
    : t.steps[step - 1];

  return (
    <main className="onboarding">
      {!isLast && (
        <button className="onboarding__skip" onClick={onDone}>
          {t.skip}
        </button>
      )}

      <div className="onboarding__body">
        <h1 className="onboarding__heading">{card.heading}</h1>
        <p className="onboarding__text">{card.text}</p>
        {step === 0 && <LanguageSwitch large />}
      </div>

      {/* Step dots: which card this is, out of how many */}
      <ol className="onboarding__dots" aria-label={t.stepOf(step + 1, total)}>
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            className={`onboarding__dot${i === step ? ' onboarding__dot--active' : ''}`}
            aria-hidden="true"
          />
        ))}
      </ol>

      <button
        className="onboarding__next"
        onClick={isLast ? onDone : () => setStep(step + 1)}
      >
        {isLast ? t.start : t.next}
      </button>
    </main>
  );
}

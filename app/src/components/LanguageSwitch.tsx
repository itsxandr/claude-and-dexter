import './LanguageSwitch.css';
import { useLanguage, useStrings } from '../i18n/language';
import { LANGUAGE_NAMES } from '../i18n/strings';
import type { Language } from '../i18n/strings';

interface LanguageSwitchProps {
  /** Big full-width buttons, for the onboarding language card */
  large?: boolean;
}

const LANGUAGES: Language[] = ['en', 'tl'];

/**
 * LanguageSwitch
 *
 * "English | Tagalog". Tapping one changes the App language right away and
 * saves it. Each name is written in its own language, so a student can always
 * find theirs.
 */
export function LanguageSwitch({ large = false }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage();
  const t = useStrings();

  return (
    <div
      className={`lang-switch${large ? ' lang-switch--large' : ''}`}
      role="group"
      aria-label={t.languageLabel}
    >
      {LANGUAGES.map(code => (
        <button
          key={code}
          lang={code}
          className={`lang-switch__btn${language === code ? ' lang-switch__btn--active' : ''}`}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
        >
          {LANGUAGE_NAMES[code]}
        </button>
      ))}
    </div>
  );
}

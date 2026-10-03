import { useState, useEffect } from 'react';
import './ReadAloudButton.css';
import { useStrings } from '../i18n/language';

interface ReadAloudButtonProps {
  /** Text to speak. For a question, pass prompt + choices joined by the caller. */
  text: string;
}

/**
 * ReadAloudButton
 *
 * Uses the browser's speechSynthesis API (io/speech.ts equivalent).
 * Hidden when no speech voices are available (Req 5.12).
 * Stops quietly on failure — no error popup (Req 8.7).
 * Prefers local-service voices so it works offline (design.md).
 */
export function ReadAloudButton({ text }: ReadAloudButtonProps) {
  const t = useStrings().common;
  const [hasVoice, setHasVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  /* Voices can load late on Android — wait for the voiceschanged event */
  useEffect(() => {
    function checkVoices() {
      const voices = window.speechSynthesis?.getVoices() ?? [];
      setHasVoice(voices.length > 0);
    }

    checkVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', checkVoices);

    // Fallback: check again after 1 s in case the event never fires
    const t = setTimeout(checkVoices, 1000);

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', checkVoices);
      clearTimeout(t);
    };
  }, []);

  if (!hasVoice) return null;

  function handleClick() {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Prefer a local (offline-capable) voice
    const voices = synth.getVoices();
        // Lesson text is English, so use an English voice.
    const english = voices.filter(v => v.lang.startsWith('en'));
    const local = english.find(v => v.localService) ?? english[0];
    utterance.lang = 'en-US';
    if (local) utterance.voice = local;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      // Stops quietly — no error shown (Req 8.7)
      setSpeaking(false);
    };

    try {
      synth.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  }

  return (
    <button
      className={`read-aloud-btn${speaking ? ' read-aloud-btn--active' : ''}`}
      onClick={handleClick}
      aria-label={speaking ? t.stopAria : t.readAloud}
      aria-pressed={speaking}
    >
      {/* Speaker icon */}
      <svg
        className="read-aloud-btn__icon"
        width="20" height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        {speaking
          ? <line x1="18" y1="6" x2="18" y2="18" />   /* "stop" bar */
          : <path d="M16.5 8.5a5 5 0 0 1 0 7" />        /* sound wave */
        }
      </svg>
      <span>{speaking ? t.stop : t.readAloud}</span>
    </button>
  );
}

import './SummaryScreen.css';
import type { StudyPack } from '../logic/types'
import { PackHeader } from '../components/PackHeader';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { ParagraphSheet } from '../components/ParagraphSheet';
import { useState } from 'react';
import { useStrings } from '../i18n/language';
import { STRINGS } from '../i18n/strings';

type ReadingLevel = 1 | 2 | 3;

interface SummaryScreenProps {
  pack: StudyPack;
  level: ReadingLevel;
  onStart: () => void;
  onClose: () => void;
}

/**
 * SummaryScreen
 *
 * Shows the Lesson_Summary at the session's starting ReadingLevel before
 * any questions are shown (Req 5.4). The summary links to its source
 * paragraphs; tapping one opens the ParagraphSheet (Req 6.5 / 6.6).
 */
export function SummaryScreen({ pack, level, onStart, onClose }: SummaryScreenProps) {
  const t = useStrings().summary;
  const [openPara, setOpenPara] = useState<number | null>(null);

  const summary = pack.summaries.find(s => s.level === level)!;

  /* Build the read-aloud text: summary + paragraph numbers */
  // Spoken in English in every App language: read-aloud uses an English voice
  // because the lesson text is English.
  const readAloudText = `${STRINGS.en.summary.heading}. ${summary.text}`;

  return (
    <>
      <PackHeader
        title={pack.title}
        onClose={onClose}
      />

      <main className="summary-screen">
        {/* Level pill */}
        <span className="summary-screen__level-pill">{t.levels[level]}</span>

        <h1 className="summary-screen__heading">{t.heading}</h1>

        {/* Read aloud above summary text */}
        <ReadAloudButton text={readAloudText} />
        <p className="summary-screen__text">{summary.text}</p>

        {/* Source paragraph links */}
        <div className="summary-screen__para-links">
          <span className="summary-screen__para-links-label">{t.from}</span>
          {summary.paragraphs.map(n => (
            <button
              key={n}
              className="summary-screen__para-link"
              onClick={() => setOpenPara(n)}
              aria-label={t.paragraphAria(n)}
            >
              ¶{n}
            </button>
          ))}
        </div>

        {/* Start CTA */}
        <div className="summary-screen__footer">
          <button className="summary-screen__start-btn" onClick={onStart}>
            {t.start}
          </button>
        </div>
      </main>

      {/* Paragraph bottom sheet */}
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

import './SummaryScreen.css';
import type { StudyPack } from '../logic/types'
import { PackHeader } from '../components/PackHeader';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { ParagraphSheet } from '../components/ParagraphSheet';
import { useState } from 'react';

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
  const [openPara, setOpenPara] = useState<number | null>(null);

  const summary = pack.summaries.find(s => s.level === level)!;

  const levelLabel: Record<ReadingLevel, string> = {
    1: 'Level 1 · Catch-up',
    2: 'Level 2 · Practice',
    3: 'Level 3 · Grade level',
  };

  /* Build the read-aloud text: summary + paragraph numbers */
  const readAloudText = `Lesson summary. ${summary.text}`;

  return (
    <>
      <PackHeader
        title={pack.title}
        onClose={onClose}
      />

      <main className="summary-screen">
        {/* Level pill */}
        <span className="summary-screen__level-pill">{levelLabel[level]}</span>

        <h1 className="summary-screen__heading">Lesson summary</h1>

        {/* Read aloud above summary text */}
        <ReadAloudButton text={readAloudText} />
        <p className="summary-screen__text">{summary.text}</p>

        {/* Source paragraph links */}
        <div className="summary-screen__para-links">
          <span className="summary-screen__para-links-label">From:</span>
          {summary.paragraphs.map(n => (
            <button
              key={n}
              className="summary-screen__para-link"
              onClick={() => setOpenPara(n)}
              aria-label={`See paragraph ${n} from the lesson`}
            >
              ¶{n}
            </button>
          ))}
        </div>

        {/* Start CTA */}
        <div className="summary-screen__footer">
          <button className="summary-screen__start-btn" onClick={onStart}>
            Start studying
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

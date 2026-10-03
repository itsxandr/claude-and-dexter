import { useState, useCallback } from 'react';
import './App.css';

import { samplePack } from './mock/samplePack';
import type { Skill, ReadingLevel, StudyPack, MasteryRecord } from './logic/types'
import { PathPickScreen }    from './screens/PathPickScreen';
import { SummaryScreen }     from './screens/SummaryScreen';
import { QuestionScreen }    from './screens/QuestionScreen';
import { ProgressScreen }    from './screens/ProgressScreen';
import { LessonsScreen }     from './screens/LessonsScreen';
import { FlashcardsScreen }  from './screens/FlashcardsScreen';

// ── Types ──────────────────────────────────────────────────────────────────

type PathKind     = 'catchup' | 'practice';
type Tab          = 'lessons' | 'study' | 'progress';

type Screen =
  | { name: 'lessons' }
  | { name: 'path_pick' }
  | { name: 'summary';    path: PathKind; level: ReadingLevel }
  | { name: 'question';   path: PathKind; level: ReadingLevel;
      questionIndex: number; answeredCount: number }
  | { name: 'progress' }
  | { name: 'flashcards' };

const EMPTY_MASTERY: MasteryRecord = {
  main_idea:  { answered: 0, firstTryRight: 0 },
  detail:     { answered: 0, firstTryRight: 0 },
  vocabulary: { answered: 0, firstTryRight: 0 },
  inference:  { answered: 0, firstTryRight: 0 },
};

const SESSION_LENGTH = 8;

// ── Session logic placeholder (TODO: replace with Xan's session.ts) ────────

/**
 * TODO: Replace with session.ts → pickNext()
 *
 * Rules (design.md):
 *  - Pick Available_Question at current level first.
 *  - If none, pick the nearest level (distance 1 before distance 2).
 *  - When levels 1 and 3 tie (current = 2), prefer level 1.
 *  - Inside a level, first in pack order.
 *  - Available = not in answeredIds, not flagged.
 */
function sessionPickNext(
  pack: StudyPack,
  answeredIds: string[],
  level: ReadingLevel,
  flagged: Set<string>,
): number | null {
  const available = pack.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => !answeredIds.includes(q.id) && !flagged.has(q.id));

  if (available.length === 0) return null;

  // Try levels in preference order: current, then by ascending distance.
  // When distance is equal (only possible when current=2: levels 1 and 3),
  // prefer 1 over 3 per spec.
  const levelPreference: ReadingLevel[] = level === 1 ? [1, 2, 3]
    : level === 2 ? [2, 1, 3]
    : [3, 2, 1];

  for (const l of levelPreference) {
    const atLevel = available.filter(({ q }) => q.level === l);
    if (atLevel.length > 0) return atLevel[0].i; // first in pack order
  }
  return null;
}

/**
 * TODO: Replace with mastery.ts → recordAnswer()
 */
function sessionRecordAnswer(
  mastery: MasteryRecord,
  skill: Skill,
  firstTryRight: boolean,
): MasteryRecord {
  const prev = mastery[skill];
  return {
    ...mastery,
    [skill]: {
      answered:      prev.answered + 1,
      firstTryRight: prev.firstTryRight + (firstTryRight ? 1 : 0),
    },
  };
}

/**
 * TODO: Replace with session.ts level-adaptation logic.
 *
 * Rules (design.md):
 *  - 3 first-try rights in a row  → level up   (max 3), reset rightStreak
 *  - 2 first-try wrongs in a row  → level down (min 1), reset wrongStreak
 *  - Level stays in 1..3.
 */
function sessionAdaptLevel(
  level: ReadingLevel,
  rightStreak: number,
  wrongStreak: number,
): { level: ReadingLevel; rightStreak: number; wrongStreak: number } {
  if (rightStreak >= 3) {
    return {
      level: Math.min(3, level + 1) as ReadingLevel,
      rightStreak: 0,
      wrongStreak,
    };
  }
  if (wrongStreak >= 2) {
    return {
      level: Math.max(1, level - 1) as ReadingLevel,
      rightStreak,
      wrongStreak: 0,
    };
  }
  return { level, rightStreak, wrongStreak };
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]           = useState<Screen>({ name: 'lessons' });
  const [activeTab, setActiveTab]     = useState<Tab>('lessons');
  const [mastery, setMastery]         = useState<MasteryRecord>(EMPTY_MASTERY);
  const [flagged]                     = useState<Set<string>>(new Set());
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [rightStreak, setRightStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function resetSession() {
    setAnsweredIds([]);
    setRightStreak(0);
    setWrongStreak(0);
  }

  // ── Tab navigation ────────────────────────────────────────────────────────

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'lessons')  setScreen({ name: 'lessons' });
    if (tab === 'study')    setScreen({ name: 'path_pick' });
    if (tab === 'progress') setScreen({ name: 'progress' });
  }

  // ── Screen transitions ────────────────────────────────────────────────────

  function handleStudyFromLesson() {
    resetSession();
    setActiveTab('study');
    setScreen({ name: 'path_pick' });
  }

  function handlePathPick(path: PathKind) {
    const level: ReadingLevel = path === 'catchup' ? 1 : 2;
    resetSession();
    setActiveTab('study');
    setScreen({ name: 'summary', path, level });
  }

  function handleSummaryStart(path: PathKind, level: ReadingLevel) {
    const nextIdx = sessionPickNext(samplePack, [], level, flagged);
    if (nextIdx === null) {
      setScreen({ name: 'progress' });
      setActiveTab('progress');
      return;
    }
    setScreen({ name: 'question', path, level, questionIndex: nextIdx, answeredCount: 0 });
  }

  const handleQuestionFinish = useCallback((
    questionId: string,
    firstTryRight: boolean,
  ) => {
    if (screen.name !== 'question') return;
    const { path, answeredCount } = screen;
    let { level } = screen;

    // Record mastery for this question's specific skill
    const question = samplePack.questions.find(q => q.id === questionId)!;
    setMastery(m => sessionRecordAnswer(m, question.skill as Skill, firstTryRight));

    // Update streaks
    const newRight = firstTryRight ? rightStreak + 1 : 0;
    const newWrong = !firstTryRight ? wrongStreak + 1 : 0;

    // Adapt level per streak rules
    const adapted = sessionAdaptLevel(level, newRight, newWrong);
    level = adapted.level;
    setRightStreak(adapted.rightStreak);
    setWrongStreak(adapted.wrongStreak);

    // Mark this question done
    const newAnswered      = [...answeredIds, questionId];
    const newAnsweredCount = answeredCount + 1;
    setAnsweredIds(newAnswered);

    // End at exactly SESSION_LENGTH (8)
    if (newAnsweredCount >= SESSION_LENGTH) {
      setScreen({ name: 'progress' });
      setActiveTab('progress');
      return;
    }

    // Pick next at the (possibly adapted) level
    const nextIdx = sessionPickNext(samplePack, newAnswered, level, flagged);
    if (nextIdx === null) {
      setScreen({ name: 'progress' });
      setActiveTab('progress');
      return;
    }

    setScreen({
      name: 'question', path, level,
      questionIndex: nextIdx,
      answeredCount: newAnsweredCount,
    });
  }, [screen, answeredIds, rightStreak, wrongStreak, flagged]);

  const handleReport = useCallback((questionId: string) => {
    // TODO: write flag to store.ts, call session.ts skipFlagged()
    // Reported questions don't count toward SESSION_LENGTH.
    if (screen.name !== 'question') return;
    const { path, level, answeredCount } = screen;

    const newAnswered = [...answeredIds, questionId];
    setAnsweredIds(newAnswered);

    const nextIdx = sessionPickNext(samplePack, newAnswered, level, flagged);
    if (nextIdx === null || answeredCount >= SESSION_LENGTH) {
      setScreen({ name: 'progress' });
      setActiveTab('progress');
      return;
    }

    setScreen({
      name: 'question', path, level,
      questionIndex: nextIdx,
      answeredCount, // not incremented — reported doesn't count toward 8
    });
  }, [screen, answeredIds, flagged]);

  function handleClose() {
    setScreen({ name: 'path_pick' });
    setActiveTab('study');
  }

  function handleStudyAgain() {
    resetSession();
    setScreen({ name: 'path_pick' });
    setActiveTab('study');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  function renderScreen() {
    switch (screen.name) {

      case 'lessons':
        return <LessonsScreen packs={[samplePack]} onStudy={handleStudyFromLesson} />;

      case 'path_pick':
        return <PathPickScreen pack={samplePack} onPick={handlePathPick} />;

      case 'summary':
        return (
          <SummaryScreen
            pack={samplePack}
            level={screen.level}
            onStart={() => handleSummaryStart(screen.path, screen.level)}
            onClose={handleClose}
          />
        );

      case 'question':
        return (
          // key= forces full remount on each new question — resets all local state
          <QuestionScreen
            key={screen.questionIndex}
            pack={samplePack}
            questionIndex={screen.questionIndex}
            sessionLength={SESSION_LENGTH}
            answeredCount={screen.answeredCount}
            level={screen.level}
            onFinish={handleQuestionFinish}
            onReport={handleReport}
            onClose={handleClose}
          />
        );

      case 'progress':
        return (
          <ProgressScreen
            pack={samplePack}
            mastery={mastery}
            onStudyAgain={handleStudyAgain}
            onFlashcards={() => setScreen({ name: 'flashcards' })}
          />
        );

      case 'flashcards':
        return (
          <FlashcardsScreen
            pack={samplePack}
            onBack={() => setScreen({ name: 'progress' })}
          />
        );
    }
  }

  const hideTabs = screen.name === 'question' || screen.name === 'summary'
                || screen.name === 'flashcards';

  return (
    <>
      <div className="app-content">{renderScreen()}</div>

      {!hideTabs && (
        <nav className="bottom-tabs" aria-label="Main navigation">
          {(['lessons', 'study', 'progress'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`bottom-tabs__tab${activeTab === tab ? ' bottom-tabs__tab--active' : ''}`}
              onClick={() => handleTabPress(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              <span className="bottom-tabs__indicator" aria-hidden="true" />
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}

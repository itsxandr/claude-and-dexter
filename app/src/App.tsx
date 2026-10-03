import { useState, useCallback } from 'react';
import './App.css';

import { samplePack } from './mock/samplePack';
import type { Skill, ReadingLevel, MasteryRecord } from './logic/types'
import { emptyMastery, recordAnswer } from './logic/mastery'
import type { PathKind, SessionState } from './logic/session'
import { startSession, pickNext, answer, skipFlagged } from './logic/session'
import { PathPickScreen }    from './screens/PathPickScreen';
import { SummaryScreen }     from './screens/SummaryScreen';
import { QuestionScreen }    from './screens/QuestionScreen';
import { ProgressScreen }    from './screens/ProgressScreen';
import { LessonsScreen }     from './screens/LessonsScreen';
import { FlashcardsScreen }  from './screens/FlashcardsScreen';

// ── Types ──────────────────────────────────────────────────────────────────

type Tab          = 'lessons' | 'study' | 'progress';

type Screen =
  | { name: 'lessons' }
  | { name: 'path_pick' }
  | { name: 'summary';    path: PathKind; level: ReadingLevel }
  | { name: 'question';   questionIndex: number; answeredCount: number }
  | { name: 'progress' }
  | { name: 'flashcards' };

const SESSION_LENGTH = 8;

// Index of a wrong choice for a question (choices always has 2–4 entries, so
// one wrong choice always exists). Used to replay a wrong answer into the
// session reducer when the Question finished without a first-try right.
function wrongChoice(answerIndex: number): number {
  return answerIndex === 0 ? 1 : 0;
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]       = useState<Screen>({ name: 'lessons' });
  const [activeTab, setActiveTab] = useState<Tab>('lessons');
  const [mastery, setMastery]     = useState<MasteryRecord>(emptyMastery());
  const [flagged]                 = useState<Set<string>>(new Set());
  const [session, setSession]     = useState<SessionState>(() => startSession('catchup'));

  // ── Tab navigation ────────────────────────────────────────────────────────

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'lessons')  setScreen({ name: 'lessons' });
    if (tab === 'study')    setScreen({ name: 'path_pick' });
    if (tab === 'progress') setScreen({ name: 'progress' });
  }

  // ── Screen transitions ────────────────────────────────────────────────────

  function handleStudyFromLesson() {
    setActiveTab('study');
    setScreen({ name: 'path_pick' });
  }

  function handlePathPick(path: PathKind) {
    const fresh = startSession(path);
    setSession(fresh);
    setActiveTab('study');
    setScreen({ name: 'summary', path, level: fresh.level });
  }

  // Open the question that the reducer picks next for `s`, or go to Progress
  // when the session is done or nothing is left to pick.
  function showNext(s: SessionState, answeredCount: number) {
    const next = s.done ? null : pickNext(samplePack, s, flagged);
    if (next === null) {
      setScreen({ name: 'progress' });
      setActiveTab('progress');
      return;
    }
    const questionIndex = samplePack.questions.findIndex(q => q.id === next.id);
    setScreen({ name: 'question', questionIndex, answeredCount });
  }

  function handleSummaryStart() {
    showNext(session, 0);
  }

  const handleQuestionFinish = useCallback((
    questionId: string,
    firstTryRight: boolean,
  ) => {
    if (screen.name !== 'question') return;
    const { answeredCount } = screen;

    const question = samplePack.questions.find(q => q.id === questionId)!;

    // Record mastery for this question's Skill.
    setMastery(m => recordAnswer(m, question.skill as Skill, firstTryRight));

    // Drive the session reducer to the finished state. A first-try right is one
    // right answer; any other finish is a first-try wrong, replayed until the
    // question finishes (on the third wrong). Both land on the same SessionState.
    let next = session
    if (firstTryRight) {
      next = answer(next, question, question.answerIndex).state
    } else {
      const wrong = wrongChoice(question.answerIndex)
      // Three wrong answers finish the question (reveal on the third).
      next = answer(next, question, wrong).state
      next = answer(next, question, wrong).state
      next = answer(next, question, wrong).state
    }

    setSession(next);
    showNext(next, answeredCount + 1);
  }, [screen, session, flagged]);

  const handleReport = useCallback((_questionId: string) => {
    // Reported questions don't count toward SESSION_LENGTH or change streaks.
    // TODO: persist the flag with store.ts (task 16).
    if (screen.name !== 'question') return;
    const { answeredCount } = screen;

    const next = skipFlagged(session, samplePack, flagged);
    setSession(next);
    showNext(next, answeredCount); // not incremented — reported doesn't count
  }, [screen, session, flagged]);

  function handleClose() {
    setScreen({ name: 'path_pick' });
    setActiveTab('study');
  }

  function handleStudyAgain() {
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
            onStart={handleSummaryStart}
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
            level={session.level}
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

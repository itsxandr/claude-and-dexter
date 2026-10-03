import { useState, useCallback, useEffect } from 'react';
import './App.css';

import type { Skill, ReadingLevel, StudyPack, MasteryRecord } from './logic/types'
import { emptyMastery, recordAnswer } from './logic/mastery'
import type { PathKind, SessionState } from './logic/session'
import { startSession, pickNext, answer, skipFlagged } from './logic/session'
import { listPacks, putPack, getMastery, putMastery } from './io/store'
import { packFromJson } from './logic/packJson'
import sampleStudyPack from '../fixtures/sample.studypack.json'
import { PathPickScreen }    from './screens/PathPickScreen';
import { SummaryScreen }     from './screens/SummaryScreen';
import { QuestionScreen }    from './screens/QuestionScreen';
import { ProgressScreen }    from './screens/ProgressScreen';
import { Library }           from './screens/Library';
import { MakePack }          from './screens/MakePack';
import { FlashcardsScreen }  from './screens/FlashcardsScreen';

// ── Types ──────────────────────────────────────────────────────────────────

type Tab          = 'lessons' | 'study' | 'progress';

type Screen =
  | { name: 'lessons' }
  | { name: 'make_pack' }
  | { name: 'path_pick' }
  | { name: 'summary';    path: PathKind; level: ReadingLevel }
  | { name: 'question';   questionIndex: number; answeredCount: number }
  | { name: 'progress' }
  | { name: 'flashcards' };

const SESSION_LENGTH = 8;

// Dev seed: the hand-written fixture, saved once on first run until the real
// make-pack flow exists. JSON has no literal types, so we assert the shape.
const SEED_PACK = sampleStudyPack as unknown as StudyPack

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
  const [packs, setPacks]         = useState<StudyPack[]>([]);
  const [pack, setPack]           = useState<StudyPack | null>(null);
  const [mastery, setMastery]     = useState<MasteryRecord>(emptyMastery());
  const [flagged]                 = useState<Set<string>>(new Set());
  const [session, setSession]     = useState<SessionState>(() => startSession('catchup'));

  // ── Load from the store on start ───────────────────────────────────────────
  //
  // Seed the fixture pack the first time (no packs yet), then read the pack
  // list and the current pack's mastery from the store.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved = await listPacks();
      if (saved.length === 0) {
        await putPack(SEED_PACK);
        saved = await listPacks();
      }
      if (cancelled) return;
      setPacks(saved);
      const first = saved[0] ?? null;
      setPack(first);
      if (first !== null) {
        const m = await getMastery(first.id);
        if (!cancelled) setMastery(m ?? emptyMastery());
      }
    })();
    return () => { cancelled = true };
  }, []);

  // ── Tab navigation ────────────────────────────────────────────────────────

  function handleTabPress(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'lessons')  setScreen({ name: 'lessons' });
    if (tab === 'study')    setScreen({ name: 'path_pick' });
    if (tab === 'progress') setScreen({ name: 'progress' });
  }

  // ── Screen transitions ────────────────────────────────────────────────────

  async function openPack(packId: string) {
    const chosen = packs.find(p => p.id === packId);
    if (chosen !== undefined) {
      setPack(chosen);
      const m = await getMastery(chosen.id);
      setMastery(m ?? emptyMastery());
    }
    setActiveTab('study');
    setScreen({ name: 'path_pick' });
  }

  function handleStudyFromLesson(packId: string) {
    void openPack(packId);
  }

  function handleMakePack() {
    setScreen({ name: 'make_pack' });
  }

  // Open a shared Pack_File: run it through packFromJson, and if it is a valid
  // pack, save it (same id replaces the old one) and refresh the list. Returns
  // whether the file was a valid pack so the Library can show an error if not.
  async function handleImportPack(text: string): Promise<boolean> {
    const result = packFromJson(text);
    if (!result.ok) return false;
    await putPack(result.pack);
    setPacks(await listPacks());
    return true;
  }

  // A pack was just made (or matched an existing one): refresh the list from
  // the store, then open it to study.
  async function handlePackMade(packId: string) {
    const saved = await listPacks();
    setPacks(saved);
    const chosen = saved.find(p => p.id === packId);
    if (chosen !== undefined) {
      setPack(chosen);
      const m = await getMastery(chosen.id);
      setMastery(m ?? emptyMastery());
    }
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
    if (pack === null) return;
    const next = s.done ? null : pickNext(pack, s, flagged);
    if (next === null) {
      setScreen({ name: 'progress' });
      setActiveTab('progress');
      return;
    }
    const questionIndex = pack.questions.findIndex(q => q.id === next.id);
    setScreen({ name: 'question', questionIndex, answeredCount });
  }

  function handleSummaryStart() {
    showNext(session, 0);
  }

  const handleQuestionFinish = useCallback((
    questionId: string,
    firstTryRight: boolean,
  ) => {
    if (screen.name !== 'question' || pack === null) return;
    const { answeredCount } = screen;

    const question = pack.questions.find(q => q.id === questionId)!;

    // Record mastery for this question's Skill and save it for this pack.
    const nextMastery = recordAnswer(mastery, question.skill as Skill, firstTryRight);
    setMastery(nextMastery);
    void putMastery(pack.id, nextMastery);

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
  }, [screen, session, pack, mastery, flagged]);

  const handleReport = useCallback((_questionId: string) => {
    // Reported questions don't count toward SESSION_LENGTH or change streaks.
    // TODO: persist the flag with store.ts (task 16).
    if (screen.name !== 'question' || pack === null) return;
    const { answeredCount } = screen;

    const next = skipFlagged(session, pack, flagged);
    setSession(next);
    showNext(next, answeredCount); // not incremented — reported doesn't count
  }, [screen, session, pack, flagged]);

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
    // The Library and Make Pack screens work with the saved packs; they do not
    // need a single "current" pack.
    if (screen.name === 'lessons') {
      return (
        <Library
          packs={packs}
          onStudy={handleStudyFromLesson}
          onMakePack={handleMakePack}
          onImport={handleImportPack}
        />
      );
    }

    if (screen.name === 'make_pack') {
      return (
        <MakePack
          onDone={(packId) => void handlePackMade(packId)}
          onCancel={() => setScreen({ name: 'lessons' })}
        />
      );
    }

    // Every other screen studies the current pack. Nothing to show until it
    // loads from the store.
    if (pack === null) return null;

    switch (screen.name) {

      case 'path_pick':
        return <PathPickScreen pack={pack} onPick={handlePathPick} />;

      case 'summary':
        return (
          <SummaryScreen
            pack={pack}
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
            pack={pack}
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
            pack={pack}
            mastery={mastery}
            onStudyAgain={handleStudyAgain}
            onFlashcards={() => setScreen({ name: 'flashcards' })}
          />
        );

      case 'flashcards':
        return (
          <FlashcardsScreen
            pack={pack}
            onBack={() => setScreen({ name: 'progress' })}
          />
        );
    }
  }

  const hideTabs = screen.name === 'question' || screen.name === 'summary'
                || screen.name === 'flashcards' || screen.name === 'make_pack';

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

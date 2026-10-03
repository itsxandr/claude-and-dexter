// The Study_Session reducer: pure functions, no React, no storage.
// A reducer is a function (state, event) -> newState. See design.md,
// "Study session", and requirements 5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 6.9.

import type { ReadingLevel, StudyPack, Question } from './types'
import { SESSION_LENGTH } from '../config'
import { coach } from './coach'
import type { Feedback } from './coach'

export type PathKind = 'catchup' | 'practice'

export interface SessionState {
  level: ReadingLevel          // always 1..3
  answeredIds: string[]        // questions finished this session
  rightStreak: number          // first-try rights in a row
  wrongStreak: number          // first-try wrongs in a row
  current: { questionId: string; wrongTries: number } | null
  done: boolean
}

// Catch-up starts easy (level 1), Practice starts at level 2.
export function startSession(path: PathKind): SessionState {
  return {
    level: path === 'catchup' ? 1 : 2,
    answeredIds: [],
    rightStreak: 0,
    wrongStreak: 0,
    current: null,
    done: false,
  }
}

// Questions still open this session: not finished and not flagged on this phone.
export function available(pack: StudyPack, s: SessionState, flagged: Set<string>): Question[] {
  return pack.questions.filter(q => !s.answeredIds.includes(q.id) && !flagged.has(q.id))
}

// The next Question: one at the current level, else the nearest level. When
// levels 1 and 3 are equally near (current level 2), level 1 wins, because an
// easier question is safer for a struggling reader. Inside a level, pack order.
export function pickNext(pack: StudyPack, s: SessionState, flagged: Set<string>): Question | null {
  const open = available(pack, s, flagged)
  if (open.length === 0) return null

  const levelPreference: ReadingLevel[] = s.level === 1 ? [1, 2, 3]
    : s.level === 2 ? [2, 1, 3]
    : [3, 2, 1]

  for (const level of levelPreference) {
    const atLevel = open.find(q => q.level === level)
    if (atLevel !== undefined) return atLevel
  }
  return null
}

// Record one answer for the current Question and return the coach Feedback.
// The first answer on a Question decides the streaks. A Question finishes when
// it is answered right, or on the third wrong answer; then it joins
// answeredIds and the level may change.
export function answer(
  s: SessionState,
  q: Question,
  choice: number,
): { state: SessionState; feedback: Feedback } {
  const wrongTriesBefore = s.current !== null && s.current.questionId === q.id
    ? s.current.wrongTries
    : 0
  const feedback = coach(q, wrongTriesBefore, choice)
  const isRight = choice === q.answerIndex
  const isFirstTry = wrongTriesBefore === 0

  // Streaks only move on the first answer to a Question.
  let rightStreak = s.rightStreak
  let wrongStreak = s.wrongStreak
  if (isFirstTry) {
    if (isRight) {
      rightStreak = s.rightStreak + 1
      wrongStreak = 0
    } else {
      wrongStreak = s.wrongStreak + 1
      rightStreak = 0
    }
  }

  const wrongTries = isRight ? wrongTriesBefore : wrongTriesBefore + 1
  const finished = isRight || wrongTries >= 3

  // Adapt the level on finish: 3 first-try rights in a row → level up (max 3);
  // 2 first-try wrongs in a row → level down (min 1). Reset the used streak.
  let level = s.level
  if (finished) {
    if (rightStreak >= 3) {
      level = Math.min(3, s.level + 1) as ReadingLevel
      rightStreak = 0
    } else if (wrongStreak >= 2) {
      level = Math.max(1, s.level - 1) as ReadingLevel
      wrongStreak = 0
    }
  }

  const answeredIds = finished ? [...s.answeredIds, q.id] : s.answeredIds
  const current = finished ? null : { questionId: q.id, wrongTries }
  const done = answeredIds.length >= SESSION_LENGTH

  return {
    state: { level, answeredIds, rightStreak, wrongStreak, current, done },
    feedback,
  }
}

// After "report a problem": drop the current Question without counting it. It
// does not change streaks, mastery, or the answered count. The session ends if
// nothing is left to pick.
export function skipFlagged(s: SessionState, pack: StudyPack, flagged: Set<string>): SessionState {
  const cleared: SessionState = { ...s, current: null }
  const next = pickNext(pack, cleared, flagged)
  return { ...cleared, done: next === null }
}

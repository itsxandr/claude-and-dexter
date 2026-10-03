// The Coach: plain code, no AI. It turns one answer into the feedback the
// student sees. See design.md, "Coach", and requirements 6.1–6.5.
//
// The ladder (based on how many wrong tries came before this answer):
//   right answer        → praise + Explanation
//   wrong, 0 before      → Hint 1
//   wrong, 1 before      → Hint 2
//   wrong, 2 or more      → reveal the Explanation and the correct answer
// Every feedback carries the number of the Source_Paragraph it points to, so
// the screen can show a "See in lesson ¶n" link.

import type { Question } from './types'

export type Feedback =
  | { kind: 'hint'; text: string; paragraph: number; hintIndex: 0 | 1 }
  | { kind: 'reveal'; correctIndex: number; text: string; paragraph: number }
  | { kind: 'praise'; message: string; text: string; paragraph: number }

// A small fixed list of praise messages. One is picked at random on a right
// answer. No AI, no stored state.
export const PRAISE = ['Great job!', 'Nicely done!', 'Correct!', 'You got it!', 'Well done!']

function randomPraise(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}

export function coach(q: Question, wrongTriesBefore: number, choice: number): Feedback {
  // Right answer: praise plus the Explanation.
  if (choice === q.answerIndex) {
    return {
      kind: 'praise',
      message: randomPraise(),
      text: q.explanation.text,
      paragraph: q.explanation.paragraph,
    }
  }

  // Wrong answer: first two tries give a Hint, the third reveals the answer.
  if (wrongTriesBefore === 0) {
    return {
      kind: 'hint',
      hintIndex: 0,
      text: q.hints[0].text,
      paragraph: q.hints[0].paragraph,
    }
  }

  if (wrongTriesBefore === 1) {
    return {
      kind: 'hint',
      hintIndex: 1,
      text: q.hints[1].text,
      paragraph: q.hints[1].paragraph,
    }
  }

  return {
    kind: 'reveal',
    correctIndex: q.answerIndex,
    text: q.explanation.text,
    paragraph: q.explanation.paragraph,
  }
}

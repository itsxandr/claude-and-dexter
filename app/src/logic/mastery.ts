// Mastery tracking. See design.md, requirements 7.6 and 7.7.
// A MasteryRecord holds, per Skill, how many Questions were answered and how
// many were right on the first try. The percent is the share of first-try
// rights, which is what each Mastery_Bar shows.

import type { Skill, MasteryRecord } from './types'

// A fresh record with every Skill at zero.
export function emptyMastery(): MasteryRecord {
  return {
    main_idea:  { answered: 0, firstTryRight: 0 },
    detail:     { answered: 0, firstTryRight: 0 },
    vocabulary: { answered: 0, firstTryRight: 0 },
    inference:  { answered: 0, firstTryRight: 0 },
  }
}

// Add one answer for a Skill. Returns a new record; never changes the old one.
export function recordAnswer(
  mastery: MasteryRecord,
  skill: Skill,
  firstTryRight: boolean,
): MasteryRecord {
  const prev = mastery[skill]
  return {
    ...mastery,
    [skill]: {
      answered:      prev.answered + 1,
      firstTryRight: prev.firstTryRight + (firstTryRight ? 1 : 0),
    },
  }
}

// Percent right on the first try for one Skill: 0 when nothing is answered,
// else round(100 × right / answered).
export function percent(record: { answered: number; firstTryRight: number }): number {
  if (record.answered === 0) return 0
  return Math.round((record.firstTryRight / record.answered) * 100)
}

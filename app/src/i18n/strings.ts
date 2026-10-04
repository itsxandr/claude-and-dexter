// Every piece of app text the student sees, in each App language.
// "i18n" is short for "internationalization": making an app work in more than
// one language. Lesson content (summaries, questions, hints) comes from the
// pack and is not translated here.
//
// `tl` is typed as `Strings`, so a missing Tagalog line is a build error.
// Text that needs a number or a name is a small function.

import type { ReadingLevel, Skill } from '../logic/types'
import type { Tab } from '../logic/place'

export type Language = 'en' | 'tl'

// Each language's own name, shown the same in both languages so a student can
// always find theirs.
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  tl: 'Tagalog',
}

const en = {
  tabs: { lessons: 'Lessons', study: 'Study', progress: 'Progress' } as Record<Tab, string>,
  languageLabel: 'Language',
  navLabel: 'Main navigation',

  onboarding: {
    languageHeading: 'Pick your language',
    languageText: 'You can change this later on the Lessons screen.',
    steps: [
      {
        heading: 'Welcome!',
        text: 'This app helps you understand your lesson, one small step at a time.',
      },
      {
        heading: 'Get your lesson',
        text: 'Tap "Choose a file from your phone" and pick the file your teacher sent. The app turns it into a study pack. You need internet for this step only.',
      },
      {
        heading: 'Study any time',
        text: 'Read a short summary, then answer questions. If you get one wrong, you get a hint. No internet needed.',
      },
      {
        heading: 'Your work is saved',
        text: 'You can close the app any time. When you come back, you start where you stopped.',
      },
    ],
    skip: 'Skip',
    next: 'Next',
    start: "Let's start",
    stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  },

  lessons: {
    heading: 'Add a lesson',
    internetTitle: 'Needs internet once to make the pack.',
    internetBody: 'After that, study with no internet.',
    reading: (name: string) => `Reading ${name}`,
    keepInternet: 'Keep internet on until this finishes',
    pickAria: 'Choose a PDF file from your phone',
    pickLabel: 'Choose a file from your phone',
    openPack: 'Open a pack file',
    yourPacks: 'Your study packs',
    sample: 'Sample',
    packMeta: (questions: number) => `${questions} questions · saved on phone`,
    study: 'Study',
    share: 'Share',
    shareAria: (title: string) => `Share ${title}`,
    notPdf: 'Please pick a PDF file.',
    tooBig: (size: string, mode: string, limit: string) =>
      `This file is ${size}. The limit in ${mode} mode is ${limit}.`,
    notPack: 'This file is not a valid pack.',
  },

  makePack: {
    heading: 'Make a pack',
    making: (name: string) => `Making a pack from ${name}`,
    tryAgain: 'Try again',
    backToLibrary: 'Back to library',
    fail: {
      too_long: 'This lesson is too long. Try a shorter file for now.',
      offline: 'Making a pack needs internet once. Turn it on and try again.',
      timeout: 'This is taking too long. Try again.',
      server: 'The pack service had a problem. Try again.',
      bad_json: 'The pack did not come out right. Try again.',
      bad_format: 'The pack did not come out right. Try again.',
      bad_coverage: 'The pack is missing some question types. Try again.',
    },
    thrown: 'We could not read this file. Pick a PDF with real text.',
  },

  pathPick: {
    packMeta: (questions: number, cards: number) =>
      `${questions} questions · ${cards} vocabulary cards`,
    prompt: 'How do you want to study?',
    catchupBadge: 'Catch-up',
    catchupHeading: 'Start from the basics',
    catchupDesc: 'Simple language, one idea at a time. Good if the lesson is new to you.',
    practiceBadge: 'Practice',
    practiceHeading: 'Test what you know',
    practiceDesc: "Closer to the exam level. Good if you've already read the lesson.",
    startsAt: (level: number) => `Starts at Level ${level}`,
  },

  summary: {
    levels: {
      1: 'Level 1 · Catch-up',
      2: 'Level 2 · Practice',
      3: 'Level 3 · Grade level',
    } as Record<ReadingLevel, string>,
    heading: 'Lesson summary',
    from: 'From:',
    paragraphAria: (n: number) => `See paragraph ${n} from the lesson`,
    start: 'Start studying',
  },

  question: {
    choose: 'Choose an answer',
    continue: 'Continue',
    tryAgain: 'Try again',
    hintOf: (n: number) => `Hint ${n} of 2`,
    level: (level: number) => `Level ${level}`,
    // Five lines; the coach picks one by number (see PRAISE_COUNT in coach.ts).
    praise: ['Great job!', 'Nicely done!', 'Correct!', 'You got it!', 'Well done!'],
  },

  feedback: {
    correct: 'Correct!',
    reveal: "Here's the answer",
    seeInLesson: 'See in lesson',
    seeInLessonAria: (n: number) => `See in lesson, paragraph ${n}`,
  },

  progress: {
    heading: 'Your progress',
    skills: {
      main_idea: 'Main idea',
      detail: 'Detail',
      vocabulary: 'Vocabulary',
      inference: 'Inference',
    } as Record<Skill, string>,
    none: 'No questions answered yet. Pick a path to start.',
    answered: (n: number) =>
      `${n} question${n === 1 ? '' : 's'} answered across all sessions.`,
    studyAgain: 'Study again',
    flashcards: 'Flashcards',
    notStarted: '0% · not started yet',
    masteryAria: (skill: string) => `${skill} mastery`,
  },

  flashcards: {
    done: (n: number) => `${n} card${n === 1 ? '' : 's'} done`,
    doneSub: 'You went through all the vocabulary.',
    backToProgress: 'Back to Progress',
    flipAriaFront: 'Showing English side. Tap to flip.',
    flipAriaBack: 'Showing Filipino side. Tap to see English.',
    english: 'English',
    filipino: 'Filipino',
    tapToFlip: 'Tap to flip',
    showAgain: 'Show again',
    gotIt: 'Got it',
    remaining: (n: number) => `${n} card${n === 1 ? '' : 's'} remaining`,
  },

  // Shared by the study screens.
  common: {
    counter: (n: number, total: number) => `${n} of ${total}`,
    closeSession: 'Close session',
    progressAria: 'Progress',
    aiNoticeAria: 'AI-generated content notice',
    aiNotice: 'AI-made, check with your teacher',
    paragraphAria: (n: number) => `Lesson paragraph ${n}`,
    fromLesson: 'From the lesson',
    close: 'Close',
    readAloud: 'Read aloud',
    stopAria: 'Stop reading aloud',
    stop: 'Stop',
  },
}

export type Strings = typeof en

const tl: Strings = {
  tabs: { lessons: 'Aralin', study: 'Mag-aral', progress: 'Pag-unlad' },
  languageLabel: 'Wika',
  navLabel: 'Pangunahing nabigasyon',

  onboarding: {
    languageHeading: 'Pumili ng wika',
    languageText: 'Mapapalitan mo ito mamaya sa screen ng Aralin.',
    steps: [
      {
        heading: 'Maligayang pagdating!',
        text: 'Tutulungan ka ng app na ito na maintindihan ang aralin mo, paisa-isang hakbang.',
      },
      {
        heading: 'Kunin ang aralin mo',
        text: 'Pindutin ang "Pumili ng file mula sa phone mo" at piliin ang file na ipinadala ng guro mo. Gagawin itong study pack ng app. Kailangan mo ng internet sa hakbang na ito lang.',
      },
      {
        heading: 'Mag-aral kahit kailan',
        text: 'Basahin ang maikling buod, tapos sagutin ang mga tanong. Kapag mali ang sagot mo, bibigyan ka ng pahiwatig. Hindi kailangan ng internet.',
      },
      {
        heading: 'Naka-save ang gawa mo',
        text: 'Puwede mong isara ang app kahit kailan. Pagbalik mo, itutuloy mo kung saan ka huminto.',
      },
    ],
    skip: 'Laktawan',
    next: 'Susunod',
    start: 'Simulan na',
    stepOf: (n, total) => `Hakbang ${n} sa ${total}`,
  },

  lessons: {
    heading: 'Magdagdag ng aralin',
    internetTitle: 'Kailangan ng internet nang isang beses para gawin ang pack.',
    internetBody: 'Pagkatapos, puwede kang mag-aral kahit walang internet.',
    reading: (name) => `Binabasa ang ${name}`,
    keepInternet: 'Huwag patayin ang internet hanggang matapos ito',
    pickAria: 'Pumili ng PDF file mula sa phone mo',
    pickLabel: 'Pumili ng file mula sa phone mo',
    openPack: 'Magbukas ng pack file',
    yourPacks: 'Mga study pack mo',
    sample: 'Halimbawa',
    packMeta: (questions) => `${questions} tanong · naka-save sa phone`,
    study: 'Mag-aral',
    share: 'I-share',
    shareAria: (title) => `I-share ang ${title}`,
    notPdf: 'Pumili ng PDF file.',
    tooBig: (size, mode, limit) =>
      `Ang file na ito ay ${size}. Ang limit sa ${mode} mode ay ${limit}.`,
    notPack: 'Hindi tamang pack ang file na ito.',
  },

  makePack: {
    heading: 'Gumawa ng pack',
    making: (name) => `Ginagawa ang pack mula sa ${name}`,
    tryAgain: 'Subukan ulit',
    backToLibrary: 'Bumalik sa listahan',
    fail: {
      too_long: 'Masyadong mahaba ang araling ito. Sumubok muna ng mas maikling file.',
      offline: 'Kailangan ng internet nang isang beses para gumawa ng pack. I-on ito at subukan ulit.',
      timeout: 'Masyadong matagal ito. Subukan ulit.',
      server: 'Nagkaproblema ang pack service. Subukan ulit.',
      bad_json: 'Hindi naging maayos ang pack. Subukan ulit.',
      bad_format: 'Hindi naging maayos ang pack. Subukan ulit.',
      bad_coverage: 'Kulang ang ilang uri ng tanong sa pack. Subukan ulit.',
    },
    thrown: 'Hindi namin mabasa ang file na ito. Pumili ng PDF na may totoong teksto.',
  },

  pathPick: {
    packMeta: (questions, cards) => `${questions} tanong · ${cards} card ng bokabularyo`,
    prompt: 'Paano mo gustong mag-aral?',
    catchupBadge: 'Paghabol',
    catchupHeading: 'Magsimula sa simula',
    catchupDesc: 'Simpleng salita, isang ideya bawat isa. Mainam kung bago pa sa iyo ang aralin.',
    practiceBadge: 'Pagsasanay',
    practiceHeading: 'Subukan ang alam mo',
    practiceDesc: 'Mas malapit sa antas ng exam. Mainam kung nabasa mo na ang aralin.',
    startsAt: (level) => `Nagsisimula sa Antas ${level}`,
  },

  summary: {
    levels: {
      1: 'Antas 1 · Paghabol',
      2: 'Antas 2 · Pagsasanay',
      3: 'Antas 3 · Pang-baitang',
    },
    heading: 'Buod ng aralin',
    from: 'Mula sa:',
    paragraphAria: (n) => `Tingnan ang talata ${n} ng aralin`,
    start: 'Magsimulang mag-aral',
  },

  question: {
    choose: 'Pumili ng sagot',
    continue: 'Magpatuloy',
    tryAgain: 'Subukan ulit',
    hintOf: (n) => `Hint ${n} sa 2`,
    level: (level) => `Antas ${level}`,
    praise: ['Magaling!', 'Ang galing mo!', 'Tama!', 'Nakuha mo!', 'Mahusay!'],
  },

  feedback: {
    correct: 'Tama!',
    reveal: 'Ito ang sagot',
    seeInLesson: 'Tingnan sa aralin',
    seeInLessonAria: (n) => `Tingnan sa aralin, talata ${n}`,
  },

  progress: {
    heading: 'Ang pag-unlad mo',
    skills: {
      main_idea: 'Pangunahing ideya',
      detail: 'Detalye',
      vocabulary: 'Bokabularyo',
      inference: 'Hinuha',
    },
    none: 'Wala ka pang nasasagot na tanong. Pumili ng paraan para magsimula.',
    answered: (n) => `${n} tanong ang nasagot mo sa lahat ng session.`,
    studyAgain: 'Mag-aral ulit',
    flashcards: 'Flashcards',
    notStarted: '0% · hindi pa nasisimulan',
    masteryAria: (skill) => `Kahusayan sa ${skill}`,
  },

  flashcards: {
    done: (n) => `${n} card ang natapos`,
    doneSub: 'Natapos mo ang lahat ng bokabularyo.',
    backToProgress: 'Bumalik sa Pag-unlad',
    flipAriaFront: 'Ingles ang nakikita. Pindutin para baligtarin.',
    flipAriaBack: 'Filipino ang nakikita. Pindutin para makita ang Ingles.',
    english: 'Ingles',
    filipino: 'Filipino',
    tapToFlip: 'Pindutin para baligtarin',
    showAgain: 'Ipakita ulit',
    gotIt: 'Alam ko na',
    remaining: (n) => `${n} card pa ang natitira`,
  },

  common: {
    counter: (n, total) => `${n} sa ${total}`,
    closeSession: 'Isara ang session',
    progressAria: 'Pag-unlad',
    aiNoticeAria: 'Paalala: gawa ng AI ang nilalaman',
    aiNotice: 'Gawa ng AI, tiyakin sa guro mo',
    paragraphAria: (n) => `Talata ${n} ng aralin`,
    fromLesson: 'Mula sa aralin',
    close: 'Isara',
    readAloud: 'Basahin nang malakas',
    stopAria: 'Itigil ang pagbasa',
    stop: 'Itigil',
  },
}

export const STRINGS: Record<Language, Strings> = { en, tl }

// The first guess before the student picks: Tagalog when the phone is set to
// Tagalog or Filipino, English otherwise.
export function guessLanguage(browserLanguage: string | undefined): Language {
  const code = (browserLanguage ?? '').toLowerCase()
  return code.startsWith('tl') || code.startsWith('fil') ? 'tl' : 'en'
}

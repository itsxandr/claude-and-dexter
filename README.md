# KodiGo

An offline-first study coach for Filipino public school students on
low-end Android phones. Built for Build Over Nights (Kiro x Quick),
Education track, by team Claude and Dexter.

Live: https://study-coach-silk.vercel.app

## What it does
- A teacher's lesson PDF is turned into a study pack once, using one
  AI call.
- The pack is saved on the phone. Studying then works with no
  internet and no further cost.
- The student answers questions, gets hints instead of just "wrong",
  can jump to the exact paragraph in the lesson, and sees mastery
  bars and flashcards.
- Packs can be shared phone to phone as a .studypack file.
- The interface is in English or Tagalog. The lesson stays in its
  original language. Read aloud uses the phone's own voice.

## How it was built
- Kiro was the main build tool. The spec is in
  .kiro/specs/study-coach-mvp (requirements, design, tasks).
- Amazon Quick was used for the problem research. The reports are in
  docs/quick/.
- React, Vite and TypeScript, installable as a PWA. One Vercel
  function (/api/pack) makes the pack.

## Run it
    cd app
    npm ci
    npm run dev

Making a new pack needs MODEL_ID and MODEL_API_KEY set for the
/api/pack function. Studying an existing pack needs neither.

## Test it
    npm test
    npm run lint
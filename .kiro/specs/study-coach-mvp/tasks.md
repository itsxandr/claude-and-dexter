# Implementation Plan: study-coach-mvp

## Overview

We build in TypeScript (React + Vite PWA on the phone, one Vercel function on the server), in this order:

1. A tiny scaffold, deployed once to Vercel and opened on the phone (task 1).
2. A **vertical slice** (tasks 2–6): one real PDF goes all the way through. PDF in → paragraphs → Fingerprint → `POST /api/pack` → real model draft → `assemblePack` → `formatCheck` + `coverageCheck` → save → one Study_Session with Coach hints → Mastery_Bars. Stand-ins are fine here: Standard_Mode is hard-coded, and a plain file input is used.
3. Checkpoint 7: one real PDF works end to end, locally and on the deployed app on the Reference_Device.
4. Layers on top of the slice (tasks 8–14): offline precache, share, AI_Label, preview, friendly error messages, Device_Check and Lite_Mode, page range.
5. Checkpoint 15: all layers work.
6. Only if time remains (tasks 16–19): Problem_Flags, flashcards, Read_Aloud, delete data.
7. Optional PPTX import (task 20), then the final Reference_Device run (task 21).

Tags: `[frontend]` = anything in `app/src` (logic, io, screens, PWA) and `app/fixtures`. `[backend]` = `app/api/pack.ts`, `app/service/modelAdapter.ts`, `app/vercel.json`, Vercel project settings, env vars. A parent task that holds both kinds of sub-tasks carries both tags.

Model rule for every backend task: the model name comes only from the `MODEL_ID` env var. Never write a model name in code, tests, or defaults. `MODEL_API_KEY` is read only on the server, never gets a `VITE_` prefix, is never logged, and is never committed.

## Tasks

- [ ] 1. [Xan] [frontend] [backend] Scaffold the project (setup only, no logic)
  - [x] 1.1 [Xan] [frontend] Create the Vite + React + TypeScript PWA in `app/`
    - Run the Vite React-TS template in `app/`. Add `vite-plugin-pwa` with the default Workbox precache and `navigateFallbackDenylist: [/^\/api\//]`, so `/api/*` always goes to the network.
    - Add a short web app manifest (name `[APP NAME]`, one icon). `App.tsx` shows one placeholder line only.
    - Add Vitest and fast-check as dev dependencies with exact pinned versions. Add the scripts `"test": "vitest --run"` and `"build"`.
    - Check: `npm run build` and `npm test` (no tests yet) both finish without errors.
    - _Requirements: 8.1, 8.3_
  - [x] 1.2 [Xan] [backend] Add the Vercel function stub, vercel.json, env example, and deploy the stub
    - `app/api/pack.ts`: a Node.js handler that returns a fixed reply, for example `{ "ok": true, "stub": true }` with status 200.
    - `app/vercel.json`: `{ "functions": { "api/pack.ts": { "maxDuration": 90 } } }`.
    - `app/.env.example`: the lines `MODEL_ID=` and `MODEL_API_KEY=` with empty values.
    - Root `.gitignore`: add the line `!.env.example` under `.env*`, so the example file is committed and real env files stay ignored. Check with `git status` that `app/.env.example` shows up and `.env.local` does not.
    - Install the Vercel CLI as a dev dependency in `app/` with an exact pinned version (`npm i -D -E vercel@<exact version>`), and run it with `npx vercel`. The CLI is the command-line tool that links and deploys our project.
    - Run `npx vercel link` in `app/` to create or connect the Vercel project. Set the project's Root Directory to `app` (in the Vercel project settings, or when the CLI asks). Check that the `.vercel/` folder it creates is git-ignored and not committed.
    - Deploy the stub with `npx vercel deploy`. If the phone shows a Vercel login page (deployment protection on preview links), use `npx vercel deploy --prod` or turn protection off for the project.
    - Open the deployed URL on the phone. Check: the placeholder page loads over HTTPS, and `<deployed URL>/api/pack` returns the fixed reply.
    - _Requirements: 3.5, 3.6_

- [ ] 2. [Xan] [frontend] Pure logic for the slice: paragraphs, assemble, checks
  - [x] 2.1 [Xan] [frontend] Add `src/config.ts`, `src/logic/types.ts`, and a sample pack fixture
    - `config.ts` holds `APP_NAME`, `PACK_EXTENSION`, `MAX_LESSON_CHARS`, `PACK_TIMEOUT_SECONDS`, `PACK_FORMAT_VERSION`, `SIZE_LIMIT_BYTES`, `SESSION_LENGTH`, `PACK_SERVICE_URL`, as in the design. No browser-only code, so `api/pack.ts` can import it.
    - `types.ts` holds `Skill`, `ReadingLevel`, `RawPage`, `LessonParagraph`, `Ref`, `PackDraft`, `StudyPack`, `Question`, `MasteryRecord`, `Mode`, `Slot`.
    - `app/fixtures/sample.studypack.json`: a small hand-written `StudyPack` that follows the design's format rules. A fixture is a fixed sample file we use in tests. It has `formatVersion: 1`, a non-empty `id`, `title`, and ISO `createdAt`; 3–5 paragraphs numbered 1..N; 3 summaries for levels 1, 2, 3; a handful of Questions (unique ids, 2–4 choices, valid `answerIndex`, 2 Hints and 1 Explanation each); 2–3 glossary cards with Filipino text (for example with ñ). Every paragraph reference is in 1..N. Full coverage of all 12 Coverage_Slots is not needed.
    - _Requirements: 3.7, 3.8_
  - [ ] 2.2 [Xan] [frontend] Implement `splitParagraphs` and `lessonText`
    - `logic/paragraphs.ts`: `splitParagraphs(pages)`. Start a new paragraph at an empty line or a page change, collapse whitespace, drop empty paragraphs, split paragraphs over 800 characters at the last sentence end before 800, and number them 1..N.
    - `logic/pageRange.ts`: `lessonText(paras)` joins `"[n] text"` lines with blank lines. (`applyPageRange` comes in task 14.)
    - _Requirements: 2.2_
  - [ ]* 2.3 [Xan] [frontend] Write property test for paragraph split
    - File: `logic/paragraphs.test.ts`
    - **Property 4: Paragraph split keeps all text, in order, numbered 1..N**
    - **Validates: Requirements 2.2**
  - [ ] 2.4 [Xan] [frontend] Implement `assemblePack` in `logic/assemble.ts`
    - Copy paragraph text from the phone's own `LessonParagraph[]` (drop `page`), give Questions ids `q1, q2, …` in draft order, and add `formatVersion`, `id`, `title`, `createdAt`. No validation here.
    - _Requirements: 3.7, 3.8_
  - [ ] 2.5 [Xan] [frontend] Implement `formatCheck`, `emptySlots`, `coverageCheck` in `logic/packCheck.ts`
    - Implement format rules 1–7 from the design by hand (no schema library). Return a pack that has only the known fields.
    - `emptySlots` lists the (Skill, Reading_Level) pairs with no Question. `coverageCheck` passes when that list is empty.
    - Add a small required unit test in `logic/packCheck.fixture.test.ts`: `app/fixtures/sample.studypack.json` passes `formatCheck`.
    - _Requirements: 3.8, 3.9, 4.6, 4.7_
  - [ ]* 2.6 [Xan] [frontend] Add shared generators and the property test for assembled packs
    - Create `logic/testGen.ts` with `arbParagraphs`, `arbPackDraft(n)`, `arbStudyPack`, `arbDeviceInfo`, `arbAnswerSeq`. Text includes ñ, emoji, quotes, and newlines.
    - File: `logic/assemble.test.ts`
    - **Property 6: Assembled pack passes the check and uses the phone's own text**
    - **Validates: Requirements 3.7, 3.8**
  - [ ]* 2.7 [Xan] [frontend] Write property test for dangling paragraph references
    - File: `logic/packCheck.refs.test.ts`
    - **Property 7: Dangling paragraph references are rejected**
    - **Validates: Requirements 3.8, 4.7**
  - [ ]* 2.8 [Xan] [frontend] Write property test for coverage slots
    - File: `logic/packCheck.coverage.test.ts`
    - **Property 10: Coverage slots and warnings**
    - **Validates: Requirements 3.9, 4.4**

- [ ] 3. [Xan] [backend] Pack_Service with a real model call
  - [x] 3.1 [Xan] [backend] Check the OpenAI API parameters against the OpenAI docs
    - Before writing the adapter, read the current OpenAI API docs and confirm: (a) that the model you will put in `MODEL_ID` exists and is available to our API key, (b) the exact parameter for JSON-only output, (c) the exact parameter for low reasoning effort, (d) the exact parameter for the output token cap, (e) the field names for input and output token counts in the `usage` part of the reply, (f) whether reasoning tokens count toward the output token cap.
    - Write the results as a short comment at the top of a new `app/service/modelAdapter.ts` (endpoint, parameter names, and doc links). Also record the chosen output cap number and the reason for it (see 3.2). Do not write the model name in the file. If something does not exist, stop and ask us.
    - _Requirements: 3.5_
  - [x] 3.2 [Xan] [backend] Implement `generateDraft` in `service/modelAdapter.ts`
    - Read `MODEL_ID` and `MODEL_API_KEY` with `process.env` inside the function. If either is missing, throw a clear config error that names the missing variable (the name only, never a value). No default model name.
    - Call the OpenAI API with plain `fetch` and an `AbortController` timeout of 80 s. Use the parameter names confirmed in 3.1: JSON-only output, low reasoning effort, output cap about 8000 tokens. If 3.1 found that reasoning tokens count toward the cap, raise the cap so about 8000 visible output tokens still fit, and make sure the number and reason are in the 3.1 comment.
    - Fixed prompt: return only the `PackDraft` shape, 2 Questions per Coverage_Slot (24 total), short sentences, Reading_Level 1 = very simple words, refer to paragraphs by number only.
    - Return `{ json, inputTokens, outputTokens }` from the reply's `usage`.
    - _Requirements: 3.5, 3.7, 3.8_
  - [x] 3.3 [Xan] [backend] Replace the stub in `api/pack.ts` with the real handler
    - Non-POST → 405. Missing `lessonText`, or longer than `MAX_LESSON_CHARS` (imported from `src/config.ts`) → 400 `{ "error": "bad_request" }`.
    - Call `generateDraft`, strip code fences, `JSON.parse`. Success → 200 with the JSON. Parse failure → 502 `bad_model_output`. Adapter error or timeout → 502 `model_failed`. Missing env var → 500 `{ "error": "not_configured" }`.
    - Keep nothing. Log one line per request: status, input tokens, output tokens, seconds. Never log the lesson text, the pack, or the key.
    - _Requirements: 3.5, 3.6_
  - [ ] 3.4 [Xan] [backend] Write unit tests for the handler with a mocked adapter
    - File: `app/api/pack.test.ts`. Cases: valid JSON → 200; fenced JSON → 200; garbage → 502; adapter throws → 502; text over `MAX_LESSON_CHARS` → 400; GET → 405; missing `MODEL_ID` or `MODEL_API_KEY` → 500 `not_configured`.
    - Check that the log line has status, token counts, and seconds, and never contains the lesson text or the key.
    - Use fake values such as `test-model` in tests, never a real model name.
    - _Requirements: 3.5, 3.6_

- [ ] 4. [Tristan] [frontend] Thin IO for the slice
  - [ ] 4.1 [Tristan] [frontend] Implement `io/pdf.ts`
    - Load pdf.js with dynamic `import()` and set up its worker. Return `RawPage[]` with lines built from text items (`hasEOL`).
    - _Requirements: 2.1_
  - [ ] 4.2 [Tristan] [frontend] Implement `io/fingerprint.ts`
    - `fingerprint(text)` = hex SHA-256 of the UTF-8 text using `crypto.subtle.digest`.
    - _Requirements: 3.2_
  - [ ] 4.3 [Tristan] [frontend] Implement `io/packClient.ts`
    - `requestDraft(lessonText)`: return `offline` without calling fetch when `navigator.onLine === false`. POST to `PACK_SERVICE_URL`, abort after `PACK_TIMEOUT_SECONDS`, and map results to `ok`, `timeout`, `server`, or `bad_json`. One request per call.
    - _Requirements: 3.4, 3.10, 3.11_
  - [x] 4.4 [Tristan] [frontend] Implement `io/store.ts` with `idb`
    - Install `idb` (exact version). One database named from `APP_NAME` with stores `packs`, `mastery`, `flags`, `settings`, all created now so no upgrade is needed later.
    - Helpers: `getPack`, `putPack`, `listPacks`, `getMastery`, `putMastery`, `getFlags(packId)`, `putFlag`, `getMode`, `putMode`. (`deleteAll` comes in task 19.)
    - _Requirements: 8.1, 8.2_

- [ ] 5. [Tristan] [frontend] Study logic for the slice: coach, session, mastery
  - [ ] 5.1 [Tristan] [frontend] Implement `coach()` in `logic/coach.ts`
    - Right → praise from a small fixed list + Explanation. Wrong after 0 earlier wrongs → Hint 1; after 1 → Hint 2; after 2 → reveal Explanation and correct answer. Every feedback carries its `paragraph`.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 5.2 [Tristan] [frontend] Write property test for the coach ladder
    - File: `logic/coach.test.ts`
    - **Property 15: Coach feedback ladder**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
  - [ ] 5.3 [Tristan] [frontend] Implement the session reducer in `logic/session.ts`
    - `startSession`, `available`, `pickNext` (nearest level, level 1 wins a tie with 3), `answer` (uses `coach`, updates streaks and level, finishes a question on right or third wrong), `skipFlagged`, and the `done` rule (8 finished or nothing left).
    - Add two small required unit tests: `startSession("catchup").level === 1` and `startSession("practice").level === 2`.
    - _Requirements: 5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 6.9_
  - [ ]* 5.4 [Tristan] [frontend] Write property test for picking the next Question
    - File: `logic/session.pick.test.ts`
    - **Property 12: Next Question is available and at the nearest level**
    - **Validates: Requirements 5.5, 6.9**
  - [ ]* 5.5 [Tristan] [frontend] Write property test for Reading_Level changes
    - File: `logic/session.level.test.ts`
    - **Property 13: Reading_Level adapts and stays in 1..3**
    - **Validates: Requirements 5.2, 5.3, 5.6, 5.7, 5.8**
  - [ ]* 5.6 [Tristan] [frontend] Write property test for the session end
    - File: `logic/session.end.test.ts`
    - **Property 14: Session ends at 8 or when nothing is left**
    - **Validates: Requirements 5.9**
  - [x] 5.7 [Tristan] [frontend] Implement `logic/mastery.ts`
    - `emptyMastery()`, `recordAnswer`, `percent` (0 when no answers, else `round(100 × right / answered)`).
    - _Requirements: 7.6, 7.7_
  - [ ]* 5.8 [Tristan] [frontend] Write property test for mastery
    - File: `logic/mastery.test.ts`
    - **Property 18: Mastery percent matches the answer history**
    - **Validates: Requirements 7.6, 7.7**

- [ ] 6. [Xan] [Tristan] [frontend] Wire the vertical slice together
  - [ ] 6.1 [Xan] [frontend] Implement the make-pack flow in `src/flow/makePack.ts`
    - `makePack(file, deps)` with injected `extract`, `fingerprint`, `store`, `requestDraft`, so it can be tested without a browser. Steps: extract → `splitParagraphs` → `lessonText` → Fingerprint → if a pack with this id exists, return it (no network) → else `requestDraft` once → `assemblePack` → `formatCheck` + `coverageCheck` → save only if both pass.
    - Return `{ ok: true, pack, isNew }` or `{ ok: false, reason }`. Stand-in for now: if text is over `MAX_LESSON_CHARS`, return `too_long` (page range comes in task 14).
    - _Requirements: 2.1, 2.2, 3.2, 3.3, 3.4, 3.9, 3.10_
  - [ ] 6.2 [Xan] [frontend] Write unit tests for the make-pack flow with mocks
    - File: `src/flow/makePack.test.ts`. Cases: Fingerprint match opens the saved pack and never calls `requestDraft`; no match calls it exactly once and saves; timeout, server error, failed format check, and failed coverage check all save nothing.
    - _Requirements: 3.3, 3.4, 3.9, 3.10_
  - [ ] 6.3 [Tristan] [frontend] Add the Library and Make Pack screens
    - `App.tsx` holds one `screen` state value (no router). Stand-in: mode is hard-coded to Standard_Mode.
    - `screens/Library.tsx`: list saved packs, button "Make a pack".
    - `screens/MakePack.tsx`: plain file input, calls `makePack`, shows a simple "Something went wrong" + "Try again" on failure, opens the pack on success.
    - _Requirements: 2.1, 3.3, 3.10_
  - [ ] 6.4 [Tristan] [frontend] Add the study screens
    - `screens/PathPick.tsx` (Catch-up or Practice), `screens/Summary.tsx` (summary at the start level with ¶ links), `screens/QuestionScreen.tsx` (choices, coach feedback, "See in lesson ¶n" link, Next), `components/ParagraphSheet.tsx` (bottom sheet with the paragraph text), `screens/Mastery.tsx` (one bar per Skill, "0% · not started yet" when empty).
    - Save mastery to the store each time a question is finished. Show Mastery when the session is done.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.6, 7.7_

- [ ] 7. [frontend] [backend] Checkpoint - one real PDF works end to end
  - Ensure all tests pass, ask the user if questions arise.
  - Run `vercel dev` in `app/` with real values in `.env.local`, make a pack from one real sample PDF, finish one Study_Session, and see the Mastery_Bars. Making the same PDF again must open the saved pack with no network call.
  - Set `MODEL_ID` and `MODEL_API_KEY` in the Vercel project's environment variables (not with a `VITE_` prefix), then deploy.
  - On the Realme C25s, open the deployed app and repeat the same end-to-end run. Then turn on airplane mode once, reopen the app, and study the saved pack.
  - Note: at this point the airplane-mode run only checks reopening the app and studying a saved pack. Full offline coverage (the pdf.js worker and other lazy files) is finished in the precache task (task 8).

- [ ] 8. [frontend] Offline app files (precache)
  - [ ] 8.1 [frontend] Finish the PWA precache config in `vite.config.ts`
    - Make sure `globPatterns` covers every built file, including the lazy pdf.js chunk and the pdf.js worker, so the whole app opens offline. Keep `navigateFallbackDenylist: [/^\/api\//]` and add no runtime cache rule for `/api/*`. (The JSZip chunk is checked in task 20.)
    - Check: after `npm run build`, the generated precache list has the pdf.js worker and no `/api/` entry.
    - _Requirements: 8.3, 8.4_

- [ ] 9. [frontend] Share and open Pack_Files
  - [ ] 9.1 [frontend] Implement `packToJson` and `packFromJson` in `logic/packJson.ts`
    - `packFromJson` wraps `JSON.parse` in try/catch and then runs `formatCheck`. It never throws.
    - _Requirements: 3.12, 4.6, 4.7, 4.8_
  - [ ]* 9.2 [frontend] Write property test for the JSON round trip
    - File: `logic/packJson.roundtrip.test.ts`
    - **Property 9: JSON and Pack_File round trip**
    - **Validates: Requirements 3.12, 4.6, 4.8**
  - [ ]* 9.3 [frontend] Write property test for invalid input
    - File: `logic/packJson.invalid.test.ts`
    - **Property 8: Invalid input never becomes a pack**
    - **Validates: Requirements 4.7, 3.10**
  - [ ] 9.4 [frontend] Implement `io/packFile.ts` and the Share / Open buttons
    - Export: `File` named `safeName(title) + PACK_EXTENSION`. Use the Web Share API when `navigator.canShare({ files })` is true, else download.
    - Import: file input with no `accept` filter, read as text, `packFromJson`. On failure show "This file is not a valid pack." and save nothing. Same `id` replaces the old pack.
    - Add "Share" to the pack's first screen, `PathPick.tsx` (the Preview does not exist yet; task 11 adds Share there too). Add "Open a pack file" to `Library.tsx`.
    - _Requirements: 4.5, 4.6, 4.7_

- [ ] 10. [frontend] AI_Label
  - [ ] 10.1 [frontend] Add `components/PackHeader.tsx` and use it on every pack screen that exists now
    - Always shows "AI-made, check with your teacher". Use it on PathPick, Summary, QuestionScreen, and Mastery. (Preview gets it in task 11, Flashcards in task 17.)
    - _Requirements: 6.7_

- [ ] 11. [frontend] Pack_Preview with remove and warnings
  - [ ] 11.1 [frontend] Add `removeQuestion` to `logic/packCheck.ts`
    - Return `last_question` and leave the pack unchanged when only 1 Question is left.
    - _Requirements: 4.2, 4.3_
  - [ ]* 11.2 [frontend] Write property test for removing a Question
    - File: `logic/packCheck.remove.test.ts`
    - **Property 11: Removing a Question**
    - **Validates: Requirements 4.2, 4.3**
  - [ ] 11.3 [frontend] Add `screens/Preview.tsx`
    - Show the three summaries and every Question with choices, Hints, Explanation, and linked paragraph text. "Remove" calls `removeQuestion`, saves the new pack, and shows a warning for each slot in `emptySlots` (for example "No inference questions at Reading_Level 2"). Show "A pack needs at least 1 question." on `last_question`.
    - Use `PackHeader` at the top of the Preview. Add the "Share" button (from `io/packFile.ts`, task 9) to the Preview as well.
    - Open the Preview right after a new pack is saved (`isNew` from `makePack`).
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.7_

- [ ] 12. [frontend] Friendly error messages
  - [ ] 12.1 [frontend] Add the friendly error messages from the design's Error Handling table
    - In `MakePack.tsx`: "Making a pack needs internet once." (offline), "This is taking too long." + Try again (timeout), "Something went wrong." + Try again (server or network), "The pack did not come out right." + Try again (failed checks). "Try again" makes one new request.
    - In `io/pdf.ts`: wrap pdf.js in try/catch → "We could not read this file."
    - In `io/store.ts`: catch quota errors → "Your phone storage is full." and save nothing.
    - _Requirements: 3.10, 3.11, 8.7_

- [ ] 13. [frontend] Device_Check, Lite_Mode, and import checks
  - [ ] 13.1 [frontend] Implement `logic/deviceCheck.ts`
    - `proposeMode`, `sizeLimit`, `checkSize`, as in the design.
    - _Requirements: 1.2, 1.3, 1.4, 1.8, 1.9_
  - [ ]* 13.2 [frontend] Write property test for the mode proposal
    - File: `logic/deviceCheck.mode.test.ts`
    - **Property 1: Device_Check mode proposal**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  - [ ]* 13.3 [frontend] Write property test for the size limit
    - File: `logic/deviceCheck.size.test.ts`
    - **Property 2: Import size limit**
    - **Validates: Requirements 1.8, 1.9**
  - [ ] 13.4 [frontend] Implement `logic/fileType.ts` and the scanned check
    - `detectType(name, firstBytes)` returns `pdf`, `pptx`, or `unsupported`. Add `isScanned(pages)` (fewer than 20 non-space characters) to `logic/paragraphs.ts`.
    - _Requirements: 2.3, 2.4_
  - [ ]* 13.5 [frontend] Write property test for file type detection
    - File: `logic/fileType.test.ts`
    - **Property 3: File type detection**
    - **Validates: Requirements 2.4**
  - [ ] 13.6 [frontend] Add the First Run and Settings screens and use the real mode
    - `screens/FirstRun.tsx`: read `navigator.deviceMemory` and `navigator.connection?.saveData` (either may be missing), show the proposal with "Use this" and "Use the other mode". Show it when the store has no mode.
    - `screens/Settings.tsx`: switch between Lite_Mode and Standard_Mode.
    - Set `data-mode="lite"` on `<html>` and add one CSS rule that turns off all animations and transitions under it.
    - Remove the hard-coded mode. In `MakePack.tsx`, run `checkSize` (message shows both sizes in MB), `detectType` ("Please pick a PDF or PPTX file."), and `isScanned` ("Scanned files are not supported yet.") before making the pack.
    - Add a small unit test: `proposeMode({}) === "standard"`.
    - _Requirements: 1.1, 1.5, 1.6, 1.7, 1.8, 1.9, 2.3, 2.4_

- [ ] 14. [frontend] Page_Range for long lessons
  - [ ] 14.1 [frontend] Add `applyPageRange` to `logic/pageRange.ts`
    - Keep paragraphs whose page is in range, keep order and text, renumber 1..K.
    - _Requirements: 3.1_
  - [ ]* 14.2 [frontend] Write property test for the page range
    - File: `logic/pageRange.test.ts`
    - **Property 5: Page_Range filter and renumber**
    - **Validates: Requirements 3.1**
  - [ ] 14.3 [frontend] Add the Page_Range picker to `MakePack.tsx` and `makePack`
    - Replace the `too_long` stand-in: ask for first and last page, apply the range, and ask again with "Still too long, pick fewer pages." until the text fits. The Fingerprint uses the final text.
    - _Requirements: 3.1, 3.2_

- [ ] 15. [frontend] [backend] Checkpoint - all layers work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. [frontend] Problem_Flags (only if time remains)
  - [ ] 16.1 [frontend] Add "report a problem" and the Reported tag
    - In `QuestionScreen.tsx`: "Report a problem" saves the flag with `putFlag`, calls `skipFlagged`, and moves to the next Question. Load flags with `getFlags` when a session starts and pass them to `pickNext`.
    - In `Preview.tsx`: show a "Reported" tag on flagged Questions.
    - _Requirements: 6.8, 6.9, 6.10_

- [ ] 17. [frontend] Glossary flashcards (only if time remains)
  - [ ] 17.1 [frontend] Implement `logic/flashcards.ts`
    - `startFlash`, `flip`, `gotIt`, `showAgain` (index 3 of the rest, or the end when fewer than 3 remain), `isDone`. Every move shows the English side.
    - _Requirements: 7.1, 7.3, 7.4, 7.5_
  - [ ]* 17.2 [frontend] Write property test for "show again"
    - File: `logic/flashcards.again.test.ts`
    - **Property 16: "Show again" placement**
    - **Validates: Requirements 7.1, 7.4**
  - [ ]* 17.3 [frontend] Write property test for finishing a flashcard session
    - File: `logic/flashcards.done.test.ts`
    - **Property 17: Flashcard session completes with the right count**
    - **Validates: Requirements 7.3, 7.5**
  - [ ] 17.4 [frontend] Add `screens/Flashcards.tsx`
    - English side first, tap to show Filipino + meaning, "Got it" and "Show again", end screen with the number of cards done. Add a "Flashcards" button on the pack screen (`PathPick.tsx`), hidden when the pack has no Glossary_Cards.
    - Use `PackHeader` at the top of the Flashcards screen.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 6.7_

- [ ] 18. [frontend] Read_Aloud (only if time remains)
  - [ ] 18.1 [frontend] Implement `io/speech.ts`
    - Wait for `voiceschanged` (or 1 s), prefer `localService` voices, report whether any voice exists, and stop quietly on error. `speakQuestion` reads the prompt and then "A. …, B. …".
    - _Requirements: 5.10, 5.11, 5.12_
  - [ ] 18.2 [frontend] Add Read_Aloud buttons
    - On `Summary.tsx` (reads the summary) and `QuestionScreen.tsx` (reads the Question and choices). Hide the button when there is no voice.
    - _Requirements: 5.10, 5.11, 5.12_

- [ ] 19. [frontend] "Delete my data" (only if time remains)
  - [ ] 19.1 [frontend] Add "Delete my data" to Settings
    - Add `deleteAll()` to `io/store.ts` (deletes the whole database). The button asks for confirmation first, then deletes and reloads, so the First Run Device_Check shows again.
    - _Requirements: 8.5, 8.6_

- [ ] 20. [frontend] PPTX import (optional requirement, build last only after the full study loop works)
  - [ ] 20.1 [frontend] Implement `io/pptx.ts` and wire it into `MakePack.tsx`
    - Load JSZip with dynamic `import()`, read `ppt/slides/slideN.xml` in slide order, collect `<a:t>` text, and return one `RawPage` per slide. Use it when `detectType` returns `pptx`. Broken file → "We could not read this file."
    - Check: after `npm run build`, the JSZip chunk is in the generated precache list (adjust `globPatterns` in `vite.config.ts` if it is not).
    - _Requirements: 2.5, 8.3_

- [ ] 21. [frontend] [backend] Final checkpoint - Reference_Device airplane-mode run
  - Ensure all tests pass, ask the user if questions arise.
  - Ask the user to do the manual device checks from the design's Testing Strategy (Realme C25s, Chrome, Lite_Mode, airplane mode, full study loop with no error messages; key not in built JS; Pack_File shared to a second phone). Fix any problem they report.
  - _Requirements: 8.4, 8.7_

## Notes

- Tasks marked with `*` are optional property tests and can be skipped for a faster MVP. The few plain unit tests left required (fixture check in 2.5, handler tests in 3.4, flow tests in 6.2, small checks in 5.3 and 13.6) are the ones we need to trust the slice.
- Tasks 16–19 are labelled "(only if time remains)" in their titles. Their sub-tasks are not marked `*`, because in this format `*` is only for test sub-tasks. Skip them by hand if time runs out.
- Each property test runs at least 100 runs and starts with a tag comment like `// Feature: study-coach-mvp, Property 9: JSON and Pack_File round trip`.
- Property test files are split by property so tasks never write to the same file at the same time.
- Stretch and Out of Scope items have no tasks on purpose.
- One task ≈ one commit. Tick each task in this file when it is done.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.4", "3.2", "4.1", "4.2", "4.3", "4.4", "5.1", "5.7"] },
    { "id": 3, "tasks": ["2.3", "2.5", "3.3", "5.2", "5.3", "5.8"] },
    { "id": 4, "tasks": ["2.6", "3.4", "5.4", "6.1"] },
    { "id": 5, "tasks": ["2.7", "5.5", "6.2", "6.3"] },
    { "id": 6, "tasks": ["2.8", "5.6", "6.4"] },
    { "id": 7, "tasks": ["8.1", "9.1", "11.1", "13.1", "13.4", "14.1", "17.1", "18.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "9.4", "11.2", "13.2", "13.3", "13.5", "14.2", "17.2", "17.3"] },
    { "id": 9, "tasks": ["10.1", "12.1"] },
    { "id": 10, "tasks": ["11.3"] },
    { "id": 11, "tasks": ["13.6"] },
    { "id": 12, "tasks": ["14.3"] },
    { "id": 13, "tasks": ["16.1", "19.1"] },
    { "id": 14, "tasks": ["17.4", "18.2"] },
    { "id": 15, "tasks": ["20.1"] }
  ]
}
```

---
inclusion: always
---

- Frontend: React + Vite + TypeScript, built as a PWA (service worker,
  installable, works offline). Mobile-first, target 2GB-RAM Android phones.
- Storage: IndexedDB on the phone. No server database.
- Text extraction: in the browser (pdf.js for PDF, JSZip for PPTX).
- Pack generation: one Vercel function at /api/pack (same origin as the
  PWA). It calls the OpenAI API through one adapter file,
  service/modelAdapter.ts. Env vars: MODEL_ID and MODEL_API_KEY
  (server-side only). Returns JSON only.
- Personalization, hints, flashcards, progress: plain TypeScript on the
  phone. No AI calls.
- Read-aloud: browser Web Speech API.
- Hosting: Vercel (static PWA build + the /api/pack function, one project).
- Keep the bundle small. No heavy UI libraries.
- The app name and the pack file extension each live in one config
  constant, so they can change in one place.
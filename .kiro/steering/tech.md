---
inclusion: always
---

- Frontend: React + Vite + TypeScript, built as a PWA (service worker,
  installable, works offline). Mobile-first, target 2GB-RAM Android phones.
- Storage: IndexedDB on the phone. No server database.
- Text extraction: in the browser (pdf.js for PDF, JSZip for PPTX).
- Pack generation: one AWS Lambda endpoint calling a small Bedrock model.
  Returns JSON only.
- Personalization, hints, flashcards, progress: plain TypeScript on the
  phone. No AI calls.
- Read-aloud: browser Web Speech API.
- Hosting: static site on AWS (Amplify or S3 + CloudFront).
- Keep the bundle small. No heavy UI libraries.
- The app name and the pack file extension each live in one config
  constant, so they can change in one place.
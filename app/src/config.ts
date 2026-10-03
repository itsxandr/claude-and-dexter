// All app-wide constants live here, so each one changes in one place.
// No browser-only code in this file: api/pack.ts (server) imports it too.

export const APP_NAME = '[APP NAME]'
export const PACK_EXTENSION = '.studypack'

// Longest Lesson_Text the Pack_Service accepts, in characters.
export const MAX_LESSON_CHARS = 30000

// How long the phone waits for the Pack_Service before giving up.
export const PACK_TIMEOUT_SECONDS = 60

export const PACK_FORMAT_VERSION = 1

// Largest Lesson_File the Importer accepts in each mode.
export const SIZE_LIMIT_BYTES = { lite: 5 * 1024 * 1024, standard: 20 * 1024 * 1024 }

// Number of Questions in one Study_Session.
export const SESSION_LENGTH = 8

// Same origin as the PWA, so a relative URL is enough.
export const PACK_SERVICE_URL = '/api/pack'

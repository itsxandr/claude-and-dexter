// Pack client: the phone's one way to ask the Pack_Service for a draft pack.
// See design.md, "Pack client". Requirements 3.4, 3.10, 3.11.
//
// It sends the final Lesson_Text one time and turns every possible outcome
// into a simple result. It never retries by itself: "Try again" on the screen
// calls requestDraft again, which makes one new request.
import { PACK_SERVICE_URL, PACK_TIMEOUT_SECONDS } from '../config'

export type MakeResult =
  | { ok: true; draft: unknown }
  | { ok: false; reason: 'offline' | 'timeout' | 'server' | 'bad_json' }

export async function requestDraft(lessonText: string): Promise<MakeResult> {
  // No connection: say so right away, without trying the network.
  if (navigator.onLine === false) return { ok: false, reason: 'offline' }

  // An AbortController lets us cancel the request. We cancel it if the
  // Pack_Service takes longer than PACK_TIMEOUT_SECONDS.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PACK_TIMEOUT_SECONDS * 1000)

  try {
    const res = await fetch(PACK_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonText }),
      signal: controller.signal,
    })
    if (!res.ok) return { ok: false, reason: 'server' }

    // Read the body as text first, so a broken body is "bad_json",
    // not a network problem.
    const body = await res.text()
    try {
      return { ok: true, draft: JSON.parse(body) }
    } catch {
      return { ok: false, reason: 'bad_json' }
    }
  } catch {
    // The request was cancelled by our timer, or the network failed.
    if (controller.signal.aborted) return { ok: false, reason: 'timeout' }
    return { ok: false, reason: 'server' }
  } finally {
    clearTimeout(timer)
  }
}

import { describe, it, expect, vi, afterEach } from 'vitest'
import { requestDraft } from './packClient'
import { PACK_SERVICE_URL, PACK_TIMEOUT_SECONDS } from '../config'

// Pretend the phone is online or offline.
function setOnline(onLine: boolean) {
  vi.stubGlobal('navigator', { onLine })
}

// Replace fetch with a fake that we control.
function stubFetch(impl: (...args: Parameters<typeof fetch>) => Promise<Response>) {
  const fake = vi.fn(impl)
  vi.stubGlobal('fetch', fake)
  return fake
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('requestDraft', () => {
  it('returns offline without calling fetch when the phone is offline', async () => {
    setOnline(false)
    const fake = stubFetch(async () => new Response('{}'))
    expect(await requestDraft('text')).toEqual({ ok: false, reason: 'offline' })
    expect(fake).not.toHaveBeenCalled()
  })

  it('returns ok with the parsed draft and makes exactly one POST', async () => {
    setOnline(true)
    const fake = stubFetch(async () => new Response(JSON.stringify({ a: 1 }), { status: 200 }))
    expect(await requestDraft('Hello')).toEqual({ ok: true, draft: { a: 1 } })
    expect(fake).toHaveBeenCalledTimes(1)
    const [url, init] = fake.mock.calls[0]
    expect(url).toBe(PACK_SERVICE_URL)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ lessonText: 'Hello' }))
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('returns timeout when the service takes too long', async () => {
    vi.useFakeTimers()
    setOnline(true)
    // A fetch that only ends when it is aborted.
    const fake = stubFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
    )
    const pending = requestDraft('text')
    await vi.advanceTimersByTimeAsync(PACK_TIMEOUT_SECONDS * 1000)
    expect(await pending).toEqual({ ok: false, reason: 'timeout' })
    expect(fake).toHaveBeenCalledTimes(1)
  })

  it('returns server for a non-2xx response', async () => {
    setOnline(true)
    const fake = stubFetch(async () => new Response('{"error":"x"}', { status: 500 }))
    expect(await requestDraft('text')).toEqual({ ok: false, reason: 'server' })
    expect(fake).toHaveBeenCalledTimes(1)
  })

  it('returns server when the network fails', async () => {
    setOnline(true)
    const fake = stubFetch(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(await requestDraft('text')).toEqual({ ok: false, reason: 'server' })
    expect(fake).toHaveBeenCalledTimes(1)
  })

  it('returns bad_json when a 2xx body is not valid JSON', async () => {
    setOnline(true)
    const fake = stubFetch(async () => new Response('not json', { status: 200 }))
    expect(await requestDraft('text')).toEqual({ ok: false, reason: 'bad_json' })
    expect(fake).toHaveBeenCalledTimes(1)
  })
})

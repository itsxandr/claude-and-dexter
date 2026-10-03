// Fingerprint: a short code that identifies one exact lesson text.
// See design.md, "Fingerprint". Requirement 3.2: the phone computes it from
// the final Lesson_Text. The same text always gives the same Fingerprint, on
// every phone, so it is also the pack `id`.
//
// SHA-256 is a standard "hash": it turns any text into 64 hex characters, and
// a tiny change in the text gives a completely different result.

export async function fingerprint(text: string): Promise<string> {
  // Turn the text into UTF-8 bytes (so letters like "ñ" hash the same way
  // everywhere), then let the browser's built-in crypto hash them.
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  // Write each byte as two lowercase hex characters.
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

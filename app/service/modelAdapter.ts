/*
 * Model adapter: OpenAI API facts, checked against the docs (task 3.1).
 *
 * Endpoint: POST https://api.openai.com/v1/responses (Responses API), plain fetch,
 *   header `Authorization: Bearer <MODEL_API_KEY>`. Model comes from env MODEL_ID only.
 *
 * (a) Model: the MODEL_ID value is listed in the models docs with the Responses
 *     endpoint, Structured Outputs, reasoning tokens, and 128,000 max output tokens.
 *     GET /v1/models/{MODEL_ID} with our key returned 200, so the key can use it.
 * (b) JSON-only output: `text: { format: { type: "json_object" } }` (JSON mode).
 *     The word "JSON" must appear in the prompt or the API returns an error.
 *     (Stricter option: `text.format.type: "json_schema"` with `strict: true`.)
 * (c) Low reasoning effort: `reasoning: { effort: "low" }`.
 *     Supported values: none, low, medium (default), high, xhigh, max.
 * (d) Output token cap: `max_output_tokens` (number).
 * (e) Usage fields: `usage.input_tokens`, `usage.output_tokens`
 *     (also `usage.output_tokens_details.reasoning_tokens`, `usage.total_tokens`).
 * (f) Reasoning tokens DO count toward `max_output_tokens` (the cap covers
 *     reasoning + visible + formatting tokens) and are billed as output tokens.
 *     If the cap is hit the reply has `status: "incomplete"` and
 *     `incomplete_details.reason: "max_output_tokens"`, possibly with no visible text.
 *
 * Chosen cap: max_output_tokens = 16000.
 *   Reason: we want ~8000 visible output tokens for the PackDraft. Because reasoning
 *   tokens share the cap, we add ~8000 tokens of headroom for low-effort reasoning.
 *   The cap is only a ceiling, so it does not slow normal replies; the 80 s timeout
 *   still bounds latency. Treat an "incomplete" status as a failed draft.
 *
 * Docs:
 *   https://developers.openai.com/api/docs/models  (model page for MODEL_ID)
 *   https://developers.openai.com/api/docs/guides/reasoning
 *   https://developers.openai.com/api/docs/guides/structured-outputs
 */

export {};

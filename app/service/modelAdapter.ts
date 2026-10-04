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

/** What the handler gets back. `json` is the model's raw text (may still have fences). */
export interface DraftResult {
  json: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Thrown when MODEL_ID or MODEL_API_KEY is missing. The message names the
 * variable only, never a value. The handler maps this to 500 not_configured.
 */
export class ConfigError extends Error {
  readonly variable: string;
  constructor(variable: string) {
    super(`Missing environment variable: ${variable}`);
    this.name = "ConfigError";
    this.variable = variable;
  }
}

const OPENAI_URL = "https://api.openai.com/v1/responses";
export const MODEL_TIMEOUT_MS = 80_000;
export const MAX_OUTPUT_TOKENS = 16000; // see the 3.1 comment above for the reason

/** Fixed instructions. Contains the word "JSON", which JSON mode requires. */
export const PACK_PROMPT = `You make a study pack for a Grade 7 student in the Philippines who reads below grade level.
The lesson is given as numbered paragraphs, each starting with "[n]".

Return only one JSON object with exactly this shape and nothing else:
{
  "summaries": [
    { "level": 1, "text": "...", "paragraphs": [1, 2] },
    { "level": 2, "text": "...", "paragraphs": [1, 3] },
    { "level": 3, "text": "...", "paragraphs": [2, 3] }
  ],
  "questions": [
    {
      "skill": "main_idea",
      "level": 1,
      "prompt": "...",
      "choices": ["...", "...", "..."],
      "answerIndex": 0,
      "hints": [
        { "text": "...", "paragraph": 2 },
        { "text": "...", "paragraph": 2 }
      ],
      "explanation": { "text": "...", "paragraph": 2 }
    }
  ],
  "glossary": [
    { "en": "...", "fil": "...", "meaning": "..." }
  ]
}

Rules:
- "summaries": exactly 3 items, one for each level 1, 2, 3. Each is a short summary of the whole lesson.
- "skill" is one of: "main_idea", "detail", "vocabulary", "inference".
- "level" is 1, 2, or 3. Level 1 uses very simple, common words and very short sentences. Level 2 is a bit harder. Level 3 is close to Grade 7 level.
- Make exactly 2 questions for every skill at every level: 4 skills x 3 levels x 2 = 24 questions.
- "choices" has 2 to 4 options. "answerIndex" is the 0-based index of the one correct choice.
- "hints" has exactly 2 items. Hints help the student find the answer without giving it away.
- "explanation" says the correct answer and a short reason.
- Every "paragraph" and every number in "paragraphs" must be a paragraph number that exists in the lesson.
- Refer to paragraphs by number only. Never copy paragraph text into the JSON.
- "glossary": 3 to 8 key terms from the lesson. "en" is the English term, "fil" is the Filipino term, "meaning" is one short sentence in plain words.
- Write every summary, prompt, choice, hint, explanation and glossary "meaning" in the same language as the lesson. If the lesson is in Filipino, write them in Filipino. Do not translate the lesson into English.
- Use short sentences everywhere. Use only facts from the lesson.`;

function readEnv(name: "MODEL_ID" | "MODEL_API_KEY"): string {
  const value = process.env[name];
  if (!value) throw new ConfigError(name);
  return value;
}

/** The few Responses API reply fields we read. Everything is optional on purpose. */
interface ModelReply {
  status?: string;
  incomplete_details?: { reason?: string } | null;
  output_text?: string;
  output?: { content?: { type?: string; text?: string }[] }[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

/** Visible text from a Responses API reply. */
function extractText(reply: ModelReply): string {
  if (typeof reply?.output_text === "string" && reply.output_text.length > 0) {
    return reply.output_text;
  }
  let text = "";
  for (const item of Array.isArray(reply?.output) ? reply.output : []) {
    for (const part of Array.isArray(item?.content) ? item.content : []) {
      if (part?.type === "output_text" && typeof part.text === "string") text += part.text;
    }
  }
  return text;
}

/**
 * Ask the model for a PackDraft. Throws ConfigError for missing env vars and a
 * plain Error for HTTP errors, timeouts, incomplete replies, or empty output.
 * Never logs or returns the key or the lesson text.
 */
export async function generateDraft(lessonText: string): Promise<DraftResult> {
  const model = readEnv("MODEL_ID");
  const apiKey = readEnv("MODEL_API_KEY");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
  try {
    let res: Response;
    try {
      res = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          instructions: PACK_PROMPT,
          input: `Make the study pack as one JSON object for this lesson:\n\n${lessonText}`,
          text: { format: { type: "json_object" } },
          reasoning: { effort: "low" },
          max_output_tokens: MAX_OUTPUT_TOKENS,
          store: false,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if (controller.signal.aborted) throw new Error("Model call timed out");
      throw new Error("Model call failed (network)", { cause: err });
    }

    if (!res.ok) throw new Error(`Model call failed with HTTP ${res.status}`);

    const reply: any = await res.json();
    if (reply?.status === "incomplete") {
      const reason = reply?.incomplete_details?.reason ?? "unknown";
      throw new Error(`Model reply incomplete: ${reason}`);
    }

    const json = extractText(reply);
    if (!json) throw new Error("Model reply had no text");

    return {
      json,
      inputTokens: Number(reply?.usage?.input_tokens) || 0,
      outputTokens: Number(reply?.usage?.output_tokens) || 0,
    };
  } finally {
    clearTimeout(timer);
  }
}

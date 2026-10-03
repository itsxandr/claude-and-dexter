// Pack_Service (Req 3.5, 3.6). Vercel turns this file into POST /api/pack.
// It sends the Lesson_Text to the model adapter and returns the draft as JSON.
// It keeps nothing: no database, no file writes. It logs one line per request
// with status, token counts, and seconds. Never the lesson text, pack, or key.
import type { IncomingMessage, ServerResponse } from "node:http";
import { MAX_LESSON_CHARS } from "../src/config.js";
import { ConfigError, generateDraft, type DraftResult } from "../service/modelAdapter.js";

/** What the handler needs from outside. Tests can pass fakes here. */
export interface PackDeps {
  generateDraft: (lessonText: string) => Promise<DraftResult>;
  log: (line: string) => void;
}

/** Vercel adds `body` to the request. Plain Node does not, so it is optional. */
type PackRequest = IncomingMessage & { body?: unknown };

/** Removes a ```json ... ``` (or plain ```) wrapper if the model added one. */
export function stripFences(text: string): string {
  const trimmed = text.trim();
  const match = /^```[\w-]*[ \t]*\r?\n?([\s\S]*?)\r?\n?```$/.exec(trimmed);
  return match ? match[1].trim() : trimmed;
}

/** Reads the raw request body as text (used when Vercel did not parse it). */
async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Returns the lessonText string, or null if the body is not valid. */
async function readLessonText(req: PackRequest): Promise<string | null> {
  let body: unknown;
  try {
    // On Vercel, reading `req.body` parses JSON and throws if the JSON is bad.
    body = req.body;
    if (body === undefined) {
      const raw = await readBody(req);
      body = raw ? JSON.parse(raw) : undefined;
    } else if (typeof body === "string") {
      body = JSON.parse(body);
    }
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null) return null;
  const lessonText = (body as { lessonText?: unknown }).lessonText;
  if (typeof lessonText !== "string" || lessonText.length === 0) return null;
  if (lessonText.length > MAX_LESSON_CHARS) return null;
  return lessonText;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

/** Builds the handler. The default export below uses the real adapter. */
export function createPackHandler(deps: PackDeps) {
  return async function handler(req: PackRequest, res: ServerResponse): Promise<void> {
    const started = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;

    const finish = (status: number, payload: unknown): void => {
      sendJson(res, status, payload);
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      // Only numbers go in the log line. No text from the request or the model.
      deps.log(
        `pack status=${status} input_tokens=${inputTokens} output_tokens=${outputTokens} seconds=${seconds}`,
      );
    };

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return finish(405, { error: "method_not_allowed" });
    }

    const lessonText = await readLessonText(req);
    if (lessonText === null) return finish(400, { error: "bad_request" });

    let draft: DraftResult;
    try {
      draft = await deps.generateDraft(lessonText);
    } catch (err) {
      if (err instanceof ConfigError || (err as Error)?.name === "ConfigError") {
        return finish(500, { error: "not_configured" });
      }
      // Adapter error or timeout. The error message is not logged on purpose.
      return finish(502, { error: "model_failed" });
    }
    inputTokens = draft.inputTokens;
    outputTokens = draft.outputTokens;

    let pack: unknown;
    try {
      pack = JSON.parse(stripFences(draft.json));
    } catch {
      return finish(502, { error: "bad_model_output" });
    }
    return finish(200, pack);
  };
}

export default createPackHandler({
  generateDraft,
  log: (line) => console.log(line),
});

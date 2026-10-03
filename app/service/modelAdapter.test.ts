import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigError, MAX_OUTPUT_TOKENS, generateDraft } from "./modelAdapter.ts";

const FAKE_KEY = "sk-test-secret";
const LESSON = "[1] The sun is a star.\n\n[2] It gives us light.";

function replyWith(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("generateDraft", () => {
  beforeEach(() => {
    vi.stubEnv("MODEL_ID", "test-model");
    vi.stubEnv("MODEL_API_KEY", FAKE_KEY);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("sends the confirmed parameters and returns text plus token counts", async () => {
    const fetchMock = vi.fn(async () =>
      replyWith({
        status: "completed",
        output: [{ type: "message", content: [{ type: "output_text", text: '{"summaries":[]}' }] }],
        usage: { input_tokens: 120, output_tokens: 340 },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateDraft(LESSON);
    expect(result).toEqual({ json: '{"summaries":[]}', inputTokens: 120, outputTokens: 340 });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${FAKE_KEY}`);
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("test-model");
    expect(body.input).toContain(LESSON);
    expect(body.input).toContain("JSON");
    expect(body.text).toEqual({ format: { type: "json_object" } });
    expect(body.reasoning).toEqual({ effort: "low" });
    expect(body.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
    expect(body.instructions).toContain("JSON");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("prefers output_text when present", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => replyWith({ output_text: "{}", usage: { input_tokens: 1, output_tokens: 2 } })));
    expect((await generateDraft(LESSON)).json).toBe("{}");
  });

  it.each(["MODEL_ID", "MODEL_API_KEY"])("throws ConfigError naming %s when it is missing", async (name) => {
    vi.stubEnv(name, "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const err = await generateDraft(LESSON).catch((e) => e);
    expect(err).toBeInstanceOf(ConfigError);
    expect(err.message).toContain(name);
    expect(err.message).not.toContain(FAKE_KEY);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws a plain error on HTTP failure and on an incomplete reply", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => replyWith({ error: {} }, 500)));
    const httpErr = await generateDraft(LESSON).catch((e) => e);
    expect(httpErr).not.toBeInstanceOf(ConfigError);
    expect(httpErr.message).toContain("500");

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => replyWith({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] })),
    );
    await expect(generateDraft(LESSON)).rejects.toThrow("incomplete");
  });

  it("aborts after 80 seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
          }),
      ),
    );
    const pending = generateDraft(LESSON).catch((e) => e);
    await vi.advanceTimersByTimeAsync(80_000);
    const err = await pending;
    expect(err.message).toContain("timed out");
  });
});

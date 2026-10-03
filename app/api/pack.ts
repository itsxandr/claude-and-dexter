// Pack_Service stub (task 1.2). Vercel turns this file into POST /api/pack.
// For now it only returns a fixed reply so we can check the deploy works.
// Task 3.3 replaces this with the real handler.
import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, stub: true }));
}

import { createOpenAI } from "@ai-sdk/openai";

/**
 * Server-only OpenAI provider for Hiraya.
 *
 * Keep OPENAI_API_KEY server-side. Never expose it through a VITE_ variable.
 */
export function createHirayaAiProvider(apiKey: string) {
  return createOpenAI({ apiKey });
}

/** Override with HIRAYA_MODEL in the server environment when needed. */
export const HIRAYA_MODEL = process.env["HIRAYA_MODEL"] || "gpt-5.6-luna";

export function getGatewayKey() {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) {
    throw new Error(
      "The AI assistant isn't configured yet. Add OPENAI_API_KEY to the server environment.",
    );
  }
  return key;
}

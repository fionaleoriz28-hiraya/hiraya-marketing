import { createOpenAI } from "@ai-sdk/openai";

/**
 * Server-only AI provider for Hiraya, pointed at the Lovable AI Gateway.
 *
 * The gateway key is read at call time and never leaves the server.
 */
export const HIRAYA_MODEL = "openai/gpt-6-astra";

export function getGatewayKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    throw new Error("The AI assistant isn't configured yet. Please try again later.");
  }
  return key;
}

export function createHirayaAiProvider(apiKey: string) {
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Reasoning + stateless options every gateway call needs. */
export const HIRAYA_PROVIDER_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

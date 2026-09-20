import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Server-only Lovable AI Gateway provider.
 */
export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: true,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const HIRAYA_MODEL = process.env["HIRAYA_MODEL"] || "openai/gpt-6-astra";

export function getGatewayKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    throw new Error(
      "The AI assistant isn't configured yet. Please try again in a moment or contact support.",
    );
  }
  return key;
}

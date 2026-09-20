import { createServerFn } from "@tanstack/react-start";
import { generateText, streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const businessSchema = z.object({
  name: z.string().default("this business"),
  industry: z.string().default(""),
  location: z.string().default(""),
  audience: z.string().default(""),
  goals: z.string().default(""),
  monthlyBudget: z.string().default(""),
  platforms: z.string().default(""),
});

type BusinessInput = z.infer<typeof businessSchema>;

function businessBrief(b: BusinessInput) {
  return [
    `Business name: ${b.name || "not given"}`,
    `Industry: ${b.industry || "not given"}`,
    `Location: ${b.location || "not given"}`,
    `Target audience: ${b.audience || "not given"}`,
    `Goals: ${b.goals || "not given"}`,
    `Monthly marketing budget: ${b.monthlyBudget || "not given"}`,
    `Platforms used: ${b.platforms || "not given"}`,
  ].join("\n");
}

const SYSTEM = [
  "You are Hiraya, a practical digital marketing consultant for small businesses.",
  "Many clients are small Filipino businesses, so keep advice low-budget, realistic and specific.",
  "Never invent metrics the owner did not provide. Be concrete: name platforms, formats, posting frequency and peso-level budgets when a budget is given.",
].join(" ");

async function runStructured<T>(schema: z.ZodType<T>, prompt: string): Promise<T> {
  const { createLovableAiGatewayProvider, getGatewayKey, HIRAYA_MODEL } = await import("./ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(getGatewayKey());
  try {
    const result = streamText({
      model: gateway(HIRAYA_MODEL),
      system: SYSTEM,
      prompt,
      output: Output.object({ schema }),
      providerOptions: { lovable: { reasoningEffort: "low" } },
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) throw new Error("The AI could not put together a usable answer. Please try again.");
    throw error;
  }
}

const auditResultSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.array(z.object({ title: z.string(), action: z.string(), effort: z.string() })),
});

export const analyzeAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ business: businessSchema, score: z.number(), answers: z.record(z.string(), z.union([z.string(), z.number()])) }).parse(data))
  .handler(async ({ data }) => runStructured(auditResultSchema, [businessBrief(data.business), "", `Brand awareness audit score: ${data.score} out of 100.`, "Audit answers (question: answer):", Object.entries(data.answers).map(([q, a]) => `- ${q}: ${a}`).join("\n"), "", "Write a 2-3 sentence plain-language summary of their brand awareness right now.", "List 2-4 strengths and 2-4 gaps, each one short sentence.", "Then give 4-6 recommendations. For each: a short title, one concrete action, and effort as 'Quick win', 'Medium' or 'Bigger project'."].join("\n")));

const contentPlanSchema = z.object({
  theme: z.string(),
  items: z.array(z.object({ platform: z.string(), dayOffset: z.number(), theme: z.string(), caption: z.string(), hashtags: z.string() })),
});

export const generateContentPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ business: businessSchema, days: z.number(), focus: z.string().default(""), startDate: z.string() }).parse(data))
  .handler(async ({ data }) => runStructured(contentPlanSchema, [businessBrief(data.business), "", `Plan social media content for the ${data.days} days starting ${data.startDate}.`, data.focus ? `Special focus for this period: ${data.focus}` : "", "Give one overall theme for the period, then between 6 and 12 posts.", "For each post: the platform (only ones they use, if listed), dayOffset as a whole number of days from the start date (0 = start date, never negative, never past the last day), a short post theme, a ready-to-use caption and hashtags.", "Vary formats: reels, carousels, single photos, stories, customer stories, behind the scenes, offers."].filter(Boolean).join("\n")));

const strategySchema = z.object({
  title: z.string(), summary: z.string(), positioning: z.string(),
  pillars: z.array(z.object({ name: z.string(), description: z.string() })),
  channels: z.array(z.object({ channel: z.string(), plan: z.string() })),
  monthlyActions: z.array(z.string()), kpis: z.array(z.string()),
});

export const generateStrategy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ business: businessSchema, notes: z.string().default("") }).parse(data))
  .handler(async ({ data }) => runStructured(strategySchema, [businessBrief(data.business), data.notes ? `Extra context from the owner: ${data.notes}` : "", "", "Build a 90-day digital marketing strategy.", "Include a short title, a 2-3 sentence summary, a positioning statement, 3-4 content pillars, a plan per channel they use, 5-8 concrete monthly actions, and 4-6 measurable KPIs.", "Keep everything achievable for a small team with the stated budget."].filter(Boolean).join("\n")));

const adPlanSchema = z.object({
  summary: z.string(),
  campaigns: z.array(z.object({ name: z.string(), platform: z.string(), objective: z.string(), budgetShare: z.string(), targeting: z.string(), adCopy: z.string(), expected: z.string() })),
});

export const generateAdPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ business: businessSchema, budget: z.string().default(""), objective: z.string().default("") }).parse(data))
  .handler(async ({ data }) => runStructured(adPlanSchema, [businessBrief(data.business), data.budget ? `Total ad budget for this push: ${data.budget}` : "", data.objective ? `Main objective: ${data.objective}` : "", "", "Propose 2-4 paid ad campaigns.", "For each: a name, the platform, the campaign objective, budgetShare as an amount or percentage of the budget, who to target (age, location, interests, behaviours), one ready-to-use ad copy, and a realistic expected outcome without guaranteeing results.", "Start with a 2 sentence summary of the overall approach."].filter(Boolean).join("\n")));

const growthInsightsSchema = z.object({
  summary: z.string(),
  diagnosis: z.array(z.string()),
  priorities: z.array(z.object({ title: z.string(), action: z.string(), metric: z.string() })),
  experiment: z.object({ hypothesis: z.string(), action: z.string(), duration: z.string(), successSignal: z.string() }),
});

export const generateGrowthInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ business: businessSchema, snapshots: z.array(z.object({ period: z.string(), platform: z.string(), followers: z.number(), reach: z.number(), leads: z.number() })).max(120), posts: z.array(z.object({ title: z.string(), platform: z.string(), reach: z.number(), likes: z.number(), comments: z.number(), shares: z.number() })).max(120) }).parse(data))
  .handler(async ({ data }) => runStructured(growthInsightsSchema, [businessBrief(data.business), "", "Analyze the owner's recorded marketing growth data.", `Growth snapshots (JSON): ${JSON.stringify(data.snapshots)}`, `Recent post performance (JSON): ${JSON.stringify(data.posts)}`, "Do not invent missing data or claim causation. Explain the clearest patterns and limitations in 2-3 sentences.", "Give 3-5 prioritized actions. Each needs a short title, one concrete action, and the metric to monitor.", "Finish with one low-cost experiment containing a hypothesis, action, duration and success signal. Keep the recommendations practical for a small business."].join("\n")));

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ business: businessSchema, history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(10).default([]), question: z.string().trim().min(1).max(2000) }).parse(data))
  .handler(async ({ data }) => {
    const { createLovableAiGatewayProvider, getGatewayKey, HIRAYA_MODEL } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(getGatewayKey());
    try {
      const result = await generateText({ model: gateway(HIRAYA_MODEL), system: `${SYSTEM}\n\nThe owner's business:\n${businessBrief(data.business)}\n\nAnswer in at most 220 words. Use short paragraphs or bullet points. If the question needs a human specialist, say so.`, messages: [...data.history.slice(-10).map((m) => ({ role: m.role, content: m.content }) as const), { role: "user" as const, content: data.question }], maxOutputTokens: 450, providerOptions: { lovable: { reasoningEffort: "low" } } });
      const answer = result.text.trim();
      if (!answer) throw new Error("The AI returned an empty answer. Please try again.");
      return { answer };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) throw new Error("The AI could not generate a usable answer. Please try again.");
      throw new Error(error instanceof Error ? `AI assistant error: ${error.message}` : "The AI assistant could not answer right now. Please try again.");
    }
  });

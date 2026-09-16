import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { analyzeAudit } from "@/lib/ai.functions";
import { friendlyError, toAiBusiness, useBusiness } from "@/lib/business";
import { useInsertRow, useRows, type Audit } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Brand awareness audit — Hiraya Marketing" },
      {
        name: "description",
        content: "Check how visible your brand is and where to improve, step by step.",
      },
      { property: "og:title", content: "Brand awareness audit — Hiraya Marketing" },
      { property: "og:description", content: "See how visible your brand is today." },
    ],
  }),
  component: AuditPage,
});

type Option = { label: string; points: number };

const QUESTIONS: { key: string; question: string; options: Option[] }[] = [
  {
    key: "Profile completeness",
    question: "How complete are your social media and business profiles?",
    options: [
      { label: "Complete with photo, description, hours and contact", points: 20 },
      { label: "Mostly filled in, a few gaps", points: 13 },
      { label: "Just a name and a photo", points: 6 },
      { label: "No proper profile yet", points: 0 },
    ],
  },
  {
    key: "Posting consistency",
    question: "How often do you post?",
    options: [
      { label: "Several times a week, on a schedule", points: 20 },
      { label: "About once a week", points: 14 },
      { label: "A few times a month", points: 7 },
      { label: "Rarely or only when I remember", points: 0 },
    ],
  },
  {
    key: "Consistent branding",
    question: "Do your posts look and sound like one brand?",
    options: [
      { label: "Yes — same colours, logo and tone everywhere", points: 20 },
      { label: "Mostly consistent", points: 13 },
      { label: "It varies a lot", points: 6 },
      { label: "I have no set look or tone", points: 0 },
    ],
  },
  {
    key: "Customer reviews",
    question: "How many customer reviews or testimonials do you have?",
    options: [
      { label: "Many recent reviews and I reply to them", points: 20 },
      { label: "Some reviews, mostly older", points: 13 },
      { label: "One or two", points: 6 },
      { label: "None yet", points: 0 },
    ],
  },
  {
    key: "Discoverability",
    question: "How easy is it for a new customer to find you online?",
    options: [
      { label: "We show up on search and maps with correct details", points: 20 },
      { label: "Findable if you know our name", points: 12 },
      { label: "Only through social media", points: 6 },
      { label: "Hard to find at all", points: 0 },
    ],
  },
];

type Result = {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: { title: string; action: string; effort: string }[];
};

function band(score: number) {
  if (score >= 75) return "Strong";
  if (score >= 45) return "Getting there";
  return "Needs work";
}

function AuditPage() {
  const { data: business } = useBusiness();
  const { data: audits } = useRows<Audit>("audits", "created_at");
  const insertAudit = useInsertRow("audits");
  const runAnalysis = useServerFn(analyzeAudit);

  const [answers, setAnswers] = useState<Record<string, Option>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === QUESTIONS.length;

  async function submit() {
    const total = QUESTIONS.reduce((sum, q) => sum + (answers[q.key]?.points ?? 0), 0);
    const answerText = Object.fromEntries(
      Object.entries(answers).map(([key, option]) => [key, option.label]),
    );
    setScore(total);
    setRunning(true);
    setResult(null);
    try {
      const output = (await runAnalysis({
        data: { business: toAiBusiness(business), score: total, answers: answerText },
      })) as Result;
      setResult(output);
      await insertAudit.mutateAsync({
        score: total,
        summary: output.summary,
        strengths: output.strengths,
        gaps: output.gaps,
        recommendations: output.recommendations,
        answers: answerText,
      });
      toast.success("Audit saved");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Brand awareness audit"
        subtitle="Answer a few questions about your presence and get a clear score with next steps."
      />

      <div className="card-soft space-y-6 p-6">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="space-y-3">
            <Label className="text-sm font-medium">{q.question}</Label>
            <div className="grid gap-2">
              {q.options.map((option) => {
                const selected = answers[q.key]?.label === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: option }))}
                    className={
                      selected
                        ? "rounded-md border border-primary bg-primary/10 px-4 py-2.5 text-left text-sm"
                        : "rounded-md border border-border bg-background px-4 py-2.5 text-left text-sm hover:bg-secondary"
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <Button onClick={submit} disabled={!allAnswered || running}>
          {running ? "Checking your brand…" : "Get my score"}
        </Button>
        {!allAnswered && (
          <p className="text-xs text-muted-foreground">
            {answered} of {QUESTIONS.length} answered
          </p>
        )}
      </div>

      {score !== null && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <StatCard label="Awareness score" value={`${score}/100`} hint={band(score)} />
          {result && (
            <div className="card-soft p-5">
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Summary</p>
              <p className="mt-2 text-sm">{result.summary}</p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-soft p-5">
            <h2 className="font-display text-base font-semibold">Strengths</h2>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {result.strengths.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="card-soft p-5">
            <h2 className="font-display text-base font-semibold">Gaps</h2>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {result.gaps.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="card-soft p-5 sm:col-span-2">
            <h2 className="font-display text-base font-semibold">What to do next</h2>
            <div className="mt-3 space-y-3">
              {result.recommendations.map((rec) => (
                <div key={rec.title} className="rounded-md border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{rec.title}</p>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs whitespace-nowrap">
                      {rec.effort}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!!audits?.length && (
        <div className="card-soft mt-6 p-5">
          <h2 className="font-display text-base font-semibold">Past audits</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {audits.map((audit) => (
              <li key={audit.id} className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">
                  {new Date(audit.created_at).toLocaleDateString()}
                </span>
                <span className="font-medium">
                  {audit.score}/100 · {band(audit.score)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

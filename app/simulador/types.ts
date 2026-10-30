export type FeedbackQuestion = {
  question: string;
  answer: string;
  score?: number;
  analysis: string;
  suggestion: string;
};

export type FeedbackIndicator = { name: string; score: number };

export type FeedbackReport = {
  score: number;
  level?: string;
  verdict?: string;
  topPriority?: string;
  nextStep?: string;
  summary: string;
  indicators?: FeedbackIndicator[];
  strengths: string[];
  improvements: string[];
  questions: FeedbackQuestion[];
};

export function normalizeFeedbackReport(raw: unknown): FeedbackReport {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const n = Number(r.score);
  return {
    score: Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0,
    level: typeof r.level === "string" ? r.level : undefined,
    verdict: typeof r.verdict === "string" ? r.verdict : undefined,
    topPriority: typeof r.topPriority === "string" ? r.topPriority : undefined,
    nextStep: typeof r.nextStep === "string" ? r.nextStep : undefined,
    summary: typeof r.summary === "string" ? r.summary : "",
    indicators: arr(r.indicators)
      .filter((i): i is FeedbackIndicator => Boolean(i && typeof i === "object" && typeof (i as FeedbackIndicator).name === "string"))
      .map((i) => ({ name: String(i.name), score: Number(i.score) || 0 })),
    strengths: arr(r.strengths).filter((s): s is string => typeof s === "string"),
    improvements: arr(r.improvements).filter((s): s is string => typeof s === "string"),
    questions: arr(r.questions)
      .filter((q): q is FeedbackQuestion => Boolean(q && typeof q === "object" && typeof (q as FeedbackQuestion).question === "string"))
      .map((q) => ({
        question: String(q.question),
        answer: typeof q.answer === "string" ? q.answer : "",
        score: typeof q.score === "number" ? q.score : undefined,
        analysis: typeof q.analysis === "string" ? q.analysis : "",
        suggestion: typeof q.suggestion === "string" ? q.suggestion : "",
      })),
  };
}


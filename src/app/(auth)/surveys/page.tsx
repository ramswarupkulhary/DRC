"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Star, Check } from "lucide-react";

interface PendingSurvey {
  surveyId: string;
  rideTitle: string;
  rideDate: string;
}

interface SurveyQuestion {
  id: string;
  type: "rating" | "text" | "nps";
  question: string;
  max?: number;
}

export default function SurveysPage() {
  const [pending, setPending] = useState<PendingSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/surveys/pending")
      .then((r) => r.json())
      .then((d) => { setPending(d); setLoading(false); });
  }, []);

  async function startSurvey(surveyId: string) {
    const res = await fetch(`/api/surveys/${surveyId}`);
    const data = await res.json();
    setQuestions(JSON.parse(data.questions));
    setActiveSurvey(surveyId);
    setAnswers({});
    setSubmitted(false);
  }

  async function submitSurvey() {
    if (!activeSurvey) return;
    setSubmitting(true);
    const npsQ = questions.find((q) => q.type === "nps");
    await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surveyId: activeSurvey,
        answers,
        npsScore: npsQ ? answers[npsQ.id] || null : null,
      }),
    });
    setSubmitting(false);
    setSubmitted(true);
    setPending((prev) => prev.filter((p) => p.surveyId !== activeSurvey));
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-heading text-2xl font-bold">Thanks for your feedback!</h2>
        <p className="text-muted">Your response helps us make future rides even better.</p>
        <Button onClick={() => { setActiveSurvey(null); setSubmitted(false); }}>
          {pending.length > 0 ? "Next Survey" : "Done"}
        </Button>
      </div>
    );
  }

  if (activeSurvey) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <SectionHeader title="Ride Feedback" subtitle="Takes about 2 minutes" align="left" />
        {questions.map((q) => (
          <div key={q.id} className="bg-surface border border-border rounded-sm p-5 space-y-3">
            <p className="font-medium text-sm">{q.question}</p>
            {q.type === "rating" && (
              <div className="flex gap-2">
                {Array.from({ length: q.max || 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: i + 1 }))}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-7 h-7 ${(answers[q.id] as number) >= i + 1 ? "text-orange fill-orange" : "text-border"}`}
                    />
                  </button>
                ))}
              </div>
            )}
            {q.type === "nps" && (
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: i }))}
                    className={`w-10 h-10 rounded-sm text-sm font-semibold border transition-colors ${
                      answers[q.id] === i
                        ? "bg-orange text-white border-orange"
                        : "border-border hover:border-orange/50"
                    }`}
                  >
                    {i}
                  </button>
                ))}
                <div className="w-full flex justify-between text-xs text-muted mt-1">
                  <span>Not likely</span>
                  <span>Very likely</span>
                </div>
              </div>
            )}
            {q.type === "text" && (
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                placeholder="Your thoughts..."
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none resize-none"
                rows={3}
              />
            )}
          </div>
        ))}
        <Button onClick={submitSurvey} loading={submitting} className="w-full">Submit Feedback</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader accent="Your voice matters" title="Ride Surveys" subtitle="Help us improve by sharing your experience" align="left" />
      {pending.length === 0 ? (
        <div className="bg-surface border border-border rounded-sm p-8 text-center">
          <p className="text-muted">No pending surveys. Check back after your next ride!</p>
        </div>
      ) : (
        pending.map((s) => (
          <div key={s.surveyId} className="bg-surface border border-border rounded-sm p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{s.rideTitle}</h3>
              <p className="text-xs text-muted">{new Date(s.rideDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <Button size="sm" onClick={() => startSurvey(s.surveyId)}>Take Survey</Button>
          </div>
        ))
      )}
    </div>
  );
}

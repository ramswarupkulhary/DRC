"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface Result {
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  recommendations: string[];
}

export default function SkillAssessmentPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/skill-assessment")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
        setLoading(false);
      });
  }, []);

  function selectAnswer(index: number) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch("/api/skill-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>;

  if (result) {
    const levelColor = result.level === "beginner" ? "success" : result.level === "intermediate" ? "warning" : "orange";
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full border-4 border-orange flex items-center justify-center mx-auto">
            <span className="font-heading text-3xl font-bold text-orange">{result.percentage}%</span>
          </div>
          <h2 className="font-heading text-3xl font-bold">Your Skill Level</h2>
          <Badge variant={levelColor} className="text-lg px-4 py-1">{result.level.toUpperCase()}</Badge>
          <p className="text-muted">Score: {result.score}/{result.maxScore}</p>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-tan">Recommended Programs</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-orange rounded-full shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/trainings"><Button>Browse Training Programs</Button></Link>
          <Link href="/rides"><Button variant="outline">Browse Rides</Button></Link>
        </div>
      </div>
    );
  }

  const allAnswered = answers.every((a) => a >= 0);
  const progress = answers.filter((a) => a >= 0).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader accent="Know your level" title="Skill Assessment" align="left" subtitle="Answer these questions honestly to find programs suited to your level." />

      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
            <div className="h-full bg-orange transition-all" style={{ width: `${(progress / questions.length) * 100}%` }} />
          </div>
          <span className="text-xs text-muted">{progress}/{questions.length}</span>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted uppercase tracking-wider">Question {currentQ + 1} of {questions.length}</span>
          </div>
          <h3 className="font-heading text-xl font-semibold">{questions[currentQ].question}</h3>
          <div className="space-y-3">
            {questions[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-sm border transition-colors cursor-pointer ${
                  answers[currentQ] === i
                    ? "border-orange bg-orange/10 text-foreground"
                    : "border-border bg-background hover:border-orange/50"
                }`}
              >
                <span className="text-sm">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
            Previous
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={answers[currentQ] < 0}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!allAnswered} loading={submitting}>
              Get Results
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

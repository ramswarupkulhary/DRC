import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const questions = [
  { id: 1, question: "How long have you been riding motorcycles?", options: ["Less than 6 months", "6 months - 2 years", "2 - 5 years", "5+ years"], scores: [1, 2, 3, 4] },
  { id: 2, question: "Have you ridden off-road before?", options: ["Never", "A few times on easy terrain", "Regularly on moderate trails", "Extensively on all terrain types"], scores: [1, 2, 3, 4] },
  { id: 3, question: "Can you comfortably ride standing on the pegs?", options: ["No, I've never tried", "I can for short periods", "Yes, comfortably for extended periods", "Yes, including over obstacles"], scores: [1, 2, 3, 4] },
  { id: 4, question: "How comfortable are you with steep inclines and descents?", options: ["Not comfortable at all", "Can handle gentle slopes", "Comfortable with moderate grades", "Can handle steep and technical terrain"], scores: [1, 2, 3, 4] },
  { id: 5, question: "Have you ever crossed a water body on a motorcycle?", options: ["Never", "Small puddles only", "Shallow streams", "Deep water crossings"], scores: [1, 2, 3, 4] },
  { id: 6, question: "What type of motorcycle do you ride?", options: ["Scooter / Small commuter", "Street / Sport bike", "Adventure / Dual sport", "Dedicated off-road / Enduro"], scores: [1, 2, 3, 4] },
  { id: 7, question: "Do you know basic motorcycle maintenance (chain tension, tire pressure)?", options: ["No", "Very basic knowledge", "Can handle routine maintenance", "Can do most repairs myself"], scores: [1, 2, 3, 4] },
  { id: 8, question: "Rate your fitness level for physically demanding riding:", options: ["Low - I get tired quickly", "Moderate - can handle a few hours", "Good - can ride all day", "Excellent - athletic and strong"], scores: [1, 2, 3, 4] },
];

export async function GET() {
  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { answers } = await req.json();

  if (!answers || !Array.isArray(answers) || answers.length !== questions.length) {
    return NextResponse.json({ error: "Please answer all questions" }, { status: 400 });
  }

  let totalScore = 0;
  for (let i = 0; i < questions.length; i++) {
    totalScore += questions[i].scores[answers[i]] || 1;
  }

  const maxScore = questions.length * 4;
  const percentage = (totalScore / maxScore) * 100;

  let level: string;
  if (percentage >= 80) level = "advanced";
  else if (percentage >= 55) level = "intermediate";
  else level = "beginner";

  const assessment = await prisma.skillAssessment.create({
    data: {
      userId,
      score: totalScore,
      level,
      answers: JSON.stringify(answers),
    },
  });

  return NextResponse.json({
    ...assessment,
    maxScore,
    percentage: Math.round(percentage),
    recommendations: level === "beginner"
      ? ["Dirt Riding Basics", "Women's Off-Road Confidence Camp"]
      : level === "intermediate"
      ? ["Trail Riding Mastery"]
      : ["Advanced rides like Coorg Expedition"],
  });
}

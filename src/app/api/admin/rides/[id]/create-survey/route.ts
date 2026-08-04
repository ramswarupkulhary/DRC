import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: { in: ["confirmed", "checked_in"] } },
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });

  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const existingSurvey = await prisma.survey.findFirst({ where: { rideId: id } });
  if (existingSurvey) return NextResponse.json({ error: "Survey already exists for this ride" }, { status: 400 });

  const survey = await prisma.survey.create({
    data: {
      rideId: id,
      title: `Feedback — ${ride.title}`,
      questions: JSON.stringify([
        { id: "overall", type: "rating", question: "How would you rate the overall experience?", max: 5 },
        { id: "trail", type: "rating", question: "How was the trail/route?", max: 5 },
        { id: "organization", type: "rating", question: "How was the organization & logistics?", max: 5 },
        { id: "highlight", type: "text", question: "What was the best part of the ride?" },
        { id: "improve", type: "text", question: "What could we improve?" },
        { id: "nps", type: "nps", question: "How likely are you to recommend DRC to a friend?", max: 10 },
      ]),
    },
  });

  for (const reg of ride.registrations) {
    try {
      await prisma.notification.create({
        data: {
          userId: reg.user.id,
          type: "survey",
          title: "Share Your Feedback!",
          message: `How was ${ride.title}? Take a quick survey and help us improve.`,
          link: "/surveys",
        },
      });
      await sendEmail({
        to: reg.user.email,
        subject: `How was ${ride.title}? Share your feedback!`,
        html: drcEmailTemplate({
          title: "We'd Love Your Feedback!",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${reg.user.name || "Rider"},</p>
            <p style="color: #B9A886; font-size: 14px;">Thanks for joining <strong style="color: #E8622C;">${ride.title}</strong>! We hope you had an amazing time.</p>
            <p style="color: #B9A886; font-size: 14px;">Take a quick 2-minute survey to help us make future rides even better.</p>
          `,
          ctaText: "Share Feedback",
          ctaUrl: "https://www.dirtridecamp.com/surveys",
        }),
      });
    } catch (err) {
      console.error("[EMAIL] Survey email failed:", err);
    }
  }

  return NextResponse.json({ survey, notified: ride.registrations.length });
}

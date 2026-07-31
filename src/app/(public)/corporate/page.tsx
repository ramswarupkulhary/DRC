"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Building2 } from "lucide-react";

const eventTypes = [
  { value: "team_ride", label: "Team Ride / Outing" },
  { value: "team_building", label: "Team Building Challenge" },
  { value: "training", label: "Corporate Training Program" },
  { value: "celebration", label: "Celebration / Milestone Event" },
  { value: "custom", label: "Custom Experience" },
];

const groupSizes = [
  { value: "10", label: "5-10 people" },
  { value: "20", label: "10-20 people" },
  { value: "30", label: "20-30 people" },
  { value: "50", label: "30-50 people" },
  { value: "100", label: "50+ people" },
];

export default function CorporatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    await fetch("/api/corporate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.get("companyName"),
        contactName: form.get("contactName"),
        email: form.get("email"),
        phone: form.get("phone") || null,
        groupSize: parseInt(form.get("groupSize") as string),
        eventType: form.get("eventType"),
        preferredDate: form.get("preferredDate") || null,
        budget: form.get("budget") || null,
        requirements: form.get("requirements") || null,
      }),
    });

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
        <Building2 className="w-16 h-16 text-orange mx-auto" />
        <h2 className="font-heading text-3xl font-bold">Inquiry Received!</h2>
        <p className="text-muted">Our team will get back to you within 24 hours with a customized proposal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <SectionHeader
        accent="Build teams that ride together"
        title="Corporate & Team Building"
        subtitle="Custom off-road experiences for companies. From team outings to leadership challenges."
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
            <h3 className="font-heading text-xl font-semibold text-tan">Why DRC for Corporate Events?</h3>
            <ul className="space-y-3 text-sm">
              {[
                "Customized experiences for groups of 5 to 50+",
                "Professional instructors and safety crew",
                "Catering, camping, and logistics handled end-to-end",
                "Custom branding options for jerseys and merchandise",
                "Photography and video documentation included",
                "Team challenges with scoring and prizes",
                "Dedicated event coordinator for your group",
                "Flexible scheduling including weekdays",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange rounded-full mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
            <h3 className="font-heading text-xl font-semibold text-tan">Starting Prices</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border rounded-sm">
                <p className="text-2xl font-bold text-orange">&#8377;1,500</p>
                <p className="text-xs text-muted mt-1">per person / half day</p>
              </div>
              <div className="text-center p-4 border border-border rounded-sm">
                <p className="text-2xl font-bold text-orange">&#8377;3,500</p>
                <p className="text-xs text-muted mt-1">per person / full day</p>
              </div>
              <div className="text-center p-4 border border-border rounded-sm">
                <p className="text-2xl font-bold text-orange">&#8377;6,000</p>
                <p className="text-xs text-muted mt-1">per person / overnight</p>
              </div>
              <div className="text-center p-4 border border-border rounded-sm">
                <p className="text-2xl font-bold text-orange">Custom</p>
                <p className="text-xs text-muted mt-1">multi-day expeditions</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 space-y-5 h-fit">
          <h3 className="font-heading text-xl font-semibold text-tan">Get a Custom Quote</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input name="companyName" id="companyName" label="Company Name" required />
            <Input name="contactName" id="contactName" label="Your Name" required />
            <Input name="email" id="email" label="Email" type="email" required />
            <Input name="phone" id="phone" label="Phone" type="tel" />
            <Select name="groupSize" id="groupSize" label="Group Size" options={groupSizes} />
            <Select name="eventType" id="eventType" label="Event Type" options={eventTypes} />
            <Input name="preferredDate" id="preferredDate" label="Preferred Date" type="date" />
            <Input name="budget" id="budget" label="Budget Range" placeholder="e.g. ₹50,000 - ₹1,00,000" />
          </div>
          <Textarea name="requirements" id="requirements" label="Special Requirements" placeholder="Tell us about your team, any specific activities you'd like, dietary requirements, etc." />
          <Button type="submit" className="w-full" loading={loading}>Submit Inquiry</Button>
        </form>
      </div>
    </div>
  );
}

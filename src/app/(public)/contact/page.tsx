"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { FadeIn, SlideIn } from "@/components/ui/Animations";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <FadeIn>
        <SectionHeader accent="Get in touch" title="Contact Us" subtitle="Questions about a ride? Want to organize a corporate event? Drop us a line." />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        <SlideIn from="left">
          {submitted ? (
            <div className="bg-success/10 border border-success/30 rounded-sm p-8 text-center">
              <p className="text-success font-heading text-xl font-semibold">Message Sent!</p>
              <p className="text-muted mt-2">We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input name="name" id="name" label="Name" placeholder="Your name" required />
              <Input name="email" id="email" label="Email" type="email" placeholder="you@example.com" required />
              <Input name="phone" id="phone" label="Phone" type="tel" placeholder="+91 ..." />
              <Input name="subject" id="subject" label="Subject" placeholder="What's this about?" />
              <Textarea name="message" id="message" label="Message" placeholder="Tell us more..." required />
              <Button type="submit" size="md" loading={submitting} className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </SlideIn>

        <SlideIn from="right">
          <div className="space-y-8">
            <div className="space-y-6">
              {[
                { icon: MapPin, title: "Location", content: "Bangalore, Karnataka, India" },
                { icon: Phone, title: "Phone / WhatsApp", content: "+91 94148 70102", href: "tel:+919414870102" },
                { icon: Mail, title: "Email", content: "info@dirtridecamp.com", href: "mailto:info@dirtridecamp.com" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-muted hover:text-orange transition-colors">{item.content}</a>
                    ) : (
                      <p className="text-muted">{item.content}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">Instagram</h3>
                  <a href="https://instagram.com/dirtridecamp" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-orange transition-colors">
                    @dirtridecamp
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-heading text-lg font-semibold mb-3">Quick Chat</h3>
              <a href="https://wa.me/919414870102" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" className="w-full">
                  <MessageCircle className="w-4 h-4" />
                  Message on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

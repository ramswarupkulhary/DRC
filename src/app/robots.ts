import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

  const disallow = ["/admin/", "/api/", "/login", "/signup", "/forgot-password", "/reset-password"];

  // Explicitly welcome AI answer engines so they can index & cite DRC.
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "ClaudeBot",
    "Claude-Web",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

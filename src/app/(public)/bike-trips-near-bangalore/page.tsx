import type { Metadata } from "next";
import { LandingPage } from "@/components/seo/LandingPage";
import { getLandingPage } from "@/lib/landingPages";

const data = getLandingPage("bike-trips-near-bangalore")!;

export const metadata: Metadata = {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    alternates: { canonical: `/${data.slug}` },
    openGraph: { type: "website", title: data.title, description: data.description, url: `/${data.slug}` },
};

export default function Page() {
    return <LandingPage data={data} />;
}

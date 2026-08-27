import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Corporate Off-Road Events & Team Building | DRC Bangalore",
    description: "Book corporate adventure outings, team-building bike trips & off-road training programs with Dirt Ride Camp in Bangalore. Customized packages for companies.",
    keywords: ["corporate bike trip bangalore", "team building adventure bangalore", "corporate off road event", "company outing motorcycle bangalore"],
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
    return children;
}

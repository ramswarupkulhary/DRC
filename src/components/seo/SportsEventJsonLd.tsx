const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

/**
 * SportsEvent JSON-LD for a race event. Enables Google rich results
 * (date, location, offers) in search listings.
 */
export function SportsEventJsonLd({
    name,
    description,
    slug,
    startDate,
    endDate,
    location,
    city,
    country = "IN",
    image,
    minPrice,
    maxPrice,
    currency = "INR",
}: {
    name: string;
    description: string;
    slug: string;
    startDate: string;
    endDate: string;
    location: string;
    city: string;
    country?: string;
    image?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name,
        description,
        startDate,
        endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        sport: "Off-road motorcycling",
        url: `${BASE_URL}/events/${slug}`,
        image: image || `${BASE_URL}/opengraph-image`,
        location: {
            "@type": "Place",
            name: location,
            address: {
                "@type": "PostalAddress",
                addressLocality: city,
                addressCountry: country,
            },
        },
        organizer: {
            "@type": "Organization",
            name: "DRC Motorsports",
            url: BASE_URL,
        },
        ...(minPrice !== undefined
            ? {
                offers: {
                    "@type": "AggregateOffer",
                    priceCurrency: currency,
                    lowPrice: minPrice,
                    highPrice: maxPrice ?? minPrice,
                    availability: "https://schema.org/InStock",
                    url: `${BASE_URL}/events/${slug}/register`,
                },
            }
            : {}),
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

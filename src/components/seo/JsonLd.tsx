const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dirtridecamp.com";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dirt Ride Camp",
    alternateName: "DRC",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    description: "Off-road adventure rides, camping trips & dirt riding training across India.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-94148-70102",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: ["https://instagram.com/dirtridecamp", "https://wa.me/919414870102"],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function RideEventJsonLd({ ride }: { ride: { title: string; slug: string; description: string; location: string; startDate: string; endDate: string; price: number; totalSlots: number; bookedSlots: number } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ride.title,
    description: ride.description.slice(0, 300),
    url: `${BASE_URL}/rides/${ride.slug}`,
    startDate: ride.startDate,
    endDate: ride.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: ride.location,
      address: { "@type": "PostalAddress", addressRegion: "Karnataka", addressCountry: "IN" },
    },
    organizer: {
      "@type": "Organization",
      name: "Dirt Ride Camp",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: ride.price,
      priceCurrency: "INR",
      availability: ride.totalSlots - ride.bookedSlots > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `${BASE_URL}/rides/${ride.slug}`,
    },
    maximumAttendeeCapacity: ride.totalSlots,
    remainingAttendeeCapacity: ride.totalSlots - ride.bookedSlots,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function BlogPostJsonLd({ post }: { post: { title: string; slug: string; excerpt?: string | null; content: string; publishedAt?: string | null; author?: string | null; coverImage?: string | null } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author || "DRC Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Dirt Ride Camp",
      url: BASE_URL,
    },
    ...(post.coverImage && { image: post.coverImage }),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

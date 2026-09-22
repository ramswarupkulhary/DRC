const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "SportsOrganization"],
    name: "DRC Motorsports",
    legalName: "DRC Motorsports Pvt Ltd",
    alternateName: ["DRC", "DRC Racing", "Dirt Ride Camp", "DirtRideCamp"],
    url: BASE_URL,
    logo: `${BASE_URL}/brand/drc-logo-main.png`,
    image: `${BASE_URL}/opengraph-image`,
    description:
      "DRC Motorsports Pvt Ltd — an Indian motorcycle culture and motorsport platform. Racing, training, adventure and community. Six official races every year, across India.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "India" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-94148-70102",
      email: "info@dirtridecamp.com",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: ["https://instagram.com/dirtridecamp", "https://wa.me/919414870102"],
    founder: {
      "@type": "Person",
      name: "Ramswarup Kulhary",
      jobTitle: "Founder & MD",
    },
    sport: "Off-road motorcycling",
    keywords:
      "DRC Motorsports, DRC Racing, DRC Ultimate Rider, Dirt Ride Camp, Indian motorsport, off road racing India, enduro India, adventure motorcycle India, motorcycle training India, motorcycle culture India, Bengaluru motorsport",
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dirt Ride Camp",
    alternateName: "DRC",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/rides?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function CourseJsonLd({ training }: { training: { title: string; slug: string; description: string; level: string; price: number; duration?: string | null } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: training.title,
    description: training.description.slice(0, 300),
    url: `${BASE_URL}/trainings/${training.slug}`,
    provider: {
      "@type": "Organization",
      name: "Dirt Ride Camp",
      url: BASE_URL,
    },
    courseMode: "onsite",
    educationalLevel: training.level,
    locationCreated: {
      "@type": "Place",
      name: "Bangalore",
      address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressRegion: "Karnataka", addressCountry: "IN" },
    },
    offers: {
      "@type": "Offer",
      price: training.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    ...(training.duration && { timeRequired: training.duration }),
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

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function AggregateRatingJsonLd({ ratingValue, reviewCount }: { ratingValue: number; reviewCount: number }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Dirt Ride Camp",
    url: BASE_URL,
    image: `${BASE_URL}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
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

export function ItemListJsonLd({ name, items }: { name: string; items: { name: string; url: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export interface LandingSection {
    heading: string;
    body: string;
    bullets?: string[];
}

export interface LandingFAQ {
    q: string;
    a: string;
}

export interface LandingPageData {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    breadcrumb: string;
    h1: string;
    accent: string;
    intro: string;
    sections: LandingSection[];
    faqs: LandingFAQ[];
    ctaTitle: string;
    ctaText: string;
    related: { label: string; href: string }[];
}

export const landingPages: Record<string, LandingPageData> = {
    "off-road-training-bangalore": {
        slug: "off-road-training-bangalore",
        title: "Off-Road Training in Bangalore | DRC Dirt Ride Camp Academy",
        description:
            "Learn off-road motorcycle riding in Bangalore with DRC — Dirt Ride Camp's off-road academy. Beginner to advanced dirt bike training, 1:1 coaching, body position, braking, hill climbs & trail skills. Book your slot today.",
        keywords: [
            "off road training bangalore",
            "off road academy bangalore",
            "offroad training bangalore",
            "offroad academy bangalore",
            "offroad bangalore",
            "offroad india",
            "dirt bike training bangalore",
            "off road riding course bangalore",
            "motorcycle training bangalore",
            "off road classes bangalore",
            "adventure bike training",
            "enduro training bangalore",
        ],
        breadcrumb: "Off-Road Training Bangalore",
        accent: "Bangalore's off-road academy",
        h1: "Off-Road Training in Bangalore",
        intro:
            "DRC — Dirt Ride Camp runs Bangalore's premier off-road motorcycle academy. Whether you have never left tarmac or you're chasing technical enduro lines, our structured, coach-led training builds real off-road riding control step by step. Small groups, experienced instructors, and a safety-first approach — just beyond the city.",
        sections: [
            {
                heading: "Why train off-road with DRC?",
                body:
                    "Off-road riding is a completely different skill set from road riding — and picking it up by trial-and-error is slow and risky. Our academy breaks it down into a proven progression so you build confidence quickly and safely, on real terrain near Bangalore.",
                bullets: [
                    "Certified, experienced off-road instructors",
                    "1:1 and small-group formats for real attention",
                    "Progression from fundamentals to technical terrain",
                    "Training grounds and trails just outside Bangalore",
                    "Safety briefings, gear guidance and support on every session",
                ],
            },
            {
                heading: "What you'll learn",
                body:
                    "Every program starts with a rider assessment, then moves through the fundamentals before layering on technical skills. You'll leave each session with clear feedback and skills to practice.",
                bullets: [
                    "Standing and attack riding position, body & footpeg control",
                    "Clutch friction-zone, throttle control and slow-speed balance",
                    "Front/rear/combined braking on loose surfaces",
                    "Turning, figure-eights and vision through corners",
                    "Hill climbs, descents, ruts, rocks and small obstacles",
                    "Water-crossing basics and guided trail application",
                ],
            },
            {
                heading: "Programs & pricing",
                body:
                    "Choose the format that fits your goals. Private half-day training starts at ₹2,599 per rider, full-day at ₹4,199 (lunch included), and a two-day immersive program at ₹6,999 including stay and meals. All programs are 1:1 or small-group with personalised feedback.",
            },
            {
                heading: "Who is it for?",
                body:
                    "Complete beginners nervous about off-road riding, road riders wanting to explore adventure/ADV riding, and experienced riders sharpening technical skills are all welcome. We match the difficulty to your assessed level so you're always challenged but safe.",
            },
        ],
        faqs: [
            {
                q: "Do I need my own off-road bike for training?",
                a: "You can bring your own motorcycle — adventure or off-road bikes are ideal, but standard motorcycles work for beginner courses. Our grounds are designed to be safe for learning on any bike.",
            },
            {
                q: "I've never ridden off-road. Is a beginner course right for me?",
                a: "Absolutely. Our half-day and full-day private training start from the very fundamentals — controls, standing position, clutch and braking — so first-timers build confidence from scratch.",
            },
            {
                q: "Where is the training held near Bangalore?",
                a: "Sessions run on trails and training grounds just outside Bangalore (e.g. Kanakapura, Krishnagiri and similar terrain). Exact location and meeting point are shared after booking.",
            },
            {
                q: "What gear do I need?",
                a: "Mandatory: certified helmet, riding boots/shoes, gloves and long pants. Strongly recommended: knee, elbow and chest protection plus a hydration pack. Rental gear can be arranged on request.",
            },
        ],
        ctaTitle: "Ready to ride off-road?",
        ctaText: "Book an off-road training program with DRC and build real riding confidence — from your first standing position to technical trails.",
        related: [
            { label: "View all training programs", href: "/trainings" },
            { label: "See DRC programs & pricing", href: "/programs" },
            { label: "Upcoming rides & trails", href: "/rides" },
        ],
    },

    "dirt-bike-classes-bangalore": {
        slug: "dirt-bike-classes-bangalore",
        title: "Dirt Bike Classes in Bangalore | Beginner to Advanced | DRC",
        description:
            "Join dirt bike classes in Bangalore with DRC — Dirt Ride Camp. Structured beginner-to-advanced lessons in dirt bike control, body position, braking, jumps & trail riding. Small groups & 1:1 coaching. Book now.",
        keywords: [
            "dirt bike classes bangalore",
            "dirt bike lessons bangalore",
            "dirt bike training bangalore",
            "learn dirt biking bangalore",
            "motorcycle dirt classes",
            "off road bike classes",
            "dirt bike coaching",
        ],
        breadcrumb: "Dirt Bike Classes Bangalore",
        accent: "Learn to ride dirt",
        h1: "Dirt Bike Classes in Bangalore",
        intro:
            "Want to learn dirt biking the right way? DRC — Dirt Ride Camp's dirt bike classes in Bangalore take you from nervous beginner to confident off-road rider through a structured, coach-led curriculum on real terrain. Small groups, patient instructors, and a clear progression at every level.",
        sections: [
            {
                heading: "Dirt bike classes for every level",
                body:
                    "Our classes are organised by skill level so you're always learning at the right pace. Beginners master the fundamentals; intermediate and advanced riders develop technical terrain skills and trail confidence.",
                bullets: [
                    "Beginner: controls, balance, standing position, clutch & braking",
                    "Intermediate: turning, loose terrain, small climbs and descents",
                    "Advanced: ruts, rocks, obstacles, line selection and momentum",
                    "Private 1:1 coaching for the fastest progress",
                ],
            },
            {
                heading: "A proven learning progression",
                body:
                    "We don't just let you loose on a trail. Each class follows a structured path — assess, drill the fundamentals, then apply skills on real terrain with instructor feedback — so your improvement is measurable and safe.",
                bullets: [
                    "Rider assessment to match the right level",
                    "Fundamentals: body position, clutch/throttle, braking",
                    "Skill drills: figure-eights, slow-speed control, tight turns",
                    "Terrain practice: dirt, gravel, climbs, descents and ruts",
                    "Guided trail application with personalised feedback",
                ],
            },
            {
                heading: "Class formats & pricing",
                body:
                    "Private half-day dirt bike classes start at ₹2,599 per rider, full-day at ₹4,199 (lunch included), and a two-day immersive course at ₹6,999 with stay and meals. All formats include personalised rider feedback and a recommended next step.",
            },
        ],
        faqs: [
            {
                q: "Are these dirt bike classes suitable for complete beginners?",
                a: "Yes. Our beginner classes start with the absolute basics — motorcycle controls, standing position, clutch and braking — so you can start with zero off-road experience.",
            },
            {
                q: "Do you provide the dirt bike?",
                a: "You can bring your own motorcycle. We recommend adventure or off-road bikes for the best experience; rental options and gear can be discussed when you book.",
            },
            {
                q: "How long is each class?",
                a: "Beginner private classes are typically half-day (approx. 4 hours) or full-day (7–8 hours). Two-day immersive courses include stay and meals across a weekend.",
            },
            {
                q: "How do I book a dirt bike class?",
                a: "Sign in at dirtridecamp.com, open Programs or Training, pick your class and pay online. Slots are limited and confirmed after payment.",
            },
        ],
        ctaTitle: "Start your dirt bike journey",
        ctaText: "Book a beginner or advanced dirt bike class with DRC in Bangalore and learn to ride off-road with confidence.",
        related: [
            { label: "Browse training programs", href: "/trainings" },
            { label: "All DRC programs", href: "/programs" },
            { label: "Meet our instructors", href: "/instructors" },
        ],
    },

    "bike-trips-near-bangalore": {
        slug: "bike-trips-near-bangalore",
        title: "Bike Trips Near Bangalore | Off-Road Rides & Camping | DRC",
        description:
            "Join guided bike trips near Bangalore with DRC — Dirt Ride Camp. Off-road trails, weekend adventure rides, overnight camping trips & motorcycle expeditions across Karnataka. Small groups, ride-lead support. Book your spot.",
        keywords: [
            "bike trips near bangalore",
            "bike trip bangalore",
            "adventure bike trip bangalore",
            "weekend bike trip bangalore",
            "off road rides bangalore",
            "motorcycle camping bangalore",
            "overnight bike trip karnataka",
            "adventure rides near bangalore",
        ],
        breadcrumb: "Bike Trips Near Bangalore",
        accent: "Adventure awaits",
        h1: "Bike Trips Near Bangalore",
        intro:
            "Escape the city on a guided bike trip with DRC — Dirt Ride Camp. From half-day off-road trails to overnight camping rides across Karnataka, we run curated adventure rides for a tight-knit community of riders. Small groups, experienced ride leads, and unforgettable terrain — all just beyond Bangalore.",
        sections: [
            {
                heading: "Guided off-road bike trips & trails",
                body:
                    "Our trails are built for adventure, exploration and community riding on natural terrain. Ride leaders handle the route and support so you can focus on the experience — whether it's a quick half-day escape or a full day of dirt.",
                bullets: [
                    "Half-day trails from ₹599 — perfect for a quick adventure",
                    "Full-day trails from ₹1,599 with lunch included",
                    "Scenic off-road sections, hills, and natural terrain",
                    "Ride-lead support and group riding etiquette guidance",
                ],
            },
            {
                heading: "Overnight camping rides",
                body:
                    "Our Overnighter combines trail riding, camping, community and nature. Arrive for an evening trail and high tea, camp under the stars with dinner and a campfire (where permitted), then ride a morning trail before heading home.",
                bullets: [
                    "Evening trail + overnight camping + morning trail",
                    "High tea, dinner and breakfast included",
                    "Bring family or friends as camping companions",
                    "From ₹4,999 per rider",
                ],
            },
            {
                heading: "Bring your family & friends",
                body:
                    "The Overnighter isn't just for riders. Add your spouse and children on a family package, or bring friends along for the camping and hospitality experience — so nobody gets left behind on the adventure.",
            },
            {
                heading: "Ride safe, ride together",
                body:
                    "Every DRC trip keeps groups small for safety and a personal experience, with experienced ride marshals (lead and sweep), first-aid support and clear briefings. New to off-road? Start with an easy trail or a training session first.",
            },
        ],
        faqs: [
            {
                q: "How far are the bike trips from Bangalore?",
                a: "Most trails and rides are within a few hours of Bangalore, across Karnataka (e.g. Shoolagiri, Kanakapura, Krishnagiri and similar terrain). Exact meeting points are shared after booking.",
            },
            {
                q: "Do I need off-road experience to join a ride?",
                a: "Half-day trails are beginner-friendly and ride leaders provide basic guidance. For technical routes we recommend a DRC training session first — start easy and build up.",
            },
            {
                q: "What's included in an overnight camping ride?",
                a: "The Overnighter includes an evening trail, camping, high tea, dinner, breakfast and a morning trail. You can also add family or friends for the camping and hospitality experience.",
            },
            {
                q: "How do I book a bike trip near Bangalore?",
                a: "Sign in at dirtridecamp.com, open Rides or Programs, choose your trip and pay online. Slots are limited and confirmed after payment.",
            },
        ],
        ctaTitle: "Your next adventure starts here",
        ctaText: "Book a guided bike trip near Bangalore with DRC — off-road trails, weekend rides and overnight camping adventures across Karnataka.",
        related: [
            { label: "See upcoming rides", href: "/rides" },
            { label: "Overnighter & program options", href: "/programs" },
            { label: "Event calendar", href: "/calendar" },
        ],
    },
};

export function getLandingPage(slug: string): LandingPageData | undefined {
    return landingPages[slug];
}

export const landingPageSlugs = Object.keys(landingPages);

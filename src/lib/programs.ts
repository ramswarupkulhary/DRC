export type ProgramCategory = "training" | "trails" | "special";

export interface ProgramModule {
    title: string;
    intro?: string;
    items: string[];
}

export interface ScheduleItem {
    time: string;
    activity: string;
}

export interface ProgramDay {
    title: string;
    blocks: ProgramModule[];
}

export interface PriceOption {
    label: string;
    price: number;
    note?: string;
}

export interface Program {
    slug: string;
    category: ProgramCategory;
    name: string;
    price: number;
    priceUnit?: string;
    priceOptions?: PriceOption[];
    duration: string;
    difficulty: string;
    lunch?: string;
    optionalLunch?: number;
    personPrice?: number;
    kidPrice?: number;
    description: string;
    included?: string[];
    learn?: ProgramModule[];
    experience?: string[];
    guidance?: string[];
    bestFor?: string[];
    schedule?: ScheduleItem[];
    days?: ProgramDay[];
    whatsIncluded?: string[];
    familyExperience?: string[];
    note?: string;
    requiresRiding?: boolean;
    supportsCompanions?: boolean;
}

export const categoryMeta: Record<ProgramCategory, { label: string; accent: string; blurb: string }> = {
    training: {
        label: "Off-Road Training",
        accent: "Learn the craft",
        blurb:
            "Personalised, structured off-road coaching that builds real motorcycle control — from your first standing position to technical trail application. Choose an open Off-Road session or a fully dedicated Private 1:1 with your own coach.",
    },
    trails: {
        label: "DRC Trails",
        accent: "Explore & ride",
        blurb:
            "Guided off-road adventures across natural terrain. Built for exploration, community and the pure joy of riding off-road — with ride-leader support.",
    },
    special: {
        label: "Special Experiences",
        accent: "Bring your people",
        blurb:
            "Share the DRC overnighter with family and friends — camping, hospitality and the outdoors, together.",
    },
};

export const programs: Program[] = [
    // ─────────────── TRAINING ───────────────
    {
        slug: "private-training-half-day",
        category: "training",
        name: "Off-Road Training — Half Day",
        price: 2599,
        priceUnit: "per rider",
        duration: "Approx. 4 hours",
        difficulty: "Beginner Friendly",
        lunch: "Optional (+₹299)",
        optionalLunch: 299,
        requiresRiding: true,
        description:
            "A personalized off-road training experience designed to help riders build confidence, improve motorcycle control and understand the fundamentals of off-road riding on natural terrain.",
        learn: [
            {
                title: "Module 1 — Rider & Bike Introduction",
                items: [
                    "Rider experience assessment",
                    "Understanding your current skill level",
                    "Understanding motorcycle controls",
                    "Clutch operation",
                    "Throttle control",
                    "Front brake",
                    "Rear brake",
                    "Basic motorcycle setup",
                    "Off-road safety briefing",
                ],
            },
            {
                title: "Module 2 — Riding Position",
                items: [
                    "Neutral standing position",
                    "Attack position",
                    "Correct foot position",
                    "Footpeg positioning",
                    "Knee positioning",
                    "Elbow positioning",
                    "Head position",
                    "Vision and looking ahead",
                    "Basic weight distribution",
                ],
            },
            {
                title: "Module 3 — Clutch & Throttle Control",
                items: [
                    "Clutch friction zone",
                    "Smooth throttle control",
                    "Slow-speed riding",
                    "Controlled acceleration",
                    "Controlled deceleration",
                    "Coordinating clutch and throttle",
                ],
            },
            {
                title: "Module 4 — Braking Fundamentals",
                items: [
                    "Front brake control",
                    "Rear brake control",
                    "Combined braking",
                    "Braking while standing",
                    "Controlled emergency stopping",
                    "Braking on loose surfaces",
                ],
            },
            {
                title: "Module 5 — Basic Turning",
                items: [
                    "Wide turns",
                    "Slow-speed turns",
                    "Figure-eight drills",
                    "Looking through the corner",
                    "Basic body positioning",
                    "Basic footpeg pressure",
                ],
            },
            {
                title: "Module 6 — Basic Off-Road Terrain",
                intro: "Practice on:",
                items: [
                    "Loose dirt",
                    "Uneven terrain",
                    "Small bumps",
                    "Small inclines",
                    "Controlled descents",
                    "Basic trail riding",
                ],
            },
        ],
        schedule: [
            { time: "00:00–00:20", activity: "Registration and rider assessment" },
            { time: "00:20–00:40", activity: "Safety briefing and bike inspection" },
            { time: "00:40–01:20", activity: "Standing position and body positioning" },
            { time: "01:20–02:00", activity: "Clutch, throttle and braking drills" },
            { time: "02:00–02:15", activity: "Break" },
            { time: "02:15–03:00", activity: "Turning and slow-speed control" },
            { time: "03:00–03:45", activity: "Basic off-road terrain practice" },
            { time: "03:45–04:00", activity: "Review and rider feedback" },
        ],
    },
    {
        slug: "private-training-full-day",
        category: "training",
        name: "Off-Road Training — Full Day",
        price: 4199,
        priceUnit: "per rider",
        duration: "Approx. 7–8 hours",
        difficulty: "Beginner to Intermediate",
        lunch: "Included",
        requiresRiding: true,
        description:
            "A complete personalized off-road training experience covering riding fundamentals, technical terrain and practical trail application.",
        included: [
            "Full-day training",
            "Lunch",
            "Personalized rider feedback",
            "Practical off-road drills",
            "Technical terrain training",
            "Guided trail application",
        ],
        learn: [
            {
                title: "Everything in Half-Day Training, plus:",
                intro: "Modules 1–6 (fundamentals) followed by the advanced modules below.",
                items: [],
            },
            {
                title: "Module 7 — Hill Climbing",
                items: [
                    "Approach speed",
                    "Momentum management",
                    "Body positioning",
                    "Gear selection",
                    "Throttle control",
                    "Line selection",
                    "Controlled recovery",
                ],
            },
            {
                title: "Module 8 — Descending",
                items: [
                    "Body positioning",
                    "Controlled braking",
                    "Weight distribution",
                    "Vision",
                    "Loose terrain control",
                ],
            },
            {
                title: "Module 9 — Ruts & Uneven Terrain",
                items: [
                    "Line selection",
                    "Maintaining momentum",
                    "Motorcycle stability",
                    "Relaxed upper body",
                    "Looking ahead",
                    "Controlled throttle",
                ],
            },
            {
                title: "Module 10 — Small Obstacles",
                intro: "Practice depending on rider skill — small rocks, logs, ledges & uneven obstacles. Focus on:",
                items: ["Approach", "Vision", "Timing", "Weight transfer", "Controlled momentum"],
            },
            {
                title: "Module 11 — Water Crossing Fundamentals",
                intro: "Where available and safe:",
                items: [
                    "Assessing the crossing",
                    "Selecting a line",
                    "Controlled entry",
                    "Maintaining momentum",
                    "Safe exit",
                ],
            },
            {
                title: "Module 12 — Guided Trail Session",
                intro: "Apply learned skills on natural terrain while the instructor observes:",
                items: ["Body position", "Braking", "Clutch control", "Throttle control", "Vision", "Line selection"],
            },
        ],
        schedule: [
            { time: "09:00–09:30", activity: "Registration, rider assessment and safety briefing" },
            { time: "09:30–10:30", activity: "Fundamentals and body positioning" },
            { time: "10:30–11:30", activity: "Clutch, throttle and braking" },
            { time: "11:30–12:30", activity: "Turning and slow-speed control" },
            { time: "12:30–01:30", activity: "Lunch" },
            { time: "01:30–02:30", activity: "Hill climbs and descents" },
            { time: "02:30–03:15", activity: "Uneven terrain and ruts" },
            { time: "03:15–04:00", activity: "Obstacle training" },
            { time: "04:00–05:00", activity: "Guided technical trail" },
            { time: "05:00–05:30", activity: "Rider feedback and progression review" },
        ],
    },
    {
        slug: "two-day-off-road-training",
        category: "training",
        name: "Two-Day Off-Road Training",
        price: 6999,
        priceUnit: "per rider",
        duration: "2 Days",
        difficulty: "Beginner to Intermediate",
        lunch: "2 Lunches, 1 Dinner, 1 Breakfast",
        requiresRiding: true,
        description:
            "A complete immersive off-road training program designed to build strong fundamentals on Day 1 and develop technical off-road confidence on Day 2.",
        included: ["Complete two-day off-road training", "Stay", "2 Lunches", "1 Dinner", "1 Breakfast"],
        days: [
            {
                title: "Day 1 — Build the Foundation",
                blocks: [
                    {
                        title: "Morning · Rider Assessment",
                        intro: "We assess:",
                        items: [
                            "Riding experience",
                            "Motorcycle experience",
                            "Off-road experience",
                            "Confidence level",
                            "Current skill level",
                        ],
                    },
                    {
                        title: "Core Fundamentals",
                        items: [
                            "Standing position",
                            "Attack position",
                            "Footpeg positioning",
                            "Vision",
                            "Clutch control",
                            "Throttle control",
                            "Braking",
                            "Turning",
                        ],
                    },
                    {
                        title: "Afternoon · Terrain Training",
                        items: ["Loose dirt", "Gravel", "Uneven terrain", "Small climbs", "Controlled descents", "Ruts"],
                    },
                    {
                        title: "Technical Drills",
                        items: ["Figure eights", "Slow-speed riding", "Balance drills", "Tight turns", "Controlled stopping"],
                    },
                ],
            },
            {
                title: "Day 2 — Technical Development",
                blocks: [
                    {
                        title: "Hill Climbing",
                        items: ["Line selection", "Momentum", "Gear selection", "Body positioning"],
                    },
                    {
                        title: "Descending",
                        items: ["Controlled braking", "Weight distribution", "Vision"],
                    },
                    {
                        title: "Technical Terrain",
                        intro: "Depending on rider skill:",
                        items: ["Rocks", "Logs", "Small obstacles", "Uneven terrain"],
                    },
                    {
                        title: "Trail Application",
                        intro: "Apply skills including:",
                        items: [
                            "Terrain reading",
                            "Line selection",
                            "Clutch control",
                            "Momentum",
                            "Body positioning",
                            "Braking",
                        ],
                    },
                    {
                        title: "End of Program · Rider Feedback",
                        intro: "Every rider receives feedback on:",
                        items: ["Strengths", "Areas for improvement", "Skills to practice", "Recommended next DRC program"],
                    },
                ],
            },
        ],
    },

    // ─────────────── PRIVATE 1:1 TRAINING ───────────────
    {
        slug: "private-1on1-half-day",
        category: "training",
        name: "Private 1:1 Training — Half Day",
        price: 4999,
        priceUnit: "per rider (1:1)",
        duration: "Approx. 4 hours",
        difficulty: "Beginner to Advanced",
        lunch: "Optional (+₹299)",
        optionalLunch: 299,
        requiresRiding: true,
        description:
            "A fully dedicated one-on-one half-day off-road session — one rider, one coach. 100% personalised attention with a custom drill plan and instant feedback on every run, so you progress faster.",
        included: [
            "Dedicated 1:1 coach for the entire session",
            "Fully personalised drill plan",
            "Continuous one-on-one feedback",
            "Skill assessment and progression guidance",
            "Off-road safety briefing",
        ],
        learn: [
            {
                title: "Built Around You",
                intro: "Your coach tailors the session to your exact level and goals, covering any of:",
                items: [
                    "Standing and body position",
                    "Clutch and throttle control",
                    "Braking on loose surfaces",
                    "Turning and slow-speed control",
                    "Basic off-road terrain",
                ],
            },
        ],
        note: "Private 1:1 is a single rider with a single dedicated coach — the fastest way to build confidence and correct habits.",
    },
    {
        slug: "private-1on1-full-day",
        category: "training",
        name: "Private 1:1 Training — Full Day",
        price: 7999,
        priceUnit: "per rider (1:1)",
        duration: "Approx. 7–8 hours",
        difficulty: "Beginner to Advanced",
        lunch: "Included",
        requiresRiding: true,
        description:
            "A complete dedicated one-on-one off-road day — one rider, one coach. Cover fundamentals through technical terrain at your own pace, with a personalised curriculum and guided trail application.",
        included: [
            "Dedicated 1:1 coach for the full day",
            "Lunch",
            "Fully personalised curriculum",
            "Technical terrain and hill/descent training",
            "Guided trail application",
            "Detailed progression review",
        ],
        learn: [
            {
                title: "Fundamentals to Technical",
                intro: "Your coach adapts the full day to your level, covering any of:",
                items: [
                    "Core fundamentals and body position",
                    "Hill climbing and descending",
                    "Ruts and uneven terrain",
                    "Small obstacles",
                    "Water crossing fundamentals",
                    "Guided technical trail",
                ],
            },
        ],
        note: "Private 1:1 is a single rider with a single dedicated coach for the entire day.",
    },
    {
        slug: "private-1on1-two-day",
        category: "training",
        name: "Private 1:1 Training — Two-Day",
        price: 12999,
        priceUnit: "per rider (1:1)",
        duration: "2 Days",
        difficulty: "Beginner to Advanced",
        lunch: "2 Lunches, 1 Dinner, 1 Breakfast",
        requiresRiding: true,
        description:
            "The most immersive dedicated coaching option — two full days, one rider, one coach. Build strong fundamentals on Day 1 and develop technical off-road confidence on Day 2, entirely at your pace.",
        included: [
            "Dedicated 1:1 coach across both days",
            "Stay",
            "2 Lunches, 1 Dinner, 1 Breakfast",
            "Fully personalised two-day curriculum",
            "Technical terrain and trail application",
            "Detailed progression plan for what to practise next",
        ],
        note: "Private 1:1 is a single rider with a single dedicated coach for the entire program.",
    },

    // ─────────────── TRAILS ───────────────
    {
        slug: "half-day-trail",
        category: "trails",
        name: "Half-Day Trail",
        price: 599,
        priceUnit: "per rider",
        duration: "Approx. 3–5 hours",
        difficulty: "Beginner Friendly",
        requiresRiding: true,
        description:
            "A guided off-road trail experience designed for riders who want to explore off-road trails, natural terrain and adventure riding with the DRC community.",
        experience: ["Guided trail ride", "Natural terrain", "Off-road sections", "Scenic locations", "Community riding"],
        guidance: [
            "Standing position",
            "Terrain awareness",
            "Basic line selection",
            "Group riding etiquette",
            "Trail safety",
        ],
        bestFor: [
            "Riders new to DRC",
            "Adventure riders",
            "Riders exploring off-road riding",
            "Riders looking for a shorter trail experience",
        ],
        note: "Trails are guided adventure experiences, not formal training programs. Ride leaders provide basic guidance only.",
    },
    {
        slug: "full-day-trail",
        category: "trails",
        name: "Full-Day Trail",
        price: 1599,
        priceUnit: "per rider",
        duration: "Full Day",
        difficulty: "Beginner to Intermediate (route dependent)",
        lunch: "Included",
        requiresRiding: true,
        description:
            "A complete day of guided off-road exploration across natural terrain, off-road trails and adventure routes.",
        included: ["Guided trail", "Lunch", "Ride leader support"],
        experience: [
            "Off-road trails",
            "Rocks",
            "Hills",
            "Uneven terrain",
            "Water crossings where available and safe",
            "Scenic locations",
        ],
        guidance: [
            "Standing position",
            "Terrain awareness",
            "Line selection",
            "Controlled hill riding",
            "Controlled descents",
            "Momentum management",
        ],
        note: "Terrain varies with route and conditions. Guidance is provided by ride leaders, not as formal training.",
    },
    {
        slug: "overnighter-trail",
        category: "trails",
        name: "Overnighter Trail",
        price: 4999,
        priceUnit: "per rider",
        duration: "Evening + Overnight Camping + Morning Trail",
        difficulty: "Beginner to Intermediate (route dependent)",
        requiresRiding: true,
        supportsCompanions: false,
        description:
            "A premium DRC off-road adventure combining trail riding, camping, community and nature.",
        days: [
            {
                title: "Day 1 — Evening",
                blocks: [
                    { title: "Arrival", intro: "Riders arrive at the designated location.", items: [] },
                    { title: "High Tea", intro: "Included.", items: [] },
                    {
                        title: "Evening Trail",
                        items: [
                            "Guided evening trail",
                            "Natural terrain",
                            "Scenic riding",
                            "Easy to moderate terrain depending on route",
                        ],
                    },
                    {
                        title: "Camp Experience",
                        items: [
                            "Camping setup",
                            "Community interaction",
                            "Outdoor experience",
                            "Rider discussions",
                            "Campfire only where legally permitted and safe",
                        ],
                    },
                    { title: "Dinner", intro: "Included.", items: [] },
                ],
            },
            {
                title: "Day 2 — Morning",
                blocks: [
                    { title: "Breakfast", intro: "Included.", items: [] },
                    {
                        title: "Morning Trail",
                        items: [
                            "Guided morning trail",
                            "Natural terrain",
                            "Scenic exploration",
                            "Hills, dirt and technical sections depending on route",
                        ],
                    },
                    {
                        title: "Program Ends",
                        intro: "The program ends after the morning trail. Lunch is not included.",
                        items: [],
                    },
                ],
            },
        ],
        whatsIncluded: [
            "High Tea",
            "Evening Trail",
            "Camping Experience",
            "Dinner",
            "Breakfast",
            "Morning Trail",
        ],
    },

    // ─────────────── SPECIAL EXPERIENCES ───────────────
    {
        slug: "family-friends",
        category: "special",
        name: "Family & Friends",
        price: 4999,
        priceUnit: "per rider",
        personPrice: 1999,
        kidPrice: 999,
        duration: "Evening + Overnight Camping + Morning Trail",
        difficulty: "Everyone Welcome",
        requiresRiding: true,
        supportsCompanions: true,
        description:
            "Bring your people to the DRC overnighter — camping, hospitality and the outdoors together. Add as many family members, friends and kids as you like; each is priced individually.",
        included: ["Evening Trail (rider)", "Camping", "High Tea", "Dinner", "Breakfast", "Morning Trail (rider)"],
        familyExperience: [
            "Outdoor environment",
            "Camping experience",
            "High Tea",
            "Dinner",
            "Breakfast",
            "Nature",
            "Community experience",
        ],
        note: "Companions join the camping and hospitality experience. Anyone who wants to ride must be separately registered and approved for riding activities.",
    },
];

export const skillProgression = [
    {
        level: "Level 1",
        title: "Control",
        items: ["Motorcycle controls", "Standing position", "Clutch control", "Throttle control", "Braking"],
    },
    {
        level: "Level 2",
        title: "Confidence",
        items: ["Turning", "Balance", "Loose terrain", "Small climbs", "Controlled descents"],
    },
    {
        level: "Level 3",
        title: "Technical",
        items: ["Ruts", "Rocks", "Obstacles", "Line selection", "Momentum management"],
    },
    {
        level: "Level 4",
        title: "Trail Application",
        items: ["Real terrain", "Terrain reading", "Trail riding", "Skill application"],
    },
];

export const customerJourney = ["Try", "Learn", "Improve", "Explore", "Experience"];

export const recommendedProgression = [
    "Half-Day Trail",
    "Private Half-Day Training",
    "Private Full-Day Training",
    "Full-Day Trail",
    "Two-Day Training",
    "Overnighter Trail",
];

export const riderRequirements = {
    mandatory: [
        "Certified motorcycle helmet",
        "Proper riding shoes or boots",
        "Gloves",
        "Long pants",
        "Motorcycle in safe operating condition",
    ],
    recommended: [
        "Knee protection",
        "Elbow protection",
        "Chest protection",
        "Proper off-road boots",
        "Hydration pack",
    ],
};

export const safetyDisclaimers = [
    "Off-road motorcycling involves inherent risks, including falls, collisions, changing terrain and environmental hazards. Participants must ride within their ability and follow instructions from DRC ride leaders and trainers.",
    "DRC reserves the right to modify routes, training activities, schedules or program activities based on weather, terrain conditions, rider safety or operational requirements.",
];

export function getProgram(slug: string): Program | undefined {
    return programs.find((p) => p.slug === slug);
}

export function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Companion pricing (dynamic per-program add-ons) ───

export interface CompanionSelection {
    persons?: number; // additional adults
    kids?: number;    // children
    lunch?: boolean;
    bikePrice?: number;
}

export interface ProgramBreakdown {
    riderBase: number; // rider's own fare — the only part a coupon discounts
    persons: number;
    kids: number;
    lunch: number;
    bike: number;
    extras: number; // everything that is NOT coupon-discountable
    total: number;
}

/** Full price breakdown; only `riderBase` is coupon-discountable. */
export function computeProgramBreakdown(program: Program, sel?: CompanionSelection): ProgramBreakdown {
    const supports = !!program.supportsCompanions;
    const personCount = Math.max(0, Math.floor(sel?.persons ?? 0));
    const kidCount = Math.max(0, Math.floor(sel?.kids ?? 0));

    const riderBase = program.price;
    const persons = supports ? personCount * (program.personPrice ?? 0) : 0;
    const kids = supports ? kidCount * (program.kidPrice ?? 0) : 0;
    const lunch = program.optionalLunch && sel?.lunch ? program.optionalLunch : 0;
    const bike = Math.max(0, Math.floor(sel?.bikePrice ?? 0));

    const extras = persons + kids + lunch + bike;
    return { riderBase, persons, kids, lunch, bike, extras, total: riderBase + extras };
}

/** Authoritative total price for a program including all add-ons. */
export function computeProgramPrice(program: Program, sel?: CompanionSelection): number {
    return computeProgramBreakdown(program, sel).total;
}

/** Total companions (adults + kids) for the companion-details form. */
export function companionCount(persons?: number | null, kids?: number | null): number {
    return Math.max(0, Math.floor(persons ?? 0)) + Math.max(0, Math.floor(kids ?? 0));
}

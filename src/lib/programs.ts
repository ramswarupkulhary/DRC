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
        label: "Private Off-Road Training",
        accent: "Learn the craft",
        blurb:
            "Personalised, structured off-road coaching that builds real motorcycle control — from your first standing position to technical trail application.",
    },
    trails: {
        label: "DRC Trails",
        accent: "Explore & ride",
        blurb:
            "Guided off-road adventures across natural terrain. Built for exploration, community and the pure joy of riding dirt — with ride-leader support.",
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
        name: "Private Training — Half Day",
        price: 2599,
        priceUnit: "per rider",
        duration: "Approx. 4 hours",
        difficulty: "Beginner Friendly",
        lunch: "Optional (+₹299)",
        optionalLunch: 299,
        requiresRiding: true,
        description:
            "A personalized off-road training experience designed to help riders build confidence, improve motorcycle control and understand the fundamentals of riding on dirt and natural terrain.",
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
        name: "Private Training — Full Day",
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
            "A guided off-road trail experience designed for riders who want to explore dirt trails, natural terrain and adventure riding with the DRC community.",
        experience: ["Guided trail ride", "Natural terrain", "Dirt sections", "Scenic locations", "Community riding"],
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
            "A complete day of guided off-road exploration across natural terrain, dirt trails and adventure routes.",
        included: ["Guided trail", "Lunch", "Ride leader support"],
        experience: [
            "Dirt trails",
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
        supportsCompanions: true,
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
        slug: "family-overnighter-plan",
        category: "special",
        name: "Family Overnighter Plan",
        price: 7999,
        priceOptions: [
            { label: "Rider + Wife", price: 7999 },
            { label: "Rider + Wife + Children", price: 9999, note: "Max 2 children" },
        ],
        duration: "Evening + Overnight Camping + Morning Trail",
        difficulty: "Family Friendly",
        requiresRiding: true,
        description:
            "Bring your family along to enjoy the DRC overnighter camping and outdoor experience together while you ride the trails.",
        included: ["Evening Trail (rider)", "Camping", "Dinner", "Breakfast", "Morning Trail (rider)"],
        familyExperience: [
            "Outdoor environment",
            "Camping experience",
            "High Tea",
            "Dinner",
            "Breakfast",
            "Nature",
            "Community experience",
        ],
        note: "Family members participate in the camping and hospitality experience unless separately registered and approved for riding activities.",
    },
    {
        slug: "friends-plan",
        category: "special",
        name: "Friends Plan",
        price: 1999,
        priceUnit: "per friend",
        duration: "Overnighter (non-riding)",
        difficulty: "Everyone Welcome",
        requiresRiding: false,
        description:
            "Friends can join the DRC Overnighter experience for the camping, hospitality and community — without riding.",
        included: [
            "Camping",
            "High Tea",
            "Dinner",
            "Breakfast",
            "Outdoor experience",
            "Community experience",
        ],
        note: "Friends are not automatically included in motorcycle riding activities unless separately registered and approved.",
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

// ─── Companion pricing (Overnighter add-ons) ───
export const FRIEND_PRICE = 1999;

export type FamilyOption = "rider_wife" | "rider_wife_children";

export const FAMILY_PACKAGES: Record<FamilyOption, { label: string; price: number; note?: string }> = {
    rider_wife: { label: "Rider + Wife", price: 7999 },
    rider_wife_children: { label: "Rider + Wife + Children", price: 9999, note: "Max 2 children" },
};

export interface CompanionSelection {
    friends?: number;
    familyOption?: FamilyOption | null;
    lunch?: boolean;
}

/** Authoritative price for a program including companion add-ons and optional lunch. */
export function computeProgramPrice(program: Program, sel?: CompanionSelection): number {
    const friends = Math.max(0, Math.floor(sel?.friends ?? 0));
    const familyOption = sel?.familyOption ?? null;

    let base = program.price;
    if (program.supportsCompanions && familyOption && FAMILY_PACKAGES[familyOption]) {
        base = FAMILY_PACKAGES[familyOption].price;
    }

    let total = base;
    if (program.supportsCompanions) {
        total += friends * FRIEND_PRICE;
    }
    if (program.optionalLunch && sel?.lunch) {
        total += program.optionalLunch;
    }
    return total;
}

/** Number of family companions implied by a family option (for the companion form). */
export function familyCompanionCount(familyOption?: FamilyOption | null): number {
    if (familyOption === "rider_wife") return 1; // wife
    if (familyOption === "rider_wife_children") return 3; // wife + up to 2 children
    return 0;
}

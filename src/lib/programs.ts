export type ProgramCategory =
    | "foundation"
    | "skill"
    | "adventure"
    | "multiday"
    | "practice"
    | "special";

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
    tagline?: string;
    price: number;
    priceUnit?: string;
    priceOptions?: PriceOption[];
    duration: string;
    difficulty: string;
    lunch?: string;
    optionalLunch?: number;
    personPrice?: number;
    kidPrice?: number;
    shortDesc?: string;
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
    outcome?: string;
    cta?: string;
    requiresRiding?: boolean;
    supportsCompanions?: boolean;
}

export const categoryMeta: Record<ProgramCategory, { label: string; accent: string; blurb: string }> = {
    foundation: {
        label: "Foundation",
        accent: "Start beyond the road",
        blurb:
            "Build the off-road fundamentals — stand, balance, brake, turn and control your motorcycle when the road disappears.",
    },
    skill: {
        label: "Skill Development",
        accent: "Ride the rough",
        blurb:
            "Two levels of Trail Craft that take you from confident beginner to controlled, precise technical off-road riding.",
    },
    adventure: {
        label: "Adventure Riding",
        accent: "Beyond the road",
        blurb:
            "Full-day programs that unlock what your adventure or dual-sport motorcycle — and you — can really do off-road.",
    },
    multiday: {
        label: "Multi-Day Experience",
        accent: "Ride. Camp. Repeat.",
        blurb:
            "The complete off-road weekend — training, guided trails, camping and community, all in one escape.",
    },
    practice: {
        label: "Practice",
        accent: "More seat time",
        blurb:
            "Independent practice sessions and passes to keep sharpening your off-road skills throughout your journey.",
    },
    special: {
        label: "Family & Friends",
        accent: "Bring your people",
        blurb:
            "Share the DRC off-road overnighter with family and friends — camping, hospitality and the outdoors, together.",
    },
};

export const programs: Program[] = [
    // ─────────────── FOUNDATION ───────────────
    {
        slug: "drc-ground-zero",
        category: "foundation",
        name: "DRC Ground Zero",
        tagline: "Your first step beyond the road.",
        price: 2999,
        priceUnit: "per rider",
        duration: "Half Day",
        difficulty: "Beginner",
        requiresRiding: true,
        shortDesc:
            "Every great off-road rider starts somewhere. This is where you start — the fundamentals that turn road riders into confident off-road riders.",
        description:
            "DRC Ground Zero is built for riders who look at an off-road trail and think, \u201cI want to ride that, but I don't know where to begin.\u201d Forget speed. Forget showing off. We start with the fundamentals that give you real confidence — how to stand, balance, brake, turn and control your motorcycle when the road disappears. By the end of the session, off-road won't feel like unfamiliar territory anymore. You'll understand your motorcycle better and leave ready for the next stage of your DRC journey.",
        learn: [
            { title: "Riding Position", items: ["Neutral standing position", "Basic attack position", "Foot & footpeg positioning", "Knee & elbow positioning", "Head and eye position", "Looking ahead"] },
            { title: "Motorcycle Control", items: ["Clutch control", "Understanding the friction zone", "Smooth throttle application", "Controlled acceleration & deceleration", "Slow-speed control"] },
            { title: "Braking", items: ["Front brake control", "Rear brake control", "Combined braking", "Braking on loose surfaces", "Controlled emergency stopping"] },
            { title: "Turning", items: ["Basic & wide turns", "Slow-speed turns", "Figure-eight practice", "Looking through the turn", "Basic weight transfer"] },
            { title: "Terrain Confidence", items: ["Loose off-road surfaces", "Uneven terrain", "Small bumps", "Basic inclines", "Controlled descents"] },
        ],
        bestFor: ["Riders new to off-road riding", "Adventure motorcycle riders", "Riders with little off-road experience", "Riders wanting stronger motorcycle control"],
        outcome: "You came with road-riding confidence. You leave with your first real off-road skills.",
        cta: "Start Your Off-Road Journey",
    },

    // ─────────────── SKILL DEVELOPMENT ───────────────
    {
        slug: "drc-trail-craft-level-1",
        category: "skill",
        name: "DRC Trail Craft – Level 1",
        tagline: "When the ground changes, so should your riding.",
        price: 3299,
        priceUnit: "per rider",
        duration: "Half Day",
        difficulty: "Intermediate",
        requiresRiding: true,
        shortDesc:
            "The basics got you onto the off-road. Now learn how to actually ride it — read the terrain, pick smart lines and place your bike exactly where you want it.",
        description:
            "The basics got you onto the off-road. Now it's time to learn how to actually ride it. Trail Craft Level 1 takes you beyond simple drills and into the skills that matter when the terrain starts fighting back — rocks, ruts, climbs, loose sections, uneven ground. You'll learn to read the terrain before you ride it, choose smarter lines, control momentum and place your motorcycle exactly where you want it. This is where you stop reacting to the trail — and start understanding it.",
        learn: [
            { title: "Line Selection & Terrain Reading", items: ["Reading terrain before you ride it", "Choosing safer lines", "Planning an approach", "Looking ahead"] },
            { title: "Technical Terrain", intro: "Depending on terrain availability:", items: ["Rocks", "Ruts", "Small obstacles", "Uneven sections", "Controlled climbs & descents"] },
            { title: "Motorcycle Control", items: ["Clutch and throttle coordination", "Controlled momentum", "Wheel placement", "Balance"] },
        ],
        bestFor: ["Riders who've completed Ground Zero", "Riders with basic off-road experience", "Riders comfortable standing on the motorcycle", "Riders ready for real terrain"],
        cta: "Master the Trail",
    },
    {
        slug: "drc-trail-craft-level-2",
        category: "skill",
        name: "DRC Trail Craft – Level 2",
        tagline: "When the easy line disappears.",
        price: 4299,
        priceUnit: "per rider",
        duration: "Half Day",
        difficulty: "Advanced",
        requiresRiding: true,
        shortDesc:
            "Level 2 is where the trail asks serious questions. Steeper climbs, bigger rocks, tighter lines — ride demanding off-road terrain with real control.",
        description:
            "Level 2 is where the trail starts asking serious questions. Steeper climbs. Bigger rocks. Tighter sections. Less room for mistakes. DRC Trail Craft Level 2 is for riders who already have the basics and want to push their control, precision and confidence further. Here, every line matters. Every movement matters. Every decision matters. The goal isn't simply to survive difficult terrain — it's to ride through it with control.",
        learn: [
            { title: "Advanced Terrain", intro: "Depending on location and conditions:", items: ["Steeper climbs", "Technical descents", "Rock gardens", "Multi-obstacle sections", "Tight technical turns"] },
            { title: "Advanced Control", items: ["Advanced line selection", "Precise wheel placement", "Advanced momentum control", "Recovery techniques", "Energy-efficient riding"] },
        ],
        bestFor: ["Experienced off-road riders", "Riders comfortable with technical terrain", "Riders who've completed Level 1 or equivalent"],
        note: "Participation may require a rider skill assessment.",
        cta: "Take On the Challenge",
    },

    // ─────────────── ADVENTURE RIDING ───────────────
    {
        slug: "drc-adventure-ready",
        category: "adventure",
        name: "DRC Adventure Ready",
        tagline: "Take your adventure beyond the road.",
        price: 6599,
        priceUnit: "per rider",
        duration: "Full Day",
        difficulty: "Intermediate",
        lunch: "Included",
        requiresRiding: true,
        shortDesc:
            "You bought an adventure motorcycle for a reason. Learn to ride it where the road ends — loose terrain, climbs, descents and real off-road trails.",
        description:
            "You bought an adventure motorcycle for a reason — not just for city traffic, not just for highways. DRC Adventure Ready is for riders who want to discover what their motorcycle, and they themselves, can do when the road ends. Learn to manage a bigger motorcycle on loose terrain, climbs, descents and real trails, and build the confidence to explore places Google Maps might not recommend. Because an adventure bike should occasionally go on an adventure.",
        learn: [
            { title: "Big-Bike Control", items: ["Big-bike balance", "Standing riding position", "Weight management", "Slow-speed control"] },
            { title: "Terrain Riding", items: ["Loose terrain", "Hill climbing", "Controlled descents", "Uneven ground"] },
            { title: "Technical Skills", items: ["Line selection", "Braking", "Momentum management", "Trail recovery"] },
            { title: "Real-World Riding", intro: "Where available and safe:", items: ["Water crossings", "Trail strategy", "Longer off-road sections"] },
        ],
        included: ["Full-day program", "Lunch", "Guided instruction", "Rider feedback"],
        bestFor: ["Adventure & dual-sport riders", "Riders wanting practical off-road confidence", "Riders planning adventure trips"],
        cta: "Get Adventure Ready",
    },
    {
        slug: "drc-wild-terrain",
        category: "adventure",
        name: "DRC Wild Terrain",
        tagline: "For riders who want more than a road can offer.",
        price: 7499,
        priceUnit: "per rider",
        duration: "Full Day",
        difficulty: "Advanced",
        lunch: "Included",
        requiresRiding: true,
        shortDesc:
            "Some terrain can't be understood from YouTube — you have to ride it. The raw side of adventure riding, for experienced riders.",
        description:
            "Some terrain cannot be understood from YouTube. You have to ride it. DRC Wild Terrain is for experienced riders ready to take on the raw side of adventure riding — steep climbs, technical descents, rocks, ruts and long, demanding sections. This isn't about chasing speed. It's about making better decisions when the terrain gets difficult and keeping control when your comfort zone disappears. Wild terrain doesn't care how expensive your motorcycle is — only your skills matter.",
        experience: ["Steep climbs", "Technical descents", "Rocks & ruts", "Difficult natural terrain", "Longer technical sections"],
        learn: [
            { title: "Advanced Off-Road Skills", items: ["Advanced line selection", "Momentum management", "Technical recovery", "Body positioning", "Energy management", "Terrain strategy"] },
        ],
        included: ["Full-day program", "Lunch", "Guided instruction", "Rider feedback"],
        bestFor: ["Experienced off-road riders", "Advanced adventure riders", "Riders comfortable with technical terrain"],
        note: "Rider assessment may be required.",
        cta: "Enter the Wild",
    },

    // ─────────────── MULTI-DAY EXPERIENCE ───────────────
    {
        slug: "drc-off-road-escape",
        category: "multiday",
        name: "DRC Off-Road Escape",
        tagline: "Ride. Camp. Wake up and ride again.",
        price: 8999,
        priceUnit: "per rider",
        duration: "2 Days",
        difficulty: "Beginner to Intermediate",
        lunch: "2 Lunches, 1 Dinner, 1 Breakfast",
        requiresRiding: true,
        shortDesc:
            "A two-day off-road escape — guided trails, real coaching, a campfire with your crew, and riding memories a weekend road trip can't give you.",
        description:
            "Ride hard. Camp under the stars. Wake up and do it again. DRC Off-Road Escape is a complete weekend combining off-road learning, natural trails, camping and community — skills by day, stories by night. It's the DRC weekend riders keep coming back for.",
        days: [
            {
                title: "Day 1",
                blocks: [
                    { title: "On the off-road", items: ["Foundation drills", "Terrain training", "Guided trail riding", "Evening ride where suitable", "Camping setup", "Community experience", "Dinner"] },
                ],
            },
            {
                title: "Day 2",
                blocks: [
                    { title: "Progress & trail", items: ["Breakfast", "Technical riding practice", "Morning trail", "Rider challenge", "Final rider feedback"] },
                ],
            },
        ],
        included: ["Accommodation or camping stay", "2 Lunches", "1 Dinner", "1 Breakfast", "Training sessions", "Guided trail experience"],
        experience: ["Off-road confidence", "Terrain awareness", "Motorcycle control", "Group trail riding", "Basic technical skills"],
        bestFor: ["Riders wanting a complete weekend experience", "Riders wanting training plus adventure", "Riders who enjoy camping and community"],
        cta: "Escape Off-Road",
    },

    // ─────────────── PRACTICE ───────────────
    {
        slug: "drc-free-ride",
        category: "practice",
        name: "DRC Free Ride",
        tagline: "Your bike. Your pace. Your practice.",
        price: 1499,
        priceUnit: "per session",
        duration: "3 Hours",
        difficulty: "All Levels",
        requiresRiding: true,
        shortDesc:
            "More seat time in designated DRC off-road practice areas — practise what you've learned and keep getting better.",
        description:
            "Skills fade without practice. DRC Free Ride gives you independent access to designated DRC off-road practice areas so you can put in the seat time that actually makes riders better — at your own pace, on your own bike.",
        included: ["Access to designated practice areas", "Access to approved riding sections", "Basic safety briefing", "Marshal or supervisor support"],
        note: "Not included: formal instructor-led training or personal coaching. Riders must follow DRC safety rules and remain within designated riding areas.",
        cta: "Get More Seat Time",
    },
    {
        slug: "drc-skill-builder-pass",
        category: "practice",
        name: "DRC Skill Builder Pass",
        tagline: "More seat time. More confidence.",
        price: 4499,
        priceUnit: "for 4 sessions",
        duration: "4 Practice Sessions × 3 Hours each",
        difficulty: "All Levels",
        requiresRiding: true,
        shortDesc:
            "Four DRC Free Ride sessions in one pass — consistent practice, long-term improvement, and ₹1,497 saved.",
        description:
            "Real improvement comes from repetition. The DRC Skill Builder Pass bundles four DRC Free Ride sessions so you keep riding, keep practising and keep getting better — for less. Regular value ₹5,996; your price ₹4,499 — you save ₹1,497.",
        included: ["Four DRC Free Ride sessions", "Access to designated practice areas", "Basic safety briefing", "Supervisor support"],
        note: "Regular value ₹5,996. Pass price ₹4,499 — you save ₹1,497.",
        cta: "Build Your Skills",
    },

    // ─────────────── FAMILY & FRIENDS ───────────────
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
            "Bring your people to the DRC off-road overnighter — camping, hospitality and the outdoors together. Add as many family members, friends and kids as you like; each is priced individually.",
        included: ["Evening Trail (rider)", "Camping", "High Tea", "Dinner", "Breakfast", "Morning Trail (rider)"],
        familyExperience: ["Outdoor environment", "Camping experience", "High Tea", "Dinner", "Breakfast", "Nature", "Community experience"],
        note: "Companions join the camping and hospitality experience. Anyone who wants to ride must be separately registered and approved for riding activities.",
    },
];

// Two DRC progression tracks — riders start on Foundation, then branch by goal.
export const coreSkillsTrack = ["DRC Ground Zero", "DRC Trail Craft – Level 1", "DRC Trail Craft – Level 2"];
export const adventureTrack = ["DRC Adventure Ready", "DRC Wild Terrain"];

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

export const recommendedProgression = coreSkillsTrack;

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

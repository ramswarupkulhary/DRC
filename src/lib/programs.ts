export type ProgramCategory =
    | "foundation"
    | "trail"
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
        label: "Foundation Training",
        accent: "Start on dirt",
        blurb:
            "Build proper off-road fundamentals — riding position, motorcycle control, braking and confidence on loose terrain.",
    },
    trail: {
        label: "Trail Experiences",
        accent: "Explore & ride",
        blurb:
            "Guided off-road trail rides across natural terrain — exploration, community and real-world riding with ride-leader support.",
    },
    skill: {
        label: "Skill Development",
        accent: "Level up",
        blurb:
            "Sharpen terrain reading, line selection and technical control as you progress toward advanced off-road riding.",
    },
    adventure: {
        label: "Adventure Riding",
        accent: "Beyond the road",
        blurb:
            "Full-day programs that build practical off-road confidence on adventure, dual-sport and scrambler motorcycles.",
    },
    multiday: {
        label: "Multi-Day Experiences",
        accent: "Ride. Camp. Repeat.",
        blurb:
            "Immersive multi-day off-road experiences combining training, guided trails, camping and the DRC community.",
    },
    practice: {
        label: "Practice",
        accent: "More seat time",
        blurb:
            "Independent practice sessions and passes to keep improving with more time on the bike throughout your journey.",
    },
    special: {
        label: "Family & Friends",
        accent: "Bring your people",
        blurb:
            "Share the DRC overnighter with family and friends — camping, hospitality and the outdoors, together.",
    },
};

export const programs: Program[] = [
    // ─────────────── FOUNDATION ───────────────
    {
        slug: "drc-ground-zero",
        category: "foundation",
        name: "DRC Ground Zero",
        tagline: "Start on dirt. Build from the ground up.",
        price: 2999,
        priceUnit: "per rider",
        duration: "3 Hours",
        difficulty: "Beginner",
        requiresRiding: true,
        shortDesc:
            "Take your first serious step into off-road riding — build the fundamental skills, confidence and control on dirt and loose terrain.",
        description:
            "DRC Ground Zero is the starting point for riders who are new to off-road motorcycling. It focuses on understanding motorcycle control, rider position, braking, balance and confidence away from normal roads. The objective is not speed — it is to build proper fundamentals and help riders understand how their motorcycle behaves on different off-road surfaces.",
        learn: [
            { title: "Riding Position", items: ["Neutral standing position", "Basic attack position", "Foot positioning", "Footpeg pressure", "Knee positioning", "Elbow positioning", "Head and eye position", "Looking ahead"] },
            { title: "Motorcycle Control", items: ["Clutch control", "Understanding the friction zone", "Smooth throttle application", "Controlled acceleration", "Controlled deceleration", "Slow-speed motorcycle control"] },
            { title: "Braking", items: ["Front brake control", "Rear brake control", "Combined braking", "Braking on loose surfaces", "Controlled emergency stopping"] },
            { title: "Turning", items: ["Basic turns", "Wide turns", "Slow-speed turns", "Figure-eight practice", "Looking through the turn", "Basic weight transfer"] },
            { title: "Terrain Confidence", items: ["Loose dirt", "Uneven terrain", "Small bumps", "Basic inclines", "Controlled descents"] },
        ],
        bestFor: ["Riders new to off-road riding", "Adventure motorcycle riders", "Riders with little dirt experience", "Riders wanting stronger motorcycle control"],
        outcome: "Riders finish with a strong understanding of basic off-road riding position and motorcycle-control fundamentals.",
        cta: "Start Your Off-Road Journey",
    },
    {
        slug: "drc-traction-lab",
        category: "foundation",
        name: "DRC Traction Lab",
        tagline: "Don't fight the dirt. Learn to work with it.",
        price: 2099,
        priceUnit: "per rider",
        duration: "3 Hours",
        difficulty: "Beginner to Intermediate",
        requiresRiding: true,
        shortDesc:
            "Understand how traction changes and how throttle, braking and body position affect motorcycle control on loose terrain.",
        description:
            "DRC Traction Lab helps riders understand how motorcycles behave when grip changes. Riders learn how body position, throttle input, braking and weight transfer influence control on loose surfaces.",
        learn: [
            { title: "Traction Awareness", items: ["Understanding grip", "Understanding loose surfaces", "Weight transfer", "Motorcycle balance"] },
            { title: "Throttle Control", items: ["Smooth throttle application", "Throttle modulation", "Controlled acceleration", "Maintaining available traction"] },
            { title: "Braking", items: ["Loose-surface braking", "Rear brake awareness", "Front brake confidence", "Controlled deceleration"] },
            { title: "Body Position", items: ["Weight distribution", "Footpeg pressure", "Standing position", "Body movement"] },
            { title: "Motorcycle Control", items: ["Managing rear-wheel movement", "Loose terrain recovery basics", "Controlled corner exits", "Maintaining stability"] },
            { title: "Surfaces May Include", items: ["Dirt", "Gravel", "Loose soil", "Uneven terrain"] },
        ],
        bestFor: ["Riders with basic off-road experience", "Adventure riders", "Riders uncomfortable on loose terrain", "Riders wanting better traction awareness"],
        outcome: "Riders develop a better understanding of traction and increased confidence on loose surfaces.",
        cta: "Master the Terrain",
    },

    // ─────────────── TRAIL EXPERIENCES ───────────────
    {
        slug: "drc-trail-core",
        category: "trail",
        name: "DRC Trail Core",
        tagline: "Leave the road behind.",
        price: 2099,
        priceUnit: "per rider",
        duration: "3 to 4 Hours",
        difficulty: "Beginner Friendly",
        requiresRiding: true,
        shortDesc:
            "A guided off-road trail experience introducing riders to natural terrain and real-world trail riding.",
        description:
            "DRC Trail Core is a guided off-road riding experience for riders who want to explore natural terrain. It combines trail riding, exploration, basic coaching and community riding.",
        experience: ["Guided trail riding", "Natural terrain", "Dirt sections", "Uneven terrain", "Small climbs", "Controlled descents", "Scenic routes", "Community riding"],
        guidance: ["Standing position", "Terrain awareness", "Basic line selection", "Group riding etiquette", "Trail safety", "Riding within personal ability"],
        bestFor: ["Riders new to DRC", "Adventure riders", "Beginners with basic motorcycle confidence", "Riders wanting a shorter trail experience"],
        note: "Terrain difficulty may vary depending on route and weather conditions.",
        cta: "Join the Trail",
    },

    // ─────────────── SKILL DEVELOPMENT ───────────────
    {
        slug: "drc-terrain-control",
        category: "skill",
        name: "DRC Terrain Control",
        tagline: "The terrain changes. Your control shouldn't.",
        price: 3299,
        priceUnit: "per rider",
        duration: "Half Day",
        difficulty: "Intermediate",
        requiresRiding: true,
        shortDesc:
            "Develop stronger terrain awareness and motorcycle control across changing off-road conditions.",
        description:
            "DRC Terrain Control is for riders who understand the basics and want to improve their ability to read and ride different off-road terrain.",
        learn: [
            { title: "Body Position", items: ["Advanced standing position", "Weight transfer", "Dynamic body movement", "Motorcycle balance"] },
            { title: "Terrain Reading", items: ["Identifying safer lines", "Reading surface conditions", "Understanding traction changes", "Planning an approach"] },
            { title: "Technical Terrain", items: ["Ruts", "Loose climbs", "Controlled descents", "Uneven terrain", "Rocky sections where suitable"] },
            { title: "Momentum Management", items: ["Maintaining momentum", "Controlled throttle", "Gear selection concepts", "Speed management"] },
            { title: "Braking", items: ["Advanced braking control", "Braking on changing surfaces", "Controlled downhill braking"] },
        ],
        bestFor: ["Riders with previous off-road experience", "Riders who have completed beginner training", "Adventure riders wanting stronger off-road confidence"],
        cta: "Control the Terrain",
    },
    {
        slug: "drc-technical-trails-level-1",
        category: "skill",
        name: "DRC Technical Trails – Level 1",
        tagline: "Pick the line. Commit to it.",
        price: 3299,
        priceUnit: "per rider",
        duration: "3 to 4 Hours",
        difficulty: "Intermediate",
        requiresRiding: true,
        shortDesc:
            "Learn precision, line selection and motorcycle control while riding more demanding natural terrain.",
        description:
            "Technical Trails Level 1 introduces riders to more demanding off-road terrain. The focus is on line selection, controlled momentum and accurate motorcycle placement.",
        learn: [
            { title: "Line Selection", items: ["Reading technical terrain", "Choosing safer lines", "Planning an approach", "Looking ahead"] },
            { title: "Technical Terrain", intro: "Depending on terrain availability:", items: ["Rocks", "Ruts", "Small obstacles", "Uneven sections", "Small climbs"] },
            { title: "Motorcycle Control", items: ["Clutch and throttle coordination", "Controlled momentum", "Wheel placement", "Balance"] },
            { title: "Hill Techniques", items: ["Approach strategy", "Body positioning", "Momentum management", "Controlled climbing"] },
        ],
        bestFor: ["Riders with previous off-road experience", "Riders comfortable standing on the motorcycle", "Riders progressing toward technical riding"],
        cta: "Take On the Technical",
    },
    {
        slug: "drc-technical-trails-level-2",
        category: "skill",
        name: "DRC Technical Trails – Level 2",
        tagline: "Control the chaos.",
        price: 4299,
        priceUnit: "per rider",
        duration: "3 to 4 Hours",
        difficulty: "Advanced",
        requiresRiding: true,
        shortDesc:
            "An advanced technical riding program focused on precision, control and efficient riding through demanding terrain.",
        description:
            "Technical Trails Level 2 is designed for experienced riders looking to challenge themselves on demanding terrain.",
        learn: [
            { title: "Advanced Terrain", intro: "Depending on location and conditions:", items: ["Advanced climbs", "Steep descents", "Rock gardens", "Multi-obstacle sections", "Tight technical turns", "Difficult uneven terrain"] },
            { title: "Advanced Control", items: ["Precise wheel placement", "Advanced line selection", "Controlled momentum", "Technical recovery basics", "Energy-efficient riding"] },
        ],
        bestFor: ["Experienced off-road riders", "Riders comfortable with technical terrain", "Riders who have completed Level 1 or have equivalent experience"],
        note: "Participation may require a rider skill assessment.",
        cta: "Control the Chaos",
    },

    // ─────────────── ADVENTURE RIDING ───────────────
    {
        slug: "drc-adventure-ready",
        category: "adventure",
        name: "DRC Adventure Ready",
        tagline: "Adventure starts where the road ends.",
        price: 6599,
        priceUnit: "per rider",
        duration: "Full Day",
        difficulty: "Intermediate",
        lunch: "Included",
        requiresRiding: true,
        shortDesc:
            "A full-day program designed to help adventure motorcycle riders build practical off-road confidence.",
        description:
            "Adventure Ready is for riders who want to take their adventure motorcycle beyond normal roads and build confidence on real off-road terrain. Suitable for adventure, dual-sport and scrambler-style motorcycles.",
        learn: [
            { title: "Big Bike Control", items: ["Motorcycle balance", "Weight management", "Slow-speed control", "Standing position"] },
            { title: "Terrain Riding", items: ["Loose dirt", "Uneven terrain", "Hills", "Controlled descents"] },
            { title: "Technical Skills", items: ["Line selection", "Momentum management", "Controlled braking", "Trail recovery techniques"] },
            { title: "Real-World Riding", intro: "Where suitable and safe:", items: ["Water crossings", "Trail strategy", "Longer off-road sections"] },
        ],
        included: ["Full-day program", "Lunch", "Guided instruction", "Rider feedback"],
        bestFor: ["Adventure riders", "Riders wanting practical off-road confidence", "Riders planning adventure trips"],
        cta: "Get Adventure Ready",
    },
    {
        slug: "drc-wild-terrain",
        category: "adventure",
        name: "DRC Wild Terrain",
        tagline: "Built for terrain that doesn't forgive mistakes.",
        price: 7499,
        priceUnit: "per rider",
        duration: "Full Day",
        difficulty: "Advanced",
        lunch: "Included",
        requiresRiding: true,
        shortDesc:
            "An advanced full-day riding program for experienced riders looking to challenge themselves on demanding natural terrain.",
        description:
            "Wild Terrain is designed for experienced adventure and off-road riders who want to improve their ability to manage difficult terrain.",
        experience: ["Steep climbs", "Steep descents", "Technical rocks", "Deep ruts", "Difficult natural terrain", "Longer technical sections"],
        learn: [
            { title: "Skills", items: ["Advanced line selection", "Momentum management", "Technical recovery", "Body positioning", "Energy management", "Terrain strategy"] },
        ],
        included: ["Full-day program", "Lunch", "Guided instruction", "Rider feedback"],
        bestFor: ["Experienced off-road riders", "Advanced adventure riders", "Riders comfortable with technical terrain"],
        note: "Rider assessment may be required.",
        cta: "Enter Wild Terrain",
    },

    // ─────────────── MULTI-DAY EXPERIENCES ───────────────
    {
        slug: "drc-dirt-escape",
        category: "multiday",
        name: "DRC Dirt Escape",
        tagline: "Ride. Camp. Wake up and ride again.",
        price: 8999,
        priceUnit: "per rider",
        duration: "2 Days",
        difficulty: "Beginner to Intermediate",
        lunch: "2 Lunches, 1 Dinner, 1 Breakfast",
        requiresRiding: true,
        shortDesc:
            "A two-day immersive off-road experience combining training, trail riding, camping and the DRC community.",
        description:
            "DRC Dirt Escape is a complete weekend experience combining off-road learning, natural trails, camping and community.",
        days: [
            {
                title: "Day 1",
                blocks: [
                    { title: "On the dirt", items: ["Foundation drills", "Terrain training", "Guided trail riding", "Evening riding experience where suitable", "Camping setup", "Community experience", "Dinner"] },
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
        experience: ["Off-road confidence", "Terrain awareness", "Motorcycle control", "Group trail riding experience", "Basic technical skills"],
        bestFor: ["Riders wanting a complete weekend experience", "Riders wanting training plus adventure", "Riders who enjoy camping and community experiences"],
        cta: "Escape to the Dirt",
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
            "Independent practice access for riders who want more seat time in designated DRC riding and practice areas.",
        description:
            "DRC Free Ride is for riders who want to practice and improve through additional seat time.",
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
            "Four DRC Free Ride sessions for riders who want consistent practice and long-term improvement.",
        description:
            "The DRC Skill Builder Pass is designed for riders who want consistent practice and long-term improvement. Regular value ₹5,996 — you save ₹1,497.",
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
            "Bring your people to the DRC overnighter — camping, hospitality and the outdoors together. Add as many family members, friends and kids as you like; each is priced individually.",
        included: ["Evening Trail (rider)", "Camping", "High Tea", "Dinner", "Breakfast", "Morning Trail (rider)"],
        familyExperience: ["Outdoor environment", "Camping experience", "High Tea", "Dinner", "Breakfast", "Nature", "Community experience"],
        note: "Companions join the camping and hospitality experience. Anyone who wants to ride must be separately registered and approved for riding activities.",
    },
];

// Ordered DRC rider progression (skill journey through the programs).
export const drcProgression = [
    "DRC Ground Zero",
    "DRC Traction Lab",
    "DRC Trail Core",
    "DRC Terrain Control",
    "DRC Technical Trails – Level 1",
    "DRC Technical Trails – Level 2",
    "DRC Adventure Ready",
    "DRC Wild Terrain",
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

export const recommendedProgression = drcProgression;

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

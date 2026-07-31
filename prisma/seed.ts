import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@dirtridecamp.com" },
    update: {},
    create: {
      name: "DRC Admin",
      email: "admin@dirtridecamp.com",
      passwordHash: hashSync("admin123", 10),
      role: "admin",
      phone: "9414870102",
      referralCode: "DRCADMIN",
    },
  });

  // Instructors
  const instructors = [
    {
      name: "Vikram Rao",
      slug: "vikram-rao",
      bio: "Former national rally champion with 15+ years of off-road experience. Specializes in enduro and trail riding techniques. Has trained over 500 riders across India.",
      certifications: JSON.stringify(["National Rally Champion 2018", "Advanced Off-Road Instructor", "Wilderness First Aid"]),
      specialties: JSON.stringify(["Enduro", "Trail Riding", "Hill Climbs"]),
      experience: "15 years",
      rating: 4.9,
      totalReviews: 127,
    },
    {
      name: "Priya Sharma",
      slug: "priya-sharma",
      bio: "India's first woman to complete the Himalayan Rally. Passionate about making off-road riding accessible to everyone, especially women riders.",
      certifications: JSON.stringify(["Himalayan Rally Finisher", "Off-Road Training Certification", "Emergency First Responder"]),
      specialties: JSON.stringify(["Women's Training", "Beginner Programs", "Confidence Building"]),
      experience: "8 years",
      rating: 4.8,
      totalReviews: 89,
    },
    {
      name: "Arjun Menon",
      slug: "arjun-menon",
      bio: "Technical riding specialist with deep expertise in bike mechanics and advanced off-road techniques. Known for his patient teaching style.",
      certifications: JSON.stringify(["Advanced Motorcycle Mechanic", "Trail Guide Certification", "Sports Medicine Basic"]),
      specialties: JSON.stringify(["Technical Riding", "Bike Mechanics", "Advanced Techniques"]),
      experience: "10 years",
      rating: 4.7,
      totalReviews: 64,
    },
  ];

  const createdInstructors = [];
  for (const inst of instructors) {
    const created = await prisma.instructor.upsert({
      where: { slug: inst.slug },
      update: {},
      create: inst,
    });
    createdInstructors.push(created);
  }

  // Sample rides
  const rides = [
    {
      title: "Krishnagiri Overnighter",
      slug: "krishnagiri-overnighter",
      description: "A weekend off-road adventure through the rocky terrains of Krishnagiri. Experience 2 hours of off-road trails on Saturday evening, campfire sessions with music and stories under the stars, and a sunrise trail on Sunday morning.",
      shortDesc: "Weekend dirt ride with camping, campfire & sunrise trail through Krishnagiri hills.",
      location: "Krishnagiri, Tamil Nadu",
      state: "Tamil Nadu",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-08-16"),
      startPoint: "Marathalli, Bangalore",
      startTime: "3:00 PM",
      price: 2199,
      totalSlots: 6,
      difficulty: "moderate",
      type: "overnighter",
      status: "published",
      featured: true,
      distance: 180,
      elevationGain: 650,
      terrainTypes: JSON.stringify(["Rocky", "Forest trail", "Gravel"]),
      routeData: JSON.stringify({ center: [12.9, 78.1], zoom: 10 }),
      instructorId: createdInstructors[0].id,
      inclusions: JSON.stringify(["Camping & Tent (Sharing)", "Dinner", "Campfire Sessions", "Guided Trails", "First Aid Support"]),
      itinerary: JSON.stringify([
        { time: "3:00 PM", title: "Departure", desc: "Meet at Marathalli, Bangalore" },
        { time: "6:00 PM", title: "Off-road Trail", desc: "2 hours of dirt trail riding" },
        { time: "8:30 PM", title: "Camp Setup", desc: "Set up camp and dinner" },
        { time: "9:30 PM", title: "Campfire", desc: "Music, stories under the stars" },
        { time: "6:00 AM", title: "Sunrise Ride", desc: "Early morning scenic trail" },
        { time: "9:00 AM", title: "Breakfast & Wrap", desc: "Pack up and ride back" },
      ]),
    },
    {
      title: "Coorg Expedition",
      slug: "coorg-expedition",
      description: "A 3-day off-road expedition through the misty trails of Coorg. Navigate through coffee plantations, dense forests, river crossings, and mountain passes.",
      shortDesc: "3-day off-road expedition through Coorg's misty trails and coffee plantations.",
      location: "Coorg, Karnataka",
      state: "Karnataka",
      startDate: new Date("2026-09-05"),
      endDate: new Date("2026-09-07"),
      startPoint: "Bangalore",
      startTime: "6:00 AM",
      price: 5999,
      totalSlots: 8,
      difficulty: "hard",
      type: "multi-day",
      status: "published",
      featured: true,
      distance: 420,
      elevationGain: 2100,
      terrainTypes: JSON.stringify(["Mud", "River crossing", "Forest", "Mountain"]),
      routeData: JSON.stringify({ center: [12.4, 75.9], zoom: 10 }),
      instructorId: createdInstructors[0].id,
      inclusions: JSON.stringify(["All meals included", "Camping equipment", "Support vehicle", "Mechanic support", "First Aid", "Photography"]),
    },
    {
      title: "Nandi Hills Sunrise Ride",
      slug: "nandi-hills-sunrise",
      description: "A quick morning ride to Nandi Hills with a mix of highway and off-road sections. Perfect for beginners who want a taste of adventure riding.",
      shortDesc: "Morning dirt ride to Nandi Hills — great for beginners.",
      location: "Nandi Hills, Karnataka",
      state: "Karnataka",
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-08-10"),
      startPoint: "Hebbal Flyover, Bangalore",
      startTime: "4:30 AM",
      price: 799,
      totalSlots: 10,
      difficulty: "easy",
      type: "ride",
      status: "published",
      featured: false,
      distance: 65,
      elevationGain: 300,
      terrainTypes: JSON.stringify(["Gravel", "Tarmac"]),
      instructorId: createdInstructors[2].id,
      inclusions: JSON.stringify(["Guided trail", "Breakfast at summit", "First Aid Support"]),
    },
    {
      title: "Sakleshpur Trail Blazer",
      slug: "sakleshpur-trail-blazer",
      description: "An intense single-day off-road ride through the Western Ghats. Expect river crossings, steep climbs, and stunning viewpoints.",
      shortDesc: "Intense single-day off-road ride through Western Ghats terrain.",
      location: "Sakleshpur, Karnataka",
      state: "Karnataka",
      startDate: new Date("2026-08-22"),
      endDate: new Date("2026-08-22"),
      startPoint: "Bangalore",
      startTime: "5:00 AM",
      price: 1499,
      totalSlots: 8,
      difficulty: "hard",
      type: "ride",
      status: "published",
      featured: false,
      distance: 240,
      elevationGain: 1200,
      terrainTypes: JSON.stringify(["Rocky", "River crossing", "Steep incline"]),
      instructorId: createdInstructors[2].id,
      inclusions: JSON.stringify(["Lunch", "Guided trails", "Mechanic support", "First Aid"]),
    },
  ];

  for (const ride of rides) {
    await prisma.ride.upsert({ where: { slug: ride.slug }, update: {}, create: ride });
  }

  // Trainings
  const trainings = [
    {
      title: "Dirt Riding Basics",
      slug: "dirt-riding-basics",
      description: "Learn the fundamentals of off-road riding — body position, throttle control, braking on loose surfaces, and basic obstacle navigation.",
      shortDesc: "Master the fundamentals of off-road riding. Perfect for beginners.",
      level: "beginner",
      duration: "1 Day (8 hours)",
      price: 3499,
      totalSlots: 6,
      location: "DRC Training Ground, Bangalore",
      status: "published",
      featured: true,
      skillPointsAward: 100,
      instructorId: createdInstructors[2].id,
      curriculum: JSON.stringify(["Standing position & body mechanics", "Throttle and clutch control on dirt", "Braking techniques on loose surfaces", "Basic obstacle navigation", "Slow-speed balance drills", "Introduction to trail riding"]),
    },
    {
      title: "Trail Riding Mastery",
      slug: "trail-riding-mastery",
      description: "Take your off-road skills to the next level. Tackle challenging terrain including rocks, steep inclines, sand, and water crossings.",
      shortDesc: "Advance your skills with rocky terrain, sand, and water crossings.",
      level: "intermediate",
      duration: "2 Days",
      price: 6999,
      totalSlots: 6,
      location: "DRC Training Ground, Bangalore",
      status: "published",
      featured: true,
      requiredLevel: "bronze",
      skillPointsAward: 250,
      instructorId: createdInstructors[0].id,
      curriculum: JSON.stringify(["Advanced body positioning", "Rock garden navigation", "Hill climbs and descents", "Sand riding technique", "Water crossing fundamentals", "Line selection strategy", "Bike recovery after a fall"]),
    },
    {
      title: "Women's Off-Road Confidence Camp",
      slug: "womens-offroad-camp",
      description: "A supportive, women-only training environment designed to build confidence on dirt. No experience required.",
      shortDesc: "Women-only beginner training camp. Zero experience needed.",
      level: "beginner",
      duration: "1 Day (6 hours)",
      price: 2999,
      totalSlots: 8,
      location: "DRC Training Ground, Bangalore",
      status: "published",
      featured: false,
      skillPointsAward: 100,
      instructorId: createdInstructors[1].id,
    },
  ];

  for (const training of trainings) {
    await prisma.training.upsert({ where: { slug: training.slug }, update: {}, create: training });
  }

  // Badges
  const badges = [
    { name: "First Ride", slug: "first-ride", description: "Completed your very first ride with DRC", icon: "trophy", category: "rides", criteria: "total_rides", threshold: 1 },
    { name: "Trail Warrior", slug: "trail-warrior", description: "Completed 5 rides with DRC", icon: "mountain", category: "rides", criteria: "total_rides", threshold: 5 },
    { name: "Dirt Legend", slug: "dirt-legend", description: "Completed 10 rides with DRC", icon: "crown", category: "rides", criteria: "total_rides", threshold: 10 },
    { name: "Century Rider", slug: "century-rider", description: "Rode 100+ km on a single ride", icon: "gauge", category: "distance", criteria: "single_ride_km", threshold: 100 },
    { name: "Mud Master", slug: "mud-master", description: "Conquered your first mud trail", icon: "droplets", category: "terrain", criteria: "terrain_mud", threshold: 1 },
    { name: "River Crosser", slug: "river-crosser", description: "Successfully crossed a river on your bike", icon: "waves", category: "terrain", criteria: "terrain_river", threshold: 1 },
    { name: "Night Owl", slug: "night-owl", description: "Completed a night trail ride", icon: "moon", category: "special", criteria: "night_ride", threshold: 1 },
    { name: "Camp Spirit", slug: "camp-spirit", description: "Attended 3 camping rides", icon: "flame", category: "camping", criteria: "camping_rides", threshold: 3 },
    { name: "Skill Graduate", slug: "skill-graduate", description: "Completed a training program", icon: "graduation-cap", category: "training", criteria: "total_trainings", threshold: 1 },
    { name: "Community Voice", slug: "community-voice", description: "Published your first ride journal", icon: "pen-tool", category: "community", criteria: "total_journals", threshold: 1 },
    { name: "Social Butterfly", slug: "social-butterfly", description: "Referred 3 friends to DRC", icon: "users", category: "referral", criteria: "total_referrals", threshold: 3 },
    { name: "Reviewer", slug: "reviewer", description: "Left your first review", icon: "star", category: "community", criteria: "total_reviews", threshold: 1 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({ where: { slug: badge.slug }, update: {}, create: badge });
  }

  // Membership Plans
  const plans = [
    {
      name: "Silver Trail",
      slug: "silver-trail",
      tier: "silver",
      price: 2999,
      duration: 180,
      description: "Perfect for weekend riders. Get priority booking and member-only access.",
      benefits: JSON.stringify(["5% off all rides", "Priority booking", "Member-only WhatsApp group", "Birthday ride discount (20%)", "Free DRC sticker pack"]),
      maxGuests: 0,
      discount: 5,
      priority: true,
    },
    {
      name: "Gold Summit",
      slug: "gold-summit",
      tier: "gold",
      price: 5999,
      duration: 365,
      description: "For the committed adventurer. Bigger discounts, guest passes, and exclusive events.",
      benefits: JSON.stringify(["10% off all rides & trainings", "Priority booking", "1 free guest pass per quarter", "Exclusive member rides", "Free DRC merchandise kit", "Birthday ride discount (30%)", "Early access to new rides"]),
      maxGuests: 1,
      discount: 10,
      priority: true,
    },
    {
      name: "Platinum Apex",
      slug: "platinum-apex",
      tier: "platinum",
      price: 11999,
      duration: 365,
      description: "The ultimate DRC experience. All-access, max discounts, and VIP treatment.",
      benefits: JSON.stringify(["20% off all rides & trainings", "Priority booking + waitlist bypass", "2 free guest passes per quarter", "VIP access to all events", "Full DRC merchandise kit", "Free annual ride (up to ₹2,000 value)", "Personal ride concierge", "Birthday ride free", "Exclusive Platinum community"]),
      maxGuests: 2,
      discount: 20,
      priority: true,
    },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({ where: { slug: plan.slug }, update: {}, create: plan });
  }

  // Products (Merchandise)
  const products = [
    {
      name: "DRC Dirt Jersey",
      slug: "drc-dirt-jersey",
      description: "Premium breathable off-road riding jersey with DRC branding. Moisture-wicking fabric, reinforced elbows.",
      price: 1999,
      salePrice: 1599,
      category: "apparel",
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      stock: 50,
      featured: true,
    },
    {
      name: "DRC Trail Gloves",
      slug: "drc-trail-gloves",
      description: "Full-finger riding gloves with knuckle protection and touchscreen-compatible fingertips.",
      price: 899,
      category: "gear",
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      stock: 40,
      featured: true,
    },
    {
      name: "DRC Sticker Pack",
      slug: "drc-sticker-pack",
      description: "Set of 6 premium vinyl stickers — waterproof, UV-resistant. Perfect for helmets, bikes, and bottles.",
      price: 299,
      category: "accessories",
      stock: 200,
      featured: false,
    },
    {
      name: "DRC Hydration Bottle",
      slug: "drc-hydration-bottle",
      description: "1L stainless steel insulated bottle with DRC branding. Keeps water cold for 24 hours.",
      price: 799,
      category: "accessories",
      stock: 80,
      featured: true,
    },
    {
      name: "DRC Cap",
      slug: "drc-cap",
      description: "Adjustable snapback cap with embroidered DRC logo. One size fits all.",
      price: 599,
      category: "apparel",
      stock: 100,
      featured: false,
    },
    {
      name: "DRC Riding Neck Gaiter",
      slug: "drc-neck-gaiter",
      description: "Multi-use neck gaiter for dust protection. Breathable, quick-dry fabric.",
      price: 399,
      category: "gear",
      stock: 120,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({ where: { slug: product.slug }, update: {}, create: product });
  }

  // Events
  const events = [
    {
      title: "DRC Enduro Challenge 2026",
      slug: "drc-enduro-challenge-2026",
      description: "The ultimate test of off-road skills. 4-stage enduro race through diverse terrain — timed sections, technical obstacles, and a final hill climb sprint.",
      type: "race",
      date: new Date("2026-10-15"),
      endDate: new Date("2026-10-15"),
      location: "DRC Training Ground, Bangalore",
      price: 1999,
      totalSlots: 30,
      status: "upcoming",
      featured: true,
      rules: JSON.stringify(["Helmet mandatory", "Bike must pass tech inspection", "Min age: 18", "Valid riding license required", "Own bike required"]),
      prizes: JSON.stringify(["1st Place: ₹25,000 + Trophy", "2nd Place: ₹15,000 + Trophy", "3rd Place: ₹10,000 + Trophy", "Best Newcomer: ₹5,000"]),
    },
    {
      title: "Community Ride: Nandi Moonlight",
      slug: "community-ride-nandi-moonlight",
      description: "A free community ride under the full moon to Nandi Hills. Open to all DRC members. Bring your friends!",
      type: "community",
      date: new Date("2026-09-20"),
      location: "Nandi Hills, Karnataka",
      price: 0,
      totalSlots: 25,
      status: "upcoming",
      featured: false,
    },
    {
      title: "Women's Ride Day",
      slug: "womens-ride-day",
      description: "A special all-women ride event celebrating women in off-road riding. Includes a short skills workshop, scenic trail ride, and lunch.",
      type: "special",
      date: new Date("2026-09-28"),
      location: "Bangalore",
      price: 499,
      totalSlots: 15,
      status: "upcoming",
      featured: true,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({ where: { slug: event.slug }, update: {}, create: event });
  }

  // Coupons
  const coupons = [
    { code: "WELCOME20", type: "percentage", value: 20, minAmount: 500, maxUses: 100, validUntil: new Date("2027-12-31") },
    { code: "EARLYBIRD", type: "percentage", value: 15, minAmount: 1000, maxUses: 50, validUntil: new Date("2026-12-31") },
    { code: "FLAT500", type: "fixed", value: 500, minAmount: 2000, maxUses: 30, validUntil: new Date("2026-12-31") },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({ where: { code: coupon.code }, update: {}, create: coupon });
  }

  console.log("Seed data created successfully!");
  console.log(`Admin: admin@dirtridecamp.com / admin123`);
  console.log(`Created: ${instructors.length} instructors, ${rides.length} rides, ${trainings.length} trainings`);
  console.log(`Created: ${badges.length} badges, ${plans.length} membership plans, ${products.length} products`);
  console.log(`Created: ${events.length} events, ${coupons.length} coupons`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

// Use the direct (non-pooled) connection: this script does many sequential
// sequential writes and PgBouncer's transaction pooler drops idle connections
// under that load.
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });

const BLR = { lat: 12.9716, lng: 77.5946 };
function jitter(base, km) {
  const deg = km / 111;
  return base + (Math.random() * 2 - 1) * deg;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function img(seed, w = 600, h = 400) { return `https://picsum.photos/seed/${seed}/${w}/${h}`; }
function avatar(seed) { return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`; }

const REVIEW_COMMENTS = [
  "Showed up on time and fixed the issue quickly.",
  "Very professional, explained everything clearly.",
  "Good work but arrived a little late.",
  "Excellent quality, would book again.",
  "Fair pricing, no hidden charges.",
  "Polite and skilled, finished ahead of schedule.",
  "Solid work overall, minor delay in starting.",
  "Best experience I've had with a local service.",
];

const WORKERS = [
  { name: "Ramesh Kumar", category: "electrical", services: ["switchboard-installation", "house-wiring", "mcb-replacement"], bio: "Residential electrician specialising in wiring and switchboard installation.", exp: 8 },
  { name: "Suresh Babu", category: "electrical", services: ["fan-installation", "lighting-installation", "switch-replacement"], bio: "Quick, reliable electrical repairs for homes and small offices.", exp: 5 },
  { name: "Vikram Singh", category: "plumbing", services: ["tap-repair", "pipe-leakage-fix", "bathroom-plumbing"], bio: "Licensed plumber handling everything from leaks to full bathroom fit-outs.", exp: 10 },
  { name: "Manoj Yadav", category: "plumbing", services: ["drain-blockage-clearing", "water-tank-work"], bio: "Specialist in drainage and water tank maintenance.", exp: 6 },
  { name: "Arjun Reddy", category: "carpentry", services: ["furniture-repair", "door-window-fitting"], bio: "Custom carpentry and furniture repair with an eye for detail.", exp: 12 },
  { name: "Deepak Sharma", category: "carpentry", services: ["custom-furniture", "furniture-polishing"], bio: "Bespoke furniture maker, previously ran my own small workshop.", exp: 15 },
  { name: "Farida Khan", category: "painting", services: ["interior-painting", "texture-painting"], bio: "Interior painting specialist with a portfolio of 100+ homes.", exp: 9 },
  { name: "Naveen Gowda", category: "painting", services: ["exterior-painting", "waterproofing"], bio: "Exterior painting and waterproofing for apartments and villas.", exp: 7 },
  { name: "Priya Nair", category: "ac-appliance", services: ["ac-servicing", "ac-installation"], bio: "AC technician, factory trained on all major brands.", exp: 6 },
  { name: "Karthik Iyer", category: "ac-appliance", services: ["refrigerator-repair", "washing-machine-repair"], bio: "Appliance repair for fridges, washing machines, and microwaves.", exp: 8 },
  { name: "Lakshmi Devi", category: "cleaning", services: ["home-deep-cleaning", "sofa-carpet-cleaning"], bio: "Deep cleaning specialist, brings own eco-friendly supplies.", exp: 4 },
  { name: "Geeta Menon", category: "cleaning", services: ["bathroom-cleaning", "office-cleaning"], bio: "Reliable cleaning for homes and small offices.", exp: 5 },
  { name: "Anitha Rao", category: "cooking", services: ["daily-meal-preparation", "custom-meal-preparation"], bio: "Home cook specialising in South Indian and North Indian meals.", exp: 7 },
  { name: "Shalini Verma", category: "cooking", services: ["party-event-cooking", "baking"], bio: "Event cooking and baking for parties and celebrations.", exp: 6 },
  { name: "Mohammed Irfan", category: "moving", services: ["home-shifting", "furniture-moving"], bio: "Careful, insured home shifting with a small trained crew.", exp: 9 },
  { name: "Ravi Teja", category: "moving", services: ["packing-service", "loading-unloading"], bio: "Packing and loading specialist, quick turnaround.", exp: 4 },
  { name: "Ajay Kumar", category: "mechanic", services: ["two-wheeler-repair", "battery-jumpstart"], bio: "Two-wheeler mechanic, doorstep service.", exp: 6 },
  { name: "Sandeep Patil", category: "mechanic", services: ["car-servicing", "puncture-repair"], bio: "Car servicing and roadside assistance.", exp: 11 },
  { name: "Divya Krishnan", category: "pet-care", services: ["dog-walking", "pet-sitting"], bio: "Dog walker and pet sitter, animal lover with 5 years experience.", exp: 5 },
  { name: "Rahul Bose", category: "pet-care", services: ["pet-grooming"], bio: "Professional pet groomer for dogs and cats.", exp: 4 },
];

const CUSTOMERS = [
  "Anjali Mehta", "Rohan Das", "Kavya Pillai", "Sameer Ali", "Nisha Agarwal",
  "Vivek Chandran", "Pooja Kulkarni", "Aditya Rao", "Meera Joseph", "Sanjay Gupta",
];

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const categories = await prisma.category.findMany({ include: { services: true } });
  const serviceBySlug = new Map();
  for (const cat of categories) for (const s of cat.services) serviceBySlug.set(s.slug, s);

  // Reusable seed customers
  const customerIds = [];
  for (const name of CUSTOMERS) {
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@seed.localhands.test`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, phone: `+9198${randInt(10000000, 99999999)}`, passwordHash: password, role: "CUSTOMER" },
    });
    customerIds.push(user.id);
  }

  let created = 0;
  for (const w of WORKERS) {
    const email = `${w.name.toLowerCase().replace(/\s+/g, ".")}@seed.localhands.test`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    const lat = jitter(BLR.lat, 10);
    const lng = jitter(BLR.lng, 10);
    const seed = w.name.replace(/\s+/g, "");

    const user = await prisma.user.create({
      data: {
        name: w.name,
        email,
        phone: `+9197${randInt(10000000, 99999999)}`,
        passwordHash: password,
        role: "WORKER",
        workerProfile: {
          create: {
            bio: w.bio,
            experienceYears: w.exp,
            baseLat: lat,
            baseLng: lng,
            baseAddress: pick(["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar", "BTM Layout", "Malleshwaram", "Yelahanka"]) + ", Bengaluru",
            serviceRadiusKm: randInt(8, 20),
            identityVerified: Math.random() > 0.3,
            profileComplete: true,
            availableNow: Math.random() > 0.25,
            acceptsCustomJobs: Math.random() > 0.5,
            profilePhotoUrl: avatar(seed),
          },
        },
      },
    });

    const services = w.services.map((slug) => serviceBySlug.get(slug)).filter(Boolean);
    for (const service of services) {
      await prisma.workerService.create({
        data: {
          workerId: user.id,
          serviceId: service.id,
          price: Math.round(service.indicativePrice * (0.85 + Math.random() * 0.3)),
        },
      });
    }

    const productNames = {
      electrical: ["Modular Switch", "MCB 32A", "Copper Wire (per meter)", "LED Bulb"],
      plumbing: ["Bib Tap", "PVC Pipe (per meter)", "Pipe Fitting", "Flexible Hose"],
      carpentry: ["Door Hinge", "Cabinet Handle", "Wood Screws (pack)", "Polish (per litre)"],
      painting: ["Emulsion Paint (per litre)", "Primer (per litre)", "Painter's Tape"],
      "ac-appliance": ["Gas Refill Kit", "Compressor Capacitor", "Air Filter"],
      cleaning: ["Cleaning Solution", "Microfiber Cloth Set"],
      cooking: ["Spice Kit", "Disposable Containers"],
      moving: ["Moving Boxes (pack of 5)", "Bubble Wrap Roll", "Packing Tape"],
      mechanic: ["Engine Oil (per litre)", "Spark Plug", "Brake Pad"],
      "pet-care": ["Pet Shampoo", "Leash"],
    }[w.category] ?? [];
    for (const name of productNames) {
      await prisma.workerProduct.create({
        data: { workerId: user.id, name, price: randInt(30, 400), inStock: Math.random() > 0.15 },
      });
    }

    const portfolioCount = randInt(3, 6);
    for (let i = 0; i < portfolioCount; i++) {
      await prisma.workerPortfolio.create({
        data: { workerId: user.id, photoUrl: img(`${seed}-work-${i}`), caption: "" },
      });
    }

    // Completed jobs + multi-dimension reviews to build a real reputation
    const reviewCount = randInt(5, 10);
    let totalEarned = 0;
    for (let i = 0; i < reviewCount; i++) {
      const service = pick(services);
      if (!service) break;
      const price = Math.round(service.indicativePrice * (0.9 + Math.random() * 0.3));
      const customerId = pick(customerIds);

      const job = await prisma.job.create({
        data: {
          customerId,
          workerId: user.id,
          serviceId: service.id,
          status: "COMPLETED",
          problemDescription: `${service.name} requested.`,
          initialEstimate: price,
          confirmedTotal: price,
          paymentStatus: "PAID",
          paymentMethod: pick(["UPI", "CARD", "CASH"]),
          createdAt: new Date(Date.now() - randInt(5, 200) * 24 * 60 * 60 * 1000),
        },
      });
      totalEarned += price;

      const base = randInt(3, 5);
      await prisma.review.create({
        data: {
          jobId: job.id,
          customerId,
          workerId: user.id,
          quality: Math.min(5, base + randInt(0, 1)),
          punctuality: Math.min(5, base + randInt(-1, 1)),
          communication: Math.min(5, base + randInt(0, 1)),
          pricingTransparency: Math.min(5, base + randInt(-1, 1)),
          professionalism: Math.min(5, base + randInt(0, 1)),
          comment: Math.random() > 0.3 ? pick(REVIEW_COMMENTS) : "",
        },
      });
    }

    const agg = await prisma.review.aggregate({
      where: { workerId: user.id },
      _avg: { quality: true, punctuality: true, communication: true, pricingTransparency: true, professionalism: true },
    });
    const dims = [agg._avg.quality, agg._avg.punctuality, agg._avg.communication, agg._avg.pricingTransparency, agg._avg.professionalism].filter((v) => v != null);
    const ratingAvg = dims.length ? dims.reduce((s, v) => s + v, 0) / dims.length : 0;

    await prisma.workerProfile.update({
      where: { userId: user.id },
      data: { ratingAvg, jobsCompleted: reviewCount, totalEarned },
    });

    created++;
    console.log(`✓ ${w.name} (${w.category}) — ${services.length} services, ${reviewCount} reviews, rating ${ratingAvg.toFixed(1)}`);
  }

  // A handful of open custom jobs
  const customJobsSeed = [
    { description: "Move a cupboard from first floor to ground floor", tags: ["moving", "furniture"], budget: 500 },
    { description: "Walk my dog for 30 minutes every evening this week", tags: ["pet-care", "dog"], budget: 700 },
    { description: "Help set up chairs and tables for a small birthday event", tags: ["event", "setup"], budget: 1000 },
    { description: "Assemble a flat-pack wardrobe", tags: ["assembly", "furniture"], budget: 400 },
    { description: "Clear out and organise a storage room", tags: ["cleaning", "organizing"], budget: 800 },
  ];
  for (const cj of customJobsSeed) {
    const exists = await prisma.customJob.findFirst({ where: { description: cj.description } });
    if (exists) continue;
    await prisma.customJob.create({
      data: {
        customerId: pick(customerIds),
        description: cj.description,
        tags: cj.tags,
        locationLat: jitter(BLR.lat, 8),
        locationLng: jitter(BLR.lng, 8),
        locationAddress: pick(["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"]) + ", Bengaluru",
        budget: cj.budget,
        preferredTime: pick(["Today", "This week", "Flexible"]),
        isUrgent: Math.random() > 0.7,
      },
    });
  }

  console.log(`\nDone. Created ${created} new workers, ${customerIds.length} seed customers, custom jobs board populated.`);
  console.log(`All seed accounts share the password: password123`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

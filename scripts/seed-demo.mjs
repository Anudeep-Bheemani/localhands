import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });

const DEMO_PASSWORD = "Demo@1234";
const BLR = { lat: 12.9716, lng: 77.5946 };

function img(keyword, w = 800, h = 600, seed = 1) {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keyword)}?lock=${seed}`;
}
function avatar(n) {
  return `https://i.pravatar.cc/400?img=${n}`;
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const WORKING_HOURS_STANDARD = Array.from({ length: 7 }, (_, day) => ({
  day,
  enabled: day !== 0,
  start: "09:00",
  end: "19:00",
}));

async function upsertUser({ name, email, phone, role }) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, phone, passwordHash, role },
  });
}

async function main() {
  const categories = await prisma.category.findMany({ include: { services: true } });
  const svc = (slug) => {
    for (const c of categories) {
      const s = c.services.find((x) => x.slug === slug);
      if (s) return s;
    }
    throw new Error(`service not found: ${slug}`);
  };

  // --- Demo customers ---
  const anjali = await upsertUser({
    name: "Anjali Verma",
    email: "anjali.demo@localhands.demo",
    phone: "+919812345601",
    role: "CUSTOMER",
  });
  const vikram = await upsertUser({
    name: "Vikram Rao",
    email: "vikram.demo@localhands.demo",
    phone: "+919812345602",
    role: "CUSTOMER",
  });

  await prisma.savedAddress.deleteMany({ where: { customerId: { in: [anjali.id, vikram.id] } } });
  await prisma.savedAddress.createMany({
    data: [
      { customerId: anjali.id, label: "Home", address: "14 Indiranagar 100ft Road, Bengaluru", lat: BLR.lat + 0.01, lng: BLR.lng + 0.01 },
      { customerId: vikram.id, label: "Home", address: "22 Koramangala 5th Block, Bengaluru", lat: BLR.lat - 0.015, lng: BLR.lng + 0.02 },
    ],
  });

  // --- Demo worker 1: Ramesh Kumar, Electrician ---
  const rameshUser = await upsertUser({
    name: "Ramesh Kumar",
    email: "ramesh.electrician@localhands.demo",
    phone: "+919812345611",
    role: "WORKER",
  });
  await prisma.workerProfile.upsert({
    where: { userId: rameshUser.id },
    update: {},
    create: {
      userId: rameshUser.id,
      bio: "Residential electrician with 9 years of experience — wiring, switchboard installation, fan and lighting work. Fully equipped for same-day fixes.",
      experienceYears: 9,
      baseLat: BLR.lat + 0.008,
      baseLng: BLR.lng - 0.005,
      baseAddress: "Indiranagar, Bengaluru",
      serviceRadiusKm: 15,
      identityVerified: true,
      profileComplete: true,
      availableNow: true,
      acceptsCustomJobs: true,
      profilePhotoUrl: avatar(12),
      workingHours: WORKING_HOURS_STANDARD,
    },
  });

  await prisma.workerService.deleteMany({ where: { workerId: rameshUser.id } });
  await prisma.workerService.createMany({
    data: [
      { workerId: rameshUser.id, serviceId: svc("switchboard-installation").id, price: 380 },
      { workerId: rameshUser.id, serviceId: svc("house-wiring").id, price: 650 },
      { workerId: rameshUser.id, serviceId: svc("fan-installation").id, price: 260 },
      { workerId: rameshUser.id, serviceId: svc("mcb-replacement").id, price: 320 },
    ],
  });

  await prisma.workerProduct.deleteMany({ where: { workerId: rameshUser.id } });
  await prisma.workerProduct.createMany({
    data: [
      { workerId: rameshUser.id, name: "Modular Switch", price: 45, stockQty: 24, inStock: true, photoUrl: img("light-switch", 400, 400, 21) },
      { workerId: rameshUser.id, name: "MCB 32A", price: 220, stockQty: 8, inStock: true, photoUrl: img("circuit-breaker", 400, 400, 22) },
      { workerId: rameshUser.id, name: "Copper Wire (per meter)", price: 35, stockQty: 60, inStock: true, photoUrl: img("copper-wire", 400, 400, 23) },
      { workerId: rameshUser.id, name: "LED Bulb 9W", price: 90, stockQty: 15, inStock: true, photoUrl: img("led-bulb", 400, 400, 24) },
    ],
  });

  await prisma.workerPortfolio.deleteMany({ where: { workerId: rameshUser.id } });
  await prisma.workerPortfolio.createMany({
    data: [
      { workerId: rameshUser.id, photoUrl: img("electrician-working", 800, 600, 1), caption: "Switchboard rewiring — Indiranagar apartment" },
      { workerId: rameshUser.id, photoUrl: img("electrical-panel", 800, 600, 2), caption: "New MCB distribution box installed" },
      { workerId: rameshUser.id, photoUrl: img("electrical-wiring", 800, 600, 3), caption: "Full house rewiring" },
      { workerId: rameshUser.id, photoUrl: img("ceiling-fan-installation", 800, 600, 4), caption: "Ceiling fan installation" },
      { workerId: rameshUser.id, photoUrl: img("light-fixture", 800, 600, 5), caption: "Living room lighting setup" },
    ],
  });

  // --- Demo worker 2: Priya Sharma, Home Cook ---
  const priyaUser = await upsertUser({
    name: "Priya Sharma",
    email: "priya.cook@localhands.demo",
    phone: "+919812345612",
    role: "WORKER",
  });
  await prisma.workerProfile.upsert({
    where: { userId: priyaUser.id },
    update: {},
    create: {
      userId: priyaUser.id,
      bio: "Home cook specialising in North & South Indian meals, party catering, and healthy daily tiffins. 7 years cooking professionally for families across Bengaluru.",
      experienceYears: 7,
      baseLat: BLR.lat - 0.01,
      baseLng: BLR.lng + 0.015,
      baseAddress: "Koramangala, Bengaluru",
      serviceRadiusKm: 12,
      identityVerified: true,
      profileComplete: true,
      availableNow: true,
      acceptsCustomJobs: true,
      profilePhotoUrl: avatar(45),
      workingHours: WORKING_HOURS_STANDARD,
    },
  });

  await prisma.workerService.deleteMany({ where: { workerId: priyaUser.id } });
  await prisma.workerService.createMany({
    data: [
      { workerId: priyaUser.id, serviceId: svc("daily-meal-preparation").id, price: 450 },
      { workerId: priyaUser.id, serviceId: svc("party-event-cooking").id, price: 2200 },
      { workerId: priyaUser.id, serviceId: svc("custom-meal-preparation").id, price: 650 },
      { workerId: priyaUser.id, serviceId: svc("baking").id, price: 550 },
    ],
  });

  await prisma.workerProduct.deleteMany({ where: { workerId: priyaUser.id } });
  await prisma.workerProduct.createMany({
    data: [
      { workerId: priyaUser.id, name: "Spice Kit (home-blended)", price: 250, stockQty: 10, inStock: true, photoUrl: img("indian-spices", 400, 400, 31) },
      { workerId: priyaUser.id, name: "Disposable Containers (set of 20)", price: 180, stockQty: 12, inStock: true, photoUrl: img("food-containers", 400, 400, 32) },
    ],
  });

  await prisma.workerPortfolio.deleteMany({ where: { workerId: priyaUser.id } });
  await prisma.workerPortfolio.createMany({
    data: [
      { workerId: priyaUser.id, photoUrl: img("indian-food", 800, 600, 11), caption: "Weekend thali spread" },
      { workerId: priyaUser.id, photoUrl: img("home-cooking", 800, 600, 12), caption: "Cooking for a family of 5" },
      { workerId: priyaUser.id, photoUrl: img("party-catering", 800, 600, 13), caption: "50-guest birthday catering" },
      { workerId: priyaUser.id, photoUrl: img("baking-cake", 800, 600, 14), caption: "Custom birthday cake" },
      { workerId: priyaUser.id, photoUrl: img("south-indian-food", 800, 600, 15), caption: "South Indian breakfast spread" },
    ],
  });

  // --- Reviews + earnings history for both demo workers ---
  const REVIEW_COMMENTS = [
    "Extremely professional, on time, and the work was spotless.",
    "Explained everything clearly before starting — no surprises on the bill.",
    "Great experience, will book again.",
    "Good quality work, slightly delayed but worth the wait.",
    "Very polite and skilled, fixed the issue quickly.",
    "Best service I've used on this platform so far.",
  ];

  async function seedHistory(workerUserId, serviceIds, customerIds, count) {
    let totalEarned = 0;
    for (let i = 0; i < count; i++) {
      const serviceId = pick(serviceIds);
      const workerService = await prisma.workerService.findUnique({
        where: { workerId_serviceId: { workerId: workerUserId, serviceId } },
      });
      const price = workerService.price;
      const customerId = pick(customerIds);
      const job = await prisma.job.create({
        data: {
          customerId,
          workerId: workerUserId,
          serviceId,
          status: "COMPLETED",
          problemDescription: "Demo history job",
          initialEstimate: price,
          confirmedTotal: price,
          paymentStatus: "PAID",
          paymentMethod: pick(["UPI", "CARD", "CASH"]),
          createdAt: new Date(Date.now() - randInt(10, 250) * 24 * 60 * 60 * 1000),
        },
      });
      totalEarned += price;
      const base = randInt(4, 5);
      await prisma.review.create({
        data: {
          jobId: job.id,
          customerId,
          workerId: workerUserId,
          quality: Math.min(5, base + randInt(0, 1)),
          punctuality: Math.min(5, base + randInt(-1, 1)),
          communication: Math.min(5, base + randInt(0, 1)),
          pricingTransparency: Math.min(5, base + randInt(-1, 1)),
          professionalism: 5,
          comment: pick(REVIEW_COMMENTS),
        },
      });
    }
    const agg = await prisma.review.aggregate({
      where: { workerId: workerUserId },
      _avg: { quality: true, punctuality: true, communication: true, pricingTransparency: true, professionalism: true },
    });
    const dims = [agg._avg.quality, agg._avg.punctuality, agg._avg.communication, agg._avg.pricingTransparency, agg._avg.professionalism].filter((v) => v != null);
    const ratingAvg = dims.reduce((s, v) => s + v, 0) / dims.length;
    await prisma.workerProfile.update({ where: { userId: workerUserId }, data: { ratingAvg, jobsCompleted: count, totalEarned } });
  }

  // Only seed history if not already present (idempotent-ish)
  const rameshExisting = await prisma.review.count({ where: { workerId: rameshUser.id } });
  if (rameshExisting === 0) {
    await seedHistory(
      rameshUser.id,
      [svc("switchboard-installation").id, svc("house-wiring").id, svc("fan-installation").id, svc("mcb-replacement").id],
      [anjali.id, vikram.id],
      7
    );
  }
  const priyaExisting = await prisma.review.count({ where: { workerId: priyaUser.id } });
  if (priyaExisting === 0) {
    await seedHistory(
      priyaUser.id,
      [svc("daily-meal-preparation").id, svc("custom-meal-preparation").id, svc("baking").id],
      [anjali.id, vikram.id],
      6
    );
  }

  // --- Live demo scenario 1: Anjali -> Ramesh, in-progress booking with chat ---
  const existingLiveJob = await prisma.job.findFirst({
    where: { customerId: anjali.id, workerId: rameshUser.id, problemDescription: { contains: "switchboard is sparking" } },
  });
  if (!existingLiveJob) {
    const switchboardService = svc("switchboard-installation");
    const ws = await prisma.workerService.findUnique({
      where: { workerId_serviceId: { workerId: rameshUser.id, serviceId: switchboardService.id } },
    });
    const liveJob = await prisma.job.create({
      data: {
        customerId: anjali.id,
        workerId: rameshUser.id,
        serviceId: switchboardService.id,
        status: "REQUESTED",
        isUrgent: true,
        problemDescription: "My switchboard is sparking near the kitchen, need someone urgently.",
        jobLat: BLR.lat + 0.01,
        jobLng: BLR.lng + 0.01,
        jobAddress: "14 Indiranagar 100ft Road, Bengaluru",
        initialEstimate: ws.price,
        statusHistory: { create: { status: "REQUESTED", note: "Booking request sent" } },
      },
    });
    await prisma.chatMessage.createMany({
      data: [
        { jobId: liveJob.id, senderId: anjali.id, content: "Hi Ramesh, it's sparking near the switchboard - can you come today?" },
        { jobId: liveJob.id, senderId: rameshUser.id, content: "Yes, I can be there within the hour once I accept the request." },
      ],
    });
    await prisma.notification.create({
      data: {
        userId: rameshUser.id,
        type: "booking_requested",
        title: "New booking request from Anjali Verma",
        message: "My switchboard is sparking near the kitchen, need someone urgently.",
        link: `/worker/jobs/${liveJob.id}`,
      },
    });
  }

  // --- Live demo scenario 2: Vikram -> Priya, completed + reviewed already covered by history; add a fresh COMPLETED unpaid one to demo payment flow ---
  const existingPayDemo = await prisma.job.findFirst({
    where: { customerId: vikram.id, workerId: priyaUser.id, problemDescription: { contains: "birthday dinner" } },
  });
  if (!existingPayDemo) {
    const partyService = svc("party-event-cooking");
    const ws = await prisma.workerService.findUnique({
      where: { workerId_serviceId: { workerId: priyaUser.id, serviceId: partyService.id } },
    });
    const payJob = await prisma.job.create({
      data: {
        customerId: vikram.id,
        workerId: priyaUser.id,
        serviceId: partyService.id,
        status: "COMPLETED",
        problemDescription: "Cooking for a small birthday dinner, 10 guests.",
        jobLat: BLR.lat - 0.015,
        jobLng: BLR.lng + 0.02,
        jobAddress: "22 Koramangala 5th Block, Bengaluru",
        initialEstimate: ws.price,
        confirmedTotal: ws.price,
        paymentStatus: "UNPAID",
        scopeConfirmed: true,
        proposedScope: "Full course dinner for 10 guests",
        proposedTotal: ws.price,
        statusHistory: {
          create: [
            { status: "BOOKED", note: "Worker accepted the request" },
            { status: "COMPLETED", note: "Job marked complete" },
          ],
        },
        evidence: {
          create: [
            { photoUrl: img("kitchen-prep", 600, 400, 41), type: "BEFORE" },
            { photoUrl: img("dinner-party-food", 600, 400, 42), type: "AFTER" },
          ],
        },
      },
    });
    await prisma.notification.create({
      data: {
        userId: vikram.id,
        type: "job_completed",
        title: "Priya Sharma marked the job complete",
        message: "Review the invoice and pay when ready.",
        link: `/customer/jobs/${payJob.id}`,
      },
    });
  }

  // --- Favorite: Vikram favorites Priya ---
  await prisma.favorite.upsert({
    where: { customerId_workerId: { customerId: vikram.id, workerId: priyaUser.id } },
    update: {},
    create: { customerId: vikram.id, workerId: priyaUser.id },
  });

  console.log("Demo seed complete.\n");
  console.log("Login credentials (all use password: Demo@1234)\n");
  console.log("Worker  — Ramesh Kumar (Electrician): ramesh.electrician@localhands.demo");
  console.log("Worker  — Priya Sharma (Home Cook):    priya.cook@localhands.demo");
  console.log("Customer — Anjali Verma:               anjali.demo@localhands.demo");
  console.log("Customer — Vikram Rao:                 vikram.demo@localhands.demo");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

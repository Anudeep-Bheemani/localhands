import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const REVIEW_COMMENTS = [
  "Showed up on time and fixed the issue quickly.",
  "Very professional, explained everything clearly.",
  "Good work but arrived a little late.",
  "Excellent quality, would book again.",
  "Fair pricing, no hidden charges.",
];

async function main() {
  const stuck = await prisma.workerProfile.findMany({
    where: { jobsCompleted: 0 },
    include: { services: { include: { service: true } } },
  });

  const customers = await prisma.user.findMany({ where: { email: { endsWith: "@seed.localhands.test" }, role: "CUSTOMER" } });

  for (const w of stuck) {
    if (w.services.length === 0) continue;
    const reviewCount = randInt(5, 10);
    let totalEarned = 0;

    for (let i = 0; i < reviewCount; i++) {
      const ws = pick(w.services);
      const price = Math.round(ws.service.indicativePrice * (0.9 + Math.random() * 0.3));
      const customerId = pick(customers).id;

      const job = await prisma.job.create({
        data: {
          customerId,
          workerId: w.userId,
          serviceId: ws.serviceId,
          status: "COMPLETED",
          problemDescription: `${ws.service.name} requested.`,
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
          workerId: w.userId,
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
      where: { workerId: w.userId },
      _avg: { quality: true, punctuality: true, communication: true, pricingTransparency: true, professionalism: true },
    });
    const dims = [agg._avg.quality, agg._avg.punctuality, agg._avg.communication, agg._avg.pricingTransparency, agg._avg.professionalism].filter((v) => v != null);
    const ratingAvg = dims.reduce((s, v) => s + v, 0) / dims.length;

    await prisma.workerProfile.update({
      where: { userId: w.userId },
      data: { ratingAvg, jobsCompleted: reviewCount, totalEarned },
    });

    console.log(`✓ backfilled ${w.userId}: ${reviewCount} reviews, rating ${ratingAvg.toFixed(1)}`);
  }

  console.log("Backfill done.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Electrical",
    slug: "electrical",
    icon: "zap",
    services: [
      ["Switch Replacement", 150],
      ["Fan Installation", 250],
      ["Switchboard Installation", 350],
      ["House Wiring", 600],
      ["MCB Replacement", 300],
      ["Lighting Installation", 300],
    ],
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    icon: "droplet",
    services: [
      ["Tap Repair", 150],
      ["Pipe Leakage Fix", 300],
      ["Drain Blockage Clearing", 350],
      ["Bathroom Plumbing", 500],
      ["Water Tank Work", 450],
    ],
  },
  {
    name: "Carpentry",
    slug: "carpentry",
    icon: "hammer",
    services: [
      ["Furniture Repair", 300],
      ["Door / Window Fitting", 450],
      ["Custom Furniture", 1500],
      ["Furniture Polishing", 400],
    ],
  },
  {
    name: "Painting",
    slug: "painting",
    icon: "brush",
    services: [
      ["Interior Painting", 1200],
      ["Exterior Painting", 1800],
      ["Waterproofing", 900],
      ["Texture Painting", 1000],
    ],
  },
  {
    name: "AC & Appliance Repair",
    slug: "ac-appliance",
    icon: "wind",
    services: [
      ["AC Servicing", 500],
      ["AC Installation", 900],
      ["Refrigerator Repair", 400],
      ["Washing Machine Repair", 400],
      ["Microwave Repair", 350],
    ],
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    icon: "sparkles",
    services: [
      ["Home Deep Cleaning", 800],
      ["Bathroom Cleaning", 300],
      ["Sofa & Carpet Cleaning", 500],
      ["Office Cleaning", 900],
    ],
  },
  {
    name: "Cooking",
    slug: "cooking",
    icon: "chef-hat",
    services: [
      ["Daily Meal Preparation", 400],
      ["Party / Event Cooking", 2000],
      ["Custom Meal Preparation", 600],
      ["Baking", 500],
    ],
  },
  {
    name: "Moving & Packing",
    slug: "moving",
    icon: "truck",
    services: [
      ["Home Shifting", 2500],
      ["Furniture Moving", 600],
      ["Packing Service", 700],
      ["Loading / Unloading", 400],
    ],
  },
  {
    name: "Mechanic",
    slug: "mechanic",
    icon: "car",
    services: [
      ["Two-Wheeler Repair", 250],
      ["Car Servicing", 1200],
      ["Battery Jumpstart", 200],
      ["Puncture Repair", 100],
    ],
  },
  {
    name: "Pet Care",
    slug: "pet-care",
    icon: "dog",
    services: [
      ["Dog Walking", 150],
      ["Pet Grooming", 500],
      ["Pet Sitting", 400],
    ],
  },
];

for (const cat of CATEGORIES) {
  const category = await prisma.category.upsert({
    where: { slug: cat.slug },
    update: { name: cat.name, icon: cat.icon },
    create: { name: cat.name, slug: cat.slug, icon: cat.icon },
  });

  for (const [serviceName, price] of cat.services) {
    const slug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.service.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug } },
      update: { name: serviceName, indicativePrice: price },
      create: { categoryId: category.id, name: serviceName, slug, indicativePrice: price },
    });
  }
  console.log(`✓ ${cat.name} (${cat.services.length} services)`);
}

console.log("Done seeding categories and services.");
await prisma.$disconnect();

import { Prisma } from "@prisma/client";

// Shared include shape for job workspace views. Selects only public-safe
// fields on User (never passwordHash) since this gets passed into Client
// Components / returned as API JSON.
export const jobWorkspaceInclude = {
  customer: { select: { id: true, name: true, phone: true } },
  worker: {
    select: {
      userId: true,
      baseLat: true,
      baseLng: true,
      profilePhotoUrl: true,
      ratingAvg: true,
      user: { select: { id: true, name: true, phone: true } },
    },
  },
  service: { include: { category: true } },
  jobProducts: { include: { workerProduct: true } },
  statusHistory: { orderBy: { timestamp: "asc" } },
  evidence: { orderBy: { createdAt: "asc" } },
  additionalWork: { orderBy: { createdAt: "desc" } },
  review: true,
} satisfies Prisma.JobInclude;

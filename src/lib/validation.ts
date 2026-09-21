import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Digits only"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "WORKER"]),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  bio: z.string().max(1000).default(""),
  experienceYears: z.coerce.number().int().min(0).max(60),
  baseAddress: z.string().min(3, "Enter a service area / address"),
  baseLat: z.coerce.number(),
  baseLng: z.coerce.number(),
  serviceRadiusKm: z.coerce.number().min(1).max(50),
  acceptsCustomJobs: z.boolean().default(false),
  profilePhotoUrl: z.string().url().nullable(),
  services: z
    .array(z.object({ serviceId: z.string(), price: z.coerce.number().min(0) }))
    .min(1, "Select at least one service you offer"),
  portfolio: z.array(z.object({ photoUrl: z.string().url(), caption: z.string().default("") })).default([]),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

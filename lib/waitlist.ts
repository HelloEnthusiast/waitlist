import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(80).nullish().transform((v) => v || undefined),
  persona: z.enum(["INDIVIDUAL", "LAWYER", "BUSINESS", "STUDENT"]).default("INDIVIDUAL"),
  // Honeypot: real users never see or fill this field.
  company: z.string().max(0).nullish(),
});

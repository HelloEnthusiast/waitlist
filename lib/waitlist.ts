import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./db";

// Each successful referral moves the referrer this many places up the queue.
export const REFERRAL_BOOST = 5;

const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(80).nullish().transform((v) => v || undefined),
  persona: z.enum(["INDIVIDUAL", "LAWYER", "BUSINESS", "STUDENT"]).default("INDIVIDUAL"),
  ref: z.string().trim().max(16).nullish().transform((v) => v || undefined),
  // Honeypot: real users never see or fill this field.
  company: z.string().max(0).nullish(),
});

export type WaitlistStatus = {
  referralCode: string;
  position: number;
  total: number;
  referralCount: number;
  alreadyJoined: boolean;
};

function newReferralCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return code;
}

async function statusFor(entry: { id: number; referralCode: string; referralCount: number }, alreadyJoined: boolean): Promise<WaitlistStatus> {
  const score = entry.id - REFERRAL_BOOST * entry.referralCount;
  const [[{ ahead }], total] = await Promise.all([
    prisma.$queryRaw<{ ahead: bigint }[]>`
      SELECT COUNT(*) AS ahead FROM "WaitlistEntry"
      WHERE ("id" - ${REFERRAL_BOOST} * "referralCount") < ${score}
         OR (("id" - ${REFERRAL_BOOST} * "referralCount") = ${score} AND "id" < ${entry.id})`,
    prisma.waitlistEntry.count(),
  ]);
  return {
    referralCode: entry.referralCode,
    position: Number(ahead) + 1,
    total,
    referralCount: entry.referralCount,
    alreadyJoined,
  };
}

export async function joinWaitlist(input: z.infer<typeof signupSchema>): Promise<WaitlistStatus> {
  const existing = await prisma.waitlistEntry.findUnique({ where: { email: input.email } });
  if (existing) return statusFor(existing, true);

  const referrer = input.ref ? await prisma.waitlistEntry.findUnique({ where: { referralCode: input.ref } }) : null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const entry = await prisma.$transaction(async (tx) => {
        const created = await tx.waitlistEntry.create({
          data: {
            email: input.email,
            name: input.name,
            persona: input.persona,
            referralCode: newReferralCode(),
            referredById: referrer?.id,
          },
        });
        if (referrer) {
          await tx.waitlistEntry.update({
            where: { id: referrer.id },
            data: { referralCount: { increment: 1 } },
          });
        }
        return created;
      });
      return statusFor(entry, false);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = String(err.meta?.target ?? "");
        if (target.includes("email")) {
          // Lost a race with a concurrent signup for the same email.
          const entry = await prisma.waitlistEntry.findUniqueOrThrow({ where: { email: input.email } });
          return statusFor(entry, true);
        }
        continue; // referral code collision — retry with a fresh code
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a referral code");
}

export async function statusByCode(code: string): Promise<WaitlistStatus | null> {
  const entry = await prisma.waitlistEntry.findUnique({ where: { referralCode: code } });
  return entry ? statusFor(entry, true) : null;
}

export async function waitlistTotal(): Promise<number> {
  return prisma.waitlistEntry.count();
}

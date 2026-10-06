# okil.ai waitlist

Next.js 15 + Prisma (Postgres) + Tailwind landing page with a referral-powered waitlist.

## Run locally

```bash
cp .env.example .env        # fill in DATABASE_URL and a long random ADMIN_TOKEN
npm install
npx prisma migrate dev
npm run dev
```

## How it works

- `POST /api/waitlist` — `{ email, name?, persona, ref? }`. Re-submitting an existing email returns that person's current spot instead of an error.
- `GET /api/waitlist?code=<referralCode>` — current position for a referral code. The browser remembers the visitor's code so returning visitors see their spot.
- Queue position = signup order, moved up `REFERRAL_BOOST` (5) places per referral (`lib/waitlist.ts`).
- `GET /api/admin/export` with `Authorization: Bearer $ADMIN_TOKEN` downloads everyone as CSV:

  ```bash
  curl -H "Authorization: Bearer $ADMIN_TOKEN" https://okil.ai/api/admin/export -o waitlist.csv
  ```

## Spam protection

Honeypot field, zod validation, and a per-IP rate limit (5 signups/min). The limiter is in-memory, so on
serverless or multi-instance hosting, swap `lib/rate-limit.ts` for Redis (e.g. Upstash).

## Editing copy

All marketing copy lives in `app/page.tsx`; the form and success/referral screen are in `app/WaitlistForm.tsx`.

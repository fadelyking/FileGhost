# FileGhost

FileGhost is a privacy-first image metadata cleaner for creators. It removes hidden metadata such as EXIF, XMP, IPTC, GPS/location data, software/editor tags, camera/device info, and C2PA/provenance markers where technically possible before users download clean files.

FileGhost does not claim to bypass TikTok, Instagram, Facebook, or any platform labels, ranking systems, filters, moderation, or enforcement.

## Brand Name Ideas

1. PostClean
2. MetaWipe
3. CleanFrame
4. GhostPixel
5. StripSnap

## What Works In The MVP

- Guest dashboard access
- 5 free guest cleans tracked in `localStorage`
- Supabase email/password signup and login
- Logged-in free usage tracked in `profiles.free_images_used`
- Paid plan access logic for monthly, 3-month pass, and lifetime
- Server-side file validation
- Server-side Sharp re-encoding without `withMetadata()`
- Before/after metadata preview
- Private Supabase Storage uploads to `cleaned-images`
- API-based individual downloads
- ZIP downloads through the API
- Stripe Checkout
- Stripe Customer Portal
- Stripe webhook plan updates

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

STRIPE_MONTHLY_PRICE_ID=
STRIPE_THREE_MONTH_PRICE_ID=
STRIPE_LIFETIME_PRICE_ID=

MAX_UPLOAD_MB=15
DELETE_AFTER_HOURS=24
```

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

In this local workspace, TypeScript and lint pass. The production build previously stalled because public pages were doing server-side Supabase auth through the header during prerendering. That has been removed; `/dashboard` and `/account` are now forced dynamic.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Confirm the private Storage bucket `cleaned-images` exists. The schema creates it if permissions allow; otherwise create it manually.
4. Enable email/password auth.
5. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`
6. Add Supabase env vars locally and in Vercel.

Tables:

- `profiles`
- `processed_images`
- `usage_events`

Storage:

- Bucket: `cleaned-images`
- Visibility: private
- Files are served through API routes only.

## Stripe Setup

Create products/prices:

- Monthly: `$4.99/month`, recurring monthly
- 3-Month Pass: `$12`, one-time
- Lifetime: `$19`, one-time

Set env vars:

- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_THREE_MONTH_PRICE_ID`
- `STRIPE_LIFETIME_PRICE_ID`

Enable Stripe Customer Portal.

Webhook endpoint:

```txt
https://your-domain.com/api/stripe/webhook
```

Listen for:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Local Testing Checklist

1. Open `/dashboard` as a guest.
2. Upload one JPG under 15MB.
3. Confirm before/after metadata appears.
4. Download the cleaned image.
5. Upload PNG and WEBP files.
6. Upload multiple images.
7. Download all as ZIP.
8. Process 5 images as a guest and confirm the upgrade CTA appears.
9. Sign up at `/login`.
10. Process 5 images as a logged-in free user and confirm Supabase usage blocks the next batch.
11. Click a paid plan on `/pricing`.
12. Complete Stripe Checkout in test mode.
13. Confirm the webhook updates the profile plan.
14. Confirm paid user can process after the free limit.
15. Open `/account` and verify plan, expiry/status, billing portal, and sign out.
16. Test mobile width around 390px.

## Vercel Deployment Checklist

1. Push the repo.
2. Import into Vercel.
3. Add every env var from `.env.example`.
4. Confirm install command is `npm install`.
5. Deploy.
6. Add production URL to Supabase auth redirects.
7. Add production webhook URL in Stripe.
8. Run a real test checkout in Stripe test mode.

## C2PA / Provenance Limitation

Sharp re-encoding strips common metadata because the app never calls `withMetadata()`. It commonly removes EXIF, XMP, IPTC, GPS, editor tags, and many embedded markers.

C2PA/provenance metadata is more complex. This MVP detects simple C2PA/content credential markers and re-encodes files in a way that usually removes embedded metadata, but it does not provide a cryptographic guarantee that every provenance structure is removed in every file. For a stronger production version, add ExifTool or a dedicated C2PA parser/verifier in a hardened worker.

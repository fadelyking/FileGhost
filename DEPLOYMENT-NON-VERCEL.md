# FileGhost non-Vercel deployment

FileGhost uses server-side Node.js image processing with Sharp. Deploy it to a normal Node/Docker host, then use Cloudflare for DNS, CDN, and basic protection.

## Recommended setup

1. Host the app on Render, DigitalOcean App Platform, Railway, Fly.io, or a VPS.
2. Keep Supabase for auth, database, and storage.
3. Keep Stripe for payments and webhooks.
4. Put Cloudflare in front of the custom domain.

Cloudflare Pages/Workers are not recommended for this MVP because the image-cleaning API uses Node.js native processing.

## Docker deployment

Use the included `Dockerfile`.

Required environment variables:

```txt
NEXT_PUBLIC_SITE_URL=
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

After deploying, update:

- `NEXT_PUBLIC_SITE_URL` to the live domain, for example `https://fileghost.com`
- Supabase Auth site URL and redirect URLs
- Stripe webhook endpoint URL to `https://your-domain.com/api/stripe/webhook`
- Stripe checkout/product links only if needed

## Cloudflare DNS

1. Add the domain to Cloudflare.
2. Change nameservers at the domain registrar to Cloudflare's nameservers.
3. Add DNS records pointing to the Node host.
4. Enable SSL/TLS Full mode.
5. Keep the app host as the origin.

## Why not Vercel

Vercel serverless functions reject request bodies above their payload limit before the app can process them. A normal Node host is a better fit for image uploads and Sharp processing.

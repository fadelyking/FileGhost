import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = process.cwd();
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function read(path) {
  return readFileSync(`${root}/${path}`, "utf8");
}

function has(source, text, message = `Expected to find ${text}`) {
  assert.ok(source.includes(text), message);
}

function hasAny(source, values, message) {
  assert.ok(values.some((value) => source.includes(value)), message || `Expected one of: ${values.join(", ")}`);
}

function parseEnv(path) {
  if (!existsSync(`${root}/${path}`)) return {};

  return Object.fromEntries(
    read(path)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function envValue(key) {
  const localEnv = parseEnv(".env.local");
  return process.env[key] || localEnv[key] || "";
}

test("required public environment values are available for auth and client builds", () => {
  assert.match(
    envValue("NEXT_PUBLIC_SITE_URL"),
    /^https?:\/\//,
    "NEXT_PUBLIC_SITE_URL must be set. For Fly deploys, pass it with --build-arg NEXT_PUBLIC_SITE_URL=https://fileghost.app"
  );
  assert.match(
    envValue("NEXT_PUBLIC_SUPABASE_URL"),
    /^https:\/\/.+\.supabase\.co$/,
    "NEXT_PUBLIC_SUPABASE_URL must be set. For Fly deploys, pass it with --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
  );
  assert.ok(
    envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY").length > 20,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. For Fly deploys, pass it with --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key"
  );
});

test(".env.example documents the important launch variables", () => {
  const envExample = read(".env.example");
  [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_MONTHLY_PRICE_ID",
    "STRIPE_THREE_MONTH_PRICE_ID",
    "STRIPE_LIFETIME_PRICE_ID",
    "MAX_UPLOAD_MB",
    "DELETE_AFTER_HOURS"
  ].forEach((key) => has(envExample, key));
});

test("landing page CTAs, SEO schema, and compliance copy are present", () => {
  const page = read("app/page.tsx");
  has(page, "Clean Your First Photo Free");
  has(page, "See What Gets Removed");
  has(page, 'href="/dashboard"');
  has(page, 'href="#metadata"');
  has(page, 'id="metadata-heading"');
  has(page, '"@type": "WebApplication"');
  has(page, '"@type": "FAQPage"');
  has(page, "Platforms may still classify content using other signals");
  assert.equal((page.match(/<h1\b/g) || []).length, 1, "Landing page should have exactly one H1");
  assert.doesNotMatch(page.toLowerCase(), /bypass|avoid.*detection|will never.*label|guaranteed? to stop/, "Landing copy must not claim platform bypassing");
});

test("pricing buttons route through Stripe checkout or login", () => {
  const pricingCards = read("components/pricing-cards.tsx");
  ["monthly", "three_month_pass", "lifetime"].forEach((plan) => has(pricingCards, plan));
  has(pricingCards, "/api/stripe/checkout");
  has(pricingCards, "router.push(`/login?next=/pricing&plan=${plan}`)");
  has(pricingCards, "window.location.href = payload.url");
  has(pricingCards, "Clean 5 Images Free");
  has(pricingCards, "Start Monthly");
  has(pricingCards, "Unlock Lifetime Access");
  has(pricingCards, "Get 3 Months");
});

test("login page supports Google, magic links, email/password, and confirmation feedback", () => {
  const authForm = read("components/auth-form.tsx");
  const loginPage = read("app/login/page.tsx");
  const callbackRoute = read("app/auth/callback/route.ts");
  has(loginPage, "<AuthForm");
  has(authForm, "Continue with Google");
  has(authForm, "signInWithOAuth");
  has(authForm, 'provider: "google"');
  has(authForm, "signInWithOtp");
  has(authForm, "signInWithPassword");
  has(authForm, "auth.signUp");
  has(authForm, "Confirmation email sent");
  has(authForm, "/auth/callback");
  has(callbackRoute, "NEXT_PUBLIC_SITE_URL");
  has(callbackRoute, "redirectOrigin");
  has(callbackRoute, "requestUrl.hostname === \"localhost\"");
});

test("upload cleaner covers selection, guest limits, cleaning, downloads, zip, and upgrade actions", () => {
  const upload = read("components/upload-cleaner.tsx");
  const plans = read("lib/plans.ts");
  has(upload, "Choose photos to clean");
  has(upload, "allowedTypes");
  has(upload, '"image/jpeg"');
  has(upload, '"image/png"');
  has(upload, '"image/webp"');
  has(upload, "MAX_FILE_SIZE_BYTES");
  has(upload, "MAX_BATCH_FILES");
  has(upload, "BatchIndicator");
  has(upload, "FileGhost_guest_used");
  has(upload, "GUEST_FREE_IMAGE_LIMIT");
  has(upload, "Create Free Account — Get 5 More");
  has(plans, "GUEST_FREE_IMAGE_LIMIT = 5");
  has(plans, "FREE_IMAGE_LIMIT = 10");
  has(upload, "/api/images/clean");
  has(upload, "/api/images/zip");
  has(upload, "Download ZIP");
  has(upload, "Download");
  has(upload, "Upgrade for unlimited cleaning");
  has(upload, "/api/stripe/checkout");
  has(upload, "Continue with Google");
});

test("image cleaning API validates files and returns downloadable results", () => {
  const cleanRoute = read("app/api/images/clean/route.ts");
  has(cleanRoute, "request.formData()");
  has(cleanRoute, "z.instanceof(File)");
  has(cleanRoute, "isAllowedImageType");
  has(cleanRoute, "MAX_FILE_SIZE_BYTES");
  has(cleanRoute, "MAX_BATCH_FILES");
  has(cleanRoute, "MAX_BATCH_SIZE_BYTES");
  has(cleanRoute, "INSUFFICIENT_CREDITS");
  has(cleanRoute, "cleansRemaining");
  has(cleanRoute, "cleanImageBuffer");
  has(cleanRoute, '.from("cleaned-images")');
  has(cleanRoute, "downloadUrl");
  has(cleanRoute, "incrementUsage");
});

test("download and zip API routes are present and protect private file delivery", () => {
  const downloadRoute = read("app/api/images/download/[id]/route.ts");
  const zipRoute = read("app/api/images/zip/route.ts");
  has(downloadRoute, "Content-Disposition");
  has(downloadRoute, "attachment");
  has(downloadRoute, "expires_at");
  has(downloadRoute, '.from("cleaned-images")');
  has(zipRoute, "application/zip");
  has(zipRoute, "FileGhost-cleaned-images.zip");
  has(zipRoute, '.from("cleaned-images")');
  hasAny(zipRoute, ["JSZip", "archiver"], "ZIP route should use a ZIP generation library");
});

test("account actions cover billing portal and sign out", () => {
  const account = read("app/account/page.tsx");
  const actions = read("components/account-actions.tsx");
  has(account, "Upgrade Plan");
  has(account, "BillingPortalButton");
  has(account, "SignOutButton");
  has(actions, "/api/stripe/portal");
  has(actions, "/api/auth/signout");
  has(actions, "Open billing portal");
  has(actions, "Sign out");
});

test("Stripe checkout, portal, and webhook routes contain the required payment hooks", () => {
  const checkout = read("app/api/stripe/checkout/route.ts");
  const portal = read("app/api/stripe/portal/route.ts");
  const webhook = read("app/api/stripe/webhook/route.ts");
  has(checkout, "checkout.sessions.create");
  has(checkout, 'mode: plan === "monthly" ? "subscription" : "payment"');
  has(checkout, "success_url");
  has(checkout, "cancel_url");
  has(portal, "billingPortal.sessions.create");
  has(webhook, "STRIPE_WEBHOOK_SECRET");
  has(webhook, "checkout.session.completed");
  has(webhook, "customer.subscription.updated");
  has(webhook, "customer.subscription.deleted");
  has(webhook, "invoice.payment_failed");
});

test("SEO crawl files expose only public pages", () => {
  const robots = read("app/robots.ts");
  const sitemap = read("app/sitemap.ts");
  has(robots, '"/app"');
  has(robots, '"/account"');
  has(robots, '"/login"');
  has(robots, '"/signup"');
  has(robots, '"/api/"');
  has(robots, 'sitemap: "https://fileghost.app/sitemap.xml"');
  has(sitemap, "https://fileghost.app");
  has(sitemap, "https://fileghost.app/pricing");
  has(sitemap, "https://fileghost.app/blog");
  has(sitemap, "https://fileghost.app/blog/remove-metadata-before-tiktok");
  has(sitemap, "https://fileghost.app/blog/what-is-c2pa-metadata");
  has(sitemap, "https://fileghost.app/privacy");
  assert.doesNotMatch(sitemap, /\/app|\/account|\/login|\/signup|\/api/, "Private routes must not be listed in sitemap");
});

let passed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    break;
  }
}

if (!process.exitCode) {
  console.log(`\n${passed}/${tests.length} smoke tests passed.`);
}

export const FREE_IMAGE_LIMIT = 5;

export type Plan = "free" | "monthly" | "three_month_pass" | "lifetime";

export type ProfileAccess = {
  id: string;
  email?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan: Plan | string;
  subscription_status?: string | null;
  free_images_used: number;
  access_expires_at?: string | null;
  current_period_end?: string | null;
};

export function hasPaidAccess(profile: ProfileAccess | null | undefined) {
  if (!profile) return false;
  if (profile.plan === "lifetime") return true;

  if (
    profile.plan === "monthly" &&
    ["active", "trialing"].includes(profile.subscription_status || "")
  ) {
    return true;
  }

  if (
    profile.plan === "three_month_pass" &&
    profile.access_expires_at &&
    new Date(profile.access_expires_at) > new Date()
  ) {
    return true;
  }

  return false;
}

export function getPlanAccess(profile: ProfileAccess | null | undefined) {
  if (hasPaidAccess(profile)) {
    return {
      plan: profile!.plan,
      paid: true,
      freeUsed: profile!.free_images_used || 0,
      freeLimit: FREE_IMAGE_LIMIT,
      remaining: null as number | null
    };
  }

  const freeUsed = profile?.free_images_used || 0;
  return {
    plan: "free",
    paid: false,
    freeUsed,
    freeLimit: FREE_IMAGE_LIMIT,
    remaining: Math.max(FREE_IMAGE_LIMIT - freeUsed, 0)
  };
}

export function canProcessImages(profile: ProfileAccess | null | undefined, imageCount: number) {
  if (hasPaidAccess(profile)) return true;
  return (profile?.free_images_used || 0) + imageCount <= FREE_IMAGE_LIMIT;
}

export function freeCreditsRemaining(freeImagesUsed: number) {
  return Math.max(FREE_IMAGE_LIMIT - freeImagesUsed, 0);
}

export function planLabel(plan: string | null | undefined) {
  if (plan === "monthly") return "Monthly";
  if (plan === "three_month_pass") return "3-Month Pass";
  if (plan === "lifetime") return "Lifetime";
  return "Free";
}

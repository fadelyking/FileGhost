import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/env";
import type { ProfileAccess } from "@/lib/plans";

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<ProfileAccess | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id,email,stripe_customer_id,stripe_subscription_id,plan,subscription_status,free_images_used,access_expires_at,current_period_end"
    )
    .eq("id", userId)
    .single();

  return data as ProfileAccess | null;
}

export async function incrementUsage(userId: string, imageCount: number) {
  const supabase = createAdminClient();
  const profile = await getProfile(userId);
  await supabase
    .from("profiles")
    .update({
      free_images_used: (profile?.free_images_used || 0) + imageCount,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: "images_cleaned",
    image_count: imageCount
  });
}

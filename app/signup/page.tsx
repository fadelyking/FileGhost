import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a FileGhost account.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");

  redirect("/login");
}

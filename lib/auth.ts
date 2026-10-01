import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Role, UserSession } from "@/types";

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (dbUser) {
      return {
        id: dbUser.id,
        supabaseId: dbUser.supabaseId,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as Role,
      };
    }

    return {
      id: user.id,
      supabaseId: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin",
      role: (user.user_metadata?.role as Role) ?? "ADMIN",
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?unauthorized=true");
  }
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/dashboard?forbidden=true");
  }
  return user;
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

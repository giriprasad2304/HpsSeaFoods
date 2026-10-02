import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/validations";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Standard credential validation
    let authenticatedRole = null;
    let userName = null;

    if (
      normalizedEmail === "hpsfooods@gmail.com" &&
      password === "Prasanth@0046"
    ) {
      authenticatedRole = "ADMIN";
      userName = "HPS Admin";
    }

    // Optional check in database if exists
    let dbUser = null;
    if (!authenticatedRole) {
      try {
        dbUser = await prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: "insensitive" } },
        });
        if (dbUser && password === "Prasanth@0046") {
          authenticatedRole = dbUser.role || "ADMIN";
          userName = dbUser.name || "HPS Admin";
        }
      } catch {
        // Fallback
      }
    }

    if (!authenticatedRole) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    const user = {
      id: dbUser?.id || "admin-001",
      email: normalizedEmail,
      name: userName || "HPS Admin",
      role: authenticatedRole,
    };

    const cookieStore = await cookies();
    
    // Set authentication cookies for 7 days
    cookieStore.set("auth_session", JSON.stringify(user), {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    cookieStore.set("demo_session", "true", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user,
      message: "Authentication successful",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

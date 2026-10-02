import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session")?.value;
  const demoSession = cookieStore.get("demo_session")?.value;

  if (sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie);
      return NextResponse.json({ authenticated: true, user });
    } catch {
      // Fallback
    }
  }

  if (demoSession === "true") {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: "admin-001",
        email: "hpsfooods@gmail.com",
        name: "HPS Admin",
        role: "ADMIN",
      },
    });
  }

  return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
}

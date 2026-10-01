import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  cookieStore.delete("auth_session");
  cookieStore.delete("demo_session");
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}

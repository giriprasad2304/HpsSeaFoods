import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const isLiveSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  let supabaseUser = null;
  if (isLiveSupabase) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      const { data } = await supabase.auth.getUser();
      supabaseUser = data.user;
    } catch {
      // Ignore Supabase error in fallback mode
    }
  }

  const pathname = request.nextUrl.pathname;
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/packing") ||
    pathname.startsWith("/profit-loss") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  const hasSession =
    request.cookies.get("demo_session")?.value === "true" ||
    !!request.cookies.get("auth_session")?.value ||
    !!supabaseUser;

  // Unauthenticated user attempting to access protected routes -> redirect to /login
  if (!hasSession && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

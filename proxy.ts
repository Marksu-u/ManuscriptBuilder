import { cookieOptions } from "@/lib/supabase/cookie-options";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LEGAL_LINKS } from "@/lib/legal";

export async function proxy(request: NextRequest) {
  // Legal documents and social cards stay public without an auth round trip.
  if (request.nextUrl.pathname === '/opengraph-image' || LEGAL_LINKS.some(({ href }) => request.nextUrl.pathname === href)) {
    return NextResponse.next();
  }
  const response = NextResponse.next({ request });
  const redirectWithCookies = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  };
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user && request.nextUrl.pathname === "/login" && !request.nextUrl.searchParams.has("error")) {
    return redirectWithCookies(new URL("/dashboard", request.url));
  }
  if (!user && (request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/dashboard"))) {
    return redirectWithCookies(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

import { cookieOptions } from "@/lib/supabase/cookie-options";
import { createServerClient } from "@supabase/ssr";
import { hasLocale } from "next-intl";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, type Locale } from "./i18n/routing";

const handleI18n = createIntlMiddleware(routing);

function splitLocale(pathname: string): { locale: Locale; rest: string } {
  const segment = pathname.split("/")[1];
  if (hasLocale(routing.locales, segment)) return { locale: segment, rest: pathname.slice(segment.length + 1) || "/" };
  return { locale: routing.defaultLocale, rest: pathname };
}

function localizedPath(locale: Locale, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export async function proxy(request: NextRequest) {
  const response = handleI18n(request);
  if (response.headers.has("location")) return response;

  const redirectWithCookies = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
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
  const { locale, rest } = splitLocale(request.nextUrl.pathname);

  if (!user && (rest.startsWith("/account") || rest.startsWith("/dashboard"))) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(locale, "/login");
    return redirectWithCookies(url);
  }

  if (user && rest === "/login" && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(locale, "/dashboard");
    return redirectWithCookies(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|sitemap.xml|robots.txt|opengraph-image|icon|apple-icon|favicon.ico|.*\\..*).*)"],
};

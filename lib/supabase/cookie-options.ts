/** Set the same parent domain on every trusted production subdomain.
 * Leave unset for localhost and preview deployments. */
export const cookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  ...(process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN
    ? { name: "boh-shared-auth", domain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN, secure: true }
    : {}),
};

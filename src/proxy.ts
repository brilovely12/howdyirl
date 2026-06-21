import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Next.js 16 Proxy (formerly middleware). Refreshes the Supabase session on
 * each request and writes the rotated auth cookies onto the response so Server
 * Components see a valid session.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Only refresh the session on real page navigations. Skipping HEAD (health
  // checks) and non-GET (server actions read cookies directly) avoids hammering
  // the token-refresh endpoint, which can rotate refresh tokens out from under
  // an otherwise-valid session.
  if (request.method !== "GET") return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the user to trigger a refresh if the access token is stale.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

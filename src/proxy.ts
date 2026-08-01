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

  // Crawlers were walking the combinatorial ?tag=/?q=/?page= URL space
  // millions of times a day (GPTBot, meta-externalagent, Amazonbot, …).
  // robots.txt disallows /*? for compliant bots; this is the cheap backstop —
  // reject parameterized list URLs from any known crawler before doing any
  // work, so no page function runs and no DB queries fire. Clean URLs stay
  // fully crawlable.
  if (request.nextUrl.search) {
    const ua = request.headers.get("user-agent") ?? "";
    if (/bot|crawl|spider|slurp|externalagent|externalhit/i.test(ua)) {
      return new NextResponse("Parameterized URLs are not crawlable. See /robots.txt.", { status: 403 });
    }
  }

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

import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { provisionMember } from "@/lib/auth";

/** OAuth / email-confirmation redirect target: exchange the code, provision, go. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/groups";

  if (code) {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // OAuth users have no handle yet — provisionMember returns null, so send
      // them to onboarding to choose one before continuing.
      const member = await provisionMember();
      return NextResponse.redirect(`${origin}${member ? next : "/onboarding"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

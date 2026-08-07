import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next =
    requestedNext === "/reset-password"
      ? "/reset-password"
      : "/settings?welcome=1";
  const error = url.searchParams.get("error_description");
  if (error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, url.origin),
    );
  if (!code)
    return NextResponse.redirect(
      new URL(
        "/login?error=The confirmation link is missing or invalid.",
        url.origin,
      ),
    );
  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError)
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(exchangeError.message)}`,
        url.origin,
      ),
    );
  return NextResponse.redirect(new URL(next, url.origin));
}

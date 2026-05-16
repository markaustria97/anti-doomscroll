import { NextResponse } from "next/server";
import { APP_STATE_USER_COOKIE } from "@/lib/app-state";

const OAUTH_TOKEN_COOKIE = "copilot_github_token";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(OAUTH_TOKEN_COOKIE);
  response.cookies.delete(APP_STATE_USER_COOKIE);
  return response;
}

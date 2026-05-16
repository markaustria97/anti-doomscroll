import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import {
  APP_STATE_SESSION_COOKIE,
  APP_STATE_SESSION_MAX_AGE,
} from "./app-state";

export function resolveAppStateSession(request: NextRequest): {
  sessionId: string;
  shouldSetCookie: boolean;
} {
  const existingSessionId =
    request.cookies.get(APP_STATE_SESSION_COOKIE)?.value?.trim() || "";

  if (existingSessionId) {
    return {
      sessionId: existingSessionId,
      shouldSetCookie: false,
    };
  }

  return {
    sessionId: randomUUID(),
    shouldSetCookie: true,
  };
}

export function applyAppStateSessionCookie(
  response: NextResponse,
  sessionId: string
): NextResponse {
  response.cookies.set(APP_STATE_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: APP_STATE_SESSION_MAX_AGE,
  });

  return response;
}

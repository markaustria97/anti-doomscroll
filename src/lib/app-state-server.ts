import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import {
  APP_STATE_SESSION_COOKIE,
  APP_STATE_SESSION_MAX_AGE,
  APP_STATE_USER_COOKIE,
} from "./app-state";
import { OAUTH_TOKEN_COOKIE } from "./copilot";

const GITHUB_USER_ENDPOINT = "https://api.github.com/user";

type ResolvedAppStateScope = {
  scopeId: string;
  sessionId: string | null;
  userScopeId: string | null;
  shouldSetSessionCookie: boolean;
  shouldSetUserCookie: boolean;
};

async function fetchGithubUserScope(
  githubToken: string
): Promise<string | null> {
  try {
    const response = await fetch(GITHUB_USER_ENDPOINT, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      id?: number;
    };

    return typeof payload.id === "number" ? `github:${payload.id}` : null;
  } catch {
    return null;
  }
}

export async function resolveAppStateScope(
  request: NextRequest
): Promise<ResolvedAppStateScope> {
  const existingSessionId =
    request.cookies.get(APP_STATE_SESSION_COOKIE)?.value?.trim() || "";
  const existingUserScopeId =
    request.cookies.get(APP_STATE_USER_COOKIE)?.value?.trim() || "";

  if (existingUserScopeId) {
    return {
      scopeId: existingUserScopeId,
      sessionId: existingSessionId || null,
      userScopeId: existingUserScopeId,
      shouldSetSessionCookie: false,
      shouldSetUserCookie: false,
    };
  }

  const githubToken = request.cookies.get(OAUTH_TOKEN_COOKIE)?.value?.trim();
  const resolvedUserScopeId = githubToken
    ? await fetchGithubUserScope(githubToken)
    : null;

  if (resolvedUserScopeId) {
    return {
      scopeId: resolvedUserScopeId,
      sessionId: existingSessionId || null,
      userScopeId: resolvedUserScopeId,
      shouldSetSessionCookie: false,
      shouldSetUserCookie: true,
    };
  }

  if (existingSessionId) {
    return {
      scopeId: existingSessionId,
      sessionId: existingSessionId,
      userScopeId: null,
      shouldSetSessionCookie: false,
      shouldSetUserCookie: false,
    };
  }

  return {
    scopeId: randomUUID(),
    sessionId: null,
    userScopeId: null,
    shouldSetSessionCookie: true,
    shouldSetUserCookie: false,
  };
}

export function applyAppStateScopeCookies(
  response: NextResponse,
  resolvedScope: ResolvedAppStateScope
): NextResponse {
  if (resolvedScope.shouldSetSessionCookie) {
    response.cookies.set(APP_STATE_SESSION_COOKIE, resolvedScope.scopeId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: APP_STATE_SESSION_MAX_AGE,
    });
  }

  if (resolvedScope.shouldSetUserCookie && resolvedScope.userScopeId) {
    response.cookies.set(APP_STATE_USER_COOKIE, resolvedScope.userScopeId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: APP_STATE_SESSION_MAX_AGE,
    });
  }

  return response;
}

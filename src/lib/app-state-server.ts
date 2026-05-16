import type { NextRequest, NextResponse } from "next/server";
import {
  APP_STATE_GLOBAL_SCOPE,
  APP_STATE_SESSION_COOKIE,
  APP_STATE_USER_COOKIE,
} from "./app-state";

type ResolvedAppStateScope = {
  scopeId: string;
  legacyScopeIds: string[];
};

export function resolveAppStateScope(
  request: NextRequest
): ResolvedAppStateScope {
  return {
    scopeId: APP_STATE_GLOBAL_SCOPE,
    legacyScopeIds: Array.from(
      new Set([
        request.cookies.get(APP_STATE_USER_COOKIE)?.value?.trim() || "",
        request.cookies.get(APP_STATE_SESSION_COOKIE)?.value?.trim() || "",
      ])
    ).filter(
      (value): value is string =>
        Boolean(value) && value !== APP_STATE_GLOBAL_SCOPE
    ),
  };
}

export function applyAppStateScopeCookies(
  response: NextResponse,
  _resolvedScope: ResolvedAppStateScope
): NextResponse {
  return response;
}

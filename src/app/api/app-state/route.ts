import { normalizeAppStateKeys, type AppStateEntry } from "@/lib/app-state";
import {
  applyAppStateScopeCookies,
  resolveAppStateScope,
} from "@/lib/app-state-server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_KEYS_PER_REQUEST = 20;

function toPrismaJsonValue(
  value: unknown
): Prisma.AppStateCreateInput["value"] {
  const normalizedValue = JSON.parse(
    JSON.stringify(value ?? null)
  ) as Prisma.JsonValue;

  if (normalizedValue === null) {
    return Prisma.JsonNull;
  }

  return normalizedValue as Prisma.InputJsonValue;
}

function normalizeEntries(entries: unknown): AppStateEntry[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Partial<AppStateEntry>;
      return typeof candidate.key === "string"
        ? {
            key: candidate.key.trim(),
            value: candidate.value,
          }
        : null;
    })
    .filter((entry): entry is AppStateEntry => Boolean(entry))
    .filter((entry) => normalizeAppStateKeys([entry.key]).length > 0)
    .slice(0, MAX_KEYS_PER_REQUEST);
}

function respondWithSession(
  resolvedScope: ReturnType<typeof resolveAppStateScope>,
  response: NextResponse
): NextResponse {
  return applyAppStateScopeCookies(response, resolvedScope);
}

async function promoteLegacyEntries({
  scopeId,
  legacyScopeIds,
  keys,
}: {
  scopeId: string;
  legacyScopeIds: string[];
  keys: string[];
}) {
  if (legacyScopeIds.length === 0 || keys.length === 0) {
    return;
  }

  const [globalRows, legacyRows] = await Promise.all([
    prisma.appState.findMany({
      where: {
        sessionId: scopeId,
        key: {
          in: keys,
        },
      },
    }),
    prisma.appState.findMany({
      where: {
        sessionId: {
          in: legacyScopeIds,
        },
        key: {
          in: keys,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  if (legacyRows.length === 0) {
    return;
  }

  const latestLegacyRowsByKey = new Map<string, (typeof legacyRows)[number]>();
  for (const row of legacyRows) {
    if (!latestLegacyRowsByKey.has(row.key)) {
      latestLegacyRowsByKey.set(row.key, row);
    }
  }

  const globalUpdatedAtByKey = new Map(
    globalRows.map((row) => [row.key, row.updatedAt.getTime()])
  );
  const rowsToPromote = Array.from(latestLegacyRowsByKey.values()).filter(
    (row) => {
      const globalUpdatedAt = globalUpdatedAtByKey.get(row.key);
      return (
        globalUpdatedAt === undefined ||
        row.updatedAt.getTime() > globalUpdatedAt
      );
    }
  );

  await prisma.$transaction([
    ...rowsToPromote.map((row) =>
      prisma.appState.upsert({
        where: {
          sessionId_key: {
            sessionId: scopeId,
            key: row.key,
          },
        },
        create: {
          sessionId: scopeId,
          key: row.key,
          value: toPrismaJsonValue(row.value),
        },
        update: {
          value: toPrismaJsonValue(row.value),
        },
      })
    ),
    prisma.appState.deleteMany({
      where: {
        sessionId: {
          in: legacyScopeIds,
        },
        key: {
          in: keys,
        },
      },
    }),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const keys = normalizeAppStateKeys(
      request.nextUrl.searchParams.getAll("key")
    ).slice(0, MAX_KEYS_PER_REQUEST);
    const resolvedScope = resolveAppStateScope(request);

    if (keys.length === 0) {
      return respondWithSession(
        resolvedScope,
        NextResponse.json({ values: {} })
      );
    }

    await promoteLegacyEntries({
      scopeId: resolvedScope.scopeId,
      legacyScopeIds: resolvedScope.legacyScopeIds,
      keys,
    });

    const rows = await prisma.appState.findMany({
      where: {
        sessionId: resolvedScope.scopeId,
        key: {
          in: keys,
        },
      },
    });

    return respondWithSession(
      resolvedScope,
      NextResponse.json({
        values: Object.fromEntries(rows.map((row) => [row.key, row.value])),
      })
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load app state.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const resolvedScope = resolveAppStateScope(request);
    const body = (await request.json()) as { entries?: unknown };
    const entries = normalizeEntries(body.entries);
    const keys = entries.map((entry) => entry.key);

    if (entries.length === 0) {
      return respondWithSession(
        resolvedScope,
        NextResponse.json(
          { error: "No valid app state entries were provided." },
          { status: 400 }
        )
      );
    }

    await promoteLegacyEntries({
      scopeId: resolvedScope.scopeId,
      legacyScopeIds: resolvedScope.legacyScopeIds,
      keys,
    });

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.appState.upsert({
          where: {
            sessionId_key: {
              sessionId: resolvedScope.scopeId,
              key: entry.key,
            },
          },
          create: {
            sessionId: resolvedScope.scopeId,
            key: entry.key,
            value: toPrismaJsonValue(entry.value),
          },
          update: {
            value: toPrismaJsonValue(entry.value),
          },
        })
      )
    );

    return respondWithSession(
      resolvedScope,
      NextResponse.json({ success: true })
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save app state.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const resolvedScope = resolveAppStateScope(request);
    const body = (await request.json()) as { keys?: unknown };
    const keys = normalizeAppStateKeys(
      Array.isArray(body.keys)
        ? body.keys.filter((key): key is string => typeof key === "string")
        : []
    ).slice(0, MAX_KEYS_PER_REQUEST);

    if (keys.length === 0) {
      return respondWithSession(
        resolvedScope,
        NextResponse.json(
          { error: "No valid app state keys were provided." },
          { status: 400 }
        )
      );
    }

    await promoteLegacyEntries({
      scopeId: resolvedScope.scopeId,
      legacyScopeIds: resolvedScope.legacyScopeIds,
      keys,
    });

    await prisma.appState.deleteMany({
      where: {
        sessionId: {
          in: [resolvedScope.scopeId, ...resolvedScope.legacyScopeIds],
        },
        key: {
          in: keys,
        },
      },
    });

    return respondWithSession(
      resolvedScope,
      NextResponse.json({ success: true })
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete app state.",
      },
      { status: 500 }
    );
  }
}

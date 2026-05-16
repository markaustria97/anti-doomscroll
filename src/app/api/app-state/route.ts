import { Prisma } from "@prisma/client";
import { normalizeAppStateKeys, type AppStateEntry } from "@/lib/app-state";
import {
  applyAppStateScopeCookies,
  resolveAppStateScope,
} from "@/lib/app-state-server";
import { prisma } from "@/lib/prisma";
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
  resolvedScope: Awaited<ReturnType<typeof resolveAppStateScope>>,
  response: NextResponse
): NextResponse {
  return applyAppStateScopeCookies(response, resolvedScope);
}

async function promoteSessionEntries({
  scopeId,
  sessionId,
  keys,
}: {
  scopeId: string;
  sessionId: string | null;
  keys: string[];
}) {
  if (!sessionId || sessionId === scopeId || keys.length === 0) {
    return;
  }

  const sessionRows = await prisma.appState.findMany({
    where: {
      sessionId,
      key: {
        in: keys,
      },
    },
  });

  if (sessionRows.length === 0) {
    return;
  }

  await prisma.$transaction([
    ...sessionRows.map((row) =>
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
        sessionId,
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
    const resolvedScope = await resolveAppStateScope(request);

    if (keys.length === 0) {
      return respondWithSession(
        resolvedScope,
        NextResponse.json({ values: {} })
      );
    }

    await promoteSessionEntries({
      scopeId: resolvedScope.scopeId,
      sessionId: resolvedScope.sessionId,
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
    const resolvedScope = await resolveAppStateScope(request);
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

    await promoteSessionEntries({
      scopeId: resolvedScope.scopeId,
      sessionId: resolvedScope.sessionId,
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
    const resolvedScope = await resolveAppStateScope(request);
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

    await promoteSessionEntries({
      scopeId: resolvedScope.scopeId,
      sessionId: resolvedScope.sessionId,
      keys,
    });

    await prisma.appState.deleteMany({
      where: {
        sessionId: {
          in:
            resolvedScope.sessionId &&
            resolvedScope.sessionId !== resolvedScope.scopeId
              ? [resolvedScope.scopeId, resolvedScope.sessionId]
              : [resolvedScope.scopeId],
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

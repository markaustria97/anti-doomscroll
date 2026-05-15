import { transform } from "esbuild";
import { NextRequest, NextResponse } from "next/server";
import { isValidChallengeLanguage, type ChallengeLanguage } from "@/lib/challenge-lab";

export const runtime = "nodejs";

const MAX_SOURCE_LENGTH = 24000;
const ALLOWED_IMPORTS = new Set(["react"]);

interface PreviewRequestBody {
  source?: string;
  language?: ChallengeLanguage;
}

function getImportSpecifiers(source: string): string[] {
  return Array.from(
    source.matchAll(/(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g),
    (match) => match[1]
  );
}

function toLoader(language: ChallengeLanguage): "js" | "jsx" | "ts" | "tsx" {
  return language;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PreviewRequestBody;
    const source = (body.source || "").trim();
    const language = body.language;

    if (!isValidChallengeLanguage(language)) {
      return NextResponse.json(
        { error: "Unsupported preview language." },
        { status: 400 }
      );
    }

    if (!source) {
      return NextResponse.json(
        { error: "Preview source is required." },
        { status: 400 }
      );
    }

    if (source.length > MAX_SOURCE_LENGTH) {
      return NextResponse.json(
        { error: "Preview source is too large." },
        { status: 400 }
      );
    }

    if (!/export\s+default\s+/m.test(source)) {
      return NextResponse.json(
        { error: "Preview code must export default a React component." },
        { status: 400 }
      );
    }

    const invalidImport = getImportSpecifiers(source).find(
      (specifier) => !ALLOWED_IMPORTS.has(specifier)
    );
    if (invalidImport) {
      return NextResponse.json(
        {
          error:
            `Unsupported import "${invalidImport}" in preview code. Use a single-file component with no external imports.`,
        },
        { status: 400 }
      );
    }

    const result = await transform(source, {
      loader: toLoader(language),
      format: "esm",
      jsx: "automatic",
      jsxImportSource: "react",
      sourcefile: `challenge-preview.${language}`,
      target: "es2020",
    });

    return NextResponse.json({
      code: result.code,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Preview compilation failed.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}
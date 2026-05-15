import { CopilotClient } from "@github/copilot-sdk";
import type { PermissionRequestResult } from "@github/copilot-sdk";
import { existsSync } from "node:fs";
import path from "node:path";

export const OAUTH_TOKEN_COOKIE = "copilot_github_token";
export const DEFAULT_COPILOT_MODEL =
  process.env.COPILOT_CHALLENGE_MODEL?.trim() || "gpt-5-mini";

export const denyAllPermissions = (): PermissionRequestResult => ({
  kind: "denied-by-rules",
  rules: [],
});

export function resolveCopilotCliPath(): string {
  const configuredPath = process.env.COPILOT_CLI_PATH?.trim();
  if (configuredPath) {
    return configuredPath;
  }

  const platform = process.platform;
  const arch = process.arch;
  const basePath = path.join(process.cwd(), "node_modules", "@github");

  const platformBinaryMap: Record<string, string> = {
    "linux:x64": path.join(basePath, "copilot-linux-x64", "copilot"),
    "linux:arm64": path.join(basePath, "copilot-linux-arm64", "copilot"),
    "win32:x64": path.join(basePath, "copilot-win32-x64", "copilot.exe"),
    "win32:arm64": path.join(
      basePath,
      "copilot-win32-arm64",
      "copilot.exe"
    ),
    "darwin:x64": path.join(basePath, "copilot-darwin-x64", "copilot"),
    "darwin:arm64": path.join(basePath, "copilot-darwin-arm64", "copilot"),
  };

  const resolvedBinary = platformBinaryMap[`${platform}:${arch}`];
  if (resolvedBinary && existsSync(resolvedBinary)) {
    return resolvedBinary;
  }

  const npmLoaderPath = path.join(
    process.cwd(),
    "node_modules",
    "@github",
    "copilot",
    "npm-loader.js"
  );
  if (existsSync(npmLoaderPath)) {
    return npmLoaderPath;
  }

  return "copilot";
}

export function createCopilotClient(githubToken: string): CopilotClient {
  return new CopilotClient({
    cliPath: resolveCopilotCliPath(),
    githubToken,
    useLoggedInUser: false,
    env: {
      ...process.env,
      COPILOT_GITHUB_TOKEN: githubToken,
      HOME: process.env.HOME ?? process.env.USERPROFILE ?? process.cwd(),
    },
  });
}

export async function runCopilotPrompt({
  githubToken,
  model = DEFAULT_COPILOT_MODEL,
  prompt,
  systemMessage,
  timeoutMs = 45000,
}: {
  githubToken: string;
  model?: string;
  prompt: string;
  systemMessage: string;
  timeoutMs?: number;
}): Promise<string> {
  const client = createCopilotClient(githubToken);
  let session: Awaited<ReturnType<CopilotClient["createSession"]>> | null = null;
  let finalMessage = "";
  let streamedMessage = "";

  try {
    session = await client.createSession({
      model,
      infiniteSessions: { enabled: false },
      streaming: true,
      onPermissionRequest: denyAllPermissions,
      systemMessage: {
        content: systemMessage,
      },
    });

    session.on("assistant.message_delta", (event) => {
      streamedMessage += event.data.deltaContent;
    });

    session.on("assistant.message", (event) => {
      finalMessage = event.data.content.trim();
    });

    session.on("session.error", (error) => {
      console.error("[Copilot] Session error event:", error);
    });

    await session.sendAndWait({ prompt }, timeoutMs);

    const response = (finalMessage || streamedMessage).trim();
    if (!response) {
      throw new Error("Copilot returned an empty response.");
    }

    return response;
  } finally {
    if (session) {
      await session.disconnect().catch((error) => {
        console.warn("[Copilot] Error disconnecting session:", error);
      });
    }

    await client.stop().catch((error) => {
      console.warn("[Copilot] Error stopping client:", error);
    });
  }
}
"use client";

import type { ChallengeLanguage } from "@/lib/challenge-lab";
import { useDeferredValue, useEffect, useState } from "react";

type ChallengePreviewProps = Readonly<{
  title: string;
  subtitle: string;
  source: string;
  language: ChallengeLanguage;
  emptyMessage: string;
}>;

function buildPreviewDocument({
  title,
  compiledCode,
}: {
  title: string;
  compiledCode: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@19?dev",
          "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime?dev",
          "react-dom/client": "https://esm.sh/react-dom@19/client?dev"
        }
      }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      *, *::before, *::after {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        min-height: 100%;
        background: #040712;
        color: #e5eefb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color-scheme: dark;
      }

      #root {
        min-height: 100vh;
      }

      button,
      input,
      textarea,
      select {
        font: inherit;
      }

      input,
      textarea,
      select {
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(148, 163, 184, 0.28);
        color: #e5eefb;
        caret-color: #e5eefb;
      }

      button {
        background: rgba(15, 23, 42, 0.88);
        color: #e5eefb;
      }

      ::placeholder {
        color: #8aa0bd;
        opacity: 1;
      }

      .preview-error {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 24px;
        box-sizing: border-box;
      }

      .preview-error__card {
        width: min(100%, 760px);
        border: 1px solid rgba(248, 113, 113, 0.24);
        border-radius: 20px;
        background: rgba(24, 24, 27, 0.96);
        padding: 20px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
      }

      .preview-error__label {
        color: #fca5a5;
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .preview-error__message {
        margin-top: 12px;
        white-space: pre-wrap;
        line-height: 1.6;
        color: #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      const showError = (message) => {
        const root = document.getElementById("root");
        if (!root) {
          return;
        }

        root.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "preview-error";

        const card = document.createElement("div");
        card.className = "preview-error__card";

        const label = document.createElement("div");
        label.className = "preview-error__label";
        label.textContent = "Preview runtime error";

        const content = document.createElement("pre");
        content.className = "preview-error__message";
        content.textContent = message;

        card.append(label, content);
        wrapper.append(card);
        root.append(wrapper);
      };

      const code = ${JSON.stringify(compiledCode)};
      const moduleUrl = URL.createObjectURL(
        new Blob([code], { type: "text/javascript" })
      );

      try {
        const [{ default: PreviewComponent }, ReactModule, ReactDomModule] =
          await Promise.all([
            import(moduleUrl),
            import("react"),
            import("react-dom/client"),
          ]);

        const React = ReactModule.default ?? ReactModule;
        const { createRoot } = ReactDomModule;
        const rootElement = document.getElementById("root");

        if (!rootElement) {
          throw new Error("Preview root could not be created.");
        }

        if (typeof PreviewComponent !== "function") {
          throw new Error(
            "Preview code must export default a React component."
          );
        }

        createRoot(rootElement).render(React.createElement(PreviewComponent));
      } catch (error) {
        showError(error instanceof Error ? error.message : String(error));
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
    </script>
  </body>
</html>`;
}

export function ChallengePreview({
  title,
  subtitle,
  source,
  language,
  emptyMessage,
}: ChallengePreviewProps) {
  const deferredSource = useDeferredValue(source);
  const [compiledCode, setCompiledCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [frameVersion, setFrameVersion] = useState(0);

  useEffect(() => {
    if (!deferredSource.trim()) {
      setCompiledCode(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const response = await fetch("/api/challenges/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: deferredSource,
            language,
          }),
          signal: controller.signal,
        });

        const payload = (await response
          .json()
          .catch(() => ({ error: undefined }))) as {
          code?: string;
          error?: string;
        };

        if (!response.ok || typeof payload.code !== "string") {
          throw new Error(payload.error || "Preview compilation failed.");
        }

        setCompiledCode(payload.code);
        setFrameVersion((currentVersion) => currentVersion + 1);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setCompiledCode(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Preview compilation failed."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [deferredSource, language]);

  const statusMessage =
    error || (isLoading ? "Compiling preview..." : emptyMessage);

  return (
    <section className="rounded-2xl border border-(--border) bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-(--text-muted)">
            {subtitle}
          </p>
        </div>
        {compiledCode ? (
          <button
            type="button"
            onClick={() =>
              setFrameVersion((currentVersion) => currentVersion + 1)
            }
            className="rounded-lg border border-(--border) px-3 py-2 text-xs font-medium text-(--text-muted) transition-colors hover:border-(--accent-dim) hover:text-white"
          >
            Reset frame
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-(--border) bg-[#040712]">
        {compiledCode ? (
          <iframe
            key={`${title}-${frameVersion}`}
            title={title}
            sandbox="allow-scripts"
            srcDoc={buildPreviewDocument({ title, compiledCode })}
            className="h-[30rem] w-full border-0 bg-[#040712] lg:h-[34rem]"
          />
        ) : (
          <div className="flex h-[30rem] items-center justify-center px-6 text-center lg:h-[34rem]">
            <p
              className={`max-w-md text-sm leading-7 ${
                error ? "text-red-200" : "text-(--text-muted)"
              }`}
            >
              {statusMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

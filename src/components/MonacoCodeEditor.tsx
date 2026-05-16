"use client";

import type { ChallengeLanguage } from "@/lib/challenge-lab";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[32rem] place-items-center rounded-2xl border border-(--border) bg-black/30 text-sm text-(--text-muted)">
      Loading editor...
    </div>
  ),
});

type MonacoCodeEditorProps = Readonly<{
  language: ChallengeLanguage;
  value: string;
  onChange: (value: string) => void;
}>;

function getEditorModel(language: ChallengeLanguage): {
  language: "javascript" | "typescript";
  path: string;
} {
  if (language === "jsx") {
    return {
      language: "javascript",
      path: "challenge.jsx",
    };
  }

  if (language === "js") {
    return {
      language: "javascript",
      path: "challenge.js",
    };
  }

  if (language === "tsx") {
    return {
      language: "typescript",
      path: "challenge.tsx",
    };
  }

  return {
    language: "typescript",
    path: "challenge.ts",
  };
}

export function MonacoCodeEditor({
  language,
  value,
  onChange,
}: MonacoCodeEditorProps) {
  const model = getEditorModel(language);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-(--border) bg-[#111317]">
      <Editor
        height="32rem"
        language={model.language}
        path={model.path}
        theme="vs-dark"
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          automaticLayout: true,
          fontSize: 14,
          formatOnPaste: true,
          insertSpaces: true,
          lineHeight: 24,
          minimap: {
            enabled: false,
          },
          padding: {
            top: 16,
            bottom: 16,
          },
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
# 3 — Key `tsconfig` Flags: `paths`, `baseUrl`, `esModuleInterop`, `verbatimModuleSyntax`

## T — TL;DR

`paths` + `baseUrl` enable absolute import aliases; `esModuleInterop` fixes CJS default import syntax; `verbatimModuleSyntax` enforces `import type` — preventing type-only imports from emitting real `import` statements.[^6][^3]

## K — Key Concepts

```json
// tsconfig.json paths + baseUrl
{
  "compilerOptions": {
    "baseUrl": ".",        // root for path resolution
    "paths": {
      "@/*": ["./src/*"],         // @/utils → src/utils
      "@components/*": ["./src/components/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

```ts
// Without paths — relative hell
import { Button } from "../../../../components/ui/Button"

// With paths alias — clean
import { Button } from "@/components/ui/Button"
import type { User } from "@types/User"  // ← note `import type`

// ── esModuleInterop ──────────────────────────────────────
// Without esModuleInterop: true:
import * as fs from "fs"          // only safe way for CJS modules

// With esModuleInterop: true:
import fs from "fs"               // clean default import — works!
import express from "express"     // ✅ no more `import * as express`

// ── verbatimModuleSyntax ─────────────────────────────────
// This flag ensures type-only imports use `import type`
// Prevents bundlers from emitting empty `import` statements

// ❌ Without verbatimModuleSyntax:
import { User } from "./types"    // may emit as real import (no value!)

// ✅ With verbatimModuleSyntax: true:
import type { User } from "./types"   // erased at compile time — correct
import { createUser } from "./user"   // kept — it's a value import

// Mixing value and type imports
import { createUser, type User } from "./user"  // ✅ inline `type` modifier

// ── isolatedModules detail ──────────────────────────────
// Each file must be a module (have at least one import/export)
// Re-exporting types MUST use `export type`
export type { User }   // ✅ with isolatedModules
export { User }        // ❌ esbuild can't tell if User is a type or value
```


## W — Why It Matters

`verbatimModuleSyntax` was introduced specifically to prevent the class of bugs where TypeScript emits a `require()` or `import` for something that's purely a type — causing runtime errors when the imported module has side effects or doesn't export a runtime value. It's the recommended setting for all new projects.[^3]

## I — Interview Q&A

**Q: What does `esModuleInterop` do?**
A: It adds helper functions that allow `import defaultExport from "cjsModule"` to work for CommonJS modules that don't have a proper default export. Without it, you'd need `import * as defaultExport from "cjsModule"`. It's enabled by default in most TS templates.

**Q: What is the difference between `import { User }` and `import type { User }`?**
A: `import type` is erased completely at compile time — it only exists for type checking. Regular `import` may emit as a runtime import statement. With `verbatimModuleSyntax: true`, TypeScript enforces that type-only imports use `import type`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `paths` working in tsc but not at runtime | Paths are TS-only — configure the bundler/runtime too (Vite: `resolve.alias`, Node: `tsconfig-paths`) |
| Forgetting `baseUrl` when using `paths` | `paths` requires `baseUrl` to be set |
| `export { SomeType }` failing with `isolatedModules` | Use `export type { SomeType }` |

## K — Coding Challenge

**Set up path aliases so these imports work:**

```ts
import { Button } from "@ui/Button"
import type { ApiResponse } from "@types/api"
import { fetchUser } from "@api/users"
```

**Solution:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["./src/components/ui/*"],
      "@types/*": ["./src/types/*"],
      "@api/*": ["./src/api/*"]
    }
  }
}
```


***

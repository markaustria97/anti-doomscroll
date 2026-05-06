# 11 — `tsx`, `ts-node`, ESLint & Prettier

## T — TL;DR

`.tsx` enables JSX in TypeScript files; `ts-node` runs TypeScript directly in Node without a separate compile step; `@typescript-eslint` adds type-aware lint rules; Prettier handles formatting — they're complementary, not overlapping.

## K — Key Concepts

```bash
# ts-node — run TypeScript directly in Node.js
npx ts-node src/index.ts

# tsx — faster alternative to ts-node (uses esbuild, no type checking)
npx tsx src/index.ts
npx tsx watch src/index.ts  # watch mode

# @typescript-eslint — TypeScript-aware ESLint rules
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Prettier — opinionated code formatter
npm install -D prettier eslint-config-prettier
```

```ts
// .tsx file — TypeScript + JSX
// Same as .ts but JSX syntax is allowed
import React from "react"

interface Props {
  name: string
  count?: number
}

function Counter({ name, count = 0 }: Props) {
  return (
    <div>
      <h1>{name}</h1>
      <span>{count}</span>
    </div>
  )
}
```

```json
// eslint.config.js (flat config, ESLint 9+)
// or .eslintrc.json (legacy)
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json" // enables type-aware rules
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier" // must be LAST — disables formatting rules
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/no-floating-promises": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

```json
// package.json scripts
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  }
}
```

## W — Why It Matters

`@typescript-eslint/no-floating-promises` catches async calls where the returned Promise is never awaited — a common source of silent failures. `recommended-requiring-type-checking` enables rules that use the TypeScript type system for analysis (can detect calling `.split()` on a possibly-null value). ESLint handles code quality; Prettier handles formatting — separating concerns makes both configurable independently.

## I — Interview Q&A

**Q: What's the difference between `ts-node` and `tsx`?**
A: `ts-node` performs full TypeScript compilation (including type checking) before running. `tsx` uses esbuild to strip types and run instantly — no type checking. `tsx` is much faster for development/scripts; `ts-node` is safer for CI where you want type errors to fail execution.

**Q: Why does `eslint-config-prettier` need to be last in the extends array?**
A: It disables ESLint rules that conflict with Prettier's formatting decisions (indentation, quotes, semicolons). It must come last to override any rules from earlier configs. ESLint checks code quality; Prettier handles formatting — they don't fight when configured correctly.

## C — Common Pitfalls

| Pitfall                                              | Fix                                                             |
| :--------------------------------------------------- | :-------------------------------------------------------------- |
| ESLint and Prettier fighting over formatting         | Add `eslint-config-prettier` last in `extends`                  |
| `ts-node` slow in large projects                     | Use `tsx` for dev scripts, `tsc --noEmit` for type checks in CI |
| `.tsx` extension on non-React TypeScript files       | Only use `.tsx` for files with JSX — `.ts` for everything else  |
| `recommended-requiring-type-checking` slowing ESLint | Requires `parserOptions.project` — only add on TypeScript files |

## K — Coding Challenge

**Set up a minimal `package.json` scripts block for a TypeScript project with type checking, linting, and formatting:**

**Solution:**

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "validate": "npm run type-check && npm run lint && npm run format:check"
  }
}
```

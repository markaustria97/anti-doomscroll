# 5 — Monorepo Tooling: Turborepo & Nx Basics

## T — TL;DR

Monorepos house **multiple packages in one repository** — Turborepo and Nx provide intelligent caching, task orchestration, and dependency-aware builds that make monorepos practical at scale.

## K — Key Concepts

### Monorepo Structure

```
my-monorepo/
├── apps/
│   ├── web/            ← Next.js app
│   │   └── package.json
│   ├── api/            ← Express/Fastify API
│   │   └── package.json
│   └── mobile/         ← React Native
│       └── package.json
├── packages/
│   ├── shared-types/   ← TypeScript types shared across apps
│   │   └── package.json
│   ├── ui/             ← Shared component library
│   │   └── package.json
│   ├── utils/          ← Shared utility functions
│   │   └── package.json
│   └── config/         ← Shared ESLint, TS configs
│       └── package.json
├── package.json        ← root (workspace config)
├── pnpm-workspace.yaml
└── turbo.json          ← Turborepo config
```

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// packages/shared-types/package.json
{
  "name": "@myorg/shared-types",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

// apps/web/package.json
{
  "dependencies": {
    "@myorg/shared-types": "workspace:*",
    "@myorg/ui": "workspace:*"
  }
}
```

### Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

Key Turborepo features:
- **`dependsOn: ["^build"]`** — build dependencies first (topological order)
- **Remote caching** — CI shares build cache across runs
- **Parallel execution** — independent tasks run concurrently
- **Change detection** — only rebuild what changed

```bash
# Run build for all packages in dependency order:
pnpm turbo build

# Run dev for web app (and its dependencies):
pnpm turbo dev --filter=web

# Run tests only for packages that changed:
pnpm turbo test --filter=...[HEAD^1]
```

### Nx (Alternative)

```bash
npx create-nx-workspace@latest
```

Nx differences from Turborepo:
- **Computation caching** — similar to Turborepo's caching
- **Project graph** — visual dependency graph (`nx graph`)
- **Generators** — scaffold new packages/components from templates
- **Plugins** — first-class support for React, Next.js, Node, etc.
- **Affected command** — `nx affected --target=test` runs tests only for affected projects

### Shared Types Package Pattern

```ts
// packages/shared-types/src/index.ts
export type UserId = string & { __brand: "UserId" }
export type OrderId = string & { __brand: "OrderId" }

export interface User {
  id: UserId
  name: string
  email: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  timestamp: string
}

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

Both `web` and `api` apps import from `@myorg/shared-types` — types are defined once and shared.

## W — Why It Matters

- Monorepos are the **standard** for professional teams — Google, Meta, Vercel, and most startups use them.
- Shared types prevent **contract drift** between frontend and backend.
- Turborepo's caching reduces CI time by **40–80%** on average.
- Understanding monorepo tooling is required for senior roles and system design interviews.
- Groups 2–5 of this curriculum would naturally live in a monorepo.

## I — Interview Questions with Answers

### Q1: What is a monorepo?

**A:** A single repository containing multiple packages/apps that can share code. Managed with workspace tools (pnpm workspaces) and build orchestrators (Turborepo/Nx). Benefits: shared types, atomic changes across packages, unified CI/CD.

### Q2: Turborepo vs Nx?

**A:** Turborepo: simpler, focused on caching and task orchestration, zero config for basic setups. Nx: more features (generators, project graph, plugins), steeper learning curve. Turborepo is preferred for new projects; Nx for large enterprise monorepos.

### Q3: How do you share types between frontend and backend in a monorepo?

**A:** Create a `packages/shared-types` package. Both apps depend on it via `workspace:*`. Types are defined once, imported everywhere. Turborepo ensures the types package builds before dependent apps.

## C — Common Pitfalls with Fix

### Pitfall: Circular dependencies between packages

**Fix:** `packages/shared-types` should have zero internal dependencies. Use a dependency graph tool (`nx graph` or `turbo` visualize) to detect cycles.

### Pitfall: Not configuring `turbo.json` outputs

```json
"build": { "outputs": [] } // ❌ cache doesn't know what to restore
```

**Fix:** Always specify `outputs` for cacheable tasks: `["dist/**", ".next/**"]`.

## K — Coding Challenge with Solution

### Challenge

Set up a minimal monorepo `turbo.json` for: `web` (Next.js), `api` (Express), `shared-types`, and `ui` library:

### Solution

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```bash
# Development:
pnpm turbo dev --filter=web    # starts web + its dependencies

# CI:
pnpm turbo build test lint typecheck  # all tasks, cached, parallel where possible
```

---

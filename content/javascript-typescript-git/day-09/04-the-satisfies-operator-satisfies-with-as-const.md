# 4 — The `satisfies` Operator & `satisfies` with `as const`

## T — TL;DR

`satisfies` validates that a value matches a type *without widening it* — you get type-checking errors AND retain narrow literal types; `as const satisfies T` combines immutability + validation in one expression.

## K — Key Concepts

```ts
// ── The problem satisfies solves ──────────────────────────

// Option A: explicit annotation — widens to declared type
const theme: Record<string, string> = {
  primary: "#007bff",
  secondary: "#6c757d"
}
theme.primary  // type: string — lost the literal "#007bff"

// Option B: no annotation — no type checking, may be wrong
const theme = {
  primary: "#007bff",
  secundary: "#6c757d"  // ← typo — no error!
}

// ── satisfies — best of both worlds ──────────────────────
type ThemeColors = Record<"primary" | "secondary" | "background", string>

const theme = {
  primary: "#007bff",
  secondary: "#6c757d",
  background: "#ffffff",
  // extra: "red"   // ❌ Error: object may only specify known properties
} satisfies ThemeColors   // validates structure ✅

theme.primary  // type: "#007bff" — LITERAL type preserved! (not just string)

// ── satisfies + as const — the power combo ────────────────
const config = {
  host: "localhost",
  port: 3000,
  debug: false,
  features: ["auth", "payments"]
} as const satisfies {
  host: string
  port: number
  debug: boolean
  features: readonly string[]
}

// config.host is "localhost" (literal), not string
// config.port is 3000 (literal), not number
// config.features is readonly ["auth", "payments"] — tuple, not string[]
// AND TypeScript validates the shape matches the declared type!

// ── Enum alternative with satisfies ───────────────────────
const Status = {
  Pending: "pending",
  Active: "active",
  Failed: "failed"
} as const satisfies Record<string, string>

type Status = typeof Status[keyof typeof Status]  // "pending" | "active" | "failed"

// ── satisfies vs type annotation vs as ────────────────────
const a: ThemeColors = { primary: "#fff", secondary: "#000", background: "#eee" }
// a.primary = string  ← widened

const b = { primary: "#fff", secondary: "#000", background: "#eee" } satisfies ThemeColors
// b.primary = "#fff"  ← literal preserved, type checked ✅

const c = { primary: "#fff" } as ThemeColors
// c.primary = string  ← widened, NOT checked at all (unsafe!)
```


## W — Why It Matters

`satisfies` (TypeScript 4.9) is the canonical solution for typed configuration objects — you get validation against a known shape AND preserve the narrow types needed for autocomplete and literal type derivation. It replaces the pattern of using type assertions (`as`) for configs.

## I — Interview Q&A

**Q: What's the difference between annotating a variable type vs using `satisfies`?**
A: Annotation (`const x: T = ...`) widens the variable's type to `T` — you lose literal types. `satisfies T` validates against `T` but the variable retains its inferred (narrow) type. The difference: after annotation, `x.color` is `string`; after `satisfies`, `x.color` is `"#007bff"`.

**Q: When would you choose `satisfies` over an explicit type annotation?**
A: When you need both validation (detect missing/extra properties) AND literal type preservation (for `typeof`, key derivation, exhaustive checks). Configuration objects, route maps, color themes, typed event maps — anywhere you later use `typeof config[key]` for derived types.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `satisfies` not catching extra properties on interface | Interfaces allow extra properties in `satisfies`; use a type alias or `Record` for strict shape checking |
| Expecting `satisfies` to narrow based on the satisfied type | It validates, not narrows — the variable type is inferred, not the satisfied type |
| `as const satisfies T` order mattering | Always `as const satisfies T` — `satisfies` must be last for it to see the literal types |

## K — Coding Challenge

**Use `satisfies` to validate a route config while keeping route strings as literal types:**

```ts
type RouteConfig = Record<string, { path: string; component: string }>
// routes.home.path should be "/" (literal), not string
```

**Solution:**

```ts
const routes = {
  home:    { path: "/",        component: "HomePage" },
  about:   { path: "/about",   component: "AboutPage" },
  contact: { path: "/contact", component: "ContactPage" }
} as const satisfies Record<string, { path: string; component: string }>

type HomePath = typeof routes.home.path  // "/" — literal ✅
```


***

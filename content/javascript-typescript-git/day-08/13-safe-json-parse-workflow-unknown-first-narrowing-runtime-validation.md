# 13 — Safe `JSON.parse` Workflow: `unknown`-First Narrowing + Runtime Validation

## T — TL;DR

`JSON.parse` returns `any` — replace it with `unknown` and validate at runtime with a type guard or schema library before trusting the data. This is the correct pattern for all external data.

## K — Key Concepts

```ts
// ── The problem: JSON.parse returns any ───────────────────
const data = JSON.parse(rawJson); // type: any
data.user.name.toUpperCase(); // no error — will crash at runtime if shape is wrong

// ── Step 1: Wrap JSON.parse to return unknown ─────────────
function safeJsonParse(json: string): unknown {
  return JSON.parse(json);
}

// ── Step 2: Write type guards (manual approach) ───────────
function isUser(val: unknown): val is User {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val &&
    typeof (val as Record<string, unknown>).id === "number" &&
    "name" in val &&
    typeof (val as Record<string, unknown>).name === "string" &&
    "email" in val &&
    typeof (val as Record<string, unknown>).email === "string"
  );
}

// ── Step 3: Use in parse pipeline ─────────────────────────
const raw = safeJsonParse('{"id":1,"name":"Alice","email":"a@b.com"}');

if (isUser(raw)) {
  raw.name.toUpperCase(); // ✅ TypeScript knows raw is User
} else {
  throw new Error("Invalid user data");
}

// ── Better: type guard factory ────────────────────────────
function hasShape<T extends Record<string, unknown>>(
  val: unknown,
  schema: { [K in keyof T]: (v: unknown) => boolean }
): val is T {
  if (typeof val !== "object" || val === null) return false;
  return Object.entries(schema).every(([key, check]) =>
    check((val as Record<string, unknown>)[key])
  );
}

const isUser = (val: unknown): val is User =>
  hasShape<User>(val, {
    id: (v) => typeof v === "number",
    name: (v) => typeof v === "string",
    email: (v) => typeof v === "string",
  });

// ── Production: use Zod (runtime schema validation) ───────
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

type User = z.infer<typeof UserSchema>; // TypeScript type derived from schema

// parse — throws ZodError if invalid
const user = UserSchema.parse(JSON.parse(rawJson));

// safeParse — returns { success, data, error }
const result = UserSchema.safeParse(JSON.parse(rawJson));
if (result.success) {
  result.data.name; // User — fully typed ✅
} else {
  result.error.issues; // ZodIssue[] — detailed errors
}

// ── Full safe fetch pipeline ───────────────────────────────
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: unknown = await res.json(); // ← type as unknown, not any
  return UserSchema.parse(json); // ← validates AND narrows
}
```

## W — Why It Matters

`any` from `JSON.parse` or `res.json()` creates a type-safe looking codebase that crashes at runtime. The `unknown`-first + runtime validation pattern is what production TypeScript looks like — it's how tRPC, Next.js API routes, and any serious backend validates incoming data. Zod has become the standard library for this.

## I — Interview Q&A

**Q: Why is `JSON.parse` typed as returning `any` instead of `unknown`?**
A: Historical API design — `any` was the only option before `unknown` was added in TypeScript 3.0. Modern practice is to wrap `JSON.parse` in a helper that returns `unknown`, or use `JSON.parse(raw) as unknown` explicitly, forcing downstream validation.

**Q: What's the difference between a type assertion (`as User`) and a type guard (`val is User`)?**
A: A type assertion (`as User`) tells TypeScript "trust me, this is a User" — no runtime check, you can be wrong, crashes happen. A type guard is a function that runs an actual runtime check and narrows the type only if the check passes. Type guards are safe; assertions are a promise to TypeScript you must keep.

## C — Common Pitfalls

| Pitfall                                                   | Fix                                                                                          |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `res.json() as User` without validation                   | The server could return anything — always validate, never just assert                        |
| Manual type guards getting out of sync with the type      | Use Zod — `z.infer<typeof schema>` derives the TS type from the schema, keeping them in sync |
| Zod `parse` throwing uncaught `ZodError`                  | Use `safeParse` for user-facing validation; `parse` for internal assertions                  |
| Checking `typeof val === "object"` without `val !== null` | `typeof null === "object"` in JavaScript — always guard both                                 |

## K — Coding Challenge

**Build a fully type-safe API response handler using `unknown` and a Zod schema:**

```ts
// GET /api/config returns: { apiUrl: string; timeout: number; features: string[] }
const config = await fetchConfig();
config.apiUrl; // string — guaranteed safe
```

**Solution:**

```ts
import { z } from "zod";

const ConfigSchema = z.object({
  apiUrl: z.string().url(),
  timeout: z.number().positive(),
  features: z.array(z.string()),
});

type Config = z.infer<typeof ConfigSchema>;

async function fetchConfig(): Promise<Config> {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
  const json: unknown = await res.json();
  return ConfigSchema.parse(json); // validates at runtime, narrows at compile time
}
```

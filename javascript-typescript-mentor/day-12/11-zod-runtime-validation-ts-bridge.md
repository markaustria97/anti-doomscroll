# 11 — Zod — Runtime Validation & TS Bridge

## T — TL;DR

Zod is a **runtime validation library** that defines schemas once and gives you both runtime validation AND TypeScript types — bridging the gap between TypeScript's compile-time safety and runtime reality.

## K — Key Concepts

### The Problem Zod Solves

```ts
interface User {
  name: string
  email: string
  age: number
}

// TypeScript trusts you — but data from outside might be ANYTHING:
const data: User = await request.json() // could be { foo: 42 }
data.name.toUpperCase() // 💥 runtime crash
```

TypeScript types are **erased at runtime**. External data needs **runtime validation**.

### Basic Schemas

```ts
import { z } from "zod"

// Define a schema:
const UserSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  age: z.number().int().min(0).max(150),
})

// Derive the TypeScript type:
type User = z.infer<typeof UserSchema>
// { name: string; email: string; age: number }

// Validate at runtime:
const result = UserSchema.safeParse(unknownData)

if (result.success) {
  result.data // fully typed as User ✅
} else {
  result.error.issues // detailed error array
}
```

### Schema Types

```ts
// Primitives:
z.string()
z.number()
z.boolean()
z.bigint()
z.date()
z.undefined()
z.null()
z.void()
z.any()
z.unknown()
z.never()

// Strings with validation:
z.string().min(1).max(100)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/^[a-z]+$/)
z.string().trim()
z.string().toLowerCase()

// Numbers:
z.number().int().positive()
z.number().min(0).max(100)

// Enums:
z.enum(["admin", "user", "guest"])

// Literals:
z.literal("active")
z.literal(42)

// Arrays:
z.array(z.string())
z.array(z.number()).min(1).max(10)

// Tuples:
z.tuple([z.string(), z.number()])

// Records:
z.record(z.string(), z.number())

// Unions:
z.union([z.string(), z.number()])
// or: z.string().or(z.number())

// Discriminated unions:
z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), address: z.string().email() }),
  z.object({ type: z.literal("sms"), phone: z.string() }),
])
```

### Object Schemas

```ts
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).optional(), // optional field
  role: z.enum(["admin", "user"]).default("user"), // default value
  metadata: z.record(z.unknown()).optional(),
})

// Transformations:
const CreateUserSchema = UserSchema.omit({ id: true }) // no id for creation
const UpdateUserSchema = UserSchema.partial().required({ id: true }) // id required, rest optional
const PublicUserSchema = UserSchema.pick({ id: true, name: true, email: true }) // only public fields

type CreateUser = z.infer<typeof CreateUserSchema>
type UpdateUser = z.infer<typeof UpdateUserSchema>
type PublicUser = z.infer<typeof PublicUserSchema>
```

### `parse` vs `safeParse`

```ts
// parse — throws ZodError on failure:
try {
  const user = UserSchema.parse(data) // User or throws
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log(e.issues)
  }
}

// safeParse — returns Result-like object:
const result = UserSchema.safeParse(data)
if (result.success) {
  result.data // User ✅
} else {
  result.error.issues // ZodIssue[]
}

// safeParse is preferred — it follows the Result pattern!
```

### Transforms & Pipelines

```ts
// Transform during parsing:
const DateStringSchema = z.string().transform(s => new Date(s))
// Input: string → Output: Date

// Chained transforms:
const PriceSchema = z.string()
  .transform(s => parseFloat(s))
  .pipe(z.number().positive())
// Input: "9.99" → validates as positive number → Output: 9.99

// Preprocessing:
const NumberFromString = z.preprocess(
  val => (typeof val === "string" ? Number(val) : val),
  z.number(),
)
```

### Zod with API Validation

```ts
// Express middleware:
function validate<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: result.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message,
        })),
      })
    }
    req.body = result.data
    next()
  }
}

app.post("/api/users", validate(CreateUserSchema), (req, res) => {
  // req.body is guaranteed to be valid CreateUser
})
```

### Zod with Environment Variables

```ts
const EnvSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]),
})

// Validate at startup:
const env = EnvSchema.parse(process.env)
// env is fully typed and validated!
```

## W — Why It Matters

- Zod bridges **compile-time types** and **runtime validation** — the most important gap in TypeScript.
- **Define once, use everywhere** — schema is the single source of truth for both types and validation.
- Used by tRPC, React Hook Form, Next.js server actions, and most modern TypeScript APIs.
- `z.infer` eliminates the type duplication problem (interface + validation logic).
- Zod validation is used in Groups 3–4 (API routes, tRPC, form validation).
- This is the most practically valuable library in the TypeScript ecosystem.

## I — Interview Questions with Answers

### Q1: What problem does Zod solve?

**A:** TypeScript types exist only at compile time — they're erased at runtime. External data (API requests, form inputs, env vars, JSON files) is unvalidated. Zod provides runtime validation that also generates TypeScript types, ensuring data is both typed and validated.

### Q2: What is `z.infer`?

**A:** Extracts the TypeScript type from a Zod schema. `z.infer<typeof UserSchema>` gives you the type that `UserSchema.parse()` returns. This means you define the shape once (as a schema) and derive the type — no duplication.

### Q3: When should you use `parse` vs `safeParse`?

**A:** `safeParse` is preferred — it returns `{ success, data, error }` (Result-like). `parse` throws on failure, which conflicts with the "never throw" philosophy. Use `parse` only when failure is truly exceptional.

### Q4: How does Zod integrate with tRPC?

**A:** tRPC uses Zod schemas as input validators for procedures. The schema defines both the runtime validation and the TypeScript type for the input. Client-side code gets full type inference from the server's Zod schemas.

## C — Common Pitfalls with Fix

### Pitfall: Using `parse` instead of `safeParse` in API handlers

```ts
app.post("/users", (req, res) => {
  const data = UserSchema.parse(req.body) // throws on invalid input!
})
```

**Fix:** Use `safeParse` and return a proper error response.

### Pitfall: Duplicating types and schemas

```ts
interface User { name: string; email: string }
const UserSchema = z.object({ name: z.string(), email: z.string().email() })
// ❌ Type and schema can drift apart
```

**Fix:** Derive the type: `type User = z.infer<typeof UserSchema>`. Schema is the source of truth.

### Pitfall: Not using `.transform` for type conversions

```ts
// ❌ Manual conversion after validation
const port = EnvSchema.parse(process.env).PORT
const portNumber = Number(port) // could be NaN!
```

**Fix:** Use `.transform(Number)` in the schema to convert and validate in one step.

## K — Coding Challenge with Solution

### Challenge

Create a Zod schema for an e-commerce product with validation:

```ts
// Requirements:
// - name: 1-200 chars
// - price: positive number, max 2 decimal places
// - category: "electronics" | "clothing" | "food"
// - tags: array of strings, 0-10 items
// - metadata: optional record
// - createdAt: ISO date string → Date
```

### Solution

```ts
import { z } from "zod"

const ProductSchema = z.object({
  name: z.string().min(1, "Name required").max(200, "Name too long"),
  price: z.number()
    .positive("Price must be positive")
    .multipleOf(0.01, "Max 2 decimal places"),
  category: z.enum(["electronics", "clothing", "food"]),
  tags: z.array(z.string().min(1)).max(10, "Max 10 tags").default([]),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string()
    .datetime("Must be ISO date string")
    .transform(s => new Date(s)),
})

type Product = z.infer<typeof ProductSchema>

// Create and Update variants:
const CreateProductSchema = ProductSchema.omit({ createdAt: true })
const UpdateProductSchema = CreateProductSchema.partial()

// Test:
const result = ProductSchema.safeParse({
  name: "Laptop",
  price: 999.99,
  category: "electronics",
  tags: ["tech", "portable"],
  createdAt: "2024-01-15T10:30:00Z",
})

if (result.success) {
  result.data.createdAt // Date object ✅
  result.data.tags      // string[] ✅
}
```

---

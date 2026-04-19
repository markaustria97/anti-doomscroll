# 9 — Builder Pattern

## T — TL;DR

The Builder pattern constructs complex objects **step by step** with a fluent API — each method sets one property and returns `this`, making construction readable and type-safe.

## K — Key Concepts

### Basic Builder

```ts
interface HttpRequest {
  method: "GET" | "POST" | "PUT" | "DELETE"
  url: string
  headers: Record<string, string>
  body?: unknown
  timeout: number
}

class RequestBuilder {
  #request: Partial<HttpRequest> = {
    headers: {},
    timeout: 5000,
  }

  method(method: HttpRequest["method"]): this {
    this.#request.method = method
    return this
  }

  url(url: string): this {
    this.#request.url = url
    return this
  }

  header(key: string, value: string): this {
    this.#request.headers![key] = value
    return this
  }

  body(body: unknown): this {
    this.#request.body = body
    return this
  }

  timeout(ms: number): this {
    this.#request.timeout = ms
    return this
  }

  build(): HttpRequest {
    if (!this.#request.method) throw new Error("Method required")
    if (!this.#request.url) throw new Error("URL required")

    return { ...this.#request } as HttpRequest
  }
}

// Fluent API:
const request = new RequestBuilder()
  .method("POST")
  .url("/api/users")
  .header("Content-Type", "application/json")
  .header("Authorization", "Bearer token123")
  .body({ name: "Mark", email: "mark@test.com" })
  .timeout(10000)
  .build()
```

### Type-Safe Builder (Compile-Time Required Fields)

```ts
type RequiredFields = "method" | "url"

class TypedRequestBuilder<Built extends string = never> {
  #data: Partial<HttpRequest> = { headers: {}, timeout: 5000 }

  method(m: HttpRequest["method"]): TypedRequestBuilder<Built | "method"> {
    this.#data.method = m
    return this as any
  }

  url(u: string): TypedRequestBuilder<Built | "url"> {
    this.#data.url = u
    return this as any
  }

  header(key: string, value: string): this {
    this.#data.headers![key] = value
    return this
  }

  body(b: unknown): this {
    this.#data.body = b
    return this
  }

  // build() only available when all required fields are set:
  build(this: TypedRequestBuilder<RequiredFields>): HttpRequest {
    return { ...this.#data } as HttpRequest
  }
}

// ✅ Works — method and url set:
new TypedRequestBuilder()
  .method("GET")
  .url("/api/users")
  .build()

// ❌ Compile error — url not set:
new TypedRequestBuilder()
  .method("GET")
  .build() // Error: 'build' does not exist on TypedRequestBuilder<"method">
```

### Function-Based Builder (Simpler)

```ts
interface QueryOptions {
  table: string
  select: string[]
  where: Record<string, unknown>
  orderBy?: string
  limit?: number
}

function query(table: string) {
  const opts: QueryOptions = { table, select: ["*"], where: {} }

  const builder = {
    select(...fields: string[]) {
      opts.select = fields
      return builder
    },
    where(conditions: Record<string, unknown>) {
      Object.assign(opts.where, conditions)
      return builder
    },
    orderBy(field: string) {
      opts.orderBy = field
      return builder
    },
    limit(n: number) {
      opts.limit = n
      return builder
    },
    build(): QueryOptions {
      return { ...opts }
    },
  }

  return builder
}

const q = query("users")
  .select("id", "name", "email")
  .where({ active: true })
  .orderBy("name")
  .limit(10)
  .build()
```

## W — Why It Matters

- Builders make **complex object construction** readable and self-documenting.
- Every query builder (Prisma, Knex, TypeORM) uses the Builder pattern.
- The fluent API pattern (`obj.method().method().method()`) is ubiquitous in JavaScript.
- Type-safe builders that enforce required fields at compile time are an advanced TypeScript technique.
- Testing frameworks (Jest, Vitest) use builders for assertion chains.

## I — Interview Questions with Answers

### Q1: What is the Builder pattern?

**A:** A creational pattern that constructs complex objects step by step. Each method sets one aspect of the object and returns `this` for chaining (fluent API). A final `build()` method validates and returns the completed object.

### Q2: When should you use a Builder?

**A:** When an object has many optional properties, complex validation rules, or multi-step construction. If the constructor would have more than 4-5 parameters or many optional fields.

### Q3: How do you make `build()` only available when required fields are set?

**A:** Track set fields in a type parameter: `Builder<Built extends string>`. Each setter adds to `Built`. `build()` has a `this` constraint requiring all required fields: `this: Builder<"field1" | "field2">`.

## C — Common Pitfalls with Fix

### Pitfall: Builder without validation

```ts
build(): HttpRequest {
  return this.#data as HttpRequest // ❌ might be incomplete
}
```

**Fix:** Validate in `build()` or use the type-safe builder pattern.

### Pitfall: Mutable builder reuse

```ts
const base = new RequestBuilder().header("Auth", "token")
const req1 = base.url("/a").build()
const req2 = base.url("/b").build() // ❌ base was modified by req1!
```

**Fix:** Each method should return a new builder (immutable) or document that builders are single-use.

## K — Coding Challenge with Solution

### Challenge

Create a `QueryBuilder` for SQL-like queries:

```ts
const sql = new QueryBuilder()
  .from("users")
  .select("id", "name")
  .where("active", "=", true)
  .where("age", ">", 18)
  .orderBy("name", "ASC")
  .limit(10)
  .toSQL()

// "SELECT id, name FROM users WHERE active = true AND age > 18 ORDER BY name ASC LIMIT 10"
```

### Solution

```ts
class QueryBuilder {
  #table = ""
  #fields: string[] = ["*"]
  #conditions: string[] = []
  #order = ""
  #limitVal?: number

  from(table: string): this {
    this.#table = table
    return this
  }

  select(...fields: string[]): this {
    this.#fields = fields
    return this
  }

  where(field: string, op: string, value: unknown): this {
    const v = typeof value === "string" ? `'${value}'` : String(value)
    this.#conditions.push(`${field} ${op} ${v}`)
    return this
  }

  orderBy(field: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.#order = `ORDER BY ${field} ${direction}`
    return this
  }

  limit(n: number): this {
    this.#limitVal = n
    return this
  }

  toSQL(): string {
    const parts = [`SELECT ${this.#fields.join(", ")} FROM ${this.#table}`]

    if (this.#conditions.length) {
      parts.push(`WHERE ${this.#conditions.join(" AND ")}`)
    }
    if (this.#order) parts.push(this.#order)
    if (this.#limitVal !== undefined) parts.push(`LIMIT ${this.#limitVal}`)

    return parts.join(" ")
  }
}
```

---

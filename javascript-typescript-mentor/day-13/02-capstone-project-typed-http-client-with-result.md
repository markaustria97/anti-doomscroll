# 2 — Capstone Project: Typed HTTP Client with `Result`

## T — TL;DR

Build a **type-safe HTTP client wrapper** that returns `ResultAsync` instead of throwing, supports interceptors, type-safe routes, and automatic Zod validation — combining Days 5, 8–10, 11, and 12.

## K — Key Concepts

### Requirements

```
✅ Typed request/response for each endpoint
✅ Returns ResultAsync<T, HttpError> — never throws
✅ Request/response interceptors
✅ Automatic Zod validation of responses
✅ Timeout support via AbortController
✅ Retry with exponential backoff
✅ Base URL + default headers configuration
```

### Step 1: Types

```ts
import { z } from "zod"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

class HttpError {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly url: string,
  ) {}

  get message(): string {
    return `HTTP ${this.status} ${this.statusText} — ${this.url}`
  }
}

class NetworkError {
  constructor(
    public readonly cause: Error,
    public readonly url: string,
  ) {}

  get message(): string {
    return `Network error: ${this.cause.message} — ${this.url}`
  }
}

class ValidationError {
  constructor(
    public readonly issues: z.ZodIssue[],
    public readonly url: string,
  ) {}
}

class TimeoutError {
  constructor(
    public readonly timeoutMs: number,
    public readonly url: string,
  ) {}
}

type ClientError = HttpError | NetworkError | ValidationError | TimeoutError
```

### Step 2: Result Helpers

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

// Simple ResultAsync:
class ResultAsync<T, E> {
  constructor(readonly promise: Promise<Result<T, E>>) {}

  static fromPromise<T, E>(
    p: Promise<T>,
    mapErr: (e: unknown) => E,
  ): ResultAsync<T, E> {
    return new ResultAsync(
      p.then(v => ok(v) as Result<T, E>).catch(e => err(mapErr(e)) as Result<T, E>),
    )
  }

  static ok<T>(value: T): ResultAsync<T, never> {
    return new ResultAsync(Promise.resolve(ok(value)))
  }

  static err<E>(error: E): ResultAsync<never, E> {
    return new ResultAsync(Promise.resolve(err(error)))
  }

  map<U>(fn: (v: T) => U): ResultAsync<U, E> {
    return new ResultAsync(this.promise.then(r => r.ok ? ok(fn(r.value)) : r))
  }

  mapErr<F>(fn: (e: E) => F): ResultAsync<T, F> {
    return new ResultAsync(this.promise.then(r => r.ok ? r : err(fn(r.error))))
  }

  andThen<U>(fn: (v: T) => ResultAsync<U, E>): ResultAsync<U, E> {
    return new ResultAsync(
      this.promise.then(r => r.ok ? fn(r.value).promise : r),
    )
  }

  async match<U>(handlers: { ok: (v: T) => U; err: (e: E) => U }): Promise<U> {
    const r = await this.promise
    return r.ok ? handlers.ok(r.value) : handlers.err(r.error)
  }
}
```

### Step 3: Interceptors

```ts
type RequestInterceptor = (config: RequestInit & { url: string }) =>
  RequestInit & { url: string } | Promise<RequestInit & { url: string }>

type ResponseInterceptor = (response: Response) =>
  Response | Promise<Response>

interface ClientConfig {
  baseUrl: string
  defaultHeaders?: Record<string, string>
  timeout?: number
  retries?: number
  requestInterceptors?: RequestInterceptor[]
  responseInterceptors?: ResponseInterceptor[]
}
```

### Step 4: HTTP Client

```ts
class TypedHttpClient {
  #config: Required<ClientConfig>

  constructor(config: ClientConfig) {
    this.#config = {
      defaultHeaders: {},
      timeout: 10_000,
      retries: 0,
      requestInterceptors: [],
      responseInterceptors: [],
      ...config,
    }
  }

  request<T>(
    method: HttpMethod,
    path: string,
    options?: {
      body?: unknown
      headers?: Record<string, string>
      schema?: z.ZodSchema<T>
      timeout?: number
    },
  ): ResultAsync<T, ClientError> {
    const url = `${this.#config.baseUrl}${path}`
    const timeout = options?.timeout ?? this.#config.timeout

    return new ResultAsync(this.#executeWithRetry(method, url, options, timeout))
  }

  async #executeWithRetry<T>(
    method: HttpMethod,
    url: string,
    options: {
      body?: unknown
      headers?: Record<string, string>
      schema?: z.ZodSchema<T>
    } | undefined,
    timeout: number,
    attempt: number = 0,
  ): Promise<Result<T, ClientError>> {
    try {
      // Build request config
      let config: RequestInit & { url: string } = {
        url,
        method,
        headers: {
          "Content-Type": "application/json",
          ...this.#config.defaultHeaders,
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      }

      // Apply request interceptors
      for (const interceptor of this.#config.requestInterceptors) {
        config = await interceptor(config)
      }

      // Timeout via AbortController
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      let response: Response
      try {
        response = await fetch(config.url, {
          ...config,
          signal: controller.signal,
        })
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          return err(new TimeoutError(timeout, url))
        }
        throw e // re-throw for network error handling below
      } finally {
        clearTimeout(timer)
      }

      // Apply response interceptors
      for (const interceptor of this.#config.responseInterceptors) {
        response = await interceptor(response)
      }

      // Handle HTTP errors
      if (!response.ok) {
        const body = await response.text().catch(() => null)
        const httpError = new HttpError(response.status, response.statusText, body, url)

        // Retry on 5xx
        if (response.status >= 500 && attempt < this.#config.retries) {
          const delay = Math.min(1000 * 2 ** attempt, 10_000)
          await new Promise(r => setTimeout(r, delay))
          return this.#executeWithRetry(method, url, options, timeout, attempt + 1)
        }

        return err(httpError)
      }

      // Parse response
      const data = await response.json()

      // Validate with Zod if schema provided
      if (options?.schema) {
        const parsed = options.schema.safeParse(data)
        if (!parsed.success) {
          return err(new ValidationError(parsed.error.issues, url))
        }
        return ok(parsed.data)
      }

      return ok(data as T)
    } catch (e) {
      // Network error
      if (attempt < this.#config.retries) {
        const delay = Math.min(1000 * 2 ** attempt, 10_000)
        await new Promise(r => setTimeout(r, delay))
        return this.#executeWithRetry(method, url, options, timeout, attempt + 1)
      }
      return err(new NetworkError(e instanceof Error ? e : new Error(String(e)), url))
    }
  }

  // Convenience methods:
  get<T>(path: string, opts?: { schema?: z.ZodSchema<T>; headers?: Record<string, string> }) {
    return this.request<T>("GET", path, opts)
  }

  post<T>(path: string, body: unknown, opts?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>("POST", path, { body, ...opts })
  }

  put<T>(path: string, body: unknown, opts?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>("PUT", path, { body, ...opts })
  }

  delete<T>(path: string, opts?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>("DELETE", path, opts)
  }
}
```

### Step 5: Usage

```ts
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})
type User = z.infer<typeof UserSchema>

const api = new TypedHttpClient({
  baseUrl: "https://api.example.com",
  defaultHeaders: { Authorization: "Bearer token123" },
  timeout: 5000,
  retries: 2,
  requestInterceptors: [
    (config) => {
      console.log(`→ ${config.method} ${config.url}`)
      return config
    },
  ],
})

// Type-safe, validated, never throws:
const result = await api
  .get("/users/1", { schema: UserSchema })
  .map(user => user.name.toUpperCase())
  .match({
    ok: name => ({ status: 200, body: { name } }),
    err: error => {
      if (error instanceof HttpError) return { status: error.status, body: { message: error.message } }
      if (error instanceof TimeoutError) return { status: 504, body: { message: "Timeout" } }
      if (error instanceof ValidationError) return { status: 502, body: { message: "Invalid response" } }
      return { status: 500, body: { message: "Network error" } }
    },
  })
```

## W — Why It Matters

- This is a **production-grade** HTTP client — the exact pattern used in professional codebases.
- Combines `Result`, `Zod`, `AbortController`, interceptors, retry, and generics.
- Demonstrates the "never throw" philosophy applied to the most common operation (HTTP requests).
- Portfolio piece showing mastery of async TypeScript, error handling, and API design.
- Directly applicable to Groups 3–4 (API clients, tRPC, data fetching).

## I — Interview Questions with Answers

### Q1: Why return Result instead of throwing from HTTP calls?

**A:** HTTP failures are **expected** (404, 500, timeouts, network errors). Throwing makes errors invisible in the type signature. `ResultAsync<User, ClientError>` tells the caller exactly what can go wrong and forces handling. The discriminated error union enables precise error-specific responses.

### Q2: How does the retry mechanism work?

**A:** Exponential backoff: delay = `min(1000 * 2^attempt, 10000)ms`. Retries only on 5xx errors and network failures — not 4xx (client errors). Configurable max retries. The retry loop is inside the private `#executeWithRetry` method using recursion.

### Q3: How does Zod validation integrate?

**A:** Optional `schema` parameter. If provided, the raw JSON response is validated with `safeParse`. Success → typed data. Failure → `ValidationError` with Zod issues. This catches API contract violations at the boundary — the response is guaranteed to match the schema.

## C — Common Pitfalls with Fix

### Pitfall: Not clearing the timeout timer

```ts
const timer = setTimeout(() => controller.abort(), timeout)
// If fetch succeeds, timer is still running!
```

**Fix:** Always `clearTimeout(timer)` in a `finally` block.

### Pitfall: Retrying on 4xx errors

**Fix:** Only retry on 5xx and network errors. 4xx errors (400, 401, 404) are client-side — retrying won't help.

## K — Coding Challenge with Solution

### Challenge

Add a `requestId` interceptor that attaches a unique ID to every request and logs it with the response:

### Solution

```ts
const requestIdInterceptor: RequestInterceptor = (config) => {
  const requestId = crypto.randomUUID()
  return {
    ...config,
    headers: {
      ...(config.headers as Record<string, string>),
      "X-Request-ID": requestId,
    },
  }
}

const loggingInterceptor: ResponseInterceptor = (response) => {
  const requestId = response.headers.get("X-Request-ID") || "unknown"
  console.log(`[${requestId}] ${response.status} ${response.url}`)
  return response
}

const api = new TypedHttpClient({
  baseUrl: "https://api.example.com",
  requestInterceptors: [requestIdInterceptor],
  responseInterceptors: [loggingInterceptor],
})
```

---

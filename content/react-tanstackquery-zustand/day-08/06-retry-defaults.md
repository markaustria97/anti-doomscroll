# 6 — Retry Defaults

## T — TL;DR

TanStack Query retries failed queries 3 times with exponential backoff by default — catching transient network errors automatically without any manual retry logic.

## K — Key Concepts

**Default retry behavior:**

```
Query fails on attempt 1
→ Wait ~1000ms → retry attempt 2
→ Query fails again
→ Wait ~2000ms → retry attempt 3
→ Query fails again
→ Wait ~4000ms → retry attempt 4 (final)
→ Query fails again
→ isError = true, error = last error
```

```jsx
// Default: retry: 3 (4 total attempts including the first)
// Default backoff: exponential (1s, 2s, 4s between attempts)
```

**Configuring retry behavior:**

```jsx
// Disable retries entirely (for non-idempotent or auth-sensitive queries)
useQuery({ queryKey: ["login"], queryFn: login, retry: false })

// Custom retry count
useQuery({ queryKey: ["data"], queryFn: fetchData, retry: 1 })

// Smart retry — don't retry client errors (4xx), retry server errors (5xx)
useQuery({
  queryKey: ["user", id],
  queryFn: fetchUser,
  retry: (failureCount, error) => {
    // Never retry auth failures — user must take action
    if (error?.status === 401 || error?.status === 403) return false
    // Never retry "not found" — retrying won't fix a missing resource
    if (error?.status === 404) return false
    // Retry server errors up to 3 times
    return failureCount < 3
  },
})
```

**Custom retry delay:**

```jsx
// Default: min(1000 * 2^attemptIndex, 30000) — capped at 30 seconds
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

  // Fixed 2-second delay between all retries
  retryDelay: 2000,

  // Linear backoff
  retryDelay: (attemptIndex) => (attemptIndex + 1) * 1000,  // 1s, 2s, 3s...
})
```

**Global retry config:**

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if ([401, 403, 404].includes(error?.status)) return false
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
  },
})
```


## W — Why It Matters

Automatic retries are the difference between a flaky app and a resilient one. Network hiccups, momentary server overloads, and cold starts all cause transient errors that resolve on retry. But retrying `401 Unauthorized` three times wastes 3 failed requests — smart retry logic that skips client errors is a production necessity.

## I — Interview Q&A

**Q: What are TanStack Query's default retry settings?**
**A:** 3 retries (4 total attempts) with exponential backoff — approximately 1s, 2s, 4s between retries, capped at 30 seconds. After all retries are exhausted, the query transitions to `isError = true`.

**Q: Should you retry `401 Unauthorized` errors?**
**A:** No — a 401 means the user is not authenticated, which won't change with a retry. Retrying wastes requests and delays showing the user an error. Use a custom `retry` function to return `false` for 401, 403, and 404 status codes.

**Q: How does the `retry` function signature work?**
**A:** It receives `(failureCount, error)` and returns a boolean. `failureCount` is how many retries have already occurred (starts at 0). Return `true` to retry, `false` to stop. Return `false` for any error type that retrying won't fix.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Retrying 401/403/404 errors (retry: 3 default) | Use a smart retry function that checks `error.status` |
| App feels slow to show errors — users wait for all 3 retries | Reduce `retry: 1` or `retry: false` for user-facing interactive queries |
| Query function not throwing HTTP errors — retry never fires | Must `throw` on non-2xx responses — `if (!res.ok) throw new Error(...)` |
| Long retry delays on mobile with spotty connection | Cap `retryDelay` lower: `Math.min(500 * 2 ** attempt, 5000)` |

## K — Coding Challenge

**Challenge:** Write a production-ready global retry config for an app with REST APIs, plus a per-query override for a payment endpoint that should never retry:

**Solution:**

```jsx
import { QueryClient } from "@tanstack/react-query"

// Custom error class with HTTP status
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

// Smart global retry — separates transient vs permanent failures
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry client errors — they won't resolve on retry
        if (error instanceof ApiError) {
          if (error.status === 401) return false  // not authenticated
          if (error.status === 403) return false  // not authorized
          if (error.status === 404) return false  // resource doesn't exist
          if (error.status >= 400 && error.status < 500) return false  // all 4xx
        }
        // Retry server errors up to 2x
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),  // cap at 8s
    },
  },
})

// Per-query: payment status check — never auto-retry
function usePaymentStatus(orderId) {
  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: () => checkPaymentStatus(orderId),
    retry: false,                 // ✅ payment state must be explicitly refreshed
    staleTime: 0,                 // always check fresh
    refetchOnWindowFocus: false,  // no auto background refresh for financial data
    enabled: !!orderId,
  })
}
```


***

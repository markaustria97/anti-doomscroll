# 6 — `throw`/`catch`/rethrow Patterns

## T — TL;DR

`throw` any value (but always throw `Error` objects); `catch` selectively by type; rethrow anything you can't handle — never silently swallow errors you don't understand.

## K — Key Concepts

```js
// throw — any value, but always use Error objects
throw new Error("message")         // ✅
throw new TypeError("wrong type")  // ✅
throw "a string"                   // ❌ no stack trace, no .message
throw 42                           // ❌ even worse

// Basic try/catch/finally
function parseConfig(json) {
  try {
    return JSON.parse(json)
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid config JSON: ${err.message}`, { cause: err })
    }
    throw err  // rethrow unknown errors
  } finally {
    console.log("parseConfig attempted")  // always runs
  }
}

// Selective catch — handle known errors, rethrow others
async function loadUser(id) {
  try {
    const user = await db.findUser(id)
    if (!user) throw new NotFoundError("User", id)
    return user
  } catch (err) {
    if (err instanceof NotFoundError) {
      return null  // handled gracefully
    }
    // Don't swallow: rethrow database errors, network errors, etc.
    throw err
  }
}

// Rethrowing with context
async function processOrder(orderId) {
  try {
    const order = await fetchOrder(orderId)
    await chargeCustomer(order)
  } catch (err) {
    // Add context, preserve original cause
    throw new Error(`Order ${orderId} processing failed`, { cause: err })
  }
}

// Error boundary pattern (collecting errors)
async function processBatch(items) {
  const errors = []
  const results = []

  for (const item of items) {
    try {
      results.push(await processItem(item))
    } catch (err) {
      errors.push({ item, error: err })  // collect, don't stop
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(
      errors.map(e => e.error),
      `${errors.length} items failed in batch`
    )
  }
  return results
}

// finally doesn't swallow errors — but a throw in finally does!
function risky() {
  try {
    throw new Error("original")
  } finally {
    // return "overridden"  // ❌ swallows original error!
    // throw new Error("finally")  // ❌ replaces original error
    cleanup()  // ✅ just run cleanup, don't throw or return
  }
}
```


## W — Why It Matters

Rethrow discipline is a hallmark of senior-level code. Swallowed errors hide bugs in production. Selective catches prevent masking unexpected failures. `finally` misuse (throwing or returning inside it) is a subtle trap that silently replaces the original error.

## I — Interview Q&A

**Q: When should you rethrow an error in a catch block?**
A: Rethrow when you can't fully handle the error at this level — you only want to add context, log it, or selectively handle one type. The rule: if you catch it, either handle it fully or rethrow (possibly wrapped with `cause`).

**Q: What happens if you `return` inside a `finally` block?**
A: The `return` in `finally` overrides any pending `return` or `throw` from the `try`/`catch` blocks. The original error is silently swallowed. Only use `finally` for side-effect cleanup — never `return` or `throw` inside it unless intentional.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Empty `catch(err) {}` swallowing error silently | At minimum: `console.error(err)` or re-throw |
| `throw "string"` losing stack trace | Always `throw new Error("message")` |
| `return` or `throw` inside `finally` | Use `finally` for cleanup only — no flow control |
| Catching `Error` when you meant `instanceof SpecificError` | Check with `instanceof` before handling |

## K — Coding Challenge

**Write a `withRetry(fn, retries)` that retries on any error except `AuthError`:**

```js
await withRetry(() => fetchData(), 3)
```

**Solution:**

```js
async function withRetry(fn, retries = 3) {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (err instanceof AuthError) throw err  // never retry auth errors
      lastError = err
      if (attempt < retries) await sleep(1000 * attempt)  // backoff
    }
  }
  throw new Error(`Failed after ${retries} retries`, { cause: lastError })
}
```


***

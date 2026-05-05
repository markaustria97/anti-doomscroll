# 7 — Sequential vs Parallel Execution & the `await` in `forEach` Pitfall

## T — TL;DR

`await` inside `forEach` doesn't work — `forEach` ignores returned Promises. Use `for...of` for sequential async work and `Promise.all` for parallel async work.

## K — Key Concepts

```js
const userIds = [1, 2, 3, 4, 5]

// ❌ WRONG: await in forEach — doesn't wait!
async function badParallel() {
  userIds.forEach(async (id) => {
    const user = await fetchUser(id)  // forEach ignores this Promise!
    console.log(user.name)
  })
  console.log("done")  // runs BEFORE any user is fetched!
}

// ✅ SEQUENTIAL: for...of — one at a time, in order
async function sequential() {
  for (const id of userIds) {
    const user = await fetchUser(id)  // waits for each
    console.log(user.name)
  }
  console.log("done")  // runs AFTER all users fetched
}
// Time: sum of all fetch times (e.g., 5 × 200ms = 1000ms)

// ✅ PARALLEL: Promise.all — all at once
async function parallel() {
  const users = await Promise.all(userIds.map(id => fetchUser(id)))
  users.forEach(user => console.log(user.name))
  console.log("done")
}
// Time: max of all fetch times (e.g., 200ms total)

// ✅ PARALLEL with limit (concurrency control)
async function parallelLimited(ids, limit = 3) {
  const results = []
  for (let i = 0; i < ids.length; i += limit) {
    const batch = ids.slice(i, i + limit)
    const batchResults = await Promise.all(batch.map(fetchUser))
    results.push(...batchResults)
  }
  return results
}

// ✅ for...of with index (use entries)
for (const [index, id] of userIds.entries()) {
  const user = await fetchUser(id)
  console.log(index, user.name)
}
```


## W — Why It Matters

The `await` in `forEach` bug is one of the most common async mistakes in production code. It silently does nothing — no errors thrown, no warnings, just incorrect behavior where the "done" log fires before any async work completes. It shows up in code reviews constantly.

## I — Interview Q&A

**Q: Why doesn't `await` work inside `forEach`?**
A: `forEach` calls its callback synchronously and ignores the returned value. An `async` callback returns a Promise, but `forEach` discards it. The awaits inside are happening, but nobody is waiting for them. Use `for...of` or `Promise.all(arr.map(async fn))`.

**Q: When should you use sequential vs parallel execution?**
A: Use **sequential** when each operation depends on the previous result, or when rate-limiting an API. Use **parallel** when operations are independent and you want minimum total time.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `await` inside `forEach`, `filter`, `reduce` | Use `for...of` (sequential) or `Promise.all(.map())` (parallel) |
| `Promise.all` on 1000 requests hitting rate limits | Batch with `parallelLimited(items, concurrency)` |
| Sequential when parallel is possible | Audit for unnecessary sequential `await` in unrelated operations |

## K — Coding Challenge

**Fix this code so it correctly awaits all saves:**

```js
async function saveAll(items) {
  items.forEach(async (item) => {
    await db.save(item)
  })
  console.log("All saved!")
}
```

**Solution:**

```js
// Option 1: Parallel (fastest)
async function saveAll(items) {
  await Promise.all(items.map(item => db.save(item)))
  console.log("All saved!")
}

// Option 2: Sequential (if order matters or rate-limited)
async function saveAll(items) {
  for (const item of items) {
    await db.save(item)
  }
  console.log("All saved!")
}
```


***

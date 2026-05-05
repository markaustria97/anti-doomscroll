# 8 — Timers: `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`

## T — TL;DR

`setTimeout` fires once after a delay; `setInterval` fires repeatedly; both return IDs you must store to cancel — and their minimum delay is never truly zero.

## K — Key Concepts

```js
// setTimeout — fire once after delay
const id = setTimeout(() => console.log("fired"), 1000)
clearTimeout(id)  // cancel before it fires

// The delay is a MINIMUM, not a guarantee
setTimeout(() => console.log("after 0ms"), 0)
console.log("sync runs first")  // sync always runs before timer

// setInterval — fire repeatedly
const counterId = setInterval(() => {
  console.log(Date.now())
}, 1000)
clearInterval(counterId)  // stop it

// setInterval drift issue — interval doesn't account for execution time
// If handler takes 300ms and interval is 1000ms:
// Fires at: 1000, 2000+overhead, 3000+more_overhead...

// Self-scheduling setTimeout — more accurate, cancellable
function repeat(fn, delay) {
  let id
  async function run() {
    await fn()
    id = setTimeout(run, delay)  // schedule AFTER fn completes
  }
  id = setTimeout(run, delay)
  return () => clearTimeout(id)  // returns cancel function
}

const stop = repeat(() => console.log("tick"), 1000)
// Later:
stop()  // cancels cleanly

// Promisified delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function demo() {
  console.log("start")
  await sleep(2000)
  console.log("after 2 seconds")
}

// Minimum delay in browsers: ~4ms (HTML spec)
// setTimeout(fn, 0) ≈ setTimeout(fn, 4) in nested contexts
```


## W — Why It Matters

`setInterval` is often the wrong tool — it queues calls even if the previous is still running, causing overlapping executions. The self-scheduling `setTimeout` pattern is used in polling, retry logic, and animation loops. `sleep()` (Promisified setTimeout) is the cleanest way to add async delays.

## I — Interview Q&A

**Q: What's the problem with `setInterval` for async work?**
A: `setInterval` fires at the fixed interval regardless of whether the previous callback has finished. If the callback is async and takes longer than the interval, multiple invocations overlap. Use a self-scheduling `setTimeout` to wait for completion before scheduling the next run.

**Q: Does `setTimeout(fn, 0)` execute immediately?**
A: No. It queues a macrotask, which runs after all current synchronous code AND all microtasks complete. The actual minimum in browsers is ~4ms due to the HTML spec clamping.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing `setInterval` ID but not clearing on unmount/cleanup | Always `clearInterval(id)` in cleanup/teardown |
| `setInterval` with async callback causing overlapping calls | Use self-scheduling `setTimeout` instead |
| Using timer IDs across scopes without storing them | Store in closure, class property, or ref (React) |

## K — Coding Challenge

**Build a `poll(fn, interval, maxRetries)` that calls `fn` every `interval`ms, stopping after success or max retries:**

```js
await poll(() => checkStatus(jobId), 2000, 10)
```

**Solution:**

```js
async function poll(fn, interval, maxRetries) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn()
    if (result) return result
    await sleep(interval)
  }
  throw new Error("Max retries exceeded")
}
```


***

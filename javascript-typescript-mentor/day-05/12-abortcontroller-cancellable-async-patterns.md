# 12 — `AbortController` & Cancellable Async Patterns

## T — TL;DR

`AbortController` provides a standard way to **cancel** async operations like `fetch` requests, event listeners, and custom async flows — it works through an `AbortSignal` that operations listen to.

## K — Key Concepts

### Basic Structure

```js
const controller = new AbortController()
const signal = controller.signal

// Pass signal to an operation
fetch("/api/data", { signal })

// Cancel the operation
controller.abort()
```

### Cancelling `fetch`

```js
const controller = new AbortController()

// Start the fetch
const promise = fetch("/api/slow-endpoint", {
  signal: controller.signal,
})

// Cancel after 2 seconds
setTimeout(() => controller.abort(), 2000)

try {
  const response = await promise
  const data = await response.json()
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Request was cancelled")
  } else {
    console.error("Request failed:", error)
  }
}
```

### The `AbortSignal`

The signal has:
- `.aborted` — boolean, whether abort has been called
- `.reason` — the reason passed to `.abort()` (or `DOMException` by default)
- Event: `abort` — fires when `.abort()` is called

```js
const controller = new AbortController()
const { signal } = controller

signal.addEventListener("abort", () => {
  console.log("Aborted!", signal.reason)
})

console.log(signal.aborted) // false
controller.abort("User cancelled")
console.log(signal.aborted) // true
console.log(signal.reason)  // "User cancelled"
```

### `AbortSignal.timeout` (Static Helper)

Create a signal that auto-aborts after a timeout:

```js
// Abort after 5 seconds — no manual controller needed
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
})
```

### `AbortSignal.any` (Combining Signals)

```js
const controller = new AbortController()

// Abort if EITHER the manual controller aborts OR 5 seconds pass
const signal = AbortSignal.any([
  controller.signal,
  AbortSignal.timeout(5000),
])

fetch("/api/data", { signal })
```

### Cancelling Event Listeners

```js
const controller = new AbortController()

window.addEventListener("resize", handleResize, {
  signal: controller.signal,
})

window.addEventListener("scroll", handleScroll, {
  signal: controller.signal,
})

// Remove ALL listeners at once:
controller.abort()
// Both resize and scroll listeners are removed
```

This is much cleaner than tracking individual `removeEventListener` calls.

### Cancellable Custom Async Functions

```js
async function pollData(url, intervalMs, signal) {
  while (!signal.aborted) {
    try {
      const response = await fetch(url, { signal })
      const data = await response.json()
      console.log("Polled:", data)
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Polling stopped")
        return
      }
      console.error("Poll error:", error)
    }

    // Wait for the interval (also cancellable)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, intervalMs)
      signal.addEventListener("abort", () => {
        clearTimeout(timeout)
        reject(new DOMException("Aborted", "AbortError"))
      }, { once: true })
    })
  }
}

// Usage:
const controller = new AbortController()

pollData("/api/status", 3000, controller.signal)

// Stop polling after 15 seconds:
setTimeout(() => controller.abort(), 15000)
```

### React Pattern: Abort on Unmount

```js
useEffect(() => {
  const controller = new AbortController()

  async function loadData() {
    try {
      const response = await fetch("/api/data", {
        signal: controller.signal,
      })
      const data = await response.json()
      setData(data)
    } catch (error) {
      if (error.name !== "AbortError") {
        setError(error)
      }
      // AbortError is expected on unmount — ignore it
    }
  }

  loadData()

  return () => controller.abort() // cleanup on unmount
}, [])
```

### Checking Before Proceeding

```js
async function processItems(items, signal) {
  for (const item of items) {
    // Check before each expensive operation
    signal.throwIfAborted() // throws if aborted

    await processItem(item)
  }
}
```

`signal.throwIfAborted()` throws a `DOMException` with name `"AbortError"` if the signal is aborted.

## W — Why It Matters

- **Race conditions** in React: fetching data, user navigates away, old response updates state — `AbortController` prevents this.
- **Memory leaks**: uncleared event listeners and ongoing network requests.
- **User experience**: cancel previous search-as-you-type requests when the user types more.
- **Timeouts**: `AbortSignal.timeout` is the cleanest timeout pattern for `fetch`.
- Modern APIs (`fetch`, `addEventListener`, streams) all support `AbortSignal`.

## I — Interview Questions with Answers

### Q1: What is `AbortController` used for?

**A:** Cancelling async operations — primarily `fetch` requests, but also event listeners, streams, and custom async flows. You create a controller, pass its `signal` to the operation, and call `controller.abort()` to cancel.

### Q2: How do you detect if an error was caused by an abort?

**A:** Check `error.name === "AbortError"`. This is a standard `DOMException` that `fetch` and other APIs throw when aborted.

### Q3: How do you cancel a fetch on component unmount in React?

**A:** Create an `AbortController` in `useEffect`, pass the signal to `fetch`, and call `controller.abort()` in the cleanup function.

### Q4: What is `AbortSignal.timeout`?

**A:** A static method that creates a signal which auto-aborts after the specified milliseconds. It's the cleanest way to add a timeout to `fetch` without manual `setTimeout` and `Promise.race`.

## C — Common Pitfalls with Fix

### Pitfall: Reusing an aborted controller

```js
const controller = new AbortController()
controller.abort()
// controller.signal.aborted === true — permanently aborted!

fetch("/api/data", { signal: controller.signal })
// Immediately throws AbortError!
```

**Fix:** Create a **new** `AbortController` for each operation or lifecycle.

### Pitfall: Not checking for `AbortError` specifically

```js
catch (error) {
  showErrorToast(error.message) // shows "The user aborted a request" — confusing!
}
```

**Fix:**

```js
catch (error) {
  if (error.name === "AbortError") return // expected, ignore
  showErrorToast(error.message)
}
```

### Pitfall: Forgetting to cancel in React cleanup

```js
useEffect(() => {
  fetchData().then(setData) // no abort on unmount → race condition!
}, [])
```

**Fix:** Always return a cleanup that calls `controller.abort()`.

### Pitfall: Not making custom async functions cancellation-aware

```js
async function loadAll(urls) {
  // No signal support — can't be cancelled
  for (const url of urls) {
    await fetch(url)
  }
}
```

**Fix:** Accept and forward the signal:

```js
async function loadAll(urls, signal) {
  for (const url of urls) {
    signal?.throwIfAborted()
    await fetch(url, { signal })
  }
}
```

## K — Coding Challenge with Solution

### Challenge

Create a `searchAsYouType(inputElement, searchFn)` function that:
- Listens for `input` events
- Debounces by 300ms
- Cancels the previous `fetch` when a new keystroke occurs
- Calls `searchFn(query, signal)` with an `AbortSignal`

### Solution

```js
function searchAsYouType(inputElement, searchFn) {
  let controller = null
  let timeoutId = null

  inputElement.addEventListener("input", (event) => {
    const query = event.target.value.trim()

    // Cancel previous request
    controller?.abort()
    clearTimeout(timeoutId)

    if (!query) return

    // Debounce 300ms
    timeoutId = setTimeout(async () => {
      controller = new AbortController()

      try {
        const results = await searchFn(query, controller.signal)
        console.log("Results:", results)
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search failed:", error)
        }
      }
    }, 300)
  })
}

// Usage:
searchAsYouType(
  document.getElementById("search"),
  async (query, signal) => {
    const response = await fetch(`/api/search?q=${query}`, { signal })
    return response.json()
  }
)
```

Features:
- **Debouncing** — only searches after 300ms of no typing
- **Cancellation** — aborts previous request on each new keystroke
- **AbortError filtering** — doesn't show errors for cancelled requests
- **Separation of concerns** — search function is injectable

---

# ✅ Day 5 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | The Event Loop | ✅ T-KWICK |
| 2 | Call Stack | ✅ T-KWICK |
| 3 | Microtasks vs Macrotasks | ✅ T-KWICK |
| 4 | `setTimeout` / `setInterval` | ✅ T-KWICK |
| 5 | `queueMicrotask` | ✅ T-KWICK |
| 6 | Callbacks & Callback Hell | ✅ T-KWICK |
| 7 | Promise Fundamentals | ✅ T-KWICK |
| 8 | Promise Chaining (`.then`/`.catch`/`.finally`) | ✅ T-KWICK |
| 9 | `Promise.all`/`allSettled`/`race`/`any` | ✅ T-KWICK |
| 10 | `async`/`await` | ✅ T-KWICK |
| 11 | Async Error Handling | ✅ T-KWICK |
| 12 | `AbortController` & Cancellable Patterns | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 5` | 5 interview-style problems covering all 12 topics |
| `Generate Day 6` | Full lesson — Memory, WeakRefs & Advanced Data Structures |
| `next topic` | Start Day 6's first subtopic |
| `recap` | Quick Day 5 summary |

> Doing one small thing beats opening a feed.

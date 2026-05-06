# 15 — Debounce

## T — TL;DR

Debounce delays function execution until a specified time has passed **since the last call** — perfect for search inputs, resize handlers, and any rapid-fire event.

## K — Key Concepts

```js
function debounce(fn, delay) {
  let timeoutId

  return function(...args) {
    clearTimeout(timeoutId)         // cancel previous timer on every call
    timeoutId = setTimeout(() => {
      fn.apply(this, args)          // only fires after `delay` ms of silence
    }, delay)
  }
}

// Usage: search input
const searchAPI = (query) => console.log("Searching:", query)
const debouncedSearch = debounce(searchAPI, 300)

// User types fast — only ONE call fires 300ms after they stop
input.addEventListener("input", e => debouncedSearch(e.target.value))

// Timeline visualization:
// User types: h...he...hel...hell...hello
// Calls:      ↓   ↓   ↓    ↓    ↓
// Timers:     X   X   X    X    ✅ fires 300ms after "hello"

// Leading-edge debounce (fires immediately, then ignores for delay)
function debounceLeading(fn, delay) {
  let timeoutId
  return function(...args) {
    if (!timeoutId) fn.apply(this, args)  // fire immediately
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => { timeoutId = null }, delay)
  }
}
```


## W — Why It Matters

Without debounce, a search input fires an API call on every keystroke — potentially 10+ calls per second. Debounce collapses them into one. It's used in virtually every production search, autocomplete, and form validation implementation.

## I — Interview Q&A

**Q: What's the difference between debounce and throttle?**
A: Debounce waits for a **pause** in events (fires after N ms of silence). Throttle fires at a **fixed rate** regardless of how many events occur. Debounce = "wait until they stop." Throttle = "fire at most once per N ms."

**Q: Implement a debounce function.**
A: Store a timer ID. On each call, clear the previous timer and set a new one. The function only executes when the timer completes without being reset.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Debouncing inside a render loop (creates new fn each time) | Create debounced fn once outside render or use `useCallback` |
| Losing `this` context in debounced method | Use `fn.apply(this, args)` inside setTimeout |
| Using debounce for real-time progress feedback | Use throttle instead — debounce delays too long |

## K — Coding Challenge

**Debounce a window resize handler that updates a component's width:**

```js
window.addEventListener("resize", /* your debounced handler */)
```

**Solution:**

```js
function updateWidth() {
  console.log("Width:", window.innerWidth)
}

const handleResize = debounce(updateWidth, 200)
window.addEventListener("resize", handleResize)

// Cleanup
// window.removeEventListener("resize", handleResize)
```


***

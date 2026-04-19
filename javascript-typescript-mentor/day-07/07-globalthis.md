# 7 — `globalThis`

## T — TL;DR

`globalThis` is the **universal reference** to the global object across all JavaScript environments — it replaces the environment-specific `window`, `global`, `self`, and `frames`.

## K — Key Concepts

### The Problem Before `globalThis`

```js
// Browser
window.setTimeout(fn, 100)

// Node.js
global.setTimeout(fn, 100)

// Web Worker
self.setTimeout(fn, 100)

// Which one? Depends on the environment!
```

### The Solution

```js
// Works everywhere:
globalThis.setTimeout(fn, 100)

// In browser: globalThis === window
// In Node.js: globalThis === global
// In Web Worker: globalThis === self
```

### Common Use Cases

```js
// Check environment
const isBrowser = typeof globalThis.window !== "undefined"
const isNode = typeof globalThis.process !== "undefined"

// Polyfill a feature
if (!globalThis.structuredClone) {
  globalThis.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
}

// Cross-environment globals
globalThis.APP_CONFIG = { debug: true }
```

### Feature Detection

```js
// Check if Web Crypto is available
if (globalThis.crypto?.subtle) {
  // Use Web Crypto API
}

// Check if fetch is available
if (typeof globalThis.fetch === "function") {
  // Use native fetch
} else {
  // Polyfill or use node-fetch
}
```

## W — Why It Matters

- `globalThis` enables truly **universal JavaScript** — code that runs in browsers, Node.js, Deno, workers, etc.
- Libraries and polyfills use `globalThis` to work across environments.
- Replaces the hacky `typeof window !== "undefined" ? window : global` pattern.
- Essential for isomorphic/universal JavaScript applications.

## I — Interview Questions with Answers

### Q1: What is `globalThis`?

**A:** A universal reference to the global object that works in every JavaScript environment. It's `window` in browsers, `global` in Node.js, and `self` in web workers — `globalThis` is the standard, environment-agnostic way to access it.

### Q2: When would you use `globalThis`?

**A:** For feature detection, polyfilling, and writing environment-agnostic code. Example: checking if `crypto.subtle` exists before using the Web Crypto API.

## C — Common Pitfalls with Fix

### Pitfall: Polluting the global namespace

```js
globalThis.myVar = "accessible everywhere" // creates a true global
```

**Fix:** Avoid adding to `globalThis` in application code. Use modules for state. Reserve `globalThis` for polyfills and environment detection.

### Pitfall: Assuming `globalThis` has specific APIs

```js
globalThis.document.querySelector("div") // TypeError in Node.js!
```

**Fix:** Always feature-detect: `if (globalThis.document) { ... }`.

## K — Coding Challenge with Solution

### Challenge

Write a universal `getEnvironment()` function that returns `"browser"`, `"node"`, `"worker"`, or `"unknown"`:

### Solution

```js
function getEnvironment() {
  if (typeof globalThis.window !== "undefined" && typeof globalThis.document !== "undefined") {
    return "browser"
  }
  if (typeof globalThis.process !== "undefined" && globalThis.process.versions?.node) {
    return "node"
  }
  if (typeof globalThis.WorkerGlobalScope !== "undefined") {
    return "worker"
  }
  return "unknown"
}
```

---

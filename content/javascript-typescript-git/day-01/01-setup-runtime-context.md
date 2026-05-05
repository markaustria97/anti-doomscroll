# 1 — Setup & Runtime Context

## T — TL;DR

JavaScript runs in two main environments — the **browser** and **Node.js** — and knowing which one you're in changes what globals and APIs are available.

## K — Key Concepts

```js
// Check environment
typeof window !== 'undefined'   // browser
typeof process !== 'undefined'  // Node.js

// Universal global (ES2020+)
globalThis.myVar = 42           // works in both browser and Node.js
```

- **Browser**: `window`, `document`, `localStorage`, `fetch`
- **Node.js**: `process`, `__dirname`, `__filename`, `require`
- **`globalThis`**: the unified way to access the global object regardless of environment


## W — Why It Matters

You'll often write isomorphic code (runs in both environments). Knowing the runtime prevents "window is not defined" crashes in SSR (Next.js, Remix) and "document is not defined" errors in Node scripts.

## I — Interview Q&A

**Q: What is `globalThis` and why was it introduced?**
A: `globalThis` is a standardized reference to the global object across all JS environments. Before it, you'd write `typeof window !== 'undefined' ? window : global` which was fragile. `globalThis` solves this in one line.

**Q: What's the difference between the browser runtime and Node.js?**
A: Browser provides DOM/BOM APIs. Node provides OS-level APIs (file system, process, networking). Both run the V8 engine but expose different globals and built-ins.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `window` in Node.js code | Use `globalThis` instead |
| Using `process.env` in browser without bundler | Use a bundler (Vite/Webpack) or `import.meta.env` |
| Assuming `this` at top level is `window` | In strict mode or ESM, top-level `this` is `undefined` |

## K — Coding Challenge

**What does this log in Node.js vs the browser?**

```js
console.log(typeof window)
console.log(typeof process)
console.log(globalThis === window)  // browser only
```

**Solution:**

```js
// Node.js:
typeof window   // "undefined"
typeof process  // "object"

// Browser:
typeof window   // "object"
typeof process  // "undefined"
globalThis === window  // true
```


***

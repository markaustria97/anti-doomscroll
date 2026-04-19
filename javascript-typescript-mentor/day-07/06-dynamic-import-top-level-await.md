# 6 — Dynamic `import()` & Top-Level `await`

## T — TL;DR

Dynamic `import()` loads modules **at runtime** as Promises, enabling code splitting and conditional loading; top-level `await` lets you use `await` outside of `async` functions in ESM modules.

## K — Key Concepts

### Dynamic `import()`

```js
// Static import — always loaded, parsed at compile time
import { add } from "./math.js"

// Dynamic import — loaded at runtime, returns a Promise
const module = await import("./math.js")
module.add(1, 2) // 3
```

### Conditional Loading

```js
const locale = getUserLocale()

// Only load the translation file that's needed
const translations = await import(`./locales/${locale}.js`)
```

### Lazy Loading (Code Splitting)

```js
button.addEventListener("click", async () => {
  // Only loads the heavy chart library when the user clicks
  const { renderChart } = await import("./chart-library.js")
  renderChart(data)
})
```

Bundlers (Webpack, Vite, Rollup) automatically split dynamic imports into separate chunks.

### Feature Detection

```js
let crypto
try {
  crypto = await import("node:crypto")
} catch {
  console.log("Crypto not available")
}
```

### Default and Named Exports with Dynamic Import

```js
// Named exports
const { add, subtract } = await import("./math.js")

// Default export
const { default: main } = await import("./app.js")
// or
const mod = await import("./app.js")
mod.default()
```

### Top-Level `await`

In ESM modules, you can use `await` at the top level:

```js
// config.js (ESM)
const response = await fetch("/api/config")
export const config = await response.json()

// The module that imports this will wait for it to resolve:
import { config } from "./config.js"
console.log(config) // already resolved
```

### How Top-Level `await` Affects Module Loading

```js
// slow-module.js
await new Promise(resolve => setTimeout(resolve, 5000))
export const value = "ready"

// main.js
import { value } from "./slow-module.js"
// This line doesn't execute until slow-module finishes (5 seconds)
console.log(value) // "ready"
```

**Important:** Top-level `await` blocks the importing module (and its importers) until complete. Use judiciously.

### Requirements

| Feature | Requirements |
|---------|-------------|
| Dynamic `import()` | Any module type (ESM, CJS via bundler, browser) |
| Top-level `await` | ESM only (`"type": "module"` or `.mjs`) |

## W — Why It Matters

- **Code splitting** via dynamic import reduces initial bundle size — critical for web performance.
- **Lazy loading** defers heavy modules until they're needed — faster page loads.
- **Conditional loading** lets you load polyfills or locale-specific code on demand.
- **Top-level `await`** simplifies module initialization that depends on async data.
- React's `React.lazy` and Next.js's `dynamic()` are built on dynamic `import()`.

## I — Interview Questions with Answers

### Q1: What does dynamic `import()` return?

**A:** A `Promise` that resolves to the module's namespace object (containing all exports). Default exports are available as `.default`.

### Q2: What is the main benefit of dynamic import for web apps?

**A:** **Code splitting.** Bundlers automatically create separate chunks for dynamically imported modules, reducing the initial bundle size and improving load time.

### Q3: What are the constraints of top-level `await`?

**A:** Only works in ESM (not CJS). Blocks the importing module and its dependents until the `await` resolves. Can delay application startup if used carelessly.

## C — Common Pitfalls with Fix

### Pitfall: Dynamic import paths must be valid for bundlers

```js
const name = "math"
import(`./${name}.js`) // Bundlers may not be able to analyze this!
```

**Fix:** Keep dynamic import paths as explicit as possible. Use `/* webpackChunkName: "math" */` comments for Webpack.

### Pitfall: Top-level `await` blocking startup

```js
// config.js
const config = await fetch("/api/config").then(r => r.json())
// If the fetch fails or is slow, EVERYTHING that imports this module stalls
```

**Fix:** Add error handling and timeouts. Consider whether the data truly needs to be loaded before the module is available.

### Pitfall: Using dynamic import in CJS without `.then()`

```js
// CJS file
const mod = import("./esm-module.mjs") // This is a Promise!
mod.doSomething // undefined — it's a Promise, not the module
```

**Fix:** `import("./esm-module.mjs").then(mod => mod.doSomething())`.

## K — Coding Challenge with Solution

### Challenge

Create a `loadPlugin(name)` function that dynamically imports a plugin module and calls its `init()` function. Handle missing plugins gracefully.

### Solution

```js
async function loadPlugin(name) {
  try {
    const plugin = await import(`./plugins/${name}.js`)

    if (typeof plugin.init !== "function") {
      console.warn(`Plugin "${name}" has no init() function`)
      return null
    }

    await plugin.init()
    console.log(`Plugin "${name}" loaded successfully`)
    return plugin
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.warn(`Plugin "${name}" not found`)
    } else {
      console.error(`Failed to load plugin "${name}":`, error)
    }
    return null
  }
}

// Usage:
await loadPlugin("analytics")
await loadPlugin("nonexistent") // "Plugin "nonexistent" not found"
```

---

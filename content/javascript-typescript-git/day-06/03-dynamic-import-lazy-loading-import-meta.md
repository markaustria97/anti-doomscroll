# 3 — Dynamic Import, Lazy Loading & `import.meta`

## T — TL;DR

Dynamic `import()` returns a Promise — enabling code-splitting, conditional loading, and lazy loading of heavy modules only when needed.

## K — Key Concepts

```js
// Static import — always loaded at startup
import { Chart } from "./Chart.js"

// Dynamic import — loaded on demand, returns Promise
const loadChart = async () => {
  const { Chart } = await import("./Chart.js")  // splits bundle!
  return new Chart()
}

// Conditional loading
async function loadPolyfill() {
  if (!("IntersectionObserver" in window)) {
    await import("intersection-observer")  // only load if needed
  }
}

// Route-based lazy loading (React pattern)
const Dashboard = lazy(() => import("./Dashboard.jsx"))
// Vite/webpack splits this into a separate chunk

// Named exports from dynamic import
const { add, multiply } = await import("./math.js")

// Default export from dynamic import
const { default: Chart } = await import("./Chart.js")
// or
const ChartModule = await import("./Chart.js")
ChartModule.default  // the default export

// import.meta — module-specific metadata (ESM only)
import.meta.url      // "file:///home/user/project/index.js" (Node.js)
                     // "http://localhost:3000/index.js" (browser)

// __dirname equivalent in ESM
import { fileURLToPath } from "url"
import { dirname, join } from "path"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = join(__dirname, "config.json")

// import.meta.env (Vite)
import.meta.env.VITE_API_URL      // env variables in browser builds
import.meta.env.MODE               // "development" | "production"

// import.meta.resolve — resolve module specifier to URL
const url = import.meta.resolve("./utils.js")
```


## W — Why It Matters

Dynamic `import()` is what powers code splitting in Vite, Webpack, and Next.js — reducing initial bundle size by loading heavy modules only when actually needed. `import.meta.url` replaces the `__dirname`/`__filename` globals that don't exist in ES Modules.

## I — Interview Q&A

**Q: What does dynamic `import()` return?**
A: A Promise that resolves to the module's namespace object — an object with all the module's exports as properties, including `default` for the default export.

**Q: Why can't you use `__dirname` in ESM?**
A: `__dirname` and `__filename` are injected by the CJS wrapper — they don't exist in ESM. Use `import.meta.url` to get the current file's URL, then `fileURLToPath` and `dirname` to reconstruct the path.

## C — Common Pitfills

| Pitfall | Fix |
| :-- | :-- |
| Dynamic import not splitting the bundle | Ensure your bundler (Vite/Webpack) is configured for code splitting |
| `import.meta.url` failing in CJS | ESM-only — convert file to ESM or use `__filename` in CJS |
| `await import()` in a non-async context | Wrap in `async` function or use `.then()` |
| Dynamic import paths being fully dynamic (template literal) | Bundlers can't analyze `import(variable)` — use partial paths like `import("./icons/" + name + ".js")` |

## K — Coding Challenge

**Lazy-load a heavy `pdfGenerator` module only when the user clicks "Export PDF":**

```js
exportButton.addEventListener("click", async () => {
  // load pdfGenerator only now
})
```

**Solution:**

```js
exportButton.addEventListener("click", async () => {
  const { generatePDF } = await import("./pdfGenerator.js")
  const blob = await generatePDF(document.getElementById("report"))
  downloadBlob(blob, "report.pdf")
})
```


***

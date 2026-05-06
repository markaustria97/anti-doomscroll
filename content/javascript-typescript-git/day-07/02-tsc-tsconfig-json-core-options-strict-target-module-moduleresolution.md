# 2 — `tsc`, `tsconfig.json` Core Options: `strict`, `target`, `module`, `moduleResolution`

## T — TL;DR

`tsconfig.json` is the master config file — `strict` enables all safety checks at once, `target` controls output JS version, `module` controls import/export format, and `moduleResolution` controls how imports are resolved.

## K — Key Concepts

```json
// tsconfig.json — 2025 recommended baseline
{
  "compilerOptions": {
    // ── Type Checking ────────────────────────────────────
    "strict": true,                    // enables ALL strict family flags
    "noUncheckedIndexedAccess": true,  // arr becomes T | undefined
    "noImplicitOverride": true,        // must use `override` keyword in subclasses
    "noFallthroughCasesInSwitch": true,// switch cases must break/return
    "noUnusedLocals": true,            // error on unused variables
    "noUnusedParameters": true,        // error on unused function params

    // ── Output ───────────────────────────────────────────
    "target": "ES2022",     // output JS version (es5, es6, ES2022, ESNext)
    "lib": ["ES2023", "DOM", "DOM.Iterable"],  // type definitions included
    "outDir": "./dist",     // compiled files go here
    "rootDir": "./src",     // source files root

    // ── Modules ──────────────────────────────────────────
    "module": "ESNext",              // output module format (CommonJS, ESNext, NodeNext)
    "moduleResolution": "Bundler",   // how imports are resolved (Node, NodeNext, Bundler)
    "resolveJsonModule": true,       // allows `import data from "./data.json"`
    "verbatimModuleSyntax": true,    // type imports must use `import type`

    // ── Interop ──────────────────────────────────────────
    "esModuleInterop": true,         // allows `import fs from "fs"` (not just `import * as fs`)
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,         // each file compiled independently (required by Vite, esbuild)
    "skipLibCheck": true,            // skip type-checking .d.ts in node_modules (speeds up build)
    "forceConsistentCasingInFileNames": true,  // prevent case bugs on case-insensitive OSes

    // ── Emit ─────────────────────────────────────────────
    "noEmit": false,        // true = type-check only, no JS output (great with bundlers)
    "noEmitOnError": true,  // don't write output if there are type errors
    "declaration": true,    // generate .d.ts declaration files
    "sourceMap": true       // generate .map files for debugging
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```bash
# Running tsc
npx tsc              # compile using tsconfig.json
npx tsc --noEmit     # type-check only, no files written
npx tsc --watch      # watch mode
npx tsc --init       # generate a starter tsconfig.json
```


## W — Why It Matters

`moduleResolution: "Bundler"` is the modern choice for Vite/esbuild projects — it matches what bundlers actually do (no extension required on imports). `isolatedModules: true` ensures every file can be transpiled independently, which is required by fast transpilers like esbuild and SWC.

## I — Interview Q&A

**Q: What does `noEmit: true` do and when would you use it?**
A: It tells TypeScript to perform type checking but write no output files. Use this when a bundler (Vite, esbuild) handles transpilation — you only want TypeScript for its type checking, not its compiler output.

**Q: What's the difference between `moduleResolution: "Node"` vs `"Bundler"` vs `"NodeNext"`?**
A: `Node` (legacy) mimics Node.js CommonJS resolution. `NodeNext` matches Node.js ESM resolution — requires explicit extensions in imports. `Bundler` matches modern bundlers like Vite/webpack that don't require extensions and resolve `package.json` exports. Use `Bundler` for Vite projects, `NodeNext` for Node.js ESM projects.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `"strict": false` on a new project | Start with `strict: true` — much harder to enable later |
| `skipLibCheck: false` causing slow builds | `skipLibCheck: true` in most apps — only check your own code |
| `target: "ES5"` in a modern project | Use `ES2022` or `ESNext` unless you need IE11 support |
| `isolatedModules: false` with Vite/esbuild | Always set `true` — these tools require it |

## K — Coding Challenge

**What's wrong with this tsconfig for a Vite project?**

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "isolatedModules": false,
    "noEmit": false
  }
}
```

**Solution:**

```json
{
  "compilerOptions": {
    "module": "ESNext",          // Vite uses ESM, not CJS
    "moduleResolution": "Bundler", // match Vite's resolution
    "isolatedModules": true,     // required for esbuild transpilation
    "noEmit": true               // Vite handles bundling, not tsc
  }
}
```


***

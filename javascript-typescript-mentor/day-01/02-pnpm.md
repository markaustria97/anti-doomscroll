# pnpm

## T — TL;DR
`pnpm` is a package manager for Node projects. Its main strengths are fast installs, disk efficiency, and stricter dependency boundaries.

## K — Key Concepts
- `pnpm` stores downloaded packages once and links them into projects.
- Its dependency layout makes undeclared dependency mistakes easier to catch.
- You still use the same basic workflow: install packages, run scripts, and commit the lockfile.

## W — Why it matters
Package management is part of everyday engineering work. If you trust your package manager, project setup becomes calmer and dependency bugs become easier to explain.

## I — Interview questions with answers
- **Q:** How is `pnpm` different from npm at a high level?  
  **A:** It uses a content-addressable store and links packages into projects instead of copying full dependency trees repeatedly.
- **Q:** Why is the lockfile important?  
  **A:** It helps everyone install the same dependency graph, which reduces machine-specific surprises.

## C — Common pitfalls with fix
- Deleting the lockfile casually. — **Fix:** treat `pnpm-lock.yaml` as part of the project state.
- Importing packages that were never declared directly. — **Fix:** add every direct import to `dependencies` or `devDependencies`.

## K — Coding challenge with solution
**Challenge:** Add a runtime dependency and one script to a Node project.

**Solution:**
```json
{
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "zod": "^4.0.0"
  }
}
```

**Why it works:** `pnpm` will install `zod` from `dependencies`, and `pnpm start` will run the `start` script.

## Next topic
[ESLint](03-eslint.md)

## One tiny action
Say this once: if my code imports it directly, I should declare it directly.

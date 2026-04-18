# Node.js LTS

## T — TL;DR
Use an LTS version of Node.js unless you have a specific reason not to. LTS is the stable default for learning, tooling, and production work.

## K — Key Concepts
- LTS means Long-Term Support: more time for security fixes and maintenance.
- Your Node version affects built-in APIs, package compatibility, and local scripts.
- Teams usually pin one version so local development and CI behave the same way.

## W — Why it matters
A lot of setup pain is really version mismatch. If your runtime is inconsistent, installs and scripts can fail for reasons unrelated to the concept you are trying to learn.

## I — Interview questions with answers
- **Q:** Why choose Node.js LTS over the newest release?  
  **A:** Because LTS is the safer default: it has longer support and better ecosystem compatibility.
- **Q:** What problem does pinning a Node version solve?  
  **A:** It reduces environment drift between developers, CI, and deployment.

## C — Common pitfalls with fix
- Installing the newest version just because it is newer. — **Fix:** start with LTS unless a tool or dependency requires something else.
- Letting everyone use a different Node version. — **Fix:** pin it with `.nvmrc`, Volta, or the `engines` field.

## K — Coding challenge with solution
**Challenge:** Show how a project can declare the Node version it expects.

**Solution:**
```json
{
  "engines": {
    "node": ">=22 <23"
  }
}
```

**Why it works:** The `engines` field documents the expected runtime so teammates and tooling know which major version the project targets.

## Next topic
[pnpm](02-pnpm.md)

## One tiny action
Run `node -v` and check whether your major version is an active LTS release.

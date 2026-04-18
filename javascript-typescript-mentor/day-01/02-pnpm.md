# pnpm

## T — TL;DR
**pnpm** should make daily work smoother, not more complicated. Learn the smallest setup that gives you a clear benefit right away.

## K — Key Concepts
- Use **pnpm** for one concrete job before adding extra configuration.
- Keep the setup small enough that you can explain every line.
- Good tooling removes friction; it does not replace testing or design.

## W — Why it matters
When **pnpm** is set up well, it quietly saves attention every day. That is valuable when you only have a short learning window.

## I — Interview questions with answers
- **Q:** What problem does pnpm solve?  
  **A:** Answer with one concrete workflow problem, not a marketing description.
- **Q:** What is a good default setup for pnpm?  
  **A:** Choose the smallest configuration that produces visible value and is easy to maintain.

## C — Common pitfalls with fix
- Adding too much configuration too early. — **Fix:** start with the smallest working setup.
- Expecting tooling to fix architecture or tests. — **Fix:** use the tool for its specific job only.

## K — Coding challenge with solution
**Challenge:** Write the smallest setup or command that proves **pnpm** is working for you.

**Solution:**
```bash
pnpm add zod
pnpm install
pnpm test
```

**Why it works:** This works because it shows the smallest visible payoff from **pnpm** without hiding the setup behind extra tooling decisions.
## Next topic
[ESLint](03-eslint.md)

## One tiny action
Open a scratch note and write one sentence: 'I use **pnpm** to ___.'

# Prettier

## T — TL;DR
**Prettier** should make daily work smoother, not more complicated. Learn the smallest setup that gives you a clear benefit right away.

## K — Key Concepts
- Use **Prettier** for one concrete job before adding extra configuration.
- Keep the setup small enough that you can explain every line.
- Good tooling removes friction; it does not replace testing or design.

## W — Why it matters
When **Prettier** is set up well, it quietly saves attention every day. That is valuable when you only have a short learning window.

## I — Interview questions with answers
- **Q:** What problem does Prettier solve?  
  **A:** Answer with one concrete workflow problem, not a marketing description.
- **Q:** What is a good default setup for Prettier?  
  **A:** Choose the smallest configuration that produces visible value and is easy to maintain.

## C — Common pitfalls with fix
- Adding too much configuration too early. — **Fix:** start with the smallest working setup.
- Expecting tooling to fix architecture or tests. — **Fix:** use the tool for its specific job only.

## K — Coding challenge with solution
**Challenge:** Write the smallest setup or command that proves **Prettier** is working for you.

**Solution:**
```bash
pnpm prettier --write src/**/*.ts
```

**Why it works:** This works because it shows the smallest visible payoff from **Prettier** without hiding the setup behind extra tooling decisions.
## Next topic
[var / let / const](05-var-let-const.md)

## One tiny action
Open a scratch note and write one sentence: 'I use **Prettier** to ___.'

# Prettier

## T — TL;DR
Prettier is an automatic code formatter. Its job is to remove formatting decisions so you can spend your attention on logic.

## K — Key Concepts
- Prettier rewrites code into a consistent style.
- It is intentionally opinionated so teams stop arguing about whitespace and commas.
- Prettier changes formatting, not program behavior.

## W — Why it matters
Formatting debates are low-value work. Prettier makes code look consistent automatically, which lets reviews focus on correctness and design.

## I — Interview questions with answers
- **Q:** Why use Prettier if editors can format code already?  
  **A:** Because Prettier gives the whole team the same output, not just one person's editor settings.
- **Q:** Should Prettier replace ESLint?  
  **A:** No. Prettier handles formatting. ESLint handles suspicious or undesirable code patterns.

## C — Common pitfalls with fix
- Expecting Prettier to catch bugs. — **Fix:** use it for formatting only.
- Reformatting code manually after Prettier runs. — **Fix:** trust the formatter and keep the project consistent.

## K — Coding challenge with solution
**Challenge:** Create a tiny Prettier config that prefers semicolons and single quotes.

**Solution:**
```json
{
  "semi": true,
  "singleQuote": true
}
```

**Why it works:** This config gives Prettier two formatting rules to apply consistently across the project.

## Next topic
[var / let / const](05-var-let-const.md)

## One tiny action
Think of one formatting choice you would rather never decide manually again.

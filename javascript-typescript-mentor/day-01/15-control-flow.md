# control flow

## T — TL;DR
Control flow is how your program decides what runs next. Good control flow is usually simple: clear conditions, early exits, and easy-to-scan branches.

## K — Key Concepts
- `if`, `else`, `switch`, loops, `break`, `continue`, and `return` all shape execution order.
- Early returns often reduce nesting.
- Clear branches make invalid states easier to see.

## W — Why it matters
Messy control flow creates bugs even when each line is technically valid. Clean branching makes code easier to debug, review, and change.

## I — Interview questions with answers
- **Q:** Why are early returns often preferred?  
  **A:** They remove nesting and make edge cases visible first.
- **Q:** When is `switch` useful?  
  **A:** When one value determines several clear, named branches.

## C — Common pitfalls with fix
- Nesting too many `if` blocks. — **Fix:** return early for invalid or special cases.
- Writing branches that overlap. — **Fix:** list the cases before coding them.

## K — Coding challenge with solution
**Challenge:** Rewrite a function so invalid input exits early.

**Solution:**
```js
function greet(name) {
  if (!name) return 'Missing name'
  return `Hello, ${name}`
}
```

**Why it works:** The edge case is handled first, so the happy path stays flat.

## Next topic
[try / catch / finally](16-try-catch-finally.md)

## One tiny action
Take one nested condition and ask whether an early return would flatten it.

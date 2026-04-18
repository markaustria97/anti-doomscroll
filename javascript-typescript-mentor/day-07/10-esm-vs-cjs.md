# ESM vs CJS

## TL;DR
ESM vs CJS compares similar ideas that behave differently in practice. Learn the safer default, the key difference in behavior, and the common bug that appears when people treat them as interchangeable. This is the kind of distinction interviewers love to probe.

## Key Concepts
- ESM vs CJS puts similar-looking concepts side by side so you can separate syntax from behavior.
- Look for the one behavior difference that changes correctness, readability, or compatibility.
- Interviews often ask for the default choice and the edge case where another option is better.
- When in doubt, choose the option with the most explicit and least surprising behavior.

## Why It Matters
ESM vs CJS matters because similar-looking options often fail in different ways. The faster you can explain the behavior difference, the easier it is to choose the safe default and debug edge cases under pressure.

## Syntax / Example
```js
import { readFile } from "node:fs/promises"
const pkg = require("./package.json")
```

## Common Pitfalls
- Remembering the syntax but not the behavior difference that actually matters.
- Choosing the shorter form even when the more explicit form is safer.
- Answering interview questions with rules of thumb but no example.

## Interview Angle
- **Q:** What is the practical difference in ESM vs CJS?  
  **A:** Explain the behavior difference, then state the safer default and one case where the alternative is useful.
- **Q:** Which option in ESM vs CJS would you choose by default?  
  **A:** Pick the option with the least surprising behavior and justify it with a small example.

## Mini Challenge
Write two tiny examples that demonstrate the difference in ESM vs CJS.

## Mini Challenge Solution
A correct solution shows different outputs or behaviors, then states the safer default in one sentence.

## Related Topics
- Previous: [Symbol.hasInstance](09-symbol-has-instance.md)
- Next: [dynamic import()](11-dynamic-import.md)

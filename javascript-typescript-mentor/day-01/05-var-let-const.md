# var / let / const

## T — TL;DR
Use `const` by default, `let` when reassignment is required, and avoid `var` in modern code. The main idea is scope plus reassignment, not just keyword trivia.

## K — Key Concepts
- `var` is function-scoped and can be re-declared.
- `let` is block-scoped and can be reassigned.
- `const` is block-scoped and cannot be rebound, but referenced objects can still be mutated.

## W — Why it matters
Your choice of declaration tells readers whether a binding should change. That improves readability and helps reviewers spot accidental mutation sooner.

## I — Interview questions with answers
- **Q:** Why is `const` the usual default?  
  **A:** It communicates that the binding should not point to a different value later.
- **Q:** Does `const` make objects immutable?  
  **A:** No. It prevents rebinding the variable, not mutating the object's contents.

## C — Common pitfalls with fix
- Thinking `const` freezes arrays or objects. — **Fix:** remember it protects the binding, not nested data.
- Using `var` in places where block scope matters. — **Fix:** prefer `let` or `const`.

## K — Coding challenge with solution
**Challenge:** Write code where a counter changes, but a config object should keep the same binding.

**Solution:**
```js
const config = { step: 2 }
let count = 0
count += config.step
```

**Why it works:** `count` needs reassignment, so `let` is correct. `config` should keep the same reference, so `const` expresses that intent.

## Next topic
[primitives vs objects](06-primitives-vs-objects.md)

## One tiny action
Pick one variable in your head and ask: will I reassign this binding later?

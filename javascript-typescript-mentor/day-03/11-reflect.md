# Reflect

## TL;DR
Reflect explains how JavaScript objects really behave under the hood. The key is to connect the surface syntax to prototypes, internal slots, or language hooks so you can debug behavior instead of memorizing folklore.

## Key Concepts
- Reflect is easier once you think in objects, prototypes, and internal language hooks.
- JavaScript classes are built on top of prototype-based behavior.
- Dynamic features are powerful, but they can also make debugging harder if overused.
- Know where the lookup or binding rule comes from instead of memorizing special cases.

## Why It Matters
This matters in day-to-day engineering because Reflect affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
const user = {}
Reflect.set(user, "name", "Ada")
console.log(Reflect.get(user, "name"))
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is Reflect?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Reflect in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Reflect.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [Proxy](10-proxy.md)
- Next: [practical metaprogramming](12-practical-metaprogramming.md)

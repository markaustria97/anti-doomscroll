# Temporal Dead Zone

## TL;DR
Temporal Dead Zone sits at the heart of how JavaScript functions execute and how names are resolved. Once you understand the underlying scope and function rules, a lot of confusing runtime behavior becomes predictable.

## Key Concepts
- Temporal Dead Zone depends on how JavaScript creates function objects and scope records.
- A variable name only makes sense relative to the scope where it is looked up.
- Hoisting changes availability rules, but not always initialization timing.
- Closures are not magic storage; they are just functions retaining access to outer bindings.

## Why It Matters
This matters in day-to-day engineering because Temporal Dead Zone affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
// console.log(count) // ReferenceError
let count = 1
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is Temporal Dead Zone?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Temporal Dead Zone in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Temporal Dead Zone.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [hoisting](09-hoisting.md)
- Next: [strict mode](11-strict-mode.md)

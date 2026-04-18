# nullish coalescing

## TL;DR
Nullish coalescing is a core JavaScript idea worth learning as a mental model first and a syntax feature second. Once you know what the language or runtime is doing, it becomes much easier to write deliberate code and explain your decisions.

## Key Concepts
- Nullish coalescing is best understood through behavior, not memorized definitions.
- Start with the runtime or type-system mental model.
- Use the most explicit form that matches your intent.
- Watch the edge cases that show up in interviews and production bugs.

## Why It Matters
This matters in day-to-day engineering because nullish coalescing affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
const port = process.env.PORT ?? 3000
// unlike ||, 0 is kept
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is nullish coalescing?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use nullish coalescing in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand nullish coalescing.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [optional chaining](12-optional-chaining.md)
- Next: [void operator](14-void-operator.md)

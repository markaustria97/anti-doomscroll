# Error.cause

## TL;DR
Error.cause is a core JavaScript idea worth learning as a mental model first and a syntax feature second. Once you know what the language or runtime is doing, it becomes much easier to write deliberate code and explain your decisions.

## Key Concepts
- Error.cause is best understood through behavior, not memorized definitions.
- Start with the runtime or type-system mental model.
- Use the most explicit form that matches your intent.
- Watch the edge cases that show up in interviews and production bugs.

## Why It Matters
This matters in day-to-day engineering because Error.cause affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
try {
  loadConfig()
} catch (error) {
  throw new Error("App startup failed", { cause: error })
}
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is Error.cause?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Error.cause in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Error.cause.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [built-in Error types](17-built-in-error-types.md)
- Next: [throw](19-throw.md)

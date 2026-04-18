# typed CLI task runner

## TL;DR
Typed CLI task runner pulls together multiple JavaScript and TypeScript ideas into a system-level skill. Use it to practice design trade-offs, naming, boundaries, and failure handling instead of isolated syntax tricks.

## Key Concepts
- Typed CLI task runner combines language features, typing, and system design choices.
- Focus on boundaries, error handling, and naming before polishing implementation details.
- A strong answer explains trade-offs, not just one possible implementation.
- This is where interview prep starts looking like real engineering work.

## Why It Matters
This topic matters because interview prep is strongest when it resembles actual system design work. Typed CLI task runner forces you to balance correctness, maintainability, and communication instead of only writing syntax-level answers.

## Syntax / Example
```ts
type CommandMap = { build: { watch?: boolean }; test: { coverage?: boolean } }
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is typed CLI task runner?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use typed CLI task runner in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand typed CLI task runner.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [type-safe in-memory event bus](02-type-safe-in-memory-event-bus.md)
- Next: [typed HTTP client wrapper with Result types](04-typed-http-client-wrapper-with-result-types.md)

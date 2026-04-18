# when to prefer Map/Set

## TL;DR
When to prefer Map/Set is part of the everyday toolkit for shaping data, unpacking values, and iterating clearly. Focus on what it returns, whether it copies or mutates, and what kind of input it expects. Small data APIs like this pay off constantly in production code.

## Key Concepts
- When to prefer Map/Set helps you shape values, iterate data, or preserve structure with less manual code.
- Know whether it copies data, keeps references, or changes how values are unpacked.
- Small data helpers compound into much cleaner business logic.
- A precise built-in is usually safer than ad hoc transformation code.

## Why It Matters
Data-heavy code is easier to maintain when each transformation is obvious. When to prefer Map/Set helps you express common object, array, string, or iteration work with less manual bookkeeping and fewer off-by-one mistakes.

## Syntax / Example
```js
const seenIds = new Set()
const byId = new Map()
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is when to prefer Map/Set?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use when to prefer Map/Set in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand when to prefer Map/Set.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [Set](39-set.md)
- Next: [event loop](../day-05/01-event-loop.md)

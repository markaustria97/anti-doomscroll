# Set

## TL;DR
Set is part of the everyday toolkit for shaping data, unpacking values, and iterating clearly. Focus on what it returns, whether it copies or mutates, and what kind of input it expects. Small data APIs like this pay off constantly in production code.

## Key Concepts
- Set helps you shape values, iterate data, or preserve structure with less manual code.
- Know whether it copies data, keeps references, or changes how values are unpacked.
- Small data helpers compound into much cleaner business logic.
- A precise built-in is usually safer than ad hoc transformation code.

## Why It Matters
Data-heavy code is easier to maintain when each transformation is obvious. Set helps you express common object, array, string, or iteration work with less manual bookkeeping and fewer off-by-one mistakes.

## Syntax / Example
```js
const tags = new Set(["js", "js", "ts"])
console.log(tags.size) // 2
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is Set?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Set in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Set.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [Map](38-map.md)
- Next: [when to prefer Map/Set](40-when-to-prefer-map-set.md)

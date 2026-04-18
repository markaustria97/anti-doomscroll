# Symbol.toPrimitive

## TL;DR
Symbol.toPrimitive explains how JavaScript objects really behave under the hood. The key is to connect the surface syntax to prototypes, internal slots, or language hooks so you can debug behavior instead of memorizing folklore.

## Key Concepts
- Symbol.toPrimitive is easier once you think in objects, prototypes, and internal language hooks.
- JavaScript classes are built on top of prototype-based behavior.
- Dynamic features are powerful, but they can also make debugging harder if overused.
- Know where the lookup or binding rule comes from instead of memorizing special cases.

## Why It Matters
This matters in day-to-day engineering because Symbol.toPrimitive affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
const price = {
  amount: 10,
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? `$${this.amount}` : this.amount
  }
}
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is Symbol.toPrimitive?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Symbol.toPrimitive in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Symbol.toPrimitive.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [get / set accessors](06-get-set-accessors.md)
- Next: [inheritance](08-inheritance.md)

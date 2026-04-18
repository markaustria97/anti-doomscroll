# Number.isNaN

## TL;DR
Number.isNaN answers a precise numeric question that the global helpers often answer poorly. The main idea is to use the explicit Number API so your intent is obvious and corner cases are handled correctly. That keeps validation logic safe and readable.

## Key Concepts
- Number.isNaN answers one specific validation question instead of doing broad coercive checks.
- Prefer Number helpers over older global functions when you want predictable behavior.
- Be clear about special values such as NaN, Infinity, and decimal numbers.
- Validation code is safer when the rule is explicit at the call site.

## Why It Matters
This matters in day-to-day engineering because Number.isNaN affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
Number.isNaN(NaN) // true
Number.isNaN("NaN") // false
```

## Common Pitfalls
- Picking a nearby method with a different return shape.
- Forgetting whether the operation is shallow or whether it returns a new value.
- Ignoring edge cases such as empty arrays, missing keys, or whitespace details.

## Interview Angle
- **Q:** What is Number.isNaN?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Number.isNaN in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Number.isNaN.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [padEnd](21-pad-end.md)
- Next: [Number.isFinite](23-number-is-finite.md)

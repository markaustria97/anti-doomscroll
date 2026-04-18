# Object.hasOwn

## TL;DR
Object.hasOwn is one of the core object APIs for inspection, copying, or behavior control. You should understand whether it reads keys, creates a new object, mutates something, or changes mutability guarantees. That helps you reason about state updates and bugs more confidently.

## Key Concepts
- Object.hasOwn operates on object structure, identity, or mutability rather than class-style inheritance alone.
- Understand whether it is shallow or deep, and whether it affects the original object.
- Property enumerability and ownership often matter with object helpers.
- Use the method that matches your real goal instead of treating all object helpers as interchangeable.

## Why It Matters
This matters in day-to-day engineering because Object.hasOwn affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
Object.hasOwn(user, "name") // true for own props only
```

## Common Pitfalls
- Picking a nearby method with a different return shape.
- Forgetting whether the operation is shallow or whether it returns a new value.
- Ignoring edge cases such as empty arrays, missing keys, or whitespace details.

## Interview Angle
- **Q:** What is Object.hasOwn?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Object.hasOwn in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Object.hasOwn.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [Array.fromAsync](14-array-from-async.md)
- Next: [Intl API](16-intl-api.md)

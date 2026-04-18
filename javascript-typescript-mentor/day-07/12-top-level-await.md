# top-level await

## TL;DR
Top-level await is a modern JavaScript capability that improves expressiveness, interoperability, or platform reach. Focus on what protocol or runtime behavior it participates in, because that is what makes the feature useful beyond the syntax itself.

## Key Concepts
- Top-level await plugs into a language protocol, platform feature, or module system rule.
- Modern JavaScript features often compose well because they follow shared protocols like iteration or promises.
- Support level matters: some features are stable, some are new, and some are still proposals.
- Understand both the practical use case and the compatibility story.

## Why It Matters
This matters in day-to-day engineering because top-level await affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
const config = await fetch("/config.json").then((r) => r.json())
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is top-level await?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use top-level await in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand top-level await.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [dynamic import()](11-dynamic-import.md)
- Next: [globalThis](13-global-this.md)

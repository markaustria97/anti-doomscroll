# dynamic import()

## TL;DR
Dynamic import() is a modern JavaScript capability that improves expressiveness, interoperability, or platform reach. Focus on what protocol or runtime behavior it participates in, because that is what makes the feature useful beyond the syntax itself.

## Key Concepts
- Dynamic import() plugs into a language protocol, platform feature, or module system rule.
- Modern JavaScript features often compose well because they follow shared protocols like iteration or promises.
- Support level matters: some features are stable, some are new, and some are still proposals.
- Understand both the practical use case and the compatibility story.

## Why It Matters
This matters in day-to-day engineering because dynamic import() affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
const module = await import("./feature.js")
module.run()
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is dynamic import()?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use dynamic import() in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand dynamic import().

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [ESM vs CJS](10-esm-vs-cjs.md)
- Next: [top-level await](12-top-level-await.md)

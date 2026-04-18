# Promise.any

## TL;DR
Promise.any shapes how promises are created, chained, or combined. The main mental model is to think in terms of fulfillment, rejection, and coordination between async tasks instead of line-by-line blocking code. Knowing the differences here prevents subtle async bugs.

## Key Concepts
- Promise.any is about promise state and orchestration, not thread-based concurrency.
- Promises settle once: they are either fulfilled or rejected, then they stay that way.
- Error propagation follows the chain until something handles the rejection.
- Choose the combinator or chaining style that matches your failure policy.

## Why It Matters
This matters in day-to-day engineering because Promise.any affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
const firstSuccess = await Promise.any([mirrorA(), mirrorB()])
```

## Common Pitfalls
- Memorizing the surface syntax without learning the underlying mental model.
- Using the feature everywhere instead of when it clearly improves the code.
- Skipping edge cases such as empty inputs, nullish values, or failed async work.

## Interview Angle
- **Q:** What is Promise.any?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use Promise.any in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand Promise.any.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [Promise.race](12-promise-race.md)
- Next: [async / await](14-async-await.md)

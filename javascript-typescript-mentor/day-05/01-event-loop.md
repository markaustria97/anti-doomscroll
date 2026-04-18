# event loop

## TL;DR
Event loop is part of JavaScript's async execution model. Start with the mental model of when work gets queued and resumed, then map the API or concept onto that model. Once the model is clear, the syntax becomes much easier to trust.

## Key Concepts
- Event loop only makes sense when you place it on the event-loop timeline.
- JavaScript runs your current call stack to completion before picking more queued work.
- Microtasks run before the engine moves to the next macrotask turn.
- Most async bugs are ordering bugs, cancellation bugs, or unhandled rejection bugs.

## Why It Matters
Async behavior is where many otherwise solid codebases become unpredictable. Knowing event loop helps you debug ordering issues, choose the right API, and explain why code that 'looks sequential' still resumes later.

## Syntax / Example
```js
console.log("start")
setTimeout(() => console.log("timer"), 0)
Promise.resolve().then(() => console.log("microtask"))
console.log("end")
```

## Common Pitfalls
- Assuming async code runs immediately in source order; always think about queueing.
- Forgetting to handle rejections or cancellation paths.
- Using the wrong promise combinator for your failure policy.

## Interview Angle
- **Q:** How would you explain event loop without code?  
  **A:** Start with the event-loop mental model, then map the API or keyword onto that timeline.
- **Q:** What bug does misunderstanding event loop usually create?  
  **A:** Ordering bugs, missed error handling, or cancellation bugs are the common ones.

## Mini Challenge
Create a tiny example that shows the ordering behavior behind event loop.

## Mini Challenge Solution
A correct solution prints or returns values in an order that matches the event-loop rule behind event loop, then briefly explains why.

## Related Topics
- Previous: [when to prefer Map/Set](../day-04/40-when-to-prefer-map-set.md)
- Next: [call stack](02-call-stack.md)

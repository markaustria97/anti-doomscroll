# Factory pattern

## TL;DR
The Factory pattern gives a repeatable way to organize responsibilities so code stays easier to extend and test. The real skill is not memorizing the name, but recognizing the problem shape it solves and the trade-offs it introduces. Patterns are most useful when they remove complexity rather than add ceremony.

## Key Concepts
- The Factory pattern names a recurring solution shape, not a rule you must always apply.
- Each pattern has a clear intent, a small set of collaborators, and a trade-off in complexity.
- Patterns help most when they isolate change or make testing simpler.
- If the abstraction hides more than it clarifies, the pattern is probably premature.

## Why It Matters
Teams reach for the Factory pattern when they need code that can grow without spreading conditionals everywhere. Used well, it localizes change and testing. Used badly, it adds layers no one asked for.

## Syntax / Example
```ts
function createLogger(kind: "json" | "text") {
  return kind === "json" ? new JsonLogger() : new TextLogger()
}
```

## Common Pitfalls
- Applying the pattern because the name sounds impressive instead of because the problem needs it.
- Adding abstraction before the change pressure is real.
- Hiding important domain rules behind too many layers.

## Interview Angle
- **Q:** What problem does Factory pattern solve?  
  **A:** Answer with a change-management problem, not only a definition.
- **Q:** When would you avoid Factory pattern?  
  **A:** Avoid it when the abstraction cost is higher than the coordination or testability benefit.

## Mini Challenge
Name one small feature where Factory pattern would make the code easier to extend or test.

## Mini Challenge Solution
A good solution identifies the changing part, the stable part, and why the pattern keeps them separate.

## Related Topics
- Previous: [decorators](../day-10/19-decorators.md)
- Next: [Observer pattern](02-observer-pattern.md)

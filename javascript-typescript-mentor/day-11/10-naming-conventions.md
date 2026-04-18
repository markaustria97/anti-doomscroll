# naming conventions

## TL;DR
Naming conventions is a production-oriented practice for keeping systems easier to extend, test, and review. The important question is when it buys clarity and when it becomes extra abstraction that the team has to maintain.

## Key Concepts
- Naming conventions is a design tool for managing change over time, not just passing an interview.
- Good production patterns improve testability, readability, and failure isolation.
- Team consistency matters as much as the pattern itself.
- Use abstraction to simplify decisions, not to make simple code look advanced.

## Why It Matters
Production systems change under pressure from new requirements, failures, and team growth. Naming conventions gives you vocabulary and structure for making those changes without turning every feature into a rewrite.

## Syntax / Example
```txt
Files: kebab-case
Classes: PascalCase
Variables/functions: camelCase
```

## Common Pitfalls
- Applying the pattern because the name sounds impressive instead of because the problem needs it.
- Adding abstraction before the change pressure is real.
- Hiding important domain rules behind too many layers.

## Interview Angle
- **Q:** What problem does naming conventions solve?  
  **A:** Answer with a change-management problem, not only a definition.
- **Q:** When would you avoid naming conventions?  
  **A:** Avoid it when the abstraction cost is higher than the coordination or testability benefit.

## Mini Challenge
Name one small feature where naming conventions would make the code easier to extend or test.

## Mini Challenge Solution
A good solution identifies the changing part, the stable part, and why the pattern keeps them separate.

## Related Topics
- Previous: [barrel exports](09-barrel-exports.md)
- Next: [anti-patterns](11-anti-patterns.md)

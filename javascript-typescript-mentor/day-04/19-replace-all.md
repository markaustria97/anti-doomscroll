# replaceAll

## TL;DR
replaceAll is a small string API that solves a very specific formatting or parsing job. Once you know its return value and edge cases, you can replace a lot of noisy manual slicing and concatenation. These methods come up constantly in input handling and interview exercises.

## Key Concepts
- replaceAll solves a narrow string manipulation task and is easiest to learn with before/after examples.
- String methods return new strings because strings are immutable in JavaScript.
- Off-by-one errors and missed whitespace rules are the most common bugs.
- Favor the built-in method over custom slicing logic when it already matches your intent.

## Why It Matters
This matters in day-to-day engineering because replaceAll affects how readable, predictable, and maintainable your code feels under change. Once you know the mental model, you can choose the feature on purpose instead of copying patterns blindly.

## Syntax / Example
```js
"a-a-a".replaceAll("a", "b") // "b-b-b"
```

## Common Pitfalls
- Picking a nearby method with a different return shape.
- Forgetting whether the operation is shallow or whether it returns a new value.
- Ignoring edge cases such as empty arrays, missing keys, or whitespace details.

## Interview Angle
- **Q:** What is replaceAll?  
  **A:** Give the mental model first, then show a tiny example.
- **Q:** Why would you use replaceAll in production?  
  **A:** Explain the readability, correctness, or maintainability benefit.

## Mini Challenge
Write the smallest example you can that proves you understand replaceAll.

## Mini Challenge Solution
A good solution is short, runnable, and includes the exact output or behavior you expect.

## Related Topics
- Previous: [replace](18-replace.md)
- Next: [padStart](20-pad-start.md)

# block vs function vs global scope

## TL;DR
Block vs function vs global scope compares similar ideas that behave differently in practice. Learn the safer default, the key difference in behavior, and the common bug that appears when people treat them as interchangeable. This is the kind of distinction interviewers love to probe.

## Key Concepts
- Block vs function vs global scope puts similar-looking concepts side by side so you can separate syntax from behavior.
- Look for the one behavior difference that changes correctness, readability, or compatibility.
- Interviews often ask for the default choice and the edge case where another option is better.
- When in doubt, choose the option with the most explicit and least surprising behavior.

## Why It Matters
Block vs function vs global scope matters because similar-looking options often fail in different ways. The faster you can explain the behavior difference, the easier it is to choose the safe default and debug edge cases under pressure.

## Syntax / Example
```js
if (true) {
  let blockOnly = 1
}
function demo() {
  var functionScoped = 2
}
```

## Common Pitfalls
- Remembering the syntax but not the behavior difference that actually matters.
- Choosing the shorter form even when the more explicit form is safer.
- Answering interview questions with rules of thumb but no example.

## Interview Angle
- **Q:** What is the practical difference in block vs function vs global scope?  
  **A:** Explain the behavior difference, then state the safer default and one case where the alternative is useful.
- **Q:** Which option in block vs function vs global scope would you choose by default?  
  **A:** Pick the option with the least surprising behavior and justify it with a small example.

## Mini Challenge
Write two tiny examples that demonstrate the difference in block vs function vs global scope.

## Mini Challenge Solution
A correct solution shows different outputs or behaviors, then states the safer default in one sentence.

## Related Topics
- Previous: [lexical scope](07-lexical-scope.md)
- Next: [hoisting](09-hoisting.md)

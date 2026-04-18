# ESLint

## T — TL;DR
ESLint checks code without running it. Use it to catch suspicious patterns early and keep boring mistakes out of code review.

## K — Key Concepts
- ESLint is static analysis, not runtime testing.
- Some rules catch likely bugs, while others enforce team conventions.
- ESLint and Prettier solve different problems: code quality vs formatting.

## W — Why it matters
A linter gives fast feedback on small mistakes before they turn into debugging time or review comments. That saves attention when your session is short.

## I — Interview questions with answers
- **Q:** What kinds of issues can ESLint catch?  
  **A:** Unused variables, unreachable code, undefined names, and patterns your team wants to avoid.
- **Q:** Why keep lint rules shared in the repo?  
  **A:** So developers and CI all enforce the same standards.

## C — Common pitfalls with fix
- Enabling a huge ruleset you cannot explain. — **Fix:** start with a recommended config and add rules slowly.
- Using ESLint for formatting fights. — **Fix:** let Prettier handle formatting.

## K — Coding challenge with solution
**Challenge:** Configure ESLint to report unused variables.

**Solution:**
```js
export default [
  {
    rules: {
      'no-unused-vars': 'error'
    }
  }
]
```

**Why it works:** When a variable is declared but never used, ESLint will flag it before the code reaches review.

## Next topic
[Prettier](04-prettier.md)

## One tiny action
Look at one file and name one issue ESLint could catch without executing the code.

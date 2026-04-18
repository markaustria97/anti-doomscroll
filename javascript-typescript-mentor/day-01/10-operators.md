# operators

## T — TL;DR
Operators are not just math symbols. They also control comparison, assignment, short-circuiting, and evaluation order.

## K — Key Concepts
- Operator precedence exists, but parentheses are often clearer than memorizing the full table.
- Some operators short-circuit, so the right side may never run.
- Logical operators return values, not just booleans.

## W — Why it matters
Operator bugs are often tiny but expensive. One dense expression can hide wrong precedence, unwanted coercion, or skipped work.

## I — Interview questions with answers
- **Q:** What does short-circuiting mean?  
  **A:** JavaScript stops evaluating an expression as soon as the result is already known.
- **Q:** When should you add parentheses even if they are optional?  
  **A:** When they make the intended evaluation order easier for another human to read.

## C — Common pitfalls with fix
- Writing dense expressions to save lines. — **Fix:** split them or add parentheses.
- Forgetting that `&&` and `||` return operands. — **Fix:** check the actual value that comes back.

## K — Coding challenge with solution
**Challenge:** Log a username only when a user object exists.

**Solution:**
```js
const user = { name: 'Mara' }
user && console.log(user.name)
```

**Why it works:** `&&` evaluates the right side only when the left side is truthy.

## Next topic
[logical assignment operators](11-logical-assignment-operators.md)

## One tiny action
Take one dense expression and make it easier to read before making it shorter.

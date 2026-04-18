# Number.isNaN

## T — TL;DR
**Number.isNaN** is a small built-in with one job. Learn the input, the return value, and the bug it helps you avoid.

## K — Key Concepts
- Know exactly what **Number.isNaN** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **Number.isNaN** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for Number.isNaN?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Number.isNaN?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **Number.isNaN** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **Number.isNaN**.

**Solution:**
```js
Number.isNaN(NaN) // true
Number.isNaN("NaN") // false
```

**Why it works:** This works because the example makes the input and output of **Number.isNaN** obvious enough to reason about before you run it.
## Next topic
[Number.isFinite](23-number-is-finite.md)

## One tiny action
Type the example for **Number.isNaN** once and say the return value out loud before you run it.

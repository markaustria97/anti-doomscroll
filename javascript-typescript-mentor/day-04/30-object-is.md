# Object.is

## T — TL;DR
**Object.is** is a small built-in with one job. Learn the input, the return value, and the bug it helps you avoid.

## K — Key Concepts
- Know exactly what **Object.is** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **Object.is** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for Object.is?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Object.is?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **Object.is** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **Object.is**.

**Solution:**
```js
Object.is(NaN, NaN) // true
Object.is(-0, 0) // false
```

**Why it works:** This works because the example makes the input and output of **Object.is** obvious enough to reason about before you run it.
## Next topic
[Object.freeze](31-object-freeze.md)

## One tiny action
Type the example for **Object.is** once and say the return value out loud before you run it.

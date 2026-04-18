# spread/rest

## T — TL;DR
**spread/rest** is about reshaping data without losing track of what changed. Keep the example tiny and concrete.

## K — Key Concepts
- Know exactly what **spread/rest** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **spread/rest** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for spread/rest?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with spread/rest?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **spread/rest** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **spread/rest**.

**Solution:**
```js
const copy = { ...user, active: true }
function sum(...values) { return values.length }
```

**Why it works:** This works because the example makes the input and output of **spread/rest** obvious enough to reason about before you run it.
## Next topic
[tagged template literals](35-tagged-template-literals.md)

## One tiny action
Type the example for **spread/rest** once and say the return value out loud before you run it.

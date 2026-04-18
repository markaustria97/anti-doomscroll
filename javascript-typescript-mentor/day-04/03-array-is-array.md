# Array.isArray

## T — TL;DR
**Array.isArray** is easiest when you know three things: what goes in, what comes out, and whether the original array changes.

## K — Key Concepts
- Know exactly what **Array.isArray** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **Array.isArray** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for Array.isArray?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Array.isArray?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **Array.isArray** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **Array.isArray**.

**Solution:**
```js
Array.isArray([]) // true
Array.isArray({ length: 0 }) // false
```

**Why it works:** This works because the example makes the input and output of **Array.isArray** obvious enough to reason about before you run it.
## Next topic
[map](04-map.md)

## One tiny action
Type the example for **Array.isArray** once and say the return value out loud before you run it.

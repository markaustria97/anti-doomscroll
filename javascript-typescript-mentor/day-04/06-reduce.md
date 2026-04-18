# reduce

## T — TL;DR
**reduce** is easiest when you know three things: what goes in, what comes out, and whether the original array changes.

## K — Key Concepts
- Know exactly what **reduce** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **reduce** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for reduce?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with reduce?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **reduce** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **reduce**.

**Solution:**
```js
const total = prices.reduce((sum, price) => sum + price, 0)
```

**Why it works:** This works because the example makes the input and output of **reduce** obvious enough to reason about before you run it.
## Next topic
[find](07-find.md)

## One tiny action
Type the example for **reduce** once and say the return value out loud before you run it.

# split

## T — TL;DR
**split** becomes easy once you know what text it returns and which edge cases change the result.

## K — Key Concepts
- Know exactly what **split** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **split** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for split?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with split?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **split** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **split**.

**Solution:**
```js
"js,ts,node".split(",") // ["js", "ts", "node"]
```

**Why it works:** This works because the example makes the input and output of **split** obvious enough to reason about before you run it.
## Next topic
[trim](17-trim.md)

## One tiny action
Type the example for **split** once and say the return value out loud before you run it.

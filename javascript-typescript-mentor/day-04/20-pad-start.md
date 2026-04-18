# padStart

## T — TL;DR
**padStart** becomes easy once you know what text it returns and which edge cases change the result.

## K — Key Concepts
- Know exactly what **padStart** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **padStart** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for padStart?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with padStart?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **padStart** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **padStart**.

**Solution:**
```js
"7".padStart(3, "0") // "007"
```

**Why it works:** This works because the example makes the input and output of **padStart** obvious enough to reason about before you run it.
## Next topic
[padEnd](21-pad-end.md)

## One tiny action
Type the example for **padStart** once and say the return value out loud before you run it.

# string slice

## T — TL;DR
**string slice** becomes easy once you know what text it returns and which edge cases change the result.

## K — Key Concepts
- Know exactly what **string slice** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **string slice** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for string slice?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with string slice?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **string slice** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **string slice**.

**Solution:**
```js
const code = "mentor"
code.slice(0, 3) // "men"
```

**Why it works:** This works because the example makes the input and output of **string slice** obvious enough to reason about before you run it.
## Next topic
[split](16-split.md)

## One tiny action
Type the example for **string slice** once and say the return value out loud before you run it.

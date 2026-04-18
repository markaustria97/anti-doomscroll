# default parameters

## T — TL;DR
**default parameters** is about how JavaScript creates, scopes, and calls functions. Get the mental model first, then the syntax feels small.

## K — Key Concepts
- Name the runtime rule behind **default parameters** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **default parameters** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for default parameters?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with default parameters?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **default parameters** to explain the rule in your own words.

**Solution:**
```js
function greet(name = "friend") {
  return `Hi, ${name}`
}
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[rest parameters](03-rest-parameters.md)

## One tiny action
Spend two minutes turning **default parameters** into one tiny runnable example.

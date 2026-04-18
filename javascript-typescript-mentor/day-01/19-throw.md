# throw

## T — TL;DR
**throw** is easier when you tie it to one concrete rule instead of memorizing isolated syntax.

## K — Key Concepts
- Name the runtime rule behind **throw** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **throw** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for throw?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with throw?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **throw** to explain the rule in your own words.

**Solution:**
```js
if (!token) {
  throw new Error("Missing auth token")
}
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[function declarations vs expressions vs arrow functions](../day-02/01-function-declarations-vs-expressions-vs-arrow-functions.md)

## One tiny action
Spend two minutes turning **throw** into one tiny runnable example.

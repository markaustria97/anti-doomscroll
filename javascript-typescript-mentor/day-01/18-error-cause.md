# Error.cause

## T — TL;DR
**Error.cause** is easier when you tie it to one concrete rule instead of memorizing isolated syntax.

## K — Key Concepts
- Name the runtime rule behind **Error.cause** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **Error.cause** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for Error.cause?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Error.cause?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **Error.cause** to explain the rule in your own words.

**Solution:**
```js
try {
  loadConfig()
} catch (error) {
  throw new Error("App startup failed", { cause: error })
}
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[throw](19-throw.md)

## One tiny action
Spend two minutes turning **Error.cause** into one tiny runnable example.

# Promise.resolve / Promise.reject

## T — TL;DR
**Promise.resolve / Promise.reject** makes more sense when you picture a timeline: start work, queue work, resume work, then handle success or failure.

## K — Key Concepts
- Put **Promise.resolve / Promise.reject** on a timeline: when does work start, pause, resume, or fail?
- Most async bugs are ordering bugs, forgotten error paths, or missing cancellation.
- The smaller the example, the easier it is to see the queueing rule.

## W — Why it matters
A lot of production bugs come from misunderstanding timing. **Promise.resolve / Promise.reject** helps you explain why code that looks simple can still behave later, fail later, or race.

## I — Interview questions with answers
- **Q:** How would you explain Promise.resolve / Promise.reject without starting with syntax?  
  **A:** Describe the timeline first: when work begins, when it waits, and when it resumes or fails.
- **Q:** What bug usually appears when people misunderstand Promise.resolve / Promise.reject?  
  **A:** Ordering bugs, missed errors, and forgotten cancellation paths are the common ones.

## C — Common pitfalls with fix
- Reading async code as if it runs top to bottom without pausing. — **Fix:** draw a quick timeline of start, wait, resume, and error.
- Ignoring rejection or cancellation paths. — **Fix:** include one failure case in every small example.

## K — Coding challenge with solution
**Challenge:** Trace the example for **Promise.resolve / Promise.reject** and explain where execution waits, resumes, or can fail.

**Solution:**
```js
Promise.resolve(42).then(console.log)
Promise.reject(new Error("boom")).catch(console.error)
```

**Why it works:** This works because it exposes the timing rule behind **Promise.resolve / Promise.reject** instead of hiding it inside a large async flow.
## Next topic
[then / catch / finally](09-then-catch-finally.md)

## One tiny action
Draw a 3-step timeline for **Promise.resolve / Promise.reject**: start, wait, resume.

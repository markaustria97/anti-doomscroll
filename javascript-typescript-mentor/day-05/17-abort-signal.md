# AbortSignal

## T — TL;DR
**AbortSignal** makes more sense when you picture a timeline: start work, queue work, resume work, then handle success or failure.

## K — Key Concepts
- Put **AbortSignal** on a timeline: when does work start, pause, resume, or fail?
- Most async bugs are ordering bugs, forgotten error paths, or missing cancellation.
- The smaller the example, the easier it is to see the queueing rule.

## W — Why it matters
A lot of production bugs come from misunderstanding timing. **AbortSignal** helps you explain why code that looks simple can still behave later, fail later, or race.

## I — Interview questions with answers
- **Q:** How would you explain AbortSignal without starting with syntax?  
  **A:** Describe the timeline first: when work begins, when it waits, and when it resumes or fails.
- **Q:** What bug usually appears when people misunderstand AbortSignal?  
  **A:** Ordering bugs, missed errors, and forgotten cancellation paths are the common ones.

## C — Common pitfalls with fix
- Reading async code as if it runs top to bottom without pausing. — **Fix:** draw a quick timeline of start, wait, resume, and error.
- Ignoring rejection or cancellation paths. — **Fix:** include one failure case in every small example.

## K — Coding challenge with solution
**Challenge:** Trace the example for **AbortSignal** and explain where execution waits, resumes, or can fail.

**Solution:**
```js
const { signal } = new AbortController()
signal.addEventListener("abort", () => console.log("cancelled"))
```

**Why it works:** This works because it exposes the timing rule behind **AbortSignal** instead of hiding it inside a large async flow.
## Next topic
[cancellable async patterns](18-cancellable-async-patterns.md)

## One tiny action
Draw a 3-step timeline for **AbortSignal**: start, wait, resume.

# 16 — Throttle

## T — TL;DR

Throttle ensures a function fires **at most once per time window**, no matter how many times it's triggered — ideal for scroll handlers, mouse movements, and game loops.[^10]

## K — Key Concepts

```js
function throttle(fn, limit) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

// Usage: scroll handler
const onScroll = () => console.log("Scroll position:", window.scrollY);
const throttledScroll = throttle(onScroll, 100);
window.addEventListener("scroll", throttledScroll);

// Timeline:
// Events: |||||||||||||||||||||||||  (many per ms)
// Fires:  |    |    |    |    |      (at most once per 100ms)

// Throttle with trailing call (fires once more at end)
function throttleWithTrail(fn, limit) {
  let lastCall = 0;
  let trailingTimer;

  return function (...args) {
    const now = Date.now();
    clearTimeout(trailingTimer);

    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      // Schedule trailing call
      trailingTimer = setTimeout(
        () => {
          lastCall = Date.now();
          fn.apply(this, args);
        },
        limit - (now - lastCall)
      );
    }
  };
}
```

## W — Why It Matters

Scroll and `mousemove` events fire 60+ times per second. Without throttle, attaching expensive handlers (layout reads, analytics pings, parallax calculations) to these events tanks performance. Throttle is the performance primitive for continuous events.[^10]

## I — Interview Q&A

**Q: When do you choose throttle over debounce?**
A: Use throttle for **continuous events** where you want periodic updates (scroll position, mouse tracking, canvas drawing, game input). Use debounce for **burst events** where you only care about the final state after activity stops (search input, resize end).

**Q: What's the difference between throttle and `requestAnimationFrame`?**
A: `requestAnimationFrame` throttles to the browser's repaint rate (~60fps). `throttle` gives you control over the interval. For visual updates, `rAF` is preferred; for non-visual (API calls, logging), use `throttle`.

## C — Common Pitfalls

| Pitfall                                                    | Fix                                          |
| :--------------------------------------------------------- | :------------------------------------------- |
| Using debounce on scroll (fires only when scrolling stops) | Use throttle for continuous feedback         |
| Missing trailing call losing final event                   | Use `throttleWithTrail` for completeness     |
| Not cleaning up scroll/resize listeners                    | Always remove listeners on component unmount |

## K — Coding Challenge

**Throttle a function that logs the mouse position, max once per 200ms:**

```js
document.addEventListener("mousemove" /* throttled */);
```

**Solution:**

```js
const logPosition = (e) => console.log(`x:${e.clientX} y:${e.clientY}`);
const throttledLog = throttle(logPosition, 200);
document.addEventListener("mousemove", throttledLog);

// Without throttle: fires ~60x/second
// With throttle(200): fires at most 5x/second
```

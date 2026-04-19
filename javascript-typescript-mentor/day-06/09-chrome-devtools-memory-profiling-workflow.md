# 9 — Chrome DevTools Memory Profiling Workflow

## T — TL;DR

Chrome DevTools Memory panel lets you take **heap snapshots**, **allocation timelines**, and **allocation sampling** to identify what's leaking, how much, and why — the three-snapshot technique is the standard diagnostic approach.

## K — Key Concepts

### Opening the Memory Panel

1. Open Chrome DevTools (`F12` or `Cmd+Opt+I`)
2. Go to the **Memory** tab
3. Choose a profiling type

### Three Profiling Types

| Type | What It Does | Use When |
|------|-------------|----------|
| **Heap Snapshot** | Captures all objects in memory at a point in time | Comparing "before" and "after" |
| **Allocation on Timeline** | Records allocations over time | Finding what's being allocated continuously |
| **Allocation Sampling** | Low-overhead sampling of allocations by function | Finding which functions allocate the most |

### The Three-Snapshot Technique

The gold standard for finding leaks:

```
1. Load page → Take Snapshot 1 (baseline)
2. Perform the suspected leaking action (e.g., navigate, open/close modal)
3. Take Snapshot 2
4. Undo the action (e.g., navigate back, close modal)
5. Force GC (click trash can icon in DevTools)
6. Take Snapshot 3

Compare Snapshot 1 and Snapshot 3:
  - If Snapshot 3 has MORE objects → memory leak
  - Objects in Snapshot 3 but not Snapshot 1 are the leak
```

### Reading a Heap Snapshot

In the snapshot view:

| Column | Meaning |
|--------|---------|
| **Constructor** | The type/class of objects |
| **Distance** | Hops from GC root |
| **Shallow Size** | Memory of the object itself |
| **Retained Size** | Memory freed if the object were removed (including all objects it keeps alive) |

**Retained Size** is the most important — it shows the real impact.

### Comparison View

Switch the dropdown from "Summary" to **"Comparison"**:

```
Select Snapshot 3 → Compare with Snapshot 1

Look at "#Delta" column:
  + values = new allocations that weren't cleaned up
  Focus on types with large positive deltas
```

### Retainers Panel

Click an object to see **why it's alive** — the chain of references from GC root:

```
Object → property of → parent object → ... → GC root

Example:
  Array @123456
    ← items in Map @234567
      ← cache in Window
```

This tells you: "The Array is alive because it's in a Map called `cache` on the `window`."

### Allocation Timeline

1. Start recording
2. Perform actions
3. Stop recording

The timeline shows **blue bars** for allocations. Bars that **don't disappear** after GC are leaks.

Click a bar to see what was allocated at that point.

### Quick Workflow Checklist

```
□ Open Memory tab
□ Take Snapshot 1 (baseline)
□ Perform the action 5-10 times
□ Force GC (trash can icon)
□ Take Snapshot 2
□ Switch to Comparison view
□ Sort by "#Delta" or "Retained Size"
□ Click on suspicious objects → check Retainers
□ Trace the chain back to your code
□ Fix the reference
```

## W — Why It Matters

- Heap snapshots are the definitive tool for diagnosing memory leaks.
- The three-snapshot technique is the standard approach used at Google, Meta, etc.
- Retained size vs shallow size tells you the real impact of an object.
- The Retainers panel shows you exactly WHY something isn't being collected.
- This is a skill that separates senior from junior engineers.

## I — Interview Questions with Answers

### Q1: How do you diagnose a memory leak in the browser?

**A:** Use Chrome DevTools Memory panel. Take heap snapshots before and after a suspected action (three-snapshot technique). Compare snapshots to find objects that shouldn't persist. Use the Retainers panel to trace why they're alive.

### Q2: What is the difference between shallow size and retained size?

**A:** **Shallow size** is the memory of the object itself. **Retained size** includes all memory that would be freed if the object were garbage collected — the object plus everything it exclusively keeps alive.

### Q3: What does the Retainers panel show?

**A:** The reference chain from a GC root to the selected object — telling you exactly why the object is still in memory and which code is responsible.

## C — Common Pitfalls with Fix

### Pitfall: Not forcing GC before the comparison snapshot

If you don't force GC, short-lived objects appear as "leaks" when they're just waiting for collection.

**Fix:** Always click the trash can icon (force GC) before taking comparison snapshots.

### Pitfall: Comparing snapshots without repeating the action

A single iteration may not produce enough data to identify patterns.

**Fix:** Repeat the suspected leaking action 5–10 times to amplify the signal.

### Pitfall: Looking at shallow size instead of retained size

An object might be tiny (shallow), but it retains a massive tree of children.

**Fix:** Sort by **retained size** to find the biggest impact.

## K — Coding Challenge with Solution

### Challenge

You have a React-like component that opens and closes a modal. After opening and closing it 10 times, memory grows by 50MB. Using DevTools:

1. What profiling type do you use?
2. What steps do you take?
3. What columns do you look at?
4. Where do you look to find the root cause?

### Solution

```
1. Heap Snapshot (three-snapshot technique)

2. Steps:
   a. Load the page
   b. Take Snapshot 1
   c. Open and close the modal 10 times
   d. Force GC (trash can icon)
   e. Take Snapshot 2
   f. Switch to Comparison view

3. Columns:
   - "#Delta" → positive = leaked objects
   - "Retained Size" → sort descending to find biggest leaks
   - "Constructor" → identify the type (Array, Object, HTMLElement, etc.)

4. Root cause:
   - Click on the leaked object
   - Open the Retainers panel
   - Trace the reference chain:
     "HTMLDivElement → modalContent in closure → setupModal → event listener"
   - Fix: remove event listeners in the modal's cleanup/destroy function
```

---

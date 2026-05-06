# 9 — Error Boundaries

## T — TL;DR

Error boundaries are class components that catch JavaScript errors anywhere in their child component tree and display a fallback UI instead of crashing the entire app.

## K — Key Concepts

**The only way to implement an error boundary — class component:**

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Called during render when a child throws — update state to show fallback
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // Called after render — use for logging to error services
  componentDidCatch(error, errorInfo) {
    console.error("Caught error:", error)
    logToErrorService(error, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <p>Something went wrong.</p>
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<p>Chart failed to load.</p>}>
  <Chart data={data} />
</ErrorBoundary>
```

**What error boundaries catch vs. don't catch:**


| Caught ✅ | Not Caught ❌ |
| :-- | :-- |
| Errors during rendering | Errors in event handlers (use try/catch) |
| Errors in lifecycle methods | Async errors (`setTimeout`, `fetch`) |
| Errors in constructors of child components | Errors in the error boundary itself |
| Errors during `Suspense` (with proper setup) | Server-side rendering errors |

**Granular error boundaries:**

```jsx
// Surround individual features — one broken feature doesn't crash everything
function Dashboard() {
  return (
    <div>
      <ErrorBoundary fallback={<p>Revenue chart unavailable</p>}>
        <RevenueChart />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>User table unavailable</p>}>
        <UserTable />
      </ErrorBoundary>
    </div>
  )
}
```

**react-error-boundary library** — the practical shortcut:

```jsx
import { ErrorBoundary } from "react-error-boundary"

<ErrorBoundary
  fallbackRender={({ error, resetErrorBoundary }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )}
  onError={(error) => logToService(error)}
>
  <BrokenComponent />
</ErrorBoundary>
```


## W — Why It Matters

Without error boundaries, a single runtime error in any component crashes the entire React tree — the user sees a blank white screen with no feedback. Error boundaries are the production resilience layer. Every production React app should have strategically placed error boundaries, especially around data-fetching components and third-party integrations.

## I — Interview Q&A

**Q: What is a React error boundary?**
**A:** A class component implementing `getDerivedStateFromError` and/or `componentDidCatch` that catches JavaScript errors thrown during rendering in its subtree. When an error is caught, it renders a fallback UI instead of crashing the whole app.

**Q: Why can't error boundaries be function components?**
**A:** Because they rely on class lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) that have no hook equivalents yet. You can use the `react-error-boundary` library to get a hook-friendly API that wraps the class internally.

**Q: Do error boundaries catch errors in event handlers?**
**A:** No — error boundaries only catch errors during the React render cycle (rendering, lifecycle methods, constructors). For event handler errors, use regular `try/catch`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| One error boundary around the entire app | Use granular boundaries — surround individual features so partial failures don't blank the whole page |
| Not logging errors in `componentDidCatch` | Always log to an error monitoring service (Sentry, Datadog) in production |
| Expecting error boundaries to catch async errors | They don't — handle async errors with try/catch and state flags |
| No "retry" mechanism in the fallback | Provide a reset/retry button using `resetErrorBoundary` from react-error-boundary |

## K — Coding Challenge

**Challenge:** Build an error boundary that: shows the error message, provides a retry button, and logs to console in `componentDidCatch`:

**Solution:**

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error.message, info.componentStack)
    // logToSentry(error, info)  // production: send to error service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <pre style={{ color: "red" }}>{this.state.error?.message}</pre>
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      )
    }
    return this.props.children
  }
}

// Usage — wrap any potentially failing feature
<ErrorBoundary>
  <DataVisualization />
</ErrorBoundary>
```


***

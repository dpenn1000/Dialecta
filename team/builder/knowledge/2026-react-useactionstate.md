# React useActionState: signature, queueing, and the useFormState rename

**Source:** React Docs, "useActionState", https://react.dev/reference/react/useActionState (read
2026-09-20)

## Summary

`useActionState(action, initialState, permalink?)` returns `[state, formAction, isPending]`.
`action` is `(previousState, formData) => newState`, called with the previous state as its first
argument on every call after the first, not the initial state each time, so an action that ignores
`previousState` and always computes from scratch will silently reset accumulated state on a
second submit rather than build on the first. Actions dispatched through the returned `formAction`
queue and run sequentially, not in parallel; a second submit fired before the first resolves waits
behind it instead of racing it. Passing `formAction` to `<form action={...}>` makes React wrap the
submission in a transition automatically, which is where `isPending` comes from. `permalink` is
for progressive enhancement on a page that also has to work before JavaScript loads: it names a
URL to navigate to if the form submits before the action's module is ready. The hook is the React
19 rename of React 18.2's `useFormState`; nothing in a React 19 codebase should still import
`useFormState`.

Correction to the lead: the existing note `2026-react19-actions-optimistic.md` already
established that a React Action covers the comment insert and not a tier that "arrives later."
This note supplies the mechanism behind that finding. `previousState` threading is the only way an
action can carry information across calls, so a classification that resolves after the insert
action has already returned has nowhere to land inside `useActionState` without a second, separate
update path (a realtime subscription, a refetch, or a second action).

## Implies for Dialecta

- A-1's composer action signature is `(previousState, formData) => nextState`. If the
  classification card needs to reflect anything about a prior try (a resubmission, an edit), that
  has to live in the state the action returns, not be inferred from call order or component
  memory.
- The "Analyze my comment" control being clicked twice quickly is not a race condition to guard by
  hand; `useActionState` already serializes it. What still needs a guard is a double click firing
  two `dispatchAction` calls against a form the user has edited between clicks, which is a UX
  question, disable the control while `isPending`, rather than a data-race question.
- `useFormState` is retired vocabulary. A grep for it in a future PR is a signal the code was
  written against 18-era examples.

*Filed 2026-09-20*

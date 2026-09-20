# React 19 Actions, useOptimistic and useFormStatus

**Source:** React Docs, "React v19" release post, December 5 2024, https://react.dev/blog/2024/12/05/react-19 and React Docs, "useOptimistic" reference, https://react.dev/reference/react/useOptimistic

## Summary

React 19 names a convention rather than a new primitive: functions that use async transitions are called Actions. An Action carries a pending state that starts when the request starts and resets when the final state update commits, routes thrown errors to an Error Boundary, and reverts optimistic updates automatically when the request fails. A `<form>` accepts a function on its `action` or `formAction` prop, which uses an Action by default and resets the form after submission. `useActionState` accepts the Action and returns a wrapped Action to call. `useFormStatus` reads the status of the parent `<form>` as if the form were a context provider, which means it has to be called from a component rendered inside that form rather than from the component that renders the form. `useOptimistic(value, reducer?)` returns the optimistic state and a setter, and the optimistic state renders only while an Action is in progress; otherwise `value` renders. The setter has to be called inside an Action, and React warns and reverts almost immediately if it is called outside one. The reference is explicit that there is no extra render to clear optimistic state, because the optimistic and real values converge in the same render when the transition completes. Correction to the lead: the reading list assumed the composer waits on classification, which the A-1 backlog row rules out. The Action that `useOptimistic` covers is the comment insert, not the classification result.

## Implies for Dialecta

- A-1 submits through a server action, so the composer island gets pending state for free rather than hand-rolling a `Reading` flag in `useState`.
- `useOptimistic` in A-1 can only cover what the Action itself resolves. If classification is enqueued rather than awaited, the optimistic value is the pending comment row, and the tier arrives later through A-2 and A-3.
- The 12 character gate in A-1 is ordinary disabled-button state and needs no hook. `useFormStatus` is for the submit button once it sits inside the form element, and it is the wrong tool if the button renders in the same component as the form.
- A-7 votes are the clearest `useOptimistic` case in the backlog: the vote count is owned by the server, the update is a single Action, and a failed write reverts without extra code.

*Filed 2026-09-19*

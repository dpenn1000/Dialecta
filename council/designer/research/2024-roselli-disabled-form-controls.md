# Don't Disable Form Controls

**Source:** Adrian Roselli, "Don't Disable Form Controls", adrianroselli.com, 10 February 2024, page updated 22 July 2026. Read 19 September 2026. Corroborated by the NHS digital service manual, "Buttons", service-manual.nhs.uk/design-system/components/buttons. https://adrianroselli.com/2024/02/dont-disable-form-controls.html

## Summary

A practitioner argument that a disabled submit button is the wrong mechanism for gating a form on validity. Three failures are named. The native disabled attribute removes the control from the tab order, so keyboard and screen reader users can miss it entirely. Disabled controls are exempt from the WCAG contrast requirements, so the button is typically low contrast and hard to read, which hits low vision users hardest. And authors rarely explain why the control cannot be used, so the person is left to guess what is missing. The recommendation is to let the submit happen and answer with a clear message, or to use aria-disabled so the control stays reachable and is announced with its state.

The NHS digital service manual takes the same position for its own button component: "Disabled buttons have poor contrast and can confuse some users. Only use them if user research shows it makes things easier for users to understand." The GOV.UK Design System carries the equivalent caution. Both make user research the condition of using one at all.

## Implies for Dialecta

- Backlog A-1 as specified: "Analyze my comment" is disabled until the text reaches 12 characters, and the spec does not say the button explains itself. As written, a person under the threshold gets a dead grey control and no reason for it.
- The cheap fix stands whether or not the 12 character rule survives. Keep the button live and answer a very short comment with one sentence in the platform's voice, or keep aria-disabled with a visible count so the state is announced rather than inferred.
- Editorial Voice v1.2 applies to this string and no string exists for it yet. A silent disabled button is the platform declining to speak at the one moment it has something useful to say.
- Responsive Foundations: a greyed control with no message is worse on a phone, where the threshold is hit mid-thumb-typing and there is no hover to explain anything.
- Dialecta has no user research, which is the exact condition both design systems place on using a disabled button.

*Filed 2026-09-19*

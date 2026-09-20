# Prompt injection design patterns

**Source:** Simon Willison, "Design Patterns for Securing LLM Agents against Prompt Injections", simonwillison.net, read 2026-09-20. https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/

## Summary

This post is Willison's write-up of a paper with the same title (Beurer-Kellner, Buesser, Cretu, Debenedetti, Dobos, Fabian, Fischer, Froelicher, Grosse, Naeff, Ozoani, Paverd, Tramer, and Volhejn, 2025). Willison's own framing, consistent across his prompt injection writing, is that this is a security problem, not a moderation problem: an attacker does not need the model to say something bad, only to get it to take or influence an action it should not. His working rule, stated in his own words: "any exposure to potentially malicious tokens entirely taints the output for that prompt." He treats that as the default assumption for a system mixing untrusted text into a model call, not a worst case to plan around.

The paper's own conclusion is the direct answer to whether instructions can fix this. As long as a defense depends on the current class of language models, the authors write, it is unlikely that general-purpose agents can provide meaningful and reliable safety guarantees. That is their stated reason for proposing six architectural patterns instead of better prompt wording: Action-Selector (the agent can call a tool but never sees the tool's response), Plan-Then-Execute (the plan and tool calls are fixed before the model sees untrusted content), LLM Map-Reduce (untrusted content is handled by isolated sub-agents whose outputs are combined by code, not another model call), Dual LLM (a privileged model coordinates a quarantined model that only ever handles untrusted text), Code-Then-Execute (a privileged model writes code in a sandboxed language rather than taking direct actions), and Context-Minimization (irrelevant prior context is stripped before the model sees new untrusted content). The common thread: untrusted text is kept away from the step with authority to act or decide, rather than trusted to behave because it was told to.

## Implies for Dialecta

- `api/classify.js` never calls tools or takes actions, so it is a narrower case than the agent patterns above, but the underlying lesson holds: the fix is not a better instruction in the classification system prompt telling the model to ignore attempts to influence its own rating.
- The applicable pattern is closest to output-constraint: never let the classifier's raw text response become the tier directly. Constrain the output to a fixed enum (`2026-anthropic-structured-outputs.md`) so a manipulated response can only select among tiers the code already trusts, not write arbitrary text that gets stored or displayed.
- Treat the classification result written to Supabase as an unverified signal, not an authority. If a discourse tier unlocks any privilege such as visibility or reduced moderation, that is the "consequential action" Willison's rule warns about, and it needs a check outside the model call, not inside the prompt.
- There is no partial credit for a defense that fails silently. Willison's framing treats any successful injection as having full effect on that one output, which argues for logging every classification alongside the comment it scored, not just the ones that look anomalous.

*Filed 2026-09-20*

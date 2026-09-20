# Structured outputs and strict tool use

**Source:** Anthropic, "Structured outputs", Claude Platform Docs, read 2026-09-20. https://platform.claude.com/docs/en/build-with-claude/structured-outputs

## Summary

Anthropic's Structured Outputs feature constrains the model's response at the token-generation step rather than validating it after the fact. It is set through `output_config.format` (the API still accepts the older `output_format` name during a transition period, but current Python SDK versions require `output_config` and raise a `TypeError` on the old one), given as `{"type": "json_schema", "schema": {...}}`. The schema can use `enum`, restricted to "strings, numbers, bools, or nulls only, no complex types," which is the direct mechanism for constraining a classifier to a fixed set of tiers rather than free text.

The guarantee is structural: "Structured outputs guarantee schema-compliant responses through constrained decoding." Anthropic describes this as compiled grammar artifacts used for constrained sampling: the schema compiles into a grammar the first time it is used, adding latency to that first call, and the compiled grammar is then cached for 24 hours from last use. The stated result is "no more `JSON.parse()` errors" and "no retries needed for schema violations," because an out-of-schema token is never sampled, not filtered afterward.

This is distinct from, and combinable with, strict tool use (`strict: true`), which validates tool names and tool-call inputs rather than the model's final text response. Anthropic's own framing: JSON outputs control what Claude says, strict tool use validates how Claude calls a function. For an endpoint like a classifier that returns a verdict rather than calling a tool, JSON outputs, or the older pattern of forcing a single tool through `tool_choice` and reading its arguments, is the relevant mechanism. Structured Outputs is documented as available on current Opus, Sonnet, and Haiku model lines, across the Claude API, Amazon Bedrock, Google Cloud, and Microsoft Foundry.

## Implies for Dialecta

- `api/classify.js` should define its output schema as an object with an `enum` field naming the discourse tiers Dialecta actually has, and pass it through `output_config.format`. A manipulated comment can then only select among tiers the code already trusts; it cannot make the model emit arbitrary text that gets written to Supabase as a "tier."
- This is the structural answer to the grade-manipulation risk this sprint was scoped around: constraining the output space does not depend on the model correctly following an instruction to resist manipulation, which is the same distinction Willison's writing draws between a structural control and a prompt-level one (`2025-willison-prompt-injection-design-patterns.md`).
- Confirm which SDK version Dialecta's `package.json` pins before choosing `output_format` vs `output_config`; a version mismatch here raises a `TypeError` on the Python SDK, and the JS/TS SDK version in use should be checked for the same breaking change.
- The first call on a new or changed schema pays a grammar-compile latency cost. If `api/classify.js`'s tier enum changes, expect one slow request before the 24-hour cache warms.

*Filed 2026-09-20*

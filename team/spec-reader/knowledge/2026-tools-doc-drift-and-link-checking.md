# Tool survey: doc-drift detection, spec conformance, and link checking

**Source:** GitHub search API via WebFetch, four queries, 2026-09-20. Per the skill's "Finding
tools and repositories" section, `stargazers_count`, `pushed_at`, and `archived` read before
description on every result.

## Summary

Searched four angles relevant to this seat: documentation-drift detection, spec-conformance
linting, ADR tooling, and markdown link checking. Judged each candidate before recommending, per
the skill's instruction.

**Documentation drift detection and spec-conformance linting: nothing recommendable.** Both
searches returned only tiny, single-maintainer repositories, mostly 0 to 5 stars, several
explicitly AI-wrapper tools with no track record (`Zarl-prog/doc-drift-detector`,
`mortenkrane/dokken`, `reyhancarlos/drift`, `biplavbarua/Doc-Drift-Detector`). The
spec-conformance search mostly returned MCP-protocol and OpenAPI-adjacent linters
(`vishalhabib99/mcp-doctor`, `vivek24290/a2a-lint`), which check conformance to a
machine-readable schema, not a narrative Markdown spec against code or against an ADR. This
seat's actual problem, prose specs drifting from ADRs and from a fast-moving implementation, is
not a solved or tooled space the way OpenAPI linting is. `drift-map.md`, built by hand last
sprint, is more capable than anything this search surfaced.

**ADR tooling: two mature options, both aging, neither solves Dialecta's specific gap.**
`npryce/adr-tools` (5,697 stars, last pushed 2024-04-25, roughly two and a half years stale) and
`thomvaill/log4brains` (1,593 stars, last pushed 2024-12-17, roughly a year and three quarters
stale) are the established names. Neither is a museum piece in the four-year sense the skill
warns about, and ADR tooling is a slow-moving space by nature: numbering and indexing decision
records does not need constant maintenance the way a fast-moving library does. `log4brains` goes
further than `adr-tools`: it builds a browsable, searchable static site from a
`docs/decisions/`-shaped folder, which Dialecta already has. But neither tool links an ADR
forward to the spec sections it overrides, which is exactly Dialecta's open gap: `drift-map.md`
sections A through C exist specifically because ADR-001 through 003 each carry a `## Specs
touched` list that is incomplete or names a section that does not exist (drift-map A5, A6, C2,
C3). Adopting either tool would get Dialecta a nicer ADR index; it would not catch the actual
failure mode observed here.

**Link checking: one clear best-in-class, with a real caveat for this repo.**
`lycheeverse/lychee` (3,921 stars, last pushed 2026-09-20, the day of this search) is fast,
actively maintained, and checks both internal and external links across Markdown, HTML, and
reStructuredText. The caveat: Dialecta's `docs/` corpus cites other specs almost exclusively as
backtick-quoted filenames, for example "Per `Dialecta_Data_Architecture.md`", not as Markdown
hyperlinks. `lychee` and every other tool this search returned (`tcort/markdown-link-check`,
`raviqqe/liche`) check link syntax, `[text](path)`, not bare filename mentions. Run against
`docs/` as currently authored, `lychee` would find close to nothing to check. It would
immediately be useful against this seat's own `team/spec-reader/knowledge/` tree, which already
uses real Markdown links (`[drift-map.md](drift-map.md)`, `index.md`'s own convention), and
against `exchange/`.

## Implies for Dialecta

- No tool found this sprint is worth adopting as a dependency for this seat's actual recurring
  failure mode (drift-map D3: a citation's line number goes stale when a spec is edited; D5: a
  spec exists and is cited nowhere). The higher-leverage move, not built here since it is outside
  a sprint's scope and outside `team/spec-reader/`'s remit to decide alone, would be a small
  script that extracts every backtick-quoted `Dialecta_*.md` mention across `docs/` and
  `team/*/knowledge/` and checks the filename exists, a much narrower job than any of the
  general-purpose tools above solve.
- `lychee` is worth adopting narrowly, for `team/*/knowledge/` and `exchange/`'s own internal
  links, immediately and without a docs/ authoring-convention change. Extending it to `docs/`
  would first need citations there converted from backtick filenames to real links, which is a
  docs/ change and not this seat's to make.
- `log4brains` is worth a second look if `docs/decisions/` grows past a handful of ADRs; at three
  ADRs today it is not yet worth the dependency.

*Filed 2026-09-20.*

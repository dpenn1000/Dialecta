# The council

Three advisors with fixed mandates who disagree on purpose, chaired by `decider`, deciding nothing. Dan decides; the council makes sure he has heard the strongest case for each option first. Protocol in `.claude/skills/dialecta-council/SKILL.md`.

| Advisor | Fights for | Would veto |
| --- | --- | --- |
| `treasurer` | The platform existing in five years: revenue, unit cost, sustainability without compromising editorial independence | Spend with no path to being paid for; features whose per-user cost grows faster than any plausible revenue |
| `designer` | Contributors returning and finishing: onboarding, first comment, seven-day return, a site that feels native | Anything that imports social media's toxic reward loops; anything nobody will use |
| `philosopher` | The founding thesis and the people it serves: coherence with the specs, the cognitive biases a feature triggers, the research | Features that reward performance of thinking over thinking; anything that makes the fingerprint a scoreboard |

Each advisor owns its folder: `charter.md` (mandate), `positions.md` (standing positions with confidence and evidence), `positions/` (per-debate), `research/` (one file per source). `log/` holds every debate. Advisors write only in their own folder and `log/`.

Research runs locally where it can: `tools/local-research/` indexes every `research/` tree with Ollama embeddings on studio-pc and exposes search and summarize tools to the advisors through MCP, so bulk reading of papers and pages costs GPU time, not API tokens.

#!/usr/bin/env python3
"""Voice check for Dialecta prose.

The regex-decidable subset of docs/Dialecta_Editorial_Voice.md (v1.2), which
descends from the Trinity Platform voice guide. Each pattern names the rule
that justifies it. Judgement-level rules (observational vs. evaluative,
the meta move, generic-truth over-validation) need a reader, not a regex.

Usage:
    python scripts/voice_check.py FILE [FILE ...]
    python scripts/voice_check.py --strict FILE   # exit 1 on any hard-rule hit

Input: plain text or markdown. HTML is not parsed; extract text first.
"""
import re
import sys

HARD = "hard"      # Hard rules: fail the check
SOFT = "soft"      # Killers: report, reader decides

RULES = [
    # (severity, rule name, compiled regex)
    (HARD, "no em dashes", re.compile("—")),
    (HARD, "no en dashes (numeric range takes a hyphen)", re.compile("–")),
    # `npm run x -- --flag` is an npm separator, not prose: the (?!-) lookahead skips it.
    (HARD, "no -- standing in for the pause", re.compile(r"(?<=\S)\s--\s(?!-)|(?<=\w)--(?=\w)")),
    (HARD, "exclamation points (never stack)", re.compile(r"!{2,}")),
    (SOFT, "exclamation point", re.compile(r"(?<!\w)!(?!\w)|\w!")),
    (SOFT, "label opener (\"That's the X.\" / \"Here's the X.\")",
     re.compile(r"(?:^|[.!?]\s+)(?:That[’']s|Here[’']s)\s+(?:the|where|how|what|why)\b", re.I | re.M)),
    (SOFT, "fake reveal (\"not just X, but Y\")",
     re.compile(r"\b(?:not|isn[’']t|aren[’']t|wasn[’']t)\s+(?:just|only|merely)\b[^.?!]{0,80}?\b(?:but|it[’']s)\b", re.I)),
    (SOFT, "setup colon (\"The truth is:\")",
     re.compile(r"\b(?:The truth is|The thing is|Here[’']s the thing|The reality is|The bottom line is)\b", re.I)),
    (SOFT, "closing summary marker",
     re.compile(r"\b(?:In summary|To recap|The bottom line|In conclusion|To sum up)\b", re.I)),
    (SOFT, "\"you already know\" phrase",
     re.compile(r"\b(?:As you know|You already know|No surprise here|That[’']s not news|Needless to say)\b", re.I)),
    (SOFT, "AI-ism",
     re.compile(r"\b(?:Great question|Let me break this down|It[’']s important to note|It is important to note|Happy to help|I hope this helps|delve|dive deep|deep dive)\b", re.I)),
    (SOFT, "jargon",
     re.compile(r"\b(?:leverage[sd]?|synerg\w+|circle back|move the needle|low-hanging fruit|robust|seamless(?:ly)?|drill down|game[- ]changer|paradigm)\b", re.I)),
    (SOFT, "press-release register",
     re.compile(r"\b(?:excited to announce|thrilled to|pleased to share|proud to announce)\b", re.I)),
    (SOFT, "scaffolding opener (\"It is\" / \"There is\" / \"This is not just\")",
     re.compile(r"(?:^|[.!?]\s+)(?:It is|There is|There are|This is not just)\b", re.M)),
    (SOFT, "intensifier doing an adjective's job (genuinely / truly / really / actually / simply)",
     re.compile(r"\b(?:genuinely|truly|really|actually|simply|literally)\b", re.I)),
    (SOFT, "antithesis padding candidate (\"X, not Y\" / \"not X but Y\")",
     re.compile(r",\s+not\s+(?:a|an|the|as|to|of|in|by|because)?\s*\w+[^.?!]{0,40}[.?!]|\bnot\s+(?:as\s+)?\w+\s+but\s+(?:as\s+)?\w+", re.I)),
    (SOFT, "personified artifact (the system/engine/platform/algorithm decides, judges, wants, tells, knows)",
     re.compile(r"\b(?:the\s+)?(?:system|engine|platform|algorithm|AI|data|dashboard|report)\s+(?:decides?|judges?|wants?|tells?|knows?|thinks?|believes?)\b", re.I)),
    (SOFT, "conviction drumbeat candidate (three short sentences in a row, under 6 words each)",
     re.compile(r"(?:(?<=[.!?]\s)|^)(?:\b\w+\b[ ,]*){1,5}[.!?]\s+(?:\b\w+\b[ ,]*){1,5}[.!?]\s+(?:\b\w+\b[ ,]*){1,5}[.!?]", re.M)),
]


def check(text):
    hits = []
    for sev, name, rx in RULES:
        for m in rx.finditer(text):
            line = text.count("\n", 0, m.start()) + 1
            start = max(0, m.start() - 40)
            end = min(len(text), m.end() + 40)
            ctx = text[start:end].replace("\n", " ")
            hits.append((sev, name, line, ctx))
    return hits


def main(argv):
    strict = "--strict" in argv
    files = [a for a in argv if not a.startswith("--")]
    total_hard = 0
    for path in files:
        text = open(path, encoding="utf-8").read()
        hits = check(text)
        hard = [h for h in hits if h[0] == HARD]
        soft = [h for h in hits if h[0] == SOFT]
        total_hard += len(hard)
        words = len(text.split())
        print(f"\n== {path}  ({words} words, {len(hard)} hard, {len(soft)} soft)")
        by_rule = {}
        for h in hits:
            by_rule.setdefault((h[0], h[1]), []).append(h)
        for (sev, name), hs in sorted(by_rule.items(), key=lambda kv: (kv[0][0] != HARD, -len(kv[1]))):
            print(f"  [{sev}] {name}: {len(hs)}")
            for _, _, line, ctx in hs[:4]:
                print(f"      L{line}: …{ctx}…")
    if strict and total_hard:
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1:])

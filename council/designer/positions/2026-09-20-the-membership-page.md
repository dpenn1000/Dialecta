# The membership page

**Built:** `research/membership-prototype.html`, shown in `MEMBERSHIP-DESKTOP.png` and
`MEMBERSHIP-380.png`. Styled on the live `_theme/assets/css/style.css`, spaced on D-25, tested
at 380px.

## Eight of ten

Four of the ten matrix rows read Yes for both tiers, so they are free-tier contents that do not
exist yet rather than paid capabilities. The page splits the rest three ways:

| Group | Rows | State |
| --- | --- | --- |
| Working today | 2 | Live and gated |
| Free to everyone once built | 4 | Funded, gated for nobody |
| Underwriter only once built | 4 | Funded, gated when it lands |

The four Yes/Yes rows become one cell reading **Everyone**, so the table argues the patronage case
rather than the lede asserting it. Unbuilt rows name the engine they wait on instead of a date,
and both tier cards mark them with the open ring the matrix uses.

## What the model should change

1. **Candidates are 2 against 3, not 2 against unlimited.** `max_candidates: null` hands
   Underwriters the skill default, target 3. The live paid benefit is thinner than the brief
   says, which makes patronage the only honest pitch.
2. **`is_gifted` means two things.** Migration 033 defines it as a peer's gift and names the
   badge Honored; 034 also sets it for house comps. The page follows 033, so comped cohorts carry
   no seal. 034's expiry cron also leaves `is_gifted` set, so a lapsed recipient still reads
   Honored.
3. **The charter count is 100 open, not 99.** The one `pro` profile was toggled by an admin (031),
   and a real count filters on `set_by = 'system'`.
4. **032 asks for a faint ring.** At 3.18:1 it already sits on the 1.4.11 floor, so the page makes
   it heavier.
5. **Nothing says the $50 survives a lapse.** 032 keeps the ring; the price is unstated.
6. **`SUBSCRIPTION-MODEL.md` misquotes 033.** "Cannot pay themselves" frames a gift as hardship;
   033 says "didn't pay themselves", an honour. The brief carried the misquote.

## Two rules to hold past this page

**Metal on stone, ink on paper.** The four brass stops measure 3.15, 2.15, 1.83 and 1.28 on
`--paper` and 4.39, 6.43, 7.55 and 10.79 on `--dark-card`, so brass type lives on dark and on
paper brass is a rule, a ring, a dot. `page-about.hbs` fails this today: `--card-brass` peaks at
1.85 on cream, `--hero-brass` at 2.71 on stone.

**The mark composes the record.** A seat ring for everyone, brass and a heavier stroke for
Charter, a filled dot for Underwriter access, a terra seal for Honored. Two renders killed earlier
versions: without a seat ring the dot-only states floated in empty boxes, and in greyscale the
contrast-matched rings were identical until weight carried Charter too.

*Filed 2026-09-20*

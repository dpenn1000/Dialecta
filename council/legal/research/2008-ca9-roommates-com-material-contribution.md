# Fair Housing Council v. Roommates.com: the Ninth Circuit's material-contribution test

**Source:** Fair Housing Council of San Fernando Valley v. Roommates.com, LLC, 521 F.3d 1157 (9th
Cir. 2008) (en banc). Read 2026-09-20 through the Electronic Frontier Foundation's case page, the
case's Wikipedia summary, and Eric Goldman's Technology and Marketing Law Blog (Goldman is a law
professor who writes on Section 230 as a matter of academic practice rather than commercial
interest; treated as a strong secondary source and marked as such rather than as primary). The
2012 panel decision on the merits after remand, at `cdn.ca9.uscourts.gov`, was found but not
fetched in this pass; it resolves whether Roommate.com's own conduct was actually unlawful, a
question downstream of the Section 230 holding this note is filed for.

## Summary

Roommates.com required users to answer set-menu questions about sex, sexual orientation, and
family status preferences in a roommate, then used the answers to filter and match listings. The
Fair Housing Councils sued, alleging the questions and the filtering violated fair housing law. The
Ninth Circuit, sitting en banc, held that Section 230 did not immunize Roommates.com for the
questionnaire, the required answers, or the search and matching built on them, because the site did
not merely display information provided by users; it required the answers as a condition of using
the site and built its own functionality on categories it chose, which made it a "co-developer" of
that content under 230(f)(3)'s "in whole or in part" test for material contribution to
development. The same opinion held the site's separate free-text "Additional Comments" field
remained protected, because nothing about that field's design contributed to what users wrote in
it.

## Implies for Dialecta

- This is now the more naturally controlling circuit authority for Dialecta's own Section 230
  posture than Anderson v. TikTok, because it is Ninth Circuit law and Dan's establishment moving
  to Arizona puts Dialecta's own forum inside the Ninth Circuit for the first time this tree has
  had occasion to check. That corrects, rather than merely restates, the claim at
  `positions/2026-09-20-tier-label-first-party-speech.md` that "Anderson does not bind here" because
  Dialecta sat in the Second Circuit; the reasoning behind that sentence no longer holds, even
  though a replacement circuit authority happens to point the same direction Anderson did.
- The material-contribution/co-developer test maps onto Dialecta's own structure unusually well.
  The tier badge, the Contrast Strip, and the archetype are not free text a contributor wrote; they
  are Dialecta's own output, built from categories Dialecta chose (the six pillars, the eight
  archetypes, the tier names), running through a classifier Dialecta wrote and controls. That is
  closer to Roommates.com's required questionnaire than to its protected "Additional Comments"
  field. A contributor's own comment text is the reverse case and stays protected, the same
  conclusion this tree already reached by a different route.
- This is, on balance, a stronger and more direct fit for Dialecta's facts than Anderson was, not a
  weaker one. The jurisdiction correction does not weaken the "Section 230 does not shield the
  badge" conclusion; it replaces a persuasive out-of-circuit citation with a more squarely on-point
  one that is now the controlling circuit's own law, assuming a suit is actually venued where
  Dialecta's own forum sits, which is a separate and unresolved question.
- Not legal advice. What would settle it: whether personal jurisdiction over Dan in a specific
  hypothetical suit would actually land in the District of Arizona, given that defamation venue
  can follow the plaintiff's own domicile under an effects-based theory rather than the
  defendant's. This tree should not assume Ninth Circuit law governs any given future suit merely
  because Dialecta's own establishment does.

*Filed 2026-09-20, as part of the jurisdiction correction following record `2026-09-20-security-04`.
Originally logged as a `todo` lead in `research/reading-list.md` under "New leads, found while
reading" for a different reason (Stage 2 self-declaration); reused here for the circuit question.*

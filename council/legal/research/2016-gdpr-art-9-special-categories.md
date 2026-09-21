# GDPR Article 9: special categories, read for the author-position dot

**Source:** Regulation (EU) 2016/679, Article 9, "Processing of special categories of personal
data." Primary text via the gdpr-info.eu mirror (a practitioner mirror, not EUR-Lex itself; cross-
check against EUR-Lex before this is load-bearing for a filing). Read 2026-09-21. Closes the `todo`
row in `research/reading-list.md` under Privacy, opened 2026-09-20 and unread until now.
https://gdpr-info.eu/art-9-gdpr/

## Summary

**9(1), the closed list.** Processing is prohibited for data revealing "racial or ethnic origin,
political opinions, religious or philosophical beliefs, or trade union membership," plus genetic
data, biometric data used to uniquely identify a person, health data, and data concerning a
person's sex life or sexual orientation. Nine categories, closed, and religious or philosophical
belief is the second-listed.

**9(2), the exceptions that matter here.** Explicit consent (9(2)(a)) and manifestly-public
disclosure by the data subject (9(2)(e)) are the two an editorial platform would reach for. Both
carry conditions GDPR reads narrowly: explicit consent must be specific to the special-category
processing, not folded into a general terms acceptance, and "manifestly made public" is read as an
affirmative act by the subject, not merely content a third party could infer from something the
subject wrote.

## Implies for Dialecta

- **An opinion map's `author_position` on a religion-adjacent axis is an inference about religious
  or philosophical belief, not the belief stated outright, and Article 9 reaches inferences.**
  Regulators and the case law under Article 9's predecessor (Directive 95/46) have treated data
  from which a special category can reasonably be deduced as falling inside the category, not
  outside it. This is a general statement of the doctrine, not fetched from a case this session;
  treat it as `(unsourced)` until a court or regulator source is filed.
- **This is the same door `research/2025-ct-public-act-25-113.md` already named from the
  Connecticut side** ("The door into CTDPA is the comment text, not the fingerprint... The live
  `opinion_map_positions` table is the same exposure with a schema around it"). Article 9 is a
  harder line than any US state list: no volume threshold, and consent has to be specific to the
  special-category processing rather than general terms acceptance.
- **Consent under 9(2)(a) is a real fit for an author's own declared position, badly-suited to a
  reader's.** An author who writes an article about religion, is shown a candidate map with a dot
  on a "Fixed tradition / Open inquiry" axis, and clicks Save has done something close to an
  affirmative, specific act. A reader whose pre-read placement lands on the same kind of axis (the
  Delta Mechanic's Stage A) has consented only to the general act of placing a dot, not to
  "processing revealing my religious belief" named as such. `opinion_map_self_read` (verified this
  session, `pg_policies` on `mguulnibvzusfvyuowwh`) keeps that reader placement from other members,
  which answers a UK/US privacy-by-other-readers question but does not supply Article 9 consent to
  the processing itself.
- **This stays inside the accepted-risk posture already on file** (`positions.md`, "Accept the
  privacy risk rather than spend on it," and L-14, "accept the risk until the first EU or UK
  member"). Nothing here changes that recommendation. It sharpens what the first EU or UK member
  actually exposes: not an abstract fingerprint question, but a live, publicly rendered dot on a
  religion-adjacent axis, on this article, today.
- Not legal advice. What needs a lawyer: whether an inferred coordinate on an axis like "Fixed
  tradition / Open inquiry" is, as a matter of EU regulatory practice, treated as data "revealing"
  belief under 9(1), and whether a Pact-stage general consent could ever be read as specific enough
  under 9(2)(a) for this particular kind of inference.

*Filed 2026-09-21, for `council/legal/positions/2026-09-21-opinion-maps-and-the-declaration.md`.*

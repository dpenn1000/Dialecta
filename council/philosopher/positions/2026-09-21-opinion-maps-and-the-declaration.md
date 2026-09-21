# Opinion maps and the Declare overlay

*philosopher position, 2026-09-21, on `council/log/2026-09-21-opinion-maps-and-the-declaration.md`.
Rows read from project `mguulnibvzusfvyuowwh` on 2026-09-21; pages read signed out at
`localhost:3050` and on live.*

## Brief

The maps work against the thesis in two places the engine's prompt controls. The binary sorts
readers two ways: in two minimal-group experiments, a two-way split produced in-group bias and a
three-way split did not, unless competition was primed (Hartstone and Augoustinos 1995; Spielman
2000). The poles name the author's side by its hope and the other side by its failure, in the
author's own words: "Drift to excess" compresses his Strongest Objection, and "Fixed tradition"
echoes his "reverence without a fixed address." Retire the binary; name every pole as the people
who hold it would. On the overlay, lead with the Strongest Objection and take the Note to the
Author off the reader's page.

## The options

The Project Brief gives the maps one job: "dimensional, spatial representations of where readers
stand. No scores. No sides." (`docs/Dialecta_Project_Brief.md:122`). The Pact lists "False
Binary", "Collapsing a spectrum into a choice", among the patterns the engine names in
contributors' writing (`apps/web/src/strings.ts:1662-1663`). People read response options as the
asker's account of what a question means and which answers are expected, so the options shape the
answers (Schwarz 1999). A map's poles are the platform telling a reader what the debate is, which
makes Dan's complaint about specificity a complaint about what this environment teaches.

## The binary

**It sorts.** Strangers split two ways by a trivial criterion favor their own group. With three
groups, Hartstone and Augoustinos (1995) found "no significant ingroup bias" and proposed that the
two-way split "primes a competitive orientation"; Spielman (2000) replicated it with
undergraduates, and a competition prime brought the bias back with three. Limit: minimal groups
are assigned and empty, a map position is chosen and about something, so the direction should
transfer and the size is unknown. The builders sensed it: the binary track bows "so the middle
reads as a real position, not a fence between two sides" (`apps/web/src/components/opinion-map/engine.tsx:424-426`).
The evidence says the remedy is a third pole. A curve in the line isn't one.

**It cannot hold both.** A bipolar scale assumes its ends are opposites, so its middle confounds
holding both with holding neither (Kaplan 1972). The engine's rationale for Far Shore's binary says
open inquiry "draws on those frameworks without binding to any of them", and the essay closes by
asking what it would mean to take the traditions' tools seriously. The author holds both ends; the
line puts him at 0.82. The skill checks ternary poles for exclusivity and cartesian axes for
independence (`_recovered/skills/opinion-mapper/SKILL.md:193-195`), and binary poles for nothing.

**It is never needed.** The skill keeps binary for when "ternary and cartesian both genuinely do
not fit" (`SKILL.md:160`) and requires 3 to 5 tensions per article (`:279`), so a second debate is
always on hand. Both binaries on record hid a richer shape: education's hid the means-tested middle
(`_recovered/skills/opinion-mapper/TUNING_QUEUE.md:50-78`), and Far Shore's hides an author who
holds both ends.

**The cartesian.** Crossing two splits raises or lowers bias depending on the
measure (Mullen, Migdal and Hewstone 2001), so the cartesian earns no intergroup credit. Its case
is honesty where an article carries two debates, and the Brief's own launch recommendation
(`Dialecta_Project_Brief.md:124`), which none of the seven live maps follows.

## The poles

| Test | Fails on | The engine's better material, same call |
| --- | --- | --- |
| Each pole answers the question as asked | Far Shore: "Drift to excess" is a prediction, not a need | Its tensions "Freedom or constraint as the soil of meaning" and "Reading human nature under abundance" |
| Each pole is named as its holders would name it | Far Shore: "Drift to excess" from the objection's "drift toward distraction, excess"; "Fixed tradition" from the essay | Its tension "Inherited tradition versus open inquiry". On Doubt and Devotion it did this right: the essay's options include "pretend", the pole reads "Settle the doubt" |
| Three poles answer one question | Far Shore and solar ternaries each straddle two of the engine's own tensions, failing the skill's exclusivity check (`SKILL.md:193`) | Solar's tensions name both axes: "Updated data vs. projection skepticism", "General evidence vs. local specifics" |
| The map would not fit another article on the topic unchanged | Education: "How should education be funded?" fits any essay; this one argues for schooling without borders | Its cartesian candidate asked "How far should free school reach?", ranked 0.62 under the ternary's 0.78 |

Three of twenty live poles, "Free for all", "Pay your way" and "Trust the data", appear verbatim in
the skill's list of "deliberately generic" labels (`SKILL.md:92-101`), which asks the model not to
copy them, in a skill whose closing section says it holds no pole examples (`:287`). Whichever came
first, the list now teaches generic. The ranking does the rest: ternary is preferred as "the
platform's strongest tool against tribal polarization" (`:119`), all seven live maps are the
engine's wording verbatim, and six are what it recommended. The proxy, three corners, has
displaced the target, a reader finding their own view on this article's question.

The holder test is where the thesis lives. Article 6 admits any honestly argued position
"regardless of where they stand" (`docs/Dialecta_Founding_Philosophy.md:81`). A reader who lives
inside a tradition opens Far Shore's map and finds their position named in its critic's vocabulary,
in the platform's voice.

## The author's mark

"Where the author lands" (`strings.ts:2827`) is the engine's estimate. In all seven live maps
`author_position` equals the engine's proposed coordinate exactly; the picker passes it through
(`_recovered-next/lib/theme/dialecta-opinion-map-picker.jsx:67`, `:83`, `:92`) and the editor
never lets the author move it. It sits under "The Author's Declaration" in `--brass-mid`,
`#b8862e` (`apps/web/src/styles/dialecta-surfaces.css:55`), the gold the design spec reserves to
mean "this is the standard" (`design/dialecta-design-spec.html:267`). The skill shows it "only to
readers who choose to look at it" (`SKILL.md:34`); the build draws it for everyone
(`engine.tsx:319`, `:412-417`, `:517`).

Reflect hides it pre-read so a first mark is not "anchored by seeing where the author landed"
(`apps/web/src/components/article-declaration/declaration.tsx:198-202`); Declare shows it on the
figure the reader is placing on (`:164`). One randomized prior up-vote raised the likelihood of the
next up-vote 32 percent and final ratings 25 percent across about 100,000 comments (Muchnik, Aral and
Taylor 2013); limit, a vote on another's comment is not a self-placement. Once the delta exists, a
move toward the brass dot cannot be told from anchoring, and the Reviser records conformity as
revision, against the Delta spec's rule that the platform "must not create any social pressure
toward visible change" (`docs/Dialecta_Delta_Mechanic_Spec.md:83`).

## The overlay

Declare opens on about 240 words of the author's declaration and the maps; the engine's 445 sit
behind a collapsed summary (`declaration.tsx:93`), here and on live. Order and ownership matter
more than the count.

**The lead.** Inducing people to consider the opposite, including with materials that make it
salient, corrected more biased assimilation than telling them to be fair (Lord, Lepper and Preston
1984). The Strongest Objection is that material; the Template says it "establishes the floor of the
discussion" (`docs/Dialecta_Article_Editorial_Template.md:57`), and the design spec's Advocate Card
is its surface (`dialecta-design-spec.html:600`). Readers scan: in a 25-person log, nearly half of
first visits to a page lasted under 12 seconds, and those pages averaged 430 words (Weinreich et
al. 2008). The first field today is the Core Claim, restating what the reader just finished.

**Two cuts.** The Note to the Author is "the Stage 2.5 reflection" (`SKILL.md:270`), a card the
design spec places "between submission and publishing" (`dialecta-design-spec.html:544`), and the
Editorial Voice keeps "anything that reads as a verdict on the author" from a reader browsing tiers
(`docs/Dialecta_Editorial_Voice.md:53`). Published, a narrowcast becomes a broadcast, the condition
that raises self-presentation (Barasch and Berger 2014, P-4): an author who knows the coaching goes
public answers Stage 2.5 for the crowd. It breaks the symmetry the Template calls its integrity
point (`:175`), since a commenter's message reaches the commenter alone
(`docs/Dialecta_Classification_Engine_Specification.md:75`). And Far Shore's note is from a later
reading than the author answered: the re-setup endpoint replaces `ai_analysis` whole
(`_recovered/api/article/admin-resetup-maps.js:99-105`), the row was rewritten 2026-05-03 after
publication on 04-27, and the column written at submission still says Forum where the analysis says
Spark. The second cut is the detected core claim when it agrees. It hides only on an exact string match
(`declaration.tsx:140-143`), and all five live rows read `aligned`.

**The passages.** The marked passages stay, quoted, with reasons: they are the part a reader can check,
and legitimacy decides whether a reader reflects or dismisses (P-2). The voice demonstration folds
all three into one line about passages that "carry the piece" (voice demo, lines 83-85). One is
marked Stance because "a reader from an exclusivist tradition could read it as dismissing their
position". That is the out-group check (P-5), the one sentence in the overlay written for the
reader the essay might lose. Compress the others if space demands; keep that one whole.

**One reading per page.** The header says the engine read Forum; the overlay says Spark and advises
moving "from spark toward forum", here and on live, because the re-setup writes the analysis and
never the column. People who watch an algorithm err lose confidence in it faster than in a person
making the same error, even when it outperforms the person (Dietvorst, Simmons and Massey 2015),
and legitimacy is the variable the whole reading runs on (P-2).

**Budgets.** They bind the author. The Template already asks for the core claim in "one or two
sentences" (`:45`). An editor counter can hold authors to their own form, and the engine may say at
Stage 2.5 that a Scope Boundary argues an objection where it should bound the claim, as Far Shore's
does (voice demo, lines 38-44). An engine summary shown in place of a declaration is the platform's
voice under the author's name, and "the author's voice is the published one" is locked.

## Recommendation

| # | Change | Where | Costs | Forecloses |
| --- | --- | --- | --- | --- |
| 1 | Retire binary as a reader-facing shape; version maps, since a re-set strands placements (education's, 2026-05-04, over cartesian placements from 05-02) | Skill and schema; `classify.js` validator; editor; `opinion_map_positions` | A prompt edit, a validator case, a version column, Far Shore re-set | A map for a yes-or-no question; it becomes a cartesian with a second tension |
| 2 | The four tests above as honesty checks, with a `pole_statements` field ("[question] I think [pole]") checked per pole; delete the example list | `SKILL.md:88-103`, `:185-205`; `classify.js` | About 60 output tokens a call; one smoke run (`TUNING_QUEUE.md:149-152`) | Labels short enough to fit any article |
| 3 | Rank candidates by fit to the article's tensions; tag each with the tensions it maps | `SKILL.md:115-125`, `:181` | A prompt edit; a picker tag | The platform's thumb on ternary |
| 4 | Authors set their own mark before publishing, labeled the engine's estimate until they do; readers see it after placing or on a tap, in ink | Editor; `engine.tsx`; `placement-client.tsx`; `strings.ts:2827` | An editor step; four live authors confirm seven marks | Seeing the author's view before forming one's own |
| 5 | Show the question above every map a signed-in reader places on; Declare's interactive figures draw none | `placement-client.tsx:705-711`; `declaration.tsx:164` | Trivial | Nothing |
| 6 | Strongest Objection first, as the Advocate Card; then the maps; then Core Claim and Scope Boundary; the engine's reading collapsed last | `declaration.tsx` | A reorder, an existing component | The author's claim as the first thing read |
| 7 | Note to the Author off every reader surface; Option B already lets an author publish a reply by choice (`Article_Editorial_Template.md:103-104`) | `declaration.tsx:108` | One line | Readers seeing the engine's coaching, never among the Template's disclosed tasks (`:73-80`) |
| 8 | Detected core claim only when alignment is partial or divergent; the Stance-marked passage kept whole in any compression | `declaration.tsx:140-143` | One condition | Nothing |
| 9 | One engine tier per page: a re-run writes column and analysis together, or shows as a dated re-reading | The new app's re-setup path; Far Shore's row | Small | Nothing |
| 10 | Before Stages D to F, randomize whether Reflect is offered and log whether the author's mark was visible at placement | A flag and a field | A flag | Nothing; it says whether the pre-read mark or the brass dot moves the post-read one |

## Spec and Pact changes

- **Template Question 5** has the author's own axes seed the map (`Article_Editorial_Template.md:64-67`).
  The build dropped the field (`admin-resetup-maps.js:94`; `classify.js:218-244` never sends it)
  and no live article carries one. I'd amend it: the engine proposes from its tensions, and the
  author sets their own mark and may strike a pole as unfair to the people it names. Both of Far
  Shore's tilted poles came from the author's words about the other side, so an author-seeded map
  would carry more of the tilt.
- **The placement disclosure.** The Delta spec puts "Private until you choose to share. Never used
  to filter what you see." under the placement (`Dialecta_Delta_Mechanic_Spec.md:57-58`); the built
  copy has no such line (`strings.ts:2862-2876`). A placement at "Leave the faith" is a statement
  about someone's religion, kept with the account indefinitely (`:186-187`), and the Pact never
  mentions placements. Per P-7 it should, before the first one. The wording is Dan's, and legal's.
- **No change** to the Brief or the design spec: retiring the binary returns the prompt to the
  Brief, and the Advocate Card and the gold rule already say what I'm asking.

## Veto

A reader-facing binary map. An engine summary shown in place of an author's declaration. The
engine's estimate of a person's view presented as that person's own.

## What would change my mind

On the binary, a placement study in which readers placed on a binary and on a ternary for the same
article rate the people at the far end equally warmly: then the minimal-group evidence does not
transfer and the binary's honesty case wins. On the author's mark, recommendation 10 showing
post-read placements no nearer the mark when it is visible. On the note, authors who, asked, want
their Stage 2.5 coaching public, opted in the way their reply already is.

## Outside this question

`ai_analysis.specificity_score` on the five articles reads 9, 68, 78, 48 and 78 against the
Classification Engine Specification's 0 to 3 scale (`:38-47`), so the article Acuity trigger `>= 1`
(`docs/Dialecta_Axis_Mapping_v1.md:93`) passes every article. The solar piece, whose tier reason
cites "high specificity", scores 9. Noted for `builder`.

## Sources

| Source | Read at |
| --- | --- |
| Hartstone, M., and Augoustinos, M. (1995). The minimal group paradigm: Categorization into two versus three groups. *European Journal of Social Psychology* 25(2), 179-193. DOI 10.1002/ejsp.2420250205 | `research/1995-hartstone-augoustinos-two-versus-three-groups.md` |
| Spielman, D. A. (2000). Young Children, Minimal Groups, and Dichotomous Categorization. *Personality and Social Psychology Bulletin* 26(11), 1433-1441. DOI 10.1177/0146167200263010 | `research/2000-spielman-dichotomous-categorization.md` |
| Mullen, B., Migdal, M. J., and Hewstone, M. (2001). Crossed categorization versus simple categorization and intergroup evaluations. *European Journal of Social Psychology* 31(6), 721-736. DOI 10.1002/ejsp.60 | `research/2001-mullen-crossed-categorization.md` |
| Kaplan, K. J. (1972). On the ambivalence-indifference problem in attitude theory and measurement. *Psychological Bulletin* 77(5), 361-372. DOI 10.1037/h0032590 | `research/1972-kaplan-ambivalence-indifference.md` |
| Schwarz, N. (1999). Self-reports: How the questions shape the answers. *American Psychologist* 54(2), 93-105. DOI 10.1037/0003-066X.54.2.93 | `research/1999-schwarz-self-reports.md` |
| Lord, C. G., Lepper, M. R., and Preston, E. (1984). Considering the opposite. *Journal of Personality and Social Psychology* 47(6), 1231-1243. PMID 6527215 | `research/1984-lord-considering-the-opposite.md` |
| Muchnik, L., Aral, S., and Taylor, S. J. (2013). Social Influence Bias: A Randomized Experiment. *Science* 341(6146), 647-651. DOI 10.1126/science.1240466 | `research/2013-muchnik-social-influence-bias.md` |
| Dietvorst, B. J., Simmons, J. P., and Massey, C. (2015). Algorithm aversion. *Journal of Experimental Psychology: General* 144(1), 114-126. PMID 25401381 | `research/2015-dietvorst-algorithm-aversion.md` |
| Weinreich, H., Obendorf, H., Herder, E., and Mayer, M. (2008). Not quite the average: An empirical study of Web use. *ACM Transactions on the Web* 2(1), Article 5. DOI 10.1145/1326561.1326566 | `research/2008-weinreich-web-use.md` |
| Filed earlier: Barasch and Berger (2014); Steindl et al. (2015) | `research/2014-barasch-broadcasting-narrowcasting.md`, `research/2015-steindl-reactance.md` |
| `articles` (`declaration`, `ai_analysis`, `ai_suggested_tier`, `author_note`, dates) and `opinion_map_positions` (nine rows, 2026-05-01 to 05-06) | Project `mguulnibvzusfvyuowwh`, read only, 2026-09-21 |

## Rebuttal

The strongest point against me is legal's first: the author saw the dot and clicked Save, so the
mark is the author's. Save accepts a candidate. It does not place a dot. The picker offers two to
four packages, normalizes the chosen one, and offers no way to move the coordinate; all
seven live marks equal the engine's proposal exactly. Legal shows the dot is
defensible, not that "Where the author lands" is true. Legal's own Article 9 finding is the better
argument for row 4: legal calls a Save close to specific consent on a religion axis, and an author
who places the dot has given it.

Circulation would log an honestly binary article rather than restructure it. Row 1 forces no third
pole. It forecloses the yes-or-no map and takes a second tension, and the one live binary sits
beside a ternary on the same article, so retiring it costs a second map, not the only one.

Conceded to legal. Row 6 renders the closing disclosure sentence outside the fold, beside the tier
word: my reorder left the locked constraint true only in markup. Row 8 keeps all three marked
passages whole with their reasons, not the Stance one alone. Row 9 adopts versioning and a fresh
Stage 2.5 on any substantive re-run, which is why Far Shore's note answers a reading its
author never saw.

Conceded to circulation. Nine placements measure nothing, so the binary case rests on Kaplan and
the three to five tensions the skill already requires, not on transfer from minimal groups. But
circulation's collapse and legal's defence cannot both stand: that defence is the author's three
fields on screen beside the dot. Keep the Strongest Objection open.

Designer's uncaptioned target: when row 4 reveals the mark, caption it on every map.

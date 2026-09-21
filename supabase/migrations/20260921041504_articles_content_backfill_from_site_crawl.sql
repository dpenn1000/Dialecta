-- Content backfill for the five Ghost-era articles, from the 2026-09-08 site crawl.
--
-- Source: docs/reviews/site-snapshot-2026-09-08/<slug>.txt (also zipped at
-- _to_delete/snapshot.zip). No Ghost export exists on disk, and the Ghost Content
-- API key that scripts/import-ghost.mjs needs is not configured, so the crawl is
-- the only reachable copy of what the site published.
--
-- Writes ONLY the columns added by 20260921040353_articles_native_content_columns_additive.
-- No pre-existing column is read-modified. Every UPDATE is keyed on ghost_post_id
-- AND author_member_id, so a wrong mapping updates nothing instead of mislabelling.
--
-- Reversible by design: scripts/import-ghost.mjs upserts on ghost_post_id, so a real
-- import later overwrites every value written here with Ghost's own.
--
-- What each field is, and what it is not:
--   title, slug, topic  verbatim from the crawl. Slug = the crawl filename, which equals
--                       the slug the recovered logs pair with a literal ghost_post_id
--                       for 3 of 5. The other 2 are linked by author, which is unique.
--   excerpt             the crawl's byline line with its 'By <Name>. ' prefix removed.
--                       Custom excerpts for 3 of 5, Ghost's own truncated auto excerpt
--                       for 2 of 5 (import-ghost.mjs would write the same fallback).
--   published_at        the crawl shows a date only. Stored as 12:00 UTC so it stays the
--                       same calendar day in every US timezone. created_at was NOT used:
--                       rows 2 and 3 were backfilled on 04-29 but published 04-27 and 04-08.
--   body_html           the published text, flattened by the crawl. The crawl put every
--                       inline element on its own line; those splits are rejoined on the
--                       whitespace the crawl left around them, so sentences are whole.
--                       Italics, links and list markup are lost and are not guessed at.
--                       Short capitalised lines with no closing punctuation are rendered
--                       as <h2>: the section headings of the solar and education pieces.
--                       original_html is NOT copied in: it is the pre-polish submission.
--   body_json, declared_claims  left at their defaults. Not recoverable, not invented.
--
-- Edited after apply, self-check only. Live ran a check requiring exactly 5 filled
-- rows across the whole table, and it passed. That check raised on an empty
-- database and broke `supabase db reset` (supabase/CLAUDE.md). The check below makes
-- the same requirement on live and passes on an empty database. The five UPDATEs
-- are unchanged.

begin;

-- On the Far Shore of Fear  (Daniel Pennington; id link: literal id+slug pair in _recovered/scripts/polish-articles-2026-04-28T03-10-58-248Z.log.json)
update public.articles set
  title        = $dlx$On the Far Shore of Fear$dlx$,
  slug         = $dlx$on-the-far-shore-of-fear$dlx$,
  topic        = $dlx$Psychology & Behavior$dlx$,
  excerpt      = $dlx$A meditation on what humanity might become when survival stops being the point$dlx$,
  published_at = '2026-04-27T12:00:00Z'::timestamptz,
  body_html    = $dlx$<p>There is a number that I find impossible to actually feel, no matter how many times I encounter it.</p>
<p>The observable universe contains an estimated two trillion galaxies. Not two trillion stars. Two trillion galaxies, each containing somewhere between ten million and one trillion stars of their own. The math collapses into abstraction so quickly that the mind retreats from it, the way your eyes slide off a surface that offers no purchase. You know the number is real. You cannot make it real. The scale defeats imagination before imagination gets started.</p>
<p>I return to this number not because it is humbling, though it is, but because of what it implies about the question I keep turning over: what is a human being for?</p>
<p>Whatever the answer is, it cannot be small. It cannot be as small as survival. It cannot be as small as tribe. It cannot be as small as the particular dogmas we have carried, with such confidence, through such a brief and localized sliver of what may be an incomprehensibly vast story.</p>
<p>Against two trillion galaxies, the specific institutional claims of any religion -- the precise boundary between the saved and the unsaved, the exact doctrinal threshold between grace and damnation -- become not merely questionable but cosmically improbable. Not because truth is relative, but because smallness of that kind seems, to put it gently, unlikely in a universe that vast.</p>
<p>I am not an atheist. I want to be precise about this, because precision matters here and vagueness is its own kind of cowardice.</p>
<p>I am someone who cannot reconcile the idea of a God with a God who is petty. Who cannot believe that whatever intelligence, if any, underlies two trillion galaxies is primarily concerned with whether a person checked the right theological boxes before dying. Who looks at the moral structure of exclusivist salvation -- the good person of another tradition condemned, the bad person of the right tradition saved -- and finds not a hard teaching to accept but a contradiction in terms.</p>
<p>A God capable of that is not worth the name. A God worthy of two trillion galaxies would have to be something else entirely. Something larger than any tradition has fully captured, which is not an argument against traditions -- they have carried enormous wisdom, enormous beauty, enormous discipline -- but an argument against treating any of them as the final word.</p>
<p>What I am left with, after setting down the institutional claims, is not emptiness.</p>
<p>It is something more interesting: openness. A genuine not-knowing that feels, oddly, more honest than certainty ever did. And alongside the not-knowing, something that might be called reverence -- a persistent sense that the fact of existence, of consciousness, of the specific mystery that there is something rather than nothing, is not accidental in the shallow sense of that word. Not directed toward a predetermined end. But not random either. Something in between, which we do not yet have good language for.</p>
<p>Buddhism has always appealed to me less as a religion and more as a rigorous investigation of that in-between. It is less interested in metaphysical assertions -- is there a God, what happens after death, is the universe conscious -- than in the direct examination of experience. What is suffering, and where does it actually come from? What would it mean to be free? Not free from circumstances, which mostly cannot be controlled, but free in the sense that Marcus Aurelius meant when he wrote that nothing can harm a man who refuses to be harmed -- free from the reflexive contractions of fear, craving, and the exhausting project of building a self that needs constant defending. That freedom is not a theological position. It is a practice. And it is available, if the practitioners across thousands of years are to be believed, to anyone willing to do the work.</p>
<p>This is the spiritual inheritance I carry: a reverence without a fixed address. A conviction that the universe is larger than any account of it. A gratitude that feels like more than mere sentiment. And a growing suspicion that the highest form of whatever we might call spiritual life is not the correct performance of belief but the willingness to keep asking the question honestly, wherever it leads.</p>
<p>Now here is where it gets strange. And wonderful.</p>
<p>Humanity is, with fair confidence, at the very beginning of its story. We are not a mature civilization. We are something closer to an adolescent species -- powerful enough to do enormous harm, not yet wise enough to reliably prevent it, aware in some dim way that we are capable of something beyond what we are currently managing. The gap between what we are and what we could be is not a cause for despair. It is the most interesting open question in the known universe.</p>
<p>What happens when that adolescent species grows up?</p>
<p>What happens when the organizing pressures of scarcity -- the need to compete for food, territory, status, survival -- are no longer the primary forces shaping human behavior? What happens when advanced technology, over some span of decades or centuries, genuinely removes the compulsory dimensions of labor? When no one has to do something degrading to keep eating. When the baseline of material security is so reliably provided that the mind is freed, for the first time in the species' history, to ask what it actually wants?</p>
<p>This is not a fantasy. It is a direction that serious people -- engineers, economists, scientists, philosophers -- believe is possible within timescales that are, by civilizational standards, not very long. We are not there. We are not close. But the trajectory is legible, and it asks a question that most civilizations have never had to seriously confront: what do people do when they don't have to do anything?</p>
<p>Iain Banks spent a career exploring this question in fiction, and his answer was more honest than utopian. In the Culture, his imagined post-scarcity civilization, material abundance does not solve the problem of meaning. It relocates it. When everything can be provided, the only things that cannot be manufactured are genuine achievement, authentic connection, and the specific dignity of having chosen your life rather than had it chosen for you by necessity. Citizens find identity through intrinsic passion -- through work done because it is loved, through games played because winning matters, through relationships entered because they are worth entering.</p>
<p>The scarce thing turns out to be quality, in the deepest sense: the real thing, the chosen thing, the thing that cannot be faked or distributed.</p>
<p>Banks was writing science fiction. He was also writing philosophy. The question his novels keep asking is the question that post-scarcity forces into the open: in the absence of need, what is a human life for?</p>
<p>I think the honest answer is: we do not know yet. And I think that not-knowing is exactly right.</p>
<p>The traditions that have tried to answer it -- religious, philosophical, political -- have all been answering it under conditions of scarcity. Every ethical system we have inherited was developed by people for whom survival was a live question, for whom death was close, for whom resources were limited and their distribution a matter of constant contest. The virtues those conditions produce are real virtues -- courage, patience, endurance, solidarity, the willingness to sacrifice for something beyond yourself. These are not going away. But they are not the whole of what is possible.</p>
<p>What virtues become available when fear is no longer the organizing principle? When the anxiety of not having enough is lifted from the baseline of existence, what does the human being reach for?</p>
<p>I find myself believing -- not with certainty, but with something that feels like earned conviction -- that what people reach for, when fear is genuinely removed, is beauty. And meaning. And depth of connection. And the specific pleasure of understanding something that was previously dark. Not everyone, not automatically, not without new challenges we cannot currently foresee. But as a central tendency of a species that has always, even under the worst conditions, found ways to make art and ask questions and love people with a completeness that survival alone cannot explain.</p>
<p>There is something in human beings that reaches beyond what survival requires. We have always known this. We have built cathedrals when we could have built shelters. We have composed music when we could have been sleeping. We have written philosophy when we could have been hunting. The impulse toward transcendence -- toward the things that matter beyond utility -- has been present in every culture, in every era, under every set of material conditions. It is not a luxury of abundance. It is something closer to the species' deepest nature.</p>
<p>Post-scarcity does not create this impulse. It unmasks it. It removes the constant pressure of survival that has, for most of history, kept the impulse suppressed or redirected, and allows it to become the organizing principle of a life rather than its occasional overflow.</p>
<p>Freedom is terrifying.</p>
<p>Not in the dramatic sense of a specific fear, but in the structural sense: when the answer to "what must I do?" is "nothing that you don't choose," the question "what should I choose?" becomes genuinely open in a way that no tradition or institution fully prepared us for. Viktor Frankl, writing from Auschwitz, argued that the freedom to choose one's response to any given set of circumstances is the last of human freedoms. He was right. But he was writing about freedom within constraint. The freedom of post-scarcity is the freedom of open constraint. The field is not clarified by necessity. Everything is available. And everything available can feel, to a being still running on the evolutionary software of a survival-pressured animal, like nothing at all.</p>
<p>This is the Culture's real problem, and Banks was honest enough to name it:</p>
<p>Freedom without purpose can produce decadence as readily as flourishing. Citizens who drift through simulated realities, who cannot find anything genuinely worth caring about, who accumulate experiences the way their ancestors accumulated provisions, without ever asking what the experiences are in service of. The post-scarcity problem is not poverty. It is meaninglessness. And meaninglessness is, I would argue, a spiritual problem in exactly the sense I meant earlier: a problem about what a person is for, which no material provision can answer.</p>
<p>The way through is something more demanding: the development of a relationship to meaning that does not depend on compulsion.</p>
<p>This is what every serious spiritual tradition has always been pointing toward, in its own language. The Stoics called it virtue -- the cultivation of a character that can find the good worth pursuing under any external conditions. Buddhism calls it non-attachment -- the capacity to engage fully with life without requiring life to be other than it is. Christianity, at its best and deepest, calls it love -- the orientation toward the good of the other that transforms the will from a machine of desire into something capable of genuine gift. None of these traditions were designed for post-scarcity. All of them contain, embedded in their practice, the tools for navigating it.</p>
<p>What would it mean to take those tools seriously, not as religious obligations or cultural inheritances, but as genuine disciplines for the specific challenge of being free?</p>
<p>I want to end with something I cannot prove, but believe.</p>
<p>Two trillion galaxies. The number I mentioned at the start. I return to it because I think it is asking us something.</p>
<p>If that scale is real -- and it is -- then the probability that the emergence of consciousness on this particular planet is the only emergence of consciousness anywhere is so small as to be, practically speaking, zero. Somewhere in that incomprehensible expanse, other minds have formed. Other civilizations have risen, wrestled with their own versions of scarcity and fear and the question of what life is for, and perhaps -- across the vast majority of possible timescales -- found their way to something we cannot yet imagine. Some may have been consumed by the same impulses that threaten us: the tribalism, the fear, the will to dominate. Others may have survived and grown into things that would make our current civilization look like a preliminary sketch.</p>
<p>We do not know. We may never know, given the physics of distance and time. But the possibility exists, and the possibility is enough.</p>
<p>It is enough to hold open the question: what does a civilization look like on the far shore of fear? What is possible for a species that has genuinely moved beyond the organizing pressures of scarcity and survival -- not as a thought experiment but as a lived reality -- and turned its full intelligence and creativity toward the question of what a life, and a civilization, ought to be?</p>
<p>I do not know the answer. Neither do you. Neither, I suspect, does anyone currently alive.</p>
<p>That is not a problem. That is the most exhilarating thing I can think of.</p>
<p>We are early. We are unfinished. We are a species that has, despite everything, never stopped building cathedrals when it could have built shelters.</p>
<p>Whatever we are reaching toward, we have been reaching toward it for a very long time, through conditions that would have extinguished the impulse if it were not, in some deep sense, constitutive of what we are.</p>
<p>The far shore of fear is not a destination. It is a direction. And we are, however slowly and however imperfectly, moving toward it.</p>
<p>That is enough to keep going. More than enough.</p>$dlx$
where ghost_post_id = '69eff72be5eec200010d5310'
  and author_member_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8';

-- On Doubt and Devotion: When Faith Pauses  (Maya Reiss; id link: literal id+slug+title in _recovered/scripts/backfill-orphan-articles-2026-04-29T01-26-15-817Z.log.json)
update public.articles set
  title        = $dlx$On Doubt and Devotion: When Faith Pauses$dlx$,
  slug         = $dlx$on-doubt-and-devotion-when-faith-pauses$dlx$,
  topic        = $dlx$Theology & Spirituality$dlx$,
  excerpt      = $dlx$Faith is often mistaken for certainty, but it may be something far more demanding: the willingness to continue in the presence of doubt. Not-knowing isn't a failure of faith; it's what gives it meaning.$dlx$,
  published_at = '2026-04-27T12:00:00Z'::timestamptz,
  body_html    = $dlx$<p>One prominent Christian framing treats doubt as a problem to overcome, a temporary obstacle on the way back to settled belief. That framing has done real damage. It teaches people to hide their doubts rather than hold them, and the hidden doubt almost always grows.</p>
<p>Kierkegaard, on the other hand, did not think doubt was the opposite of faith. He thought it was constitutive of it. Faith was not the absence of question; it was a posture sustained in spite of question. To remove the doubt was to remove the structural tension that made faith something other than mere conviction.</p>
<p>I am drawn to this not because it lets me feel better about my own pauses (though it does) but because it makes a specific claim about what faith is.</p>
<p>If faith is a movement made in spite of incomplete information, then doubt is not the antagonist of faith. It is the condition that makes the movement meaningful.</p>
<p>The pastoral consequence matters more than the theology. When a thoughtful person stops being able to recite the creed without flinching, the responses available to them are usually three: pretend the flinch isn't there, leave the tradition entirely, or descend into a private crisis the community cannot see. None of these are good.</p>
<p>The fourth option, which most traditions name but most parishes don't actually practice, is to continue showing up with the flinch. Praying anyway. Reading the difficult passage anyway.</p>
<p>Letting the question sit without resolving it artificially.</p>
<p>Simone Weil wrote that twenty centuries of Christianity will need a thousand years of attention to be understood. That is a long time. It implies we are all somewhere in the middle of the work, and "the middle" is allowed to look like doubt.</p>
<p>I have not stopped going to church because I sometimes don't know what I'm doing there.</p>
<p>I have come to think that not-knowing-quite-what-I'm-doing is part of going.</p>$dlx$
where ghost_post_id = '69efc475e5eec200010d5299'
  and author_member_id = 'seed:maya';

-- The Conversation Communities Keep Having About Solar (And What the Evidence Actually Says)  (Daniel Pennington; id link: literal id+slug+title in _recovered/scripts/backfill-orphan-articles-2026-04-29T01-26-15-817Z.log.json)
update public.articles set
  title        = $dlx$The Conversation Communities Keep Having About Solar (And What the Evidence Actually Says)$dlx$,
  slug         = $dlx$the-conversation-communities-keep-having-about-solar-and-what-the-evidence-actually-says$dlx$,
  topic        = $dlx$Environment & Energy$dlx$,
  excerpt      = $dlx$Community debates about solar are still driven by assumptions that no longer align with the evidence. The data has moved on cost, durability, and impact, but the conversation, in many places, has not.$dlx$,
  published_at = '2026-04-08T12:00:00Z'::timestamptz,
  body_html    = $dlx$<p>Every community solar debate seems to follow a similar pattern. A developer files a petition. Public hearings are scheduled. Neighbors begin raising concerns about the environment, the cost, the panels themselves. The conversation gets heated, and passionate opposition often becomes the loudest voice in the room. Someone mentions landfills. Someone else brings up property values. The project either advances or stalls, and fact-based discourse often becomes overshadowed by rising emotions.</p>
<p>I've been watching this play out in my own town, Manchester, Connecticut, where a proposed 1.2-megawatt solar installation on Lake Street has been working through the Connecticut Siting Council since August 2025. The concerns I've heard in this community are, without exception, the same concerns I've seen documented in similar disputes in Wisconsin, Colorado, and across New England. They are understandable concerns. They deserve a close look, and an honest attempt to separate what the evidence shows from what we've assumed for a long time.</p>
<p>That's what this article is about. Not whether any particular project should be approved. Not about undermining the value of community opinion. But whether the most common technical objections to community-scale solar are well-informed by what we actually know in 2026, so that members of these communities can think clearly and engage in productive, fact-based discourse.</p>
<p>I'll try to address that gap today, with genuine respect for everyone who cares enough about their community to show up and push back. That passion is not the problem. The goal here is to make sure it has accurate information to work with.</p>
<h2>What the Objections Are, and Where They Come From</h2>
<p>The five concerns that appear most consistently in community solar disputes are:</p>
<p>That solar development damages the local environment. That large-scale clearing, soil disruption, and stormwater runoff cause lasting ecological harm.</p>
<p>That solar panels degrade quickly and become a liability. That a community is taking on a system that will fail within 15 years and leave someone holding the cleanup.</p>
<p>That utility-scale solar is expensive and ratepayers absorb that cost. That the economics are worse than alternatives and that the public subsidy is hidden.</p>
<p>That old panels end up in landfills. That the industry's sustainability promise falls apart at end of life when toxic materials leach into soil and water.</p>
<p>That long-term Power Purchase Agreements lock communities into unfavorable contracts. That electricity prices could fall over a 25-year horizon, leaving the fixed rate looking expensive in hindsight.</p>
<p>These are not frivolous concerns. Several of them were well-founded a decade ago. The problem is that the conversation is still being conducted as if the evidence and technology hasn't evolved. It has.</p>
<h2>The Environmental Question</h2>
<p>Construction is genuinely disruptive. Grading, earthwork, and stormwater runoff during the build phase are real risks that require real management. The EPA's stormwater standards exist precisely because large land disturbances near waterways need engineered controls. If those controls aren't in place, or aren't enforced, the concern is legitimate.</p>
<p>The confusion enters when construction-phase risk gets conflated with operational risk.</p>
<p>Once a solar array is installed and the ground stabilizes, its ecological footprint is modest by any reasonable comparison. The USDA Natural Resources Conservation Service identifies solar farms as compatible with many conservation goals when properly sited, with documented benefits to soil health and wildlife corridors that develop between and beneath panels over time.</p>
<p>Pollinator habitat is a concrete and well-documented co-benefit. Native grasses and wildflower mixes planted beneath panel rows create low-disturbance environments that bees and butterflies actively prefer over conventionally farmed or maintained turf land. This approach, called agrivoltaics, is increasingly standard rather than exceptional.</p>
<p>A 2026 study of the Gemini Solar Project in the Mojave Desert found something more surprising. Researchers documented that the three-corner milkvetch, a rare desert plant, was thriving beneath the array. Plants in the shaded zones grew taller and wider than open-field specimens, and produced more fruit. The shade cast by the panels reduced soil moisture evaporation enough to create near-optimal conditions for a species that was struggling in open land nearby.</p>
<p>The alternative energy source doing most of New England's heavy lifting is natural gas, which provides roughly half the region's electricity.</p>
<p>The environmental costs of that supply chain, well pads, compressor stations, methane leaks during extraction, pipeline infrastructure, and combustion emissions at point of use, don't appear on a local zoning map. They're distributed across other geographies and other communities. The comparison isn't between solar and some pristine baseline. It's between solar and what's already running.</p>
<h2>The Degradation Question</h2>
<p>Early solar panels, particularly those manufactured in the 1970s and 1980s, degraded much more quickly than the technology that followed.</p>
<p>The concern does have some historical context.</p>
<p>The first practical silicon solar cell was demonstrated at Bell Laboratories on April 25, 1954. Seventy years of engineering refinement have produced a product that performs very differently than its ancestors.</p>
<p>Modern Tier 1 panels degrade at roughly 0.4 to 0.5 percent of output per year.</p>
<p>Five years ago the industry average was around 0.7 percent. Premium manufacturers including Panasonic, Hanwha Awrospace (Q-Cells), and SunPower have achieved rates as low as 0.25 to 0.30 percent annually.</p>
<p>What this means in practice: a panel installed today retains approximately 96 percent of its output at year ten, and roughly 91 percent at year twenty-five.</p>
<p>Most manufacturers now back these figures with 25 to 30-year performance warranties, with some extending to 40 years. A National Renewable Energy Laboratory analysis of nearly 2,000 solar systems worldwide found that actual measured degradation was consistently better than the warranted rates.</p>
<p>Panels installed in the early 1980s, the era that gave the degradation concern its teeth, are still generating electricity.</p>
<p>The obsolescence question comes up separately: won't next-generation technology make current panels worthless?</p>
<p>Perovskite-silicon tandem cells have achieved laboratory efficiencies exceeding 34 percent. But as of 2026, they remain 3 to 5 years from reliable commercial availability, and considerably further from being cost-accessible for most installations. Oxford PV, one of the leading manufacturers, currently offers only a 10-year warranty on its commercial tandem modules.</p>
<p>More to the point: a more efficient panel developed ten years from now doesn't reduce what an existing installation produces.</p>
<p>The argument that communities should wait for better technology is structurally equivalent to the argument for not purchasing a car because a better model will eventually exist.</p>
<h2>The Cost Question</h2>
<p>The cost comparison runs in the opposite direction from what most public debate assumes.</p>
<p>Utility-scale and community-scale solar is among the least expensive forms of electricity generation currently available. A study by economists at The Brattle Group compared the per-kilowatt-hour generation costs of utility-scale solar against equivalent residential rooftop installations in a representative utility setting. The reference case finding: $0.083 per kWh for utility-scale versus $0.167 per kWh for residential-scale. The gap across their modeled scenarios ranges from $0.067 to $0.092 per kWh. The same study found that environmental reductions from utility-scale PV are approximately 1.5 times as large as for equivalent residential installations, owing to higher output per unit of installed capacity.</p>
<p>Three factors drive the cost advantage: lower installed costs per watt at larger scale, greater output from optimized panel orientation and single-axis tracking, and economies in operations and maintenance that rooftop systems cannot replicate.</p>
<p>Once operational, a solar facility has no fuel to purchase. No commodity exposure. No pipeline. Its primary cost is maintenance, a fraction of what gas, coal, or nuclear plants require. The structural benefit to all ratepayers is measurable and documented.</p>
<p>Connecticut's solar fleet was projected to generate approximately 1,133 GWh in 2025. That production delivers four distinct cost reductions to every customer in the state, whether or not they have panels of their own.</p>
<p>Wholesale price suppression. When large numbers of solar installations produce simultaneously during peak hours, they reduce total grid demand at the moments when wholesale electricity is most expensive to produce. This Demand Reduction Induced Price Effect (DRIPE) lowers the clearing price across the entire New England market.</p>
<p>Summer peak reduction. In 2024, behind-the-meter solar reduced Connecticut's peak summer demand by 300 to 400 megawatts, blunting the most expensive hours on the grid.</p>
<p>Infrastructure deferral. Distributed generation reduces load on transmission and distribution systems, allowing utilities to defer or cancel expensive upgrades. Transmission savings alone are estimated at $29.24 per kilowatt-year; distribution savings add $30.89 per kilowatt-year.</p>
<p>Line loss reduction. Traditional generation loses roughly 11 percent of output as heat during long-distance transmission. Local solar avoids those losses entirely.</p>
<p>The aggregate estimated avoided cost from Connecticut's residential solar generation in 2025: $151.6 million, distributed across all ratepayers.</p>
<h2>The Landfill Question</h2>
<p>Ten years ago this was the right concern to raise. The recycling infrastructure for photovoltaic panels was genuinely underdeveloped, and end-of-life disposal was a real gap in the industry's sustainability narrative.</p>
<p>The economics of that gap have shifted.</p>
<p>End-of-life panels contain materials with real recovery value: aluminum frames, tempered glass, silver, copper, and silicon.</p>
<p>That value is beginning to drive private investment in recycling infrastructure. Hanwha Qcells, responsible for approximately one in three rooftop panels installed in the United States, launched its EcoRecycle program in 2025. It is the first U.S. initiative by a crystalline silicon solar manufacturer to manage the full panel lifecycle from sale through end-of-life recovery. Their Cartersville, Georgia facility is designed to process approximately 250 megawatts of panels annually, recovering materials for reuse in American manufacturing. In 2023, Qcells also launched an Extended Producer Responsibility program, taking direct responsibility for its panels at end of life.</p>
<p>The Solar Energy Industries Association's National PV Recycling Program, founded in 2016, now networks recycling and refurbishment providers across the country. The total recovered value of end-of-life crystalline modules is projected to grow from approximately $122 million in 2025 to $12 billion by 2035, a trajectory that is pulling private capital into the infrastructure needed to make responsible disposal standard rather than exceptional.</p>
<p>A project installed today reaches end of life in 25 to 30 years. The recycling economy that will exist in 2050 will not resemble the one critics were rightly describing five years ago.</p>
<h2>The PPA Question</h2>
<p>Power Purchase Agreements deserve careful scrutiny. A 20 to 25-year contract is a long commitment, and the legitimate risk is real: if wholesale electricity prices were to fall significantly over that period, a fixed rate could look expensive in hindsight.</p>
<p>It's worth spending a moment with what falling electricity prices would actually require.</p>
<p>Connecticut's average retail rate was 10.9 cents per kilowatt-hour in 2000. By 2020 it had reached 23.3 cents, a 114 percent increase in two decades. Between 2024 and 2025, U.S. electricity prices rose 5.1 percent in a single year, nearly double the general inflation rate. The average American household's monthly electric bill climbed from $121 in 2021 to $144 in 2024.</p>
<p>The forces behind those increases are not stabilizing.</p>
<p>Global electricity demand from data centers is projected to more than double by 2030, driven primarily by AI infrastructure. The International Energy Agency's Electricity 2025 report identified this as one of the most significant near-term demand drivers on record. Electric vehicles will add to grid demand on top of that.</p>
<p>U.S. electricity consumption overall is projected to grow 25 percent by 2030 and 78 percent by 2050. Three major grid regions could face capacity shortfalls as soon as 2028 without significant new generation coming online.</p>
<p>New England carries a structural vulnerability that compounds this. With roughly half its electricity supplied by natural gas, the region is exposed to pipeline constraints that produce sharp winter price spikes with regularity. A fixed-rate solar PPA has no fuel cost. No commodity exposure. No pipeline. Over a 25-year horizon, that predictability has a quantifiable value that the abstract risk of price decline needs to be weighed against.</p>
<p>None of this means every PPA is good or that contract terms don't merit scrutiny. The Connecticut Siting Council review process for projects like Lake Street exists precisely to examine those terms in detail before any approval. That's the right venue for that analysis.</p>
<h2>What This Means for the Conversation</h2>
<p>The point isn't that solar is beyond criticism or that every proposed installation is well-sited or well-designed. Some aren't. Site selection matters. Construction management matters. Proximity to wetlands and water supplies is a legitimate concern that requires specific, engineered answers.</p>
<p>The point is that the most common objections circulating in community solar debates in 2026 are largely disconnected from where the evidence currently sits. They were formed in response to a technology that existed 10 to 15 years ago, and they haven't been updated.</p>
<p>That gap has consequences. Communities making decisions about energy infrastructure based on outdated assumptions about solar technology are making those decisions poorly, regardless of which direction they decide in.</p>
<p>The conversation can be better. It requires the same thing any good argument requires: precise claims, honest engagement with what the evidence shows, and the willingness to update when the data moves.</p>
<p>The data on solar has moved considerably. The conversation, in most communities, has not.</p>
<p>Daniel E. Pennington is a Manchester, CT resident writing independently. The Lake Street Solar Project (Petition PE1688) is currently under review by the Connecticut Siting Council.</p>
<h2>Sources</h2>
<p>1. Press Herald / ISO-NE, "Does New England Rely on Natural Gas for About Half of Its Electricity?" April 2026. CT retail rate history: U.S. EIA Connecticut Retail Average. Price inflation: Bipartisan Policy Center / EIA. Household bill data: EIA via Palmetto / Pew Research Center.</p>
<p>2. International Energy Agency, Electricity 2025 (April 2025).</p>
<p>3. ICF load growth forecast via Pew Charitable Trusts (September 2025); Utility Dive / ICF capacity shortfall analysis (May 2025).</p>
<p>4. Popular Science, "Solar Farm Construction and EPA Water Violations."</p>
<p>5. USDA Natural Resources Conservation Service, Conservation Considerations for Solar Farms (March 2024).</p>
<p>6. Clean Wisconsin, "Analysis Uncovers Local Environmental Impacts of Solar Farms in Wisconsin."</p>
<p>7. Desert Research Institute / Ecoportal, "Solar Panels Help Rare Plant Grow," April 2026.</p>
<p>8. National Renewable Energy Laboratory, Photovoltaic Degradation Rates: An Analytical Review.</p>
<p>9. SolarQuotes, "How Long Do Solar Panels Last? Degradation Rates Compared," February 2026.</p>
<p>10. Okon Recycling / NREL, premium manufacturer degradation rate data, July 2025.</p>
<p>11. ReviewMySolar, "Solar Panel Degradation Rate Explained," August 2025.</p>
<p>12. American Physical Society / ETHW, Bell Laboratories first silicon solar cell, April 25, 1954.</p>
<p>13.Shockley-Queisser limit: Cambridge Photon Technology / Wikipedia.</p>
<p>14. SurgePV, "Perovskite Solar Technology," 2026.</p>
<p>15.Sunsave / pv-magazine, "Perovskite Solar Panels: Are They Worth Waiting For?" January 2026.</p>
<p>16. The Brattle Group, "Comparing the Costs of Utility-Scale and Residential-Scale PV."</p>
<p>17. The Brattle Group (ibid.), environmental reduction comparison.</p>
<p>18. Hanwha Qcells, EcoRecycle Program (launched 2025); EPR Program (launched 2023).</p>
<p>19. Solar Energy Industries Association, National PV Recycling Program (founded 2016).</p>
<p>20. Okon Recycling, end-of-life crystalline module value projections.</p>
<p>21. Connecticut Siting Council, Petition PE1688.</p>
<p>22. Connecticut Solar Ratepayer Analysis (2025 projections).</p>
<p>23. Connecticut Senate Bill 4 (effective 2026), Solar Energy Adjustment.</p>$dlx$
where ghost_post_id = '69d5c5c083cd72000193f0cd'
  and author_member_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8';

-- Knowledge Without Borders: Why Education Must Be Free  (Rylie Pennington; id link: author is unique: Rylie has exactly one article row and one snapshot byline)
update public.articles set
  title        = $dlx$Knowledge Without Borders: Why Education Must Be Free$dlx$,
  slug         = $dlx$knowledge-without-borders-why-education-must-be-free$dlx$,
  topic        = $dlx$Economics$dlx$,
  excerpt      = $dlx$Education should be free worldwide because everyone should have access to the same resources, regardless of money, to create equal opportunities. Equal education would decrease poverty because better education provides people with the skills needed for more job…$dlx$,
  published_at = '2026-04-29T12:00:00Z'::timestamptz,
  body_html    = $dlx$<p>Education should be free worldwide because everyone should have access to the same resources, regardless of money, to create equal opportunities. Equal education would decrease poverty because better education provides people with the skills needed for more job opportunities with greater salary. In order for there to be equal education, teachers should be paid fair wages, and schools should have equal classroom supplies so that every student can succeed. Although people may argue that free education would cost too much money for the government, if people are equally educated, there would be an increase in higher paying jobs, which would bring more money to the government and reduce poverty. Education should be provided to all children worldwide, regardless of economic status, because when children are equally educated, the world will succeed.</p>
<p>Free education worldwide would decrease poverty because education leads to greater opportunities and higher paying jobs. Children everywhere would learn how to read and write, as well as other subjects like math, science, social studies, and technology. With these skills, students gain the knowledge needed to eventually get jobs with good earnings. They grow up to take care of their families, which will help break the cycle of poverty. The World Bank Group is an international organization and largest source of funding for education in developing countries. One way it works to reduce poverty is through building schools and training teachers. Per the World Bank Group, "In low- and middle-income countries, the share of children living in Learning Poverty (that is, the proportion of 10-year-old children that are unable to read and understand a short age-appropriate text) increased from 57% before the pandemic to an estimated 70% in 2022." (The World Bank, 2025, paragraph 5). The World Bank also agrees that education is the key for good jobs and to end poverty. According to the World Bank Group, "For individuals, education promotes employment, earnings, health, and poverty reduction. Globally, there is about a 10% increase in hourly earnings for every extra year of schooling. For societies, it drives long-term economic growth, spurs innovation, strengthens institutions, and fosters social cohesion." (The World Bank, 2025, paragraph 2). Free education worldwide is needed now to help reduce poverty and youth can succeed in the world today.</p>
<p>In order for education to be equal, teachers' salaries should be fair and schools should have comparable classroom supplies. When teachers are reasonably paid at all schools, regardless of where the school is located, this will attract quality teachers who will provide a good education for the students. Fair wages for teachers will also convince them to continue teaching at that school. According to the NEA, National Education Association, "The research finds that providing students with qualified, fully prepared teachers is a critical component for raising student achievement," said Anne Podolsky, lead author of "California's Positive Outliers: Districts Beating the Odds," who added that she believes the findings should show education policymakers "the importance of [educator] recruitment and retention." (Flannery, 2019, paragraph 2). All schools should also have quality classroom supplies, like textbooks, technology, and stationary. If all schools had great classroom equipment, the quality of the children's education would improve. With higher paying wages for teachers and excellent classroom resources, children would have a better education, increasing their chance to succeed.</p>
<p>Some people argue that free education would be too much money for the government and tax-payers. However, if education was free and equal, people would get jobs with higher paying salaries and pay more taxes, which would put money back into the government. The cycle of free education would continue from there and the economy would improve. According to an article from Brookings Institution, a non-profit research organization, "As an economic elevator, quality education fuels pathways to greater opportunity and progress. Higher educational attainment is associated with higher earnings, longer productive lives, better physical and mental health, resilience and adaptability, and personal development and fulfillment. For the macroeconomy, education is a catalyst for human and social capital development, driving long-term economic growth." (Goulas, 2024, paragraph 1). Although free education worldwide doesn't necessarily mean that it's "free", providing education to children everywhere would improve the economy.</p>
<p>Education should be free worldwide because all children should have access to the same resources, regardless of money, to create equal opportunities and improve the whole economy. Poverty would decrease and people would have the skills needed to get jobs with higher paying salaries. For education to be equal, teachers need to be paid fair wages, and all schools should have adequate classroom supplies and equipment. Although free education would cost the government, if people are equally educated, there would be an increase in higher paying jobs, which would bring more money to the government through taxes and decrease the poverty cycle. If education was provided to all children worldwide, regardless of their economic status, the whole world would benefit.</p>
<h2>Works Cited</h2>
<p>Flannery, M. E. (2019, June 25). Report: Experienced teachers key to students beating the odds. NEA Today. https://www.nea.org/nea-today/all-news-articles/report-experienced-teachers-key-students-beating-odds</p>
<p>Goulas, S. (2024, June 27). Twelve facts about the economics of education. Brookings. https://www.brookings.edu/articles/twelve-facts-about-the-economics-of-education/</p>
<p>The World Bank. (2025, October 28). Education Overview. World Bank. https://www.worldbank.org/en/topic/education/overview.</p>$dlx$
where ghost_post_id = '69f2594b4e51770001fb51d7'
  and author_member_id = '7fc490f6-aa42-4d90-b387-926022503b0a';

-- The Moment You Stop Waiting for Your Life to Start  (Kathryn Pennington; id link: author is unique: Kathryn has exactly one article row and one snapshot byline)
update public.articles set
  title        = $dlx$The Moment You Stop Waiting for Your Life to Start$dlx$,
  slug         = $dlx$the-moment-you-stop-waiting-for-your-life-to-start$dlx$,
  topic        = $dlx$Psychology & Behavior$dlx$,
  excerpt      = $dlx$I am not a spontaneous person. I follow the calendar. I live by structure and schedules. I don't miss things. I check the school folder, make the lunch, pack the snack, and make sure the water bottle came home at the end of the day so it's ready again in the…$dlx$,
  published_at = '2026-04-29T12:00:00Z'::timestamptz,
  body_html    = $dlx$<p>I am not a spontaneous person. I follow the calendar. I live by structure and schedules. I don't miss things. I check the school folder, make the lunch, pack the snack, and make sure the water bottle came home at the end of the day so it's ready again in the morning. I confirm, double-check, stay ahead. That's who I am. So at 44, when I quit my job, we pulled our 12-year-old out of school, and as a family left for six weeks—Thailand, the Philippines, and a version of life with no routine, no structure, no clear plan—it didn't make sense on paper. But it made sense somewhere else. I'm a wife, a mom, a psychiatric nurse, and a breast cancer survivor. I've spent years doing what needed to be done—showing up, holding it together, taking care of everyone else. And somewhere along the way, life became something I was managing more than actually living. I thought maybe what I needed was distance—a reset, a chance to step outside of my life long enough to see it clearly. And it worked. Everything felt lighter, slower, more intentional. I wasn't rushing through my day—I was in it. Fully present in a way that felt unfamiliar, but also right. When it was time to come home, I wasn't ready. I was sad to leave—not because my life back home was wrong, but because something about how I was living over there felt better. More connected. More awake. So I had to ask myself a different question. Not how do I stay there? but why did that feel so good, and how do I bring that into my real life? Because the truth is, it wasn't just the place. It was the way I was showing up—less rushed, less distracted, more present, more willing to be where I was. That realization changed something. Maybe the goal isn't to find a place where life feels better. Maybe the goal is to build a life where you feel that way, no matter where you are. We came home without a grand epiphany. No lightning bolt. No perfectly mapped-out plan. Just a quieter kind of clarity that's harder to ignore. I don't want to go back to autopilot. I don't want to keep waiting for "someday" to feel that alive again. So we made another decision that doesn't fully make sense on paper—we're moving across the country. Not to chase a feeling, but to honor what we learned from it. Surviving cancer changes your relationship with time. Being a wife and a mother shows you how easy it is to put yourself last and call it responsibility. At some point, you realize no one is coming to tell you it's time. You decide. And maybe that's what being exactly where you're supposed to be really means—not that everything is figured out, but that you're finally paying attention to what makes you feel alive and choosing not to ignore it. Because once you've felt that, you can't unknow it.</p>$dlx$
where ghost_post_id = '69f2937b4e51770001fb5218'
  and author_member_id = '64c6e1f4-512f-4982-bbdc-7885b5e30449';

-- Self-check: every one of the five target rows that exists must now carry a title,
-- slug, date and body, or none of this lands. On live all five exist, so this
-- requires five. On an empty database (supabase db reset) none exist, the updates
-- above match nothing, and the check passes.
do $check$
declare expected int; filled int;
begin
  select count(*),
         count(*) filter (where title is not null and slug is not null
                            and published_at is not null and body_html <> '')
    into expected, filled
    from public.articles
   where ghost_post_id in ('69eff72be5eec200010d5310', '69efc475e5eec200010d5299',
                           '69d5c5c083cd72000193f0cd', '69f2594b4e51770001fb51d7',
                           '69f2937b4e51770001fb5218');
  if filled <> expected then
    raise exception 'articles content backfill: % of % target rows filled', filled, expected;
  end if;
end
$check$;

commit;

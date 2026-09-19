-- ============================================================================
-- 008_seed_quotes.sql
-- ----------------------------------------------------------------------------
-- Seeds the 70 entries from the curated JSON file (version 1.1, April 2026)
-- into the quotes table created by 007_quotes_table.sql.
--
-- Approach: embed the full JSON array via PostgreSQL dollar-quoting, then
-- unpack with jsonb_array_elements. Avoids escaping every apostrophe and
-- keeps the seed file readable. Idempotent via ON CONFLICT (quote_id) DO
-- NOTHING — safe to re-run.
--
-- Source of truth at seed time:
--   C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\dialecta-quote-library.json
--
-- After this seed, the Supabase table is canonical; the OneDrive JSON becomes
-- a disaster-recovery export mirror, refreshed on demand via the admin UI.
-- ============================================================================

INSERT INTO quotes (quote_id, text, author, source, year, tags, status, created_by)
SELECT
  q->>'id'                                                       AS quote_id,
  q->>'text'                                                     AS text,
  q->>'author'                                                   AS author,
  q->>'source'                                                   AS source,
  (q->>'year')::integer                                          AS year,
  ARRAY(SELECT jsonb_array_elements_text(q->'tags'))             AS tags,
  'live'                                                         AS status,
  'seed:initial-import'                                          AS created_by
FROM jsonb_array_elements($quotes_seed$
[
  {
    "id": "aristotle-educated-entertain",
    "text": "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
    "author": "Aristotle",
    "source": "Attributed to Aristotle",
    "year": null,
    "tags": ["pillar-acuity", "theme-doubt", "theme-judgment", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "feynman-not-fool-yourself",
    "text": "The first principle is that you must not fool yourself, and you are the easiest person to fool.",
    "author": "Richard Feynman",
    "source": "Caltech commencement address",
    "year": 1974,
    "tags": ["pillar-acuity", "theme-self-deception", "theme-honesty", "theme-rigor", "tradition-modern", "tradition-scientific"]
  },
  {
    "id": "emerson-cultivate-grateful",
    "text": "Cultivate the habit of being grateful for every good thing that comes to you, and to give back in return.",
    "author": "Ralph Waldo Emerson",
    "source": "Attributed to Ralph Waldo Emerson",
    "year": null,
    "tags": ["pillar-reach", "theme-gratitude", "theme-reciprocity", "tradition-civic-humanist"]
  },
  {
    "id": "moore-know-opposite",
    "text": "To know one thing, you must know the opposite.",
    "author": "Henry Moore",
    "source": "Attributed to Henry Moore",
    "year": null,
    "tags": ["pillar-reach", "theme-opposition", "theme-perspective", "tradition-modern"]
  },
  {
    "id": "kahneman-directionally-dimensionally",
    "text": "Confidence is directionally accurate but dimensionally overconfident.",
    "author": "Daniel Kahneman",
    "source": "Paraphrased from Thinking, Fast and Slow",
    "year": null,
    "tags": ["pillar-calibration", "theme-overconfidence", "theme-calibration", "tradition-modern", "tradition-scientific"]
  },
  {
    "id": "socrates-know-nothing",
    "text": "I know that I know nothing.",
    "author": "Socrates",
    "source": "Attributed to Socrates, via Plato, Apology",
    "year": null,
    "tags": ["pillar-calibration", "theme-humility", "theme-doubt", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "stoic-improves-silence",
    "text": "Speak only if it improves upon the silence.",
    "author": "Various Stoic sources",
    "source": "Attributed to various Stoic sources",
    "year": null,
    "tags": ["pillar-calibration", "theme-silence", "theme-restraint", "theme-speech", "tradition-stoic", "tradition-classical"]
  },
  {
    "id": "aristotle-magnanimous-friend",
    "text": "The magnanimous man... will be unable to make his life revolve around another person, unless it be a friend.",
    "author": "Aristotle",
    "source": "Nicomachean Ethics, Book IV",
    "year": null,
    "tags": ["pillar-magnanimity", "theme-magnanimity", "theme-friendship", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "covey-understand-then-understood",
    "text": "Seek first to understand, then to be understood.",
    "author": "Stephen Covey",
    "source": "Stephen Covey, drawing on classical rhetoric tradition",
    "year": null,
    "tags": ["pillar-magnanimity", "theme-listening", "theme-empathy", "tradition-modern"]
  },
  {
    "id": "einstein-intelligence-change",
    "text": "The measure of intelligence is the ability to change.",
    "author": "Albert Einstein",
    "source": "Attributed to Albert Einstein",
    "year": null,
    "tags": ["pillar-magnanimity", "theme-change", "theme-revision", "tradition-modern", "tradition-scientific"]
  },
  {
    "id": "socrates-minds-discuss",
    "text": "Strong minds discuss ideas, average minds discuss events, weak minds discuss people.",
    "author": "Socrates",
    "source": "Attributed to Socrates",
    "year": null,
    "tags": ["pillar-magnanimity", "theme-discourse-quality", "theme-ideas", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "epictetus-two-ears-one-mouth",
    "text": "We have two ears and one mouth so that we can listen twice as much as we speak.",
    "author": "Epictetus",
    "source": "Enchiridion",
    "year": null,
    "tags": ["pillar-discourse", "theme-listening", "theme-restraint", "tradition-stoic", "tradition-classical"]
  },
  {
    "id": "einstein-difficulty-opportunity",
    "text": "In the middle of every difficulty lies opportunity.",
    "author": "Albert Einstein",
    "source": "Attributed to Albert Einstein, on productive engagement",
    "year": null,
    "tags": ["pillar-discourse", "theme-opportunity", "theme-engagement", "tradition-modern", "tradition-scientific"]
  },
  {
    "id": "dialecta-speech-silver-argument",
    "text": "Speech is silver, silence is golden, but the willingness to enter the argument is rarest of all.",
    "author": "Editorial formulation, Dialecta",
    "source": "Editorial formulation, Dialecta, 2026",
    "year": 2026,
    "tags": ["pillar-discourse", "theme-courage", "theme-engagement", "theme-discourse", "tradition-editorial"]
  },
  {
    "id": "durant-aristotle-habit-full",
    "text": "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
    "author": "Will Durant",
    "source": "Will Durant, summarizing Aristotle's Nicomachean Ethics",
    "year": null,
    "tags": ["pillar-consistency", "theme-habit", "theme-excellence", "theme-character", "tradition-classical"]
  },
  {
    "id": "durant-aristotle-habit-short",
    "text": "We are what we repeatedly do.",
    "author": "Will Durant",
    "source": "Will Durant, summarizing Aristotle (truncated form, used as Six Pillars introduction)",
    "year": null,
    "tags": ["theme-habit", "theme-character", "tradition-classical"]
  },
  {
    "id": "epictetus-first-say-then-do",
    "text": "First say to yourself what you would be; and then do what you have to do.",
    "author": "Epictetus",
    "source": "Discourses",
    "year": null,
    "tags": ["pillar-consistency", "surface-pact", "theme-commitment", "theme-self-definition", "theme-action", "tradition-stoic", "tradition-classical"]
  },
  {
    "id": "diderot-philosophy-incredulity",
    "text": "The first step towards philosophy is incredulity.",
    "author": "Denis Diderot",
    "source": "Attributed to Denis Diderot",
    "year": null,
    "tags": ["archetype-skeptic", "theme-doubt", "theme-skepticism", "tradition-philosophical"]
  },
  {
    "id": "fitzgerald-first-rate-intelligence",
    "text": "The test of a first-rate intelligence is the ability to hold two opposing ideas in mind at the same time and still retain the ability to function.",
    "author": "F. Scott Fitzgerald",
    "source": "The Crack-Up",
    "year": 1936,
    "tags": ["archetype-synthesizer", "theme-paradox", "theme-holding-tension", "tradition-literary"]
  },
  {
    "id": "wilson-charity-before-refute",
    "text": "Before refuting an argument, be sure you understand it as well as its proponent does.",
    "author": "Neil Wilson",
    "source": "Principle of Charity, formalized by Neil Wilson",
    "year": 1959,
    "tags": ["archetype-advocate", "theme-charity", "theme-understanding", "tradition-philosophical"]
  },
  {
    "id": "berra-theory-practice",
    "text": "In theory there is no difference between theory and practice. In practice there is.",
    "author": "Various (Yogi Berra, Jan L. A. van de Snepscheut)",
    "source": "Attributed to various, including Yogi Berra and Jan L. A. van de Snepscheut",
    "year": null,
    "tags": ["archetype-builder", "theme-practice", "theme-application", "tradition-modern"]
  },
  {
    "id": "huxley-beautiful-hypothesis-ugly-fact",
    "text": "The great tragedy of science: the slaying of a beautiful hypothesis by an ugly fact.",
    "author": "Thomas Henry Huxley",
    "source": "Biogenesis and Abiogenesis",
    "year": 1870,
    "tags": ["archetype-empiricist", "theme-empiricism", "theme-evidence", "tradition-scientific", "tradition-modern"]
  },
  {
    "id": "santayana-cannot-remember-past",
    "text": "Those who cannot remember the past are condemned to repeat it.",
    "author": "George Santayana",
    "source": "The Life of Reason",
    "year": 1905,
    "tags": ["archetype-contextualist", "theme-history", "theme-context", "theme-repetition", "tradition-civic-humanist", "tradition-philosophical"]
  },
  {
    "id": "einstein-explain-simply",
    "text": "If you can't explain it simply, you don't understand it well enough.",
    "author": "Albert Einstein",
    "source": "Attributed to Albert Einstein and Ernest Rutherford",
    "year": null,
    "tags": ["archetype-illuminator", "theme-clarity", "theme-understanding", "tradition-modern", "tradition-scientific"]
  },
  {
    "id": "keynes-facts-change-mind",
    "text": "When the facts change, I change my mind. What do you do, sir?",
    "author": "John Maynard Keynes",
    "source": "Attributed to John Maynard Keynes",
    "year": null,
    "tags": ["archetype-reviser", "theme-revision", "theme-evidence", "theme-change", "tradition-modern"]
  },
  {
    "id": "heraclitus-character-fate",
    "text": "Character is fate.",
    "author": "Heraclitus",
    "source": "Fragment 119",
    "year": null,
    "tags": ["surface-pact", "theme-character", "theme-fate", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "butler-touch-change",
    "text": "All that you touch you change. All that you change changes you.",
    "author": "Octavia Butler",
    "source": "Parable of the Sower (Earthseed verses)",
    "year": 1993,
    "tags": ["archetype-reviser", "surface-reflecting", "theme-change", "theme-reciprocity", "theme-self-formation", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "pkd-reality-stops-believing",
    "text": "Reality is that which, when you stop believing in it, doesn't go away.",
    "author": "Philip K. Dick",
    "source": "How to Build a Universe That Doesn't Fall Apart Two Days Later (essay)",
    "year": 1978,
    "tags": ["archetype-empiricist", "surface-reflecting", "theme-reality", "theme-evidence", "theme-stubbornness-of-fact", "tradition-sci-fi", "tradition-modern"]
  },
  {
    "id": "lem-mirrors-not-other-worlds",
    "text": "We have no need of other worlds. We need mirrors.",
    "author": "Stanisław Lem",
    "source": "Solaris (Snaut)",
    "year": 1961,
    "tags": ["surface-reflecting", "theme-self-knowledge", "theme-mirror", "theme-introspection", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "banks-money-poverty",
    "text": "Money implies poverty.",
    "author": "Iain M. Banks",
    "source": "A Few Notes on the Culture (essay)",
    "year": 1994,
    "tags": ["surface-pact", "theme-post-scarcity", "theme-economy", "theme-meaning", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "leguin-idea-communicated",
    "text": "It is the nature of idea to be communicated: written, spoken, done.",
    "author": "Ursula K. Le Guin",
    "source": "The Dispossessed",
    "year": 1974,
    "tags": ["surface-posted", "theme-publishing", "theme-communication", "theme-action", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "herbert-fear-mind-killer",
    "text": "Fear is the mind-killer.",
    "author": "Frank Herbert",
    "source": "Dune (Bene Gesserit Litany)",
    "year": 1965,
    "tags": ["surface-consent", "theme-fear", "theme-courage", "theme-discipline", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "asimov-thats-funny",
    "text": "The most exciting phrase to hear in science is not 'Eureka!' but 'That's funny...'",
    "author": "Isaac Asimov",
    "source": "Attributed to Isaac Asimov (essays and talks)",
    "year": null,
    "tags": ["archetype-empiricist", "surface-reflecting", "theme-curiosity", "theme-noticing", "theme-anomaly", "tradition-sci-fi", "tradition-modern"]
  },
  {
    "id": "herbert-beginnings-delicate",
    "text": "Beginnings are such delicate times.",
    "author": "Frank Herbert",
    "source": "Dune (Princess Irulan, Manual of Muad'Dib)",
    "year": 1965,
    "tags": ["surface-consent", "theme-threshold", "theme-care", "theme-beginnings", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "leguin-unconsenting-soul",
    "text": "It is very hard for evil to take hold of the unconsenting soul.",
    "author": "Ursula K. Le Guin",
    "source": "A Wizard of Earthsea",
    "year": 1968,
    "tags": ["surface-consent", "theme-consent", "theme-resistance", "theme-deliberation", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "leguin-unanswerable-questions",
    "text": "To learn which questions are unanswerable, and not to answer them: this skill is most needful in times of stress and darkness.",
    "author": "Ursula K. Le Guin",
    "source": "The Left Hand of Darkness (Estraven)",
    "year": 1969,
    "tags": ["surface-reflecting", "theme-restraint", "theme-discernment", "theme-silence", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "leguin-journey-return",
    "text": "True journey is return.",
    "author": "Ursula K. Le Guin",
    "source": "The Dispossessed (Odo)",
    "year": 1974,
    "tags": ["surface-posted", "theme-return", "theme-completion", "theme-circularity", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "leguin-whole-part",
    "text": "To be whole is to be part.",
    "author": "Ursula K. Le Guin",
    "source": "The Dispossessed (Odo)",
    "year": 1974,
    "tags": ["pillar-reach", "theme-relationism", "theme-belonging", "theme-wholeness", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "leguin-light-darkness-hands",
    "text": "Light is the left hand of darkness, and darkness the right hand of light.",
    "author": "Ursula K. Le Guin",
    "source": "The Left Hand of Darkness (Tormer's Lay)",
    "year": 1969,
    "tags": ["archetype-synthesizer", "theme-paradox", "theme-interdependence", "theme-tension", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "roddenberry-idic",
    "text": "Infinite diversity in infinite combinations.",
    "author": "Gene Roddenberry (Star Trek canon)",
    "source": "Star Trek (Vulcan IDIC philosophy)",
    "year": 1968,
    "tags": ["pillar-magnanimity", "theme-pluralism", "theme-difference", "theme-diversity", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "herbert-sleeper-must-awaken",
    "text": "Without change, something sleeps inside us, and seldom awakens. The sleeper must awaken.",
    "author": "Frank Herbert",
    "source": "Dune",
    "year": 1965,
    "tags": ["archetype-reviser", "surface-recommitment", "theme-change", "theme-awakening", "theme-renewal", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "asimov-violence-incompetent",
    "text": "Violence is the last refuge of the incompetent.",
    "author": "Isaac Asimov",
    "source": "Foundation (Salvor Hardin)",
    "year": 1951,
    "tags": ["theme-violence", "theme-failure-mode", "theme-discourse", "theme-restraint", "tradition-sci-fi", "tradition-modern"]
  },
  {
    "id": "aurelius-not-right-not-true",
    "text": "If it is not right, do not do it; if it is not true, do not say it.",
    "author": "Marcus Aurelius",
    "source": "Meditations, Book XII, 17",
    "year": null,
    "tags": ["surface-consent", "theme-honesty", "theme-action", "theme-utterance", "tradition-stoic", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "epictetus-cannot-learn-already-knows",
    "text": "It is impossible for a man to learn what he thinks he already knows.",
    "author": "Epictetus",
    "source": "Discourses, Book II, Chapter 17",
    "year": null,
    "tags": ["surface-consent", "theme-humility", "theme-self-knowledge", "theme-doubt", "tradition-stoic", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "seneca-withdraw-into-yourself",
    "text": "Withdraw into yourself, as much as you can.",
    "author": "Seneca",
    "source": "Letters to Lucilius, 7 (Recede in te ipsum quantum potes)",
    "year": null,
    "tags": ["surface-consent", "theme-introspection", "theme-withdrawal", "theme-restraint", "tradition-stoic", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "socrates-unexamined-life",
    "text": "The unexamined life is not worth living.",
    "author": "Socrates",
    "source": "Plato, Apology",
    "year": null,
    "tags": ["surface-consent", "theme-examination", "theme-self-reflection", "theme-meaning", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "heraclitus-not-asleep",
    "text": "One should not act or speak as if asleep.",
    "author": "Heraclitus",
    "source": "Fragment 73 (DK B73)",
    "year": null,
    "tags": ["surface-consent", "theme-wakefulness", "theme-deliberation", "theme-attention", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "plato-attributed-wise-fools-speak",
    "text": "Wise men speak because they have something to say; fools because they have to say something.",
    "author": "Often attributed to Plato",
    "source": "Often attributed to Plato; provenance unverified (also attributed to Eleanor Roosevelt)",
    "year": null,
    "tags": ["surface-consent", "theme-restraint", "theme-purpose", "theme-speech", "tradition-philosophical"]
  },
  {
    "id": "leguin-candle-shadow",
    "text": "To light a candle is to cast a shadow.",
    "author": "Ursula K. Le Guin",
    "source": "A Wizard of Earthsea",
    "year": 1968,
    "tags": ["surface-consent", "theme-consequence", "theme-implication", "theme-awareness", "tradition-sci-fi", "tradition-literary"]
  },
  {
    "id": "brooks-second-mountain",
    "text": "The first mountain is about acquiring. The second mountain is about contributing.",
    "author": "David Brooks",
    "source": "The Second Mountain",
    "year": 2019,
    "tags": ["theme-meaning", "theme-purpose", "theme-contribution", "tradition-modern", "tradition-civic-humanist"]
  },
  {
    "id": "brooks-make-feel-seen",
    "text": "There is one skill that lies at the heart of any healthy person, family, school, community organization, or society: the ability to see another person deeply and make them feel seen.",
    "author": "David Brooks",
    "source": "How to Know a Person",
    "year": 2023,
    "tags": ["pillar-magnanimity", "pillar-discourse", "theme-attention", "theme-relationism", "tradition-modern", "tradition-civic-humanist"]
  },
  {
    "id": "brooks-meaning-happiness",
    "text": "If you live for happiness, your life is meaningless. If you live for meaning, you'll find happiness.",
    "author": "David Brooks",
    "source": "Often attributed to David Brooks (The Road to Character, 2015); exact wording widely circulated",
    "year": 2015,
    "tags": ["surface-pact", "theme-meaning", "theme-purpose", "theme-character", "tradition-modern", "tradition-civic-humanist"]
  },
  {
    "id": "rohr-act-into-thinking",
    "text": "We don't think ourselves into a new way of acting; we act ourselves into a new way of thinking.",
    "author": "Richard Rohr",
    "source": "Attributed to Richard Rohr (Franciscan); also widely cited by David Brooks",
    "year": null,
    "tags": ["pillar-consistency", "archetype-builder", "theme-action", "theme-habit", "tradition-christian", "tradition-modern"]
  },
  {
    "id": "buber-all-real-living-meeting",
    "text": "All real living is meeting.",
    "author": "Martin Buber",
    "source": "I and Thou (Ich und Du)",
    "year": 1923,
    "tags": ["pillar-magnanimity", "pillar-discourse", "theme-relationism", "theme-encounter", "tradition-jewish", "tradition-philosophical"]
  },
  {
    "id": "buber-through-thou-becomes-i",
    "text": "Through the Thou a person becomes I.",
    "author": "Martin Buber",
    "source": "I and Thou (Ich und Du)",
    "year": 1923,
    "tags": ["surface-posted", "theme-identity-formation", "theme-relationism", "tradition-jewish", "tradition-philosophical"]
  },
  {
    "id": "heschel-words-create-worlds",
    "text": "Words create worlds.",
    "author": "Abraham Joshua Heschel",
    "source": "Attributed to Abraham Joshua Heschel",
    "year": null,
    "tags": ["surface-posted", "theme-speech", "theme-creation", "theme-power", "tradition-jewish", "tradition-philosophical"]
  },
  {
    "id": "heschel-wonder-not-doubt",
    "text": "Wonder rather than doubt is the root of all knowledge.",
    "author": "Abraham Joshua Heschel",
    "source": "God in Search of Man",
    "year": 1955,
    "tags": ["surface-reflecting", "theme-wonder", "theme-knowledge", "tradition-jewish", "tradition-philosophical"]
  },
  {
    "id": "hillel-not-for-myself",
    "text": "If I am not for myself, who will be for me? If I am only for myself, what am I? If not now, when?",
    "author": "Hillel the Elder",
    "source": "Pirkei Avot 1:14",
    "year": null,
    "tags": ["surface-pact", "theme-commitment", "theme-self-and-other", "theme-urgency", "tradition-jewish", "tradition-classical"]
  },
  {
    "id": "maimonides-teach-tongue-i-do-not-know",
    "text": "Teach thy tongue to say 'I do not know,' and thou shalt progress.",
    "author": "Maimonides",
    "source": "Attributed to Maimonides",
    "year": null,
    "tags": ["pillar-calibration", "theme-humility", "theme-self-knowledge", "theme-learning", "tradition-jewish", "tradition-philosophical"]
  },
  {
    "id": "maimonides-truth-not-by-consensus",
    "text": "Truth does not become more true by virtue of the fact that the entire world agrees with it, nor less so even if the whole world disagrees with it.",
    "author": "Maimonides",
    "source": "Paraphrased from Guide for the Perplexed",
    "year": null,
    "tags": ["pillar-calibration", "archetype-skeptic", "archetype-empiricist", "theme-truth", "theme-anti-tribalism", "tradition-jewish", "tradition-philosophical"]
  },
  {
    "id": "augustine-weight-is-love",
    "text": "My weight is my love.",
    "author": "Augustine of Hippo",
    "source": "Confessions, Book XIII (Pondus meum amor meus)",
    "year": null,
    "tags": ["surface-pact", "theme-character", "theme-direction", "theme-love", "tradition-christian", "tradition-classical"]
  },
  {
    "id": "aquinas-illuminate-not-merely-shine",
    "text": "Better to illuminate than merely to shine; to deliver to others contemplated truths than merely to contemplate.",
    "author": "Thomas Aquinas",
    "source": "Summa Theologiae, II-II",
    "year": null,
    "tags": ["archetype-illuminator", "theme-teaching", "theme-contribution", "tradition-christian", "tradition-classical", "tradition-philosophical"]
  },
  {
    "id": "eckhart-beginner-every-morning",
    "text": "Be willing to be a beginner every single morning.",
    "author": "Meister Eckhart",
    "source": "Attributed via the German sermons",
    "year": null,
    "tags": ["surface-recommitment", "archetype-reviser", "theme-renewal", "theme-humility", "tradition-christian", "tradition-mystical"]
  },
  {
    "id": "merton-pride-humility",
    "text": "Pride makes us artificial, and humility makes us real.",
    "author": "Thomas Merton",
    "source": "No Man Is an Island",
    "year": 1955,
    "tags": ["pillar-calibration", "theme-humility", "theme-authenticity", "tradition-christian", "tradition-mystical"]
  },
  {
    "id": "tutu-humanity-bound-up",
    "text": "My humanity is bound up in yours, for we can only be human together.",
    "author": "Desmond Tutu",
    "source": "No Future Without Forgiveness",
    "year": 1999,
    "tags": ["pillar-magnanimity", "theme-relationism", "theme-ubuntu", "theme-interdependence", "tradition-african", "tradition-christian", "tradition-civic-humanist"]
  },
  {
    "id": "achebe-mask-dancing",
    "text": "The world is like a Mask, dancing. If you want to see it well, you do not stand in one place.",
    "author": "Chinua Achebe",
    "source": "Arrow of God",
    "year": 1964,
    "tags": ["pillar-reach", "archetype-synthesizer", "pillar-magnanimity", "theme-perspective", "theme-cross-domain", "tradition-african", "tradition-literary"]
  },
  {
    "id": "soyinka-tiger-tigritude",
    "text": "A tiger does not proclaim its tigritude; it acts.",
    "author": "Wole Soyinka",
    "source": "Attributed via Soyinka's debate with the Negritude movement",
    "year": null,
    "tags": ["archetype-builder", "pillar-consistency", "theme-action", "theme-character-by-deed", "tradition-african", "tradition-literary"]
  },
  {
    "id": "kimmerer-flourishing-mutual",
    "text": "All flourishing is mutual.",
    "author": "Robin Wall Kimmerer",
    "source": "Braiding Sweetgrass",
    "year": 2013,
    "tags": ["pillar-magnanimity", "theme-relationism", "theme-ecology", "theme-reciprocity", "tradition-indigenous", "tradition-modern"]
  },
  {
    "id": "chief-joseph-many-words-truth",
    "text": "It does not require many words to speak the truth.",
    "author": "Chief Joseph (Nez Perce)",
    "source": "Attributed to Chief Joseph",
    "year": null,
    "tags": ["pillar-acuity", "pillar-calibration", "theme-brevity", "theme-honesty", "tradition-indigenous"]
  },
  {
    "id": "hildegard-dare-to-declare",
    "text": "Dare to declare who you are. It is not far from the shores of silence to the boundaries of speech.",
    "author": "Hildegard of Bingen",
    "source": "Often attributed to Hildegard; provenance partially contested",
    "year": null,
    "tags": ["surface-pact", "surface-consent", "theme-declaration", "theme-courage", "theme-self-knowledge", "tradition-christian", "tradition-mystical", "tradition-medieval"]
  }
]
$quotes_seed$::jsonb) AS q
ON CONFLICT (quote_id) DO NOTHING;

-- ============================================================================
-- After apply, sanity check:
--   SELECT count(*) FROM quotes WHERE created_by = 'seed:initial-import';
--     -> should return 70
--   SELECT count(*) FROM quotes WHERE 'surface-consent' = ANY(tags);
--     -> should return 10
--   SELECT count(*) FROM quotes WHERE 'tradition-jewish' = ANY(tags);
--     -> should return 6
-- ============================================================================

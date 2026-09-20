/**
 * scripts/seed-articles.mjs
 *
 * Seeds 5 launch-presentable articles to the live Ghost instance, each
 * attributed to one of the three persona staff accounts (Maya / Wen /
 * Anselm). Uses the Ghost Admin API; no manual paste-and-publish needed.
 *
 * Run from C:\dialecta-api\:
 *
 *   node scripts/seed-articles.mjs
 *
 * Reads from .env.local (in the API repo root):
 *   GHOST_ADMIN_API_URL — e.g. https://www.dialecta.org
 *   GHOST_ADMIN_API_KEY — <24-hex-id>:<64-hex-secret>  (from Ghost admin
 *                          → Settings → Integrations → custom integration)
 *
 * The script:
 *   1. Loads .env.local (no dotenv dep — small hand-rolled parser).
 *   2. Generates a Ghost Admin API JWT (HS256, hand-rolled to skip the
 *      jsonwebtoken dep — kept dep-free so the script runs against the
 *      existing node_modules without `npm install`).
 *   3. GETs /ghost/api/admin/users/ to discover the three persona IDs by
 *      display name.
 *   4. POSTs each article to /ghost/api/admin/posts/?source=html with
 *      status=published, the right author, and canonical topic tags.
 *   5. Logs the resulting post IDs + author IDs so we can hand them to
 *      the comment-seed script next.
 *
 * Idempotency: this script does NOT check for existing posts with the
 * same title before publishing. Re-running it would create duplicates.
 * To re-run, delete the previous batch via Ghost admin first.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPIC_LABELS } from '../api/_topics.js';

// ───── env loader (.env.local) ────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const GHOST_URL = process.env.GHOST_ADMIN_API_URL;
const ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY;

if (!GHOST_URL || !ADMIN_KEY) {
  console.error('Missing GHOST_ADMIN_API_URL or GHOST_ADMIN_API_KEY in .env.local');
  process.exit(1);
}

const [keyId, keySecret] = ADMIN_KEY.split(':');
if (!keyId || !keySecret) {
  console.error('GHOST_ADMIN_API_KEY must be in <id>:<hex-secret> format');
  process.exit(1);
}

// ───── JWT signing (HS256, dep-free) ──────────────────────────────────────

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeToken() {
  const header = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const signingInput =
    base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', Buffer.from(keySecret, 'hex'))
    .update(signingInput)
    .digest();
  return signingInput + '.' + base64url(signature);
}

// ───── Ghost Admin API helper ─────────────────────────────────────────────

async function ghostFetch(pathSuffix, options = {}) {
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
  const headers = {
    Authorization: 'Ghost ' + makeToken(),
    'Content-Type': 'application/json',
    'Accept-Version': 'v5.0',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost API ${pathSuffix} → ${res.status}\n${text}`);
  }
  return JSON.parse(text);
}

// ───── Tag helper — canonical topic slug + display name ──────────────────

function tag(slug) {
  return { slug, name: TOPIC_LABELS[slug] };
}

// ───── Articles ───────────────────────────────────────────────────────────

const ARTICLES = [
  {
    author: 'Maya Reiss',
    title: 'On Doubt and Devotion: When Faith Pauses',
    custom_excerpt:
      'Doubt is often described as faith’s failure mode. I have come to think it is one of faith’s working parts.',
    tags: [tag('theology_spirituality'), tag('psychology_behavior')],
    html: `<p>One prominent Christian framing treats doubt as a problem to overcome — a temporary obstacle on the way back to settled belief. That framing has done real damage. It teaches people to hide their doubts rather than hold them, and the hidden doubt almost always grows.</p>

<p>Kierkegaard, on the other hand, did not think doubt was the opposite of faith. He thought it was constitutive of it. Faith was not the absence of question; it was a posture sustained in spite of question. To remove the doubt was to remove the structural tension that made faith something other than mere conviction.</p>

<p>I am drawn to this not because it lets me feel better about my own pauses — though it does — but because it makes a specific claim about what faith <em>is</em>. If faith is a movement made in spite of incomplete information, then doubt is not the antagonist of faith. It is the condition that makes the movement meaningful.</p>

<p>The pastoral consequence matters more than the theology. When a thoughtful person stops being able to recite the creed without flinching, the responses available to them are usually three: pretend the flinch isn’t there, leave the tradition entirely, or descend into a private crisis the community cannot see. None of these are good. The fourth option — which most traditions name but most parishes don’t actually practice — is to continue showing up <em>with</em> the flinch. Praying anyway. Reading the difficult passage anyway. Letting the question sit without resolving it artificially.</p>

<p>Simone Weil wrote that twenty centuries of Christianity will need a thousand years of attention to be understood. That is a long time. It implies we are all somewhere in the middle of the work, and “the middle” is allowed to look like doubt.</p>

<p>I have not stopped going to church because I sometimes don’t know what I’m doing there. I have come to think that not-knowing-quite-what-I’m-doing is part of going.</p>`,
  },

  {
    author: 'Wen Zhao',
    title: 'Why Concert Halls Sound the Way They Do',
    custom_excerpt:
      'Concert hall acoustics is the most honest engineering I know. The geometry produces what you hear. There is no compression layer in between.',
    tags: [tag('science_technology'), tag('arts_humanities')],
    html: `<p>I came to acoustics the way an engineer comes to any system: what is the signal, what is the medium, where is the loss?</p>

<p>In concert halls, the signal is the orchestra. The medium is air. The loss happens at every reflective surface — and unlike most engineering domains, reflection isn’t loss in the destructive sense. Reflection is what produces the <em>sound</em> of the room.</p>

<p>A great hall does roughly three things at once. It controls reverberation time — usually somewhere between 1.8 and 2.2 seconds for symphonic music, which is what lets a chord bloom rather than smear. It manages early reflections, the bounces that arrive within about 80 milliseconds of the direct sound, which gives the music its sense of space. And it handles diffusion — the breaking up of reflective surfaces so the sound doesn’t return as a clean echo but as a textured wash.</p>

<p>The Boston Symphony Hall is famous because Wallace Sabine, in 1900, used physics to design it deliberately. The Musikverein in Vienna is famous partly because nobody designed its acoustics — the proportions just happened to be close to ideal. The Royal Albert Hall is famous as a cautionary tale: a beautiful room with a notorious echo, fixed only in 1969 by hanging fiberglass disks from the ceiling.</p>

<p>What I find honest about all of this is that the physics has nowhere to hide. You cannot post-process a hall the way you can post-process a recording. If the geometry is wrong, the sound is wrong, and the only way to fix it is to change the geometry.</p>

<p>The next time you sit in a hall and the music sounds like it is <em>in the room with you</em> rather than <em>projected at you</em>, the reason is geometric. The walls are doing exactly what their shape requires them to do. There is something clarifying about that.</p>`,
  },

  {
    author: 'Wen Zhao',
    title: 'The Hidden Mathematics of Bach',
    custom_excerpt:
      'Bach’s canons are often described as math-decorated music. I have come to think it is the other way around — they are music-decorated math, and the math is doing real cognitive work.',
    tags: [tag('arts_humanities'), tag('science_technology')],
    html: `<p>The Goldberg Variations contain a sequence of canons in which each successive canon is at a wider interval — second, third, fourth, up to the ninth. A canon, formally, is a rule: voice B repeats voice A, transformed in some specified way. As the interval widens, the constraint gets harder. By the canon at the ninth, what Bach has to do to keep the harmony coherent under the rule is genuinely difficult.</p>

<p>This is sometimes described as Bach showing off. I think that misses what is actually happening.</p>

<p>Self-similar recursion — the property of a structure that contains scaled copies of itself — turns out to be one of the things that make complex systems robust. Plants do this. River networks do this. Many functioning organizational structures do this. The reason is that recursive structures degrade gracefully: removing or damaging one part doesn’t break the whole, because the pattern is reproduced at multiple scales.</p>

<p>Bach’s canons aren’t ornamental recursion. They are <em>functional</em> recursion. The piece holds together because the rule holds at every scale of the structure. You can extract any voice and the harmonic logic survives. You can lose a measure and a careful listener can fill it in, because the pattern is informationally redundant in a particular way.</p>

<p>I bring this up because the standard music-history framing is that Bach worked in an old form (counterpoint) just before the rise of more “modern” homophonic writing. That framing treats him as a brilliant practitioner of a dying technique. The cross-domain framing is different: Bach was working out, in sound, structural principles that we now know matter for any robust complex system. He just happened to be doing it with twelve tones rather than with biological tissue or distributed servers.</p>

<p>Counterpoint isn’t a historical curiosity. It’s an early discipline of structural thinking. If we still listen to it three hundred years later, that’s a clue.</p>`,
  },

  {
    author: 'Maya Reiss',
    title: 'What Therapy Cannot Do',
    custom_excerpt:
      'Therapy can do many things. It cannot, by itself, answer the question of what a life is for. Confusing the two leaves people lonelier than they were before they started.',
    tags: [tag('psychology_behavior'), tag('theology_spirituality')],
    html: `<p>I want to be careful here, because therapy has helped people I love. The point of this piece is not that therapy is overrated. The point is that therapy occupies a particular scope, and we have collectively forgotten what that scope is.</p>

<p>Good therapy can illuminate patterns. It can help a person separate inherited reactions from chosen responses. It can metabolize grief that has been held too long. It can — and this is not small — give someone permission to feel what they actually feel. These are real goods. They are not what the question “what is my life for?” is asking.</p>

<p>That question is older than therapy. It belongs to what used to be called the work of philosophy, the work of religion, the work of community elders, and the work of long friendship. Each of those traditions has its own answer, and the answers are different from each other in ways that matter. But none of them treats the question as primarily a private problem of the self. All of them assume that the self is in conversation with something larger — a tradition, a practice, a covenant, a relationship to the dead and to the not-yet-born.</p>

<p>Therapy, by design, brackets that conversation. It is structured around the individual’s experience and the individual’s interpretive frame. There are good professional reasons for this — therapy is not the place for a clinician to tell you what your life means.</p>

<p>The trouble is that, in a culture that has thinned out its other traditions, therapy gets asked to do the meaning-work it was never built for. People emerge with sharper self-understanding and the same unanswered question. They feel, often, more alone — because the language they have learned describes their inner life with great precision but does not place that life inside anything.</p>

<p>The lesson I draw is not “go to a therapist less.” It is “do not expect a therapist to be a priest, a philosopher, a community, and an inheritance all at once.” Find the rest of those, too.</p>`,
  },

  {
    author: 'Father Anselm Okafor',
    title: 'Reading Scripture in the Age of the Algorithm',
    custom_excerpt:
      'Augustine read scripture for forty years and complained, near the end, that he was just beginning to understand it. Most of us now read in a cognitive environment shaped by feeds and notifications. The disciplines required to read as Augustine read are not impossible. They are no longer default.',
    tags: [tag('theology_spirituality'), tag('science_technology')],
    html: `<p>The Christian tradition has always assumed that scripture rewards slow attention. Origen and Augustine spoke of <em>lectio</em> — reading as a form of prayer, in which a single passage is held and turned and held again until something gives. Bernard of Clairvaux, centuries later, described the same practice: read, meditate, pray, contemplate. None of these stages can be hurried.</p>

<p>I am a parish priest in 2026. I do not pretend that the cognitive environment of a person sitting down with their Bible in the evening is the same as it was for Augustine. The hands that hold the page have, fifteen minutes earlier, scrolled through a feed designed by very intelligent people to make sustained attention costly. The discipline of <em>lectio</em> presupposes that long attention is the default state, broken only by the day’s interruptions. For most of my parishioners, it is the inverse: short attention is the default state, and any extended reading is now a deliberate effort.</p>

<p>The Church’s responses to this have broadly been two. The first is lament — a grief over a lost cognitive culture, sometimes accompanied by a refusal to engage with the new medium. The second is capitulation — pruning the tradition into bite-sized fragments shaped to the same scroll the Bible is competing with. Neither of these is faithful to the tradition.</p>

<p>A third response is possible, and the saints have actually given us its outline. Cassian taught that attention is a faculty that can be exercised, like any other faculty, and that the desert fathers built their lives around its training. We do not need a desert. We need the equivalent of training reps. The shape such reps might take is small and specific: ten minutes with a single verse before opening any device, three days a week. Less than a homily. Less than most morning routines. More than most parishioners are currently doing.</p>

<p>If that sounds modest, that is the point. Augustine’s forty years began with one verse.</p>`,
  },
];

// ───── main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to Ghost: ' + GHOST_URL);
  console.log('Fetching staff users...\n');

  const usersResp = await ghostFetch('/users/?limit=all');
  const users = usersResp.users;

  const userByName = new Map();
  for (const u of users) userByName.set(u.name, u);

  const requiredAuthors = ['Maya Reiss', 'Wen Zhao', 'Father Anselm Okafor'];
  const missing = requiredAuthors.filter(n => !userByName.has(n));
  if (missing.length > 0) {
    console.error('Missing Ghost staff accounts:');
    for (const name of missing) console.error('  - ' + name);
    console.error('\nFound on Ghost: ' + users.map(u => u.name).join(', '));
    process.exit(1);
  }

  for (const name of requiredAuthors) {
    const u = userByName.get(name);
    console.log('  ✓ ' + name + '  →  ' + u.id + '  (' + u.email + ')');
  }

  console.log('\nPublishing articles...\n');

  const results = [];
  for (const article of ARTICLES) {
    const author = userByName.get(article.author);
    process.stdout.write('  ' + article.title + ' ... ');

    const resp = await ghostFetch('/posts/?source=html', {
      method: 'POST',
      body: JSON.stringify({
        posts: [
          {
            title:          article.title,
            html:           article.html,
            custom_excerpt: article.custom_excerpt,
            status:         'published',
            tags:           article.tags,
            authors:        [{ id: author.id }],
          },
        ],
      }),
    });

    const post = resp.posts[0];
    console.log('✓ ' + post.id);
    results.push({
      id:       post.id,
      slug:     post.slug,
      title:    post.title,
      url:      post.url,
      author:   article.author,
      authorId: author.id,
    });
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('All ' + results.length + ' articles published.');
  console.log('──────────────────────────────────────────────\n');
  for (const r of results) {
    console.log('  ' + r.title);
    console.log('    id:     ' + r.id);
    console.log('    slug:   ' + r.slug);
    console.log('    author: ' + r.author + ' (' + r.authorId + ')');
    console.log('    url:    ' + r.url);
    console.log('');
  }

  console.log('Hand these IDs to the next step (migration 005 + comment seed).');
}

main().catch(err => {
  console.error('\n✗ Failed: ' + err.message);
  process.exit(1);
});

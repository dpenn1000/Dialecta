/**
 * scripts/cleanup-articles.mjs
 *
 * One-off cleanup of the two seed-era articles on Ghost:
 *
 *   1. "On Doubt and Devotion: When Faith Pauses" (Maya Reiss)
 *      Replace body with the canonical em-dash-free version.
 *      Fixes mojibake from manual paste plus removes em dashes per user
 *      preference (commas, parens, and periods only).
 *
 *   2. "The Conversation Communities Keep Having About Solar..." (Daniel)
 *      Strip mojibake non-breaking-space artifacts in source list.
 *      Fix "Awrospace" typo to "Aerospace".
 *      Trim tags to environment_energy + economics.
 *
 *   3. Author bios for Maya and Daniel.
 *      Currently null in Ghost. Set to the Supabase seed bios so the
 *      auto-rendered author pages on dialecta.org/author/maya etc. carry
 *      proper context.
 *
 * Run from C:\dialecta-api\:
 *
 *   node scripts/cleanup-articles.mjs
 *
 * Reads from .env.local: GHOST_ADMIN_API_URL, GHOST_ADMIN_API_KEY.
 *
 * Idempotent. Re-running re-applies the same content; Ghost optimistic
 * locking is honored via fresh updated_at fetched right before each PUT.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    throw new Error('Ghost API ' + pathSuffix + ' returned ' + res.status + '\n' + text);
  }
  return JSON.parse(text);
}

// ───── Maya: canonical em-dash-free body ─────────────────────────────────

const MAYA_HTML = `<p>One prominent Christian framing treats doubt as a problem to overcome, a temporary obstacle on the way back to settled belief. That framing has done real damage. It teaches people to hide their doubts rather than hold them, and the hidden doubt almost always grows.</p>

<p>Kierkegaard, on the other hand, did not think doubt was the opposite of faith. He thought it was constitutive of it. Faith was not the absence of question; it was a posture sustained in spite of question. To remove the doubt was to remove the structural tension that made faith something other than mere conviction.</p>

<p>I am drawn to this not because it lets me feel better about my own pauses (though it does) but because it makes a specific claim about what faith <em>is</em>. If faith is a movement made in spite of incomplete information, then doubt is not the antagonist of faith. It is the condition that makes the movement meaningful.</p>

<p>The pastoral consequence matters more than the theology. When a thoughtful person stops being able to recite the creed without flinching, the responses available to them are usually three: pretend the flinch isn't there, leave the tradition entirely, or descend into a private crisis the community cannot see. None of these are good. The fourth option, which most traditions name but most parishes don't actually practice, is to continue showing up <em>with</em> the flinch. Praying anyway. Reading the difficult passage anyway. Letting the question sit without resolving it artificially.</p>

<p>Simone Weil wrote that twenty centuries of Christianity will need a thousand years of attention to be understood. That is a long time. It implies we are all somewhere in the middle of the work, and "the middle" is allowed to look like doubt.</p>

<p>I have not stopped going to church because I sometimes don't know what I'm doing there. I have come to think that not-knowing-quite-what-I'm-doing is part of going.</p>`;

const MAYA_EXCERPT = "Faith is often mistaken for certainty, but it may be something far more demanding: the willingness to continue in the presence of doubt. Not-knowing isn't a failure of faith; it's what gives it meaning.";

// ───── Daniel: mojibake fixes for the existing article ──────────────────

function cleanDanielHtml(html) {
  let out = html;
  // Mojibake non-breaking space sequences in the citation list collapse
  // to regular spaces; the source list reads cleaner without them.
  out = out.split('Â ').join(' ');
  // Stray Â characters that didn't pair with a non-breaking space.
  out = out.split('Â').join('');
  // Em-dash mojibake (in case any were introduced); per user preference,
  // collapse to a comma. Defensive, may not be present.
  out = out.split('â€”').join(', ');
  out = out.split('â€“').join(', ');
  // Curly-quote mojibake.
  out = out.split('â€™').join("'");
  out = out.split('â€“').join('-');
  out = out.split('â€œ').join('"');
  out = out.split('â€').join('"');
  // Collapse any remaining double-spaces from the substitutions.
  out = out.replace(/  +/g, ' ');
  // Typo fix.
  out = out.split('Awrospace').join('Aerospace');
  // Em dashes per user preference: replace any actual em dashes with
  // commas. Same for en dashes.
  out = out.split('—').join(',');
  out = out.split('–').join(',');
  return out;
}

const DANIEL_TAGS = [
  { slug: 'environment_energy', name: 'Environment & Energy' },
  { slug: 'economics',          name: 'Economics' },
];

// ───── Bios ───────────────────────────────────────────────────────────────

const MAYA_BIO = "Retired librarian. Writes weekly and carefully, mostly about theology with secondary interests in mental health and psychology. Updates her positions publicly when the evidence shifts. Reads more than she replies.";

const DANIEL_BIO = "Founder of Dialecta. Built this platform because social media algorithms are increasingly amplifying people's existing biases back at them, at scale. Hopes to help people reconnect with their values, by offering a more constructive reward system than the one our current environments are offering.";

// ───── main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching posts and users...');

  const postsResp = await ghostFetch('/posts/?limit=all&formats=html&include=tags,authors');
  const usersResp = await ghostFetch('/users/?limit=all');

  const mayaPost = postsResp.posts.find(p => p.slug === 'on-doubt-and-devotion-when-faith-pauses');
  const danielPost = postsResp.posts.find(p =>
    p.slug && p.slug.startsWith('the-conversation-communities-keep-having-about-solar')
  );
  const mayaUser = usersResp.users.find(u => u.name === 'Maya Reiss');
  const danielUser = usersResp.users.find(u => u.name === 'Daniel Pennington');

  if (!mayaPost) throw new Error('Could not find Maya post by slug');
  if (!danielPost) throw new Error('Could not find Daniel solar post by slug');
  if (!mayaUser) throw new Error('Could not find Maya user');
  if (!danielUser) throw new Error('Could not find Daniel user');

  console.log('  ✓ Maya post:    ' + mayaPost.id);
  console.log('  ✓ Daniel post:  ' + danielPost.id);
  console.log('  ✓ Maya user:    ' + mayaUser.id);
  console.log('  ✓ Daniel user:  ' + danielUser.id);

  // ── Maya post: canonical body + excerpt ────────────────────────────────
  console.log('\nUpdating Maya post (canonical em-dash-free body + excerpt)...');
  await ghostFetch('/posts/' + mayaPost.id + '/?source=html', {
    method: 'PUT',
    body: JSON.stringify({
      posts: [{
        html:           MAYA_HTML,
        custom_excerpt: MAYA_EXCERPT,
        updated_at:     mayaPost.updated_at,
      }],
    }),
  });
  console.log('  ✓ Updated.');

  // ── Daniel post: mojibake fix + typo fix + tag trim ────────────────────
  console.log('\nCleaning Daniel post (mojibake, typo, tag trim)...');
  const cleanedDanielHtml = cleanDanielHtml(danielPost.html);
  await ghostFetch('/posts/' + danielPost.id + '/?source=html', {
    method: 'PUT',
    body: JSON.stringify({
      posts: [{
        html:       cleanedDanielHtml,
        tags:       DANIEL_TAGS,
        updated_at: danielPost.updated_at,
      }],
    }),
  });
  console.log('  ✓ Updated. Tags: ' + DANIEL_TAGS.map(t => t.slug).join(', '));

  // ── Author bios ────────────────────────────────────────────────────────
  console.log('\nSetting author bios...');

  // Re-fetch users after post writes (Ghost may bump user.updated_at when
  // their authored posts are touched); use a fresh updated_at for the PUT.
  const usersResp2 = await ghostFetch('/users/?limit=all');
  const mayaUser2 = usersResp2.users.find(u => u.name === 'Maya Reiss');
  const danielUser2 = usersResp2.users.find(u => u.name === 'Daniel Pennington');

  await ghostFetch('/users/' + mayaUser2.id + '/', {
    method: 'PUT',
    body: JSON.stringify({
      users: [{
        bio:        MAYA_BIO,
        updated_at: mayaUser2.updated_at,
      }],
    }),
  });
  console.log('  ✓ Maya bio set.');

  await ghostFetch('/users/' + danielUser2.id + '/', {
    method: 'PUT',
    body: JSON.stringify({
      users: [{
        bio:        DANIEL_BIO,
        updated_at: danielUser2.updated_at,
      }],
    }),
  });
  console.log('  ✓ Daniel bio set.');

  console.log('\nDone.');
}

main().catch(err => {
  console.error('\n✗ Failed: ' + err.message);
  process.exit(1);
});

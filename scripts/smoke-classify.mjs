/**
 * scripts/smoke-classify.mjs
 *
 * Smoke test for the opinion-mapper. Loops through all three Write
 * Layer article foundations against the live endpoint, prints each
 * response. Sequential so the system-prompt cache stays warm between
 * calls (the skill is ~21K chars and ephemeral-cached for 5 minutes).
 *
 * Usage: node scripts/smoke-classify.mjs
 */

import fs from 'node:fs/promises';

const API_URL = 'https://dialecta.vercel.app/api/article/classify';
const ARTICLE_DIR = 'C:/Users/dan/OneDrive/Websites/Dialecta/Write Layer/Articles';

const TESTS = [
  {
    name: 'We Become What We Inhabit',
    path: `${ARTICLE_DIR}/We_Become_What_We_Inhabit.txt`,
    declaration: {
      core_claim:
        'Environments shape human behavior more reliably than moral instruction or awareness; the solution to broken public discourse is deliberate environmental redesign, not better individual character.',
      scope_boundary:
        'Discourse environments specifically. Not all behavior shaping in general; the focus is what platforms do to public conversation.',
      strongest_objection:
        'Environmental design that rewards intellectual virtue might produce the performance of intellectual virtue rather than the genuine article.',
    },
    declared_tier: 'forum',
  },
  {
    name: 'The Conversation Is Doing Something to You',
    path: `${ARTICLE_DIR}/The_Conversation_Is_Doing_Something_to_You.txt`,
    declaration: {
      core_claim:
        'Conversation is not merely an exchange of information but a formative experience that shapes the kind of person each participant becomes; therefore the design of discourse environments is a moral question about who we are making, not just a product question about what content is allowed.',
      scope_boundary:
        'The formative effects of repeated discourse on character. Not a content-moderation argument; not a free-speech argument; a claim about who participants become through participation.',
      strongest_objection:
        'If character is formed by environment more than by individual choice, then individuals are less responsible for who they become, which has uncomfortable implications for moral accountability.',
    },
    declared_tier: 'forum',
  },
  {
    name: 'On the Far Shore of Fear',
    path: `${ARTICLE_DIR}/On_the_Far_Shore_of_Fear.txt`,
    declaration: {
      core_claim:
        'The cosmic scale of the universe makes parochial exclusivist theology improbable; what matters is preparing humanity for a post-scarcity future where freedom without purpose can produce decadence as readily as flourishing, and the contemplative traditions, despite predating this condition, contain real tools for navigating it.',
      scope_boundary:
        'Existential and spiritual orientation in light of cosmic scale and the trajectory toward post-scarcity. Not a policy argument; not a sectarian theological argument.',
      strongest_objection:
        'Without scarcity as the organizing pressure, most people may drift into decadence and simulation rather than reach for beauty, meaning, or depth. The hopeful reading of post-scarcity may be a fantasy projection.',
    },
    declared_tier: 'forum',
  },
];

for (const test of TESTS) {
  const article_text = await fs.readFile(test.path, 'utf8');
  const body = { ...test, article_text, name: undefined, path: undefined };

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Article: ${test.name}`);
  console.log(`Chars:   ${article_text.length}`);
  console.log('───────────────────────────────────────────────────────────────');

  const startTime = Date.now();
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`Status: ${resp.status} ${resp.statusText}`);
    console.log(`Elapsed: ${elapsed}s`);
    console.log('───────────────────────────────────────────────────────────────');

    const text = await resp.text();
    try {
      const data = JSON.parse(text);
      // Emphasize the candidate set so picker variety is easy to scan
      if (Array.isArray(data.candidate_maps)) {
        console.log(`CANDIDATES (${data.candidate_maps.length}):`);
        for (const [i, map] of data.candidate_maps.entries()) {
          const conf = typeof map.confidence === 'number'
            ? `conf=${map.confidence.toFixed(2)}`
            : 'conf=?';
          if (map.type === 'cartesian' && Array.isArray(map.axes)) {
            console.log(`  [${i}] (${map.type}, ${conf})`);
            for (const [j, ax] of map.axes.entries()) {
              console.log(`      axis ${j}: ${JSON.stringify(ax.topic)}`);
            }
          } else {
            console.log(`  [${i}] (${map.type}, ${conf}) ${JSON.stringify(map.topic)}`);
          }
        }
        console.log('───────────────────────────────────────────────────────────────');
      }
      console.log(JSON.stringify(data, null, 2));
    } catch {
      console.log('(non-JSON response)');
      console.log(text);
    }
  } catch (err) {
    console.error(`Request failed: ${err.message}`);
  }

  console.log('');
}

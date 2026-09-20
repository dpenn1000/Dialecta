/**
 * SSR page for /contributor/<handle>/moment/<id>.
 *
 * The post-click landing for a celebration share. The OG image is
 * embedded directly as the hero, guaranteeing 1:1 visual match with
 * the social preview that brought the visitor here. Below the hero:
 * share controls, article context link, contributor profile link.
 *
 * Site chrome from app/layout.js wraps the page (Dialecta logo + nav
 * + build banner). The share-focused content lives in this article.
 */

import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getMomentByHandleAndId, describeMoment } from '@/lib/get-moment';
import MomentShareButtons from './MomentShareButtons';

// User-agent allowlist for bots that need to read the page to scrape
// our OG meta. Anyone NOT in this list (i.e. real humans clicking
// from a Facebook post) gets redirected through to the article on
// www.dialecta.org. The list covers the major social and search
// scrapers — extend if a new platform shows up.
const BOT_UA_RE = /facebookexternalhit|facebookcatalog|Facebot|Twitterbot|LinkedInBot|Slackbot|Slack-ImgProxy|Discordbot|TelegramBot|WhatsApp|SkypeUriPreview|bingbot|Googlebot|AdsBot-Google|DuckDuckBot|YandexBot|BaiduSpider|Applebot|Yahoo!\sSlurp|redditbot|Pinterest|InstagramBot|TikTokBot|Embedly|outbrain|vkShare|W3C_Validator|HeadlessChrome/i;

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dialecta-next.vercel.app';

const T = {
  cream:     '#f7f2e8',
  paper:     '#fefcf5',
  ink:       '#2c2620',
  body:      '#3a342c',
  soft:      '#5a5248',
  tertiary:  '#8c8780',
  brassDeep: '#7a4a10',
  brassMid:  '#b8862e',
  brassPale: '#f5dfa0',
  brassWarm: '#d4a84a',
  border:    '#e0dbd2',
};

// ─── Metadata ────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { handle, id } = await params;
  const data = await getMomentByHandleAndId(handle, id);
  if (!data) {
    return {
      title: 'Moment not found · Dialecta',
      robots: { index: false, follow: false },
    };
  }

  const { moment, contributor } = data;
  const mc = describeMoment(moment.event_type, moment.context);
  const name = contributor.display_name || 'A contributor';

  const title = `${name} · ${mc.kicker} · Dialecta`;
  const desc  = mc.primary
    ? (mc.primary.length > 200 ? mc.primary.slice(0, 197).trim() + '…' : mc.primary)
    : `${name} on Dialecta · ${mc.kicker}.`;

  // og:url canonicalization: point at the article on dialecta.org
  // when there's an article context (first_comment, delta_ack, etc.)
  // so social previews show "DIALECTA.ORG" as the source line and
  // click-throughs land on the actual article. Falls back to
  // dialecta.org root when no article context.
  const articleSlug   = moment.context?.article_slug;
  const dialectaOrgUrl = articleSlug
    ? `https://www.dialecta.org/${articleSlug}/`
    : 'https://www.dialecta.org/';

  // og:image stays pointing at dialecta-next so the celebration card
  // still renders as the share preview. VERCEL_DEPLOYMENT_ID changes
  // on EVERY deploy so cache busts during iteration.
  const buster = process.env.VERCEL_DEPLOYMENT_ID
                 || process.env.VERCEL_GIT_COMMIT_SHA
                 || 'dev';
  const ogImg = `${SITE_BASE}/contributor/${contributor.handle}/moment/${moment.id}/opengraph-image?v=${buster}`;

  return {
    title,
    description: desc,
    alternates: { canonical: dialectaOrgUrl },
    openGraph: {
      title, description: desc, type: 'article',
      url: dialectaOrgUrl,
      siteName: 'Dialecta',
      images: [{ url: ogImg, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image', title, description: desc, images: [ogImg],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────

function formatLongDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch { return ''; }
}

export default async function MomentPage({ params }) {
  const { handle, id } = await params;
  const data = await getMomentByHandleAndId(handle, id);
  if (!data) notFound();

  // UA-based redirect to the canonical article on www.dialecta.org.
  //
  // Facebook (and other social platforms) hard-code the share's
  // click destination to whatever URL was first shared, regardless
  // of og:url updates afterward. og:url only controls the displayed
  // source line ("DIALECTA.ORG"). To get human visitors actually
  // landing on the article, we redirect them server-side here.
  //
  // Bots scraping the page (Facebook's crawler reading og:* meta to
  // build the share preview) are NOT redirected — they need to see
  // the celebration page so they can pull our custom og:image.
  // The allowlist covers the major social + search scrapers.
  //
  // Skip the redirect entirely when the moment has no article
  // context (e.g. became_steward, follower_milestone): there's no
  // dialecta.org page to send them to, so render the celebration
  // page in place.
  const userAgent = (await headers()).get('user-agent') || '';
  const isBot = BOT_UA_RE.test(userAgent);
  const articleSlug = data.moment.context?.article_slug;
  if (!isBot && articleSlug) {
    redirect(`https://www.dialecta.org/${articleSlug}/`);
  }

  const { moment, contributor } = data;
  const mc       = describeMoment(moment.event_type, moment.context);
  const name     = contributor.display_name || 'A contributor';
  // Share URL: prefer the dialecta.org article URL when available so
  // social shares display "DIALECTA.ORG" as the source. Falls back
  // to the moment page on dialecta-next if no article context (first
  // quote, became_steward, etc.). articleSlug already declared above
  // for the bot-redirect check; reused here.
  const dialectaOrgUrl = articleSlug
    ? `https://www.dialecta.org/${articleSlug}/`
    : `${SITE_BASE}/contributor/${contributor.handle}/moment/${moment.id}`;
  const url            = dialectaOrgUrl;
  // Embedded hero on this page uses a cache-busted variant so design
  // iterations on the OG card surface here immediately. VERCEL_DEPLOYMENT_ID
  // changes on every deploy (file-only or git), keeping the cache
  // honest during iteration.
  const buster   = process.env.VERCEL_DEPLOYMENT_ID
                   || process.env.VERCEL_GIT_COMMIT_SHA
                   || String(Date.now());
  const ogImgCanonical = `${SITE_BASE}/contributor/${contributor.handle}/moment/${moment.id}/opengraph-image`;
  const ogImg    = `${ogImgCanonical}?v=${buster}`;
  const dateStr  = formatLongDate(moment.context?.event_at || moment.occurred_at);

  return (
    <article style={{
      maxWidth:  1200,
      margin:    '0 auto',
      padding:   'clamp(16px, 2.5vw, 32px) clamp(12px, 2vw, 32px) 80px',
      fontFamily: 'var(--font-source-serif), Georgia, serif',
      color:     T.body,
    }}>
      {/* Hero: the OG card image itself, rendered server-side at
          /opengraph-image. Embedding here guarantees the click-through
          looks identical to the share preview. The aspectRatio
          declaration prevents layout shift while the image loads. */}
      <div style={{
        width:      '100%',
        aspectRatio: '1200 / 630',
        boxShadow:  '0 24px 60px rgba(28,24,20,0.32), 0 0 0 1px rgba(184,134,46,0.18)',
        borderRadius: 4,
        overflow:   'hidden',
        marginBottom: 'clamp(40px, 6vw, 72px)',
      }}>
        <img
          src={ogImg}
          alt={`${name} · ${mc.kicker} · Dialecta`}
          width={1200}
          height={630}
          style={{
            width:   '100%',
            height:  '100%',
            display: 'block',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Share controls + article link, below the hero, on cream */}
      <div style={{
        maxWidth: 720,
        margin:   '0 auto',
        textAlign: 'center',
      }}>
        {/* Date dateline */}
        <div style={{
          fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
          fontSize:      13,
          letterSpacing: '0.32em',
          color:         T.brassMid,
          textTransform: 'uppercase',
          marginBottom:  28,
        }}>
          {dateStr}
        </div>

        {/* Share row */}
        <MomentShareButtons url={url} shareText={`${name} on Dialecta · ${mc.kicker}`} />

        {/* Article context link */}
        {moment.context && moment.context.article_slug && (
          <div style={{
            marginTop:  20,
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontStyle:  'italic',
            fontSize:   20,
            color:      T.tertiary,
          }}>
            <Link
              href={`https://www.dialecta.org/${moment.context.article_slug}/`}
              style={{ color: T.brassMid, textDecoration: 'none', borderBottom: `1px solid ${T.brassPale}` }}>
              Read the article{moment.context.article_title ? `: ${moment.context.article_title}` : ' on Dialecta'}
            </Link>
          </div>
        )}

        {/* Contributor profile link */}
        {contributor.handle && (
          <div style={{
            marginTop:  16,
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontStyle:  'italic',
            fontSize:   18,
            color:      T.tertiary,
          }}>
            <Link
              href={`${SITE_BASE}/contributor/${contributor.handle}`}
              style={{ color: T.brassMid, textDecoration: 'none', borderBottom: `1px solid ${T.brassPale}` }}>
              More from {name}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

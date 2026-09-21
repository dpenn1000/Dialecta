/**
 * The end-of-article share row (live's #post-share), where the spine's
 * Share segment points. Ported from _theme/post.hbs:272-298, CSS from
 * _theme/assets/css/style.css:3160-3242 and its 700px breakpoint.
 *
 * Live builds all six hrefs with an inline script reading location.href
 * and an og:title meta tag at request time in the browser. This page
 * already knows the canonical URL and the title on the server (lib/site.ts's
 * SITE_URL plus the article row), so the five platform links render as
 * plain <a> tags with no script: they work with JavaScript off, which
 * live's own version does not. Only Copy link and the native share sheet
 * need the browser (clipboard, navigator.share); those two live in
 * share-actions.tsx, a client island recorded in apps/web/CLAUDE.md.
 *
 * Live's own /api/share/track POST, fired alongside every share action, is
 * not ported per the brief: nothing here writes to share_events.
 */
import { SITE_URL } from '@/lib/site';
import { strings } from '@/strings';
import { ShareActions } from './share-actions';
import './share-row.css';

const s = strings.articleShare;

function intentUrls(title: string, url: string) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  return {
    x: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
}

export function ShareRow({ title, slug }: { title: string; slug: string }) {
  const url = `${SITE_URL}/articles/${slug}`;
  const targets = intentUrls(title, url);

  return (
    <section id="post-share" className="post-share-end" aria-label={s.sectionLabel}>
      <div className="post-share-eyebrow">
        <span aria-hidden="true">⁂</span>
        {'  '}
        {s.eyebrow}
      </div>
      <div className="post-share-row">
        <a className="post-share-btn" href={targets.x} target="_blank" rel="noopener" aria-label={s.shareOn(s.x)}>
          <span className="post-share-glyph" aria-hidden="true">
            𝕏
          </span>
          <span className="post-share-label">{s.x}</span>
        </a>
        <a
          className="post-share-btn"
          href={targets.facebook}
          target="_blank"
          rel="noopener"
          aria-label={s.shareOn(s.facebook)}
        >
          <span className="post-share-glyph" aria-hidden="true">
            f
          </span>
          <span className="post-share-label">{s.facebook}</span>
        </a>
        <a
          className="post-share-btn"
          href={targets.linkedin}
          target="_blank"
          rel="noopener"
          aria-label={s.shareOn(s.linkedin)}
        >
          <span className="post-share-glyph" aria-hidden="true">
            in
          </span>
          <span className="post-share-label">{s.linkedin}</span>
        </a>
        <a
          className="post-share-btn"
          href={targets.reddit}
          target="_blank"
          rel="noopener"
          aria-label={s.shareOn(s.reddit)}
        >
          <span className="post-share-glyph" aria-hidden="true">
            r/
          </span>
          <span className="post-share-label">{s.reddit}</span>
        </a>
        <a className="post-share-btn" href={targets.email} aria-label={s.shareViaEmail}>
          <span className="post-share-glyph" aria-hidden="true">
            ✉
          </span>
          <span className="post-share-label">{s.email}</span>
        </a>
        <ShareActions title={title} url={url} />
      </div>
    </section>
  );
}

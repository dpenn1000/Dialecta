/**
 * Article slugs. Derived on the server from the title at publish time, never
 * accepted from a request body, so a client cannot claim another article's
 * address. `articles.slug` carries a partial UNIQUE index (where not null);
 * the publish route retries with a short suffix on a collision.
 */

const MAX_SLUG_LENGTH = 80;

export function slugify(title: string): string {
  const base = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
  return base || 'untitled';
}

/** A short, url-safe suffix for a slug that is already taken. */
export function slugSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

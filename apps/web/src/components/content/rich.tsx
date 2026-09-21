/**
 * Inline emphasis for ported page copy. The strings in strings.ts `content`
 * mark it the way the live templates did with tags: **bold** for <strong>,
 * *italic* for <em>, and a newline for a <br> inside a display heading.
 *
 * Deliberately tiny and not nested: the ported copy never nests emphasis, and
 * a real Markdown parser would turn every stray asterisk in an author's prose
 * into formatting. This renders strings.ts and nothing a reader typed.
 */
import type { ReactNode } from 'react';

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\n)/g;

export function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    const token = match[0];
    if (at > last) out.push(text.slice(last, at));
    if (token === '\n') {
      // The space matters. The live headings read `are<br>the`, and the
      // mobile rules hide the <br>, so a phone showed "arethe". A space
      // before the break collapses away wherever the break shows.
      out.push(' ', <br key={key++} />);
    } else if (token.startsWith('**')) {
      out.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      out.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = at + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Rich({ text }: { text: string }) {
  return <>{rich(text)}</>;
}

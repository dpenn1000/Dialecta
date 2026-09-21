#!/usr/bin/env python3
"""Read the share tags dialecta.org serves for each published article, and say
whether they meet circulation's standing recommendation
(council/circulation/research/2026-opengraph-and-x-card-share-surface.md):
a short written description, and twitter:card "summary".

Read-only: fetches public pages, changes nothing. Run it before and after
editing an article's excerpt in Ghost Admin.

    python scripts/check-live-share-tags.py
    python scripts/check-live-share-tags.py --app --host http://localhost:3050   # the new app
    python scripts/check-live-share-tags.py on-the-far-shore-of-fear

Exit code 0 when every article passes both checks, 1 otherwise.
"""
import argparse
import html
import json
import re
import sys
import urllib.request

SLUGS = [
    'on-the-far-shore-of-fear',
    'on-doubt-and-devotion-when-faith-pauses',
    'knowledge-without-borders-why-education-must-be-free',
    'the-conversation-communities-keep-having-about-solar-and-what-the-evidence-actually-says',
    'the-moment-you-stop-waiting-for-your-life-to-start',
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (share-tag check)'})
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')


def meta(page: str, attr: str, name: str) -> list[str]:
    pattern = r'<meta\s+' + attr + r'="' + re.escape(name) + r'"\s+content="([^"]*)"'
    return [html.unescape(m) for m in re.findall(pattern, page)]


def json_ld_description(page: str) -> str:
    found = ''
    for blob in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
        try:
            data = json.loads(blob)
        except ValueError:
            continue
        if isinstance(data, dict) and data.get('description'):
            found = data['description']
    return found


def description_problems(text: str, max_length: int) -> list[str]:
    problems = []
    if not text:
        return ['missing']
    if '\n' in text:
        problems.append('contains a paragraph break (raw article text)')
    if text.rstrip().endswith(('…', '...')):
        problems.append('cut off with an ellipsis')
    if len(text) > max_length:
        problems.append(f'{len(text)} characters, over {max_length}')
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('slugs', nargs='*', default=SLUGS)
    parser.add_argument('--host', default='https://www.dialecta.org')
    parser.add_argument('--max-length', type=int, default=250,
                        help='Ghost caps an excerpt at 300 and the publish pipeline at 290')
    parser.add_argument('--app', action='store_true', help='apps/web paths (/articles/<slug>) instead of live')
    args = parser.parse_args()

    failed = False
    for slug in args.slugs:
        path = f'/articles/{slug}' if args.app else f'/{slug}/'
        page = fetch(args.host.rstrip('/') + path)
        og = meta(page, 'property', 'og:description')
        tw = meta(page, 'name', 'twitter:description')
        cards = meta(page, 'name', 'twitter:card')
        text = og[0] if og else ''
        problems = description_problems(text, args.max_length)
        if tw and text and tw[0] != text:
            problems.append('twitter:description differs from og:description')
        card_ok = bool(cards) and all(c == 'summary' for c in cards)
        ld = json_ld_description(page)

        failed = failed or bool(problems) or not card_ok
        print(f'[{slug[:52]}]')
        print(f'  og:description   {"FAIL: " + "; ".join(problems) if problems else "ok"} ({len(text)} chars)')
        print(f'  twitter:card     {"ok" if card_ok else "FAIL"} {cards}')
        if ld and ld != text:
            print(f'  JSON-LD description differs from og:description ({len(ld)} chars)')
        print(f'  starts: {text[:100]!r}')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Build feed.xml for The Stillwater Letters from the repo itself.

The feed is generated, never hand-edited. It reads two repo-local sources:

1. The ItemList JSON-LD in `letters/index.html` — the canonical list of
   published letters, in order, with each letter's title and public URL.
2. Each letter page's own `<head>`: its `datePublished` (the Tuesday the
   letter went out, Adelaide time), its `og:image`, and its meta
   description (Alice's own one-line excerpt, used verbatim).

Every quoted string in the feed is copied byte-for-byte from the page it
comes from. The script invents no prose. It fails loudly rather than emit a
feed that disagrees with the ItemList or carries a non-Tuesday date.

Run from the repo root:

    python3 build-feed.py

Writes `feed.xml` and prints a summary. Validate the result with:

    xmllint --noout feed.xml
"""

import html
import json
import re
import sys
from datetime import datetime
from email.utils import format_datetime
from pathlib import Path
from zoneinfo import ZoneInfo

SITE = "https://thestillwaterletters.com.au"
ADELAIDE = ZoneInfo("Australia/Adelaide")
SEND_HOUR = 9  # letters land Tuesday morning; pubDate time-of-day is nominal
ROOT = Path(__file__).resolve().parent
FEED_PATH = ROOT / "feed.xml"

CHANNEL_TITLE = "The Stillwater Letters"
CHANNEL_DESC = (
    "A free weekly letter for women who want to walk closely with God. "
    "One honest, Scripture-rooted letter, every Tuesday."
)


def die(msg):
    sys.stderr.write(f"build-feed: {msg}\n")
    sys.exit(1)


def ld_json_blocks(text):
    """Yield parsed JSON from every <script type="application/ld+json"> block."""
    for m in re.finditer(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        text,
        re.S,
    ):
        raw = m.group(1).strip()
        try:
            yield json.loads(raw)
        except json.JSONDecodeError:
            # A page may hold a block we don't parse; skip rather than guess.
            continue


def meta_description(text):
    m = re.search(
        r'<meta\s+name="description"\s+content="(.*?)"\s*/?>', text, re.S
    )
    return html.unescape(m.group(1)).strip() if m else ""


def read_item_list():
    """Return [(position, url, name)] from letters/index.html, ordered."""
    page = (ROOT / "letters" / "index.html").read_text(encoding="utf-8")
    for block in ld_json_blocks(page):
        if not isinstance(block, dict):
            continue
        # The ItemList is the CollectionPage's mainEntity, not a top-level
        # block. The page also carries a BreadcrumbList (its own
        # itemListElement) that must not be mistaken for the letter list.
        candidate = None
        if block.get("@type") == "ItemList":
            candidate = block
        elif isinstance(block.get("mainEntity"), dict) and \
                block["mainEntity"].get("@type") == "ItemList":
            candidate = block["mainEntity"]
        if candidate is not None:
            items = []
            for el in candidate.get("itemListElement", []):
                items.append((el["position"], el["url"], el["name"]))
            items.sort(key=lambda t: t[0])
            return items
    die("no ItemList JSON-LD found in letters/index.html")


def slug_from_url(url):
    m = re.match(rf"^{re.escape(SITE)}/letters/([^/]+)/?$", url)
    if not m:
        die(f"url not a letter page: {url}")
    return m.group(1)


def article_meta(slug):
    """Return (datePublished, image, name, description) for one letter page."""
    page_path = ROOT / "letters" / slug / "index.html"
    if not page_path.exists():
        die(f"letter page missing on disk: {page_path}")
    text = page_path.read_text(encoding="utf-8")
    art = None
    for block in ld_json_blocks(text):
        if isinstance(block, dict) and block.get("@type") == "Article":
            art = block
            break
    if art is None:
        die(f"no Article JSON-LD in {page_path}")
    date_pub = art.get("datePublished", "")
    image = art.get("image", "")
    name = art.get("name") or art.get("headline") or ""
    desc = meta_description(text)
    if not (date_pub and image and name and desc):
        die(f"incomplete metadata for {slug}: "
            f"date={date_pub!r} image={image!r} name={name!r} desc={bool(desc)}")
    return date_pub, image, name, desc


def pub_date_rfc822(date_pub, slug):
    try:
        d = datetime.strptime(date_pub, "%Y-%m-%d")
    except ValueError:
        die(f"datePublished not YYYY-MM-DD for {slug}: {date_pub!r}")
    # Every letter goes out on a Tuesday (Adelaide). A non-Tuesday means the
    # page's own metadata is wrong; refuse rather than publish it.
    if d.weekday() != 1:  # Monday=0, Tuesday=1
        die(f"datePublished for {slug} is {d:%A}, not Tuesday: {date_pub}")
    local = d.replace(hour=SEND_HOUR, tzinfo=ADELAIDE)
    return format_datetime(local)


def esc(s):
    """XML-escape a verbatim string for a text node / attribute."""
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def build():
    items = read_item_list()
    if len(items) != 19:
        die(f"expected 19 letters in ItemList, found {len(items)}")

    rows = []
    feed_urls = []
    for position, url, list_name in items:
        slug = slug_from_url(url)
        date_pub, image, page_name, desc = article_meta(slug)
        rows.append(
            {
                "url": url,
                "name": page_name,
                "list_name": list_name,
                "pub": pub_date_rfc822(date_pub, slug),
                "image": image,
                "desc": desc,
                "date_pub": date_pub,
            }
        )
        feed_urls.append(url)

    # Diff the feed against the ItemList both ways. Either direction non-empty
    # means the two sources disagree about which letters exist.
    list_urls = {u for _, u, _ in items}
    feed_set = set(feed_urls)
    only_list = list_urls - feed_set
    only_feed = feed_set - list_urls
    if only_list or only_feed:
        die(f"feed/ItemList mismatch: only_in_list={only_list} "
            f"only_in_feed={only_feed}")

    # Newest first in the feed; lastBuildDate is the newest letter's pubDate.
    rows_by_date = sorted(rows, key=lambda r: r["date_pub"], reverse=True)
    last_build = rows_by_date[0]["pub"]

    parts = []
    parts.append('<?xml version="1.0" encoding="UTF-8"?>')
    parts.append(
        '<rss version="2.0" '
        'xmlns:atom="http://www.w3.org/2005/Atom" '
        'xmlns:media="http://search.yahoo.com/mrss/">'
    )
    parts.append("<channel>")
    parts.append(f"<title>{esc(CHANNEL_TITLE)}</title>")
    parts.append(f"<link>{esc(SITE)}/</link>")
    parts.append(f"<description>{esc(CHANNEL_DESC)}</description>")
    parts.append("<language>en-AU</language>")
    parts.append(
        f'<atom:link href="{esc(SITE)}/feed.xml" rel="self" '
        'type="application/rss+xml"/>'
    )
    parts.append(f"<lastBuildDate>{esc(last_build)}</lastBuildDate>")
    parts.append(
        f'<image><url>{esc(SITE)}/og-image.png</url>'
        f"<title>{esc(CHANNEL_TITLE)}</title>"
        f"<link>{esc(SITE)}/</link></image>"
    )
    for r in rows_by_date:
        parts.append("<item>")
        parts.append(f"<title>{esc(r['name'])}</title>")
        parts.append(f"<link>{esc(r['url'])}</link>")
        parts.append(f'<guid isPermaLink="true">{esc(r["url"])}</guid>')
        parts.append(f"<pubDate>{esc(r['pub'])}</pubDate>")
        parts.append(f"<description>{esc(r['desc'])}</description>")
        parts.append(
            f'<enclosure url="{esc(r["image"])}" type="image/png"/>'
        )
        parts.append(
            f'<media:content url="{esc(r["image"])}" medium="image"/>'
        )
        parts.append("</item>")
    parts.append("</channel>")
    parts.append("</rss>")
    parts.append("")

    FEED_PATH.write_text("\n".join(parts), encoding="utf-8")
    print(f"wrote {FEED_PATH.relative_to(ROOT)} — {len(rows)} items")
    print(f"newest: {rows_by_date[0]['name']}  ({rows_by_date[0]['pub']})")
    print(f"oldest: {rows_by_date[-1]['name']}  ({rows_by_date[-1]['pub']})")


if __name__ == "__main__":
    build()

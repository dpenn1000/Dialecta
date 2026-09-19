#!/usr/bin/env python3
"""Pull a Vercel deployment's source tree back onto disk.

Written 2026-09-19 to recover two trees that exist nowhere else:

  dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7  dialecta production, built from
                                    dialecta-api@53364fa, a commit GitHub
                                    no longer serves ("not our ref")
  dpl_3ZRBaGX4rKEUnuc87zAm7YHHB7VQ  dialecta-next production, carrying the
                                    sync-theme mirror of the Ghost theme src

Usage:
    python scripts/recover-deployment-source.py <deployment-id> <dest-dir>
    python scripts/recover-deployment-source.py <deployment-id> <dest-dir> --include-logs
    python scripts/recover-deployment-source.py <deployment-id> <dest-dir> --dry-run

The token is read from $VERCEL_TOKEN, else from ~/.vercel-token. It is never
printed, never written to disk by this script, and never passed on argv.
Create one at https://vercel.com/account/tokens with read scope.

Only the "src" subtree is pulled. The sibling "out" tree is compiled lambda
output and is not source. Run artifacts (*.log.json) are skipped unless
--include-logs is passed.
"""

from __future__ import annotations

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.vercel.com"
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "team_mflrdhbcpv10z1RtMO6QZSaU")


def load_token() -> str:
    token = os.environ.get("VERCEL_TOKEN", "").strip()
    if token:
        return token
    # Notepad appends .txt silently, and PowerShell's Out-File writes a UTF-8
    # BOM. Accept both rather than make the caller fight their own editor.
    candidates = [
        Path.home() / ".vercel-token",
        Path.home() / ".vercel-token.txt",
    ]
    for path in candidates:
        if path.is_file():
            token = path.read_text(encoding="utf-8-sig").strip()
            if token:
                return token
    sys.exit(
        "No token. Create one at https://vercel.com/account/tokens, then either\n"
        "  set VERCEL_TOKEN, or\n"
        f"  save it as the only line of {candidates[0]} (or {candidates[1].name})"
    )


def get(url: str, token: str, retries: int = 4) -> bytes:
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 500, 502, 503) and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            # Never echo the URL on auth failures; it carries no secret, but the
            # message should stay boring.
            sys.exit(f"HTTP {exc.code} from Vercel: {exc.reason}")
        except urllib.error.URLError as exc:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            sys.exit(f"Network error talking to Vercel: {exc.reason}")
    raise AssertionError("unreachable")


def walk(nodes: list[dict], prefix: str = "") -> list[tuple[str, str]]:
    """Flatten the file tree into (relative path, file uid) pairs."""
    found: list[tuple[str, str]] = []
    for node in nodes:
        name = node.get("name", "")
        kind = node.get("type")
        path = f"{prefix}/{name}" if prefix else name
        if kind == "directory":
            found.extend(walk(node.get("children") or [], path))
        elif kind == "file" and node.get("uid"):
            found.append((path, node["uid"]))
        # "lambda" nodes are build output, not source. Skipped.
    return found


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if len(args) != 2:
        sys.exit(__doc__)

    deployment, dest_root = args[0], Path(args[1])
    include_logs = "--include-logs" in flags
    dry_run = "--dry-run" in flags
    token = load_token()

    tree = json.loads(get(f"{API}/v6/deployments/{deployment}/files?teamId={TEAM_ID}", token))
    src = next((n for n in tree if n.get("name") == "src" and n.get("type") == "directory"), None)
    if src is None:
        sys.exit("No 'src' subtree in this deployment. Nothing to recover.")

    files = walk(src.get("children") or [])
    if not include_logs:
        files = [(p, u) for p, u in files if not p.endswith(".log.json")]

    print(f"{len(files)} files to pull into {dest_root}")
    if dry_run:
        for path, _ in files:
            print(f"  {path}")
        return

    written = 0
    for index, (rel, uid) in enumerate(files, start=1):
        # The tree lives on v6, but file contents are v7 only. v5 and v6 both
        # answer 410 Gone for this deployment, which reads like expiry and is
        # not: it is the wrong API version.
        raw = get(f"{API}/v7/deployments/{deployment}/files/{uid}?teamId={TEAM_ID}", token)
        # Vercel wraps text in {"data": "<base64>"}, but has returned raw bytes
        # for some content types. Handle both.
        try:
            payload = json.loads(raw)
            body = base64.b64decode(payload["data"]) if isinstance(payload, dict) and "data" in payload else raw
        except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
            body = raw

        target = dest_root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(body)
        written += 1
        print(f"  [{index}/{len(files)}] {rel} ({len(body)} bytes)")

    print(f"Done. {written} files written under {dest_root}")


if __name__ == "__main__":
    main()

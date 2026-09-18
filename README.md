# Healthy Joints Roadmap

Client-facing progress page for the Healthy Joints Healthy Life x Brave New Media engagement, 15 Sep to 15 Dec 2026. Built from Exhibit A of the Services Agreement.

## Files

- `index.html` — the page the site serves. Read-only for every viewer. Rebuilt from the source files on every update. `hjhl-roadmap-static.html` is an identical copy kept for download.
- `hjhl-roadmap.html` — the same page with self-update logic for the claude.ai artifact. Not for static hosting.
- `head.html` — markup and CSS.
- `logic.js` — rendering, timeline, fixed dates, team.
- `state.json` — statuses for every deliverable, client item and checklist entry, plus the change log. This is the file to edit weekly.
- `build.py` — assembles the page. `python3 build.py --static` writes the static file, `python3 build.py` writes the artifact file.
- `timeline@2x.png`, `full-page@2x.png` — rendered exports for emails and decks.

## Weekly update

1. Edit statuses in `state.json` (`s` field): `up`, `due`, `active`, `wait`, `done`, `approved` for deliverables; `wait`, `active`, `solved` for client items. Update `asof` and add a line to `log`.
2. `python3 build.py --static` (writes `index.html`)
3. Commit and push. The site redeploys within a minute.

## Sharing

The site URL is unlisted and the page carries a no-index tag, but it is reachable by anyone who has the link. The page names the client team and their internal plan, which clause 7 of the agreement treats as confidential, so the link is shared only with the client team and never posted publicly. No fees or invoice amounts appear on the page.

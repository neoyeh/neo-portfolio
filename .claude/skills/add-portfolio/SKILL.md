---
name: add-portfolio
description: Add a new entry to the portfolio site — from a source image in src/images/ to a pushed commit with the dev server running and the GitHub Pages URL ready to check. Use when the user wants to add, publish, or upload a new portfolio/work item.
---

# Add Portfolio Entry

Full design rationale: `docs/superpowers/specs/2026-07-30-add-portfolio-design.md`. This file is the operational checklist — follow it in order.

## Step 1 — One-shot intake

Ask, in a single natural-language message (not a rigid form, not one field at a time):

- **年份** (year) — required
- **專案名稱** (project name) — required
- **說明** (description) — optional; if left blank you'll offer a menu of past descriptions next
- **屬性** (attributes, e.g. Independent Work / Team Work / Scrollmagic / Bootstrap4 / Responsive Web Design / Offline, multiple allowed) — optional; if left blank you'll offer a multi-select menu of past attributes next
- **連結** (one or more links, live site and/or GitHub/prototype preview) — required

## Step 2 — Conditional follow-up (only what's needed)

Before this step, scan `dist/portfolio.json` for historical values (see "Historical-value scanning" below). Bundle whichever of these apply into ONE `AskUserQuestion` call (it supports up to 4 questions per call):

- **Description left blank** → single-select menu of every distinct historical description, plus the tool's built-in "Other" free-text option.
- **Attributes left blank** → multi-select menu of every distinct historical attribute token, plus "Other" for a new one-off tag.
- **Project name contains Chinese** (matches `/[一-鿿]/`) → ask for an English/romanized name to build the filename slug from. The Chinese name is still what gets stored as `project_name` — this only supplies the slug source.
- **Multiple candidate images found in `src/images/`** (see Step 3) — if you already know there are multiple before this point, ask which one here too.

Skip this step entirely if none of the above apply.

### Historical-value scanning

Read `dist/portfolio.json`, and for every entry's `text` field, split on `</br>` into three segments:
- Segment 1 (minus any trailing `" | Offline"`) is a description candidate.
- Every `" | "`-delimited token inside segments 2 and 3 is an attribute candidate.

De-duplicate before presenting either menu. Do this scan fresh every run — never hardcode or cache the list.

## Step 3 — Locate and validate the source image

Run:

```bash
git status --porcelain -- src/images/
```

A line counts as a candidate new image **unless its status is a deletion** (` D` or `D `) — this includes untracked (`??`), unstaged-modified (` M`), and already-staged (`A `, `M `, `AM`) files. Do not narrow this to just `??`/` M` — a user may have already run `git add` on the image before invoking you.

- **Zero candidates** → STOP. Tell the user: "沒有偵測到新圖片，請先把圖片放進 src/images/ 再重新執行。" Do not do anything else — no data changes, no git commands.
- **Exactly one candidate** → this is the source image.
- **More than one candidate** → ask which one (fold into Step 2's bundled question if you haven't asked yet; otherwise ask now, alone).

## Step 4 — Naming

Build the slug from the project name (or the separately-supplied romanized name, if the project name contained Chinese):
1. Lowercase it.
2. Replace every run of characters outside `[a-z0-9]` with a single `-`.
3. Trim leading/trailing `-`.

Final base name: `{year}-{slug}` (e.g. `2026-vive-eagle`).

Rename the source file in `src/images/` to `{year}-{slug}.{original-extension}` (keep the original extension here — compression in Step 5 may change it). If the file is already tracked by git, use `git mv old-name new-name`; if it's untracked, use `mv` then `git add` the new path. Either way, this fully stages the rename — nothing further needed for this file later.

## Step 5 — Compress via the `image-optimize` skill

Invoke its CLI using the three-tier fallback it documents:

```bash
optimize src/images/{year}-{slug}.{original-extension} --output dist/img --flat --force --json
```

If `optimize` isn't on PATH, try `~/.local/bin/optimize` with the same arguments; if that also fails, run `optimize env --json` (or `~/.local/bin/optimize env --json`) to get `invocation.nodePath`/`invocation.cliPath` and invoke those directly.

`--force` skips the idempotent up-to-date check (irrelevant here — this is always exactly one brand-new file). `--flat` matches this project's flat `dist/img/` layout.

Parse the JSON on stdout:
- If `errors` is non-empty → STOP. Report the error message to the user. Do not touch `dist/portfolio.json`, do not commit.
- Otherwise, take `processed[0].output`'s basename as the final image filename — image-optimize's smart routing can change the extension (e.g. an opaque PNG source becomes a `.jpg` output), so this is the authoritative name, not `{year}-{slug}.{original-extension}`.

## Step 6 — Classify the links

For each link gathered in Step 1: if the string contains `github` case-insensitively (covers both `github.com` repo links and this project's `github.io` prototype-preview links), it belongs to `link_github`; otherwise it belongs to `link_live`.

- Zero links in a bucket → omit that key from the entry entirely.
- One link → store as a plain string.
- Two or more → store as an array, in the order they were given.

## Step 7 — Build the `text` field

The attributes gathered/selected in Steps 1–2 are a flat set of tokens. Classify them into the three-line composite using this fixed recognition list:

- **Work-type** (pick the one present; default `Independent Work` if neither `Independent Work` nor `Team Work` was picked): `Independent Work`, `Team Work`.
- **Layout-style** (pick the one present; default `Responsive Web Design` if neither `Responsive Web Design` nor `Adaptive Web Design` was picked): `Responsive Web Design`, `Adaptive Web Design`.
- **Offline flag**: if the literal token `Offline` was picked, append `" | Offline"` to line 1.
- **Everything else picked** (`Scrollmagic`, `Bootstrap3`, `Bootstrap4`, `React hook`, or any new "Other" tag): tool-tag list, joined with `" | "` in the order picked.

Assemble:

```
{description}{" | Offline" if picked}</br>{work-type}</br>{tool-tags joined by " | " followed by " | " followed by layout-style — or just layout-style if there are no tool tags}
```

## Step 8 — Update `dist/portfolio.json`

Read the file, `JSON.parse` it, mutate the in-memory structure, `JSON.stringify` it back with 2-space indentation, and write it — never hand-edit the JSON text directly.

The new entry:

```json
{
  "project_name": "<as typed in Step 1>",
  "image": "./img/<Step 5's output basename>",
  "text": "<Step 7's composite>",
  "link_live": "<per Step 6, string/array/omitted>",
  "link_github": "<per Step 6, string/array/omitted>"
}
```

**Duplicate-entry guard**: before inserting, scan every existing entry (across all years) for the same `image` path or the same `project_name`. If either matches, STOP and ask the user to confirm before continuing (protects against accidentally re-running this skill for the same project).

- If a year group with `"years": "<year>"` already exists in the top-level array, prepend the new entry to that group's `protfolio_list`.
- If no such group exists, create `{"years": "<year>", "protfolio_list": [<new entry>]}` and insert it into the top-level array at the position that keeps `years` sorted newest-first (the file is already ordered that way — 2025, 2024, 2023, … — insert numerically).

## Step 9 — Commit, push, and open previews

Step 4's rename already staged both sides of the `src/images/` change. Add just the other two touched files:

```bash
git add dist/img/<Step 5's output basename> dist/portfolio.json
git commit -m "feat: add <project_name> to portfolio (<year>)"
git push origin master
```

Do **not** add a `Co-Authored-By` trailer (global preference — this is already enforced by your standing instructions, just don't override it here). Do **not** run `git add -A` or `git add .` — stage only the files this run touched, since the working tree may have unrelated in-progress edits at any time.

Then:

```bash
npm run start
```

in the background, and tell the user the entry is live-ish at `https://neoyeh.github.io/neo-portfolio/dist/` — mention GitHub Pages can take a minute or two to reflect a just-pushed commit.

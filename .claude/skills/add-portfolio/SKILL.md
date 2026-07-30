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

**`AskUserQuestion` option-cap rule**: the tool allows at most 4 options per question (plus its built-in "Other"). Real historical data can exceed that for both description and attributes, so never dump the raw distinct-value list straight into the options array — apply this instead:

- **Attributes**: don't build one giant menu of every historical token. Use Step 7's fixed recognition list directly — work-type (`Independent Work` / `Team Work`), layout-style (`Responsive Web Design` / `Adaptive Web Design`), and `Offline` — each sub-group is 2–5 options at most, well under the cap. For tool tags specifically (the open-ended part: `Scrollmagic`, `Bootstrap4`, etc.), show only the 4 most frequently-used historical tags plus "Other" for anything else — never all distinct tags at once.
- **Description**: if there are more than 4 distinct historical values, do not force them into `AskUserQuestion`'s options. Instead, list them as a numbered plain-text list in a normal message and ask the user to reply with a number (or type new text) — plain conversational back-and-forth, not the `AskUserQuestion` tool. If there are 4 or fewer, it's fine to use `AskUserQuestion` as normal.

### Historical-value scanning

Read `dist/portfolio.json`, and for every entry's `text` field, split on `</br>` into three segments:
- Segment 1 (minus any trailing `" | Offline"`) is a description candidate.
- Every `" | "`-delimited token inside segments 2 and 3 is an attribute candidate.

Not every entry has all 3 segments — some real entries have only 2 (no separate tool-tags/layout-style segment beyond segment 2). Treat a missing segment as an empty string rather than erroring or assuming exactly 3 segments always exist.

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

**Duplicate-entry guard (do this before renaming anything):** now that `project_name` and the slug/base name are known, check for a collision on any of these three fronts:
- An existing entry (across all years) in `dist/portfolio.json` with the same `project_name`.
- An existing entry in `dist/portfolio.json` whose `image` is the same would-be path, `./img/{year}-{slug}.*`.
- A file already present in `src/images/` named `{year}-{slug}.{ext}` (any extension) that isn't the source file itself.

If any of these match, STOP and ask the user to confirm before continuing — do not rename, do not compress, do not touch `dist/img/` or `dist/portfolio.json`. This must run before the rename below, since renaming and Step 5's compression are destructive (they can overwrite an existing same-named file) and are hard to catch after the fact.

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
- If `processed` is empty, the file may have landed in the `skipped` bucket instead (this happens when a same-format re-encode wouldn't save enough space — `--force` only bypasses the up-to-date check, not this). In that case use `skipped[0].output`'s basename instead; the skipped file is still copied through to the output directory, just without re-encoding. Never fall through to writing `undefined`/blank as the filename.
- If both `processed` and `skipped` are empty → STOP, this is an error per the rule above.

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

(The duplicate-entry guard already ran in Step 4, before the rename/compress — nothing further to check here.)

- If a year group with `"years": "<year>"` already exists in the top-level array, prepend the new entry to that group's `protfolio_list`.
- If no such group exists, create `{"years": "<year>", "protfolio_list": [<new entry>]}` and insert it into the top-level array at the position that keeps `years` sorted newest-first (the file is already ordered that way — 2025, 2024, 2023, … — insert numerically).

## Step 9 — Commit, push, and open previews

**Branch check (do this before any git command below):** run `git rev-parse --abbrev-ref HEAD`. `git push origin master` pushes whatever the local `master` ref points at, not necessarily the branch you actually committed to — if the current checkout isn't `master` (e.g. a worktree), the commit lands elsewhere and the push can silently report "Everything up-to-date" without publishing anything, while you'd otherwise tell the user the entry is live. If `HEAD` isn't `master`, STOP: tell the user the current checkout isn't on `master` and this step needs to be run from the main working copy, or ask how they want to proceed. Do not push in that case.

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

in the background. If `npm` isn't found (non-login shells may not have nvm loaded — the same issue Step 5 documents for `optimize`), try sourcing nvm first and retrying:

```bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

Tell the user the entry is live-ish at `https://neoyeh.github.io/neo-portfolio/dist/` — mention GitHub Pages can take a minute or two to reflect a just-pushed commit.

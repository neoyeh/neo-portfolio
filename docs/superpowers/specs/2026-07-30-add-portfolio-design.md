# `/add-portfolio` Skill — Design Spec

**Goal:** a reusable Claude Code skill (`/add-portfolio`) that walks through adding one new entry to the portfolio site — from a source image sitting in `src/images/` to a pushed commit with the dev server running and the live GitHub Pages URL ready to check.

## Scope

Two deliverables:

1. **One-time code change** to `src/components/Portfolio/index.js`: generalize `link_live` to accept a string *or* an array, matching `link_github`'s existing shape, with a single shared render helper for both icon types.
2. **New Claude Code skill**: `.claude/skills/add-portfolio/SKILL.md` — the repeatable workflow.
3. **New file**: `README.md` at the project root — short, user-facing usage guide for this feature (the project currently has no README at all).

Out of scope (not touched by this work): the `image-optimize` skill itself (already sharp-based, already handles this project's needs — see prior investigation), any redesign of the portfolio page's visual layout, migrating existing `link_github` array entries to any new shape (they already work with the shared helper as-is).

## 1. Code change: `PortfolioCard` multi-link support

Current state (`src/components/Portfolio/index.js`): `link_live` renders at most one `<a>` with a desktop icon; `link_github` already accepts a string or an array via the `gitlinkbuild` helper and renders one `<a>` with a GitHub icon per entry.

New state: both fields accept a string or an array. One shared helper renders a list of `<a>` tags for a given (links, iconClass, ariaLabel) triple. Render order stays desktop-icon links first, then GitHub-icon links last — this already matches the current JSX order (`link_live` block, then `gitlinkbuild(link_github)`), so no reordering is needed, only generalizing `link_live` to loop over an array the same way `link_github` already does.

`PortfolioCard.propTypes` updates `link_live` from `PropTypes.string` to `PropTypes.oneOfType([PropTypes.string, PropTypes.array])` (matching `link_github`'s existing propType).

No data migration needed — every existing entry's `link_live` is already a plain string, which the generalized renderer treats as a single-element list.

## 2. The skill: `/add-portfolio`

### Step 1 — One-shot intake

Single natural-language message (not a rigid form) asking for, in one go:
- **年份** (year) — required
- **專案名稱** (project name) — required
- **說明** (description) — optional; if left blank, Step 2 offers a menu of historical descriptions
- **屬性** (attributes) — optional, multiple; if left blank, Step 2 offers a multi-select menu of historical attribute values
- **連結** (links) — required, one or more; free text, one per line or comma-separated

### Step 2 — Conditional follow-up (only if needed)

Bundle whichever of the following apply into a single `AskUserQuestion` call (it supports up to 4 questions per call, which covers every case here):

- **Description blank** → single-select menu built from every distinct "line 1" value found by scanning `dist/portfolio.json`'s existing `text` fields (see §4), plus a free-text "Other" fallback (built into the tool).
- **Attributes blank** → multi-select menu built from every distinct recognized attribute token found the same way (see §4's classification list), plus "Other" for a new one-off tag.
- **Project name contains Chinese** (regex `/[一-鿿]/` matches) → ask for an English/romanized name to use as the filename slug source. The Chinese project name itself is still what gets stored as `project_name` in the data — this question only supplies the slug.
- **Multiple candidate images found** in `src/images/` (see §3) → list them, ask which one.

If none of these conditions apply, Step 2 is skipped entirely and the skill proceeds straight to Step 3.

### Step 3 — Locate and validate the source image

```bash
git status --porcelain -- src/images/
```

Parse for untracked (`??`) or modified (` M` / `M `) entries.

- **Zero matches** → stop immediately. Tell the user: "沒有偵測到新圖片，請先把圖片放進 src/images/ 再重新執行。" Do not proceed to any later step, do not touch `portfolio.json`, do not commit.
- **Exactly one match** → this is the source image.
- **More than one match** → this was already resolved in Step 2's bundled question (or, if Step 3 runs before the skill realizes there were multiple candidates, fold it into a fresh single-question `AskUserQuestion` at this point instead — either placement is fine, but the user must always be asked rather than the skill guessing).

### Step 4 — Naming

Build the slug:
- Lowercase the project name (or the separately-supplied romanized name, if the project name contained Chinese).
- Replace every run of characters that are not `[a-z0-9]` with a single `-`.
- Trim leading/trailing `-`.

Final base name: `{year}-{slug}` (e.g. `2026-vive-eagle`).

Rename the source file in `src/images/` to `{year}-{slug}.{original-extension}`, preserving the original file extension (the extension may change again at the compression step — see §5). Use `git mv` if the file is already tracked, otherwise a plain rename followed by `git add` for the renamed path.

### Step 5 — Compress via the `image-optimize` skill

Invoke its CLI (using the three-tier fallback invocation documented in that skill: `optimize`, then `~/.local/bin/optimize`, then resolve paths via `optimize env --json`):

```bash
optimize src/images/{year}-{slug}.{ext} --output dist/img --flat --force --json
```

`--force` sidesteps `image-optimize`'s idempotent-skip logic, which exists for re-processing whole folders — not relevant here since this is always exactly one brand-new file. `--flat` matches this project's existing `dist/img/` layout (no subdirectories).

Parse the emitted JSON:
- If `errors` is non-empty for this input → stop, report the error message, do not touch `portfolio.json`, do not commit.
- Otherwise, read `processed[0].output` — this is the authoritative final filename (image-optimize's smart routing may change the extension, e.g. an opaque PNG source becomes a `.jpg` output). Use this exact basename for the `image` field.

### Step 6 — Classify the links

For each link string gathered in Step 1: if it contains `github` (case-insensitive — this project already uses `github.io` prototype-preview links tagged with the GitHub icon, not just `github.com`), it belongs to `link_github`; otherwise it belongs to `link_live`.

Store as a plain string when a field ends up with exactly one link (matching every existing entry in the data file), or as an array when it has two or more (matching `link_github`'s existing array usage elsewhere in the data). Omit the key entirely if a field ends up with zero links.

### Step 7 — Build the `text` field

The existing data's `text` field is a three-line composite joined with `</br>`. The Step 1/2 "attributes" answers are a flat set of chosen tokens; the skill classifies them into the composite's three semantic slots using this fixed recognition list (built from every historical entry's tokens today):

- **Work-type slot** (exactly one; default `Independent Work` if the user picked neither): `Independent Work`, `Team Work`.
- **Layout-style slot** (exactly one; default `Responsive Web Design` if the user picked neither): `Responsive Web Design`, `Adaptive Web Design`.
- **Offline flag** (boolean; present if the token `Offline` was picked): appends `" | Offline"` to line 1.
- **Everything else the user picked** (e.g. `Scrollmagic`, `Bootstrap3`, `Bootstrap4`, `React hook`, or any brand-new "Other" tag) → tool-tag list, joined with `" | "`.

Final `text`:

```
{description}{" | Offline" if the Offline token was picked}</br>{work-type}</br>{tool-tags joined by " | ", then " | ", then layout-style — or just layout-style if there are no tool tags}
```

### Step 8 — Update `dist/portfolio.json`

Read, parse, mutate, and write back the JSON (via a plain read → `JSON.parse` → mutate → `JSON.stringify` pass, not a hand-edit, to avoid formatting mistakes):

```json
{
  "project_name": "<as typed>",
  "image": "./img/<Step 5's output basename>",
  "text": "<Step 7's composite>",
  "link_live": "<string-or-array-or-omitted, per Step 6>",
  "link_github": "<string-or-array-or-omitted, per Step 6>"
}
```

- If a year group with `"years": "<year>"` already exists in the top-level array, prepend the new entry to that group's `protfolio_list`.
- If no such group exists, create `{"years": "<year>", "protfolio_list": [<new entry>]}` and insert it into the top-level array at the position that keeps `years` sorted newest-first (numeric descending) — the existing file is already in that order (2025, 2024, 2023, …), so this only matters when the new year is not already the array's first element.

Re-serialize with the same 2-space indentation the file already uses, so the diff stays minimal and readable.

### Step 9 — Commit, push, and open previews

Step 4's `git mv` (or, for a brand-new untracked file, plain rename + `git add`) already fully stages the rename in `src/images/`, both sides — nothing further needed there.

```bash
git add dist/img/<Step 5's output basename> dist/portfolio.json
git commit -m "feat: add {project_name} to portfolio ({year})"
git push origin master
```

No `Co-Authored-By` trailer (global preference, already in `~/.claude/CLAUDE.md`). Only ever stage the specific files this skill touched — never `git add -A` or a bare `git add .`, since the working tree may have unrelated in-progress edits at any given time (this has bitten this exact project before).

Then:

```bash
npm run start
```

(background — this leaves the dev server running for the user, same as every prior session in this project) and report the live GitHub Pages URL: `https://neoyeh.github.io/neo-portfolio/dist/` — noting that GitHub Pages can take a minute or two to reflect a just-pushed commit.

## 3. `README.md` (user-facing)

Short, root-level file covering just this feature (not a full project README — no other content is added):

- One-paragraph description of what `/add-portfolio` does.
- The one prerequisite: drop the source image into `src/images/` before running it.
- What gets asked (year / name / description / attributes / links) and which parts are optional-with-a-menu-fallback.
- What happens automatically afterward (rename + compress + commit + push + dev server + Pages link).

## 4. Historical-value scanning (used by Step 2's menus and Step 7's classification)

Both the description-menu and the attribute-menu read `dist/portfolio.json` fresh every time the skill runs (not a cached or hand-maintained list) — split every `text` field on `</br>`, treat segment 1 (minus any trailing `" | Offline"`) as a description candidate, and treat every `" | "`-delimited token in segments 2 and 3 as an attribute candidate. De-duplicate before presenting.

## Error handling summary

| Condition | Behavior |
|---|---|
| No new image in `src/images/` | Stop before any other step; tell the user to add one. |
| Multiple candidate images, ambiguous | Ask which one (Step 2 or Step 3). |
| `image-optimize` reports an error for the input | Stop; report the message; no data/git changes. |
| Project name contains Chinese | Ask for a romanized name for the slug (Step 2); `project_name` itself is unaffected. |
| Year not yet present in `portfolio.json` | Create a new year group at the correct sorted position. |
| A link doesn't obviously match `github` | Treated as a `link_live` entry (desktop icon). |

## Testing / verification approach

This is an interactive automation skill, not a unit-testable library — verification happens by actually running it end-to-end against a real throwaway image once the skill is written: confirm the renamed source file, the compressed output, the `portfolio.json` diff (correct year placement, correct three-line `text`, correct link classification), the commit (no co-author trailer, only the intended files), and that `npm run build`/`npm test`/`npm run lint` still pass afterward (the `PortfolioCard` propTypes change is the only part that touches existing code paths).

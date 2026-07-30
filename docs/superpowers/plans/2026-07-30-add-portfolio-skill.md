# Add-Portfolio Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable `/add-portfolio` Claude Code skill (plus one supporting code change and a user-facing README) that walks from a source image in `src/images/` to a pushed portfolio entry with the dev server running and the GitHub Pages URL ready to check.

**Architecture:** Three independent deliverables, built in dependency order. Task 1 generalizes `PortfolioCard`'s link rendering so it can display more than one non-GitHub link (a real code change with a real test). Task 2 writes the `SKILL.md` instruction file the `/add-portfolio` slash command reads — this is markdown Claude follows at invocation time, not compiled code, so its "test" is the end-to-end dry run in Task 4. Task 3 adds the project's first `README.md`, scoped to this one feature. Task 4 exercises the whole skill against a disposable test image through the local-commit step, deliberately stopping short of the real `git push` so a human decides whether to actually publish it.

**Tech Stack:** React 19 (function components, JS default parameters — no `defaultProps`), `@testing-library/react` + `jest-environment-jsdom` (already installed, currently unused — this plan's first real consumer), the `image-optimize` skill's `optimize` CLI (sharp-based) for compression, plain Node `fs`/`JSON` for editing `dist/portfolio.json` (no new dependency).

## Global Constraints

- No `Co-Authored-By` trailer on any commit in this repo (global preference, `~/.claude/CLAUDE.md`).
- Only ever `git add` the specific files a step touched — never `git add -A` or a bare `git add .`.
- GitHub-link detection: the link string contains `github` case-insensitively (matches this project's `github.io` prototype-preview links, not just `github.com`).
- Slug rule: lowercase the name, replace every run of characters outside `[a-z0-9]` with a single `-`, trim leading/trailing `-`.
- Chinese-name detection: the project name matches `/[一-鿿]/`.
- `text` field is three lines joined by `</br>`: `{description}{" | Offline" if picked}` / `{Independent Work | Team Work}` / `{tool-tags joined by " | ", then " | ", then layout-style — or just layout-style if no tool tags}`. Work-type defaults to `Independent Work`, layout-style defaults to `Responsive Web Design`, if the user picked neither option in that slot.
- `dist/portfolio.json` is the single source of truth (there is no separate `src`-level copy).
- Push target: `origin master`. Live URL to report: `https://neoyeh.github.io/neo-portfolio/dist/` (note it can take a minute or two to update after a push).
- Full spec: `docs/superpowers/specs/2026-07-30-add-portfolio-design.md`.

---

### Task 1: Generalize `PortfolioCard` to render multiple live-preview links

**Files:**
- Modify: `src/components/Portfolio/index.js`
- Create: `src/__tests__/components/Portfolio.test.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `PortfolioCard` is now a **named export** (`export { PortfolioCard };`, alongside the existing `export default Portfolio;`) so Task 4's manual verification and any future test can render it directly. `PortfolioCard`'s `item.link_live` now accepts a `string` or an `array` of strings, exactly like `item.link_github` already did — Task 2's skill relies on being able to write either shape into `dist/portfolio.json` without breaking the render.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/components/Portfolio.test.jsx`:

```jsx
/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PortfolioCard } from '../../components/Portfolio';

jest.mock('../../components/lazy-image', () => function LazyImage() { return null; });

describe('PortfolioCard link rendering', () => {
  test('renders one desktop icon and one github icon for single-string links', () => {
    render(
      <PortfolioCard item={{
        project_name: 'Solo Links',
        image: '',
        text: '',
        link_live: 'https://example.com/live',
        link_github: 'https://github.com/example/repo',
      }}
      />,
    );
    const liveLinks = screen.getAllByLabelText('Live preview');
    const githubLinks = screen.getAllByLabelText('GitHub repository');
    expect(liveLinks).toHaveLength(1);
    expect(liveLinks[0]).toHaveAttribute('href', 'https://example.com/live');
    expect(githubLinks).toHaveLength(1);
    expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/example/repo');
  });

  test('renders multiple desktop icons when link_live is an array', () => {
    render(
      <PortfolioCard item={{
        project_name: 'Multi Live',
        image: '',
        text: '',
        link_live: ['https://example.com/a', 'https://example.com/b'],
        link_github: '',
      }}
      />,
    );
    const liveLinks = screen.getAllByLabelText('Live preview');
    expect(liveLinks).toHaveLength(2);
    expect(liveLinks.map((a) => a.getAttribute('href'))).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ]);
  });

  test('renders desktop-icon links before github-icon links regardless of counts', () => {
    const { container } = render(
      <PortfolioCard item={{
        project_name: 'Order Check',
        image: '',
        text: '',
        link_live: ['https://example.com/a', 'https://example.com/b'],
        link_github: ['https://github.com/example/one', 'https://github.com/example/two'],
      }}
      />,
    );
    const icons = container.querySelectorAll('.font-card-icon');
    const order = Array.from(icons).map((el) => (
      el.className.includes('font-card-icon--live') ? 'live' : 'github'
    ));
    expect(order).toEqual(['live', 'live', 'github', 'github']);
  });

  test('renders no link-block at all when both link fields are empty', () => {
    const { container } = render(
      <PortfolioCard item={{
        project_name: 'No Links',
        image: '',
        text: '',
        link_live: '',
        link_github: '',
      }}
      />,
    );
    expect(container.querySelector('.link-block')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest src/__tests__/components/Portfolio.test.jsx
```

Expected: fails — `PortfolioCard` is not currently exported from `src/components/Portfolio/index.js` (only the default-exported `Portfolio` is), so this fails with an import/undefined-component error before any assertion runs.

- [ ] **Step 3: Generalize the link rendering and export `PortfolioCard`**

In `src/components/Portfolio/index.js`, replace the `gitlinkbuild` helper and the link-rendering JSX with a single shared helper used by both link fields. Change:

```js
  const gitlinkbuild = (data) => {
    if (data) {
      if (Array.isArray(data) && data.length > 0) {
        return (
          data.map((link) => (
              <a href={link} key={link} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer" aria-label="GitHub repository">
                  <i className="fab fa-github" aria-hidden="true" />
              </a>
          ))
        );
      }
      return (
          <a href={data} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer" aria-label="GitHub repository">
              <i className="fab fa-github" aria-hidden="true" />
          </a>
      );
    }
    return '';
  };
```

to:

```js
  const buildLinkIcons = (data, modifierClass, iconClassName, ariaLabel) => {
    if (!data) {
      return '';
    }
    const links = Array.isArray(data) ? data : [data];
    return links.map((link) => (
        <a
          href={link}
          key={link}
          className={`font-card-icon font-card-icon--${modifierClass}`}
          target="_blank"
          rel="nofollow noopener noreferrer"
          aria-label={ariaLabel}
        >
            <i className={iconClassName} aria-hidden="true" />
        </a>
    ));
  };
```

Then change the JSX that used the old helper and the single `linkLive` anchor:

```jsx
                      {(linkLive || linkGithub)
                        ? (
                            <div className="link-block">
                                {(linkLive)
                                  ? (
                                      <a href={linkLive} className="font-card-icon font-card-icon--live" target="_blank" rel="nofollow noopener noreferrer" aria-label="Live preview">
                                          <i className="fas fa-desktop" aria-hidden="true" />
                                      </a>
                                  ) : ''}
                                {gitlinkbuild(linkGithub)}
                            </div>
                        )
                        : ''}
```

to:

```jsx
                      {(linkLive || linkGithub)
                        ? (
                            <div className="link-block">
                                {buildLinkIcons(linkLive, 'live', 'fas fa-desktop', 'Live preview')}
                                {buildLinkIcons(linkGithub, 'github', 'fab fa-github', 'GitHub repository')}
                            </div>
                        )
                        : ''}
```

Update `PortfolioCard.propTypes`:

```js
PortfolioCard.propTypes = {
  // eslint-disable-next-line react/require-default-props
  item: PropTypes.shape({
    project_name: PropTypes.string,
    image: PropTypes.string,
    text: PropTypes.string,
    link_live: PropTypes.string,
    link_github: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  }),
};
```

to:

```js
PortfolioCard.propTypes = {
  // eslint-disable-next-line react/require-default-props
  item: PropTypes.shape({
    project_name: PropTypes.string,
    image: PropTypes.string,
    text: PropTypes.string,
    link_live: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    link_github: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  }),
};
```

Finally, at the bottom of the file, change:

```js
export default Portfolio;
```

to:

```js
export default Portfolio;
export { PortfolioCard };
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest src/__tests__/components/Portfolio.test.jsx
```

Expected: 4/4 passing.

- [ ] **Step 5: Run the full suite, lint, and build to confirm nothing else regressed**

```bash
npm test
npm run lint
npm run build
```

Expected: `npm test` shows all suites passing (the pre-existing `car.test.js` plus the new `Portfolio.test.jsx`); `npm run lint` shows 0 errors (same 3 pre-existing warnings as before this change — none of them are in the lines you touched); `npm run build` succeeds cleanly.

- [ ] **Step 6: Commit**

```bash
git add src/components/Portfolio/index.js src/__tests__/components/Portfolio.test.jsx
git commit -m "feat: let PortfolioCard render multiple live-preview links, not just one"
```

---

### Task 2: Write the `/add-portfolio` skill

**Files:**
- Create: `.claude/skills/add-portfolio/SKILL.md`

**Interfaces:**
- Consumes: `PortfolioCard`'s array-capable `link_live`/`link_github` from Task 1 (the data this skill writes must render correctly).
- Produces: the `/add-portfolio` slash command, invocable by name. Task 4 consumes it directly by invoking `/add-portfolio`.

- [ ] **Step 1: Create the skill directory and file**

```bash
mkdir -p .claude/skills/add-portfolio
```

Create `.claude/skills/add-portfolio/SKILL.md` with this exact content:

````markdown
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
````

- [ ] **Step 2: Verify the file's frontmatter is well-formed**

```bash
head -5 .claude/skills/add-portfolio/SKILL.md
```

Expected output:

```
---
name: add-portfolio
description: Add a new entry to the portfolio site — from a source image in src/images/ to a pushed commit with the dev server running and the GitHub Pages URL ready to check. Use when the user wants to add, publish, or upload a new portfolio/work item.
---

```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/add-portfolio/SKILL.md
git commit -m "feat: add /add-portfolio skill"
```

---

### Task 3: Write the user-facing `README.md`

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing (references the skill and the file layout Task 2 established, but doesn't require it to exist first — order relative to Task 2 doesn't matter functionally, this plan just does it after for narrative flow).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Write the file**

Create `README.md` at the project root with this exact content:

```markdown
# neo-portfolio

Neo Yeh's personal portfolio site (React 19 + Redux + Three.js). Live at [neoyeh.github.io/neo-portfolio/dist](https://neoyeh.github.io/neo-portfolio/dist/).

## Adding a new portfolio entry

Use the `/add-portfolio` Claude Code skill.

**Before running it:** drop the project's screenshot/photo into `src/images/`. That's the only manual step — everything else happens through the skill.

**What it asks for**, all in one message: year, project name, a short description, attributes (Independent Work / Team Work, Scrollmagic / Bootstrap, Responsive / Adaptive, Offline — pick any that apply), and one or more links (live site and/or GitHub/prototype preview). Description and attributes can be left blank — you'll get a menu of previously-used values to pick from instead. If the project name is in Chinese, you'll also be asked for a romanized name to build the image filename from.

**What happens automatically afterward:**
1. The image in `src/images/` is renamed to `<year>-<project-name-slug>.<ext>`.
2. It's compressed via the `image-optimize` skill and written to `dist/img/`.
3. `dist/portfolio.json` gets the new entry, filed under the right year.
4. The change is committed and pushed to `master`.
5. The dev server starts (`npm run start`) and you get the live GitHub Pages URL to check (allow a minute or two for GitHub Pages to catch up after the push).

Full design details: `docs/superpowers/specs/2026-07-30-add-portfolio-design.md`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with add-portfolio usage guide"
```

---

### Task 4: End-to-end dry-run verification (stop before the real push)

**Files:** none created or modified permanently — this task creates a disposable test image and reverts everything it touched once verified, except where the human explicitly says to keep it.

**Interfaces:**
- Consumes: the `/add-portfolio` skill from Task 2, the component change from Task 1.
- Produces: nothing — this is the plan's exit gate.

- [ ] **Step 1: Create a disposable test image**

```bash
python3 -c "
from PIL import Image
Image.new('RGB', (700, 345), color=(80, 120, 200)).save('src/images/zzz-add-portfolio-dry-run-test.jpg')
"
```

If Python/Pillow isn't available, any small throwaway `.jpg` copied into `src/images/` works — the content doesn't matter, only that `git status` picks it up as new.

- [ ] **Step 2: Invoke the skill and answer its intake message**

Invoke `/add-portfolio`. When it asks its one-shot intake question, answer with clearly fake, obviously-disposable values, e.g.:

```
年份: 1999
專案名稱: ZZZ Dry Run Test
連結: https://example.com/dry-run-test
```

Leave 說明 and 屬性 blank on purpose, to exercise Step 2's menu-fallback path — pick any option when the menu appears.

- [ ] **Step 3: Verify up through the local commit, then STOP**

Confirm, before letting the skill run `git push`:
- `src/images/1999-zzz-dry-run-test.jpg` (or similar, per the actual slug produced) exists and the old `zzz-add-portfolio-dry-run-test.jpg` name is gone.
- `dist/img/` has a new compressed file.
- `dist/portfolio.json` has a new `"years": "1999"` group (or an entry prepended to it, if 1999 already existed) with `project_name: "ZZZ Dry Run Test"`, the composite `text` field, and `link_live: "https://example.com/dry-run-test"`.
- `git log -1 --format=%B` shows a commit with no `Co-Authored-By` line, touching only the three files above.

If the skill tries to `git push` before you've confirmed all of this, interrupt it — do not let a dry-run test entry reach the real, public GitHub Pages site.

- [ ] **Step 4: Report to the human and let them decide**

Do not push. Report what was verified, and ask the human: keep this test commit and push it for real (unlikely — it's fake data), or revert it. If they say revert:

```bash
git reset --hard HEAD~1
```

(safe here — this commit was never pushed, so nothing is lost that exists anywhere else). Confirm afterward with `git status` and `git log -1 --format=%s` that the repo is back to the pre-Task-4 state (the tip commit should be Task 3's README commit).

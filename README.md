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

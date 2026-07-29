# Dependency Upgrade to Latest (incl. React 19) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every dependency in `package.json` to its currently published `latest` tag (as verified live against the npm registry on 2026-07-28), and update the application/config code so it works correctly under the new major versions — with zero net change in observable behavior.

**Architecture:** This is a tooling/dependency migration, not a feature build. There is no new business logic. Each task bumps one coherent group of packages, then adapts the minimum code required by that group's breaking changes, then re-verifies the existing test suite (`npm test`, 5 passing tests in `src/__tests__/car.test.js`) plus the relevant build command (`npm run build`, `npm start`, or `npm run lint`) before moving on. Tasks are ordered bottom-up: CSS/leaf tooling first, then the JS build pipeline (Babel/Jest/Webpack), then ESLint, then the application layer (React, Redux, Router, Three.js) — because the application-layer tasks need a working build to verify against. **Revision note:** Babel, Jest, and Webpack were originally planned as three independent tasks, but Task 4's first execution attempt discovered they are not independent — Babel 8 is published ESM-only, which breaks both `babel-loader` (webpack) and `babel-jest` (Jest) unless those are upgraded in the same step. They are now one merged task (Task 4) so the app never sits in an unbuildable intermediate state.

**Tech Stack:** React 19, Redux 5 / React-Redux 9 / Redux-Saga 1.5, React Router 7, Three.js r185 + @react-three/fiber 9 + @react-three/drei 10, Webpack 5, Babel 8, Jest 30, ESLint 10 (flat config), Sass (Dart Sass).

## Global Constraints

- Node.js floor: v24.18.0 LTS (already installed via nvm and confirmed working in this repo).
- Every version number below was captured live via `npm outdated` / `npm view <pkg> version` against the real npm registry on 2026-07-28 — they are not guesses. If a later run of `npm view <pkg> version` shows a newer number when this plan is executed, use that newer number instead; the intent is always "whatever `latest` resolves to at execution time".
- Every task must end with `npm test` still green (5/5 in `src/__tests__/car.test.js`) and the task's own verification command passing, before the commit step.
- No architecture changes beyond what a major-version bump requires. Explicitly **out of scope** for this plan:
  - Migrating manual `createStore`/`combineReducers` to Redux Toolkit's `configureStore` (Redux 5 still exports `createStore`, just marked deprecated — keep using it).
  - Rewriting the 21 `@import` statements in `src/css-src/*.scss` to `@use`/`@forward` (Dart Sass still supports `@import`, deprecation warning only, not a build break).
  - Fixing the pre-existing cosmetic bugs in `src/components/CreeperContent/crepper.js` (string literals `'THREE.DoubleSide'`, `"0xf0f0f0"` passed where enum/number values are expected) — unrelated to the upgrade, not touched here.
  - Introducing TypeScript — that is a separate, later initiative per the user's own phrasing ("後續導入 typescript") and gets its own plan.
- **A task's package group is that task's exclusive property.** If executing a task reveals it cannot reach a genuinely working, buildable state without also bumping a package another task owns, that is a plan defect, not a green light to reach into the other task's scope unilaterally — stop and report the conflict for a human decision (this is exactly what happened with the original split Babel/Jest/Webpack tasks, and why they are now merged).
- Packages already confirmed at `latest` and requiring **no action**: `redux-saga` (1.5.1), `moment` (2.30.1), `redux-logger` (3.0.6), `prop-types` (15.8.1). Do not touch these.
- `package-lock.json` is gitignored in this repo (see `.gitignore`) — use plain `npm install <pkg>@<version>` per task; do not hand-edit version strings in `package.json`.

---

### Task 1: Unblock the Sass build — replace `node-sass` with `sass`

`node-sass@4.14.1` has no native binary for arm64 Mac (confirmed: `npm run build` currently fails with `Node Sass does not yet support your current environment: OS X Unsupported architecture (arm64)`). This is broken today, independent of any "upgrade to latest" decision, so it goes first.

**Files:**
- Modify: `package.json:59`

**Interfaces:**
- Consumes: nothing (baseline repo state).
- Produces: a working Sass compiler for every later task that touches CSS/webpack (Task 4 depends on this).

- [x] **Step 1: Remove node-sass, install sass**

```bash
npm uninstall node-sass
npm install sass@1.102.0
```

- [x] **Step 2: Verify `sass-loader@8` (current version, not yet upgraded) auto-detects Dart Sass**

`sass-loader@8` tries to resolve `sass` before falling back to `node-sass`, so no config change is needed yet — this is verified by the build in Step 3.

**Actual result (this step's assumption was wrong — see completion note below):** auto-detection did not work reliably in this repo's worktree layout (Node module resolution could climb past the worktree into a stray `node-sass` in an ancestor directory). Fixed by pinning `implementation: require('sass')` explicitly in `webpack.config.js`'s `sass-loader` options instead of relying on auto-detection — this is also sass-loader's own documented best practice for avoiding implementation ambiguity, so it stays even outside the worktree scenario that surfaced it.

- [x] **Step 3: Run the CSS build and full webpack build to confirm the fix**

```bash
npm run build-css
npm run build
```

Expected: both commands complete without the `Unsupported architecture (arm64)` error. `npm run build` will still show unrelated warnings (webpack 4 deprecation notices) — that's expected until Task 4.

- [x] **Step 4: Run the existing test suite (regression baseline)**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total`.

- [x] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore: replace node-sass with sass (dart-sass) to fix arm64 build"
```

**Completed:** commit `d3d0ca3`. Also touched `package.json`'s `build-css` script (Dart Sass CLI syntax differs from node-sass's) and added the explicit `implementation: require('sass')` option to `webpack.config.js` (see Step 2 note) — both necessary corollaries of the swap, not scope creep. Review: clean, one deferred minor (inline `require('sass')` could be hoisted to a top-of-file `const` — done as part of Task 4's full rewrite of this file).

---

### Task 2: Replace deprecated `@babel/polyfill` with `core-js` + `regenerator-runtime`

`@babel/polyfill` has been deprecated by Babel itself since 7.4 and frozen at `7.12.1` forever — it has no "latest" to upgrade to. The modern replacement is importing `core-js/stable` and `regenerator-runtime/runtime` directly.

**Files:**
- Modify: `package.json:51`
- Modify: `webpack.config.js:8`

**Interfaces:**
- Consumes: nothing new.
- Produces: the two polyfill entry-point strings that Task 4's rewritten `webpack.config.js` carries forward unchanged.

- [x] **Step 1: Swap the dependency**

```bash
npm uninstall @babel/polyfill
npm install core-js@latest regenerator-runtime@latest
```

- [x] **Step 2: Update the webpack entry point**

In `webpack.config.js`, change:

```js
  entry: ['@babel/polyfill', './src/index.jsx'],
```

to:

```js
  entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/index.jsx'],
```

- [x] **Step 3: Run the build to confirm the polyfill entry still resolves**

```bash
npm run build
```

Expected: build succeeds, `dist/bundle.js` is generated, no "module not found" errors for the two new entry strings.

- [x] **Step 4: Run the test suite**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total`.

- [x] **Step 5: Commit**

```bash
git add package.json webpack.config.js
git commit -m "chore: replace deprecated @babel/polyfill with core-js + regenerator-runtime"
```

**Completed:** commit `fd72c43`. Review: clean, no findings.

---

### Task 3: Fix the legacy `uuid/v1` subpath import

`src/utils/car.js` and its test both do `import uuid from 'uuid/v1'`. This subpath-import style was removed starting `uuid@7` — `uuid@14` (latest) only exports named functions from the package root (`v1`, `v4`, etc.). This will hard-break as soon as `uuid` is bumped, so it needs the import rewritten in the same step as the version bump.

**Files:**
- Modify: `package.json:69`
- Modify: `src/utils/car.js`
- Modify: `src/__tests__/car.test.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `car.js` exporting the same public shape (`car.getCurrentCar`, `car.addProdToCar`) — unchanged for any future consumer.

- [x] **Step 1: Bump uuid**

```bash
npm install uuid@14.0.1
```

- [x] **Step 2: Rewrite the import in `src/utils/car.js`**

Change:

```js
import uuid from 'uuid/v1';

const car = {

    carContent:[],

    getCurrentCar: () => car.carContent,

    addProdToCar: (name,count) => {
        const workCar = [...car.getCurrentCar()];
        workCar.push({
            id: uuid(),
            name,
            count
        });
        return workCar;
    },
};

export default car;
```

to:

```js
import { v1 as uuidv1 } from 'uuid';

const car = {

    carContent:[],

    getCurrentCar: () => car.carContent,

    addProdToCar: (name,count) => {
        const workCar = [...car.getCurrentCar()];
        workCar.push({
            id: uuidv1(),
            name,
            count
        });
        return workCar;
    },
};

export default car;
```

- [x] **Step 3: Rewrite the mock in `src/__tests__/car.test.js`**

Change:

```js
import uuid from 'uuid/v1';
import car from '../utils/car';
import { add, sub } from '../utils/math';
```

to:

```js
import { v1 as uuidv1 } from 'uuid';
import car from '../utils/car';
import { add, sub } from '../utils/math';
```

Then change:

```js
jest.mock('uuid/v1');

const getCurrentCarSpy = jest.spyOn(
  car, 'getCurrentCar',
);

describe('addProdToCar', () => {
  beforeAll(() => {
    uuid.mockReturnValue('9999');
  });

  test('check_add_prod', () => {
    const newCar = car.addProdToCar('apple', 3);
    expect(uuid).toHaveBeenCalled();
    expect(uuid.mock.calls.length).toBe(1);
    expect(getCurrentCarSpy).toHaveBeenCalled();
    expect(newCar).toEqual(
      [{ id: '9999', name: 'apple', count: 3 }],
    );
  });

});
```

to:

```js
jest.mock('uuid', () => ({
  v1: jest.fn(),
}));

const getCurrentCarSpy = jest.spyOn(
  car, 'getCurrentCar',
);

describe('addProdToCar', () => {
  beforeAll(() => {
    uuidv1.mockReturnValue('9999');
  });

  test('check_add_prod', () => {
    const newCar = car.addProdToCar('apple', 3);
    expect(uuidv1).toHaveBeenCalled();
    expect(uuidv1.mock.calls.length).toBe(1);
    expect(getCurrentCarSpy).toHaveBeenCalled();
    expect(newCar).toEqual(
      [{ id: '9999', name: 'apple', count: 3 }],
    );
  });

});
```

- [x] **Step 4: Run the test suite and confirm it still passes**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total` (same count as baseline — `check_add_prod` must still pass with the mocked id `'9999'`).

- [x] **Step 5: Commit**

```bash
git add package.json src/utils/car.js src/__tests__/car.test.js
git commit -m "fix: migrate uuid/v1 subpath import to named export for uuid@14"
```

**Completed:** commit `e0f804b`. Review: clean, one deferred minor (pre-existing missing trailing newline in `car.js`, not introduced by this task).

---

### Task 4: Upgrade Babel 8, Jest 30, and Webpack 5 together (they are mutually coupled)

**Why merged:** this plan originally split these into three tasks (Babel core+presets, Jest+Testing Library, Webpack+babel-loader), assuming each could land and verify independently. The first execution attempt proved that assumption wrong: `@babel/core@8` is published **ESM-only**. Anything that `require()`s it — the old `babel-loader@8` (webpack) and the old `jest@26`'s config loader — breaks immediately. There is no working intermediate state where only Babel is bumped; `babel-loader` and `jest`/`babel-jest` must move to versions that can consume an ESM-only `@babel/core` in the same step. This task does all three together, as one atomic, verifiably-buildable unit.

**Files:**
- Modify: `package.json` (Babel core + presets, babel-loader, webpack + webpack-cli + webpack-dev-server + css/style/sass loaders + mini-css-extract-plugin + terser/css-minimizer plugins, jest + jest-environment-jsdom + testing-library packages; remove `@babel/plugin-syntax-dynamic-import`, `browser-sync-webpack-plugin`, `browser-sync`, `file-loader`, `url-loader`)
- Modify: `webpack.config.js` (full rewrite)
- Modify: `jest.config.js`
- `.babelrc.js` needs **no content change** — it currently only has `presets: ['@babel/preset-react', '@babel/preset-env']` and `plugins: ['@babel/plugin-transform-runtime']`; it never referenced `@babel/plugin-syntax-dynamic-import`, so there is nothing to remove from it.

**Interfaces:**
- Consumes: the entry-point array from Task 2 (`['core-js/stable', 'regenerator-runtime/runtime', './src/index.jsx']`) and the explicit `implementation: require('sass')` pattern from Task 1 (hoisted to a top-level `const` in this task's rewrite, addressing that task's deferred minor finding).
- Produces: the final `webpack.config.js` and `jest.config.js` shapes that Tasks 8–11 build/verify against.

`browser-sync-webpack-plugin`'s actual latest published version is `2.4.0` (verified via `npm view browser-sync-webpack-plugin dist-tags` — it has **not** been updated for webpack 5, last release predates it). Rather than gamble on undocumented compatibility, this task removes BrowserSync entirely and relies on `webpack-dev-server`'s own built-in live reload, which is sufficient for local dev.

- [ ] **Step 1: Bump every coupled package together, drop what's being replaced**

```bash
npm install --save-dev @babel/cli@8.0.4 @babel/core@8.0.1 @babel/preset-env@8.0.2 @babel/preset-react@8.0.1 @babel/preset-typescript@8.0.1 @babel/plugin-transform-runtime@8.0.1 babel-loader@10.1.1 webpack@5.109.1 webpack-cli@7.2.1 webpack-dev-server@6.0.0 css-loader@7.1.4 style-loader@4.0.0 sass-loader@17.0.0 mini-css-extract-plugin@2.10.2 terser-webpack-plugin@5.6.1 css-minimizer-webpack-plugin@8.0.0 jest@30.4.2 jest-environment-jsdom@30.4.1 @testing-library/react@16.3.2 @testing-library/jest-dom@7.0.0
npm uninstall @babel/plugin-syntax-dynamic-import browser-sync-webpack-plugin browser-sync file-loader url-loader
```

Dynamic `import()` is standard JS syntax and has been parsed natively by Babel without `@babel/plugin-syntax-dynamic-import` since Babel 7.8 — it was dead weight even before this upgrade. `file-loader`/`url-loader` are replaced by webpack 5's built-in asset modules in Step 2, so they're removed rather than upgraded.

- [ ] **Step 2: Rewrite `webpack.config.js`**

Replace the entire file with:

```js
const path = require('path');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => ({

  entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/index.jsx'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist/'),
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './dist'),
    },
    port: 8888,
  },
  devtool: 'source-map',
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(gltf)$/,
        type: 'asset/resource',
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/index.css',
    }),
  ],
  mode: argv.mode === 'production' ? 'production' : 'development',
});
```

Notes on what changed and why:
- `mode` is now required by webpack 5 (there is no more implicit default) — read from the CLI `--mode` flag via the function form of the config.
- The two babel-loader rules have no `plugins` key at all now (that's where `@babel/plugin-syntax-dynamic-import` used to live) — only `presets` remain.
- `sass` is required once at the top and passed as `sass-loader`'s explicit `implementation` (per Task 1's finding — auto-detection is not reliable enough to depend on).
- `MiniCssExtractPlugin.loader` no longer needs an explicit `publicPath` option for this project's relative-path setup.
- `file-loader`/`url-loader` are replaced by webpack 5's built-in [asset modules](https://webpack.js.org/guides/asset-modules/) (`type: 'asset/resource'`).
- `optimization.minimizer` is explicit now because webpack 5 no longer auto-minifies CSS the way `webpack -p` used to in webpack 4; `TerserPlugin` + `CssMinimizerPlugin` reproduce that.
- The BrowserSync plugin block and its `require` are gone entirely.

- [ ] **Step 3: Make the Jest test environment explicit in `jest.config.js`**

The only remaining test file (`src/__tests__/car.test.js`) uses plain `jest.mock`/`jest.spyOn`/`expect` — no DOM, no React rendering. Jest 30's default `testEnvironment` is `"node"`, which is sufficient. `@testing-library/react` and `@testing-library/jest-dom` are currently unused in `src` (their only consumers were tutorial components removed in a previous session) but stay as devDependencies per "upgrade everything" — bumped to latest and available via the now-installed `jest-environment-jsdom` package for whenever DOM-based tests return (a future test file can opt in per-file with a `/** @jest-environment jsdom */` docblock).

Change:

```js
module.exports = {
    verbose: true,
};
```

to:

```js
module.exports = {
    verbose: true,
    testEnvironment: 'node',
};
```

- [ ] **Step 4: Update the `build` script in `package.json`**

`webpack-cli@7` removed the `-p` shorthand entirely (it was deprecated since webpack-cli 4). Change:

```json
    "build": "webpack -p",
```

to:

```json
    "build": "webpack --mode production",
```

- [ ] **Step 5: Run the production build**

```bash
npm run build
```

Expected: `dist/bundle.js` and `dist/css/index.css` are generated, no errors. It's normal to see a Sass deprecation warning about legacy `@import` syntax in `src/css-src/*.scss` (out of scope per Global Constraints) — that is a warning, not a failure. If Babel/webpack/Jest still don't agree with each other at this point, that is a real blocker for this task — do not work around it by reaching for a different package's version than what Step 1 specifies; stop and report it (see the plan's Global Constraints note on task-scope conflicts).

- [ ] **Step 6: Run the dev server and confirm it serves the app**

```bash
npm start
```

Expected: server starts on port 8888 without throwing, and stays up (Ctrl+C to stop, or run with a timeout in CI). This replaces the old BrowserSync proxy on port 8889, which no longer exists.

- [ ] **Step 7: Run the test suite, then with coverage**

```bash
npm test
npm run test-cov
```

Expected: `Tests: 5 passed, 5 total` both times. No warning about a missing `jest-environment-jsdom` package (it's installed, just not the default).

- [ ] **Step 8: Commit**

```bash
git add package.json webpack.config.js jest.config.js
git commit -m "chore: upgrade babel to v8, jest to v30, and webpack to v5 together (coupled by babel's ESM-only architecture); drop BrowserSync"
```

---

### Task 5: Fix `imagemin` ESM-only breaking change

`imagemin@9` (latest) is published as pure ESM and can no longer be `require()`'d the way `webpack.config.png-to-jpg.js` currently does. This script is a standalone Node script (not run through webpack/babel), so it needs to become an ES module itself.

**Files:**
- Modify: `package.json:14,55-57`
- Rename+Modify: `webpack.config.png-to-jpg.js` → `webpack.config.png-to-jpg.mjs`

**Interfaces:**
- Consumes: nothing new (standalone script, no other task depends on it).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Bump the imagemin packages**

```bash
npm install imagemin@9.0.1 imagemin-mozjpeg@10.0.0 imagemin-pngquant@10.0.0
```

- [ ] **Step 2: Convert the script to ESM**

Delete `webpack.config.png-to-jpg.js` and create `webpack.config.png-to-jpg.mjs` with:

```js
import path from 'path';
import { fileURLToPath } from 'url';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, 'src/images/*.jpg');
const outPath = path.join(__dirname, 'dist/img');

(async () => {
    const files = await imagemin([inputPath], {
        destination: outPath,
        plugins: [
          imageminMozjpeg({quality: 90}),
        ]

    });

    console.log(files);
    //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
})();
```

(`imagemin-pngquant` stays installed per "upgrade everything", matching its current unused-in-this-script status — it was already not referenced by this script before the upgrade either.)

- [ ] **Step 3: Update the npm script**

In `package.json`, change:

```json
    "png-to-jpg": "node webpack.config.png-to-jpg"
```

to:

```json
    "png-to-jpg": "node webpack.config.png-to-jpg.mjs"
```

- [ ] **Step 4: Verify the script runs**

```bash
npm run png-to-jpg
```

Expected: no `require() of ES Module` error; script runs (it will report 0 files processed if `src/images/*.jpg` is empty — that's fine, the goal is confirming it loads and executes, not that there are images to convert).

- [ ] **Step 5: Commit**

```bash
git add package.json webpack.config.png-to-jpg.mjs
git rm webpack.config.png-to-jpg.js
git commit -m "fix: convert png-to-jpg script to ESM for imagemin@9 compatibility"
```

---

### Task 6: Upgrade ESLint to v10 (flat config)

ESLint 9+ requires flat config (`eslint.config.js`); the legacy `.eslintrc.js` format is no longer read at all. `eslint-config-airbnb`'s shareable config is still written in the legacy format, so it's bridged in via `@eslint/eslintrc`'s `FlatCompat` helper — this is the standard documented migration path.

**Files:**
- Modify: `package.json:9,29-30,34-39`
- Create: `eslint.config.js`
- Delete: `.eslintrc.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by other tasks (lint is independent of the build/test pipeline).

- [ ] **Step 1: Bump ESLint and every plugin it depends on, add the compat shim**

`eslint-config-airbnb` and `plugin:react/recommended` pull in `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react` as peers — these are also currently pinned to old majors in `package.json` and must be bumped alongside `eslint-config-airbnb` itself, or the flat-config resolution in Step 2 will fail on a version mismatch.

```bash
npm install --save-dev eslint@10.8.0 @typescript-eslint/eslint-plugin@8.65.0 @typescript-eslint/parser@8.65.0 eslint-config-airbnb@19.0.4 eslint-plugin-react@7.37.5 eslint-plugin-import@2.32.0 eslint-plugin-jsx-a11y@6.10.2 eslint-plugin-react-hooks@7.1.1 @eslint/eslintrc@latest
```

- [ ] **Step 2: Create `eslint.config.js`**

```js
const { FlatCompat } = require('@eslint/eslintrc');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('airbnb', 'plugin:react/recommended'),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'react/jsx-indent': ['error', 4],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
```

- [ ] **Step 3: Delete the legacy config**

```bash
git rm .eslintrc.js
```

- [ ] **Step 4: Fix the lint script to actually cover the codebase**

The existing script `"lint": "eslint src/*.js"` only lints top-level `.js` files in `src/` — it silently skips every `.jsx` file and every subdirectory, so it has never actually linted the React components. Fix this while the config is already being touched. Change:

```json
    "lint": "eslint src/*.js",
```

to:

```json
    "lint": "eslint src --ext .js,.jsx",
```

- [ ] **Step 5: Run lint and fix whatever the now-working config surfaces**

```bash
npm run lint
```

Expected: this is very likely to report real findings for the first time (the old script scanned effectively nothing). Fix reported issues file-by-file; do not mass-disable rules to silence it. If `airbnb`'s flat-config compatibility via `FlatCompat` throws a resolution error instead of producing lint output, that means a plugin `airbnb` depends on isn't resolvable under flat config — check the error for the missing plugin name and install it explicitly (this is the one step in this plan where the exact fix can't be pre-written, because it depends on which plugin flat-config resolution fails to find, if any).

- [ ] **Step 6: Commit**

```bash
git add package.json eslint.config.js
git commit -m "chore: migrate eslint to v10 flat config via FlatCompat, fix lint script glob"
```

---

### Task 7: Bump `vanilla-lazyload` (smoke test only)

**Files:**
- Modify: `package.json:70`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere — `src/components/lazy-image.js`'s `new LazyLoad(options)` / `.update()` API is unaffected across this version range.

- [ ] **Step 1: Bump the package**

```bash
npm install vanilla-lazyload@19.1.3
```

- [ ] **Step 2: Manually verify lazy-loaded images still render**

```bash
npm start
```

Open `http://localhost:8888/` in a browser, scroll the portfolio list, and confirm the `<img>` cards load their images via the `lazy-img` class (check DevTools Network tab for image requests firing on scroll, and Elements tab for `data-src` being swapped onto `src`).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: bump vanilla-lazyload to latest"
```

---

### Task 8: Upgrade React + ReactDOM to 19

`ReactDom.render(...)` (used in `src/index.jsx`) was deprecated in React 18 and is **removed entirely** in React 19 — this is the one change in this task that is a hard break, not just a deprecation warning. `PortfolioCard.defaultProps` (function-component `defaultProps`) is also removed in React 19 and must become a JS default parameter.

**Files:**
- Modify: `package.json:61-62`
- Modify: `src/index.jsx`
- Modify: `src/components/Portfolio/index.js`

**Interfaces:**
- Consumes: the webpack config from Task 4.
- Produces: `src/index.jsx` render entry point that Task 10 (React Router rewrite) edits again in the same file, and the `PortfolioCard` component shape (still accepting an `item` prop with the same fields) that nothing downstream changes further.

- [ ] **Step 1: Bump React**

```bash
npm install react@19.2.8 react-dom@19.2.8
```

- [ ] **Step 2: Switch the render entry point to `createRoot`**

In `src/index.jsx`, change:

```jsx
import React from 'react';
import ReactDom from 'react-dom';
import './css-src/index.scss';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import store from './store';

import Header from './components/Header';

ReactDom.render(
    <Provider store={store}>
        <HashRouter>
            <Header />
        </HashRouter>
    </Provider>,
    document.getElementById('root'),
);
```

to:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './css-src/index.scss';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import store from './store';

import Header from './components/Header';

const root = createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <HashRouter>
            <Header />
        </HashRouter>
    </Provider>,
);
```

- [ ] **Step 3: Convert `PortfolioCard.defaultProps` to a default parameter**

In `src/components/Portfolio/index.js`, change:

```js
const PortfolioCard = ({item}) => {
    const {
        project_name,
        image,
        text,
        link_live,
        link_github
    } = item;
```

to:

```js
const PortfolioCard = ({
    item = {
        image: '',
        text: '',
        link_live: '',
        link_github: '',
    },
}) => {
    const {
        project_name,
        image,
        text,
        link_live,
        link_github
    } = item;
```

Then remove the now-redundant block further down:

```js
PortfolioCard.defaultProps = {
    item: {
        image: '',
        text: '',
        link_live: '',
        link_github: '',
    },
};
```

Leave `PortfolioCard.propTypes` in place — React 19 no longer runs `propTypes` validation at all (for either function or class components), so it becomes an inert no-op rather than a hard error. It's safe to leave for now and is exactly the kind of thing the later TypeScript migration replaces properly; removing it isn't required for this upgrade to function.

- [ ] **Step 4: Run the build**

```bash
npm run build
```

Expected: build succeeds, no "ReactDOM.render is not a function" style errors.

- [ ] **Step 5: Run the dev server and manually confirm the app mounts**

```bash
npm start
```

Open `http://localhost:8888/` and confirm the portfolio list renders (this exercises `createRoot` end-to-end, and `PortfolioCard` rendering with the default-parameter fallback for any item missing `text`/`link_live`/`link_github`).

- [ ] **Step 6: Run the test suite**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total`.

- [ ] **Step 7: Commit**

```bash
git add package.json src/index.jsx src/components/Portfolio/index.js
git commit -m "feat: upgrade to react 19, migrate to createRoot and default parameters"
```

---

### Task 9: Upgrade Redux ecosystem (redux, react-redux)

No code changes are expected here — `createStore`/`combineReducers`/`applyMiddleware` (Redux 5) and `Provider`/`useSelector`/`useDispatch` (React-Redux 9) all keep the exact same public API this codebase already uses. `redux@5` marks `createStore` as deprecated (docs point to Redux Toolkit) but does not remove it. This task exists purely to bump the version and prove nothing broke.

**Files:**
- Modify: `package.json:63,65`

**Interfaces:**
- Consumes: the React 19 upgrade from Task 8 (`react-redux@9` requires React 18+).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Bump the packages**

```bash
npm install redux@5.0.1 react-redux@9.3.0
```

- [ ] **Step 2: Run the build**

```bash
npm run build
```

Expected: build succeeds. It's normal to see a console deprecation note about `createStore` when the app actually runs (Step 3) — that is a warning, not a failure, and matches the "no architecture change" constraint in this plan.

- [ ] **Step 3: Run the dev server and confirm the store still dispatches**

```bash
npm start
```

Open `http://localhost:8888/`, confirm the portfolio list loads (this proves `fetchPortfolioBegin` → saga → `fetchPortfolioSuccess` → `useSelector` round-trip still works end-to-end through the upgraded `react-redux`).

- [ ] **Step 4: Run the test suite**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total`.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore: upgrade redux to v5 and react-redux to v9"
```

---

### Task 10: Upgrade React Router to v7

React Router v6+ replaced `Switch` with `Routes`, replaced the `component={X}` prop with `element={<X />}`, made all routes exact-match by default (removing the need for the `exact` prop), and removed `NavLink`'s `activeClassName` prop (replaced by a function form of `className`).

**Files:**
- Modify: `package.json:64`
- Modify: `src/components/Header/index.js`

**Interfaces:**
- Consumes: `HashRouter` from `src/index.jsx` (Task 8) — untouched, still wraps `<Header />`.
- Produces: nothing consumed elsewhere — `Header` is the app's route leaf.

- [ ] **Step 1: Bump the package**

```bash
npm install react-router-dom@7.18.1
```

- [ ] **Step 2: Rewrite `src/components/Header/index.js`**

Change the import:

```js
import {
  Switch, Route, NavLink,
} from 'react-router-dom';
```

to:

```js
import {
  Routes, Route, NavLink,
} from 'react-router-dom';
```

Change the one active `NavLink` (the rest are already commented out and untouched):

```jsx
                <li>
                    <NavLink exact activeClassName="active" to={`/`}>
                        <i className="fa fa-cubes" aria-hidden="true"></i>
                        <span>Projects</span>    
                    </NavLink>
                </li> 
```

to:

```jsx
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => (isActive ? 'active' : undefined)}
                        end
                    >
                        <i className="fa fa-cubes" aria-hidden="true"></i>
                        <span>Projects</span>    
                    </NavLink>
                </li> 
```

(`end` is v6/v7's replacement for v5's `exact` — without it, `NavLink to="/"` would also match every other path.)

Change:

```jsx
            <Switch>
                <Route path="/about" component={About} />
                <Route path="/threeJsWork" component={ThreeJsWork} />
                <Route path="/creeperContent" component={CreeperContent} />
                <Route path="/portfolio" component={Portfolio} />
                <Route path="/" component={Portfolio} />
            </Switch>
```

to:

```jsx
            <Routes>
                <Route path="/about" element={<About />} />
                <Route path="/threeJsWork" element={<ThreeJsWork />} />
                <Route path="/creeperContent" element={<CreeperContent />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/" element={<Portfolio />} />
            </Routes>
```

- [ ] **Step 3: Run the build**

```bash
npm run build
```

Expected: build succeeds, no "Switch is not exported" errors.

- [ ] **Step 4: Manually verify every route**

```bash
npm start
```

Visit each of `http://localhost:8888/#/`, `#/about`, `#/threeJsWork`, `#/creeperContent`, `#/portfolio` and confirm each renders its component (the lazy-loaded ones — `Portfolio`, `ThreeJsWork`, `CreeperContent` — should show the `Loading...` `Suspense` fallback briefly, then the real content). Confirm the "Projects" nav link gets the `active` class only on `#/`, not on the other routes.

- [ ] **Step 5: Run the test suite**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total`.

- [ ] **Step 6: Commit**

```bash
git add package.json src/components/Header/index.js
git commit -m "feat: migrate react-router-dom to v7 (Routes/element/NavLink className)"
```

---

### Task 11: Upgrade Three.js ecosystem (three, @react-three/fiber, @react-three/drei)

`@react-three/fiber@9` requires React 19 (already done in Task 8). Beyond the version bump, two existing imports use fragile, non-public-API paths that are worth hardening while touching this code: `TextureLoader` is imported from the internal `three/src/...` source tree instead of the stable public `three` export, and `GLTFLoader` is imported from the older `three/examples/jsm/...` path instead of the `three/addons/...` alias three.js has used for its examples since r150+.

**Files:**
- Modify: `package.json:52-53,68`
- Modify: `src/components/ThreeJsWork/index.js`
- Modify: `src/components/CreeperContent/crepper.js`

**Interfaces:**
- Consumes: the React 19 upgrade from Task 8, the React Router routes from Task 10 (`/threeJsWork` and `/creeperContent` must still resolve to these components).
- Produces: nothing consumed elsewhere — these are route-leaf components.

- [ ] **Step 1: Bump the packages**

```bash
npm install three@0.185.1 @react-three/fiber@9.6.1 @react-three/drei@10.7.7
```

- [ ] **Step 2: Harden the `GLTFLoader` import path**

In `src/components/ThreeJsWork/index.js`, change:

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
```

to:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
```

- [ ] **Step 3: Harden the `TextureLoader` import path**

In `src/components/CreeperContent/crepper.js`, change:

```js
import { TextureLoader } from 'three/src/loaders/TextureLoader'
```

to:

```js
import { TextureLoader } from 'three'
```

(`three/src/...` reaches into the package's internal, unbundled source tree — not a guaranteed-stable import path across versions. `TextureLoader` has always been part of the public `three` root export, so this is both a fix and a simplification.)

- [ ] **Step 4: Run the build**

```bash
npm run build
```

Expected: build succeeds, no "module not found" for either changed import path.

- [ ] **Step 5: Manually verify both 3D routes render**

```bash
npm start
```

Visit `http://localhost:8888/#/threeJsWork` — confirm the GLTF model loads and orbit controls work (drag to rotate). Visit `http://localhost:8888/#/creeperContent` — confirm the Creeper mesh renders with its head/body/feet animating, and the FPS stats panel appears (it's appended into `.page` via the `useEffect` in `CreeperContent`). Open the browser console and confirm no new errors appear beyond whatever pre-existing cosmetic warnings already existed before this task (e.g. the known `'THREE.DoubleSide'` string-vs-enum issue noted in Global Constraints — unrelated, not introduced by this upgrade).

- [ ] **Step 6: Run the test suite**

```bash
npm test
```

Expected: `Tests: 5 passed, 5 total` (unaffected — no test touches Three.js).

- [ ] **Step 7: Commit**

```bash
git add package.json src/components/ThreeJsWork/index.js src/components/CreeperContent/crepper.js
git commit -m "chore: upgrade three.js/@react-three ecosystem, harden loader import paths"
```

---

### Task 12: Final full-suite regression pass

**Files:** none (verification only).

**Interfaces:**
- Consumes: the final state of every prior task.
- Produces: nothing — this is the plan's exit gate.

- [ ] **Step 1: Confirm zero outdated packages remain**

```bash
npm outdated
```

Expected: empty output (every package in `package.json` is at its `latest`).

- [ ] **Step 2: Full lint pass**

```bash
npm run lint
```

Expected: passes (or only pre-existing style findings unrelated to this upgrade — fix anything that's a real error, not a style nit, before proceeding).

- [ ] **Step 3: Full test pass with coverage**

```bash
npm run test-cov
```

Expected: `Tests: 5 passed, 5 total`.

- [ ] **Step 4: Full production build**

```bash
npm run build
```

Expected: `dist/bundle.js` and `dist/css/index.css` generated with no errors.

- [ ] **Step 5: Full manual smoke test of every route**

```bash
npm start
```

Walk through `#/`, `#/about`, `#/threeJsWork`, `#/creeperContent`, `#/portfolio` one more time end-to-end, confirming: portfolio cards render with lazy-loaded images, the Projects nav link highlights only on `#/`, and both Three.js routes render without console errors.

- [ ] **Step 6: Commit the plan's completion marker**

```bash
git add -A
git commit -m "chore: complete full dependency upgrade to latest (incl. react 19)"
```

---

## Follow-ups explicitly not covered by this plan

- Migrating `createStore`/`combineReducers` to Redux Toolkit's `configureStore`.
- Rewriting `@import` to `@use`/`@forward` across `src/css-src/*.scss`.
- Fixing the pre-existing `'THREE.DoubleSide'` / `"0xf0f0f0"` string-vs-enum bugs in `crepper.js`.
- Introducing TypeScript (separate future plan, per the user's own "後續導入" framing).

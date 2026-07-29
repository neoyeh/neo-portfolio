const { FlatCompat } = require('@eslint/eslintrc');
const { SourceCode } = require('eslint');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

// eslint-plugin-react@7.37.5 (latest available; peerDependencies still cap
// at eslint@^9.7) has several JSX-spacing rules that still call
// sourceCode.isSpaceBetweenTokens(), which ESLint 10 renamed (identical
// signature/behavior) to sourceCode.isSpaceBetween() and dropped the old
// name for. Unlike context.getFilename() (blocked by the `eslint` package's
// "exports" map), SourceCode is a public export of the package's main
// entry point, so the old name can be restored as an alias without reaching
// into any internals. This is a straight rename shim, not a behavior change.
if (!SourceCode.prototype.isSpaceBetweenTokens) {
  SourceCode.prototype.isSpaceBetweenTokens = SourceCode.prototype.isSpaceBetween;
}

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
        // The legacy .eslintrc.js set `env: { browser: true }`, which
        // auto-injected the browser global set (window, document, etc.).
        // Flat config has no `env` shorthand, so it's replicated explicitly
        // via the `globals` package (the migration path ESLint's own docs
        // recommend) rather than dropped, since real source files
        // (src/index.jsx, src/components/lazy-image.js) reference `document`.
        ...globals.browser,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      // eslint-plugin-react@7.37.5 (latest available; peerDependencies still
      // cap at eslint@^9.7) crashes under ESLint 10 when settings.react.version
      // is left as the airbnb config's default "detect": ESLint 10 removed the
      // deprecated context.getFilename() that eslint-plugin-react's version
      // detection still calls. Pinning the actual installed React version here
      // avoids that code path entirely. Read dynamically from the installed
      // package so this never drifts from whatever React version is actually
      // in node_modules again (was previously hardcoded and had gone stale
      // after the Task 8 React 19 bump).
      react: {
        version: require('react/package.json').version,
      },
    },
    rules: {
      'react/jsx-indent': ['error', 4],
      // eslint-plugin-react-hooks@7.1.1 (latest) ships a much larger
      // "recommended"/"recommended-latest" config now (it has absorbed the
      // React Compiler correctness rules: purity, immutability,
      // set-state-in-render, etc.), which is out of scope for a lint-config
      // task on an app that predates the Compiler. Only the two classic,
      // narrowly-scoped hooks rules are enabled here — the ones this plugin
      // has always been known for.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // eslint-plugin-react@7.37.5 (latest available; peerDependencies still
      // cap at eslint@^9.7) has one rule, jsx-filename-extension, that calls
      // the fully-removed ESLint 10 API context.getFilename() unconditionally
      // in its create(), crashing the entire lint run rather than reporting a
      // finding. Unlike the isSpaceBetweenTokens rename above, ESLint 10
      // doesn't expose an equivalent replacement on any public API surface
      // (context.filename is a plain property on a frozen, non-subclassable
      // object, not something a public export lets you shim), so there's no
      // workaround available. No newer eslint-plugin-react release fixes
      // this yet, so it's disabled here rather than left to crash the whole
      // run. This is a real, if narrow, coverage loss: the rule would flag
      // 7 real findings in this codebase (About/, CreeperContent/crepper.js,
      // CreeperContent/index.js, Header/, Portfolio/, ThreeJsWork/,
      // lazy-image.js all contain JSX in a .js file, not .jsx). Renaming
      // those 7 files and updating every import is real, valid follow-up
      // work, deliberately left out of this task's scope.
      'react/jsx-filename-extension': 'off',
      // eslint-plugin-import@2.32.0 (latest available) has the same gap:
      // import/order's autofix path (fixOutOfOrder) calls the fully-removed
      // sourceCode.getTokenOrCommentBefore()/getTokenOrCommentAfter(), which
      // crashes as soon as it finds a real out-of-order-import violation to
      // build a fix for (ESLint computes fixes for every match regardless of
      // whether --fix is passed).
      'import/order': 'off',
      // src/components/CreeperContent and src/components/ThreeJsWork render
      // react-three-fiber's Three.js-backed intrinsic elements (<mesh>,
      // <meshStandardMaterial>, <pointLight>, ...), whose props are Three.js
      // object properties, not DOM/React attributes. react/no-unknown-property
      // only knows the DOM/React vocabulary, so it flags every one of them;
      // this is the standard react-three-fiber ESLint setup (see
      // https://docs.pmndrs.io/react-three-fiber - ESLint section) rather
      // than a workaround for a real issue.
      'react/no-unknown-property': ['error', {
        ignore: [
          'args', 'attachArray', 'castShadow', 'dispose', 'distance',
          'emissive', 'map', 'metalness', 'object', 'position',
          'receiveShadow', 'rotation-x', 'roughness', 'side', 'transparent',
        ],
      }],
    },
  },
  {
    // src/__tests__/car.test.js was never actually scanned by the old
    // "eslint src/*.js" script (subdirectories were skipped), so its missing
    // Jest globals (describe/test/expect/jest/...) never surfaced before.
    files: ['**/__tests__/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];

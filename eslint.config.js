const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');
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
    },
    settings: {
      // eslint-plugin-react@7.37.5 (latest available; peerDependencies still
      // cap at eslint@^9.7) crashes under ESLint 10 when settings.react.version
      // is left as the airbnb config's default "detect": ESLint 10 removed the
      // deprecated context.getFilename() that eslint-plugin-react's version
      // detection still calls. Pinning the actual installed React version here
      // avoids that code path entirely.
      react: {
        version: '18.3.1',
      },
    },
    rules: {
      'react/jsx-indent': ['error', 4],
      // eslint-plugin-react@7.37.5 (latest available; peerDependencies still
      // cap at eslint@^9.7) has one rule, jsx-filename-extension, that calls
      // the fully-removed ESLint 10 API context.getFilename() unconditionally
      // in its create(), crashing the entire lint run rather than reporting a
      // finding. No newer eslint-plugin-react release fixes this yet, so it
      // is disabled here rather than left to crash the whole run.
      'react/jsx-filename-extension': 'off',
      // Same eslint-plugin-react@7.37.5/ESLint 10 gap as above: these four
      // airbnb-enabled rules all call the fully-removed SourceCode method
      // sourceCode.isSpaceBetweenTokens() (renamed isSpaceBetween() in
      // ESLint 10, but the plugin hasn't been updated to the new name), so
      // each one crashes the whole run as soon as it hits a JSX element.
      // Node's package.json "exports" map blocks reaching into ESLint's
      // internals to shim the old method name back in, so disabling is the
      // only available workaround until eslint-plugin-react ships a fix.
      'react/jsx-curly-spacing': 'off',
      'react/jsx-equals-spacing': 'off',
      'react/jsx-tag-spacing': 'off',
      'react/jsx-one-expression-per-line': 'off',
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

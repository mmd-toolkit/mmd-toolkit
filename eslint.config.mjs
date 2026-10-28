import myPlugin from "@ota-meshi/eslint-plugin"

/** Why the tests of the parser may not import the modules that run mermaid.js. */
const PARSER_TESTS_RUN_NO_MERMAID =
  "The tests of the parser compare with what the fixtures record and run no mermaid.js; what mermaid.js does with an input is recorded as a fixture by the tests package."

/** Why an array is not spread into the arguments of these calls. */
const ARGUMENT_SPREAD_LIMIT =
  "Each spread element is one argument, and V8 throws a RangeError past about 125,000 arguments; use the helper of the package (appendItems, minOf, maxOf) or a loop."

/**
 * The selector of a spread argument of a call to one of `methods`, on any
 * object or on `object` only. It matches a method named as `a.push` or as
 * `a["push"]`; `dot-notation` turns `` a[`push`] `` into `a.push`, and `a[push]`
 * names whatever the variable `push` holds.
 */
function spreadIntoCallOf(methods, object) {
  const named = methods.flatMap((method) => [
    `[callee.computed=false][callee.property.name='${method}']`,
    `[callee.computed=true][callee.property.value='${method}']`,
  ])
  const receiver =
    object === undefined ? "" : `[callee.object.name='${object}']`
  return `CallExpression${receiver}:matches(${named.join(", ")}) > SpreadElement`
}

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/lib/",
      "**/coverage/",
      "**/test-results/",
      "**/playwright-report/",
      "packages/tests/fixtures/",
      ".claude/worktrees/",
      ".work/",
      // Working files that are deleted before the release.
      "tmp/",
      "!.github/",
    ],
  },
  ...myPlugin.config({
    node: true,
    ts: true,
    vue3: { withTs: true },
    json: true,
    yaml: true,
    md: true,
    prettier: true,
    packageJson: true,
  }),
  {
    files: ["packages/playground/tests/e2e/*.ts"],
    rules: {
      // page.evaluate callbacks run in the browser, including navigator access.
      "n/no-unsupported-features/node-builtins": "off",
    },
  },
  {
    files: ["packages/playground/**/*.{ts,vue}"],
    languageOptions: {
      parserOptions: { project: "./packages/playground/tsconfig.json" },
    },
  },
  {
    files: ["packages/playground/src/**/*.{ts,vue}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        performance: "readonly",
        Blob: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        CompressionStream: "readonly",
        DecompressionStream: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    rules: {
      // Browser modules use Vite's worker, CSS and workspace-source resolution.
      "n/no-missing-import": "off",
      "n/no-unsupported-features/node-builtins": "off",
      "n/no-unsupported-features/es-builtins": "off",
    },
  },
  {
    files: ["**/*.{js,ts,mjs,mts,cjs,cts}"],
    rules: {
      "n/prefer-node-protocol": "error",
      "n/file-extension-in-import": ["error", "always"],
      // Cyclomatic complexity is a poor proxy for readability here: flat
      // character-class predicates and hand-written lexers legitimately have
      // many branches. Readability is judged in review instead.
      complexity: "off",
      // Every regular expression carries the u or v flag.
      "regexp/require-unicode-regexp": "error",
      // Report missing JSDoc, but never let `eslint --fix` insert empty stubs;
      // the author writes the comment.
      "jsdoc/require-jsdoc": ["error", { enableFixer: false }],
      "jsdoc/no-blank-blocks": "error",
      "jsdoc/no-blank-block-descriptions": "error",
      // Every input of a test answers a sentence of a defining document and is
      // a fixture; none is chosen by a random source or a count (AGENTS.md,
      // Principles). A hand-written generator is caught in review.
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message:
            "Inputs are fixtures that answer a sentence, never random (AGENTS.md, Principles).",
        },
      ],
      // Never keep literal U+2028/U+2029 and other irregular whitespace in
      // source, not even inside strings, regexps or comments: write escapes.
      // The fixture inputs that need the real characters are ignored above.
      "no-irregular-whitespace": [
        "error",
        {
          skipStrings: false,
          skipComments: false,
          skipRegExps: false,
          skipTemplates: false,
          skipJSXText: false,
        },
      ],
    },
    settings: {
      n: {
        typescriptExtensionMap: [],
      },
    },
  },
  {
    // The tests of the parser compare its results with what the fixtures
    // record; they neither run mermaid.js nor generate inputs. The modules
    // that load mermaid.js stay out of them, however they are named, except
    // for their types, which load nothing: mermaid.js itself and the module
    // of @mmd-toolkit/tests that runs it (mermaid).
    files: ["packages/parser/tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@mmd-toolkit/tests/mermaid",
              allowTypeImports: true,
              message: PARSER_TESTS_RUN_NO_MERMAID,
            },
            {
              name: "mermaid",
              allowTypeImports: true,
              message: PARSER_TESTS_RUN_NO_MERMAID,
            },
          ],
          patterns: [
            {
              group: [
                "mermaid/*",
                "**/tests/src/mermaid",
                "**/tests/src/mermaid.ts",
              ],
              allowTypeImports: true,
              message: PARSER_TESTS_RUN_NO_MERMAID,
            },
          ],
        },
      ],
    },
  },
  {
    // An array spread into the arguments of a call passes one argument per
    // element, and V8 throws a RangeError past about 125,000 arguments, which
    // an input reaches. The code that reads inputs appends and takes the
    // smallest or the largest value with the helpers of its package instead
    // (`appendItems`, `minOf`, `maxOf`). This rule, not a fixture, guards these
    // failures: an input of that size cannot be recorded in the corpus.
    files: [
      "packages/*/src/**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx,vue}",
      "packages/*/tools/**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx,vue}",
      "tools/**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx,vue}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: spreadIntoCallOf(["push", "unshift", "splice"]),
          message: ARGUMENT_SPREAD_LIMIT,
        },
        {
          selector: spreadIntoCallOf(["max", "min"], "Math"),
          message: ARGUMENT_SPREAD_LIMIT,
        },
        {
          selector: spreadIntoCallOf(
            ["fromCodePoint", "fromCharCode"],
            "String",
          ),
          message: ARGUMENT_SPREAD_LIMIT,
        },
      ],
    },
  },
  {
    // Code blocks in Markdown documents illustrate types and APIs; they are not
    // programs, so unused declarations are expected there, an example shows a
    // result by printing it, and its functions carry no JSDoc. This comes
    // after the rules for source files, which match these code blocks too.
    files: ["**/*.md/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "jsdoc/require-jsdoc": "off",
    },
  },
]

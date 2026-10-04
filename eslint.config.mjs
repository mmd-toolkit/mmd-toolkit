import myPlugin from "@ota-meshi/eslint-plugin"

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
      // Working data whose inputs intentionally contain unusual whitespace.
      "tmp/*.json",
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

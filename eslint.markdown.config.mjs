// The ESLint configuration for the Japanese documents themselves, run by
// `pnpm run lint:ja`. It is separate from eslint.config.mjs because that
// configuration processes every Markdown file for its code blocks, and a file
// that a processor handles is not linted as a document; here the documents are
// linted as Markdown through @eslint/markdown and the rule
// scripts/eslint/ja-line-width.mjs.
import eslintMarkdown from "@eslint/markdown"
import { localPlugin } from "./scripts/eslint/ja-line-width.mjs"

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/lib/",
      "packages/tests/fixtures/",
      "tmp/",
      ".claude/worktrees/",
    ],
  },
  {
    files: ["**/*.ja.md"],
    plugins: { "eslint-markdown": eslintMarkdown, local: localPlugin },
    language: "eslint-markdown/gfm",
    languageOptions: { frontmatter: "yaml" },
    rules: { "local/ja-line-width": "error" },
  },
]

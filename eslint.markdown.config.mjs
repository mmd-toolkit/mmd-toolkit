// The ESLint configuration for the Japanese documents themselves, run by
// `pnpm run lint:ja`. It is separate from eslint.config.mjs because that
// configuration processes every Markdown file for its code blocks, and a file
// that a processor handles is not linted as a document; here the documents are
// linted as Markdown through @eslint/markdown and local/ja-line-breaks
// (scripts/eslint/rules/ja-line-breaks.mjs).
import eslintMarkdown from "@eslint/markdown"
import { localPlugin } from "./scripts/eslint/index.mjs"

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/lib/",
      "packages/tests/fixtures/",
      ".claude/worktrees/",
      ".work/",
    ],
  },
  {
    files: ["**/*.ja.md"],
    plugins: { "eslint-markdown": eslintMarkdown, local: localPlugin },
    language: "eslint-markdown/gfm",
    languageOptions: { frontmatter: "yaml" },
    rules: {
      "local/ja-line-breaks": "error",
    },
  },
]

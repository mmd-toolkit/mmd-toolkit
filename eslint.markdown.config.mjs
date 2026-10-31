// The ESLint configuration for the Markdown documents themselves, run by
// `pnpm run lint:md`. It is separate from eslint.config.mjs because that
// configuration processes every Markdown file for its code blocks, and a file
// that a processor handles is not linted as a document; here the documents are
// linted as Markdown through @eslint/markdown: every document for its links,
// and the Japanese documents also for their line breaks (local/ja-line-breaks,
// scripts/eslint/rules/ja-line-breaks.mjs).
import eslintMarkdown from "@eslint/markdown"
import markdownLinks from "eslint-plugin-markdown-links"
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
    files: ["**/*.md"],
    plugins: {
      markdown: eslintMarkdown,
      "markdown-links": markdownLinks,
    },
    language: "markdown/gfm",
    languageOptions: { frontmatter: "yaml" },
    rules: {
      // A link to a heading of the same document.
      "markdown-links/no-missing-fragments": "error",
      // A link to another file, and to a heading in it.
      "markdown-links/no-missing-path": "error",
    },
  },
  {
    files: ["**/*.ja.md"],
    plugins: { local: localPlugin },
    rules: {
      "local/ja-line-breaks": "error",
    },
  },
]

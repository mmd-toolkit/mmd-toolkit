import markdown from "@eslint/markdown"
import { transformerTwoslash } from "@shikijs/vitepress-twoslash"
import mmdToolkit from "@mmd-toolkit/eslint-plugin"
import { createTwoslasher } from "twoslash-eslint"

/** Selects diagram and Markdown fences whose comments configure an mmd rule. */
function isEslintExample(lang, code) {
  return (
    (lang === "mmd" || lang === "mermaid" || lang === "md") &&
    code.includes("%% eslint @mmd-toolkit/")
  )
}

/**
 * Passes the Mermaid blocks of a Markdown example to the rules. The `ESLint`
 * class lints every block that a configuration matches, but `twoslash-eslint`
 * calls `Linter` directly and has no way to pass it a `filterCodeBlock`. Without
 * one, `Linter` lints only the blocks whose names end in `.js`, so each Mermaid
 * block gets that ending here.
 */
const mermaidBlocks = {
  ...markdown.processors.markdown,
  preprocess(text, filename) {
    const blocks = markdown.processors.markdown
      .preprocess(text, filename)
      .filter(
        (block) =>
          block.filename.endsWith(".mermaid") ||
          block.filename.endsWith(".mmd"),
      )
    // Not JavaScript: `twoslash-eslint` leaves `Linter` with only `.js` names.
    return blocks.map((block) => ({
      ...block,
      filename: `${block.filename}.js`,
    }))
  },
}

const twoslash = transformerTwoslash({
  explicitTrigger: false,
  filter: isEslintExample,
  twoslasher: createTwoslasher({
    eslintConfig: [
      {
        files: ["**/*.md"],
        plugins: { docs: { processors: { mermaidBlocks } } },
        processor: "docs/mermaidBlocks",
      },
      {
        files: [
          "**/*.mmd",
          "**/*.mermaid",
          // Mermaid blocks renamed for `twoslash-eslint`, not JavaScript.
          "**/*.md/*.js",
        ],
        plugins: { "@mmd-toolkit": mmdToolkit },
        language: "@mmd-toolkit/mermaid",
      },
    ],
  }),
  errorRendering: "hover",
  // A failed diagnostic run must fail the build rather than hide the markers.
  throws: true,
})

/**
 * Examples opt in by configuring an mmd rule in a Mermaid comment. Shiki uses
 * VitePress's language alias for highlighting, but passes `mmd` to this hook.
 */
export const eslintCodeTransformer = {
  ...twoslash,
  preprocess(code, options) {
    if (!isEslintExample(options.lang, code)) return undefined
    // The VitePress adapter removes v-pre to render its Vue hover components.
    // Skip that adapter too for other fences, preserving literal {{...}} text.
    return twoslash.preprocess.call(this, code, options)
  },
}

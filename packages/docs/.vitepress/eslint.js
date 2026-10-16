import { transformerTwoslash } from "@shikijs/vitepress-twoslash"
import mmdToolkit from "@mmd-toolkit/eslint-plugin"
import { createTwoslasher } from "twoslash-eslint"

/** Selects diagram fences whose comments explicitly configure an mmd rule. */
function isEslintExample(lang, code) {
  return (
    (lang === "mmd" || lang === "mermaid") &&
    code.includes("%% eslint @mmd-toolkit/")
  )
}

const twoslash = transformerTwoslash({
  explicitTrigger: false,
  filter: isEslintExample,
  twoslasher: createTwoslasher({
    eslintConfig: [
      {
        files: ["**/*.mmd", "**/*.mermaid"],
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

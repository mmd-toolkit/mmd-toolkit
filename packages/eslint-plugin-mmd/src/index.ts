import type { ESLint, Linter } from "eslint"
import packageJson from "../package.json" with { type: "json" }
import { mermaidLanguage } from "./language.ts"
import { rules } from "./rules/index.ts"

export type { MermaidLanguageTypes } from "./language.ts"
export { mermaidLanguage } from "./language.ts"
export type { MermaidRuleDefinition, MermaidRuleVisitor } from "./rule-types.ts"
export type { MermaidSyntaxElement } from "./source-code.ts"
export { MermaidSourceCode } from "./source-code.ts"

/** The plugin, with the configurations that it provides. */
export interface MermaidPlugin extends ESLint.Plugin {
  configs: { recommended: Linter.Config }
}

const plugin: MermaidPlugin = {
  meta: {
    name: packageJson.name,
    version: packageJson.version,
    // The rule ids, the language, and the configurations use this namespace.
    namespace: "mmd",
  },
  languages: { mermaid: mermaidLanguage },
  rules,
  configs: {
    /**
     * Applies the Mermaid language to `.mmd` and `.mermaid` files, which also
     * matches the `mermaid` and `mmd` code blocks that a Markdown processor
     * extracts, and enables the rules whose `meta.docs.recommended` is true.
     */
    recommended: {
      name: "mmd/recommended",
      files: ["**/*.mmd", "**/*.mermaid"],
      language: "mmd/mermaid",
      rules: Object.fromEntries(
        Object.entries(rules)
          .filter(([, rule]) => rule.meta?.docs?.recommended === true)
          .map(([name]) => [`mmd/${name}`, "error"]),
      ),
    },
  },
}

// The configuration registers the plugin object itself: ESLint rejects two
// different objects under the same plugin name, so a user who also lists the
// plugin under `plugins` must get the same object.
plugin.configs.recommended.plugins = { mmd: plugin }

export default plugin

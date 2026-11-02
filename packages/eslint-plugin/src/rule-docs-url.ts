/** Where the documents of the rules are published. */
const RULE_DOCS_BASE = "https://mmd-toolkit.github.io/mmd-toolkit/linter/rules/"

/**
 * The URL of the document of a rule, from its name in the plugin, such as
 * `no-unclosed-directive` or `flowchart-no-ignored-text`.
 */
export function ruleDocsUrl(name: string): string {
  return `${RULE_DOCS_BASE}${name}.html`
}

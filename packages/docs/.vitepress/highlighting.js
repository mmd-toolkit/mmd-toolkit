import mermaid from "@mmd-toolkit/textmate-grammar"

/**
 * Colors `mermaid` and `mmd` code blocks inside a Markdown code block. Shiki's
 * Markdown grammar has no rule for them, so this one is injected into it, in
 * the form of that grammar's rules for code blocks. The inner rule uses `while`
 * because the rules of the Mermaid grammar would otherwise run past the closing
 * fence.
 */
const mermaidInMarkdown = {
  name: "markdown-mermaid",
  scopeName: "markdown.mermaid.codeblock",
  injectTo: ["text.html.markdown"],
  injectionSelector: "L:text.html.markdown",
  patterns: [
    {
      begin: "(^|\\G)(\\s*)(`{3,}|~{3,})\\s*(?i:(mermaid|mmd)(\\s+[^`~]*)?$)",
      name: "markup.fenced_code.block.markdown",
      end: "(^|\\G)(\\2|\\s{0,3})(\\3)\\s*$",
      beginCaptures: {
        3: { name: "punctuation.definition.markdown" },
        4: { name: "fenced_code.block.language.markdown" },
      },
      endCaptures: { 3: { name: "punctuation.definition.markdown" } },
      patterns: [
        {
          begin: "(^|\\G)(\\s*)(.*)",
          while: "(^|\\G)(?!\\s*([`~]{3,})\\s*$)",
          contentName: "meta.embedded.block.mermaid",
          patterns: [{ include: "source.mermaid" }],
        },
      ],
    },
  ],
}

/**
 * Languages shared by the documentation site's highlighter and its tests.
 * Mermaid code blocks (`mmd` and `mermaid`) use the grammar of
 * @mmd-toolkit/textmate-grammar, written for every diagram type from the
 * specification of this repository, which embeds yaml for frontmatter. Do not
 * list `mermaid` by name: Shiki's bundled grammar of that name would replace
 * it.
 */
export const languages = [mermaid, "yaml", mermaidInMarkdown]

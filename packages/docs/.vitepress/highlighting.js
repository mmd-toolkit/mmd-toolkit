import mermaid from "@mmd-toolkit/textmate-grammar"
import bundledMarkdown from "shiki/langs/markdown.mjs"

/**
 * The rule of the Markdown grammar for `mermaid` and `mmd` code blocks, which
 * Shiki's grammar lacks. It has the form of that grammar's other code block
 * rules: without the `while` of the inner rule, the rules of the Mermaid grammar
 * would run past the closing fence.
 */
const mermaidCodeBlock = {
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
}

const [markdownGrammar] = bundledMarkdown

/**
 * Shiki's Markdown grammar with that rule first among its code block rules.
 * Injecting the rule does not last: Shiki reloads the Markdown grammar when a
 * language that it embeds is loaded, and the reload drops the injection.
 */
const markdown = {
  ...markdownGrammar,
  repository: {
    ...markdownGrammar.repository,
    // eslint-disable-next-line camelcase -- a rule name of the Markdown grammar
    fenced_code_block: {
      patterns: [
        mermaidCodeBlock,
        ...markdownGrammar.repository.fenced_code_block.patterns,
      ],
    },
  },
}

/**
 * Languages shared by the documentation site's highlighter and its tests.
 * Mermaid code blocks (`mmd` and `mermaid`) use the grammar of
 * @mmd-toolkit/textmate-grammar, written for every diagram type from the
 * specification of this repository, which embeds yaml for frontmatter. Do not
 * list `mermaid` by name: Shiki's bundled grammar of that name would replace
 * it.
 */
export const languages = [mermaid, "yaml", markdown]

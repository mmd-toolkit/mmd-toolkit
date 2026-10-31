import mermaid from "@mmd-toolkit/textmate-grammar"

/**
 * Languages shared by the documentation site's highlighter and its tests.
 * Mermaid code blocks (`mmd` and `mermaid`) use the grammar of
 * @mmd-toolkit/textmate-grammar, written for every diagram type from the
 * specification of this repository, which embeds yaml for frontmatter. Do not
 * list `mermaid` by name: Shiki's bundled grammar of that name would replace
 * it.
 */
export const languages = [mermaid, "yaml"]

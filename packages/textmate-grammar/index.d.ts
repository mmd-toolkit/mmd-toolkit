import type { LanguageRegistration } from "@shikijs/types"

/**
 * The Mermaid grammar for Shiki, written from the specification of this
 * repository for every diagram type. It embeds the `yaml` grammar
 * (frontmatter), which a highlighter loads with it.
 */
declare const mermaid: LanguageRegistration

export default mermaid

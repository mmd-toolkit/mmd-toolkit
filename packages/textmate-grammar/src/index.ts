import type { LanguageRegistration } from "@shikijs/types"
import { createGrammar } from "./grammar.ts"
import { createShikiLanguage } from "./shiki-language.ts"

/**
 * The Mermaid grammar for Shiki, written from the specification of this
 * repository for every diagram type. It embeds the `yaml` grammar
 * (frontmatter), which a highlighter loads with it.
 */
const mermaid: LanguageRegistration = createShikiLanguage(createGrammar())

export default mermaid

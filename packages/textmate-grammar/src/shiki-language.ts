import type { LanguageRegistration } from "@shikijs/types"
import type { TextMateGrammar } from "./grammar.ts"

/** Adds Shiki's language metadata to a TextMate grammar. */
export function createShikiLanguage(
  grammar: TextMateGrammar,
): LanguageRegistration {
  return {
    ...grammar,
    name: "mermaid",
    displayName: "Mermaid",
    aliases: ["mmd"],
    // The frontmatter rule includes `source.yaml`, which Shiki must load too.
    embeddedLangs: ["yaml"],
  }
}

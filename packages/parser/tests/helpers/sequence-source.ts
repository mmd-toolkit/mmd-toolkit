import type { Root } from "../../src/index.ts"
import type { DiagramTextReader } from "../../src/diagram-text.ts"
import { lexSequence } from "../../src/diagrams/sequence/index.ts"
import type { Unit } from "../../src/diagrams/sequence/units.ts"
import { openSource } from "../../src/parse.ts"
import type { SourceLexer } from "../../src/source-lexer.ts"

/**
 * Test helper, not public API: the source of a sequence diagram as the
 * parser reads it, with the shared lexer and the units of
 * diagrams/sequence.md, Lexical structure. The helpers that read the source
 * again take every lexical decision from here.
 */
export class SequenceSource {
  public readonly lexer: SourceLexer

  /** The diagram text, which the units were read from. */
  public readonly diagramText: DiagramTextReader

  /** The units of the diagram text, in source order. */
  public readonly units: readonly Unit[]

  public constructor(text: string, root: Root) {
    const { lexer, frontmatter } = openSource(text)
    this.lexer = lexer
    const { text: diagramText, units } = lexSequence({
      lexer,
      frontmatter,
      diagramType: root.diagramType,
    })
    this.diagramText = diagramText
    this.units = units
  }
}

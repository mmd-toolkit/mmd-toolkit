import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { PacketDiagram } from "../../ast/packet.ts"
import { checkPacketBlocks } from "./acceptance.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { PacketGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { PacketUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface PacketUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** diagrams/packet.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexPacket(input: DiagramInput): PacketUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  return { text, ...new PacketUnitLexer(reader, input.lexer.lines).lex() }
}

/** Packet grammar, followed by shared token-boundary checks and root construction. */
export function readPacketDiagram(
  input: DiagramInput,
): Root & { readonly body: PacketDiagram } {
  const comments = input.passed.flatMap<DiagramComment>((part) =>
    part.kind === "bare-percent-line"
      ? [
          {
            range: [part.start, part.end],
            mark: "%%" as const,
            valueStart: part.valueStart,
          },
        ]
      : [],
  )
  const lexing = lexPacket(input)
  const syntax = new PacketGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => ({
      type: "PacketDiagram",
      textBeforeHeader: syntax.textBeforeHeader,
      body: syntax.body,
      ...place,
    }),
  ) as Root & { readonly body: PacketDiagram }
}

/** Semantic acceptance uses the default row width; parse() takes no configuration. */
export function parsePacketDiagram(input: DiagramInput): Root {
  const root = readPacketDiagram(input)
  checkPacketBlocks(root.body)
  return root
}

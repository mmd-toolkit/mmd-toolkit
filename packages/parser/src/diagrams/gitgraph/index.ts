import type { GitgraphDiagram } from "../../ast/gitgraph.ts"
import { checkGitgraphHistory } from "./history.ts"
import type { GitgraphDecodedValues } from "./history.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
  DiagramTextReader,
} from "../../diagram-text.ts"
import type { PassedPart } from "../../detection.ts"
import { GitgraphGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { GitgraphUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface GitgraphUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** common.md, Diagram detection: passed bare lines and accompanying trivia are not diagram text again. */
class GitgraphText implements DiagramText {
  private readonly reader: DiagramTextReader

  private readonly bareLines: readonly Extract<
    PassedPart,
    { kind: "bare-percent-line" }
  >[]

  public constructor(reader: DiagramTextReader, passed: readonly PassedPart[]) {
    this.reader = reader
    this.bareLines = passed.filter((part) => part.kind === "bare-percent-line")
  }

  public first(): DiagramCharacter {
    return this.reader.first()
  }

  public after(character: DiagramCharacter): DiagramPosition {
    let next = this.reader.after(character)
    for (const part of this.bareLines) {
      while (
        next !== null &&
        next.start >= part.start &&
        next.start < part.next
      )
        next = this.reader.after(next)
    }
    return next
  }
}

/** diagrams/gitgraph.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexGitgraph(input: DiagramInput): GitgraphUnits {
  const text = openDiagramText(input)
  const reader = new GitgraphText(text, input.passed)
  return { text, ...new GitgraphUnitLexer(reader, input.lexer.lines).lex() }
}

/** The source tree and its lexically retained comparison values; not public API. */
export interface GitgraphAnalysis {
  readonly root: Root & { readonly body: GitgraphDiagram }
  readonly decodedValues: GitgraphDecodedValues
}

/** Grammar and common token checks, shared with external-configuration acceptance checks. */
export function readGitgraphDiagram(input: DiagramInput): GitgraphAnalysis {
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
  const lexing = lexGitgraph(input)
  const syntax = new GitgraphGrammar(lexing, input.lexer).parseDiagram()
  const root = finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => ({
      type: "GitgraphDiagram",
      direction: syntax.direction,
      textBeforeHeader: syntax.textBeforeHeader,
      textBeforeDirection: syntax.textBeforeDirection,
      textBeforeColon: syntax.textBeforeColon,
      body: syntax.body,
      ...place,
    }),
  )
  return {
    root: root as Root & { readonly body: GitgraphDiagram },
    decodedValues: syntax.decodedValues,
  }
}

/** Semantic acceptance uses the defaults named in the specification; parse() takes no configuration. */
export function parseGitgraphDiagram(input: DiagramInput): Root {
  const { root, decodedValues } = readGitgraphDiagram(input)
  checkGitgraphHistory(root.body, decodedValues)
  return root
}

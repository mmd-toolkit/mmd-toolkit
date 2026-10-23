import type { IshikawaLiteral, IshikawaNode } from "../../ast/ishikawa.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { IshikawaLexing, Unit, UnitName } from "./units.ts"

/** The root and pending tokens made by the grammar. */
export interface IshikawaSyntax {
  readonly root: IshikawaNode | null
  readonly tokens: readonly PendingToken[]
}

/** A node line before its descendants and final range are known. */
interface NodeLine {
  readonly indent: number
  readonly text: IshikawaLiteral
  readonly unit: Unit
  readonly children: NodeLine[]
}

/** diagrams/ishikawa.md, Grammar: recursive descent over the single-context units. */
export class IshikawaGrammar extends UnitGrammar<UnitName, Unit> {
  private readonly nodeLines: NodeLine[] = []

  /** Preceding causes with increasing indentation; the root never participates. */
  private readonly openCauses: NodeLine[] = []

  public constructor(lexing: IshikawaLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** `diagram = header node? (newline node?)*`, with blank lines ignored. */
  public parseDiagram(): IshikawaSyntax {
    this.addItem("Keyword", [this.take("header")])
    this.parseOptionalNode()
    while (this.peek() !== null) {
      this.take("newline")
      this.parseOptionalNode()
    }
    return { root: this.makeTree(), tokens: this.tokensInOrder() }
  }

  /** There are no Ishikawa empty forms; common recording checks keyword cuts. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** Blank lines: indentation without text makes no node and changes no parent. */
  private parseOptionalNode(): void {
    const indentation = this.takeIf("indentation")
    if (this.peek() === null || this.peek()?.name === "newline") return
    this.parseNode(indentation?.text.length ?? 0)
  }

  /** `node = indentation? node-text`; quotes and numeric-looking prose remain literal. */
  private parseNode(indent: number): void {
    const unit = this.take("node-text")
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    const text: IshikawaLiteral = {
      type: "IshikawaLiteral",
      value: this.textOf(place.range),
      ...place,
    }
    const line: NodeLine = { indent, text, unit, children: [] }
    this.placeLine(line)
    this.nodeLines.push(line)
  }

  /** Indentation and parents: first-cause threshold, otherwise nearest smaller preceding cause. */
  private placeLine(line: NodeLine): void {
    const root = this.nodeLines[0]
    if (root === undefined) return
    while ((this.openCauses.at(-1)?.indent ?? -1) >= line.indent)
      this.openCauses.pop()
    const firstCause = this.nodeLines[1]
    const parent =
      firstCause === undefined || line.indent <= firstCause.indent
        ? root
        : this.openCauses.at(-1)
    if (parent === undefined)
      throw new Error("mmd-toolkit parser bug: a cause has no parent")
    parent.children.push(line)
    this.openCauses.push(line)
  }

  /** ast/ishikawa.md: build children before parents, retaining text through the last descendant. */
  private makeTree(): IshikawaNode | null {
    const made = new Map<NodeLine, IshikawaNode>()
    for (let index = this.nodeLines.length - 1; index >= 0; index -= 1) {
      const line = this.nodeLines[index]
      const children = line.children.map((child) => {
        const node = made.get(child)
        if (node === undefined)
          throw new Error(
            "mmd-toolkit parser bug: a child was not built before its parent",
          )
        return node
      })
      const range = this.placeOf([line.unit]).range
      range[1] = children.at(-1)?.range[1] ?? range[1]
      made.set(line, {
        type: "IshikawaNode",
        indent: line.indent,
        text: line.text,
        children,
        range,
        loc: this.lines.location(range),
      })
    }
    return made.get(this.nodeLines[0]) ?? null
  }
}

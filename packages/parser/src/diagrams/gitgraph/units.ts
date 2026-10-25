import { isWordCharacter } from "../../character-classes.ts"
import { FULL_STOP, HYPHEN_MINUS, SOLIDUS } from "../../code-points.ts"
import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter, DiagramPosition } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { matchWord } from "../../scanning.ts"

/** diagrams/gitgraph.md, Ordered rules: composite matches have separate components. */
type GitgraphUnitName =
  | "cherry-pick"
  | "gitGraph:"
  | "HIGHLIGHT"
  | "gitGraph"
  | "checkout"
  | "REVERSE"
  | "parent"
  | "commit"
  | "NORMAL"
  | "branch"
  | "order"
  | "switch"
  | "type"
  | "merge"
  | "msg"
  | "tag"
  | "id"
  | "LR"
  | "TB"
  | "BT"
  | "unsigned-integer"
  | "string"
  | "bare-reference"

/** Diagram-specific units and the shared common-form components. */
export type UnitName = GitgraphUnitName | CommonFormUnitName

/** Keywords in their first-match priority order. */
const KEYWORDS = [
  "cherry-pick",
  "gitGraph:",
  "HIGHLIGHT",
  "gitGraph",
  "checkout",
  "REVERSE",
  "parent:",
  "commit",
  "NORMAL",
  "branch",
  "order:",
  "switch",
  "type:",
  "merge",
  "msg:",
  "tag:",
  "id:",
  "LR",
  "TB",
  "BT",
  ":",
] as const

/** One lexical component; the converted text is never an AST value. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/gitgraph.md, Lexical structure: take the first complete match, never the longest alternative. */
export class GitgraphUnitLexer extends CommonFormUnitLexer<GitgraphUnitName> {
  /** Ordered rules 1-12: take the first complete match and restart. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readKeywords(at) ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readInteger(at, "unsigned-integer") ||
      this.readString(at, "string") ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at) ||
      this.readReference(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Keywords and components: only gitGraph has a whitespace/EOF/percent boundary. */
  private readKeywords(at: DiagramCharacter): boolean {
    for (const word of KEYWORDS) {
      const match =
        word === "gitGraph"
          ? this.matchKeyword(at, word)
          : matchWord(this.reader, at, word)
      if (match === null) continue
      if (!word.endsWith(":")) {
        const reference = this.referenceEnd(at)
        if (
          reference !== undefined &&
          match.end !== null &&
          (reference === null || reference.start > match.end.start)
        ) {
          this.read("bare-reference", at, reference)
          return true
        }
      }
      if (word.endsWith(":") && word !== ":") {
        const name = word.slice(0, -1)
        const keyword = matchWord(this.reader, at, name)!
        this.addUnit(
          word === "gitGraph:" ? "gitGraph:" : (name as UnitName),
          at,
          keyword.end,
        )
        this.read(":", keyword.end!, match.end)
      } else this.read(word as UnitName, at, match.end)
      return true
    }
    return false
  }

  /** A complete bare reference starts with a word character and ends with a word character or dash. */
  private referenceEnd(at: DiagramCharacter): DiagramPosition | undefined {
    if (!isWordCharacter(at.codePoint)) return undefined
    let end = this.reader.after(at)
    let chosen = end
    while (
      end !== null &&
      (isWordCharacter(end.codePoint) ||
        end.codePoint === HYPHEN_MINUS ||
        end.codePoint === SOLIDUS ||
        end.codePoint === FULL_STOP)
    ) {
      const current = end
      end = this.reader.after(current)
      if (
        isWordCharacter(current.codePoint) ||
        current.codePoint === HYPHEN_MINUS
      )
        chosen = end
    }
    return chosen
  }

  /** Final ordered rule: the longest complete bare-reference match. */
  private readReference(at: DiagramCharacter): boolean {
    const end = this.referenceEnd(at)
    if (end === undefined) return false
    this.read("bare-reference", at, end)
    return true
  }
}

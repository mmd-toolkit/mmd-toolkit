import type {
  Node,
  QuadrantAccDescrStatement,
  QuadrantAccTitleStatement,
  QuadrantAxisStatement,
  QuadrantClassDefStatement,
  QuadrantPointStatement,
  QuadrantStatement,
} from "@mmd-toolkit/ast"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keepFirstGapLineTails,
  keptAsWritten,
  layoutDescriptionBlock,
  spansLinesThatCannotJoin,
} from "./layout.ts"
import {
  findSemicolonLines,
  holdsJoiningRegion,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTriviaBetween,
  findTokensBetween,
  isStructural,
  isWhitespace,
} from "./source.ts"

/**
 * The node types of a quadrant chart whose text is a value, printed as
 * written: a title, a text of an accessibility statement, a coordinate, and a
 * style (QuadrantLiteral), with ordinary style-colon padding normalized below;
 * the text of an axis or of a quadrant and the name
 * of a point (QuadrantLabel), whose whitespace is in the Db; the name of a
 * class of `classDef` (QuadrantIdentifier); and the class name of a point
 * (Identifier). They have no child fields; `tests/value-nodes.test.ts` checks
 * that every other such node type is left out on purpose.
 */
export const quadrantValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "QuadrantLiteral",
  "QuadrantLabel",
  "QuadrantIdentifier",
  "Identifier",
])

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace (diagrams/quadrant.md, Lexical
 *   structure, Line breaks). Point and accessibility line trivia keeps its
 *   breaks with ordinary continuation columns; semicolon lines, joining
 *   regions and other statements retain their layout (docs/quadrant.md,
 *   Multi-line statements).
 * - The rules of the gaps are those of docs/quadrant.md: Keywords and texts,
 *   Axes, Points, Styles, and Titles and accessibility statements.
 */
export function layoutQuadrantStatement(
  source: Source,
  statement: QuadrantStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "QuadrantAccDescrBlockStatement") {
    return layoutDescriptionBlock(
      source,
      statement,
      end,
      quadrantValueNodeTypes,
    )
  }
  const keepsLineBreaks = spansLinesThatCannotJoin(source, start, end)
  const formatsTriviaLines =
    statement.type === "QuadrantPointStatement" ||
    statement.type === "QuadrantAccTitleStatement" ||
    statement.type === "QuadrantAccDescrStatement"
  // Trivia prevents joining, but ordinary structural gaps still use atoms.
  // Value columns, semicolon lines and removed-line regions stay written.
  if (
    keepsLineBreaks &&
    (!formatsTriviaLines ||
      holdsJoiningRegion(source, start, end) ||
      spansLinesThatCannotJoin(source, start, end, { ignoresTrivia: true }))
  ) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, quadrantValueNodeTypes),
    [],
  )
  const styleStarts = new Set(
    statement.type === "QuadrantPointStatement" ||
      statement.type === "QuadrantClassDefStatement"
      ? statement.styles.map((style) => style.range[0])
      : [],
  )
  const styledAtoms = atoms.map((atom) =>
    styleStarts.has(atom.start) ? formatStyleAtom(source, atom) : atom,
  )
  return {
    atoms: keepsLineBreaks
      ? keepFirstGapLineTails(source, styledAtoms)
      : styledAtoms,
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks: keepsLineBreaks ? "kept" : "joined",
  }
}

/**
 * Ordinary style name/colon/value boundaries have one form. Keep the source
 * range and value bytes; trivia, line rules and suffix forms stay opaque
 * (docs/quadrant.md, Styles).
 */
function formatStyleAtom(source: Source, atom: Atom): Atom {
  const text = source.text.slice(atom.start, atom.end)
  const colon = text.indexOf(":")
  if (
    colon < 0 ||
    text.includes(":", colon + 1) ||
    text.includes(";") ||
    findTriviaBetween(source, atom.start, atom.end).length > 0 ||
    holdsJoiningRegion(source, atom.start, atom.end) ||
    findSemicolonLines(source).has(lineStartOf(source, atom.start)) ||
    [...text].some(
      (character) =>
        character !== " " && character !== "\t" && isWhitespace(character),
    )
  )
    return atom
  let nameEnd = colon
  while (text[nameEnd - 1] === " " || text[nameEnd - 1] === "\t") nameEnd--
  let valueStart = colon + 1
  while (text[valueStart] === " " || text[valueStart] === "\t") valueStart++
  return {
    ...atom,
    doc: [text.slice(0, nameEnd), ": ", text.slice(valueStart)],
  }
}

/** The gap rules of a statement, by the start of the atom after the gap. */
function statementRules(
  source: Source,
  statement: Exclude<
    QuadrantStatement,
    { type: "QuadrantAccDescrBlockStatement" }
  >,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  switch (statement.type) {
    case "QuadrantTitleStatement":
      // The keyword and its text stand apart by one space, also where they
      // touched (docs/quadrant.md, Keywords and texts).
      if (statement.value !== null) {
        rules.set(statement.value.range[0], "space")
      }
      break
    case "QuadrantQuadrantStatement":
      rules.set(statement.text.range[0], "space")
      break
    case "QuadrantAxisStatement":
      addAxisRules(source, statement, rules)
      break
    case "QuadrantPointStatement":
      addPointRules(source, statement, rules)
      break
    case "QuadrantClassDefStatement":
      addClassDefRules(source, statement, rules)
      break
    case "QuadrantAccTitleStatement":
    case "QuadrantAccDescrStatement":
      addAccessibilityRules(source, statement, rules)
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return rules
}

/**
 * The rules of an axis statement: the text stands after the keyword, the
 * arrow after the text, and the text after the arrow, each after one space
 * (docs/quadrant.md, Keywords and texts and Axes).
 */
function addAxisRules(
  source: Source,
  statement: QuadrantAxisStatement,
  rules: Map<number, GapRule>,
): void {
  rules.set(statement.start.range[0], "space")
  if (!statement.arrow) return
  const arrow = expectToken(
    findStructuralToken(source, statement.start.range[1]),
    "the arrow of an axis",
  )
  rules.set(arrow.range[0], "space")
  if (statement.end !== null) rules.set(statement.end.range[0], "space")
}

/**
 * The rules of a point: the `:::`, the class name, and the `:` touch what is
 * before them, the `[` stands after one space, the coordinates and the `]`
 * touch the `[` and the second coordinate, and the second coordinate stands
 * after one space (docs/quadrant.md, Points).
 */
function addPointRules(
  source: Source,
  statement: QuadrantPointStatement,
  rules: Map<number, GapRule>,
): void {
  const { name, className, x, y } = statement
  if (className !== null) {
    const classMark = expectToken(
      findStructuralToken(source, name.range[1]),
      "the `:::` of a point",
    )
    expectValue(classMark, ":::")
    rules.set(classMark.range[0], "none")
    rules.set(className.range[0], "none")
  }
  const colon = expectToken(
    findStructuralToken(source, (className ?? name).range[1]),
    "the `:` of a point",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  const bracket = expectToken(
    findStructuralToken(source, colon.range[1]),
    "the `[` of a point",
  )
  expectValue(bracket, "[")
  rules.set(bracket.range[0], "space")
  rules.set(x.range[0], "none")
  const comma = expectToken(
    findStructuralToken(source, x.range[1]),
    "the `,` of a point",
  )
  expectValue(comma, ",")
  rules.set(comma.range[0], "none")
  rules.set(y.range[0], "space")
  const closing = expectToken(
    findStructuralToken(source, y.range[1]),
    "the `]` of a point",
  )
  expectValue(closing, "]")
  rules.set(closing.range[0], "none")
  addStyleRules(source, statement.styles, closing.range[1], rules)
}

/**
 * The rules of a `classDef` statement: the name stands after one space, and
 * the styles are laid out as those of a point, the first after one space,
 * which the grammar counts as one character each (docs/quadrant.md, Styles).
 */
function addClassDefRules(
  source: Source,
  statement: QuadrantClassDefStatement,
  rules: Map<number, GapRule>,
): void {
  rules.set(statement.name.range[0], "space")
  addStyleRules(source, statement.styles, statement.name.range[1], rules)
}

/**
 * The rules of the styles of a point after its `]` at `from`: the first
 * stands after one space, the `,` between two touches the style before it,
 * and the style after a `,` stands after one space.
 */
function addStyleRules(
  source: Source,
  styles: readonly Node[],
  from: number,
  rules: Map<number, GapRule>,
): void {
  const last = styles.at(-1)
  if (last === undefined) return
  for (const style of styles) rules.set(style.range[0], "space")
  for (const token of findTokensBetween(source, from, last.range[0])) {
    if (isStructural(source, token) && token.value === ",") {
      rules.set(token.range[0], "none")
    }
  }
}

/**
 * The rules of an `accTitle` or `accDescr` line: the `:` touches the keyword
 * and the text stands after one space.
 */
function addAccessibilityRules(
  source: Source,
  statement: QuadrantAccTitleStatement | QuadrantAccDescrStatement,
  rules: Map<number, GapRule>,
): void {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  rules.set(statement.value.range[0], "space")
}

/** Where the printed text of a statement ends: at its last token. */
export function findQuadrantPrintedEnd(statement: QuadrantStatement): number {
  return statement.range[1]
}

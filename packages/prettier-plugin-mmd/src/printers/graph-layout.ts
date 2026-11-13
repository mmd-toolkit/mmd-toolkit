import type {
  AgentflowClickCallbackStatement,
  AgentflowDiagram,
  AgentflowLabel,
  Node,
  Range,
  AgentflowLink,
  AgentflowShape,
  FlowchartClickCallbackStatement,
  FlowchartDiagram,
  FlowchartLabel,
  FlowchartLink,
  FlowchartShape,
  AgentflowStatement,
  FlowchartStatement,
  Token,
} from "@mmd-toolkit/ast"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keptAsWritten,
  layoutCompactEmptyDescriptionBlock,
  spansLinesThatCannotJoin,
  walk,
} from "./layout.ts"
import type { KeptLines } from "./kept-lines.ts"
import { holdsJoiningRegion, lineStartOf } from "./kept-lines.ts"
import {
  accessibilityRules,
  endOfJoinedStyle,
  hasBlankStrokeValue,
} from "./statement-rules.ts"
import { findWrittenWhitespaceEnd } from "./gap.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokenStartingAt,
  findTokenEndingBefore,
  findTriviaBetween,
  isWhitespace,
  skipBlanksAndRemoved,
  textRead,
} from "./source.ts"

type GraphLabel = AgentflowLabel | FlowchartLabel
type GraphLink = AgentflowLink | FlowchartLink
type GraphShape = AgentflowShape | FlowchartShape
type GraphCallbackStatement =
  AgentflowClickCallbackStatement | FlowchartClickCallbackStatement

/** Adds the rules of a shape. */
export function addShapeRules(
  source: Source,
  shape: GraphShape,
  rules: Map<number, GapRule>,
): void {
  const closing = expectToken(
    findStructuralToken(source, shape.label.range[1]),
    "the closing bracket of a shape",
  )
  if (shape.label.kind !== "text") {
    // The closing bracket touches the closing quote: mermaid.js reads the
    // whitespace after the quote as nothing (docs/flowchart.md, Label inner
    // whitespace).
    rules.set(closing.range[0], "none")
    return
  }
  const edge = labelEdgeRule(source, shape.label)
  rules.set(shape.label.range[0], edge)
  rules.set(closing.range[0], takesTextBefore(closing) ? "none" : edge)
}

/**
 * Adds the rules of the title of a heading, `subgraph S[ T ]` or
 * `flow F[ T ]`: the whitespace inside its brackets is dropped as for the
 * label of a shape, except where the label would be read otherwise (see
 * `labelEdgeRule`); a title in quotes has none before the quote and none
 * after it (docs/flowchart.md, Subgraph header).
 */
export function addHeadingTitleRules(
  source: Source,
  title: GraphLabel,
  rules: Map<number, GapRule>,
): void {
  const closing = expectToken(
    findStructuralToken(source, title.range[1]),
    "the `]` after the title of a heading",
  )
  const edge = title.kind === "text" ? labelEdgeRule(source, title) : "none"
  rules.set(title.range[0], edge)
  rules.set(closing.range[0], edge)
}

/** Adds the rules of a link. */
export function addLinkRules(
  source: Source,
  link: GraphLink,
  rules: Map<number, GapRule>,
): void {
  rules.set(link.range[0], "space")
  rules.set(link.target.range[0], "space")
  if (link.id !== null) {
    const at = expectToken(
      findStructuralToken(source, link.id.range[1]),
      "the `@` of an edge id",
    )
    expectValue(at, "@")
    rules.set(at.range[0], "none")
    rules.set((link.opening ?? link.arrow).range[0], "none")
    if (startsLikeArrow(link.id.name, link.type))
      rules.set(link.range[0], "none")
  }
  if (link.opening !== null) {
    const label = link.label as NonNullable<GraphLink["label"]>
    rules.set(label.range[0], "space")
    rules.set(link.arrow.range[0], "space")
    return
  }
  if (link.label === null) return
  const opening = expectToken(
    findStructuralToken(source, link.arrow.range[1]),
    "the first `|` of a link label",
  )
  expectValue(opening, "|")
  rules.set(opening.range[0], "none")
  const closing = expectToken(
    findStructuralToken(source, link.label.range[1]),
    "the second `|` of a link label",
  )
  expectValue(closing, "|")
  if (link.label.kind !== "text") {
    // The closing `|` touches the closing quote, as the closing bracket of a
    // shape does (docs/flowchart.md, Label inner whitespace).
    rules.set(closing.range[0], "none")
    return
  }
  const edge = labelEdgeRule(source, link.label)
  rules.set(link.label.range[0], edge)
  rules.set(closing.range[0], edge)
}

/**
 * Adds the rule that the edge id of a link touches the data block before it:
 * `A@{ shape: circle }e1@--> B`, not `A@{ shape: circle } e1@--> B`
 * (docs/flowchart.md, Arrow spacing; docs/agentflow.md, Arrows). The pinned
 * mermaid.js reads both forms the same in a flowchart, but some versions that
 * count have no rule for a space after a data block before an edge id
 * (docs/compatibility.md, Forms kept for versions of mermaid.js that count),
 * and the agentflow diagram rejects it in every version. A directive or an ignored
 * `;` between them is removed before the text is read, so the edge id touches
 * it too. Call it after the rules of the links are set.
 */
export function addEdgeIdAfterDataBlockRules(
  source: Source,
  statement: Node,
  rules: Map<number, GapRule>,
): void {
  const dataBlockEnds = new Set<number>()
  walk(statement, (node) => {
    if (
      node.type === "FlowchartDataBlock" ||
      node.type === "AgentflowDataBlock"
    )
      dataBlockEnds.add(node.range[1])
  })
  if (dataBlockEnds.size === 0) return
  walk(statement, (node) => {
    if (node.type !== "FlowchartLink" && node.type !== "AgentflowLink") return
    if (node.id === null) return
    const before = findStructuralTokenEndingBefore(source, node.range[0])
    if (before !== undefined && dataBlockEnds.has(before.range[1]))
      rules.set(node.range[0], "none")
  })
}

/**
 * Whether an edge id starts as an arrow does (diagrams/flowchart.md, Arrows
 * and the lexical rule of the edge id; diagrams/agentflow.md, Arrows). Such an
 * id is an edge id only where no whitespace stands before it, as in
 * `A[x]--a@-->B`; after whitespace, the lexer reads the arrow and `a@` is its
 * text, or the input is rejected. So no whitespace is put before it.
 *
 * In flowchart these are `--a`, `==a`, `-.a`, `.-a`, with or without the head
 * `x`, `o`, or `<`, and `~~~a`, which takes no head. In agentflow they are
 * `--a` (also `---a` and `-->a`), `-.-a`, and `-..-a`, without a head: an id
 * such as `x--a`, `==a`, `-.a`, or `.-a` is read the same after whitespace.
 */
function startsLikeArrow(id: string, type: GraphLink["type"]): boolean {
  if (type === "AgentflowLink") {
    return id.startsWith("--") || startsWithDashedDots(id)
  }
  return (
    id.startsWith("~~~") ||
    startsWithArrowBody(id) ||
    (["x", "o", "<"].includes(id.charAt(0)) && startsWithArrowBody(id.slice(1)))
  )
}

/** Whether `text` starts with `-`, one or more dots, and `-`: `-.-`, `-..-`. */
function startsWithDashedDots(text: string): boolean {
  let dots = 0
  while (text.charAt(dots + 1) === ".") dots++
  return text.startsWith("-") && dots > 0 && text.charAt(dots + 1) === "-"
}

/** Whether `text` starts with `--`, `==`, `-.`, or dots and then `-`. */
function startsWithArrowBody(text: string): boolean {
  if (["--", "==", "-."].some((start) => text.startsWith(start))) return true
  let dots = 0
  while (text.charAt(dots) === ".") dots++
  return dots > 0 && text.charAt(dots) === "-"
}

/**
 * Whether a closing bracket of a slanted shape starts with a character that
 * a text run would take after whitespace: `?]` and `=]` (diagrams/flowchart.md,
 * the slanted context). `A[/a/?]` is a trapezoid-bottom with the label `a/`, but in
 * `A[/a/ ?]` the text run ` ?` takes the `?`, and the input is rejected. So
 * no space is put before such a bracket.
 */
function takesTextBefore(closing: Token): boolean {
  return closing.value.startsWith("?") || closing.value.startsWith("=")
}

/**
 * The rule for the whitespace on both sides of a label without quotes
 * (docs/flowchart.md, Label inner whitespace): none, as mermaid.js drops
 * that whitespace, except where the
 * whitespace before the label is kept (see `keepsLeadingWhitespace`). Then
 * one space stands on each side, so that the label looks as meant:
 * `A[ /x/]` becomes `A[ /x/ ]`. A space after a label does not change it.
 * The whitespace before the label is looked for from the bracket, past the
 * directives between them: in `A[ %%{init: {}}%%/x/]`, the label starts
 * after the directive token.
 */
export function labelEdgeRule(source: Source, label: GraphLabel): GapRule {
  const before = expectToken(
    findStructuralTokenEndingBefore(source, label.range[0]),
    "the bracket before a label",
  )
  const hasWhitespaceBefore = [
    ...textRead(source, before.range[1], label.range[0]),
  ].some(isWhitespace)
  return hasWhitespaceBefore && keepsLeadingWhitespace(label) ? "space" : "none"
}

/**
 * Whether the whitespace before a label without quotes is kept, as one
 * space, rather than removed (docs/flowchart.md, Label inner whitespace).
 * mermaid.js drops that whitespace,
 * but without it the label's first characters are read with the bracket or
 * the `|` before it:
 *
 * - a label that starts with `/`, `\`, `-`, or `"`: `A[ /x/]` is a rectangle
 *   with the label `/x/`, `A[/x/]` a lean-right with the label `x`;
 *   `A( -x-)` is a rounded, `A(-x-)` an ellipse; `A[/ "x /]` has the
 *   label `"x`, and `A[/"x/]` is rejected.
 * - a label whose first word, up to whitespace or a `"`, holds a `@` that no
 *   `{` or `"` follows: after the `>` of a flowchart shape and in agentflow,
 *   `A>x@]` is rejected, because `A>x@` is read as an edge id, and `A> x@]`
 *   has the label `x@`.
 *   The pinned mermaid.js stops the run of an edge id at the other brackets
 *   and at `|`, so it reads `A[x@]` and `A-->|x@|B` as it reads them with the
 *   whitespace. Some versions that count do not stop it there and reject
 *   them, and the formatted text is drawn by those versions too
 *   (docs/compatibility.md, Whitespace at the start of a label).
 *
 * The rule is the same for every shape and for the text between `|`, so that
 * it does not depend on which brackets a label has. The label's value is its
 * text without directives, as mermaid.js reads it.
 */
function keepsLeadingWhitespace(label: GraphLabel): boolean {
  const first = label.value.charAt(0)
  if (first === "/" || first === "\\" || first === "-" || first === '"') {
    return true
  }
  // The lexers that read an edge id take a run of characters that are no
  // whitespace and no `"`, an `@`, and a character that is no `{` and no `"`.
  for (
    let index = 0;
    index < label.value.length &&
    !isWhitespace(label.value.charAt(index)) &&
    label.value.charAt(index) !== '"';
    index++
  ) {
    const next = label.value.charAt(index + 1)
    if (label.value.charAt(index) === "@" && next !== "{" && next !== '"') {
      return true
    }
  }
  return false
}

/**
 * Graph headers share the authored keyword/direction layout. The direction
 * stands after one space, also where a symbol such as `<` touched the keyword
 * (docs/flowchart.md, Direction).
 */
export function layoutGraphHeader(
  source: Source,
  diagram: AgentflowDiagram | FlowchartDiagram,
  end: number,
): AtomLayout {
  if (holdsJoiningRegion(source, diagram.range[0], end))
    return keptAsWritten(diagram.range[0], end)
  const rules = new Map<number, GapRule>()
  if (diagram.direction !== null) {
    const keyword = expectToken(
      findStructuralToken(source, diagram.range[0]),
      "the keyword of a header",
    )
    const direction = expectToken(
      findStructuralToken(source, keyword.range[1]),
      "the direction of a header",
    )
    expectValue(direction, diagram.direction)
    rules.set(direction.range[0], "space")
  }
  return {
    atoms: collectAtoms(source, diagram.range[0], end, [], []),
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The required null-style whitespace can extend past a statement's range, and
 * so can the whitespace that makes the value of the last `stroke` of a
 * `linkStyle` blank: mermaid.js draws no colour of an arrowhead from a
 * `stroke:` with a blank value and does not try the next one
 * (docs/flowchart.md, Style trailing whitespace).
 */
export function findStyleStatementEnd(
  source: Source,
  statement: Node & { readonly styles: readonly (Node | null)[] },
): number {
  const last = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the end of a style statement",
  )
  const written = findWrittenWhitespaceEnd(source, statement.range[1])
  if (statement.styles.at(-1) === null || last.value.endsWith(",")) {
    return written
  }
  if (!statement.type.endsWith("LinkStyleStatement")) return statement.range[1]
  // The whitespace after the last style of a `linkStyle` that mermaid.js reads
  // (see `normalizeStyleList`).
  const tail = skipBlanksAndRemoved(source, last.range[1], written)
  const styleStart = statement.styles.at(-1)?.range[0] ?? last.range[0]
  if (hasBlankStrokeValue(textRead(source, styleStart, tail))) {
    return written
  }
  return Math.max(statement.range[1], endOfJoinedStyle(source, last.range))
}

/** The end of a graph header's keyword and optional authored direction. */
export function findGraphHeaderEnd(
  source: Source,
  diagram: Node & { readonly direction: string | null },
): number {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  if (diagram.direction === null) return keyword.range[1]
  const direction = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the header direction",
  )
  expectValue(direction, diagram.direction)
  return direction.range[1]
}

/** The closing bracket of an explicit graph container heading title. */
export function findGraphTitleEnd(source: Source, title: GraphLabel): number {
  const closing = expectToken(
    findStructuralToken(source, title.range[1]),
    "the heading title closer",
  )
  expectValue(closing, "]")
  return closing.range[1]
}

/** The token that closes a graph container, at its recorded end. */
export function findGraphEndKeyword(source: Source, container: Node): Token {
  const token = expectToken(
    findTokenEndingBefore(source, container.range[1]),
    "the end of a graph container",
  )
  if (token.range[1] !== container.range[1])
    throw new Error("prettier-plugin-mmd: no token at the container end")
  return token
}

/**
 * Graph accessibility lines share the sibling diagrams' compact colon form.
 * Their Literal ranges already exclude exterior value whitespace. Keep the
 * graph line exceptions and trivia before choosing a joined layout, so neither
 * direction priority nor semicolon selection changes
 * (diagrams/flowchart.md, Direction and accessibility statements;
 * docs/flowchart.md, Accessibility lines; docs/agentflow.md, Accessibility).
 */
export function layoutGraphAccessibility(
  source: Source,
  statement: AgentflowStatement | FlowchartStatement,
  end: number,
  kept: KeptLines,
): AtomLayout | null {
  switch (statement.type) {
    case "AgentflowAccTitleStatement":
    case "AgentflowAccDescrStatement":
    case "FlowchartAccTitleStatement":
    case "FlowchartAccDescrStatement":
      return layoutGraphAccessibilityLine(source, statement, end, kept)
    case "AgentflowAccDescrBlockStatement":
    case "FlowchartAccDescrBlockStatement":
      return statement.value === null && statement.closed
        ? layoutGraphEmptyDescriptionBlock(
            source,
            statement.range[0],
            end,
            kept,
          )
        : null
    default:
      return null
  }
}

/** Compact colon spacing follows the shared dispatch and graph exceptions. */
function layoutGraphAccessibilityLine(
  source: Source,
  statement: { readonly range: Range; readonly value: Node | null },
  end: number,
  kept: KeptLines,
): AtomLayout | null {
  const start = statement.range[0]
  if (keepsGraphAccessibility(source, start, end, kept)) {
    // Trivia declines compact spacing without replacing the caller's previous
    // continuation layout. The approved raw semicolon/direction exceptions
    // still keep their written text (docs/flowchart.md, Accessibility lines).
    return findTriviaBetween(source, start, end).length > 0
      ? null
      : keptAsWritten(start, end)
  }
  const rules = accessibilityRules(source, statement)
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      statement.value === null ? [] : [statement.value],
      [],
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
    joinedBefore: new Set(rules.keys()),
  }
}

/**
 * A closed graph description with no text prints `{}`: there is no text for
 * an interior space to surround. Blocks with trivia retain their existing
 * comment/directive layout instead. Follow usecase's Db-equal form while
 * keeping the graph line exceptions (diagrams/flowchart.md, Accessibility values;
 * docs/flowchart.md, Accessibility lines; docs/agentflow.md, Accessibility).
 */
function layoutGraphEmptyDescriptionBlock(
  source: Source,
  start: number,
  end: number,
  kept: KeptLines,
): AtomLayout | null {
  if (keepsGraphAccessibility(source, start, end, kept)) return null
  return layoutCompactEmptyDescriptionBlock(source, start, end)
}

/** Existing graph line and trivia exceptions precede accessibility spacing. */
function keepsGraphAccessibility(
  source: Source,
  start: number,
  end: number,
  kept: KeptLines,
): boolean {
  const firstLine = lineStartOf(source, start)
  const lastLine = lineStartOf(source, end - 1)
  return (
    kept.joined.has(firstLine) ||
    kept.verbatim.has(firstLine) ||
    kept.verbatim.has(lastLine) ||
    holdsJoiningRegion(source, start, end) ||
    spansLinesThatCannotJoin(source, start, end) ||
    findTriviaBetween(source, start, end).length > 0
  )
}

/**
 * Whether a line feed of a click statement stands outside its values and
 * outside `stretches`: between its parts, or in a comment or a directive that
 * stands between them. A line feed inside a string, or inside the parentheses
 * of a call with arguments, is part of that value, which is printed as
 * written, and moves no line of the statement.
 */
export function breaksBetweenParts(
  source: Source,
  statement: Node,
  valueTypes: ReadonlySet<Node["type"]>,
  stretches: readonly Atom[],
): boolean {
  const values = collectValueNodes(statement, valueTypes)
  for (
    let offset = source.text.indexOf("\n", statement.range[0]);
    offset !== -1 && offset < statement.range[1];
    offset = source.text.indexOf("\n", offset + 1)
  ) {
    if (
      !values.some(
        (value) => value.range[0] <= offset && offset < value.range[1],
      ) &&
      !stretches.some(
        (stretch) => stretch.start <= offset && offset < stretch.end,
      )
    )
      return true
  }
  return false
}

/**
 * The parentheses after the name of `call`, if any: the `(` after the
 * callback and the `)` after its arguments.
 */
function findCallbackParentheses(
  source: Source,
  statement: GraphCallbackStatement,
): { readonly opening: Token; readonly closing: Token } | null {
  const opening = findStructuralToken(source, statement.callback.range[1])
  if (opening?.value !== "(" || opening.range[0] >= statement.range[1]) {
    return null
  }
  const closing = expectToken(
    findStructuralToken(
      source,
      statement.arguments?.range[1] ?? opening.range[1],
    ),
    "the `)` of callback arguments",
  )
  expectValue(closing, ")")
  return { opening, closing }
}

/**
 * The parentheses of a call with arguments, from the `(` to the `)`, or null
 * where there are none or they are blank.
 */
export function findCallArgumentsParentheses(
  source: Source,
  statement: GraphCallbackStatement,
): Range | null {
  const parentheses = findCallbackParentheses(source, statement)
  if (parentheses === null || statement.arguments === null) return null
  return [parentheses.opening.range[0], parentheses.closing.range[1]]
}

/**
 * Adds the rule of blank parentheses, `f( )`: the `)` touches the `(`, since
 * mermaid.js reads `f( )` and `f()` the same (docs/flowchart.md, Click
 * statements). Returns the parentheses where they are blank, null otherwise.
 */
export function addBlankCallbackRule(
  source: Source,
  statement: GraphCallbackStatement,
  rules: Map<number, GapRule>,
): { readonly opening: Token; readonly closing: Token } | null {
  const parentheses = findCallbackParentheses(source, statement)
  if (parentheses === null || statement.arguments !== null) return null
  rules.set(parentheses.closing.range[0], "none")
  return parentheses
}

import { appendItems } from "./collections.ts"
import type {
  AgentflowFlowStatement,
  AgentflowGlobalStatement,
  AgentflowConnectorStatement,
  AgentflowStatement,
  AgentflowName,
  Node,
} from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  addHeadingTitleRules,
  addLinkRules,
  addShapeRules,
  breaksBetweenParts,
  addBlankCallbackRule,
  layoutGraphAccessibility,
} from "./graph-layout.ts"
import { findAgentflowKeptLines } from "./agentflow-kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  descriptionOpeningRules,
  expectToken,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  formatDescriptionBlock,
  keptAsWritten,
  walk,
} from "./layout.ts"
import { readGapElement } from "./gap.ts"
import { holdsJoiningRegion, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  normalizeBlankLabels,
  normalizeCallArguments,
  normalizeStyleList,
} from "./statement-rules.ts"
import {
  findStructuralToken,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

/** Written leaf values; the leaf coverage test accounts for the other leaves. */
export const agentflowValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "AgentflowLabel",
  "AgentflowLiteral",
  "AgentflowDataBlock",
  "AgentflowIgnoredText",
])

/** Common atom construction; joins removed by preprocessing remain written. */
function layoutRange(
  source: Source,
  start: number,
  end: number,
  values: readonly Node[],
  kept: readonly Atom[],
  rules: ReadonlyMap<number, GapRule>,
): AtomLayout {
  if (holdsJoiningRegion(source, start, end)) return keptAsWritten(start, end)
  const atoms = collectAtoms(source, start, end, values, kept)
  normalizeBlankLabels(source, atoms, values)
  return {
    atoms,
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/** Flow/global headings share the closed-block path; connectors have no body. */
export function layoutContainerHeader(
  source: Source,
  node:
    | AgentflowFlowStatement
    | AgentflowGlobalStatement
    | AgentflowConnectorStatement,
  end: number,
): AtomLayout {
  if (node.type === "AgentflowGlobalStatement" || node.name === null) {
    return layoutRange(source, node.range[0], end, [], [], new Map())
  }
  const name = node.name
  let nameStart = name.range[0]
  let nameEnd = name.range[1]
  const rules = new Map<number, GapRule>()
  // Only an ordinary single-fragment heading shares flowchart's heading
  // rules. Erased click/empty forms and their context-exit gaps are Name text
  // (diagrams/agentflow.md, Names; docs/agentflow.md, Names and headings).
  if (name.parts.length === 1) {
    // The keyword takes one whitespace character, and the rest of the
    // whitespace after it is read with the name, which mermaid.js trims: the
    // name starts at its first character, past the directives and comments
    // before it, which stand in the gap with the whitespace around them
    // (docs/agentflow.md, Names and headings).
    while (nameStart < nameEnd) {
      const trivia = findTriviaBetween(source, nameStart, nameStart + 1).at(0)
      if (trivia !== undefined) nameStart = Math.min(trivia.range[1], nameEnd)
      else if (isWhitespace(source.text[nameStart])) nameStart++
      else break
    }
    // The data block of a heading without a title touches the name, whose
    // trailing whitespace mermaid.js trims, as the `[` of a title does; a name
    // that holds a directive or a comment is kept as written
    // (docs/agentflow.md, Names and headings).
    const touchesData =
      node.title === null &&
      node.data.length > 0 &&
      findTriviaBetween(source, name.range[0], name.range[1]).length === 0
    if (node.title !== null || touchesData) {
      while (nameEnd > nameStart && isWhitespace(source.text[nameEnd - 1]))
        nameEnd--
    }
    // A whitespace-only name still needs its written character.
    if (nameEnd === nameStart) {
      nameStart = name.range[0]
      nameEnd = name.range[1]
    }
    if (touchesData) rules.set(node.data[0].range[0], "none")
    if (node.title !== null) {
      // The `[` of the title touches the name, as in a flowchart, unless a
      // directive or comment ends the name: the whitespace after it is kept
      // as under Directives.
      const lastTrivia = findTriviaBetween(source, name.range[0], nameEnd).at(
        -1,
      )
      if (lastTrivia?.range[1] !== nameEnd) {
        rules.set(
          expectToken(
            findStructuralToken(source, name.range[1]),
            "the heading title opener",
          ).range[0],
          "none",
        )
      }
    }
  } else if (name.parts.length > 1) {
    // A click-context exit is outside the last Name fragment. Preserve its
    // exact character before a title/data suffix, including a physical LF;
    // it is not an ordinary title gap (diagrams/agentflow.md, Names, strings,
    // and click text; docs/agentflow.md, Names and headings).
    const suffixStart =
      node.title === null
        ? node.data[0]?.range[0]
        : expectToken(
            findStructuralToken(source, name.range[1]),
            "the heading title opener",
          ).range[0]
    nameEnd = suffixStart ?? findNamePrintedEnd(source, name)
  }
  if (node.title !== null) addHeadingTitleRules(source, node.title, rules)
  const nameAtom = { start: nameStart, end: nameEnd }
  const values: Node[] = [
    ...node.data,
    ...(node.title === null ? [] : [node.title]),
  ]
  const layout = layoutRange(
    source,
    node.range[0],
    end,
    values,
    [nameAtom],
    rules,
  )
  return {
    ...layout,
    atoms: layout.atoms.filter(
      (atom) =>
        atom === nameAtom ||
        atom.start < name.range[0] ||
        atom.start >= name.range[1],
    ),
  }
}

/**
 * The written click-context exit after a final fragment can lie outside the
 * Name range. Keep that unit before the separator, so a generated LF does not
 * become the context exit and consume the next body line. At EOF the ordinary
 * final LF already preserves a written LF exit (diagrams/agentflow.md, Names,
 * strings, and click text; docs/agentflow.md, Names and headings).
 */
export function findNamePrintedEnd(
  source: Source,
  name: AgentflowName,
): number {
  if (!endsWithClickFragment(source, name)) {
    const last = name.parts.at(-1)
    if (
      name.parts.length < 2 ||
      last?.type !== "AgentflowLabel" ||
      last.kind !== "text" ||
      last.value.trim() !== "" ||
      name.range[1] === source.text.length
    )
      return name.range[1]
    const next = readGapElement(source, name.range[1]).element
    const kept = findAgentflowKeptLines(source)
    const line = lineStartOf(source, name.range[1])
    // Before a removed separator, a whitespace-only final Label becomes
    // exterior line whitespace. Print the name as that output is read, so
    // the next format cannot remove another fragment (docs/agentflow.md,
    // Names and headings; diagrams/agentflow.md, Names, strings, and click text).
    if (
      next.kind === "separator" &&
      !kept.joined.has(line) &&
      !kept.verbatim.has(line)
    )
      return last.range[0]
    return name.range[1]
  }
  let position = name.range[1]
  while (position < source.text.length) {
    const { element, end } = readGapElement(source, position)
    if (element.kind === "item" && element.item.type !== "Comment")
      position = end
    else if (element.kind === "whitespace") return end
    else if (
      element.kind === "lineTerminator" &&
      source.text.slice(end).trim() !== ""
    )
      return end
    else return name.range[1]
  }
  return name.range[1]
}

/**
 * Name parts split at a click-context exit. A later Label is ordinary text;
 * retained empty forms contribute no text but leave a pending click context
 * active until its exit. A gap before text after an erased form has already
 * supplied that exit; the first gap after the click keyword instead starts
 * its id. Read the kinds the AST already recognizes
 * (diagrams/agentflow.md, Names, strings, and click text).
 */
function endsWithClickFragment(source: Source, name: AgentflowName): boolean {
  let click = false
  let lastWasClick = false
  let previous: AgentflowName["parts"][number] | undefined
  for (const part of name.parts) {
    if (part.type === "AgentflowLabel") {
      lastWasClick =
        click &&
        (previous?.type !== "AgentflowIgnoredText" ||
          previous.kind === "click" ||
          !hasExitBefore(source, previous.range[1], part.range[0]))
      click = false
    } else {
      if (part.kind === "click") click = true
      lastWasClick = click
    }
    previous = part
  }
  return lastWasClick
}

/** Whether a retained form and the following name text already have an exit. */
function hasExitBefore(source: Source, start: number, end: number): boolean {
  let position = start
  while (position < end) {
    const next = readGapElement(source, position)
    if (
      next.element.kind === "whitespace" ||
      next.element.kind === "lineTerminator"
    )
      return true
    position = next.end
  }
  return false
}

type SimpleStatement = Exclude<
  AgentflowStatement,
  AgentflowFlowStatement | AgentflowGlobalStatement
>

type ClassifiedStatement =
  | {
      readonly kind: "container"
      readonly statement: AgentflowFlowStatement | AgentflowGlobalStatement
    }
  | { readonly kind: "simple"; readonly statement: SimpleStatement }

/** Exhaustive statement kinds, so a future container cannot fall through as a leaf. */
export function classifyAgentflowStatement(
  statement: AgentflowStatement,
): ClassifiedStatement
export function classifyAgentflowStatement(
  statement: MermaidAst,
): ClassifiedStatement | null
export function classifyAgentflowStatement(
  statement: MermaidAst,
): ClassifiedStatement | null {
  switch (statement.type) {
    case "AgentflowFlowStatement":
    case "AgentflowGlobalStatement":
      return { kind: "container", statement }
    case "AgentflowEmptyStatement":
    case "AgentflowVertexStatement":
    case "AgentflowConnectorStatement":
    case "AgentflowStyleStatement":
    case "AgentflowClassDefStatement":
    case "AgentflowClassStatement":
    case "AgentflowLinkStyleStatement":
    case "AgentflowDefaultLinkStyleStatement":
    case "AgentflowClickCallbackStatement":
    case "AgentflowClickUrlStatement":
    case "AgentflowDirectionStatement":
    case "AgentflowAccTitleStatement":
    case "AgentflowAccDescrStatement":
    case "AgentflowAccDescrBlockStatement":
      return { kind: "simple", statement }
    default:
      statement satisfies Exclude<MermaidAst, AgentflowStatement>
      return null
  }
}

/**
 * Adds the stretches of a click statement that are printed as written: from
 * its first id to its end, except the whitespace between the parentheses of a
 * call with blank arguments, `f( )`, which is dropped (docs/agentflow.md,
 * Click statements).
 */
function addClickKeptStretches(
  source: Source,
  statement: Extract<
    AgentflowStatement,
    { type: "AgentflowClickUrlStatement" | "AgentflowClickCallbackStatement" }
  >,
  end: number,
  kept: Atom[],
  rules: Map<number, GapRule>,
): void {
  const idsStart = expectToken(
    findStructuralToken(
      source,
      expectToken(findStructuralToken(source, statement.range[0]), "click")
        .range[1],
    ),
    "click ids",
  ).range[0]
  const parentheses =
    statement.type === "AgentflowClickCallbackStatement"
      ? addBlankCallbackRule(source, statement, rules)
      : null
  if (parentheses === null) {
    kept.push({ start: idsStart, end })
    return
  }
  kept.push(
    { start: idsStart, end: parentheses.opening.range[1] },
    { start: parentheses.closing.range[0], end },
  )
}

/** Agentflow statements use flowchart's shared graph spacing and atom printer. */
export function layoutStatement(
  source: Source,
  statement: SimpleStatement,
  end: number,
  preservesDescriptionColumns: boolean,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "AgentflowConnectorStatement")
    return layoutContainerHeader(source, statement, end)
  const accessibility = layoutGraphAccessibility(
    source,
    statement,
    end,
    findAgentflowKeptLines(source),
  )
  if (accessibility !== null) return accessibility
  const rules = new Map<number, GapRule>()
  const kept: Atom[] = []
  switch (statement.type) {
    case "AgentflowClassStatement":
      return keptAsWritten(start, end)
    case "AgentflowStyleStatement":
    case "AgentflowClassDefStatement":
    case "AgentflowLinkStyleStatement":
    case "AgentflowDefaultLinkStyleStatement": {
      // Exactly one grammar unit precedes a value, and every further space is
      // value text. Preserve these gaps, even across directives, rather than
      // applying flowchart's first-style collapse (diagrams/agentflow.md,
      // Style, classDef, class, and linkStyle; docs/agentflow.md, Single space gaps).
      // The whitespace around the `:` and the `,` of the styles does not change
      // the figure, except before a style that starts with `fill` in a
      // `linkStyle` with link numbers, before a style that starts with
      // `stroke:` in a `linkStyle`, and between `stroke` and the `:` in the
      // styles that can reach a link (docs/agentflow.md, Single space gaps).
      const atoms: Atom[] = [{ start, end }]
      const isLinkStyle =
        statement.type === "AgentflowLinkStyleStatement" ||
        statement.type === "AgentflowDefaultLinkStyleStatement"
      normalizeStyleList(source, atoms, statement, {
        keepsSpaceBeforeFill: statement.type === "AgentflowLinkStyleStatement",
        keepsSpaceBeforeStroke: isLinkStyle,
        keepsGapAfterStroke: statement.type !== "AgentflowStyleStatement",
        keepsBlankStrokeValue: isLinkStyle,
        escapesComma: statement.type === "AgentflowClassDefStatement",
      })
      return { ...keptAsWritten(start, end), atoms }
    }
    case "AgentflowClickUrlStatement":
    case "AgentflowClickCallbackStatement":
      // Prefix nodes can straddle href or follow a second call. Their gaps and
      // later physical columns belong to the authored click spelling; extra
      // whitespace units can reject (diagrams/agentflow.md, Click, call, and href;
      // docs/agentflow.md, Click statements and Multiline statements and values).
      if (breaksBetweenParts(source, statement, agentflowValueNodeTypes, [])) {
        return keptAsWritten(start, end)
      }
      // Only the ordinary gap after the first click keyword is exterior to
      // its ids, values and retained prefixes, and the whitespace between the
      // parentheses of a call with blank arguments, which mermaid.js reads as
      // no arguments.
      addClickKeptStretches(source, statement, end, kept, rules)
      break
    case "AgentflowEmptyStatement":
      return keptAsWritten(start, end)
    case "AgentflowAccDescrBlockStatement":
      appendItems(kept, findAccDescrBlockStretches(source, statement))
      if (!statement.closed) return keptAsWritten(start, end)
      for (const [position, rule] of descriptionOpeningRules(source, start))
        rules.set(position, rule)
      break
    case "AgentflowVertexStatement": {
      const dataBlockEnds = new Set<number>()
      walk(statement, (node) => {
        if (node.type === "AgentflowDataBlock") dataBlockEnds.add(node.range[1])
      })
      walk(statement, (node) => {
        if (node.type === "AgentflowShape") addShapeRules(source, node, rules)
        if (node.type !== "AgentflowLink") return
        addLinkRules(source, node, rules)
        // A vertex statement takes no whitespace after a data block but the
        // one that an arrow reads, so an edge id touches the block
        // (diagrams/agentflow.md, Vertices, shapes, and labels).
        if (node.id !== null && dataBlockEnds.has(node.range[0]))
          rules.set(node.range[0], "none")
      })
      break
    }
    default:
      break
  }
  // Agentflow label ranges include padding before internal comments. Whole
  // value atoms keep that content and its LF/continuation columns. The narrow
  // brace fold likewise does not authorize changing written value lines or
  // aligning opaque data closers (diagrams/agentflow.md, Preserved comments and
  // Label and closing-brace differences; docs/agentflow.md, Labels and
  // Multiline statements and values).
  const layout = layoutRange(
    source,
    start,
    end,
    collectValueNodes(statement, agentflowValueNodeTypes),
    kept,
    rules,
  )
  if (statement.type === "AgentflowAccDescrBlockStatement") {
    const closing = findAccDescrBlockClosing(source, statement)
    const descriptionLayout: AtomLayout = {
      ...layout,
      outdented: closing === null ? new Set() : new Set([closing]),
    }
    return formatDescriptionBlock(
      source,
      statement,
      descriptionLayout,
      preservesDescriptionColumns,
    )
  }
  if (statement.type === "AgentflowClickCallbackStatement") {
    const atoms = [...layout.atoms]
    normalizeCallArguments(source, atoms, statement.arguments?.range ?? null)
    return { ...layout, atoms }
  }
  return layout
}

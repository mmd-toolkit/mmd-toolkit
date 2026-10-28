import { appendItems } from "./collections.ts"
import type {
  AgentflowFlowStatement,
  AgentflowGlobalStatement,
  AgentflowConnectorStatement,
  AgentflowStatement,
  AgentflowName,
  Node,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  addLinkRules,
  addShapeRules,
  layoutGraphAccessibility,
} from "./graph-layout.ts"
import { findAgentflowKeptLines } from "./agentflow-kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  keptAsWritten,
  walk,
} from "./layout.ts"
import { readGapElement } from "./gap.ts"
import { holdsJoiningRegion, lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, isWhitespace } from "./source.ts"

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
  return {
    atoms: collectAtoms(source, start, end, values, kept),
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
  let nameEnd = name.range[1]
  // Only an ordinary single-fragment explicit-title heading shares flowchart's
  // title-gap collapse. Erased click/empty forms and their context-exit gaps
  // are Name text (diagrams/agentflow.md, Names; docs/agentflow.md, Names and headings).
  if (node.title !== null && name.parts.length === 1) {
    while (nameEnd > name.range[0] && isWhitespace(source.text[nameEnd - 1]))
      nameEnd--
    // A whitespace-only name still needs its written character.
    if (nameEnd === name.range[0]) nameEnd = name.range[1]
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
  const nameAtom = { start: name.range[0], end: nameEnd }
  const values: Node[] = [
    ...node.data,
    ...(node.title === null ? [] : [node.title]),
  ]
  const rules = new Map<number, GapRule>()
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

/** Agentflow statements use flowchart's shared graph spacing and atom printer. */
export function layoutStatement(
  source: Source,
  statement: SimpleStatement,
  end: number,
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
    case "AgentflowStyleStatement":
    case "AgentflowClassDefStatement":
    case "AgentflowClassStatement":
    case "AgentflowLinkStyleStatement":
    case "AgentflowDefaultLinkStyleStatement":
      // Exactly one grammar unit precedes a value, and every further space is
      // value text. Preserve these gaps, even across directives, rather than
      // applying flowchart's first-style collapse (diagrams/agentflow.md,
      // Style, classDef, class, and linkStyle; docs/agentflow.md, Single space gaps).
      return keptAsWritten(start, end)
    case "AgentflowClickUrlStatement":
    case "AgentflowClickCallbackStatement":
      // Prefix nodes can straddle href or follow a second call. Their gaps and
      // later physical columns belong to the authored click spelling; extra
      // whitespace units can reject (diagrams/agentflow.md, Click, call, and href;
      // docs/agentflow.md, Click statements and Multiline statements and values).
      if (source.text.slice(start, end).includes("\n"))
        return keptAsWritten(start, end)
      // Only the ordinary gap after the first click keyword is exterior to
      // its ids, values and retained prefixes.
      kept.push({
        start: expectToken(
          findStructuralToken(
            source,
            expectToken(findStructuralToken(source, start), "click").range[1],
          ),
          "click ids",
        ).range[0],
        end,
      })
      break
    case "AgentflowEmptyStatement":
      return keptAsWritten(start, end)
    case "AgentflowAccDescrBlockStatement":
      appendItems(kept, findAccDescrBlockStretches(source, statement))
      if (!statement.closed) return keptAsWritten(start, end)
      break
    case "AgentflowVertexStatement":
      walk(statement, (node) => {
        if (node.type === "AgentflowShape") addShapeRules(source, node, rules)
        if (node.type === "AgentflowLink") addLinkRules(source, node, rules)
      })
      break
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
    return {
      ...layout,
      outdented: closing === null ? new Set() : new Set([closing]),
    }
  }
  return layout
}

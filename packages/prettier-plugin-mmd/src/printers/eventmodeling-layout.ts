import type { Doc, ParserOptions } from "prettier"
import { utils } from "prettier/doc"
import type {
  Node,
  EventmodelingDiagram,
  EventmodelingBodyItem,
  EventmodelingGwtClause,
  EventmodelingGwtItem,
  EventmodelingGwtStatement,
  EventmodelingTitleStatement,
  EventmodelingAccTitleStatement,
  EventmodelingAccDescrStatement,
  EventmodelingAccDescrBlockStatement,
  EventmodelingDataEntityStatement,
  EventmodelingNoteStatement,
  EventmodelingTimeFrameStatement,
  EventmodelingResetFrameStatement,
  EventmodelingModelEntityStatement,
  EventmodelingIgnoredText,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import type { HiddenOpenBlockLayout } from "./flat-hidden-diagram.ts"
import { readGap } from "./gap.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  keptAsWritten,
  layoutKeywordHeader,
  protectSemicolonPrefixes,
  spansLinesThatCannotJoin,
  walk,
} from "./layout.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTokensBetween,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

/** Values retain their written spelling, including leading zeroes and quotes. */
export const eventmodelingValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "EventmodelingLiteral",
  "EventmodelingIgnoredText",
])

export type EventmodelingStatement =
  EventmodelingBodyItem | EventmodelingGwtClause | EventmodelingGwtItem

type ClassifiedStatement =
  | { readonly kind: "gwt"; readonly statement: EventmodelingGwtStatement }
  | { readonly kind: "clause"; readonly statement: EventmodelingGwtClause }
  | {
      readonly kind: "common"
      readonly statement:
        | EventmodelingTitleStatement
        | EventmodelingAccTitleStatement
        | EventmodelingAccDescrStatement
        | EventmodelingAccDescrBlockStatement
    }
  | {
      readonly kind: "data"
      readonly statement:
        EventmodelingDataEntityStatement | EventmodelingNoteStatement
    }
  | {
      readonly kind: "ordinary"
      readonly statement:
        | EventmodelingTimeFrameStatement
        | EventmodelingResetFrameStatement
        | EventmodelingModelEntityStatement
        | EventmodelingGwtItem
    }
  | { readonly kind: "hidden"; readonly statement: EventmodelingIgnoredText }

/** One exhaustive classification controls body, common and data boundaries. */
export function classifyEventmodelingStatement(
  statement: EventmodelingStatement,
): ClassifiedStatement {
  switch (statement.type) {
    case "EventmodelingGwtStatement":
      return { kind: "gwt", statement }
    case "EventmodelingGwtClause":
      return { kind: "clause", statement }
    case "EventmodelingTitleStatement":
    case "EventmodelingAccTitleStatement":
    case "EventmodelingAccDescrStatement":
    case "EventmodelingAccDescrBlockStatement":
      return { kind: "common", statement }
    case "EventmodelingDataEntityStatement":
    case "EventmodelingNoteStatement":
      return { kind: "data", statement }
    case "EventmodelingTimeFrameStatement":
    case "EventmodelingResetFrameStatement":
    case "EventmodelingModelEntityStatement":
    case "EventmodelingGwtItem":
      return { kind: "ordinary", statement }
    case "EventmodelingIgnoredText":
      return { kind: "hidden", statement }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown eventmodeling item ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/** The header's first atom follows every retained pre-header native form. */
export function layoutEventmodelingHeader(
  source: Source,
  diagram: EventmodelingDiagram,
): AtomLayout {
  return layoutKeywordHeader(
    source,
    expectToken(
      findStructuralToken(
        source,
        diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
      ),
      "the eventmodeling header",
    ),
  )
}

/**
 * Common EM terminals include keyword, padding and delimiters in their values;
 * none can use ordinary accessibility layout or description compaction
 * (diagrams/eventmodeling.md, Common statements; docs/eventmodeling.md,
 * Common boundaries and Description blocks). Other components use one layout.
 */
export function layoutEventmodelingStatement(
  source: Source,
  statement: EventmodelingStatement,
  options: ParserOptions<MermaidAst>,
): AtomLayout | HiddenOpenBlockLayout<EventmodelingStatement> {
  const [start, end] = statement.range
  const selected = classifyEventmodelingStatement(statement)
  switch (selected.kind) {
    case "common":
    case "hidden":
      return keptAsWritten(start, end)
    case "gwt": {
      const gwt = selected.statement
      return {
        header: layoutComponents(
          source,
          gwt,
          start,
          gwt.sourceFrame.range[1],
          options.tabWidth,
        ),
        body: [gwt.given, ...(gwt.when === null ? [] : [gwt.when]), gwt.then],
        end,
      }
    }
    case "clause": {
      const clause = selected.statement
      const keyword = expectToken(
        findStructuralToken(
          source,
          clause.textBefore.at(-1)?.range[1] ?? start,
        ),
        "a GWT clause",
      )
      return {
        header: layoutComponents(
          source,
          clause,
          start,
          keyword.range[1],
          options.tabWidth,
        ),
        body: clause.body,
        end,
      }
    }
    case "ordinary":
    case "data":
      return layoutComponents(source, statement, start, end, options.tabWidth)
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown eventmodeling kind ${JSON.stringify(selected satisfies never)}`,
      )
  }
}

/**
 * Whole data bodies are atoms; tags, dots and references have tight inner edges.
 * A required identifier title retains its successful LF boundary, since padded
 * title would become EM_TITLE (diagrams/eventmodeling.md, Data and Common
 * statements; docs/eventmodeling.md, Frame components and Qualified names).
 */
function layoutComponents(
  source: Source,
  statement: EventmodelingStatement,
  start: number,
  end: number,
  tabWidth: number,
): AtomLayout {
  const values = collectValueNodes(
    statement,
    eventmodelingValueNodeTypes,
  ).filter((node) => start <= node.range[0] && node.range[1] <= end)
  const kept: Atom[] = []
  let blockOpening: number | undefined
  walk(statement, (node) => {
    if (
      (node.type === "EventmodelingInlineData" ||
        node.type === "EventmodelingDataBlock") &&
      node.range[1] <= end
    ) {
      const opening = expectToken(
        node.value?.type === "StringLiteral"
          ? findTokenStartingAt(source, node.value.range[0])
          : findTokensBetween(source, node.range[0], node.range[1]).find(
              (token) => token.type === "Punctuator" && token.value === "{",
            ),
        "a data body",
      )
      if (node.type === "EventmodelingDataBlock")
        blockOpening = opening.range[0]
      kept.push({ start: opening.range[0], end: node.range[1] })
    }
  })
  const atoms = collectAtoms(source, start, end, values, kept)
  const rules = new Map<number, GapRule>()
  const joinedBefore = new Set<number>()
  const writtenGapsBefore = new Set<number>()
  const canJoin = !spansLinesThatCannotJoin(source, start, end)
  // Reuse authored title starts instead of searching all values at each edge.
  const titleStarts = new Set(
    values
      .filter((node) => node.type === "Identifier" && node.name === "title")
      .map((node) => node.range[0]),
  )
  let inTag = false
  for (const [index, atom] of atoms.entries()) {
    const token = findTokenStartingAt(source, atom.start)
    const previous = atoms[index - 1]
    const before =
      previous === undefined
        ? undefined
        : findTokenStartingAt(source, previous.start)
    const touches =
      token?.value === "." ||
      before?.value === "." ||
      token?.value === "]]" ||
      before?.value === "[[" ||
      inTag
    if (previous !== undefined) {
      rules.set(atom.start, touches ? "none" : "space")
      const titleBoundary = !touches && titleStarts.has(atom.start)
      if (
        titleBoundary &&
        !source.text.slice(previous.end, atom.start).includes("\n")
      )
        writtenGapsBefore.add(atom.start)
      if (
        !titleBoundary &&
        canJoin &&
        findTriviaBetween(source, previous.end, atom.start).length === 0
      )
        joinedBefore.add(atom.start)
    }
    if (token?.value === "`") inTag = !inTag
  }
  let layout = protectHiddenGaps(
    {
      atoms: protectSemicolonPrefixes(source, start, end, atoms),
      rules,
      outdented: new Set(),
      lineBreaks: "kept",
      joinedBefore,
    },
    values.filter((node) => node.type === "EventmodelingIgnoredText"),
  )
  if (classifyEventmodelingStatement(statement).kind === "data") {
    const last = layout.atoms.at(-1)!
    // Ordinary retained header breaks use continuation indentation. Keep a
    // safe body one further step inside that line, not beside its name
    // (docs/eventmodeling.md, Declarations and notes and Data blocks).
    const continuedHeader =
      !values.some(
        (node) =>
          node.type === "EventmodelingIgnoredText" &&
          node.range[0] < last.start,
      ) &&
      layout.atoms.some((atom, index) => {
        const previous = layout.atoms[index - 1]
        return (
          previous !== undefined &&
          !layout.joinedBefore?.has(atom.start) &&
          !layout.writtenGapsBefore?.has(atom.start) &&
          !writtenGapsBefore.has(atom.start) &&
          readGap(source, previous.end, atom.start, true).breaksLine
        )
      })
    // A semicolon-protected replacement owns its written indentation and
    // complete source; only the unprotected brace-body atom can be indented.
    const bodyDoc =
      last.start === blockOpening && last.writtenIndentation === undefined
        ? indentedDataBlock(
            source.text.slice(last.start, last.end),
            tabWidth * (continuedHeader ? 2 : 1),
          )
        : undefined
    // Preserve the lookahead that keeps LF out of a block-data terminal
    // (diagrams/eventmodeling.md, Data; docs/eventmodeling.md, Data boundaries).
    let paddedEnd = end
    while (source.text[paddedEnd] === " " || source.text[paddedEnd] === "\t")
      paddedEnd++
    layout = {
      ...layout,
      atoms: [
        ...layout.atoms.slice(0, -1),
        {
          ...last,
          end: paddedEnd,
          doc:
            bodyDoc === undefined
              ? undefined
              : [bodyDoc, printAsWritten(source, last.end, paddedEnd)],
        },
      ],
    }
  }
  return {
    ...layout,
    writtenGapsBefore: new Set([
      ...(layout.writtenGapsBefore ?? []),
      ...writtenGapsBefore,
    ]),
  }
}

/**
 * Align nonblank body lines while keeping the space-separated words of
 * Mermaid's data label. A new space on a later physical line adds a visible
 * nonbreaking space; tabs, markup and padded openers need their authored text
 * (docs/eventmodeling.md, Data blocks).
 */
function indentedDataBlock(text: string, tabWidth: number): Doc | undefined {
  if (
    tabWidth === 0 ||
    !text.startsWith("{\n") ||
    !text.endsWith("\n}") ||
    text.includes("<") ||
    text.includes("&") ||
    text.includes("%%{")
  )
    return undefined

  const rows = text.slice(2, -2).split("\n")
  const margins = rows.map((row) => {
    let margin = 0
    while (row[margin] === " ") margin++
    return margin
  })
  let hasContent = false
  for (const [index, row] of rows.entries()) {
    if (row.trim() === "") continue
    hasContent = true
    const margin = margins[index]
    if (isWhitespace(row[margin]) || (index > 0 && margin === 0))
      return undefined
  }

  if (!hasContent) return undefined
  const indentation = " ".repeat(tabWidth)
  const indented = rows.map((row, index) =>
    row.trim() === "" ? row : indentation + row.slice(margins[index]),
  )
  return utils.replaceEndOfLine(`{\n${indented.join("\n")}\n}`)
}

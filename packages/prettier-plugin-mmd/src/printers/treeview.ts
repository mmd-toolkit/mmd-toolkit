import type { AstPath, Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type { Range } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import { expectToken, findLayoutEnd, layoutKeywordHeader } from "./layout.ts"
import { placeLeadingDirectives } from "./indentation-lines.ts"
import { printAsWritten, significantIndentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"
import { planTreeviewBox } from "./treeview-box.ts"
import type { TreeviewLine } from "./treeview-layout.ts"
import {
  layoutTreeviewStatement,
  treeviewBoxMode,
  treeviewLines,
  treeviewStatementRange,
} from "./treeview-layout.ts"

/** Prints the authored forest from its mode's column and safety plan. */
export function printTreeview(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "TreeviewDiagram")
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no treeview diagram`,
    )
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the treeview header",
  )
  const boxMode = treeviewBoxMode(source, keyword.range[1])
  const ownSemicolons = findLinesWithOwnSemicolons(source)
  const verbatim = findLinesEndedBySemicolon(source)
  const originalLines = treeviewLines(
    source,
    diagram,
    keyword.range[1],
    boxMode,
  )
  const items = originalLines.map((line) => line.item)
  const nodes = items.filter((item) => item.type === "TreeviewNode")
  const singleRootLine = nodes.every(
    (node) =>
      node.indent === 0 &&
      lineStartOf(source, treeviewStatementRange(node)[0]) ===
        lineStartOf(source, treeviewStatementRange(nodes[0])[0]),
  )
  const protectedRows =
    !singleRootLine &&
    items.some(
      (item) =>
        item.type === "TreeviewNode" &&
        items.some(
          (other) =>
            other !== item &&
            (lineStartOf(source, treeviewStatementRange(other)[0]) ===
              lineStartOf(source, treeviewStatementRange(item)[0]) ||
              lineStartOf(source, treeviewStatementRange(other)[1] - 1) ===
                lineStartOf(source, treeviewStatementRange(item)[0])) &&
            (ownSemicolons.has(
              lineStartOf(source, treeviewStatementRange(item)[0]),
            ) ||
              verbatim.has(
                lineStartOf(source, treeviewStatementRange(item)[0]),
              )),
        ),
    )
  const plan = boxMode
    ? planTreeviewBox(
        source,
        diagram,
        originalLines,
        keyword.range[1],
        protectedRows,
      )
    : undefined
  if (plan?.kind === "written" || (!boxMode && protectedRows))
    return printAsWritten(source, diagram.range[0], source.text.length)
  const drawing = plan?.kind === "drawn" ? plan : undefined
  const lines = drawing?.lines ?? originalLines
  const placements = new Map<
    TreeviewLine,
    { readonly indentation: string; readonly head: Doc }
  >(
    lines.map((line, index) => {
      const previous = lines[index - 1]
      if (boxMode)
        return [
          line,
          {
            indentation: "",
            head:
              line.leading === null
                ? ""
                : [
                    placeLeadingDirectives(source, line.leading, 0, " ").head,
                    // A moved directive must not shift or cross a new branch
                    // (docs/treeview.md, Statements one per line).
                    line.item.type === "TreeviewNode" &&
                    previous?.item.type === "TreeviewNode" &&
                    lineStartOf(source, line.leading.directives[0][0]) ===
                      lineStartOf(source, previous.range[1] - 1)
                      ? builders.literalline
                      : "",
                  ],
          },
        ]
      const column = significantIndentationOf(options, line.depth)
      return [
        line,
        line.leading === null
          ? { indentation: column, head: "" }
          : placeLeadingDirectives(
              source,
              line.leading,
              column.length,
              options.useTabs ? "\t" : " ",
            ),
      ]
    }),
  )
  const relocatedWhitespace: Range[] = lines.map((line, index) => [
    lines[index - 1]?.range[1] ?? keyword.range[1],
    line.range[0],
  ])
  const layouts = new Map(
    lines.map((line) => [
      line,
      line.item.type === "TreeviewIgnoredText" && drawing !== undefined
        ? undefined
        : layoutTreeviewStatement(
            source,
            line.item,
            boxMode ? "" : significantIndentationOf(options, line.depth),
            boxMode,
            drawing,
          ),
    ]),
  )
  const block = printBlock(
    lines.map((line) => {
      if (line.item.type === "TreeviewIgnoredText" && drawing !== undefined)
        return drawing.decorations.get(line.item)!
      const head =
        line.item.type === "TreeviewNode"
          ? (drawing?.heads.get(line.item) ?? "")
          : ""
      const after =
        line.item.type === "TreeviewNode"
          ? (drawing?.trailingDecorations.get(line.item) ?? [])
          : []
      return [
        placements.get(line)!.head,
        head,
        printAtoms(source, layouts.get(line)!, {
          statement: boxMode
            ? ""
            : significantIndentationOf(options, line.depth),
          continuation: "",
          trivia: "",
        }).doc,
        ...after.flatMap((decoration) => {
          const guide = drawing!.decorations.get(decoration)!
          return guide === "" ? [] : [builders.literalline, guide]
        }),
      ]
    }),
    source,
    {
      statements: lines,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    {
      kept: {
        // Content prefixes still use shared semicolon protection. Its source
        // columns are now replaced by the planned head, not a verbatim old head.
        joined: boxMode
          ? new Set([...ownSemicolons, ...verbatim])
          : ownSemicolons,
        verbatim: boxMode ? new Set() : verbatim,
        writtenIndentation: new Set(
          lines.map((line) => lineStartOf(source, line.range[0])),
        ),
      },
      omittedRanges: drawing?.omitted,
      blankAfterStatement: (line) =>
        line.item.type === "TreeviewNode" &&
        drawing?.trailingDecorations
          .get(line.item)
          ?.some((decoration) => drawing.decorations.get(decoration) === "") ===
          true,
      relocatedWhitespace: boxMode ? [] : relocatedWhitespace,
      joiningRegionsInValues: true,
      printedEnd: (line) =>
        layouts.get(line) === undefined
          ? line.range[1]
          : findLayoutEnd(layouts.get(line)!),
      holdsStatements: () => false,
      isDroppedAtTopLevel: () => false,
      keepsWhitespaceLineAfterComment: false,
      keepsDirectiveLinesUnindented: false,
      keepsTrailingWhitespaceInKeptTrivia: true,
      writtenIndentationOf: (line) => placements.get(line)!.indentation,
      keptIndentationOf: (line) => placements.get(line)!.indentation,
    },
  )
  return printDiagramBlock(
    source,
    openingLine(
      printAtoms(source, layoutKeywordHeader(source, keyword), {
        statement: "",
        continuation: "",
      }).doc,
      block,
      false,
    ),
    block,
    options,
    0,
  )
}

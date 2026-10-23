import type {
  Node,
  PieBodyItem,
  PieDiagram,
  PieIgnoredText,
  Token,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  protectSemicolonPrefixes,
} from "./layout.ts"
import { layoutCommonLine, layoutCommonDescription } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import type { Source } from "./source.ts"
import { findStructuralToken } from "./source.ts"

/** Authored leaves; common line edges alone are compacted (docs/pie.md). */
export const pieValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "NumericLiteral",
  "PieLiteral",
  "PieIgnoredText",
])

/** The actual header token follows any retained preheader forms. */
export function pieKeyword(source: Source, diagram: PieDiagram): Token {
  return expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the pie header",
  )
}

/** Hidden forms keep their gap and consumed LF before a written flag. */
export function layoutPieHeader(
  source: Source,
  diagram: PieDiagram,
): AtomLayout {
  const keyword = pieKeyword(source, diagram)
  const beforeFlag =
    diagram.textBeforeShowData.at(-1)?.range[1] ?? keyword.range[1]
  const end = diagram.showData
    ? expectToken(findStructuralToken(source, beforeFlag), "showData").range[1]
    : keyword.range[1]
  const atoms = collectAtoms(
    source,
    keyword.range[0],
    end,
    diagram.textBeforeShowData,
    [],
  )
  const rules = new Map<number, GapRule>()
  if (diagram.showData) rules.set(atoms.at(-1)!.start, "space")
  return protectHiddenGaps(
    {
      atoms,
      rules,
      outdented: new Set(),
      lineBreaks: "kept",
    },
    diagram.textBeforeShowData,
  )
}

/**
 * Pie line values never read the next physical line, unlike graph/C4 values
 * (diagrams/pie.md, Composite common forms; docs/pie.md, Accessibility lines).
 * Shared colon and description layouts still decide their exterior spacing.
 */
export function layoutPieStatement(
  source: Source,
  statement: PieBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, pieValueNodeTypes)
  const rules = new Map<number, GapRule>()
  let layout: AtomLayout
  switch (statement.type) {
    case "PieIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "PieAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, pieValueNodeTypes)
      break
    case "PieSectionStatement": {
      const colonStart =
        statement.textBeforeColon.at(-1)?.range[1] ?? statement.label.range[1]
      const colon = expectToken(
        findStructuralToken(source, colonStart),
        "the section colon",
      )
      expectValue(colon, ":")
      rules.set(colon.range[0], "space")
      rules.set(statement.value.range[0], "space")
      layout = {
        atoms: collectAtoms(source, start, end, values, []),
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    }
    case "PieTitleStatement":
    case "PieAccTitleStatement":
    case "PieAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "PieTitleStatement",
      )
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown pie item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  const hidden =
    statement.type === "PieIgnoredText"
      ? []
      : values.filter(
          (value): value is PieIgnoredText => value.type === "PieIgnoredText",
        )
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(source, start, end, layout.atoms),
    },
    hidden,
  )
}

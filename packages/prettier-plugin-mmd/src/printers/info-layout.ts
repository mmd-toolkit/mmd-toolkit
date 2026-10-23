import type {
  Node,
  InfoBodyItem,
  InfoDiagram,
  InfoIgnoredText,
  Token,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  protectSemicolonPrefixes,
} from "./layout.ts"
import { layoutCommonLine, layoutCommonDescription } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, findTriviaBetween } from "./source.ts"

/** Authored leaves; common line edges alone are compacted (docs/info.md). */
export const infoValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "InfoLiteral",
  "InfoIgnoredText",
])

/** The actual header token follows any retained preheader forms. */
export function infoKeyword(source: Source, diagram: InfoDiagram): Token {
  return expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the info header",
  )
}

/** Hidden forms keep their gap and consumed LF before a written flag. */
export function layoutInfoHeader(
  source: Source,
  diagram: InfoDiagram,
): AtomLayout {
  const keyword = infoKeyword(source, diagram)
  const beforeFlag =
    diagram.textBeforeShowInfo.at(-1)?.range[1] ?? keyword.range[1]
  const end = diagram.showInfo
    ? expectToken(findStructuralToken(source, beforeFlag), "showInfo").range[1]
    : keyword.range[1]
  const atoms = collectAtoms(
    source,
    keyword.range[0],
    end,
    diagram.textBeforeShowInfo,
    [],
  )
  const rules = new Map<number, GapRule>()
  if (diagram.showInfo) rules.set(atoms.at(-1)!.start, "space")
  return protectHiddenGaps(
    {
      atoms,
      rules,
      outdented: new Set(),
      lineBreaks: "kept",
      // Plain header whitespace joins; trivia and hidden forms stay in place
      // (diagrams/info.md, Grammar; docs/info.md, Header).
      joinedBefore: new Set(
        diagram.showInfo &&
          diagram.textBeforeShowInfo.length === 0 &&
          findTriviaBetween(source, keyword.range[1], end).length === 0
          ? [atoms.at(-1)!.start]
          : [],
      ),
    },
    diagram.textBeforeShowInfo,
  )
}

/**
 * Info line values never read the next physical line, unlike graph/C4 values
 * (diagrams/info.md, Composite common forms; docs/info.md, Accessibility lines).
 * Shared colon and description layouts still decide their exterior spacing.
 */
export function layoutInfoStatement(
  source: Source,
  statement: InfoBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, infoValueNodeTypes)
  const rules = new Map<number, GapRule>()
  let layout: AtomLayout
  switch (statement.type) {
    case "InfoIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "InfoAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, infoValueNodeTypes)
      break
    case "InfoTitleStatement":
    case "InfoAccTitleStatement":
    case "InfoAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "InfoTitleStatement",
      )
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown info item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  const hidden =
    statement.type === "InfoIgnoredText"
      ? []
      : values.filter(
          (value): value is InfoIgnoredText => value.type === "InfoIgnoredText",
        )
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(source, start, end, layout.atoms),
    },
    hidden,
  )
}

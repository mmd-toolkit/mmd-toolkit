import type {
  Node,
  RadarBodyItem,
  RadarDiagram,
  RadarIgnoredText,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import { findSemicolonLines, lineStartOf } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  keptAsWritten,
  protectSemicolonPrefixes,
  spansLinesThatCannotJoin,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTriviaBetween,
} from "./source.ts"

/** Authored leaves retain labels, number spellings and hidden source. */
export const radarValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "RadarLiteral",
  "RadarIgnoredText",
])

/** Ordinary colon gaps compact as in gitgraph (docs/radar.md, Header). */
export function layoutRadarHeader(
  source: Source,
  diagram: RadarDiagram,
): AtomLayout {
  const keyword = expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the radar header",
  )
  const colon = findStructuralToken(
    source,
    diagram.textBeforeColon.at(-1)?.range[1] ?? keyword.range[1],
  )
  const end = colon?.value === ":" ? colon.range[1] : keyword.range[1]
  const atoms = collectAtoms(
    source,
    keyword.range[0],
    end,
    diagram.textBeforeColon,
    [],
  )
  return protectHiddenGaps(
    {
      atoms,
      rules: new Map(colon?.value === ":" ? [[colon.range[0], "none"]] : []),
      outdented: new Set(),
      lineBreaks: "kept",
    },
    diagram.textBeforeColon,
  )
}

/**
 * Written groups remain statements; entries are internal values, not body
 * items (diagrams/radar.md, Grammar; docs/radar.md, Groups and commas,
 * Labels, Curve braces, Named entries and Multi-line statements).
 */
export function layoutRadarStatement(
  source: Source,
  statement: RadarBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, radarValueNodeTypes)
  const hidden = values.filter(
    (value): value is RadarIgnoredText => value.type === "RadarIgnoredText",
  )
  let layout: AtomLayout
  switch (statement.type) {
    case "RadarIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules: new Map(),
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "RadarAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, radarValueNodeTypes)
      break
    case "RadarTitleStatement":
    case "RadarAccTitleStatement":
    case "RadarAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "RadarTitleStatement",
      )
      break
    case "RadarAxisStatement":
    case "RadarCurveStatement":
    case "RadarOptionsStatement": {
      const hasSemicolon = source.text.slice(start, end).includes(";")
      // A semicolon in another statement on the final line protects that
      // line too. Keep the whole multiline statement so its value cannot
      // introduce a style trigger there (docs/radar.md, Multi-line statements).
      if (
        !hasSemicolon &&
        findSemicolonLines(source).has(lineStartOf(source, end - 1)) &&
        spansLinesThatCannotJoin(source, start, end)
      ) {
        layout = keptAsWritten(start, end)
        break
      }
      const atoms = collectAtoms(source, start, end, values, [])
      const rules = new Map<number, GapRule>()
      const outdented = new Set<number>()
      const joinedBefore = new Set<number>()
      for (const [index, atom] of atoms.entries()) {
        const previous = atoms[index - 1]
        if (previous === undefined) continue
        const token = findTokenStartingAt(source, atom.start)
        const before = findTokenStartingAt(source, previous.start)
        const touches =
          token?.type === "Punctuator" ||
          before?.value === "[" ||
          before?.value === "{"
        rules.set(atom.start, touches ? "none" : "space")
        if (token?.value === "}") outdented.add(atom.start)
        // Only plain entry newlines join. Trivia and hidden boundaries keep
        // their line, and textual semicolon segments keep their reading
        // (diagrams/radar.md, Hidden forms and comments; docs/radar.md,
        // Multi-line statements and Semicolons).
        if (
          findTriviaBetween(source, previous.end, atom.start).length === 0 &&
          !hidden.some(
            (item) =>
              item.range[0] === atom.start || item.range[1] === previous.end,
          ) &&
          !hasSemicolon
        ) {
          joinedBefore.add(atom.start)
        }
      }
      layout = {
        atoms,
        rules,
        outdented,
        joinedBefore,
        lineBreaks: "kept",
      }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown radar item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(source, start, end, layout.atoms),
    },
    hidden,
  )
}

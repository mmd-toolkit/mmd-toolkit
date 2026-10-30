import type {
  Node,
  ArchitectureBodyItem,
  ArchitectureDiagram,
  ArchitectureIgnoredText,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTokensBetween,
  isStructural,
} from "./source.ts"

/** Written leaves retain quotes, digits and hidden source (docs/architecture.md). */
export const architectureValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "Identifier",
  "ArchitectureLabel",
  "ArchitectureLiteral",
  "ArchitectureIgnoredText",
])

/** The first atom is the authored header keyword, after any retained prefix. */
export function layoutArchitectureHeader(
  source: Source,
  diagram: ArchitectureDiagram,
): AtomLayout {
  const keyword = expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the architecture header",
  )
  return {
    atoms: [{ start: keyword.range[0], end: keyword.range[1] }],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * Declarations, ports and arrows use their written components. Hidden/global
 * trivia keep their boundaries; common forms use shared layouts
 * (diagrams/architecture.md, Grammar; docs/architecture.md, Declaration spacing
 * and Arrow lines).
 */
export function layoutArchitectureStatement(
  source: Source,
  statement: ArchitectureBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, architectureValueNodeTypes)
  const hidden = values.filter(
    (value): value is ArchitectureIgnoredText =>
      value.type === "ArchitectureIgnoredText",
  )
  let layout: AtomLayout
  switch (statement.type) {
    case "ArchitectureIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules: new Map(),
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "ArchitectureAccDescrBlockStatement":
      layout = layoutCommonDescription(
        source,
        statement,
        architectureValueNodeTypes,
      )
      break
    case "ArchitectureTitleStatement":
    case "ArchitectureAccTitleStatement":
    case "ArchitectureAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "ArchitectureTitleStatement",
      )
      break
    case "ArchitectureGroupStatement":
    case "ArchitectureServiceStatement":
    case "ArchitectureJunctionStatement":
    case "ArchitectureAlignmentStatement":
    case "ArchitectureEdgeStatement": {
      const atoms = collectAtoms(source, start, end, values, [])
      const rules = new Map<number, GapRule>(
        atoms
          .slice(1)
          .map((atom) => [
            atom.start,
            statement.type === "ArchitectureEdgeStatement" ? "none" : "space",
          ]),
      )
      if (statement.type === "ArchitectureEdgeStatement") {
        // The two Keyword tokens inside the arrow are its port directions.
        // Marker glyphs remain tokens, including reversed >--< spellings
        // (diagrams/architecture.md, Names, keyword boundaries and directions).
        const directions = findTokensBetween(
          source,
          ...statement.arrow.range,
        ).filter(
          (token) => isStructural(source, token) && token.type === "Keyword",
        )
        const first = expectToken(directions[0], "the start port direction")
        const last = expectToken(directions[1], "the end port direction")
        const bundle = atoms.find(
          (atom) =>
            first.range[1] <= atom.start &&
            atom.end <= last.range[0] &&
            !hidden.some((item) => item.range[0] === atom.start),
        )
        if (bundle === undefined)
          throw new Error("prettier-plugin-mmd: no architecture line")
        rules.set(bundle.start, "space")
        rules.set(last.range[0], "space")
      } else if (
        statement.type === "ArchitectureGroupStatement" ||
        statement.type === "ArchitectureServiceStatement"
      ) {
        for (const atom of atoms) {
          const token = findTokenStartingAt(source, atom.start)
          if (token?.value === "(" || token?.value === ")")
            rules.set(atom.start, "none")
        }
        if (statement.icon?.type === "Identifier")
          rules.set(statement.icon.range[0], "none")
        if (statement.title !== null)
          rules.set(
            statement.title.range[0],
            statement.icon?.type === "StringLiteral" ? "space" : "none",
          )
      }
      layout = { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown architecture item ${JSON.stringify(statement satisfies never)}`,
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

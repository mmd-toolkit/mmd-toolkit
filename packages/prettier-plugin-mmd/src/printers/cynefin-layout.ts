import type {
  Node,
  CynefinDiagram,
  CynefinBodyItem,
  CynefinDomainItem,
  CynefinIgnoredText,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import type { HiddenOpenBlockLayout } from "./flat-hidden-diagram.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  keptAsWritten,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import { findStructuralToken } from "./source.ts"

/** Strings, common values and native forms retain their authored spelling. */
export const cynefinValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "CynefinLiteral",
  "CynefinIgnoredText",
])

type CynefinStatement = CynefinBodyItem | CynefinDomainItem

/** Keep the optional authored header colon (docs/cynefin.md, Header). */
export function layoutCynefinHeader(
  source: Source,
  diagram: CynefinDiagram,
): AtomLayout {
  const keyword = expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the cynefin header",
  )
  const next = findStructuralToken(source, keyword.range[1])
  const end = next?.value === ":" ? next.range[1] : keyword.range[1]
  const atoms = collectAtoms(source, keyword.range[0], end, [], [])
  return {
    atoms: protectSemicolonPrefixes(source, keyword.range[0], end, atoms),
    rules: new Map(next?.value === ":" ? [[next.range[0], "none"]] : []),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * Domains need no closer or EOL; their item sequence uses the shared body path
 * (diagrams/cynefin.md, Grammar; docs/cynefin.md, Domains and items).
 * Other components separate by one space, with shared common/hidden layouts.
 */
export function layoutCynefinStatement(
  source: Source,
  statement: CynefinStatement,
): AtomLayout | HiddenOpenBlockLayout<CynefinStatement> {
  const [start, end] = statement.range
  if (statement.type === "CynefinDomainStatement") {
    const atoms = protectSemicolonPrefixes(
      source,
      start,
      end,
      collectAtoms(
        source,
        start,
        end,
        collectValueNodes(statement, cynefinValueNodeTypes),
        [],
      ),
    )
    const headerEnd = atoms[0].end
    return {
      header: keptAsWritten(start, headerEnd),
      body: [...statement.textAfterName, ...statement.items],
      end,
    }
  }
  if (statement.type === "CynefinIgnoredText") return keptAsWritten(start, end)
  const values = collectValueNodes(statement, cynefinValueNodeTypes)
  const hidden = values.filter(
    (node): node is CynefinIgnoredText => node.type === "CynefinIgnoredText",
  )
  let layout: AtomLayout
  switch (statement.type) {
    case "CynefinTitleStatement":
    case "CynefinAccTitleStatement":
    case "CynefinAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "CynefinTitleStatement",
      )
      break
    case "CynefinAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, cynefinValueNodeTypes)
      break
    case "CynefinTransitionStatement":
    case "CynefinDomainItem": {
      const atoms = collectAtoms(source, start, end, values, [])
      const rules = new Map<number, GapRule>()
      for (const atom of atoms.slice(1)) rules.set(atom.start, "space")
      layout = {
        atoms,
        rules,
        outdented: new Set(),
        alignedGapsBefore: new Set(
          statement.type === "CynefinDomainItem"
            ? [
                ...statement.textBefore.map((item) => item.range[0]),
                statement.label.range[0],
              ]
            : [],
        ),
        lineBreaks: "kept",
      }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown cynefin item ${JSON.stringify(statement satisfies never)}`,
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

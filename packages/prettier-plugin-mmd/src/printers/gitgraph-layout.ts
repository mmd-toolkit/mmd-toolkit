import type {
  GitgraphBodyItem,
  GitgraphDiagram,
  GitgraphIgnoredText,
  Node,
  Token,
} from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, findTokenStartingAt } from "./source.ts"

/** Written leaves retain quotes, digits and hidden source (docs/gitgraph.md). */
export const gitgraphValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "GitgraphLiteral",
  "GitgraphIgnoredText",
])

/** Retained detection text precedes the actual header token. */
export function gitgraphKeyword(
  source: Source,
  diagram: GitgraphDiagram,
): Token {
  return expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the gitgraph header",
  )
}

/**
 * Keep authored direction/colon presence; only plain gaps compact
 * (diagrams/gitgraph.md, Keywords and components; docs/gitgraph.md, Header).
 */
export function layoutGitgraphHeader(
  source: Source,
  diagram: GitgraphDiagram,
): AtomLayout {
  const keyword = gitgraphKeyword(source, diagram)
  let end = keyword.range[1]
  if (diagram.direction !== null) {
    end = expectToken(
      findStructuralToken(
        source,
        diagram.textBeforeDirection.at(-1)?.range[1] ?? end,
      ),
      "the direction",
    ).range[1]
  }
  const colon = findStructuralToken(
    source,
    diagram.textBeforeColon.at(-1)?.range[1] ?? end,
  )
  if (colon?.value === ":") end = colon.range[1]
  const hidden = [...diagram.textBeforeDirection, ...diagram.textBeforeColon]
  const atoms = collectAtoms(source, keyword.range[0], end, hidden, [])
  const rules = gitgraphGapRules(source, atoms, hidden)
  return protectHiddenGaps(
    { atoms, rules, outdented: new Set(), lineBreaks: "kept" },
    hidden,
  )
}

/**
 * Plain operation/option gaps get one space, option colons touch their word.
 * Hidden and global trivia retain their boundaries through shared layouts
 * (diagrams/gitgraph.md, Keywords and components; docs/gitgraph.md, Option colons).
 */
export function layoutGitgraphStatement(
  source: Source,
  statement: GitgraphBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, gitgraphValueNodeTypes)
  let layout: AtomLayout
  switch (statement.type) {
    case "GitgraphIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules: new Map(),
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "GitgraphAccDescrBlockStatement":
      layout = layoutCommonDescription(
        source,
        statement,
        gitgraphValueNodeTypes,
      )
      break
    case "GitgraphTitleStatement":
    case "GitgraphAccTitleStatement":
    case "GitgraphAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "GitgraphTitleStatement",
      )
      break
    case "GitgraphCommitStatement":
    case "GitgraphBranchStatement":
    case "GitgraphCheckoutStatement":
    case "GitgraphMergeStatement":
    case "GitgraphCherryPickStatement": {
      const atoms = collectAtoms(source, start, end, values, [])
      const hidden = values.filter(
        (value) => value.type === "GitgraphIgnoredText",
      )
      const rules = gitgraphGapRules(source, atoms, hidden)
      layout = { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown gitgraph item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(source, start, end, layout.atoms),
    },
    values.filter(
      (value): value is GitgraphIgnoredText =>
        value.type === "GitgraphIgnoredText",
    ),
  )
}

/**
 * Ordinary components use one space except before a colon. Hidden openers
 * retain their contact rather than introducing a new separator
 * (docs/gitgraph.md, Operation spacing, Option colons and Hidden yaml).
 */
function gitgraphGapRules(
  source: Source,
  atoms: readonly Atom[],
  hidden: readonly Node[],
): ReadonlyMap<number, GapRule> {
  const rules = new Map<number, GapRule>(
    atoms
      .slice(1)
      .map((atom) => [
        atom.start,
        findTokenStartingAt(source, atom.start)?.value === ":"
          ? "none"
          : "space",
      ]),
  )
  for (const item of hidden) rules.delete(item.range[0])
  return rules
}

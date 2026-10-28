import type {
  Node,
  WardleyBodyItem,
  WardleyPipelineBodyItem,
  WardleyDiagram,
  WardleyIgnoredText,
  WardleyPipelineStatement,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import type { HiddenBlockLayout } from "./flat-hidden-diagram.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import { grammaticalSemicolonsOf } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  keptAsWritten,
  layoutKeywordHeader,
  layoutOnVerbatimStyleLine,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTokensBetween,
  isStructural,
} from "./source.ts"

/** Authored names, numbers, strings and hidden forms keep their source spans. */
export const wardleyValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "NumericLiteral",
  "WardleyIdentifier",
  "WardleyLiteral",
  "WardleyIgnoredText",
])

type WardleyStatement = WardleyBodyItem | WardleyPipelineBodyItem

/** The shared header contract starts at the authored keyword after any prefix. */
export function layoutWardleyHeader(
  source: Source,
  diagram: WardleyDiagram,
): AtomLayout {
  return layoutKeywordHeader(
    source,
    expectToken(
      findStructuralToken(
        source,
        diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
      ),
      "the wardley header",
    ),
  )
}

/**
 * AST components decide ordinary spacing; hidden forms and textual semicolons
 * use the shared boundaries (diagrams/wardley.md, Grammar and Keyword and name
 * boundaries; docs/wardley.md, Component spacing, Name boundaries and Semicolons).
 */
export function layoutWardleyStatement(
  source: Source,
  statement: WardleyStatement,
): AtomLayout | HiddenBlockLayout<WardleyStatement> {
  const [start, end] = statement.range
  if (statement.type === "WardleyPipelineStatement")
    return layoutPipeline(source, statement)
  const verbatim = layoutOnVerbatimStyleLine(source, start, end)
  if (verbatim !== null) return verbatim
  let layout: AtomLayout
  switch (statement.type) {
    case "WardleyIgnoredText":
      return keptAsWritten(start, end)
    case "WardleyTitleStatement":
    case "WardleyAccTitleStatement":
    case "WardleyAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "WardleyTitleStatement",
      )
      break
    case "WardleyAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, wardleyValueNodeTypes)
      break
    case "WardleyAnchorStatement":
    case "WardleyComponentStatement":
    case "WardleyPipelineComponent":
    case "WardleyLinkStatement":
    case "WardleyEvolveStatement":
    case "WardleyNoteStatement":
    case "WardleyAnnotationsStatement":
    case "WardleyAnnotationStatement":
    case "WardleyAcceleratorStatement":
    case "WardleyDeacceleratorStatement":
    case "WardleyEvolutionStatement":
    case "WardleySizeStatement":
      layout = layoutComponents(source, statement, start, end)
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown wardley item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  const hidden = collectValueNodes(statement, wardleyValueNodeTypes).filter(
    (node): node is WardleyIgnoredText => node.type === "WardleyIgnoredText",
  )
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(
        source,
        start,
        end,
        layout.atoms,
        grammaticalSemicolonsOf(source),
      ),
    },
    hidden,
  )
}

/**
 * Delimiters touch their interiors, comma/slash/arrow components separate,
 * and offset signs attach to magnitudes. Flow internals remain authored
 * atoms (docs/wardley.md, Coordinates, Decorations, Label offsets and Flows).
 */
function layoutComponents(
  source: Source,
  statement: WardleyStatement,
  start: number,
  end: number,
): AtomLayout {
  const values = collectValueNodes(statement, wardleyValueNodeTypes).filter(
    (node) => start <= node.range[0] && node.range[1] <= end,
  )
  const atoms = collectAtoms(
    source,
    start,
    end,
    values,
    [...grammaticalSemicolonsOf(source)]
      .filter((offset) => start <= offset && offset < end)
      .map((offset) => ({ start: offset, end: offset + 1 })),
  )
  const rules = new Map<number, GapRule>()
  // Reuse authored title ends instead of searching all values at each edge.
  const titleEnds = new Set(
    values
      .filter(
        (node) => node.type === "WardleyIdentifier" && node.name === "title",
      )
      .map((node) => node.range[1]),
  )
  for (const [index, atom] of atoms.entries()) {
    const previous = atoms[index - 1]
    if (previous === undefined) continue
    const token = findTokenStartingAt(source, atom.start)
    const before = findTokenStartingAt(source, previous.start)
    const touches =
      token?.value === "," ||
      token?.value === "]" ||
      token?.value === ")" ||
      token?.value === "@" ||
      token?.value === ";" ||
      before?.value === "[" ||
      before?.value === "(" ||
      before?.value === "@" ||
      before?.value === "-" ||
      before?.value === ";"
    rules.set(atom.start, touches ? "none" : "space")
    // A bare title followed by whitespace starts metadata instead of a name.
    // Preserve its authored boundary, including before ports, @ and slash
    // (diagrams/wardley.md, Keyword and name boundaries; Name boundaries).
    if (titleEnds.has(previous.end)) rules.delete(atom.start)
    if (
      statement.type === "WardleyLinkStatement" &&
      statement.arrow !== null &&
      statement.arrow.range[0] < atom.start &&
      atom.end <= statement.arrow.range[1]
    )
      rules.delete(atom.start)
  }
  return { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
}

/**
 * Pipeline edge layouts use the same body printer as the diagram. Forms after
 * { enter that body's opening edge so consumed LF still needs a visible LF
 * (diagrams/wardley.md, Native padding, hidden forms and EOL; Pipeline).
 */
function layoutPipeline(
  source: Source,
  statement: WardleyPipelineStatement,
): HiddenBlockLayout<WardleyStatement> {
  const after = statement.textAfter.at(0)?.range[0] ?? statement.range[1]
  const tokens = findTokensBetween(
    source,
    statement.parent.range[1],
    after,
  ).filter((token) => isStructural(source, token))
  const open = expectToken(
    tokens.find((token) => token.value === "{"),
    "the pipeline opener",
  )
  const close = expectToken(
    tokens.findLast((token) => token.value === "}"),
    "the pipeline closer",
  )
  const header =
    layoutOnVerbatimStyleLine(source, statement.range[0], open.range[1]) ??
    layoutComponents(source, statement, statement.range[0], open.range[1])
  const hidden = [...statement.textBeforeParent, ...statement.textBeforeBody]
  return {
    header: protectHiddenGaps(
      {
        ...header,
        atoms: protectSemicolonPrefixes(
          source,
          statement.range[0],
          open.range[1],
          header.atoms,
          grammaticalSemicolonsOf(source),
        ),
      },
      hidden,
    ),
    body: [...statement.textAfterOpen, ...statement.body],
    closing: protectHiddenGaps(
      {
        ...keptAsWritten(close.range[0], close.range[1]),
        atoms: [
          { start: close.range[0], end: close.range[1] },
          ...statement.textAfter.map((item) => ({
            start: item.range[0],
            end: item.range[1],
          })),
        ],
      },
      statement.textAfter,
    ),
  }
}

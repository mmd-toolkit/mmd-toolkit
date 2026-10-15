import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import { nodeTokensIn } from "./tokens.ts"
import type { CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

// The records that every diagram shares, checked once here and not in the
// check of each diagram: the directive and the root (ast.md, Directive, and
// Root). The values of the nodes are checked in `values.ts`.

/**
 * ast.md, Root: the diagram type ids that the diagram body of each kind has.
 * `flowchart-v2` is the id of the `graph` and `flowchart` headers,
 * `flowchart-elk` of `flowchart-elk`, and `swimlane` of `swimlane-beta`.
 */
const DIAGRAM_TYPES_OF_BODY: Readonly<Record<string, readonly string[]>> = {
  ErrorDiagram: ["error"],
  FlowchartDiagram: ["flowchart-v2", "flowchart-elk", "swimlane"],
  SequenceDiagram: ["sequence"],
  ClassDiagram: ["classDiagram"],
  StateDiagram: ["stateDiagram"],
  ErDiagram: ["er"],
  GanttDiagram: ["gantt"],
  JourneyDiagram: ["journey"],
  RequirementDiagram: ["requirement"],
  MindmapDiagram: ["mindmap"],
  TimelineDiagram: ["timeline"],
  SankeyDiagram: ["sankey"],
}

/** The name of a directive whose text between the delimiters is `value`: its first word, after the whitespace that may precede it. */
function directiveNameOf(value: string): string {
  let start = 0
  while (start < value.length && isWhitespace(value.charCodeAt(start))) start++
  let end = start
  while (end < value.length && isWordCharacter(value.charCodeAt(end))) end++
  return value.slice(start, end)
}

/**
 * parser/docs/tokens.md, String tokens: the tokens of a StringLiteral, a node
 * type that every diagram type shares, are one `String` token, or `StringFragment`
 * tokens where a directive, a comment region, or an ignored `;` cuts it.
 */
function checkStringTokens(root: CheckedRoot, problems: Problems): void {
  for (const node of nodesOf(root)) {
    if (node.type !== "StringLiteral") continue
    const tokens = nodeTokensIn(root, node.range)
    const [first] = tokens
    problems.expect(
      (tokens.length === 1 && first?.type === "String") ||
        (tokens.length > 0 &&
          tokens.every((token) => token.type === "StringFragment")),
      label(node),
      `the tokens of the string are not one String token or StringFragment tokens: ${tokens.map((token) => token.type).join(", ")}`,
    )
  }
}

/**
 * Checks the shared records: the name of a directive is its first word (ast.md,
 * Directive), the diagram type of the root is one of those of its body
 * (ast.md, Root), and the tokens of a string are the tokens of a string.
 */
export function checkSharedLeaves(root: CheckedRoot, problems: Problems): void {
  for (const directive of root.directives) {
    problems.expectEqual(
      (directive as { name?: unknown }).name,
      directiveNameOf(directive.value),
      label(directive),
      "name",
    )
  }
  const allowed = DIAGRAM_TYPES_OF_BODY[root.body.type] ?? []
  problems.expect(
    allowed.includes(root.diagramType),
    "Root",
    `the diagram type ${root.diagramType} is not one of those of a ${root.body.type}: ${allowed.join(", ")}`,
  )
  checkStringTokens(root, problems)
}

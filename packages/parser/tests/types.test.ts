import type {
  TreeviewDiagram,
  TreeviewNode,
  TreeviewIgnoredText,
  TreeviewTreeNode,
  EventmodelingDiagram,
  EventmodelingNode,
  CynefinDiagram,
  CynefinNode,
  WardleyDiagram,
  WardleyNode,
  RailroadDiagram,
  RailroadNode,
  TreemapDiagram,
  TreemapNode,
  TreemapSection,
  TreemapLeaf,
  TreemapClassDefStatement,
  TreemapTitleStatement,
  TreemapAccTitleStatement,
  TreemapAccDescrStatement,
  TreemapAccDescrBlockStatement,
  RadarDiagram,
  RadarNode,
  ArchitectureDiagram,
  ArchitectureNode,
  PacketDiagram,
  PacketNode,
  InfoDiagram,
  InfoNode,
  GitgraphDiagram,
  GitgraphNode,
  PieDiagram,
  PieNode,
  UsecaseDiagram,
  UsecaseNode,
  AgentflowDiagram,
  AgentflowNode,
  Comment,
  DiagramType,
  Directive,
  ErrorDiagram,
  Frontmatter,
  Identifier,
  Node,
  NumericLiteral,
  Root,
  StringLiteral,
  Token,
  ClassDiagram,
  ClassNode,
  FlowchartDiagram,
  FlowchartNode,
  SequenceDiagram,
  SequenceNode,
  StateDiagram,
  StateNode,
  ErDiagram,
  ErNode,
  GanttDiagram,
  GanttNode,
  JourneyDiagram,
  JourneyNode,
  RequirementDiagram,
  RequirementNode,
  MindmapDiagram,
  MindmapTreeNode,
  TimelineDiagram,
  TimelineNode,
  SankeyDiagram,
  SankeyNode,
  XychartDiagram,
  XychartNode,
  QuadrantDiagram,
  QuadrantNode,
  BlockDiagram,
  BlockTreeNode,
  KanbanDiagram,
  KanbanNode,
  KanbanTreeNode,
  C4Diagram,
  C4Node,
  VennDiagram,
  VennNode,
  IshikawaDiagram,
  IshikawaTreeNode,
} from "@mmd-toolkit/ast"
import { readdirSync } from "node:fs"
import { describe, expect, expectTypeOf, it } from "vitest"
import { KNOWN_DIVERGENCES } from "@mmd-toolkit/tests"
import { ParseError } from "../src/errors.ts"

// The checks on types run in the type checker (`tsc` covers tests/); the
// runtime assertions make vitest register the file.

describe("the types of ast.md", () => {
  it("has the root, the ErrorDiagram, the shared leaf nodes, and the nodes of each diagram type as its nodes", () => {
    expectTypeOf<Node["type"]>().toEqualTypeOf<
      | "Root"
      | "ErrorDiagram"
      | "Identifier"
      | "StringLiteral"
      | "NumericLiteral"
      | FlowchartNode["type"]
      | SequenceNode["type"]
      | ClassNode["type"]
      | StateNode["type"]
      | ErNode["type"]
      | GanttNode["type"]
      | JourneyNode["type"]
      | RequirementNode["type"]
      | MindmapTreeNode["type"]
      | TimelineNode["type"]
      | SankeyNode["type"]
      | XychartNode["type"]
      | QuadrantNode["type"]
      | BlockTreeNode["type"]
      | KanbanTreeNode["type"]
      | C4Node["type"]
      | VennNode["type"]
      | IshikawaTreeNode["type"]
      | AgentflowNode["type"]
      | UsecaseNode["type"]
      | PieNode["type"]
      | GitgraphNode["type"]
      | InfoNode["type"]
      | PacketNode["type"]
      | ArchitectureNode["type"]
      | RadarNode["type"]
      | TreemapNode["type"]
      | RailroadNode["type"]
      | WardleyNode["type"]
      | CynefinNode["type"]
      | EventmodelingNode["type"]
      | TreeviewTreeNode["type"]
    >()
    expectTypeOf<Root["body"]>().toEqualTypeOf<
      | ErrorDiagram
      | FlowchartDiagram
      | SequenceDiagram
      | ClassDiagram
      | StateDiagram
      | ErDiagram
      | GanttDiagram
      | JourneyDiagram
      | RequirementDiagram
      | MindmapDiagram
      | TimelineDiagram
      | SankeyDiagram
      | XychartDiagram
      | QuadrantDiagram
      | BlockDiagram
      | KanbanDiagram
      | C4Diagram
      | VennDiagram
      | IshikawaDiagram
      | AgentflowDiagram
      | UsecaseDiagram
      | PieDiagram
      | GitgraphDiagram
      | InfoDiagram
      | PacketDiagram
      | ArchitectureDiagram
      | RadarDiagram
      | TreemapDiagram
      | RailroadDiagram
      | WardleyDiagram
      | CynefinDiagram
      | EventmodelingDiagram
      | TreeviewDiagram
    >()
  })

  it("has no generic list of children on any node, and no fields on ErrorDiagram", () => {
    expectTypeOf<keyof Root>().toEqualTypeOf<
      | "type"
      | "diagramType"
      | "body"
      | "frontmatter"
      | "comments"
      | "directives"
      | "tokens"
      | "range"
      | "loc"
    >()
    expectTypeOf<keyof ErrorDiagram>().toEqualTypeOf<"type" | "range" | "loc">()
  })

  it("gives treeview, treemap and kanban their specified hierarchy and gap fields", () => {
    expectTypeOf<TreeviewNode["textBefore"]>().toEqualTypeOf<
      readonly TreeviewIgnoredText[]
    >()
    expectTypeOf<TreeviewNode["children"]>().toEqualTypeOf<
      readonly TreeviewNode[]
    >()
    expectTypeOf<TreemapSection["children"]>().toEqualTypeOf<
      readonly (TreemapSection | TreemapLeaf)[]
    >()
    expectTypeOf<TreemapSection["statementsBefore"]>().toEqualTypeOf<
      readonly (
        | TreemapClassDefStatement
        | TreemapTitleStatement
        | TreemapAccTitleStatement
        | TreemapAccDescrStatement
        | TreemapAccDescrBlockStatement
      )[]
    >()
    expectTypeOf<TreemapLeaf["statementsBefore"]>().toEqualTypeOf<
      TreemapSection["statementsBefore"]
    >()
    expectTypeOf<TreemapLeaf>().not.toHaveProperty("children")
    expectTypeOf<KanbanNode["children"]>().toEqualTypeOf<
      readonly KanbanNode[]
    >()
  })

  it("lists tokens, comments, directives, and the frontmatter on the root", () => {
    expectTypeOf<Root["tokens"]>().toEqualTypeOf<readonly Token[]>()
    expectTypeOf<Root["comments"]>().toEqualTypeOf<readonly Comment[]>()
    expectTypeOf<Root["directives"]>().toEqualTypeOf<readonly Directive[]>()
    expectTypeOf<Root["frontmatter"]>().toEqualTypeOf<Frontmatter | null>()
  })

  it("gives the shared leaf nodes their fields, and the two literals their source text", () => {
    expectTypeOf<keyof Identifier>().toEqualTypeOf<
      "type" | "name" | "range" | "loc"
    >()
    expectTypeOf<keyof StringLiteral>().toEqualTypeOf<
      "type" | "value" | "raw" | "closed" | "range" | "loc"
    >()
    expectTypeOf<keyof NumericLiteral>().toEqualTypeOf<
      "type" | "value" | "raw" | "range" | "loc"
    >()
    expectTypeOf<StringLiteral["raw"]>().toEqualTypeOf<string>()
    expectTypeOf<NumericLiteral["raw"]>().toEqualTypeOf<string>()
  })

  it("gives a token its kind, its source text, and its place", () => {
    expectTypeOf<keyof Token>().toEqualTypeOf<
      "type" | "value" | "range" | "loc"
    >()
    expectTypeOf<Token["type"]>().toEqualTypeOf<
      | "Keyword"
      | "Identifier"
      | "Numeric"
      | "String"
      | "StringFragment"
      | "RawText"
      | "Punctuator"
      | "IgnoredSemicolon"
      | "Directive"
    >()
  })

  it("keeps the text of comments, directives, and the frontmatter in the source only", () => {
    expectTypeOf<keyof Comment>().toEqualTypeOf<
      "type" | "mark" | "value" | "range" | "loc"
    >()
    expectTypeOf<Comment["mark"]>().toEqualTypeOf<
      "%%" | "#" | "%" | "/*" | "//" | "(*" | ";" | null
    >()
    expectTypeOf<keyof Directive>().toEqualTypeOf<
      "type" | "name" | "value" | "closed" | "range" | "loc"
    >()
    expectTypeOf<keyof Frontmatter>().toEqualTypeOf<
      "type" | "value" | "valueRange" | "range" | "loc"
    >()
  })
})

describe("DiagramType", () => {
  it("is the type of Root.diagramType", () => {
    expectTypeOf<Root["diagramType"]>().toEqualTypeOf<DiagramType>()
  })

  it("includes the error pseudo-diagram and excludes `---`", () => {
    const accepted: DiagramType[] = ["error", "flowchart-v2", "swimlane"]
    // @ts-expect-error `---` is detected but always rejected, so no Root has
    // it.
    const rejected: DiagramType = "---"
    // @ts-expect-error `flowchart` is a header keyword, not a diagram type id.
    const keyword: DiagramType = "flowchart"
    expect([accepted, rejected, keyword]).toHaveLength(3)
  })
})

/**
 * Every DiagramType, in the order of ast.md. Being a `Record` over the type,
 * this fails to type-check when an id is missing here or is not in the type.
 */
export const allDiagramTypes: Record<DiagramType, true> = {
  error: true,
  "flowchart-elk": true,
  mindmap: true,
  architecture: true,
  agentflow: true,
  c4: true,
  kanban: true,
  classDiagram: true,
  er: true,
  gantt: true,
  info: true,
  pie: true,
  requirement: true,
  sequence: true,
  swimlane: true,
  "flowchart-v2": true,
  timeline: true,
  gitGraph: true,
  stateDiagram: true,
  journey: true,
  quadrantChart: true,
  sankey: true,
  packet: true,
  xychart: true,
  block: true,
  eventmodeling: true,
  treeView: true,
  radar: true,
  ishikawa: true,
  treemap: true,
  railroad: true,
  railroadEbnf: true,
  railroadAbnf: true,
  railroadPeg: true,
  venn: true,
  wardley: true,
  cynefin: true,
  usecase: true,
}

describe("the list of diagram types", () => {
  it("has the 38 ids of ast.md", () => {
    expect(Object.keys(allDiagramTypes)).toHaveLength(38)
  })
})

/**
 * known-divergences/: the identifiers of the known divergences that the
 * specification defines, one document `<identifier>.md` each, next to its
 * Japanese version `<identifier>.ja.md`.
 */
function definedDivergences(): string[] {
  return readdirSync(
    new URL("../../spec/docs/known-divergences/", import.meta.url),
  )
    .filter((name) => name.endsWith(".md") && !name.endsWith(".ja.md"))
    .map((name) => name.slice(0, -".md".length))
}

describe("known divergences", () => {
  it("are those that known-divergences/ defines, as @mmd-toolkit/tests lists them", () => {
    expect([...KNOWN_DIVERGENCES].sort()).toEqual(definedDivergences().sort())
  })

  it("are not named by a ParseError", () => {
    expectTypeOf<ParseError>().not.toHaveProperty("knownDivergence")
    expect(
      Object.keys(
        new ParseError("m", [0, 0], {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 0 },
        }),
      ).sort(),
    ).toEqual(["index", "loc", "name", "range"])
  })
})

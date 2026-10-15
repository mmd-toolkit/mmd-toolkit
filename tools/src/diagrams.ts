import type { DiagramType } from "../../packages/tests/src/index.ts"

/**
 * For each fixture directory, the mermaid diagram ids whose inputs belong in
 * it, or `"any"`.
 *
 * An accepted fixture must be detected as one of these ids.
 */
export const diagramIds: Readonly<
  Record<DiagramType, readonly string[] | "any">
> = {
  // Syntax shared by all diagram types (frontmatter, directives, comments,
  // detection, the `error` pseudo diagram), shown with any diagram type.
  common: "any",
  // `swimlane-beta` and `flowchart-elk` use the flowchart parser and Db.
  flowchart: ["flowchart-v2", "flowchart-elk", "swimlane"],
  sequence: ["sequence"],
  // `classDiagram` and `classDiagram-v2` are both detected as `classDiagram`.
  class: ["classDiagram"],
  // `stateDiagram` and `stateDiagram-v2` are both detected as `stateDiagram`.
  state: ["stateDiagram"],
  er: ["er"],
  gantt: ["gantt"],
  journey: ["journey"],
  requirement: ["requirement"],
  mindmap: ["mindmap"],
  timeline: ["timeline"],
  sankey: ["sankey"],
  xychart: ["xychart"],
}

/**
 * Returns whether an input mermaid detects as `id` belongs in `diagram`.
 */
export function belongsIn(diagram: DiagramType, id: string): boolean {
  const ids = diagramIds[diagram]
  return ids === "any" || ids.includes(id)
}

/**
 * Returns whether `value` names a fixture directory.
 */
export function isDiagramType(value: string): value is DiagramType {
  return Object.hasOwn(diagramIds, value)
}

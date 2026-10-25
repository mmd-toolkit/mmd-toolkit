import { describe, expect, it } from "vitest"
import { belongsIn, isDiagramType } from "../../../tools/src/diagrams.ts"

describe("belongsIn", () => {
  it("takes the packet id shared by both header spellings", () => {
    expect(isDiagramType("packet")).toBe(true)
    expect(belongsIn("packet", "packet")).toBe(true)
    expect(belongsIn("packet", "packet-beta")).toBe(false)
    expect(belongsIn("packet", "info")).toBe(false)
  })

  it("takes only the info detector id", () => {
    expect(isDiagramType("info")).toBe(true)
    expect(belongsIn("info", "info")).toBe(true)
    expect(belongsIn("info", "Info")).toBe(false)
    expect(belongsIn("info", "pie")).toBe(false)
  })

  it("takes only the gitGraph detector id", () => {
    expect(isDiagramType("gitgraph")).toBe(true)
    expect(belongsIn("gitgraph", "gitGraph")).toBe(true)
    expect(belongsIn("gitgraph", "gitgraph")).toBe(false)
    expect(belongsIn("gitgraph", "pie")).toBe(false)
  })

  it("takes only the usecase detector id for the beta header", () => {
    expect(isDiagramType("usecase")).toBe(true)
    expect(belongsIn("usecase", "usecase")).toBe(true)
    expect(belongsIn("usecase", "usecase-beta")).toBe(false)
    expect(belongsIn("usecase", "agentflow")).toBe(false)
  })

  it("takes the agentflow detector id for the beta header", () => {
    expect(isDiagramType("agentflow")).toBe(true)
    expect(belongsIn("agentflow", "agentflow")).toBe(true)
    expect(belongsIn("agentflow", "agentflow-beta")).toBe(false)
    expect(belongsIn("agentflow", "flowchart-v2")).toBe(false)
  })

  it("takes any diagram id in common/, which shows its syntax with any diagram type", () => {
    for (const id of ["flowchart-v2", "sequence", "pie", "error", "unknown"]) {
      expect(belongsIn("common", id)).toBe(true)
    }
  })

  it("takes the ids of the flowchart parser in flowchart/", () => {
    expect(belongsIn("flowchart", "flowchart-v2")).toBe(true)
    expect(belongsIn("flowchart", "flowchart-elk")).toBe(true)
    expect(belongsIn("flowchart", "swimlane")).toBe(true)
  })

  it("matches a whole id, not a prefix of one", () => {
    expect(belongsIn("flowchart", "flowchart")).toBe(false)
    expect(belongsIn("flowchart", "flowchart-v2-extra")).toBe(false)
  })

  it("takes only sequence in sequence/", () => {
    expect(belongsIn("sequence", "sequence")).toBe(true)
    expect(belongsIn("sequence", "flowchart-v2")).toBe(false)
  })

  it("takes the shared ishikawa id for both header spellings", () => {
    expect(isDiagramType("ishikawa")).toBe(true)
    expect(belongsIn("ishikawa", "ishikawa")).toBe(true)
    expect(belongsIn("ishikawa", "ishikawa-beta")).toBe(false)
    expect(belongsIn("ishikawa", "venn")).toBe(false)
  })

  it("takes classDiagram in class/, the id both classDiagram and classDiagram-v2 are detected as", () => {
    expect(belongsIn("class", "classDiagram")).toBe(true)
    expect(belongsIn("class", "classDiagram-v2")).toBe(false)
    expect(belongsIn("class", "class")).toBe(false)
  })

  it("takes stateDiagram in state/, the id both stateDiagram and stateDiagram-v2 are detected as", () => {
    expect(belongsIn("state", "stateDiagram")).toBe(true)
    expect(belongsIn("state", "stateDiagram-v2")).toBe(false)
    expect(belongsIn("state", "state")).toBe(false)
  })

  it("keeps the ids of another diagram type out of each directory", () => {
    expect(belongsIn("flowchart", "sequence")).toBe(false)
    expect(belongsIn("class", "stateDiagram")).toBe(false)
    expect(belongsIn("state", "classDiagram")).toBe(false)
    expect(belongsIn("sequence", "pie")).toBe(false)
    expect(belongsIn("class", "pie")).toBe(false)
  })
})

describe("isDiagramType", () => {
  it("accepts the names of the fixture directories", () => {
    for (const name of ["common", "flowchart", "sequence", "class", "state"]) {
      expect(isDiagramType(name)).toBe(true)
    }
  })

  it("rejects other names, in other case too", () => {
    expect(isDiagramType("other")).toBe(false)
    expect(isDiagramType("")).toBe(false)
    expect(isDiagramType("Flowchart")).toBe(false)
    expect(isDiagramType("flowchart-v2")).toBe(false)
  })

  it("rejects the names that every object has", () => {
    for (const name of ["toString", "constructor", "__proto__"]) {
      expect(isDiagramType(name)).toBe(false)
    }
  })
})

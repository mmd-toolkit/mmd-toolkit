import { describe, expect, it } from "vitest"
import { exampleGroups } from "../src/examples.ts"
import { parseSource } from "../src/engine.ts"
import { formatSource } from "../src/formatter.ts"

describe("official samples for implemented diagrams", () => {
  it.each([
    ["Flowchart", "flowchart-v2"],
    ["Sequence", "sequence"],
    ["Class", "classDiagram"],
    ["State", "stateDiagram"],
    ["Entity Relationship", "er"],
    ["Gantt", "gantt"],
  ])("parses and formats the %s examples", async (name, diagramType) => {
    const group = exampleGroups.find((family) => family.name === name)!
    for (const example of group.examples) {
      expect(parseSource(example.source).diagramType, example.name).toBe(
        diagramType,
      )
      const options = { tabWidth: 2, useTabs: false }
      const formatted = await formatSource(example.source, options)
      expect(parseSource(formatted).diagramType, example.name).toBe(diagramType)
      expect(await formatSource(formatted, options), example.name).toBe(
        formatted,
      )
    }
  })
})

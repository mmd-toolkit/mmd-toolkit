import { describe, expect, it } from "vitest"
import {
  dataBlockEffectsOf,
  recordDataBlockEffect,
  recordDataBlockProblem,
} from "../src/normalizers/data-blocks.ts"
import { patchFlowDb } from "../src/normalizers/flowchart.ts"

describe("data block recording", () => {
  it("returns the effects of a Db in the order they were recorded", () => {
    const db = {}
    recordDataBlockEffect(db, { id: "A", set: { type: "rect" } })
    recordDataBlockEffect(db, { id: "B", set: {} })
    expect(dataBlockEffectsOf(db)).toEqual([
      { id: "A", set: { type: "rect" } },
      { id: "B", set: {} },
    ])
    expect(dataBlockEffectsOf({})).toEqual([])
  })

  it("throws the first problem recorded for a Db", () => {
    const db = {}
    recordDataBlockEffect(db, { id: "A", set: {} })
    recordDataBlockProblem(db, "the block after A: it created vertex X")
    recordDataBlockProblem(db, "a later problem")
    expect(() => dataBlockEffectsOf(db)).toThrow(
      "cannot record data block effects: the block after A: it created vertex X",
    )
  })
})

/**
 * A stand-in for mermaid's `FlowDB` with the members `patchFlowDb` uses, and
 * vertices with the fields the summary reads (`styles` is always there). A
 * call without a data block creates the vertex; a call with one runs
 * `onBlock`, which each test sets to the change it needs.
 */
class FakeFlowDb {
  public vertices = new Map<string, Record<string, unknown>>()

  public edges: Record<string, unknown>[] = []

  public subGraphs: Record<string, unknown>[] = []

  public onBlock: (db: FakeFlowDb) => void = () => undefined

  public getVertices(): Map<string, Record<string, unknown>> {
    return this.vertices
  }

  public getEdges(): Record<string, unknown>[] {
    return this.edges
  }

  public getSubGraphs(): Record<string, unknown>[] {
    return this.subGraphs
  }

  public setLink(): void {
    // Not used here; patchFlowDb requires it.
  }

  public setClickFun(): void {
    // Not used here; patchFlowDb requires it.
  }

  public addVertex(id: string, ...rest: unknown[]): void {
    if (rest[6] === undefined) {
      this.vertices.set(id, { id, text: id, styles: [] })
      return
    }
    this.onBlock(this)
  }
}

patchFlowDb(FakeFlowDb.prototype)

describe("patchFlowDb", () => {
  /**
   * Runs `A` and then a data block after `A` with the given effect, and
   * returns the Db.
   */
  function withBlock(onBlock: (db: FakeFlowDb) => void): FakeFlowDb {
    const db = new FakeFlowDb()
    db.addVertex("A")
    db.addVertex("B")
    db.onBlock = onBlock
    db.addVertex("A", ...Array.from({ length: 6 }), "shape: rect")
    return db
  }

  it("records the fields one block changed on one element", () => {
    const db = withBlock((flow) => {
      const vertex = flow.vertices.get("A")
      if (vertex) vertex.type = "rect"
    })
    expect(dataBlockEffectsOf(db)).toEqual([{ id: "A", set: { type: "rect" } }])
  })

  it.each([
    [
      "creates an element",
      (flow: FakeFlowDb) => flow.vertices.set("X", { id: "X", styles: [] }),
      "it created vertex X",
    ],
    [
      "changes two elements",
      (flow: FakeFlowDb) => {
        for (const vertex of flow.vertices.values()) vertex.type = "rect"
      },
      "it changed vertex A, vertex B",
    ],
    [
      "removes a field",
      (flow: FakeFlowDb) => {
        delete flow.vertices.get("A")?.text
      },
      "it removed vertex A.text",
    ],
    [
      "removes an element",
      (flow: FakeFlowDb) => flow.vertices.delete("A"),
      "it removed vertex A",
    ],
  ])("fails when a block %s", (_case, onBlock, problem) => {
    const db = withBlock(onBlock)
    expect(() => dataBlockEffectsOf(db)).toThrow(
      `cannot record data block effects: the block after A: ${problem}`,
    )
  })
})

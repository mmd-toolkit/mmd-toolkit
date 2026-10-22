import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeUsecase } from "../src/normalizers/usecase.ts"

/** A corpus input and its recorded result, without inventing another text. */
async function fixtureNamed(name: string) {
  const fixture = (await loadFixtures("usecase")).find(
    (candidate) => candidate.name === name,
  )
  if (fixture === undefined) throw new Error(`missing usecase/${name}`)
  return fixture
}

describe("usecase summary", () => {
  it("keeps model fields and omits layout, AST and generated ids", async () => {
    const fixture = await fixtureNamed("db-all-fields")
    const { outcome, embedded } = await runMermaidWithEmbeddedData(
      fixture.input,
    )
    if (
      !outcome.accepted ||
      outcome.db === null ||
      !fixture.expected.accepted
    ) {
      throw new Error("expected a summarized usecase")
    }
    expect(outcome.diagramType).toBe("usecase")
    expect(outcome.db).toEqual(fixture.expected.db)
    expect(Object.keys(outcome.db)).toEqual([
      "direction",
      "title",
      "accTitle",
      "accDescr",
      "actors",
      "useCases",
      "systemBoundaries",
      "relationships",
      "notes",
      "jsonNodes",
      "classDefs",
    ])
    expect(outcome.db.actors).toMatchObject([
      { id: "Clerk", type: "hollow", business: true, stereotype: "Employee" },
      { id: "Icon", type: "icon", icon: "fa:user" },
    ])
    expect(outcome.db.systemBoundaries).toEqual([
      {
        id: "Shop",
        label: "Order system",
        labelType: "text",
        type: "package",
        classes: ["group", "data"],
        styles: ["stroke:purple"],
      },
    ])
    expect(outcome.db.relationships).toMatchObject([
      { id: "opens", minlen: 2, animate: true, animation: "slow" },
      { id: "includes", type: "include", arrowType: 0 },
      { source: "Checkout", target: "Payload", type: "association" },
    ])
    expect(outcome.db.notes).toEqual([
      { target: "Checkout", label: "Remember", labelType: "text" },
    ])
    expect(embedded?.dataBlockEffects).toEqual([
      {
        id: "Payload",
        set: {
          value: {
            "2": "second",
            "1": "first",
            "a/b": { "~key": true },
            items: [{}, null],
          },
          propertyOrder: {
            "": ["2", "1", "a/b", "items"],
            "/a~1b": ["~key"],
            "/items/0": [],
          },
        },
      },
    ])
  })

  it("does not observe internal counters, ids, AST, config or layout getters", () => {
    const db = {
      getDirection: () => "LR",
      getDiagramTitle: () => "",
      getAccTitle: () => "",
      getAccDescription: () => "",
      getActors: () => new Map(),
      getUseCases: () => new Map(),
      getSystemBoundaries: () =>
        new Map([
          [
            "S",
            {
              id: "S",
              label: "System",
              labelType: "text",
              type: "rect",
              members: ["A"],
              classes: [],
              styles: [],
            },
          ],
        ]),
      getRelationships: () => [
        {
          id: "edge-42",
          explicitId: false,
          source: "A",
          target: "B",
          type: "association",
          arrowType: 0,
          minlen: 1,
          classes: [],
          styles: [],
          animate: false,
        },
      ],
      getNotes: () =>
        new Map([
          [
            "note-42",
            { id: "note-42", target: "A", label: "Note", labelType: "text" },
          ],
        ]),
      getJsonNodes: () => new Map(),
      getClassDefs: () => new Map(),
      getAST: () => {
        throw new Error("AST is not a summary source")
      },
      getData: () => {
        throw new Error("layout is not a summary source")
      },
      getConfig: () => {
        throw new Error("drawing config is not a summary source")
      },
    }
    const first = normalizeUsecase(db)
    const second = normalizeUsecase({
      ...db,
      relationshipCounter: 999,
      noteCounter: 999,
      getRelationships: () =>
        db.getRelationships().map((edge) => ({ ...edge, id: "edge-999" })),
      getNotes: () =>
        new Map([
          [
            "note-999",
            { id: "note-999", target: "A", label: "Note", labelType: "text" },
          ],
        ]),
    })
    expect(second).toEqual(first)
    expect(first.relationships).toEqual([
      {
        source: "A",
        target: "B",
        type: "association",
        arrowType: 0,
        minlen: 1,
        classes: [],
        styles: [],
        animate: false,
      },
    ])
  })

  it("clears all records after another diagram was parsed", async () => {
    const full = await fixtureNamed("db-all-fields")
    const empty = await fixtureNamed("header-lf")
    await runMermaidWithEmbeddedData(full.input)
    expect((await runMermaidWithEmbeddedData(empty.input)).outcome).toEqual(
      empty.expected,
    )
    expect(
      (await runMermaidWithEmbeddedData(empty.input)).embedded
        ?.dataBlockEffects,
    ).toEqual([])
  })

  it("records JSON effects in authored order independently of Db map order", async () => {
    const fixture = await fixtureNamed("db-json-source-map-order")
    const { outcome, embedded } = await runMermaidWithEmbeddedData(
      fixture.input,
    )
    expect(outcome.accepted && outcome.db?.jsonNodes).toMatchObject([
      { id: "Second" },
      { id: "First" },
    ])
    expect(embedded?.dataBlockEffects).toEqual([
      {
        id: "First",
        set: { value: { "1": 1, "2": 2 }, propertyOrder: { "": ["2", "1"] } },
      },
      {
        id: "Second",
        set: { value: { b: true, a: null }, propertyOrder: { "": ["b", "a"] } },
      },
    ])
  })
})

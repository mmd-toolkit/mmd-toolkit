import { describe, expect, it } from "vitest"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeEr } from "../src/normalizers/er.ts"
import type { MermaidConfig } from "../src/types.ts"

/** Returns the summary mermaid gives `text` with `config`. */
async function summary(
  text: string,
  config: MermaidConfig = {},
): Promise<Record<string, unknown>> {
  const outcome = await runMermaid(text, { config })
  if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
  return outcome.db
}

/** The names of the fields of `value`, in alphabetical order. */
function fieldsOf(value: unknown): string[] {
  return Object.keys(value as object).sort()
}

/**
 * A diagram that has every kind of value the summary keeps: a frontmatter
 * title, the two accessibility texts, an alias, attributes with keys and a
 * comment, a class on an entity, a style, a relationship with a role, a class
 * definition with a `color` style, and a subgraph with a direction.
 */
const KEPT_FIELDS = `---
title: Shop
---
erDiagram
  accTitle: Shop title
  accDescr: Shop description
  CUSTOMER[Customer] {
    string name PK, UK "the name"
    int age
  }
  CUSTOMER:::c1 ||--o{ ORDER : places
  classDef c1 fill:#f00,color:#fff
  style ORDER stroke:blue
  subgraph S [Sales]
    direction LR
    CUSTOMER
  end
`

describe("the summary of an ER diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(fieldsOf(db)).toEqual([
      "accDescr",
      "accTitle",
      "classes",
      "direction",
      "entities",
      "relationships",
      "subGraphs",
      "title",
    ])
    expect(db).toEqual({
      direction: "TB",
      title: "Shop",
      accTitle: "Shop title",
      accDescr: "Shop description",
      entities: [
        {
          id: "entity-CUSTOMER-0",
          name: "CUSTOMER",
          alias: "Customer",
          attributes: [
            {
              type: "string",
              name: "name",
              keys: ["PK", "UK"],
              comment: "the name",
            },
            { type: "int", name: "age", keys: [], comment: "" },
          ],
          classes: ["c1"],
          cssStyles: [],
        },
        {
          id: "entity-ORDER-1",
          name: "ORDER",
          alias: "",
          attributes: [],
          classes: [],
          cssStyles: ["stroke:blue"],
        },
      ],
      relationships: [
        {
          entityA: "entity-CUSTOMER-0",
          roleA: "places",
          entityB: "entity-ORDER-1",
          cardA: "ZERO_OR_MORE",
          cardB: "ONLY_ONE",
          relType: "IDENTIFYING",
        },
      ],
      classes: [{ id: "c1", styles: ["fill:#f00", "color:#fff"] }],
      subGraphs: [
        {
          id: "S",
          title: "Sales",
          nodes: ["CUSTOMER"],
          classes: [],
          cssStyles: [],
          dir: "LR",
        },
      ],
    })
  })

  it("gives each object exactly the fields of the summary", async () => {
    const db = await summary(KEPT_FIELDS)
    const [entity] = db.entities as { attributes: unknown[] }[]
    expect(fieldsOf(entity)).toEqual([
      "alias",
      "attributes",
      "classes",
      "cssStyles",
      "id",
      "name",
    ])
    expect(fieldsOf(entity?.attributes[0])).toEqual([
      "comment",
      "keys",
      "name",
      "type",
    ])
    expect(fieldsOf((db.relationships as unknown[])[0])).toEqual([
      "cardA",
      "cardB",
      "entityA",
      "entityB",
      "relType",
      "roleA",
    ])
    expect(fieldsOf((db.classes as unknown[])[0])).toEqual(["id", "styles"])
    expect(fieldsOf((db.subGraphs as unknown[])[0])).toEqual([
      "classes",
      "cssStyles",
      "dir",
      "id",
      "nodes",
      "title",
    ])
  })

  it("leaves out `dir` of a subgraph whose body has no direction statement", async () => {
    const db = await summary("erDiagram\n  subgraph S\n    A\n  end\n")
    expect(fieldsOf((db.subGraphs as unknown[])[0])).toEqual([
      "classes",
      "cssStyles",
      "id",
      "nodes",
      "title",
    ])
  })

  it("drops what the renderer fills in or derives, also from a Db that getData() has changed", () => {
    // The Db as mermaid.js leaves it after `getData()`: it writes
    // `cssCompiledStyles` and `colorIndex` into the entities.
    const entities = new Map<string, object>([
      [
        "A",
        {
          id: "entity-A-0",
          label: "A",
          attributes: [{ type: "int", name: "id", keys: ["PK"], comment: "" }],
          alias: "a",
          shape: "erBox",
          look: "default",
          cssClasses: "default c1 c2",
          cssStyles: ["fill:red"],
          labelType: "markdown",
          cssCompiledStyles: ["fill:#f00", "color:#fff"],
          colorIndex: 0,
        },
      ],
    ])
    const classes = new Map<string, object>([
      [
        "c1",
        {
          id: "c1",
          styles: ["fill:#f00", "color:#fff"],
          textStyles: ["color:#fff"],
        },
      ],
    ])
    const db = {
      getDirection: () => "TB",
      getEntities: () => entities,
      getRelationships: () => [
        {
          entityA: "entity-A-0",
          roleA: "r",
          entityB: "S",
          relSpec: {
            cardA: "ZERO_OR_MORE",
            cardB: "ONLY_ONE",
            relType: "IDENTIFYING",
          },
        },
      ],
      getClasses: () => classes,
      getSubGraphs: () => [
        {
          id: "S",
          nodes: ["A"],
          title: "S",
          classes: [],
          cssStyles: [],
          dir: "LR",
          labelType: "markdown",
        },
      ],
      getDiagramTitle: () => "",
      getAccTitle: () => "",
      getAccDescription: () => "",
    }
    expect(normalizeEr(db)).toEqual({
      direction: "TB",
      title: "",
      accTitle: "",
      accDescr: "",
      entities: [
        {
          id: "entity-A-0",
          name: "A",
          alias: "a",
          attributes: [{ type: "int", name: "id", keys: ["PK"], comment: "" }],
          classes: ["c1", "c2"],
          cssStyles: ["fill:red"],
        },
      ],
      relationships: [
        {
          entityA: "entity-A-0",
          roleA: "r",
          entityB: "S",
          cardA: "ZERO_OR_MORE",
          cardB: "ONLY_ONE",
          relType: "IDENTIFYING",
        },
      ],
      classes: [{ id: "c1", styles: ["fill:#f00", "color:#fff"] }],
      subGraphs: [
        {
          id: "S",
          nodes: ["A"],
          title: "S",
          classes: [],
          cssStyles: [],
          dir: "LR",
        },
      ],
    })
  })

  it.each([
    ["shape", "an entity"],
    ["look", "an entity"],
    ["labelType", "an entity"],
    ["label", "an entity"],
    ["cssClasses", "an entity"],
    ["cssCompiledStyles", "an entity"],
    ["colorIndex", "an entity"],
    ["textStyles", "a class definition"],
    ["labelType", "a subgraph"],
  ])("has no `%s` in %s", async (field, owner) => {
    const db = await summary(KEPT_FIELDS)
    const objects =
      owner === "an entity"
        ? (db.entities as object[])
        : owner === "a class definition"
          ? (db.classes as object[])
          : (db.subGraphs as object[])
    expect(objects.length).toBeGreaterThan(0)
    for (const object of objects) expect(object).not.toHaveProperty(field)
  })

  it("keeps an entity that has the id of a subgraph, and refers to the subgraph by its id", async () => {
    const db = await summary(
      "erDiagram\n  subgraph S\n    A\n  end\n  S ||--o{ Z : r\n",
    )
    expect(
      (db.entities as { id: string; name: string }[]).map(
        ({ id, name }) => `${id} ${name}`,
      ),
    ).toEqual(["entity-A-0 A", "entity-S-1 S", "entity-Z-2 Z"])
    expect(
      (db.relationships as { entityA: string; entityB: string }[]).map(
        ({ entityA, entityB }) => [entityA, entityB],
      ),
    ).toEqual([["S", "entity-Z-2"]])
  })

  it("refers to an entity for the name of a subgraph that comes after the statement", async () => {
    const db = await summary(
      "erDiagram\n  S ||--o{ Z : r\n  subgraph S\n    A\n  end\n",
    )
    expect(
      (db.relationships as { entityA: string }[]).map(({ entityA }) => entityA),
    ).toEqual(["entity-S-0"])
  })

  it("does nothing for a class or a style of a name that is neither an entity nor a subgraph", async () => {
    const db = await summary(
      "erDiagram\n  A\n  class Z c\n  style Z fill:red\n  classDef c fill:red\n",
    )
    expect(db.entities).toEqual([
      {
        id: "entity-A-0",
        name: "A",
        alias: "",
        attributes: [],
        classes: [],
        cssStyles: [],
      },
    ])
    expect(db.subGraphs).toEqual([])
  })

  it("splits the styles of a class definition at commas and keeps the one with `color`", async () => {
    const db = await summary(
      "erDiagram\n  classDef c fill:#f00,color:#fff,stroke-width:2px\n",
    )
    expect(db.classes).toEqual([
      { id: "c", styles: ["fill:#f00", "color:#fff", "stroke-width:2px"] },
    ])
  })

  it("takes the title from the frontmatter only", async () => {
    const db = await summary("erDiagram\n  title My ER\n")
    expect(db.title).toBe("")
    expect((db.entities as { name: string }[]).map(({ name }) => name)).toEqual(
      ["title", "My", "ER"],
    )
  })

  it("does not carry the direction over to the next call", async () => {
    expect((await summary("erDiagram\n  direction LR\n  A\n")).direction).toBe(
      "LR",
    )
    expect((await summary("erDiagram\n  A\n")).direction).toBe("TB")
  })

  it("gives the same summary for the same text", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual(await summary(KEPT_FIELDS))
  })
})

describe("what the summary of an ER diagram does not depend on", () => {
  /** The texts that mermaid.js passes through `sanitizeText`, and one that it does not. */
  const TEXTS =
    '---\ntitle: a<b>=c<br>d\n---\nerDiagram\n  accTitle: a<b>=c<br>d\n  accDescr: a<b>=c<br>d\n  "a<b>=c<br>d" ["a<b>=c<br>d"] {\n    int x PK "a<b>=c<br>d"\n  }\n  subgraph S ["a<b>=c<br>d"]\n    A\n  end\n'

  it.each(["strict", "loose", "antiscript", "sandbox"])(
    "is the same under securityLevel %s as without it",
    async (securityLevel) => {
      expect(await summary(TEXTS, { securityLevel })).toEqual(
        await summary(TEXTS),
      )
    },
  )

  it.each(["classic", "handDrawn", "neo"])(
    "is the same under look %s as without it",
    async (look) => {
      expect(await summary(KEPT_FIELDS, { look })).toEqual(
        await summary(KEPT_FIELDS),
      )
    },
  )

  it("changes only the title, accTitle, accDescr, and the subgraph title under another securityLevel", async () => {
    const written = await summary(TEXTS)
    const replaced = "a&lt;b&gt;&equals;c<br/>d"
    const other = await summary(TEXTS, { securityLevel: "other" })
    const [subGraph] = written.subGraphs as object[]
    expect(other).toEqual({
      ...written,
      title: replaced,
      accTitle: replaced,
      accDescr: replaced,
      subGraphs: [{ ...subGraph, title: replaced }],
    })
    expect(written.title).toBe("a<b>=c<br>d")
  })

  it("keeps the texts as written under another securityLevel when HTML labels are disabled", async () => {
    expect(
      await summary(TEXTS, { securityLevel: "other", htmlLabels: false }),
    ).toEqual(await summary(TEXTS))
  })
})

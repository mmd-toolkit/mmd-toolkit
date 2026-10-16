import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaid, runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import type { MermaidRun } from "../src/mermaid.ts"
import { dataBlockEffectsOf } from "../src/normalizers/data-blocks.ts"
import { normalizeKanban, patchKanbanDb } from "../src/normalizers/kanban.ts"
import type { JsonObject, MermaidConfig } from "../src/types.ts"

/** Runs the fixed input of a named kanban fixture with the given site settings. */
async function runFixture(
  name: string,
  config: MermaidConfig = {},
): Promise<MermaidRun> {
  const input = readFileSync(
    path.join(getFixturesRoot(), "kanban", name, "input.mmd"),
    "utf8",
  )
  return runMermaidWithEmbeddedData(input, { config })
}

/** The Db summary of a named, accepted kanban fixture. */
async function summary(
  name: string,
  config: MermaidConfig = {},
): Promise<JsonObject> {
  const { outcome: result } = await runFixture(name, config)
  if (!result.accepted || result.db === null) throw new Error("expected a Db")
  return result.db
}

const SECTION = { id: "S", label: "Todo", level: 1, isGroup: true }
const ITEM = {
  id: "A",
  label: "Changed",
  level: 3,
  isGroup: false,
  parentId: "S",
  ticket: "TASK-1",
  priority: "High",
  assigned: "Ada",
  icon: "star",
}

describe("the summary of a kanban diagram", () => {
  it("keeps every summary field and the values exposed for sections and items", async () => {
    expect(await summary("db-metadata-all")).toEqual({
      nodes: [{ ...SECTION, ticket: "COL-1" }, ITEM],
    })
  })

  it("drops drawing constants, layout, configuration, and unexposed section metadata", () => {
    const db = {
      getData: () => ({
        nodes: [
          {
            ...ITEM,
            shape: "kanbanItem",
            labelType: "markdown",
            rx: 5,
            ry: 5,
            cssStyles: ["text-align: left"],
            look: "neo",
            width: 900,
            padding: 80,
            x: 20,
          },
        ],
        edges: [],
        other: {},
        config: { theme: "dark" },
      }),
      getSections: () => [{ ...SECTION, assigned: "hidden", icon: "hidden" }],
    }
    expect(normalizeKanban(db)).toEqual({ nodes: [ITEM] })
  })

  it.each([
    ["id", "B"],
    ["label", "Other"],
    ["level", 7],
    ["isGroup", true],
    ["parentId", "T"],
    ["ticket", "TASK-2"],
    ["priority", 23],
    ["assigned", "Grace"],
    ["icon", "heart"],
  ])("observes a single changed %s field", (field, value) => {
    const node = { ...ITEM, [field]: value }
    expect(normalizeKanban({ getData: () => ({ nodes: [node] }) })).toEqual({
      nodes: [node],
    })
  })

  it("omits undefined metadata and keeps all finite JSON kinds of priority", () => {
    expect(
      normalizeKanban({
        getData: () => ({
          nodes: [
            { ...SECTION, ticket: undefined },
            { ...ITEM, priority: ["High", 23, { own: true }] },
          ],
        }),
      }),
    ).toEqual({
      nodes: [SECTION, { ...ITEM, priority: ["High", 23, { own: true }] }],
    })
  })

  it("keeps non-finite priorities as text, including nested values and own prototype keys", async () => {
    const scalar = (await summary("db-metadata-priority-non-finite"))
      .nodes as JsonObject[]
    expect(scalar.slice(1).map((node) => node.priority)).toEqual([
      "Infinity",
      "-Infinity",
      undefined,
    ])
    const nested = (await summary("db-metadata-priority-nested-non-finite"))
      .nodes as JsonObject[]
    expect(nested[1]?.priority).toEqual(["Infinity", "NaN", "-Infinity"])
    const own = (await summary("db-metadata-priority-own-prototype-key"))
      .nodes as JsonObject[]
    const priority = own[1]?.priority as JsonObject
    expect(Object.hasOwn(priority, "__proto__")).toBe(true)
    expect(priority.__proto__).toBe("NaN")
    expect(priority.constructor).toBe("Infinity")
  })

  it("refuses a cyclic priority rather than losing data or recursing forever", () => {
    const priority: Record<string, unknown> = {}
    priority.self = priority
    expect(() =>
      normalizeKanban({
        getData: () => ({ nodes: [{ ...ITEM, priority }] }),
      }),
    ).toThrow("cyclic priority")
  })

  it("keeps the depth in characters without building a hierarchy of items", async () => {
    expect(await summary("db-indent-deeper")).toEqual({
      nodes: [
        { id: "S", label: "S", level: 1, isGroup: true },
        { id: "A", label: "A", level: 3, isGroup: false, parentId: "S" },
        { id: "B", label: "B", level: 5, isGroup: false, parentId: "S" },
        { id: "C", label: "C", level: 3, isGroup: false, parentId: "S" },
      ],
    })
  })

  it("keeps repeated section ids and the complete item list repeated under each", async () => {
    const result = await summary("db-section-three-definitions")
    const nodes = result.nodes as JsonObject[]
    expect(nodes.map((node) => node.id)).toEqual([
      "S",
      "A",
      "C",
      "D",
      "T",
      "B",
      "S",
      "A",
      "C",
      "D",
      "S",
      "A",
      "C",
      "D",
    ])
    expect(
      nodes.filter((node) => node.isGroup).map((node) => node.label),
    ).toEqual(["First", "Other", "Second", "Third"])
  })

  it("keeps repeated item ids as separate entries with separate metadata", async () => {
    const result = await summary("db-metadata-repeated-id")
    expect(result.nodes).toEqual([
      { id: "S", label: "S", level: 1, isGroup: true },
      {
        id: "A",
        label: "A",
        level: 3,
        isGroup: false,
        parentId: "S",
        assigned: "Ada",
      },
      {
        id: "A",
        label: "A",
        level: 3,
        isGroup: false,
        parentId: "S",
        ticket: "TASK-1",
      },
    ])
  })

  it("starts over after success and after a partial parse rejected by the Db", async () => {
    await summary("db-metadata-all")
    const input = readFileSync(
      path.join(
        getFixturesRoot(),
        "kanban",
        "gram-indent-shallower-followed",
        "input.mmd",
      ),
      "utf8",
    )
    expect((await runMermaid(input)).accepted).toBe(false)
    expect(await summary("header-only-lf")).toEqual({ nodes: [] })
  })

  it("keeps prototype names without merging or indexing by them", async () => {
    const result = await summary("db-object-prototype-ids")
    expect((result.nodes as JsonObject[]).map((node) => node.id)).toEqual([
      "__proto__",
      "constructor",
      "toString",
      "hasOwnProperty",
      "__proto__",
    ])
  })

  it("is unchanged by supported security levels and drawing settings", async () => {
    const baseline = await summary("db-metadata-all")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("db-metadata-all", { securityLevel })).toEqual(
        baseline,
      )
    }
    expect(
      await summary("db-metadata-all", {
        theme: "dark",
        look: "neo",
        kanban: {
          ticketBaseUrl: "https://example.com/#TICKET#",
          padding: 40,
          sectionWidth: 900,
        },
        mindmap: { padding: 40, maxNodeWidth: 900 },
      }),
    ).toEqual(baseline)
  })

  it("records character replacement with an unsupported securityLevel, controlled by htmlLabels", async () => {
    const name = "config-security-level-other"
    const nodes = (await summary(name, { securityLevel: "other" }))
      .nodes as JsonObject[]
    expect(nodes.map((node) => node.label)).toEqual([
      "&lt;b&gt;S&lt;/b&gt;",
      "&lt;i&gt;A&lt;/i&gt;<br/>",
    ])
    expect(nodes[1]?.ticket).toBe("<u>T</u>")
    expect(
      await summary(name, { securityLevel: "other", htmlLabels: false }),
    ).toEqual(await summary(name))
  })
})

describe("kanban data block effects", () => {
  it("records section and item fields in block order without drawing fields", async () => {
    const result = await runFixture("db-metadata-all")
    expect(result.embedded?.dataBlockEffects).toEqual([
      { id: "S", set: { ticket: "COL-1" } },
      {
        id: "A",
        set: {
          label: "Changed",
          ticket: "TASK-1",
          priority: "High",
          assigned: "Ada",
          icon: "star",
        },
      },
    ])
  })

  it.each<[string, JsonObject]>([
    ["db-metadata-label-number", { label: "23" }],
    ["db-metadata-ticket-number", { ticket: "23" }],
    ["db-metadata-assigned-list", { assigned: "a,b" }],
    ["db-metadata-icon-true", { icon: "true" }],
    ["db-metadata-priority-list", { priority: ["a", "b"] }],
    [
      "db-metadata-priority-nested-non-finite",
      { priority: ["Infinity", "NaN", "-Infinity"] },
    ],
    ["db-metadata-ticket-false", {}],
    ["db-metadata-assigned-null", {}],
    ["db-metadata-icon-empty-string", {}],
    ["db-metadata-priority-zero", {}],
    ["db-metadata-label-false", {}],
    ["db-metadata-unknown-key", {}],
    ["db-metadata-assigned-upper-key", {}],
    ["db-metadata-shape-lower", {}],
    ["db-metadata-shape-known-other", {}],
    ["db-metadata-empty", {}],
    ["db-metadata-quoted-newline", { label: "first<br/>second" }],
    [
      "db-metadata-multiline",
      {
        label: "Work",
        ticket: "TASK-1",
        priority: "High",
        assigned: "Ada",
        icon: "star",
      },
    ],
  ])("records mermaid's effect for %s", async (name, set) => {
    expect((await runFixture(name)).embedded?.dataBlockEffects).toEqual([
      { id: "A", set },
    ])
  })

  it.each<[string, JsonObject]>([
    ["db-metadata-section-label", { label: "High" }],
    ["db-metadata-section-ticket", { ticket: "High" }],
    ["db-metadata-section-assigned", {}],
    ["db-metadata-section-priority", {}],
    ["db-metadata-section-icon", {}],
  ])("records only exposed column fields for %s", async (name, set) => {
    expect((await runFixture(name)).embedded?.dataBlockEffects).toEqual([
      { id: "S", set },
    ])
  })

  it("keeps separate effects for repeated item ids and clears them on the next parse", async () => {
    expect(
      (await runFixture("db-metadata-repeated-id")).embedded?.dataBlockEffects,
    ).toEqual([
      { id: "A", set: { assigned: "Ada" } },
      { id: "A", set: { ticket: "TASK-1" } },
    ])
    expect(
      (await runFixture("header-only-lf")).embedded?.dataBlockEffects,
    ).toEqual([])
  })

  it.each([
    "gram-metadata-label-duplicate",
    "gram-metadata-ticket-duplicate",
    "gram-metadata-assigned-duplicate",
    "gram-metadata-priority-duplicate",
    "gram-metadata-icon-duplicate",
    "gram-metadata-shape-duplicate",
    "gram-metadata-empty-multiline",
    "gram-metadata-shape-camel",
    "gram-metadata-shape-number",
  ])(
    "keeps the rejection of %s and starts the next recording afresh",
    async (name) => {
      await runFixture("db-metadata-all")
      const result = await runFixture(name)
      expect(result.outcome.accepted).toBe(false)
      expect(result.embedded).toBeUndefined()
      expect(
        (await runFixture("db-metadata-empty")).embedded?.dataBlockEffects,
      ).toEqual([{ id: "A", set: {} }])
    },
  )
})

/** A shared Db stand-in whose block can break the one-element recording rule. */
function fakeKanbanDb() {
  let nodes: KanbanTestNode[] = []
  const db = {
    onBlock: (_nodes: KanbanTestNode[]): void => undefined,
    getData: () => ({ nodes }),
    clear: (): void => {
      nodes = []
    },
    addNode: (
      _level: number,
      id: string,
      _label: string,
      _type: number,
      block?: string,
    ): void => {
      nodes.push(
        id === "S"
          ? { ...SECTION }
          : { ...ITEM, label: "Work", ticket: undefined },
      )
      if (block !== undefined) db.onBlock(nodes)
    },
    decorateNode: (decoration: { icon: string }): void => {
      const node = nodes.at(-1)
      if (node) node.icon = decoration.icon
    },
  }
  patchKanbanDb(db)
  return db
}

/** The fields the stand-in changes while recording a block. */
interface KanbanTestNode {
  id: string
  label: string
  level: number
  isGroup: boolean
  ticket?: string | undefined
  icon?: string
}

describe("patchKanbanDb", () => {
  it("replays decorations and records against the shared object, even when yy is a copy", () => {
    const db = fakeKanbanDb()
    db.clear()
    const yy = { ...db }
    yy.addNode(1, "S", "Todo", 0)
    yy.decorateNode({ icon: "first" })
    db.onBlock = (nodes) => {
      const node = nodes.at(-1)
      if (node) node.ticket = "TASK-1"
    }
    yy.addNode(3, "A", "Work", 0, "ticket: TASK-1")
    expect(db.getData().nodes[0]?.icon).toBe("first")
    expect(dataBlockEffectsOf(db)).toEqual([
      { id: "A", set: { ticket: "TASK-1" } },
    ])
    expect(dataBlockEffectsOf(yy)).toEqual([])
  })

  it("detects a block that breaks once and clears both its problem and earlier effects", () => {
    const db = fakeKanbanDb()
    let breakOnce = true
    db.onBlock = (nodes) => {
      const node = nodes.at(-1)
      if (node) node.ticket = "TASK-1"
      if (breakOnce && nodes.length > 1) {
        const section = nodes[0]
        if (section) section.label = "Broken"
        breakOnce = false
      }
    }
    db.clear()
    db.addNode(1, "S", "Todo", 0, "ticket: TASK-1")
    db.addNode(3, "A", "Work", 0, "ticket: TASK-1")
    expect(() => dataBlockEffectsOf(db)).toThrow(
      "cannot record data block effects: the block after A: it changed node 0, node 1",
    )
    db.clear()
    expect(dataBlockEffectsOf(db)).toEqual([])
    db.addNode(1, "S", "Todo", 0)
    db.addNode(3, "A", "Work", 0, "ticket: TASK-1")
    expect(dataBlockEffectsOf(db)).toEqual([
      { id: "A", set: { ticket: "TASK-1" } },
    ])
  })
})

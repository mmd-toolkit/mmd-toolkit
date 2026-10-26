import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeTreeview } from "../src/normalizers/treeview.ts"

describe("treeview summary", () => {
  it("omits generated identity, the fixed root and drawing state", () => {
    const db = {
      getRoot: () => ({
        id: 0,
        name: "/",
        nodeType: "directory",
        level: -1,
        children: [
          {
            id: 9,
            level: 17,
            name: "file",
            nodeType: "file",
            BBox: { x: 1, y: 2, width: 3, height: 4 },
            cssClass: "highlight",
            icon: "none",
            description: "description",
            children: [{ name: "", nodeType: "directory", children: [] }],
          },
        ],
      }),
      getDiagramTitle: () => "Undrawn title",
      getAccTitle: () => "Accessible",
      getAccDescription: () => "Description",
      getCount: () => 10,
      getConfig: () => ({ showIcons: true }),
    }
    expect(normalizeTreeview(db)).toEqual({
      accTitle: "Accessible",
      accDescr: "Description",
      nodes: [
        {
          name: "file",
          nodeType: "file",
          cssClass: "highlight",
          icon: "none",
          description: "description",
          children: [{ name: "", nodeType: "directory", children: [] }],
        },
      ],
    })
  })

  it("matches published annotations and resets after a preprocessing rejection", async () => {
    const fixtures = await loadFixtures("treeview")
    for (const name of [
      "db-all-fields",
      "box-mixed-reject",
      "db-icon-none",
      "common-repeat-empty",
      "config-security-level-other",
      "header-only",
    ]) {
      const fixture = fixtures.find((item) => item.name === name)!
      expect(fixture, name).toBeDefined()
      expect(
        await runMermaid(fixture.input, { config: fixture.config }),
        name,
      ).toEqual(fixture.expected)
    }
  })
})

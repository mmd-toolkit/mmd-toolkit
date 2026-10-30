import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeArchitecture } from "../src/normalizers/architecture.ts"
import type { MermaidConfig } from "../src/types.ts"

const fixtures = await loadFixtures("architecture")

/** A named architecture fixture. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing architecture/${name}`)
  return fixture
}

/** The summary of an accepted fixed input, under its site configuration and `config`. */
async function summary(name: string, config: MermaidConfig = {}) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, {
    config: { ...fixture.config, ...config },
  })
  if (!result.accepted)
    throw new Error(`expected accepted architecture/${name}`)
  return result.db
}

describe("architecture summary", () => {
  it("copies drawing inputs without retaining drawing state or deriving layout", () => {
    const node = {
      id: "api",
      type: "service" as const,
      edges: [],
      width: 99,
      height: 88,
    }
    const group = { id: "g", title: "Group", element: "drawing" }
    const edge = {
      lhsId: "api",
      lhsDir: "R",
      rhsId: "api",
      rhsDir: "L",
      id: "generated",
    }
    const db = {
      getNodes: () => [node],
      getGroups: () => [group],
      getEdges: () => [edge],
      getLayoutHints: () => [{ direction: "row", members: ["api", "other"] }],
      getAccTitle: () => "Access",
      getAccDescription: () => "Description",
      getDiagramTitle: () => "Not drawn",
      getDataStructures: () => {
        throw new Error("must not derive layout")
      },
    }
    expect(normalizeArchitecture(db)).toEqual({
      accTitle: "Access",
      accDescr: "Description",
      nodes: [{ id: "api", type: "service" }],
      groups: [{ id: "g", title: "Group" }],
      edges: [{ lhsId: "api", lhsDir: "R", rhsId: "api", rhsDir: "L" }],
      layoutHints: [{ direction: "row", members: ["api", "other"] }],
    })
  })

  it("keeps markup under every supported security level", async () => {
    const base = await summary("html-all-fields")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-all-fields", { securityLevel })).toEqual(base)
    }
  })

  it("resets publication after a semantic rejection", async () => {
    expect(
      (await runMermaid(named("error-edge-group-lhs").input)).accepted,
    ).toBe(false)
    const fixture = named("db-mixed")
    const outcome = await runMermaid(fixture.input)
    expect(outcome).toMatchObject({ accepted: true })
    if (outcome.accepted && fixture.expected.accepted)
      expect(outcome.db).toEqual(fixture.expected.db)
  })
})

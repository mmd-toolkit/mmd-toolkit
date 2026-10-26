import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeArchitecture } from "../src/normalizers/architecture.ts"

const fixtures = await loadFixtures("architecture")

/** A named architecture fixture. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing architecture/${name}`)
  return fixture
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

  it("matches every fixed fixture at its configured or standard security levels", async () => {
    for (const fixture of fixtures) {
      const levels =
        fixture.config?.securityLevel === undefined
          ? ["strict", "loose", "antiscript", "sandbox"]
          : [fixture.config.securityLevel]
      for (const securityLevel of levels) {
        const outcome = await runMermaid(fixture.input, {
          config: { ...fixture.config, securityLevel },
        })
        expect(outcome.accepted, `${fixture.name}: ${securityLevel}`).toBe(
          fixture.expected.accepted,
        )
        if (outcome.accepted && fixture.expected.accepted) {
          expect(outcome.db, `${fixture.name}: ${securityLevel}`).toEqual(
            fixture.expected.db,
          )
        }
      }
    }
  }, 30_000)

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

import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid, runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeCynefin } from "../src/normalizers/cynefin.ts"
import type { MermaidConfig } from "../src/types.ts"

const fixtures = await loadFixtures("cynefin")

/** The fixed Cynefin fixture with this name. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing cynefin/${name}`)
  return fixture
}

/** The summary of an accepted corpus input, under its site settings and `config`. */
async function summary(name: string, config: MermaidConfig = {}) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, {
    config: { ...fixture.config, ...config },
  })
  if (!result.accepted) throw new Error(`expected accepted cynefin/${name}`)
  return result.db
}

describe("Cynefin normalization", () => {
  it("keeps metadata, all items and transitions before layout", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "T",
      accTitle: "A",
      accDescr: "D\nE",
      domains: [
        { name: "complex", items: [{ label: "X" }, { label: "Y" }] },
        { name: "complicated", items: [{ label: "Q" }] },
        { name: "chaotic", items: [{ label: "Z" }] },
        { name: "clear", items: [{ label: "C" }] },
        {
          name: "confusion",
          items: [
            { label: "F" },
            { label: "G" },
            { label: "H" },
            { label: "I" },
          ],
        },
      ],
      transitions: [
        { from: "complex", to: "complicated", label: "Move" },
        { from: "chaotic", to: "clear" },
      ],
    })
  })

  it("keeps empty items and omits only unpublished transition labels", async () => {
    expect(await summary("db-empty-texts")).toMatchObject({
      domains: [
        {
          name: "complex",
          items: [{ label: "" }, { label: "" }, { label: " " }],
        },
      ],
      transitions: [
        { from: "complex", to: "clear" },
        { from: "clear", to: "chaotic" },
        { from: "chaotic", to: "confusion", label: " " },
      ],
    })
    expect(await summary("db-self-loops")).toMatchObject({
      domains: [],
      transitions: [{ from: "complex", to: "clear", label: "Kept" }],
    })
  })

  it("keeps lookup order and omits domains whose final item list is empty", async () => {
    expect(await summary("db-domain-duplicates")).toMatchObject({
      domains: [
        { name: "complex", items: [{ label: "Partner" }] },
        { name: "chaotic", items: [{ label: "Other" }] },
        { name: "clear", items: [{ label: "Third" }] },
      ],
    })
    expect(await summary("spec-cynefin-integration-d626b3bc")).toMatchObject({
      domains: [],
    })
    expect(await summary("db-domain-empty-last")).toMatchObject({ domains: [] })
    expect(await summary("gram-glued-domains")).toMatchObject({
      domains: [
        { name: "clear", items: [{ label: "A" }] },
        { name: "confusion", items: [{ label: "B" }] },
      ],
    })
    expect(await summary("db-domain-empty-first")).toMatchObject({
      domains: [
        { name: "complex", items: [{ label: "Last" }] },
        { name: "clear", items: [{ label: "Partner" }] },
      ],
    })
  })

  it("preserves the frontmatter title when the final body title is empty", async () => {
    const result = await runMermaidWithEmbeddedData(
      named("frontmatter-empty-body-title").input,
    )
    expect(result.outcome).toMatchObject({
      accepted: true,
      db: { title: "Front" },
    })
    expect(result.embedded?.title).toBe("Front")
  })

  it("copies values without reading drawing settings or mutating the Db", () => {
    const item = Object.freeze({ label: "A", x: 7 })
    const domain = Object.freeze({
      name: "clear",
      items: [item],
      colour: "red",
    })
    const transition = Object.freeze({
      from: "complex",
      to: "clear",
      id: "svg",
    })
    const domains = new Map<
      string,
      {
        readonly name: string
        readonly items: readonly { readonly label: string }[]
      }
    >([
      ["clear", domain],
      ["complex", Object.freeze({ name: "complex", items: [] })],
    ])
    const db = {
      getDiagramTitle: () => "",
      getAccTitle: () => "",
      getAccDescription: () => "",
      getDomains: () => domains,
      getTransitions: () => [transition],
      getConfig: () => {
        throw new Error("must not read drawing configuration")
      },
    }
    expect(normalizeCynefin(db)).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      domains: [{ name: "clear", items: [{ label: "A" }] }],
      transitions: [{ from: "complex", to: "clear" }],
    })
    expect([...domains.keys()]).toEqual(["clear", "complex"])
    expect(item.x).toBe(7)
    expect(transition.id).toBe("svg")
  })

  it("resets domain, transition and common state after a rejected parse", async () => {
    await summary("db-all-fields")
    expect((await runMermaid(named("error-after-prefix").input)).accepted).toBe(
      false,
    )
    expect(await summary("header-only")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      domains: [],
      transitions: [],
    })
  })

  it("keeps markup under every supported security level", async () => {
    const base = await summary("html-texts")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-texts", { securityLevel })).toEqual(base)
    }
  })
})

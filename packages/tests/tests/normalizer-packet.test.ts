import { describe, expect, it } from "vitest"
import { getFixturesRoot } from "../src/index.ts"
import { runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizePacket } from "../src/normalizers/packet.ts"
import type { MermaidConfig } from "../src/types.ts"
import { readFileSync } from "node:fs"
import path from "node:path"

/** Runs a named fixed packet input with its recorded site configuration. */
async function runFixture(name: string, overrides: MermaidConfig = {}) {
  const directory = path.join(getFixturesRoot(), "packet", name)
  const { config } = JSON.parse(
    readFileSync(path.join(directory, "expected.json"), "utf8"),
  ) as { config?: MermaidConfig }
  return runMermaidWithEmbeddedData(
    readFileSync(path.join(directory, "input.mmd"), "utf8"),
    { config: { ...config, ...overrides } },
  )
}

/** The summary of an accepted fixed packet input. */
async function summary(name: string, config: MermaidConfig = {}) {
  const { outcome } = await runFixture(name, config)
  if (!outcome.accepted || outcome.db === null) throw new Error("expected a Db")
  return outcome.db
}

describe("packet normalization", () => {
  it("keeps common fields, row order, block order and split endpoints", async () => {
    expect(await summary("db-all-fields")).toEqual({
      title: "T",
      accTitle: "A",
      accDescr: "D\nE",
      packet: [
        [
          { start: 0, end: 1, label: "two" },
          { start: 2, end: 2, label: "one" },
        ],
      ],
    })
    expect((await summary("db-row-split")).packet).toEqual([
      [
        { start: 0, end: 10, label: "first" },
        { start: 11, end: 31, label: "split" },
      ],
      [{ start: 32, end: 63, label: "split" }],
      [{ start: 64, end: 90, label: "split" }],
    ])
  })

  it("omits unused bits and drawing configuration without mutating the Db", () => {
    const packet = Object.freeze([
      Object.freeze([
        Object.freeze({ start: 0, end: 31, label: "A", bits: 31 }),
      ]),
    ])
    expect(
      normalizePacket({
        getPacket: () => packet,
        getDiagramTitle: () => "T",
        getAccTitle: () => "A",
        getAccDescription: () => "D",
        getConfig: () => {
          throw new Error("drawing configuration must not be read")
        },
      }),
    ).toEqual({
      title: "T",
      accTitle: "A",
      accDescr: "D",
      packet: [[{ start: 0, end: 31, label: "A" }]],
    })
    expect(packet[0][0].bits).toBe(31)
  })

  it("keeps empty labels, final empty common assignments and the frontmatter title", async () => {
    expect((await summary("db-label-empty-double")).packet).toEqual([
      [{ start: 0, end: 0, label: "" }],
    ])
    expect((await summary("title-repeat-empty")).title).toBe("")
    expect((await summary("frontmatter-empty-body-title")).title).toBe("Front")
    expect((await summary("acctitle-repeat-empty")).accTitle).toBe("")
    expect((await summary("accdescr-block-repeat")).accDescr).toBe("")
  })

  it("copies only published capped rows and uses text for a nonfinite endpoint", async () => {
    const capped = await summary("db-precision-rounded")
    expect((capped.packet as unknown[]).length).toBe(10_000)
    expect((capped.packet as unknown[]).at(-1)).toEqual([
      { start: 319968, end: 319999, label: "A" },
    ])
    expect((await summary("db-overflow-wide")).packet).toEqual([
      [{ start: 0, end: 1.7976931348623157e308, label: "A" }],
      [{ start: 1.7976931348623157e308, end: "Infinity", label: "A" }],
    ])
  })

  it("keeps row-width effects but drops drawing-only configuration", async () => {
    expect((await summary("config-rows-eight")).packet).toEqual([
      [{ start: 0, end: 7, label: "A" }],
      [{ start: 8, end: 15, label: "A" }],
    ])
    expect((await summary("config-drawing-only")).packet).toEqual([
      [{ start: 0, end: 15, label: "A" }],
    ])
  })

  it("rejects lexical recovery and semantic errors, then resets all published state", async () => {
    await summary("db-all-fields")
    for (const name of [
      "error-start",
      "error-recovered-block",
      "error-after-prefix",
      "error-overlap",
      "error-zero-after-valid",
      "config-fraction-reject",
    ]) {
      expect((await runFixture(name)).outcome.accepted, name).toBe(false)
    }
    expect(await summary("spec-packet-7426afc4")).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      packet: [],
    })
  })

  it("keeps markup under every supported security level", async () => {
    const base = await summary("html-all-fields")
    for (const securityLevel of ["strict", "loose", "antiscript", "sandbox"]) {
      expect(await summary("html-all-fields", { securityLevel })).toEqual(base)
    }
  })
})

import yaml from "js-yaml"
import { describe, expect, it } from "vitest"
import {
  configurationFrontmatter,
  copyConfiguration,
  recordConfiguration,
  restoreConfiguration,
} from "../src/configuration.ts"

const CONFIG = {
  positive: Infinity,
  negative: -Infinity,
  nan: Number.NaN,
  finite: 1.5,
  strings: ["Infinity", "-Infinity", "NaN"],
  nested: { values: [Infinity, -Infinity, Number.NaN, null, true] },
}

const RECORDED = {
  positive: { nonFinite: "Infinity" },
  negative: { nonFinite: "-Infinity" },
  nan: { nonFinite: "NaN" },
  finite: 1.5,
  strings: ["Infinity", "-Infinity", "NaN"],
  nested: {
    values: [
      { nonFinite: "Infinity" },
      { nonFinite: "-Infinity" },
      { nonFinite: "NaN" },
      null,
      true,
    ],
  },
}

describe("configuration numbers", () => {
  it("keeps numeric types while copying Mermaid's live configuration", () => {
    expect(copyConfiguration(CONFIG)).toEqual(CONFIG)
    expect(
      copyConfiguration({ ignored: undefined, callback: () => 1 }),
    ).toEqual({})
  })

  it("records numeric tags recursively and restores them after a JSON round trip", () => {
    expect(recordConfiguration(CONFIG)).toEqual(RECORDED)
    expect(restoreConfiguration(JSON.parse(JSON.stringify(RECORDED)))).toEqual(
      CONFIG,
    )
  })

  it("recognizes only the three exact one-field tags", () => {
    const config = {
      extra: { nonFinite: "Infinity", other: true },
      unknown: { nonFinite: "other" },
      numeric: { nonFinite: 1 },
    }
    expect(restoreConfiguration(config)).toEqual(config)
  })

  it("preserves own __proto__ properties through recording and restoration", () => {
    const config = JSON.parse('{"__proto__":{"nonFinite":"Infinity"}}')
    const restored = restoreConfiguration(config)
    expect(Object.hasOwn(restored, "__proto__")).toBe(true)
    expect(Object.getPrototypeOf(restored)).toBe(Object.prototype)
    expect(Object.getOwnPropertyDescriptor(restored, "__proto__")?.value).toBe(
      Infinity,
    )
    expect(recordConfiguration(restored)).toEqual(config)
  })
})

describe("configurationFrontmatter", () => {
  it("writes strings and finite numbers as YAML with their original types", () => {
    const config = { value: "Infinity", finite: 1.5 }
    const frontmatter = configurationFrontmatter(config, "Title")
    expect(yaml.load(frontmatter, { schema: yaml.JSON_SCHEMA })).toEqual({
      title: "Title",
      config,
    })
  })

  it("uses YAML numbers rather than null or a string for non-finite values", () => {
    const frontmatter = configurationFrontmatter(CONFIG, undefined)
    expect(yaml.load(frontmatter, { schema: yaml.JSON_SCHEMA })).toEqual({
      config: CONFIG,
    })
  })
})

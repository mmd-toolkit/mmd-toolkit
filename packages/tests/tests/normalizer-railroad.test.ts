import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { runMermaid, runMermaidWithEmbeddedData } from "../src/mermaid.ts"
import { normalizeRailroad } from "../src/normalizers/railroad.ts"

const fixtures = await loadFixtures("railroad")

/** The fixed railroad fixture with this name. */
function named(name: string) {
  const fixture = fixtures.find((item) => item.name === name)
  if (fixture === undefined) throw new Error(`missing railroad/${name}`)
  return fixture
}

/** Runs a corpus input with its site configuration. */
async function summary(name: string) {
  const fixture = named(name)
  const result = await runMermaid(fixture.input, { config: fixture.config })
  if (!result.accepted) throw new Error(`expected accepted railroad/${name}`)
  return result.db
}

describe("railroad normalization", () => {
  it("keeps accessibility metadata and all seven published expression kinds", async () => {
    expect(await summary("ir-db-all-fields")).toEqual({
      accTitle: "A",
      accDescr: "D\nE",
      rules: [
        {
          name: "r",
          definition: {
            type: "sequence",
            elements: [
              { type: "terminal", value: "a" },
              { type: "nonterminal", name: "ref" },
              {
                type: "choice",
                alternatives: [
                  { type: "special", text: "s" },
                  {
                    type: "optional",
                    element: { type: "terminal", value: "b" },
                  },
                ],
              },
              {
                type: "repetition",
                element: { type: "terminal", value: "c" },
                min: 0,
                max: "Infinity",
              },
              {
                type: "repetition",
                element: { type: "terminal", value: "d" },
                min: 1,
                max: "Infinity",
              },
            ],
          },
        },
      ],
    })
  })

  it("keeps ABNF bounds and numeric spellings, including an unused upper bound", async () => {
    expect(await summary("abnf-db-repeat-reversed")).toMatchObject({
      rules: [{ definition: { type: "repetition", min: 4, max: 2 } }],
    })
    expect(await summary("abnf-db-repeat-overflow")).toMatchObject({
      rules: [{ definition: { min: "Infinity", max: "Infinity" } }],
    })
    expect(await summary("abnf-db-repeat-max-overflow")).toMatchObject({
      rules: [{ definition: { min: 2, max: "Infinity" } }],
    })
    expect(await summary("abnf-db-repeat-optional")).toMatchObject({
      rules: [
        {
          definition: {
            type: "optional",
            element: { type: "terminal", value: "a" },
          },
        },
      ],
    })
    expect(await summary("abnf-numval-boundaries")).toMatchObject({
      rules: [
        {
          definition: {
            type: "choice",
            alternatives: [
              { type: "terminal", value: "%x41.42-43" },
              { type: "terminal", value: "%D65" },
              { type: "terminal", value: "%b2" },
              { type: "terminal", value: "%dAF" },
            ],
          },
        },
      ],
    })
  })

  it("uses each adapter's publication without reconstructing discarded structure", async () => {
    for (const name of [
      "ir-db-singletons",
      "ebnf-db-singletons",
      "abnf-db-singletons",
      "peg-db-singletons",
    ])
      expect(await summary(name), name).toMatchObject({
        rules: [{ name: "r", definition: { type: "terminal", value: "a" } }],
      })
    expect(await summary("peg-db-predicates")).toMatchObject({
      rules: [
        {
          definition: {
            type: "sequence",
            elements: [
              { type: "special", text: '&"a"' },
              { type: "special", text: "!ref" },
              { type: "special", text: "&." },
              { type: "special", text: "!(...)" },
              { type: "special", text: "&(...)" },
            ],
          },
        },
      ],
    })
    expect(await summary("ebnf-db-postfix-order")).toMatchObject({
      rules: [
        {
          definition: {
            type: "optional",
            element: {
              type: "sequence",
              elements: [
                {
                  type: "repetition",
                  min: 1,
                  max: "Infinity",
                  element: {
                    type: "repetition",
                    min: 0,
                    max: "Infinity",
                    element: {
                      type: "optional",
                      element: { type: "terminal", value: "a" },
                    },
                  },
                },
                { type: "terminal", value: "-" },
                { type: "terminal", value: "b" },
              ],
            },
          },
        },
      ],
    })
  })

  it("keeps every duplicate declaration, including an empty third definition", async () => {
    for (const name of [
      "ir-db-duplicates",
      "ebnf-db-duplicates",
      "abnf-db-duplicates",
      "peg-db-duplicates",
    ])
      expect(await summary(name), name).toMatchObject({
        rules: [
          { name: "r", definition: { type: "terminal", value: "first" } },
          { name: "other", definition: { type: "nonterminal", name: "r" } },
          { name: "r", definition: { type: "terminal", value: "second" } },
          { name: "r", definition: { type: "terminal", value: "" } },
        ],
      })
  })

  it("omits diagram titles while preserving embedded titles and accessibility values", async () => {
    for (const name of [
      "ir-frontmatter-empty-body-title",
      "ebnf-frontmatter-empty-body-title",
      "abnf-frontmatter-empty-body-title",
      "peg-frontmatter-empty-body-title",
    ]) {
      const fixture = named(name)
      const result = await runMermaidWithEmbeddedData(fixture.input, {
        config: fixture.config,
      })
      expect(result.outcome.accepted, name).toBe(true)
      if (!result.outcome.accepted) throw new Error(`expected accepted ${name}`)
      expect(result.outcome.db, name).not.toHaveProperty("title")
      expect(result.embedded?.title, name).toBe("Front")
    }
    expect(await summary("ir-common-repeat-empty")).toEqual({
      accTitle: "",
      accDescr: "",
      rules: [{ name: "r", definition: { type: "terminal", value: "a" } }],
    })
  })

  it("omits the title, duplicate index and unpublished fields without mutating the Db", () => {
    const expression = Object.freeze({
      type: "repetition",
      element: Object.freeze({ type: "terminal", value: "a" }),
      min: -0,
      max: Infinity,
      separator: { type: "terminal", value: "," },
    })
    const rule = Object.freeze({
      name: "r",
      definition: expression,
      comment: "unused",
    })
    const db = {
      getDiagramTitle: () => {
        throw new Error("must not read the diagram title")
      },
      getAccTitle: () => "",
      getAccDescription: () => "",
      getRules: () => Object.freeze([rule]),
      getRule: () => {
        throw new Error("must not read the duplicate index")
      },
      getConfig: () => {
        throw new Error("must not read drawing configuration")
      },
    }
    expect(normalizeRailroad(db)).toEqual({
      accTitle: "",
      accDescr: "",
      rules: [
        {
          name: "r",
          definition: {
            type: "repetition",
            element: { type: "terminal", value: "a" },
            min: 0,
            max: "Infinity",
          },
        },
      ],
    })
    expect(Object.is(expression.min, -0)).toBe(true)
    expect(expression.separator.value).toBe(",")
    expect(rule.comment).toBe("unused")
  })

  it("resets shared state across dialects and after rejected input", async () => {
    await summary("ir-db-all-fields")
    expect((await runMermaid(named("abnf-error-prefix").input)).accepted).toBe(
      false,
    )
    for (const name of [
      "peg-header-only",
      "abnf-header-only",
      "ebnf-header-only",
      "ir-header-only",
    ])
      expect(await summary(name)).toEqual({
        accTitle: "",
        accDescr: "",
        rules: [],
      })
  })

  it("matches every corpus result under its site configuration and standard security levels", async () => {
    for (const fixture of fixtures) {
      const levels =
        fixture.config?.securityLevel === undefined
          ? ["strict", "loose", "antiscript", "sandbox"]
          : [fixture.config.securityLevel]
      for (const securityLevel of levels) {
        const result = await runMermaid(fixture.input, {
          config: { ...fixture.config, securityLevel },
        })
        expect(result.accepted, `${fixture.name}: ${securityLevel}`).toBe(
          fixture.expected.accepted,
        )
        if (result.accepted && fixture.expected.accepted)
          expect(result.db, fixture.name).toEqual(fixture.expected.db)
      }
    }
  }, 60_000)
})

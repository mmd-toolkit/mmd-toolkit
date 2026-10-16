import { describe, expect, it } from "vitest"
import { runMermaid } from "../src/mermaid.ts"
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

/**
 * A diagram that has every kind of value the summary keeps: a frontmatter
 * title, the accessibility texts, a direction, a requirement and an element
 * with every field, a relationship, a style, and a class that is defined and
 * used (with a style that mentions a color, whose text style the summary
 * drops).
 */
const KEPT_FIELDS = `---
title: Plan
---
requirementDiagram
  accTitle: Plan title
  accDescr: Plan description
  direction LR
  functionalRequirement r1:::important {
    id: 1.1
    text: the text
    risk: high
    verifyMethod: test
  }
  element e1 {
    type: simulation
    docRef: path/to/doc
  }
  e1 - satisfies -> r1
  style r1 stroke:#333
  classDef important fill:#f9f,color:#fff
  class e1 important
`

/** The summary of `text` under `securityLevel`, without the title and the accessibility texts. */
async function withoutTexts(
  text: string,
  securityLevel: MermaidConfig["securityLevel"],
): Promise<Record<string, unknown>> {
  const db = await summary(text, { securityLevel })
  return Object.fromEntries(
    Object.entries(db).filter(
      ([key]) => !["title", "accTitle", "accDescr"].includes(key),
    ),
  )
}

describe("the summary of a requirement diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      direction: "LR",
      title: "Plan",
      accTitle: "Plan title",
      accDescr: "Plan description",
      requirements: [
        {
          name: "r1",
          type: "Functional Requirement",
          requirementId: "1.1",
          text: "the text",
          risk: "High",
          verifyMethod: "Test",
          cssStyles: ["stroke:#333", "fill:#f9f", "color:#fff"],
          classes: ["important"],
        },
      ],
      elements: [
        {
          name: "e1",
          type: "simulation",
          docRef: "path/to/doc",
          cssStyles: ["fill:#f9f", "color:#fff"],
          classes: ["important"],
        },
      ],
      relationships: [{ type: "satisfies", src: "e1", dst: "r1" }],
      classes: [{ id: "important", styles: ["fill:#f9f", "color:#fff"] }],
    })
  })

  it("starts each text from an empty Db", async () => {
    await summary(KEPT_FIELDS)
    expect(await summary("requirementDiagram\n")).toEqual({
      direction: "TB",
      title: "",
      accTitle: "",
      accDescr: "",
      requirements: [],
      elements: [],
      relationships: [],
      classes: [],
    })
  })

  it("does not have the fields it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    for (const styleClass of db.classes as object[]) {
      expect(styleClass).not.toHaveProperty("textStyles")
    }
    for (const node of [
      ...(db.requirements as object[]),
      ...(db.elements as object[]),
    ]) {
      for (const dropped of [
        "id",
        "shape",
        "look",
        "cssClasses",
        "colorIndex",
      ]) {
        expect(node).not.toHaveProperty(dropped)
      }
    }
  })

  it("leaves out the class `default` that every requirement and element starts with, and keeps the one a statement names", async () => {
    const db = await summary(
      "requirementDiagram\n  requirement r {\n  }\n  element e {\n  }\n  class r default\n",
    )
    expect(
      (db.requirements as { classes: string[] }[]).map((node) => node.classes),
    ).toEqual([["default"]])
    expect(
      (db.elements as { classes: string[] }[]).map((node) => node.classes),
    ).toEqual([[]])
  })

  it("is the same under every securityLevel except in the title and the accessibility texts", async () => {
    const text = `---
title: a<b>c
---
requirementDiagram
  accTitle: a<b>c
  accDescr: a<b>c
  requirement "r<b>1" {
    id: "i<b>d"
    text: "t<b>x"
  }
  element "e<b>1" {
    type: "t<b>y"
    docRef: "d<b>c"
  }
  "r<b>1" - traces -> "e<b>1"
`
    const strict = await withoutTexts(text, "strict")
    for (const level of ["loose", "antiscript", "sandbox"] as const) {
      expect(await withoutTexts(text, level), level).toEqual(strict)
    }
    expect(await withoutTexts(text, "other")).toEqual(strict)
  })
})

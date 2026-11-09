import { describe, expect, it } from "vitest"
import {
  classifyExpectedChange,
  describeExpectedChange,
} from "../src/expected-changes.ts"
import type { DbSummary, Expectation } from "../src/index.ts"

/**
 * An accepted flowchart with the given summary.
 */
function accepted(db: DbSummary | null): Expectation {
  return { accepted: true, diagramType: "flowchart-v2", db }
}

/**
 * A rejection with the given error.
 */
function rejected(name: string, message: string): Expectation {
  return { accepted: false, error: { name, message } }
}

/**
 * Classifies and formats in one step, as the generator does.
 */
function changeOf(previous: Expectation, next: Expectation): string {
  return describeExpectedChange(classifyExpectedChange(previous, next))
}

describe("classifyExpectedChange", () => {
  it("reports a change of the embedded values when the Db is the same", () => {
    const previous: Expectation = {
      accepted: true,
      diagramType: "flowchart-v2",
      db: { direction: "LR" },
      embedded: { title: "a" },
    }
    const next: Expectation = { ...previous, embedded: { title: "b" } }
    expect(changeOf(previous, next)).toBe("embedded values")
    expect(changeOf(previous, previous)).toBe("file format only")
  })

  it("ignores object key order throughout the Db", () => {
    expect(
      changeOf(
        accepted({ direction: "LR", vertices: [{ id: "A", text: "a" }] }),
        accepted({ vertices: [{ text: "a", id: "A" }], direction: "LR" }),
      ),
    ).toBe("file format only")
  })

  it("ignores object key order throughout the embedded values", () => {
    const previous: Expectation = {
      accepted: true,
      diagramType: "flowchart-v2",
      db: { direction: "LR" },
      embedded: {
        title: "a",
        config: { flowchart: { curve: "linear", inheritDir: true } },
        dataBlockEffects: [{ id: "A", set: { label: "a", shape: "rect" } }],
      },
    }
    const next: Expectation = {
      accepted: true,
      diagramType: "flowchart-v2",
      db: { direction: "LR" },
      embedded: {
        dataBlockEffects: [{ set: { shape: "rect", label: "a" }, id: "A" }],
        config: { flowchart: { inheritDir: true, curve: "linear" } },
        title: "a",
      },
    }
    expect(changeOf(previous, next)).toBe("file format only")
  })

  it("keeps array item order significant", () => {
    expect(
      changeOf(
        accepted({ vertices: [{ id: "A" }, { id: "B" }] }),
        accepted({ vertices: [{ id: "B" }, { id: "A" }] }),
      ),
    ).toBe("Db values")
    const previous: Expectation = {
      accepted: true,
      diagramType: "flowchart-v2",
      db: { direction: "LR" },
      embedded: { config: { themeCSS: ["a", "b"] } },
    }
    const next: Expectation = {
      accepted: true,
      diagramType: "flowchart-v2",
      db: { direction: "LR" },
      embedded: { config: { themeCSS: ["b", "a"] } },
    }
    expect(changeOf(previous, next)).toBe("embedded values")
  })

  it("reports a change of acceptance with both outcomes", () => {
    expect(
      changeOf(accepted({ direction: "LR" }), rejected("Error", "Parse error")),
    ).toBe("acceptance: accepted (flowchart-v2) -> rejected (Error)")
    expect(
      changeOf(rejected("UnknownDiagramError", "none"), accepted(null)),
    ).toBe(
      "acceptance: rejected (UnknownDiagramError) -> accepted (flowchart-v2)",
    )
  })

  it("reports a change of the detected diagram id before the Db", () => {
    const next: Expectation = {
      accepted: true,
      diagramType: "flowchart-elk",
      db: { direction: "TB" },
    }
    expect(changeOf(accepted({ direction: "LR" }), next)).toBe(
      "detection: flowchart-v2 -> flowchart-elk",
    )
  })

  it("reports keys added or removed anywhere in the summary", () => {
    expect(
      changeOf(
        accepted({ vertices: [{ id: "A", domId: "x" }] }),
        accepted({ vertices: [{ id: "A", text: "A" }] }),
      ),
    ).toBe("summary fields: +vertices[].text -vertices[].domId")
  })

  it("reports changed values when the keys are the same", () => {
    expect(
      changeOf(
        accepted({ subgraphs: [{ id: "a" }] }),
        accepted({ subgraphs: [{ id: "subGraph0" }] }),
      ),
    ).toBe("Db values")
  })

  it("tells a change of the error name from a change of the message", () => {
    expect(
      changeOf(rejected("Error", "a"), rejected("UnknownDiagramError", "a")),
    ).toBe("error name: Error -> UnknownDiagramError")
    expect(changeOf(rejected("Error", "a"), rejected("Error", "b"))).toBe(
      "error message only",
    )
  })

  it("reports equal expectations as a change of the file's text only", () => {
    expect(changeOf(accepted({ a: 1 }), accepted({ a: 1 }))).toBe(
      "file format only",
    )
    expect(changeOf(rejected("Error", "a"), rejected("Error", "a"))).toBe(
      "file format only",
    )
  })
})

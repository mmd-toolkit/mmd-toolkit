import { describe, expect, it } from "vitest"
import { canCompactRange } from "../src/utils/compact-range.ts"
import { observe } from "./helpers.ts"

describe("ranges compacted across line terminators", () => {
  it.each([
    ["one terminator", `flowchart\nA\nB\n`, true],
    ["a blank interior line", `flowchart\nA\n\nB\n`, true],
    ["a whitespace-only interior line", `flowchart\nA\n  \nB\n`, true],
    ["a comment on the first line", `classDiagram\nA %% c\nB\n`, false],
    ["an interior comment", `flowchart\nA\n%% c\nB\n`, false],
    ["interior text", `flowchart\nA\nC\nB\n`, false],
  ] as const)("checks %s", (_, code, expected) => {
    const { sourceCode } = observe(code)
    if (sourceCode === null) throw new Error("The diagram was not parsed")
    expect(
      canCompactRange(sourceCode, [code.indexOf("A"), code.indexOf("B")]),
    ).toBe(expected)
  })

  it("keeps a comment immediately after the removed terminator separate", () => {
    const code = `block-beta
A<["x"]>(right
%% c
down)
`
    const { sourceCode } = observe(code)
    if (sourceCode === null) throw new Error("The diagram was not parsed")
    expect(
      canCompactRange(sourceCode, [code.indexOf("right"), code.indexOf("%%")]),
    ).toBe(false)
  })
})

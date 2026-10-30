import { describe, expect, it } from "vitest"
import { removalRange } from "../src/utils/removal.ts"
import { observe } from "./helpers.ts"

// These boundaries concern a range, independently of which rule offers it.
describe("whole-line removal ranges", () => {
  it("includes the terminator of the first line", () => {
    const { sourceCode } = observe("flowchart\naccTitle: First\n")
    if (sourceCode === null) throw new Error("The diagram was not parsed")
    const header = sourceCode.getFirstToken(sourceCode.ast)
    if (header === null) throw new Error("The header is missing")
    expect(removalRange(sourceCode, header)).toEqual([0, 10])
  })

  it("removes the whole text when it has one line", () => {
    const { sourceCode } = observe("flowchart LR")
    if (sourceCode === null) throw new Error("The diagram was not parsed")
    expect(removalRange(sourceCode, sourceCode.ast.body)).toEqual([0, 12])
  })

  it("includes the preceding terminator on the final line", () => {
    const { sourceCode, visits } = observe("flowchart LR\r\naccTitle: Last")
    if (sourceCode === null) throw new Error("The diagram was not parsed")
    const title = visits.find(
      ({ phase, node }) =>
        phase === "enter" && node.type === "FlowchartAccTitleStatement",
    )?.node
    if (title === undefined) throw new Error("The title is missing")
    expect(removalRange(sourceCode, title)).toEqual([12, 28])
  })

  it("includes the value line read after an empty accTitle colon", () => {
    const { sourceCode, visits } = observe(
      "flowchart LR\naccTitle:\nSecond\nA\n",
    )
    if (sourceCode === null) throw new Error("The diagram was not parsed")
    const title = visits.find(
      ({ phase, node }) =>
        phase === "enter" && node.type === "FlowchartAccTitleStatement",
    )?.node
    if (title === undefined) throw new Error("The title is missing")
    expect(removalRange(sourceCode, title)).toEqual([13, 30])
  })
})

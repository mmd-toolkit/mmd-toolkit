import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { Range } from "../src/index.ts"
import { parse, traverseNodes } from "../src/index.ts"
import { examplesIn } from "./helpers/ast-examples.ts"
import { allTreeviewNodeTypes } from "./helpers/node-types.ts"

/** The ASCII JSDoc display escapes stand for authored box characters. */
function readBoxEscapes(text: string): string {
  return text
    .replaceAll("\\u251c", "\u251c")
    .replaceAll("\\u2514", "\u2514")
    .replaceAll("\\u2500", "\u2500")
    .replaceAll("\\u2502", "\u2502")
}

const examples = examplesIn(
  readFileSync(new URL("../src/ast/treeview.ts", import.meta.url), "utf8"),
)

describe("the examples in the comments of the treeview node types", () => {
  it("cover every node type", () => {
    expect([...new Set(examples.map((example) => example.nodeType))]).toEqual(
      Object.keys(allTreeviewNodeTypes),
    )
  })

  it.each(examples)(
    "$nodeType: the marks under $input are the range of a node",
    ({ nodeType, input, range }) => {
      const header = input.startsWith("treeView-beta") ? "" : "treeView-beta\n"
      const root = parse(header + readBoxEscapes(input))
      const ranges: Range[] = []
      traverseNodes(root, {
        enterNode(node) {
          if (node.type === nodeType) ranges.push(node.range)
        },
        leaveNode() {
          // Nothing to do on the way back.
        },
      })
      expect(ranges).toContainEqual([
        readBoxEscapes(input.slice(0, range[0])).length + header.length,
        readBoxEscapes(input.slice(0, range[1])).length + header.length,
      ])
    },
  )
})

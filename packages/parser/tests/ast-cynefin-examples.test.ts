import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { Range } from "../src/index.ts"
import { parse, traverseNodes } from "../src/index.ts"
import { examplesIn } from "./helpers/ast-examples.ts"
import { allCynefinNodeTypes } from "./helpers/node-types.ts"

const examples = examplesIn(
  readFileSync(new URL("../src/ast/cynefin.ts", import.meta.url), "utf8"),
)

describe("the examples in the comments of the cynefin node types", () => {
  it("cover every node type", () => {
    expect([...new Set(examples.map((example) => example.nodeType))]).toEqual(
      Object.keys(allCynefinNodeTypes),
    )
  })

  it.each(examples)(
    "$nodeType: the marks under $input are the range of a node",
    ({ nodeType, input, range }) => {
      const header = input.startsWith("cynefin") ? "" : "cynefin-beta\n"
      const root = parse(header + input)
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
        range[0] + header.length,
        range[1] + header.length,
      ])
    },
  )
})

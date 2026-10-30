import { describe, expect, it } from "vitest"
import { parseSource } from "../src/engine.ts"
import {
  childKeys,
  nodeAtOffset,
  selectionAtOffset,
  valueRange,
} from "../src/ast.ts"

describe("AST selection", () => {
  it("selects the deepest node and respects a half-open end", () => {
    const source = "flowchart LR\n  A-->B\n"
    const root = parseSource(source)
    const selection = nodeAtOffset(root, source.indexOf("A"))
    expect(selection?.value).toMatchObject({ type: "Identifier", name: "A" })
    expect(selection?.path).toContain("root.body.")
    expect(selection?.range).toEqual([
      source.indexOf("A"),
      source.indexOf("A") + 1,
    ])
    expect(nodeAtOffset(root, source.indexOf("A") + 1)?.value).not.toBe(
      selection?.value,
    )
    expect(nodeAtOffset(root, source.length)).toBeNull()
  })
  it("keeps tokens separate even when their type is Identifier", () => {
    const root = parseSource("flowchart LR\n  A-->B\n")
    const token = root.tokens.find((value) => value.type === "Identifier")
    expect(childKeys(token, false)).toEqual([])
    expect(childKeys(root, true)).toEqual(["body"])
    expect(valueRange(token)).toEqual(token?.range)
    expect(valueRange({ range: [1, "2"] })).toBeNull()
  })
  it("uses original UTF-16 offsets rather than transformed lines or byte counts", () => {
    const source = 'flowchart LR\r\n  A["😀\u2028x"]-->B\r\n'
    const root = parseSource(source)
    const selection = nodeAtOffset(root, source.indexOf("x"))
    expect(selection?.range).not.toBeNull()
    expect(source.slice(...(selection?.range ?? [0, 0]))).toContain("😀\u2028x")
  })
})

describe("Record selection", () => {
  const source =
    '---\ntitle: "😀"\n---\n%% before\n%%{init: {"theme":"dark"}}%%\nflowchart LR\nA-->B\n'
  const root = parseSource(source)

  it("selects the visible record and its exact field path", () => {
    const token = selectionAtOffset(root, source.indexOf("A-->"), "tokens")
    expect(token?.path).toBe("root.tokens.6")
    expect(token?.value).toBe(root.tokens[6])
    expect(token?.value).toMatchObject({ type: "Identifier", value: "A" })
    expect(token?.range).toEqual([
      source.indexOf("A-->"),
      source.indexOf("A-->") + 1,
    ])

    const comment = selectionAtOffset(
      root,
      source.indexOf("before"),
      "comments",
    )
    expect(comment?.path).toBe("root.comments.0")
    expect(comment?.value).toBe(root.comments[0])
    expect(comment?.range).toEqual(root.comments[0].range)

    const directive = selectionAtOffset(
      root,
      source.indexOf("init"),
      "directives",
    )
    expect(directive?.path).toBe("root.directives.0")
    expect(directive?.value).toBe(root.directives[0])
    expect(directive?.range).toEqual(root.directives[0].range)

    const frontmatter = selectionAtOffset(
      root,
      source.indexOf("😀") + 1,
      "frontmatter",
    )
    expect(frontmatter?.path).toBe("root.frontmatter")
    expect(frontmatter?.value).toBe(root.frontmatter)
    expect(frontmatter?.range).toEqual(root.frontmatter?.range)
  })

  it("respects half-open ranges and clears selection outside the current records", () => {
    const arrow = selectionAtOffset(root, source.indexOf("A-->") + 1, "tokens")
    expect(arrow?.path).toBe("root.tokens.7")
    expect(arrow?.value).toMatchObject({ type: "Punctuator", value: "-->" })
    expect(
      selectionAtOffset(root, source.indexOf("%% before"), "tokens"),
    ).toBeNull()
    expect(
      selectionAtOffset(root, root.comments[0].range[1], "comments"),
    ).toBeNull()
    expect(
      selectionAtOffset(root, root.directives[0].range[1], "directives"),
    ).toBeNull()
    expect(
      selectionAtOffset(root, root.frontmatter?.range[1] ?? -1, "frontmatter"),
    ).toBeNull()
    for (const view of ["tokens", "comments", "directives", "frontmatter"])
      expect(selectionAtOffset(root, source.length, view)).toBeNull()

    const plain = parseSource("flowchart LR\nA-->B\n")
    for (const view of ["comments", "directives", "frontmatter"])
      expect(selectionAtOffset(plain, 0, view)).toBeNull()
  })

  it("retains deepest-node selection in Tree and JSON", () => {
    const offset = source.indexOf("A-->")
    for (const view of ["tree", "json"])
      expect(selectionAtOffset(root, offset, view)).toEqual(
        nodeAtOffset(root, offset),
      )
  })
})

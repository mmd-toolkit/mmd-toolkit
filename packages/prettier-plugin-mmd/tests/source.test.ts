/**
 * Checks which tokens the printers take for tokens of a node's structure:
 * the tokens of the diagram text, without the directives, the `;` tokens,
 * and the tokens of the frontmatter, whose `---` delimiters have the kind
 * and the value of a flowchart arrow (src/printers/source.ts).
 */
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import type { Source } from "../src/printers/source.ts"
import {
  createSource,
  findStructuralToken,
  findStructuralTokenEndingBefore,
  isStructural,
} from "../src/printers/source.ts"

/** Parses a text and makes its printing context. */
function sourceOf(text: string): Source {
  return createSource(text, parse(text))
}

const withFrontmatter = "---\ntitle: t\n---\nflowchart LR\nA---B\n"

describe("structural tokens", () => {
  it("leave out the tokens of the frontmatter, and keep an arrow of the same value", () => {
    const source = sourceOf(withFrontmatter)
    const dashes = source.root.tokens.filter((token) => token.value === "---")
    expect(dashes.map((token) => isStructural(source, token))).toEqual([
      false,
      false,
      true,
    ])
  })

  it("are not found in the frontmatter, forward or back", () => {
    const source = sourceOf(withFrontmatter)
    expect(findStructuralToken(source, 0)?.value).toBe("flowchart")
    const keyword = source.text.indexOf("flowchart")
    expect(findStructuralTokenEndingBefore(source, keyword)).toBeUndefined()
  })

  it("leave out directives and `;` tokens", () => {
    const source = sourceOf("flowchart LR\nA%%{init: {}}%%-->B;\n")
    const values = source.root.tokens
      .filter((token) => !isStructural(source, token))
      .map((token) => token.value)
    expect(values).toEqual(["%%{init: {}}%%", ";"])
  })
})

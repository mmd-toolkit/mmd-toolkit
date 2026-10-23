import { describe, expect, it } from "vitest"
import { DirectiveIndex, findDirectives } from "../src/directives.ts"
import { decideIgnoredSemicolons } from "../src/line-rule.ts"

/** The `;` characters that the rule ignores in the whole text as one segment, with its directives found first. */
function ignoredOf(text: string): number[] {
  const directives = new DirectiveIndex(findDirectives(text, 0))
  return [...decideIgnoredSemicolons(text, 0, text.length, directives)].sort(
    (a, b) => a - b,
  )
}

// Expectations come from common.md, `style` and `classDef` lines.

describe("decideIgnoredSemicolons", () => {
  it.each([
    ["style A fill:#f00;", [17]],
    ["classDef c fill:#f00;", [20]],
    // Only the last `;` of the segment is ignored.
    ["style A fill:#f00;B-->C", [17]],
    ["style A fill:#fff;color:#000;", [28]],
    // `style` anywhere in the segment, even inside a label; case-sensitive.
    ["A[mystyle:#x;]", [12]],
    ["A[mystyle: #x;]", []],
    ["linkStyle 0 stroke:#f00;", []],
    ["Style A fill:#f00;", []],
    // The `:` must reach the `#` through characters that are not whitespace.
    ["style A fill:abc#f00;", [20]],
    ["style A fill: #f00;", []],
    ["style A fill:#f00", []],
    ["style A fill;#f00", []],
    ["style A x:#;", [11]],
    // The `;` must come later than the `#`, and the `:` after `style`.
    ["style A #x; fill:#f00", []],
    ["a:#x; style", []],
    // The segment is read without its directives: a match can have a
    // directive between two of its characters.
    ["style A fill:%%{init: {}}%%#f00;", [31]],
    ["sty%%{x}%%le A fill:#f00;", [24]],
    ["style A fill: %%{x}%%#f00;", []],
    ["style A fill:#f00%%{x}%%;", [24]],
    ["style A fill:#f00%%{x:\n1}%%;", [27]],
    // The classDef rule is applied to the segment without the `;` ignored
    // under the style rule.
    ["classDef style:#a;#b;", [17, 20]],
    ["classDef style:#a;#b", [17]],
    ["classDef style:#a;", [17]],
  ])("%j has the ignored `;` at %j", (text, ignored) => {
    expect(ignoredOf(text)).toEqual(ignored)
  })

  it("reads only the given bounds", () => {
    expect([
      ...decideIgnoredSemicolons(
        "x\nstyle A fill:#f00;",
        2,
        20,
        new DirectiveIndex([]),
      ),
    ]).toEqual([19])
    expect([
      ...decideIgnoredSemicolons(
        "style A fill:#f00;",
        0,
        17,
        new DirectiveIndex([]),
      ),
    ]).toEqual([])
  })
})

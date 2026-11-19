/**
 * A line of whitespace only is an empty line in a requirement diagram, whatever
 * its whitespace character is (requirement.md, Blank lines). The characters are
 * written as escapes, and no fixture holds them.
 */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"

const output =
  "requirementDiagram\n  requirement r {\n    id: 1\n  }\n\n  element e {\n  }\n"

const cases = [
  {
    name: "requirement whitespace-only line of a space and a tab",
    line: " \t ",
  },
  {
    name: "requirement whitespace-only line of a form feed",
    line: "\f",
  },
  {
    name: "requirement whitespace-only line of a vertical tab",
    line: "\u000b",
  },
  {
    name: "requirement whitespace-only line of U+00A0",
    line: "\u00a0",
  },
  {
    name: "requirement whitespace-only line of U+3000",
    line: "\u3000",
  },
  {
    name: "requirement whitespace-only line of U+2028",
    line: "\u2028",
  },
  {
    name: "requirement whitespace-only line of U+2029",
    line: "\u2029",
  },
] as const

describe("a line of whitespace only", () => {
  it.each(cases)("$name", async ({ line }) => {
    const input = `requirementDiagram\nrequirement r {\nid: 1\n}\n${line}\nelement e {\n}\n`
    expect(await formatMermaid(input)).toBe(output)
  })
})

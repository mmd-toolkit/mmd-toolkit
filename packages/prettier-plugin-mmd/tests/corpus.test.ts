/**
 * Runs the formatter over every input of the conformance corpus that it
 * formats, and checks the guarantees that hold for any input: formatting again
 * changes nothing, source comparison ignores frontmatter and whitespace and
 * allows only semicolon removals, and the embedded data is as written (see
 * `writtenEmbeddedTexts`).
 * The Db that the tree of the formatted text denotes is the Db that the corpus
 * records for the input, as mermaid.js reads it as the specification does. The
 * formatted texts are not stored; the fixtures under `tests/fixtures/` show the
 * formatting itself.
 */
import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { embeddedValuesOf, loadFixtures } from "@mmd-toolkit/tests"
import { parseDocument } from "../src/parser.ts"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  describeFrontmatterChange,
  writtenEmbeddedTexts,
  writtenTextKeptUpToSemicolons,
} from "./db-reading.ts"

/**
 * Whether the plugin formats the input, rather than printing it as written
 * or reporting a syntax error.
 *
 * Prettier removes a byte order mark at the start of the text before it
 * calls the parser, so the parser is given the text without it. For
 * frontmatter that repeats the mark before its closing delimiter, that text
 * has no frontmatter and is rejected; the README lists this as a known
 * limitation, and `failure.test.ts` checks it.
 */
function isFormatted(fixture: Fixture): boolean {
  try {
    return (
      parseDocument(withoutByteOrderMark(fixture.input)).type ===
      "FormattedDocument"
    )
  } catch {
    return false
  }
}

/** The text as the parser is given it: Prettier removes a byte order mark first. */
function withoutByteOrderMark(text: string): string {
  return text.startsWith("\uFEFF") ? text.slice(1) : text
}

/**
 * Whether the parser rejects the input, as the corpus records for the fixtures
 * that have a `parse-error.json`. A text of only whitespace is not given to
 * the parser: Prettier formats it as empty.
 */
function isRejected(fixture: Fixture): boolean {
  if (fixture.input.trim() === "") return false
  try {
    parseDocument(withoutByteOrderMark(fixture.input))
    return false
  } catch {
    return true
  }
}

const allFixtures = [
  ...(await loadFixtures("common")),
  ...(await loadFixtures("flowchart")),
  ...(await loadFixtures("agentflow")),
  ...(await loadFixtures("sequence")),
  ...(await loadFixtures("class")),
  ...(await loadFixtures("state")),
  ...(await loadFixtures("er")),
  ...(await loadFixtures("gantt")),
  ...(await loadFixtures("journey")),
  ...(await loadFixtures("requirement")),
  ...(await loadFixtures("mindmap")),
  ...(await loadFixtures("timeline")),
  ...(await loadFixtures("sankey")),
  ...(await loadFixtures("xychart")),
  ...(await loadFixtures("quadrant")),
  ...(await loadFixtures("block")),
  ...(await loadFixtures("kanban")),
  ...(await loadFixtures("c4")),
  ...(await loadFixtures("venn")),
  ...(await loadFixtures("ishikawa")),
  ...(await loadFixtures("usecase")),
  ...(await loadFixtures("pie")),
  ...(await loadFixtures("info")),
  ...(await loadFixtures("gitgraph")),
  ...(await loadFixtures("packet")),
]
const fixtures = allFixtures.filter(isFormatted)
const rejectedFixtures = allFixtures.filter(isRejected)

describe("the conformance corpus", () => {
  it("has inputs that the plugin formats", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  it.each(
    fixtures.map(
      (fixture) => [`${fixture.diagram}/${fixture.name}`, fixture] as const,
    ),
  )("%s: formatting is idempotent and keeps the Db", async (_name, fixture) => {
    const input = withoutByteOrderMark(fixture.input)
    const output = await formatMermaid(fixture.input)
    expect(await formatMermaid(output)).toBe(output)
    const formatted = withoutByteOrderMark(output)
    expect(writtenEmbeddedTexts(formatted), output).toEqual(
      writtenEmbeddedTexts(input),
    )
    expect(await describeFrontmatterChange(input, formatted)).toBeNull()
    expect(writtenTextKeptUpToSemicolons(input, formatted), output).toBe(true)
    const recorded = fixture.specified ?? fixture.expected
    const embedded = embeddedValuesOf(fixture)
    if (!recorded.accepted || recorded.db === null || embedded === undefined)
      return
    expect(dbOfText(formatted, embedded), output).toEqual(recorded.db)
  })
})

describe("the inputs of the corpus that the parser rejects", () => {
  it("are listed", () => {
    expect(rejectedFixtures.length).toBeGreaterThan(0)
  })

  it.each(
    rejectedFixtures.map(
      (fixture) => [`${fixture.diagram}/${fixture.name}`, fixture] as const,
    ),
  )("%s: formatting reports a syntax error", async (_name, fixture) => {
    await expect(formatMermaid(fixture.input)).rejects.toBeInstanceOf(
      SyntaxError,
    )
  })
})

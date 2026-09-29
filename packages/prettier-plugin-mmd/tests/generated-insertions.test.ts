/**
 * Formats the fixtures of the conformance corpus, for each diagram type that
 * has a printer, with text inserted at a boundary of a token: what the grammar reads past (a
 * directive, two of them, or a `;` that the line rule ignores), whose sides
 * must keep whether the source has whitespace there (docs/flowchart.md,
 * Directives and Semicolons); line breaks, empty lines, and comment lines,
 * which the printer moves; and, at the end of the text, a directive that is
 * not closed, with whitespace after it, which is whitespace at the end of
 * the text (docs/flowchart.md, Directives).
 *
 * The flowchart fixtures have about 29,000 token boundaries, and the
 * sequence fixtures about 7,000; each test takes every
 * `sampleEvery`-th boundary of those it can use, in fixture order, so that
 * it always checks the same inputs (see `tests/generated.ts`).
 */
import { describe, expect, it } from "vitest"
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import type { GeneratedInput } from "./generated.ts"
import {
  checkGeneratedInputs,
  DEFAULT_SAMPLE_EVERY,
  describeReport,
  sampleEvery,
} from "./generated.ts"

/** The time limit of each test, longer for a larger run. */
const TIMEOUT = 3_600_000 * Math.ceil(DEFAULT_SAMPLE_EVERY / sampleEvery)

const DIRECTIVE = "%%{init: {}}%%"

/** A boundary where text is inserted: a fixture and an offset in its input. */
interface Boundary {
  readonly fixture: Fixture
  readonly offset: number
}

/** The fixtures of a diagram type that mermaid.js and the parser accept. */
async function loadAcceptedFixtures(diagram: DiagramType): Promise<Fixture[]> {
  const accepted: Fixture[] = []
  for (const fixture of await loadFixtures(diagram)) {
    if (!fixture.expected.accepted) continue
    try {
      parse(fixture.input)
    } catch {
      continue
    }
    accepted.push(fixture)
  }
  return accepted
}

/** The offsets where a token of the fixture starts or ends, in order. */
function findTokenBoundaries(fixture: Fixture): number[] {
  const boundaries = new Set<number>()
  for (const token of parse(fixture.input).tokens) {
    boundaries.add(token.range[0])
    boundaries.add(token.range[1])
  }
  return [...boundaries].sort((a, b) => a - b)
}

/**
 * Every `sampleEvery`-th boundary of the fixtures, among those that
 * `isUsable` accepts.
 */
function* sampleBoundaries(
  fixtures: readonly Fixture[],
  isUsable: (boundary: Boundary) => boolean,
): Generator<Boundary> {
  let boundaryNumber = 0
  for (const fixture of fixtures) {
    for (const offset of findTokenBoundaries(fixture)) {
      const boundary = { fixture, offset }
      if (!isUsable(boundary)) continue
      boundaryNumber++
      if (boundaryNumber % sampleEvery === 0) yield boundary
    }
  }
}

/** The inputs made by inserting each of `insertions` at each boundary. */
function* insertAt(
  boundaries: Iterable<Boundary>,
  insertions: readonly string[],
): Generator<GeneratedInput> {
  for (const { fixture, offset } of boundaries) {
    const options =
      fixture.config === undefined ? {} : { config: fixture.config }
    for (const insertion of insertions) {
      yield {
        text:
          fixture.input.slice(0, offset) +
          insertion +
          fixture.input.slice(offset),
        options,
      }
    }
  }
}

/**
 * Whether a boundary lies on a line that starts with `style`, `classDef`,
 * or `linkStyle`: the lines where the line rule ignores a `;`
 * (common.md, `style` and `classDef` lines).
 */
function isOnStyleLine({ fixture, offset }: Boundary): boolean {
  const lineStart = fixture.input.lastIndexOf("\n", offset - 1) + 1
  const line = fixture.input.slice(lineStart).trimStart()
  return ["style", "classDef", "linkStyle"].some((keyword) =>
    line.startsWith(keyword),
  )
}

/** The diagram types whose fixtures get insertions. */
const diagrams: readonly DiagramType[] = ["flowchart", "sequence"]

/** The accepted fixtures of each diagram type. */
const fixturesByDiagram: ReadonlyMap<DiagramType, readonly Fixture[]> = new Map(
  await Promise.all(
    diagrams.map(
      async (diagram) =>
        [diagram, await loadAcceptedFixtures(diagram)] as const,
    ),
  ),
)

/** The end of the last token of each fixture. */
const lastTokenEnds: ReadonlyMap<Fixture, number | undefined> = new Map(
  [...fixturesByDiagram.values()]
    .flat()
    .map((fixture) => [fixture, parse(fixture.input).tokens.at(-1)?.range[1]]),
)

/**
 * Whether a boundary is the end of the last token of its fixture, where an
 * unclosed directive inserted there runs to the end of the text.
 */
function isAtLastTokenEnd({ fixture, offset }: Boundary): boolean {
  return offset === lastTokenEnds.get(fixture)
}

describe.each(diagrams)(
  "text inserted at a token boundary of %s",
  (diagram) => {
    const fixtures = fixturesByDiagram.get(diagram) ?? []

    it(
      "a directive, with whitespace on either side, both, or neither",
      async ({ annotate }) => {
        const inputs = insertAt(
          sampleBoundaries(fixtures, () => true),
          [` ${DIRECTIVE}`, `${DIRECTIVE} `, ` ${DIRECTIVE} `, DIRECTIVE],
        )
        const report = await checkGeneratedInputs(inputs)
        await annotate(describeReport(report))
        expect(report.checked).toBeGreaterThan(0)
        expect(report.problems).toEqual([])
      },
      TIMEOUT,
    )

    it(
      "two directives, touching or not",
      async ({ annotate }) => {
        const inputs = insertAt(
          sampleBoundaries(fixtures, () => true),
          [`${DIRECTIVE}${DIRECTIVE}`, `${DIRECTIVE} ${DIRECTIVE}`],
        )
        const report = await checkGeneratedInputs(inputs)
        await annotate(describeReport(report))
        expect(report.checked).toBeGreaterThan(0)
        expect(report.problems).toEqual([])
      },
      TIMEOUT,
    )

    it(
      "a line break, an empty line, or a comment line",
      async ({ annotate }) => {
        const inputs = insertAt(
          sampleBoundaries(fixtures, () => true),
          ["\n", "\n\n", "\n%% c\n"],
        )
        const report = await checkGeneratedInputs(inputs)
        await annotate(describeReport(report))
        expect(report.checked).toBeGreaterThan(0)
        expect(report.problems).toEqual([])
      },
      TIMEOUT,
    )

    it(
      "an unclosed directive at the end of the text, with whitespace after it",
      async ({ annotate }) => {
        const inputs = insertAt(sampleBoundaries(fixtures, isAtLastTokenEnd), [
          "\n%%{init: {}",
          "\n%%{init: {}  \n",
          " %%{init: {} \n \n",
          "\n%%{init\t\n\n",
        ])
        const report = await checkGeneratedInputs(inputs)
        await annotate(describeReport(report))
        expect(report.checked).toBeGreaterThan(0)
        expect(report.problems).toEqual([])
      },
      TIMEOUT,
    )
  },
)

/**
 * The `style`, `classDef`, and `linkStyle` statements are flowchart's; no
 * line of a sequence diagram starts with them.
 */
describe("text inserted at a token boundary of flowchart", () => {
  it(
    "a `;` on a `style`, `classDef`, or `linkStyle` line",
    async ({ annotate }) => {
      const inputs = insertAt(
        sampleBoundaries(
          fixturesByDiagram.get("flowchart") ?? [],
          isOnStyleLine,
        ),
        [";"],
      )
      const report = await checkGeneratedInputs(inputs)
      await annotate(describeReport(report))
      expect(report.checked).toBeGreaterThan(0)
      expect(report.problems).toEqual([])
    },
    TIMEOUT,
  )
})

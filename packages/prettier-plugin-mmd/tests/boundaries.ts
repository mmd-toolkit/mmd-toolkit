/**
 * Formats the fixtures of a diagram type with text inserted at their token
 * boundaries, chosen by kind (see `boundary-kinds.ts`), and checks that
 * formatting does not throw, is idempotent, and keeps the diagram that
 * mermaid.js reads (see `generated.ts`).
 *
 * The inserted text comes in two shapes:
 *
 * - A family of single pieces, each tried at every kind of boundary: a
 *   directive, two directives, line breaks, a comment after the text, a
 *   U+2028 or U+2029 alone or with comment lines, and, at the end of the
 *   text, a directive that is not closed. Each family has several strings,
 *   which take turns from one kind to the next, so that every string is
 *   tried and every kind gets every family.
 * - A sequence of two pieces of the nine below, tried at the ends of lines,
 *   of the text, and of comments, and a sequence of three that holds a `;`
 *   and a U+2028 or U+2029, tried after each statement keyword: what goes
 *   wrong in the printing of gaps goes wrong in a sequence, such as a
 *   U+2028, a `;`, a line break, and a comment line.
 */
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import type { Boundary } from "./boundary-kinds.ts"
import { selectBoundaries } from "./boundary-kinds.ts"
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import {
  canonicalSequences,
  LINE_SEPARATORS,
  pairs,
  triples,
  writeSequence,
} from "./pieces.ts"

/** How many boundaries of each kind are taken. */
const BOUNDARIES_PER_KIND = 1

const DIRECTIVE = "%%{init: {}}%%"
const UNCLOSED = "%%{init: {}"

/** A family of single pieces, and where it is inserted. */
interface Family {
  readonly name: string
  readonly strings: readonly string[]
  /** Whether the family is inserted only where nothing but whitespace follows. */
  readonly atEndOnly: boolean
}

const families: readonly Family[] = [
  {
    name: "a directive, with whitespace on either side, both, or neither",
    strings: [` ${DIRECTIVE}`, `${DIRECTIVE} `, ` ${DIRECTIVE} `, DIRECTIVE],
    atEndOnly: false,
  },
  {
    name: "two directives, touching or not",
    strings: [`${DIRECTIVE}${DIRECTIVE}`, `${DIRECTIVE} ${DIRECTIVE}`],
    atEndOnly: false,
  },
  {
    name: "a line break, an empty line, or a comment line",
    strings: ["\n", "\n\n", "\n%% c\n"],
    atEndOnly: false,
  },
  {
    name: "a comment after the text of a line, and lines of only whitespace",
    strings: [
      "\n  \n",
      " %% c\n  \n",
      " %% c\n\n",
      " %% c\n%% d\n  \n",
      " %% c\n \t\n\n",
    ],
    atEndOnly: false,
  },
  {
    name: "a U+2028 or U+2029, alone or with comment lines",
    strings: LINE_SEPARATORS.flatMap((separator) => [
      separator,
      `${separator}%% c\n`,
      ` %% c${separator}%% d\n`,
      ` #c${separator}%% d\n`,
      `${separator}%% c${separator}%% d\n`,
    ]),
    atEndOnly: false,
  },
  {
    name: "a directive that is not closed, at the end of the text",
    strings: [
      `\n${UNCLOSED}`,
      `\n${UNCLOSED}  \n`,
      ` ${UNCLOSED} \n \n`,
      "\n%%{init\t\n\n",
      " %% c\n  \n",
    ],
    atEndOnly: true,
  },
]

/** The accepted fixtures of a diagram type: those mermaid.js and the parser accept. */
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

/**
 * The input made by inserting `insertion` at a boundary. At the end of the
 * text, every other input has no line feed at its end: the text of a fixture
 * ends with one, and the end of a text that has none is read otherwise.
 */
function insertAt(
  boundary: Boundary,
  insertion: string,
  turn: number,
): GeneratedInput {
  const { fixture, offset } = boundary
  const text =
    fixture.input.slice(0, offset) + insertion + fixture.input.slice(offset)
  return {
    text:
      boundary.atEnd && turn % 2 === 1 && text.endsWith("\n")
        ? text.slice(0, -1)
        : text,
    options: fixture.config === undefined ? {} : { config: fixture.config },
  }
}

/** Whether a boundary is at the end of a line, of the text, or of a comment. */
function isLineEnd(boundary: Boundary): boolean {
  return (
    boundary.position === "lineEnd" ||
    boundary.atEnd ||
    boundary.before.startsWith("Comment:")
  )
}

/**
 * The inputs of a family: the family at every kind of boundary that is not at
 * the end of a line, of the text, or of a comment, where the sequences of
 * pieces are tried instead; the strings take turns.
 */
function makeFamilyInputs(
  family: Family,
  selected: ReadonlyMap<string, readonly Boundary[]>,
): GeneratedInput[] {
  const inputs: GeneratedInput[] = []
  let turn = 0
  for (const boundaries of selected.values()) {
    for (const boundary of boundaries) {
      if (family.atEndOnly ? !boundary.atEnd : isLineEnd(boundary)) continue
      inputs.push(
        insertAt(boundary, family.strings[turn % family.strings.length], turn),
      )
      turn++
    }
  }
  return inputs
}

/** How many other pairs and triples each place at an end is tried with. */
const OTHER_SEQUENCES_PER_PLACE = 4

/**
 * The inputs of the sequences of pieces at the end of a line of each
 * statement keyword and element before it, which is where what ends a
 * `box`, a `title`, or a `subgraph` is read as that statement reads it, at
 * the end of the text, and at the end of a comment: the canonical sequences,
 * and a few pairs and triples that take turns from one place to the next.
 */
function makeSequenceInputs(
  selected: ReadonlyMap<string, readonly Boundary[]>,
): GeneratedInput[] {
  const places = new Map<string, Boundary>()
  for (const boundaries of selected.values()) {
    for (const boundary of boundaries) {
      if (!isLineEnd(boundary)) continue
      const key = `${boundary.statement} | ${boundary.before} | ${boundary.position}`
      if (!places.has(key)) places.set(key, boundary)
    }
  }
  const inputs: GeneratedInput[] = []
  let turn = 0
  for (const [placeIndex, boundary] of [...places.values()].entries()) {
    const others = Array.from({ length: OTHER_SEQUENCES_PER_PLACE }, (_, n) => [
      pairs[(placeIndex * OTHER_SEQUENCES_PER_PLACE + n) % pairs.length],
      triples[(placeIndex * OTHER_SEQUENCES_PER_PLACE + n) % triples.length],
    ]).flat()
    for (const sequence of [...canonicalSequences, ...others]) {
      inputs.push(insertAt(boundary, writeSequence(sequence, turn), turn))
      turn++
    }
  }
  return inputs
}

/** Defines the tests of a diagram type. */
export async function testBoundaries(diagram: DiagramType): Promise<void> {
  const fixtures = await loadAcceptedFixtures(diagram)
  const selected = selectBoundaries(fixtures, BOUNDARIES_PER_KIND)
  defineCheckedGroups(
    `text inserted at the boundaries of ${diagram}, by kind`,
    [
      ...families.map(
        (family) => [family.name, makeFamilyInputs(family, selected)] as const,
      ),
      [
        "sequences of pieces at the end of a line, of the text, or of a comment",
        makeSequenceInputs(selected),
      ],
    ],
  )
}

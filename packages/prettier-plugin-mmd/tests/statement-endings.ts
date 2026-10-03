/**
 * Formats a statement of every kind of a diagram type with sequences of
 * pieces (see `pieces.ts`) at the end of its first line, alone and followed
 * by a line of another statement, and checks that formatting does not throw,
 * is idempotent, and keeps the diagram that mermaid.js reads (see
 * `generated.ts`).
 *
 * The kinds of statements are the statement node types of the parser, so
 * that a kind added to the tree is tried at once, and none is tried only
 * where the fixtures happen to hold it. A statement of each kind is taken
 * from the fixtures: the shortest text of that kind, in any context. A kind
 * that no accepted fixture holds fails the test of the coverage.
 *
 * Each kind takes a share of all the sequences, which rotate from one kind
 * to the next, so that every sequence is tried on many kinds.
 */
import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import { parse, visitorKeys } from "@mmd-toolkit/parser"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"
import { pairs, pieceIndexes, triples, writeSequence } from "./pieces.ts"

/** How many sequences of pieces each kind of statement takes. */
const SEQUENCES_PER_KIND = 40

/** The time limit of one test. */
const TEST_TIMEOUT = 120_000

/** What the node types of a diagram type start with, its header, and a line of another statement. */
const diagrams: Readonly<
  Record<
    "flowchart" | "sequence" | "class" | "state",
    { prefix: string; header: string; following: string }
  >
> = {
  flowchart: { prefix: "Flowchart", header: "flowchart LR", following: "B" },
  sequence: {
    prefix: "Sequence",
    header: "sequenceDiagram",
    following: "A->>B: z",
  },
  class: { prefix: "Class", header: "classDiagram", following: "class Z" },
  state: { prefix: "State", header: "stateDiagram-v2", following: "Z" },
}

/** A statement with the lines around it that it needs to stand. */
interface Sample {
  readonly before: readonly string[]
  readonly text: string
  readonly after: readonly string[]
}

/**
 * The statements that stand only among others, or that the fixtures hold
 * only in such a context: `linkStyle 0` needs a link, `deactivate A` an
 * activation, `--` a composite state, and an annotation needs no class body.
 */
const contexts: ReadonlyMap<string, Sample> = new Map([
  [
    "FlowchartLinkStyleStatement",
    { before: ["A-->B"], text: "linkStyle 0 stroke:red", after: [] },
  ],
  [
    "SequenceDeactivateStatement",
    { before: ["activate A"], text: "deactivate A", after: [] },
  ],
  [
    "ClassAnnotationStatement",
    { before: [], text: "<<interface>> A", after: [] },
  ],
  [
    "StateDividerStatement",
    { before: ["state S {", "X"], text: "--", after: ["Y", "}"] },
  ],
  ["StateIgnoredStatement", { before: [], text: 'state x ""', after: [] }],
])

/** Every sequence of one, two, and three pieces. */
const sequences: readonly (readonly number[])[] = [
  ...pieceIndexes.map((index) => [index]),
  ...pairs,
  ...triples,
]

/** Calls `visit` for the node and every node below it. */
function walk(
  node: unknown,
  visit: (node: { type: string; range: [number, number] }) => void,
): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (typeof node !== "object" || node === null || !("type" in node)) return
  const typed = node as { type: string; range: [number, number] }
  visit(typed)
  for (const key of visitorKeys[typed.type as keyof typeof visitorKeys] ?? []) {
    walk((node as Record<string, unknown>)[key], visit)
  }
}

/**
 * Whether the parser accepts the statement alone in a diagram, and reads a
 * statement of its type: the text of a statement taken from the context of a
 * fixture may not stand alone.
 */
function standsAlone(
  diagram: keyof typeof diagrams,
  type: string,
  text: string,
): boolean {
  let found = false
  try {
    const root = parse(`${diagrams[diagram].header}\n${text}\n`)
    walk(root.body, (node) => {
      if (node.type === type) found = true
    })
  } catch {
    return false
  }
  return found
}

/** The statement node types of a diagram type. */
function findStatementTypes(diagram: keyof typeof diagrams): string[] {
  const { prefix } = diagrams[diagram]
  return Object.keys(visitorKeys).filter(
    (type) => type.startsWith(prefix) && type.endsWith("Statement"),
  )
}

/** The shortest text of each statement type of a diagram type that stands alone, from the accepted fixtures. */
async function findSamples(
  diagram: keyof typeof diagrams,
): Promise<Map<string, Sample[]>> {
  const candidates = new Map<string, Set<string>>(
    findStatementTypes(diagram).map((type) => [type, new Set()]),
  )
  for (const fixture of await loadFixtures(diagram)) {
    if (!fixture.expected.accepted) continue
    let root
    try {
      root = parse(fixture.input)
    } catch {
      continue
    }
    walk(root.body, (node) => {
      const texts = candidates.get(node.type)
      if (texts === undefined) return
      const text = fixture.input.slice(...node.range)
      if (
        text.includes("\r") ||
        text.includes("\u2028") ||
        text.includes("\u2029")
      )
        return
      texts.add(text)
    })
  }
  const samples = new Map<string, Sample[]>()
  for (const [type, texts] of candidates) {
    const override = contexts.get(type)
    if (override !== undefined) {
      samples.set(type, [override])
      continue
    }
    const alone = [...texts]
      .sort((a, b) => a.length - b.length)
      .filter((text) => standsAlone(diagram, type, text))
    if (alone.length === 0) continue
    // The shortest text, and the shortest one with more tokens: a `box` with
    // and without text is read differently at the end of its line.
    const tokens = countTokens(diagram, alone[0])
    const richer = alone.find((text) => countTokens(diagram, text) > tokens)
    samples.set(
      type,
      [alone[0], richer].flatMap((text) =>
        text === undefined ? [] : [{ before: [], text, after: [] }],
      ),
    )
  }
  return samples
}

/** How many tokens a statement has, alone in a diagram. */
function countTokens(diagram: keyof typeof diagrams, text: string): number {
  return parse(`${diagrams[diagram].header}\n${text}\n`).tokens.length
}

/** The inputs of one statement: every sequence of its share, alone and followed by a line. */
function makeInputs(
  diagram: keyof typeof diagrams,
  sample: Sample,
  kindIndex: number,
  share: number,
): GeneratedInput[] {
  const { header, following } = diagrams[diagram]
  const [first, ...rest] = sample.text.split("\n")
  const inputs: GeneratedInput[] = []
  for (let turn = 0; turn < share; turn++) {
    const index = (kindIndex * SEQUENCES_PER_KIND + turn) % sequences.length
    const ending = writeSequence(sequences[index], kindIndex + turn)
    const lines = [
      header,
      ...sample.before,
      first + ending,
      ...rest,
      ...sample.after,
    ]
    inputs.push({ text: `${lines.join("\n")}\n`, options: {} })
    inputs.push({ text: `${[...lines, following].join("\n")}\n`, options: {} })
  }
  return inputs
}

/** Defines the tests of a diagram type. */
export async function testStatementEndings(
  diagram: keyof typeof diagrams,
): Promise<void> {
  const samples = await findSamples(diagram)

  describe(`${diagram} statements with sequences of pieces at the end of a line`, () => {
    it("has a statement of every kind", () => {
      expect([...samples.keys()].sort()).toEqual(
        findStatementTypes(diagram).sort(),
      )
    })
    for (const [kindIndex, [type, typeSamples]] of [...samples].entries()) {
      it(
        type,
        async ({ annotate }) => {
          const share = Math.ceil(SEQUENCES_PER_KIND / typeSamples.length)
          const inputs = typeSamples.flatMap((sample, index) =>
            makeInputs(diagram, sample, kindIndex * 2 + index, share),
          )
          const report = await checkGeneratedInputs(inputs)
          await annotate(
            `${typeSamples.map((sample) => JSON.stringify(sample.text)).join(", ")}: ${describeReport(report)}`,
          )
          expect(report.problems).toEqual([])
        },
        TEST_TIMEOUT,
      )
    }
  })
}

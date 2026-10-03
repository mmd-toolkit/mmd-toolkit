/**
 * Layer 4 for the state diagram: compares `parse()` with `mermaid.parse()` of
 * the pinned mermaid.js on mutants of the state fixtures, each one edit away
 * from a fixture input, and on the accepted fixture inputs with a text
 * inserted where a statement ends or starts: a comment, `%% c` or `# c`, at
 * the end of each line and after each space inside a line, and after each
 * line a line of a comment, of an empty description block, or of ids that
 * start with a keyword. What is compared is acceptance, the diagram type,
 * and the Db summary built from the tree; `mermaid-comparison.ts` says how
 * each outcome of `parse()` is compared.
 */
import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { MutationInput } from "@mmd-toolkit/tests/mutation"
import { mutate } from "@mmd-toolkit/tests/mutation"
import {
  checkDirectiveDivergences,
  checkEmptyFormDivergences,
  checkHtmlTagDivergences,
  compareDecided,
  inputsByOutcome,
  unsupportedMismatches,
} from "./mermaid-comparison.ts"
import type { InputsByOutcome } from "./mermaid-comparison.ts"
import { runSizeFromEnvironment, timeoutFor } from "./run-size.ts"

/**
 * Mutants per fixture: 1, kept small for CI, or what
 * `MMD_MUTANTS_PER_FIXTURE` gives. Raising it to 20 is the full check.
 */
const MUTANTS_PER_FIXTURE = runSizeFromEnvironment("MMD_MUTANTS_PER_FIXTURE", 1)

/** The seed of the mutations. */
const SEED = 1

/**
 * Inputs with a text inserted: 300, spread evenly over all of them, kept
 * small for CI, or what `MMD_COMMENT_INPUTS` gives. A number at least that
 * of all the inputs is the full check.
 */
const INSERTED_INPUTS = runSizeFromEnvironment("MMD_COMMENT_INPUTS", 300)

/** The comments that are inserted at the end of a line and after a space. */
const COMMENTS: readonly string[] = ["%% c", "# c"]

/**
 * The lines that are inserted after each line: comment lines, an empty
 * description block, and ids that start with a keyword of the statement
 * context, alone and in a transition.
 */
const LINES: readonly string[] = [
  "%%",
  "%% c",
  "# c",
  "accDescr {}",
  "clickable",
  "notes --> stateful",
  "classDefs --> hidden",
]

/**
 * Registers the checks of the inputs `inputs`, decided and not: every
 * difference from mermaid.js is a declared known divergence, and each
 * divergence is explained by its own cause.
 */
function checkAgreement({ decided, unsupported }: InputsByOutcome): void {
  const timeout = timeoutFor(decided.length + unsupported.length)
  it(
    "accepts and rejects what mermaid.js does, with the same diagram type and Db",
    async () => {
      const comparison = await compareDecided(decided)
      expect(comparison.skipped).toEqual([])
      expect(
        comparison.mismatches.map((mismatch) => ({
          from: mismatch.from,
          text: mismatch.text,
          kind: mismatch.kind,
        })),
      ).toEqual([])
      expect(comparison.compared).toBe(decided.length)
      // Guards against the check passing vacuously.
      expect(comparison.comparedParts.diagramType).toBeGreaterThan(0)
      expect(comparison.comparedParts.db).toBeGreaterThan(0)

      // A declared `embedded-data-opaque` difference must be a rejection of
      // mermaid.js for embedded data, never a difference in type or Db.
      expect(
        comparison.unexplainedEmbeddedData.map((divergence) => ({
          text: divergence.text,
          kind: divergence.kind,
          mermaid: divergence.mermaid,
        })),
      ).toEqual([])
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `directive-as-token-boundary` only because of a directive",
    async () => {
      const check = await checkDirectiveDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `tokenless-empty-forms` only because of an empty form",
    async () => {
      const check = await checkEmptyFormDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `html-tag-in-frontmatter` only because of a tag that starts in the frontmatter",
    async () => {
      const check = await checkHtmlTagDivergences(decided)
      expect(check.mismatches).toEqual([])
    },
    timeout,
  )

  it(
    "detects the same diagram type as mermaid.js where a mutant has a type that is not supported yet",
    async () => {
      expect(await unsupportedMismatches(unsupported)).toEqual([])
    },
    timeout,
  )
}

/**
 * The input of `fixture` with a text inserted where a statement ends or
 * starts: each of {@link COMMENTS} at the end of each line and after each
 * space inside a line, and each of {@link LINES} as a line after each line,
 * the header line included. Each input has one insertion.
 */
function insertedInputsOf(fixture: Fixture): MutationInput[] {
  const lines = fixture.input.split("\n")
  const texts: [string, string][] = []
  lines.forEach((line, lineIndex) => {
    const before = lines.slice(0, lineIndex)
    const after = lines.slice(lineIndex + 1)
    const lineNumber = lineIndex + 1
    for (const comment of COMMENTS) {
      if (line !== "") {
        texts.push([
          `${comment} at the end of line ${lineNumber}`,
          [...before, `${line} ${comment}`, ...after].join("\n"),
        ])
      }
      for (let index = 0; index < line.length; index += 1) {
        if (line[index] !== " ") continue
        const changed = `${line.slice(0, index + 1)}${comment} ${line.slice(index + 1)}`
        texts.push([
          `${comment} after the space at ${index} of line ${lineNumber}`,
          [...before, changed, ...after].join("\n"),
        ])
      }
    }
    for (const inserted of LINES) {
      texts.push([
        `a line ${inserted} after line ${lineNumber}`,
        [...before, line, inserted, ...after].join("\n"),
      ])
    }
  })
  return texts.map(([description, text]) => ({
    name: `${fixture.name}: ${description}`,
    text,
    ...(fixture.config === undefined ? {} : { config: fixture.config }),
  }))
}

describe("the state parser agrees with mermaid.js", async () => {
  const mutants: MutationInput[] = []
  for (const fixture of await loadFixtures("state")) {
    for (const mutant of mutate(fixture.input, {
      seed: SEED,
      count: MUTANTS_PER_FIXTURE,
    })) {
      mutants.push({
        name: `${fixture.name}: ${mutant.description}`,
        text: mutant.text,
        ...(fixture.config === undefined ? {} : { config: fixture.config }),
      })
    }
  }
  checkAgreement(inputsByOutcome(mutants))
})

describe("the state parser agrees with mermaid.js on a text inserted between statements", async () => {
  const all: MutationInput[] = []
  const texts = new Set<string>()
  for (const fixture of await loadFixtures("state")) {
    // A fixture of a known divergence would give inputs of two causes at
    // once; the insertions are compared apart from the divergences.
    if (!fixture.expected.accepted || fixture.knownDivergence !== undefined) {
      continue
    }
    for (const input of insertedInputsOf(fixture)) {
      if (texts.has(input.text)) continue
      texts.add(input.text)
      all.push(input)
    }
  }
  const stride = Math.max(1, Math.floor(all.length / INSERTED_INPUTS))
  const inputs = all.filter((_input, index) => index % stride === 0)

  it("has the inputs that it is asked for", () => {
    expect(inputs.length).toBeGreaterThanOrEqual(
      Math.min(INSERTED_INPUTS, all.length),
    )
  })

  checkAgreement(inputsByOutcome(inputs))
})

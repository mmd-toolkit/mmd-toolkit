/**
 * Collects the inputs of one diagram type from a mermaid checkout, as an
 * `add-many` file.
 *
 *   node tools/collect.ts <diagram> --mermaid <checkout> --out <file.json>
 *   node tools/fixtures.ts add-many <diagram> <file.json>
 *
 * The checkout must be at the tag of the pinned mermaid. Inputs come from:
 *
 * - the diagram type's test files that pass diagram texts to mermaid
 *   ({@link SPEC_FILES}), run against stubs (see src/spec-recorder.ts); every
 *   text they pass is kept, rejected or not;
 * - the mermaid blocks of the documentation (`packages/mermaid/src/docs`);
 * - the `<pre class="mermaid">` blocks of the demo pages.
 *
 * Only texts mermaid's detectors give one of the diagram type's ids (or, from
 * the test files, no id) are kept. No input gets a site configuration: the
 * settings a test or a demo page makes are not part of the diagram's text.
 *
 * An input already in the diagram type's fixtures (without a configuration)
 * is left out, and so is a repeat, whose first source is kept. Names are
 * `<source>-<file>-<hash>`, where `<hash>` is the first 8 hexadecimal digits
 * of the SHA-256 of the input, so a name depends only on the input and where
 * it was first found: collecting again adds only new inputs and renames
 * nothing. Two different inputs of one file whose hashes begin alike stop the
 * run, to be named by hand.
 */
/* eslint-disable no-console -- a command-line tool reports on the console */
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { createRequire } from "node:module"
import os from "node:os"
import path from "node:path"
import { parseArgs } from "node:util"
import type { FixtureSource } from "../packages/tests/src/index.ts"
import {
  detectDiagramType,
  mermaidVersion,
} from "../packages/tests/src/mermaid.ts"
import type { DiagramType } from "../packages/tests/src/index.ts"
import { belongsIn, isDiagramType } from "./src/diagrams.ts"
import { fixtureKey, readFixtures } from "./src/fixture-store.ts"
import { recordSpecFile } from "./src/spec-recorder.ts"

/** An input found in the checkout, before names are given. */
interface Candidate {
  /** The start of the fixture name, e.g. `spec-flow-edges`. */
  readonly prefix: string
  readonly input: string
  readonly source: FixtureSource
}

/** One entry of the `add-many` file. */
interface Entry {
  readonly name: string
  readonly input: string
  readonly source: FixtureSource
}

/** A diagram type whose inputs are collected: every one but `common`. */
type CollectedDiagram = Exclude<DiagramType, "common">

/**
 * The test files of each diagram type, by path relative to
 * `packages/mermaid/src`, given the list of a directory's files.
 */
const SPEC_FILES: Readonly<
  Record<CollectedDiagram, (filesIn: (dir: string) => string[]) => string[]>
> = {
  flowchart: (filesIn) => [
    ...filesIn("diagrams/flowchart/parser").filter(
      (file) =>
        file.endsWith(".spec.js") &&
        // One skipped test with about 200,000 characters and 47,917 edges,
        // which mermaid rejects for exceeding `maxEdges`; the fixtures
        // `config-max-edges-*` cover that limit.
        !file.endsWith("/flow-huge.spec.js"),
    ),
    "diagrams/swimlanes/swimlanesDiagram.spec.ts",
  ],
  // The other test files of the directory test the renderer and its drawing
  // functions on Db values and models built in code, and pass no text, except
  // `actorBandModel.spec.ts`: it renders a few texts through a real DOM and
  // asserts on the drawing, which cannot run against stubs. Its texts list
  // participants of every shape, which the documentation and the demos also
  // show.
  sequence: () => ["diagrams/sequence/sequenceDiagram.spec.js"],
  // The other test files of the directory test the Db, the member parser and
  // the drawing functions on values built in code; they pass no text.
  class: () => [
    "diagrams/class/classDiagram.spec.ts",
    "diagrams/class/classDiagram-styles.spec.js",
    "diagrams/class/parser/class.spec.js",
  ],
  // The other test files of the directory test the Db and the renderers on
  // values built in code. `stateRenderer.spec.js` passes a text to the
  // renderer's `draw()` with a stand-in for the diagram, so mermaid.js never
  // parses it.
  state: () => [
    "diagrams/state/stateDiagram.spec.js",
    "diagrams/state/stateDiagram-v2.spec.js",
    "diagrams/state/stateDiagram-colorIndex.spec.ts",
    "diagrams/state/stateNoteEdge.spec.ts",
    "diagrams/state/stateNoteNode.spec.js",
    "diagrams/state/parser/state-parser.spec.js",
    "diagrams/state/parser/state-style.spec.js",
  ],
  // The other test files of the directory pass no text: `erDb.spec.js` calls
  // the Db's methods with values built in code, and `erRenderer.spec.ts` tests
  // the function that makes an id.
  er: () => [
    "diagrams/er/parser/erDiagram.spec.js",
    "diagrams/er/parser/subgraph.spec.js",
  ],
  // The other test file of the directory, `ganttDb.spec.ts`, calls the Db's
  // methods with values built in code and passes no text.
  gantt: () => ["diagrams/gantt/parser/gantt.spec.js"],
  // The other test file of the directory, `journeyDb.spec.js`, calls the Db's
  // methods with values built in code and passes no text.
  journey: () => ["diagrams/user-journey/parser/journey.spec.js"],
  // The other test file of the directory, `requirementDb.spec.ts`, calls the
  // Db's methods with values built in code and passes no text.
  requirement: () => ["diagrams/requirement/parser/requirementDiagram.spec.js"],
  // The other test files of the directory, `mindmapDb.getData.test.ts` and
  // `mindmapLayout.spec.ts`, build their nodes with the Db's methods in code
  // and pass no text.
  mindmap: () => ["diagrams/mindmap/mindmap.spec.ts"],
  // The directory has no other spec file; the renderers and the Db have none.
  timeline: () => ["diagrams/timeline/timeline.spec.js"],
  // The directory has no other spec file. The spec reads `energy.csv` next to
  // it, which the recorder gives it, and passes the texts through
  // `prepareTextForParsing()`, which the recorder leaves as they are, so that
  // the text recorded is the text that mermaid.js is given.
  sankey: () => ["diagrams/sankey/parser/sankey.spec.ts"],
}

/**
 * The tests of the spec files that end with an error after the parse call
 * whose text they are for, with the reason. Such a test is no loss of inputs:
 * the text was recorded before the error. A test of the list that does not end
 * with that error stops the collection, so that the list stays true.
 */
const ERRORS_AFTER_THEIR_INPUT: Readonly<
  Record<
    string,
    readonly {
      readonly test: string
      readonly error: string
      readonly reason: string
    }[]
  >
> = {
  "diagrams/er/parser/erDiagram.spec.js": [
    {
      test: "when parsing ER diagram it... > entity name > cannot contain % because it interferes with parsing comments",
      error: "name is not defined",
      reason:
        "the body reads a variable that the file never defines, after a parse call that throws in mermaid.js; the stub of the parser does not throw",
    },
    {
      test: "when parsing ER diagram it... > entity name > cannot contain \\ because it could start and escape code",
      error: "name is not defined",
      reason:
        "the same: the parse call comes first, and the body then reads an undefined variable",
    },
  ],
}

/** The fence lines that open a mermaid block in the documentation. */
const DOC_FENCES: readonly string[] = [
  "```mermaid",
  "```mermaid-example",
  "```mermaid-nocode",
]

/** The HTML character references found in the demo pages. */
const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": "\u00a0",
  "&quot;": '"',
}

const { values, positionals } = parseArgs({
  options: {
    mermaid: { type: "string" },
    out: { type: "string" },
  },
  allowPositionals: true,
})

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}

/**
 * Collects the candidates, gives the new ones names and writes the file.
 */
async function main(): Promise<void> {
  const [diagram] = positionals
  if (
    positionals.length !== 1 ||
    diagram === undefined ||
    !isDiagramType(diagram) ||
    diagram === "common" ||
    !values.mermaid ||
    !values.out
  ) {
    throw new Error(
      `usage: node tools/collect.ts <${Object.keys(SPEC_FILES).join("|")}> --mermaid <checkout> --out <file.json>`,
    )
  }
  const checkout = path.resolve(values.mermaid)
  const ref = checkRef(checkout)
  const candidates = [
    ...(await specCandidates(diagram, checkout, ref)),
    ...(await docCandidates(diagram, checkout, ref)),
    ...(await demoCandidates(diagram, checkout, ref)),
  ]
  const entries = giveNames(diagram, candidates)
  writeFileSync(
    values.out,
    `${JSON.stringify({ fixtures: entries }, null, 2)}\n`,
  )
  console.log(
    `${candidates.length} inputs found, ${entries.length} new; written to ${values.out}`,
  )
}

/**
 * Returns the tag of the pinned mermaid, after checking that the checkout is
 * at it.
 */
function checkRef(checkout: string): string {
  const ref = `mermaid@${mermaidVersion}`
  const tags = execFileSync(
    "git",
    ["-C", checkout, "tag", "--points-at", "HEAD"],
    {
      encoding: "utf8",
    },
  ).split("\n")
  if (!tags.includes(ref)) {
    throw new Error(
      `${checkout} is not at ${ref} (tags at HEAD: ${tags.join(" ")})`,
    )
  }
  return ref
}

/**
 * Whether mermaid's detectors give `text` one of the ids of `diagram`.
 */
async function isOf(diagram: CollectedDiagram, text: string): Promise<boolean> {
  const id = await detectDiagramType(text)
  return id !== undefined && belongsIn(diagram, id)
}

/**
 * The inputs of the diagram type's test files. Every text is kept except one
 * mermaid detects as another diagram type.
 */
async function specCandidates(
  diagram: CollectedDiagram,
  checkout: string,
  ref: string,
): Promise<Candidate[]> {
  const mermaidSource = path.join(checkout, "packages/mermaid/src")
  const files = SPEC_FILES[diagram]((dir) =>
    readdirSync(path.join(mermaidSource, dir))
      .sort()
      .map((name) => `${dir}/${name}`),
  ).map((file) => path.join(mermaidSource, file))
  const workDir = mkdtempSync(path.join(os.tmpdir(), "mmd-spec-"))
  const candidates: Candidate[] = []
  try {
    const failures: string[] = []
    for (const file of files) {
      const relative = path.relative(checkout, file)
      const prefix = `spec-${kebab(path.basename(file).replace(/\.spec\.[jt]s$/u, ""))}`
      const recording = await recordSpecFile(file, mermaidSource, workDir)
      console.log(
        `${relative}: ${recording.tests} tests, ${recording.inputs.length} inputs, ` +
          `${recording.failures.length} tests ended with an error`,
      )
      const allowed = (
        ERRORS_AFTER_THEIR_INPUT[path.relative(mermaidSource, file)] ?? []
      ).map((entry) => ({ ...entry, used: false }))
      for (const failure of recording.failures) {
        const entry = allowed.find(
          (candidate) =>
            candidate.test === failure.test &&
            candidate.error === failure.error,
        )
        if (entry !== undefined) {
          entry.used = true
          continue
        }
        failures.push(`${relative}: ${failure.test}: ${failure.error}`)
      }
      for (const entry of allowed) {
        if (!entry.used) {
          failures.push(
            `${relative}: ${entry.test}: expected to end with "${entry.error}" (${entry.reason}), and did not`,
          )
        }
      }
      for (const recorded of recording.inputs) {
        const id = await detectDiagramType(recorded.text)
        if (id !== undefined && !belongsIn(diagram, id)) {
          console.log(
            `left out (detected as ${id}): ${relative}:${recorded.line}`,
          )
          continue
        }
        candidates.push({
          prefix,
          input: recorded.text,
          source: {
            kind: "mermaid",
            ref,
            path: relative,
            line: recorded.line,
            test: recorded.test,
          },
        })
      }
    }
    // A test that ended with an error may have stopped before some of its
    // parse calls, so its inputs would be missing without a trace.
    if (failures.length) {
      throw new Error(
        `${failures.length} tests ended with an error, so some of their inputs may be missing; ` +
          `make the recorder's stubs cover what they use, then collect again:\n  ${failures.join("\n  ")}`,
      )
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true })
  }
  return candidates
}

/**
 * The blocks of the documentation that belong to `diagram`. A block's text is
 * its lines, each ending in a line feed.
 */
async function docCandidates(
  diagram: CollectedDiagram,
  checkout: string,
  ref: string,
): Promise<Candidate[]> {
  const docsDir = path.join(checkout, "packages/mermaid/src/docs")
  const candidates: Candidate[] = []
  for (const file of markdownFiles(docsDir)) {
    const relative = path.relative(docsDir, file)
    const prefix = `docs-${kebab(relative.replace(/\.md$/u, ""))}`
    const lines = readFileSync(file, "utf8").split("\n")
    for (let index = 0; index < lines.length; index++) {
      if (!DOC_FENCES.includes(lines[index]?.trimEnd() ?? "")) continue
      const start = index + 1
      let end = start
      while (end < lines.length && !lines[end]?.startsWith("```")) end++
      if (end === lines.length) {
        throw new Error(`${file}:${index + 1}: the block is not closed`)
      }
      const input = lines
        .slice(start, end)
        .map((line) => `${line}\n`)
        .join("")
      index = end
      if (!(await isOf(diagram, input))) continue
      candidates.push({
        prefix,
        input,
        source: {
          kind: "mermaid",
          ref,
          path: path.relative(checkout, file),
          line: start + 1,
        },
      })
    }
  }
  return candidates
}

/**
 * The Markdown files under `dir`, in sorted order.
 */
function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort()
}

/**
 * The blocks of the demo pages that belong to `diagram`.
 *
 * The text is what `mermaid.run()` reads from the page ([`run`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaid.ts#L173-L178)):
 * the element's content with character references decoded, then `dedent()`
 * (mermaid's own `ts-dedent`), then trimmed. Like a browser, the line feed
 * right after `<pre>` is not part of the content. `run()` also rewrites every
 * `<br>` variant to `<br/>`; that is mermaid's processing, not the page's
 * text, so it is not done here.
 */
async function demoCandidates(
  diagram: CollectedDiagram,
  checkout: string,
  ref: string,
): Promise<Candidate[]> {
  const demosDir = path.join(checkout, "demos")
  const dedent = loadDedent()
  const candidates: Candidate[] = []
  for (const page of readdirSync(demosDir)
    .filter((name) => name.endsWith(".html"))
    .sort()) {
    const html = readFileSync(path.join(demosDir, page), "utf8")
    const prefix = `demo-${kebab(page.replace(/\.html$/u, ""))}`
    for (const block of mermaidElements(html)) {
      const input = dedent(decodeEntities(block.content)).trim()
      if (!(await isOf(diagram, input))) continue
      candidates.push({
        prefix,
        input,
        source: {
          kind: "mermaid",
          ref,
          path: `demos/${page}`,
          line: block.line,
        },
      })
    }
  }
  return candidates
}

/**
 * The `<pre>` elements with `class="mermaid"` outside HTML comments: their
 * content, without the line feed right after the start tag, and the line of
 * the start tag.
 */
function mermaidElements(html: string): { content: string; line: number }[] {
  const elements: { content: string; line: number }[] = []
  let position = 0
  while (position < html.length) {
    const comment = html.indexOf("<!--", position)
    const pre = html.indexOf("<pre", position)
    if (pre === -1) break
    if (comment !== -1 && comment < pre) {
      const commentEnd = html.indexOf("-->", comment)
      position = commentEnd === -1 ? html.length : commentEnd + 3
      continue
    }
    const afterName = html.charAt(pre + "<pre".length)
    if (afterName !== ">" && !/\s/u.test(afterName)) {
      position = pre + "<pre".length
      continue
    }
    const tagEnd = html.indexOf(">", pre)
    // The end tag may be split before its `>`: `</pre\n    >`.
    const contentEnd = html.indexOf("</pre", tagEnd)
    const endTagEnd = html.indexOf(">", contentEnd)
    if (tagEnd === -1 || contentEnd === -1 || endTagEnd === -1) {
      throw new Error(`an unclosed <pre> at offset ${pre}`)
    }
    const attributes = html
      .slice(pre + "<pre".length, tagEnd)
      .trim()
      .split(/\s+/u)
    if (attributes.includes('class="mermaid"')) {
      const content = html.slice(tagEnd + 1, contentEnd)
      elements.push({
        content: content.startsWith("\n") ? content.slice(1) : content,
        line: html.slice(0, pre).split("\n").length,
      })
    }
    position = endTagEnd + 1
  }
  return elements
}

/**
 * Decodes the character references of {@link HTML_ENTITIES}; any other
 * reference stops the run, so that the table is extended on purpose.
 */
function decodeEntities(text: string): string {
  return text.replaceAll(/&#?\w+;/gu, (reference) => {
    const decoded = HTML_ENTITIES[reference]
    if (decoded === undefined) {
      throw new Error(
        `unknown character reference ${reference} in a demo block`,
      )
    }
    return decoded
  })
}

/**
 * Loads `ts-dedent`, the `dedent()` that `mermaid.run()` uses, from where
 * mermaid resolves it.
 */
function loadDedent(): (text: string) => string {
  const testsRequire = createRequire(
    path.join(import.meta.dirname, "../packages/tests/package.json"),
  )
  const mermaidRequire = createRequire(
    testsRequire.resolve("mermaid/package.json"),
  )
  return (mermaidRequire("ts-dedent") as { dedent: (text: string) => string })
    .dedent
}

/**
 * Turns a file name into kebab-case: `swimlanesDiagram` and `a_b/c` become
 * `swimlanes-diagram` and `a-b-c`.
 */
function kebab(text: string): string {
  return text
    .replaceAll(/([0-9a-z])([A-Z])/gu, "$1-$2")
    .toLowerCase()
    .replaceAll(/[^0-9a-z]+/gu, "-")
    .replaceAll(/^-|-$/gu, "")
}

/**
 * Gives each new candidate its name and returns the entries. A candidate whose
 * input is already in `fixtures/<diagram>` without a configuration, or earlier
 * in the list, is left out.
 */
function giveNames(
  diagram: CollectedDiagram,
  candidates: readonly Candidate[],
): Entry[] {
  const existing = readFixtures(diagram)
  /** Fixture name by input and configuration. */
  const holders = new Map(
    existing.map((fixture) => [
      fixtureKey(fixture.input, fixture.file.config),
      fixture.name,
    ]),
  )
  /** Input by fixture name, for every name in use. */
  const inputs = new Map(
    existing.map((fixture) => [fixture.name, fixture.input]),
  )
  const entries: Entry[] = []
  let alreadyFixtures = 0
  let repeats = 0
  for (const candidate of candidates) {
    const key = fixtureKey(candidate.input, undefined)
    const holder = holders.get(key)
    if (holder !== undefined) {
      if (existing.some((fixture) => fixture.name === holder)) alreadyFixtures++
      else repeats++
      continue
    }
    const hash = createHash("sha256")
      .update(candidate.input)
      .digest("hex")
      .slice(0, 8)
    const name = `${candidate.prefix}-${hash}`
    if (inputs.has(name)) {
      throw new Error(
        `${name} would name two different inputs; name one by hand (${JSON.stringify(candidate.source)})`,
      )
    }
    holders.set(key, name)
    inputs.set(name, candidate.input)
    entries.push({ name, input: candidate.input, source: candidate.source })
  }
  console.log(
    `left out: ${alreadyFixtures} already fixtures, ${repeats} repeats of an earlier input`,
  )
  return entries
}

/* eslint-enable no-console -- end of the command-line tool */

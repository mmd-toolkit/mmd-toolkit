/**
 * Runs `recordSpecFile` of `tools/src/spec-recorder.ts` in a process of its
 * own and prints what it returned, or its error, as JSON, for the test
 * `tools-spec-recorder.test.ts`.
 *
 * The recorder imports a copy of a test file through Node.js's own `import()`
 * and finds the line of a call in the stack trace of that copy by its
 * `file:` URL. Under Vitest, `import()` is Vite's, whose stack traces name the
 * module in another way, so the recorder cannot run inside a test; the
 * command `tools/collect.ts` runs it in plain Node.js, as this file does.
 *
 * Arguments: the test file, the directory that stands for
 * `packages/mermaid/src`, and the work directory.
 */
import { recordSpecFile } from "../../../tools/src/spec-recorder.ts"

/** The globals the recorder sets while it runs. */
const GLOBAL_NAMES: readonly string[] = [
  "describe",
  "it",
  "test",
  "beforeEach",
  "afterEach",
  "beforeAll",
  "afterAll",
  "expect",
  "vi",
  "__mmdSpecStubs",
]

const [file, mermaidSource, workDir] = process.argv.slice(2)
if (
  file === undefined ||
  mermaidSource === undefined ||
  workDir === undefined
) {
  throw new Error("usage: <test file> <mermaid source> <work directory>")
}

let recording: unknown, error: string | undefined
try {
  recording = await recordSpecFile(file, mermaidSource, workDir)
} catch (thrown) {
  error = thrown instanceof Error ? thrown.message : String(thrown)
}
process.stdout.write(
  JSON.stringify({
    recording,
    error,
    globalsLeft: GLOBAL_NAMES.filter((name) => Object.hasOwn(globalThis, name)),
  }),
)

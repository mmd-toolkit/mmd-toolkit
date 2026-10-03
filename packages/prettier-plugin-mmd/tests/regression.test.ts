/**
 * Formats the inputs of failures that were found and fixed (`regression/*.json`)
 * on every run. The generated tests choose their inputs by a rule and find new
 * failures; these are the inputs themselves, so that a failure that was
 * fixed does not come back.
 *
 * Each file is a list of `{ "text", "note" }`. The characters that a file of
 * this package must not hold, U+2028 and U+2029, are written as escapes.
 */
import { readFile, readdir } from "node:fs/promises"
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"

/** An input of the collection, with why it is there. */
interface RegressionInput {
  readonly text: string
  readonly note: string
}

const FOLDER = new URL("./regression/", import.meta.url)

/** Reads one file of the collection. */
async function readInputs(file: string): Promise<RegressionInput[]> {
  return JSON.parse(await readFile(new URL(file, FOLDER), "utf8"))
}

/** The inputs as the generated tests check them. */
function toGeneratedInputs(
  inputs: readonly RegressionInput[],
): GeneratedInput[] {
  return inputs.map((input) => ({ text: input.text, options: {} }))
}

const files = (await readdir(FOLDER))
  .filter((file) => file.endsWith(".json"))
  .sort()

defineCheckedGroups(
  "the inputs of failures that were fixed",
  await Promise.all(
    files.map(
      async (file) =>
        [file, toGeneratedInputs(await readInputs(file))] as const,
    ),
  ),
  { requiresParsed: true },
)

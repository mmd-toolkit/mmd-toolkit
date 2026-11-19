/** Escaped usecase Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"
import { dbForFormattingComparison } from "./db-comparison.ts"
import { dataBlockEmbeddedForFormattingComparison } from "./data-block-margins.ts"
import {
  dbOfText,
  defaultEmbedded,
  describeFrontmatterChange,
  writtenEmbeddedTexts,
} from "./db-reading.ts"
import { usecaseCases } from "./usecase-cases.ts"

describe("usecase escaped cases", () => {
  it.each(usecaseCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    const before = input.startsWith("\ufeff") ? input.slice(1) : input
    const after = output.startsWith("\ufeff") ? output.slice(1) : output
    const embedded = defaultEmbedded()
    const dbBefore = dbOfText(before, embedded)
    expect(
      dbForFormattingComparison(
        dbBefore,
        dbOfText(after, embedded),
        before,
        after,
      ),
    ).toEqual(dbBefore)
    expect(
      dataBlockEmbeddedForFormattingComparison(
        writtenEmbeddedTexts(before),
        writtenEmbeddedTexts(after),
      ),
    ).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
  })
})

/**
 * The whitespace beside a directive in the stereotype of an actor, as the
 * table of docs/compatibility.md, Usecase native syntax and authored values,
 * gives: the text written after `actor ` and the text printed there.
 */
const stereotypeDirectiveGaps: readonly (readonly [string, string])[] = [
  ["U%%{x}%%<<s>>", "U %%{x}%%<<s>>"],
  ["U%%{x}%% <<s>>", "U %%{x}%%<<s>>"],
  ["U%%{x}%%  <<s>>", "U %%{x}%%<<s>>"],
  ["U %%{x}%%<<s>>", "U %%{x}%%<<s>>"],
  ["U %%{x}%% <<s>>", "U %%{x}%%<<s>>"],
  ["U %%{x}%%  <<s>>", "U %%{x}%%<<s>>"],
  ["U  %%{x}%%<<s>>", "U %%{x}%%<<s>>"],
  ["U  %%{x}%% <<s>>", "U %%{x}%%<<s>>"],
  ["U  %%{x}%%  <<s>>", "U %%{x}%%<<s>>"],
  ["U <<%%{x}%%s>>", "U <<%%{x}%%s>>"],
  ["U <<%%{x}%% s>>", "U <<%%{x}%%s>>"],
  ["U <<%%{x}%%  s>>", "U <<%%{x}%%s>>"],
  ["U << %%{x}%%s>>", "U << %%{x}%%s>>"],
  ["U << %%{x}%% s>>", "U << %%{x}%% s>>"],
  ["U << %%{x}%%  s>>", "U << %%{x}%%  s>>"],
  ["U <<  %%{x}%%s>>", "U << %%{x}%%s>>"],
  ["U <<  %%{x}%% s>>", "U << %%{x}%% s>>"],
  ["U <<  %%{x}%%  s>>", "U << %%{x}%%  s>>"],
  ["U <<s%%{x}%%>>", "U <<s%%{x}%%>>"],
  ["U <<s%%{x}%% >>", "U <<s%%{x}%% >>"],
  ["U <<s%%{x}%%  >>", "U <<s%%{x}%% >>"],
  ["U <<s %%{x}%%>>", "U <<s%%{x}%%>>"],
  ["U <<s %%{x}%% >>", "U <<s %%{x}%% >>"],
  ["U <<s %%{x}%%  >>", "U <<s %%{x}%% >>"],
  ["U <<s  %%{x}%%>>", "U <<s%%{x}%%>>"],
  ["U <<s  %%{x}%% >>", "U <<s  %%{x}%% >>"],
  ["U <<s  %%{x}%%  >>", "U <<s  %%{x}%% >>"],
  ["U <<a%%{x}%%b>>", "U <<a%%{x}%%b>>"],
  ["U <<a%%{x}%% b>>", "U <<a%%{x}%% b>>"],
  ["U <<a%%{x}%%  b>>", "U <<a%%{x}%%  b>>"],
  ["U <<a %%{x}%%b>>", "U <<a %%{x}%%b>>"],
  ["U <<a %%{x}%% b>>", "U <<a %%{x}%% b>>"],
  ["U <<a %%{x}%%  b>>", "U <<a %%{x}%%  b>>"],
  ["U <<a  %%{x}%%b>>", "U <<a  %%{x}%%b>>"],
  ["U <<a  %%{x}%% b>>", "U <<a  %%{x}%% b>>"],
  ["U <<a  %%{x}%%  b>>", "U <<a  %%{x}%%  b>>"],
  ["U <<s\t%%{x}%%\t>>", "U <<s\t%%{x}%% >>"],
  ["U <<\t%%{x}%%\ts>>", "U << %%{x}%%\ts>>"],
  ["U\t%%{x}%%\t<<s>>", "U %%{x}%%<<s>>"],
]

/** Formats the input as the output states, again to the same, with the Db kept. */
async function expectStereotypeKept(
  input: string,
  output: string,
): Promise<void> {
  expect(await formatMermaid(input)).toBe(output)
  expect(await formatMermaid(output)).toBe(output)
  const dbBefore = dbOfText(input, defaultEmbedded())
  expect(
    dbForFormattingComparison(
      dbBefore,
      dbOfText(output, defaultEmbedded()),
      input,
      output,
    ),
  ).toEqual(dbBefore)
}

describe("the whitespace beside a directive in a stereotype", () => {
  it("usecase: a directive beside the text of a stereotype", async () => {
    for (const [written, printed] of stereotypeDirectiveGaps)
      await expectStereotypeKept(
        `usecase-beta\nactor ${written}\n`,
        `usecase-beta\n  actor ${printed}\n`,
      )
  })
})

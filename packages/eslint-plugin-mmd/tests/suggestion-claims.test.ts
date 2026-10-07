/**
 * The claims of `tests/rule-test.ts` fail on a wrong output of a suggestion:
 * each is given the output of a suggestion that goes wrong in one way that the
 * message of the suggestion rules out.
 */
import { Linter } from "eslint"
import { describe, expect, it } from "vitest"
import { rules } from "../src/rules/index.ts"
import { LANGUAGE_CONFIG } from "./helpers.ts"
import type { SuggestionClaim } from "./rule-test.ts"
import { dbOf, expectClaim, readDb } from "./rule-test.ts"

/** The first text that mermaid.js reads starts it, which takes seconds. */
const TIMEOUT = 60_000

const linter = new Linter({ configType: "flat" })

/** Checks `claim` for the output `output` of a suggestion of the rule `name` on `input`. */
async function check(
  name: string,
  claim: SuggestionClaim,
  input: string,
  output: string,
): Promise<void> {
  expect(rules).toHaveProperty([name])
  const reports = linter
    .verify(
      input,
      { ...LANGUAGE_CONFIG, rules: { [`mmd/${name}`]: "error" } },
      "input.mmd",
    )
    .filter((message) => message.ruleId === `mmd/${name}`)
  const [report] = reports
  expect(report).toBeDefined()
  if (report === undefined) return
  await expectClaim(claim, {
    input,
    before: await readDb(input),
    output,
    after: await readDb(output),
    reports,
    report,
  })
}

/**
 * Expects `check` to fail on a claim that the output does not meet, not on
 * mermaid.js rejecting the output.
 */
async function expectFails(attempt: Promise<void>): Promise<void> {
  const error: unknown = await attempt.then(
    () => null,
    (reason: unknown) => reason,
  )
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).name).toBe("AssertionError")
}

describe("the claims of the suggestions", () => {
  const split = "flowchart LR\n  subgraph S\n    A-->B; direction TB\n  end\n"
  it(
    "readsDroppedTextAsStatements holds for the text as statements",
    async () => {
      await check(
        "flowchart/no-ignored-text",
        { kind: "readsDroppedTextAsStatements" },
        split,
        "flowchart LR\n  subgraph S\n    A-->B;\n    direction TB\n  end\n",
      )
    },
    TIMEOUT,
  )
  it(
    "readsDroppedTextAsStatements fails where the text is dropped or changed",
    async () => {
      const claim = { kind: "readsDroppedTextAsStatements" } as const
      const name = "flowchart/no-ignored-text"
      // The text is still dropped.
      await expectFails(check(name, claim, split, split))
      // Only a part of the text is kept.
      await expectFails(
        check(
          name,
          claim,
          split,
          "flowchart LR\n  subgraph S\n    A\n    direction TB\n  end\n",
        ),
      )
      // The text is removed.
      await expectFails(
        check(
          name,
          claim,
          split,
          "flowchart LR\n  subgraph S\n    direction TB\n  end\n",
        ),
      )
      // A statement that was not in the text is added.
      await expectFails(
        check(
          name,
          claim,
          split,
          "flowchart LR\n  subgraph S\n    A-->B;\n    C\n    direction TB\n  end\n",
        ),
      )
    },
    TIMEOUT,
  )

  it(
    "readsDroppedTextAsStatements fails where a field the text leaves alone changes",
    async () => {
      // The direction of the diagram is not the text's to change.
      await expectFails(
        check(
          "flowchart/no-ignored-text",
          { kind: "readsDroppedTextAsStatements" },
          "flowchart TB\n  subgraph S\n    A-->B; direction TB\n  end\n",
          "flowchart LR\n  subgraph S\n    A-->B;\n    direction TB\n  end\n",
        ),
      )
    },
    TIMEOUT,
  )

  const titles = "flowchart LR\n  accTitle: a\n  accTitle: b\n"
  it(
    "usesLastRemaining holds for the statement that remains",
    async () => {
      await check(
        "flowchart/no-duplicate-title",
        { kind: "usesLastRemaining", field: "accTitle" },
        titles,
        "flowchart LR\n  accTitle: a\n",
      )
    },
    TIMEOUT,
  )
  it(
    "usesLastRemaining fails where the other statement is removed",
    async () => {
      await expectFails(
        check(
          "flowchart/no-duplicate-title",
          { kind: "usesLastRemaining", field: "accTitle" },
          titles,
          "flowchart LR\n  accTitle: b\n",
        ),
      )
    },
    TIMEOUT,
  )

  const unclosed = "flowchart LR\n  A --> B\n  accDescr { x\n  B --> C\n"
  it(
    "setsDescription holds for the description of the block as it is meant",
    async () => {
      const name = "flowchart/no-unclosed-description-block"
      await check(
        name,
        { kind: "setsDescription", from: "restOfLine" },
        unclosed,
        "flowchart LR\n  A --> B\n  accDescr { x }\n  B --> C\n",
      )
      await check(
        name,
        { kind: "setsDescription", from: "restOfText" },
        unclosed,
        "flowchart LR\n  A --> B\n  accDescr { x\n  B --> C\n}\n",
      )
    },
    TIMEOUT,
  )
  it(
    "setsDescription fails where the `}` stands one character off",
    async () => {
      const name = "flowchart/no-unclosed-description-block"
      await expectFails(
        check(
          name,
          { kind: "setsDescription", from: "restOfLine" },
          unclosed,
          "flowchart LR\n  A --> B\n  accDescr { }x\n  B --> C\n",
        ),
      )
      await expectFails(
        check(
          name,
          { kind: "setsDescription", from: "restOfText" },
          unclosed,
          "flowchart LR\n  A --> B\n  accDescr { x\n  B --> }C\n",
        ),
      )
    },
    TIMEOUT,
  )

  it(
    "removesBareMarkerLine fails where the Db has no such line before",
    async () => {
      // mermaid.js writes the label again after the line: the Db of the
      // input holds no such line, so the claim has nothing to show.
      await expectFails(
        check(
          "flowchart/no-bare-comment-marker",
          { kind: "removesBareMarkerLine" },
          'flowchart LR\n  A["a\n%%\nb"]\n  A["c"]\n',
          'flowchart LR\n  A["a\nb"]\n  A["c"]\n',
        ),
      )
    },
    TIMEOUT,
  )

  it(
    "removeDataLine leaves a data block with two lines rejected until both are gone",
    async () => {
      const name = "flowchart/no-bare-comment-marker"
      const input = "flowchart LR\n  A@{\n%%\n%%\n    shape: circle\n  }\n"
      const claim = { kind: "removesBareMarkerLine" } as const
      // One line gone: mermaid.js still rejects the other, and the claim holds.
      await check(
        name,
        claim,
        input,
        "flowchart LR\n  A@{\n%%\n    shape: circle\n  }\n",
      )
      // Both lines gone: mermaid.js accepts it.
      expect(
        await dbOf("flowchart LR\n  A@{\n    shape: circle\n  }\n"),
      ).toBeDefined()
    },
    TIMEOUT,
  )

  it(
    "removesBareMarkerLine fails where the other lines of only `%%` go too",
    async () => {
      await expectFails(
        check(
          "flowchart/no-bare-comment-marker",
          { kind: "removesBareMarkerLine" },
          'flowchart LR\n  A["a\n%%\n%%\nb"]\n',
          'flowchart LR\n  A["a\nb"]\n',
        ),
      )
    },
    TIMEOUT,
  )

  it(
    "removesVertexOfLine fails where another vertex goes instead",
    async () => {
      await expectFails(
        check(
          "flowchart/no-bare-comment-marker",
          { kind: "removesVertexOfLine", id: "%%" },
          "flowchart LR\n%%\nA\n",
          "flowchart LR\n%%\n",
        ),
      )
    },
    TIMEOUT,
  )

  it(
    "removesBareMarkerLine fails where the next line becomes the value",
    async () => {
      // `click A` takes the next line as the name: with the line gone, `cb`
      // is the name, and the vertex `cb` is gone: two values change.
      await expectFails(
        check(
          "flowchart/no-bare-comment-marker",
          { kind: "removesBareMarkerLine" },
          "flowchart LR\n  A\n  click A\n%%\ncb\n",
          "flowchart LR\n  A\n  click A\ncb\n",
        ),
      )
    },
    TIMEOUT,
  )

  it(
    "removesBareMarkerLine fails where a value stops being a text",
    async () => {
      // The label goes: the vertex has no text of its own any more.
      await expectFails(
        check(
          "flowchart/no-bare-comment-marker",
          { kind: "removesBareMarkerLine" },
          'flowchart LR\n  A["a\n%%\nb"]\n',
          "flowchart LR\n  A\n",
        ),
      )
    },
    TIMEOUT,
  )
})

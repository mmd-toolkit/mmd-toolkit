/**
 * The claims of `tests/rule-test.ts` fail on a wrong result of a suggestion.
 * Each test takes the facts of a real suggestion, as the corpus records them,
 * and changes one thing in them that the message of the suggestion rules out:
 * the Db of the result, or the text. The claim holds for the facts as they are
 * (the tests of the rules check that), and fails for the changed ones.
 */
import { describe, expect, it } from "vitest"
import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"
import type { ClaimFacts, SuggestionClaim } from "./rule-test.ts"
import { claimFactsOf, expectClaim } from "./rule-test.ts"

/** The first text of the corpus that is read takes time. */
const TIMEOUT = 60_000

/**
 * Expects the claim to fail on `facts`, not on something else going wrong.
 */
function expectFails(claim: SuggestionClaim, facts: ClaimFacts): void {
  let error: unknown = null
  try {
    expectClaim(claim, facts)
  } catch (reason) {
    error = reason
  }
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).name).toBe("AssertionError")
}

/** `db` with the field `field` set to `value`. */
function withField(
  db: DbSummary | null,
  field: string,
  value: JsonValue,
): DbSummary {
  return { ...(db ?? {}), [field]: value }
}

/** The entries of the collection `field` of `db`, as a list. */
function entriesOf(db: DbSummary | null, field: string): JsonValue[] {
  const value = db?.[field]
  return Array.isArray(value) ? value : []
}

/** `entry` as an object, or null where it is none. */
function asObject(
  entry: JsonValue,
): { readonly [key: string]: JsonValue } | null {
  return typeof entry === "object" && entry !== null && !Array.isArray(entry)
    ? (entry as { readonly [key: string]: JsonValue })
    : null
}

/** `entry` with `change` applied, where it is an object. */
function changed(
  entry: JsonValue,
  change: Record<string, JsonValue>,
): JsonValue {
  const object = asObject(entry)
  return object === null ? entry : { ...object, ...change }
}

/** The id of `entry`, where it has one. */
function idOf(entry: JsonValue): JsonValue | undefined {
  return asObject(entry)?.id
}

/** The members of the subgraph `entry`. */
function membersOf(entry: JsonValue): JsonValue[] {
  const nodes = asObject(entry)?.nodes
  return Array.isArray(nodes) ? [...nodes] : []
}

describe("the claims of the suggestions", () => {
  const ignoredText = "flowchart/no-ignored-text"
  const split = "docs/rules/flowchart/no-ignored-text.md incorrect 1"
  const splitClaim = { kind: "readsDroppedTextAsStatements" } as const

  it(
    "readsDroppedTextAsStatements holds for the recorded facts",
    async () => {
      expectClaim(
        splitClaim,
        await claimFactsOf(ignoredText, split, "splitAtSeparator"),
      )
    },
    TIMEOUT,
  )
  it(
    "readsDroppedTextAsStatements fails where the text is dropped or changed",
    async () => {
      const facts = await claimFactsOf(ignoredText, split, "splitAtSeparator")
      // The text is still dropped: the Db is what it was.
      expectFails(splitClaim, { ...facts, after: facts.before })
      // Only a part of the text is kept.
      expectFails(splitClaim, {
        ...facts,
        after: withField(
          facts.after,
          "vertices",
          entriesOf(facts.after, "vertices").filter(
            (entry) => idOf(entry) !== "B",
          ),
        ),
      })
      // A statement that was not in the text is added.
      expectFails(splitClaim, {
        ...facts,
        after: withField(facts.after, "vertices", [
          ...entriesOf(facts.after, "vertices"),
          {
            id: "C",
            labelType: "text",
            styles: [],
            classes: [],
            text: "C",
            props: {},
          },
        ]),
      })
    },
    TIMEOUT,
  )
  it(
    "readsDroppedTextAsStatements fails where a field the text leaves alone changes",
    async () => {
      // The direction of the diagram is not the text's to change.
      const facts = await claimFactsOf(ignoredText, split, "splitAtSeparator")
      expectFails(splitClaim, {
        ...facts,
        after: withField(facts.after, "direction", "TB"),
      })
    },
    TIMEOUT,
  )
  it(
    "readsDroppedTextAsStatements fails where a `;` becomes a member of the subgraph",
    async () => {
      // Kept after a description block, the `;` is a statement of its own.
      const facts = await claimFactsOf(
        ignoredText,
        "invalid/flowchart/db-subgraph-description-block-then-semicolon-direction",
        "splitAtSeparator",
      )
      expectClaim(splitClaim, facts)
      expectFails(splitClaim, {
        ...facts,
        after: withField(
          facts.after,
          "subgraphs",
          entriesOf(facts.after, "subgraphs").map((entry) =>
            changed(entry, { nodes: [...membersOf(entry), ";"] }),
          ),
        ),
      })
    },
    TIMEOUT,
  )

  const titles = "flowchart/no-duplicate-title"
  const twoTitles = "docs/rules/flowchart/no-duplicate-title.md incorrect 1"
  const lastRemaining = {
    kind: "usesLastRemaining",
    field: "accTitle",
  } as const
  it(
    "usesLastRemaining holds for the statement that remains, and fails where the other goes",
    async () => {
      expectClaim(
        lastRemaining,
        await claimFactsOf(titles, twoTitles, "removeThis"),
      )
      // The suggestion that removes the other statement is not `removeThis`:
      // the statement that the report marks does not go.
      const other = await claimFactsOf(titles, twoTitles, "removePrevious")
      expectFails(lastRemaining, other)
    },
    TIMEOUT,
  )
  it(
    "usesLastRemaining fails where a `;` that mermaid.js ignores stays and becomes a member",
    async () => {
      const name = "invalid/flowchart/db-subgraph-acc-title-style-member"
      const facts = await claimFactsOf(titles, name, "removeThis")
      expectClaim(lastRemaining, facts)
      // The `;` stays: it is a statement of its own, and a member.
      expectFails(lastRemaining, {
        ...facts,
        after: withField(
          facts.after,
          "subgraphs",
          entriesOf(facts.after, "subgraphs").map((entry) =>
            changed(entry, { nodes: ["a", ";"] }),
          ),
        ),
      })
    },
    TIMEOUT,
  )

  const unclosed = "flowchart/no-unclosed-description-block"
  const block =
    "docs/rules/flowchart/no-unclosed-description-block.md incorrect 2"
  it(
    "setsDescription holds for the description of the block as it is meant",
    async () => {
      expectClaim(
        { kind: "setsDescription", from: "restOfLine" },
        await claimFactsOf(unclosed, block, "closeAtLineEnd"),
      )
      expectClaim(
        { kind: "setsDescription", from: "restOfText" },
        await claimFactsOf(unclosed, block, "closeAtTextEnd"),
      )
    },
    TIMEOUT,
  )
  it(
    "setsDescription fails where the `}` stands one character off",
    async () => {
      const line = await claimFactsOf(unclosed, block, "closeAtLineEnd")
      expectFails(
        { kind: "setsDescription", from: "restOfLine" },
        { ...line, output: line.output.replace("{ x }", "{ }x") },
      )
      const text = await claimFactsOf(unclosed, block, "closeAtTextEnd")
      expectFails(
        { kind: "setsDescription", from: "restOfText" },
        { ...text, output: text.output.replace("B --> C\n}", "B --> }C\n") },
      )
    },
    TIMEOUT,
  )

  const marker = "flowchart/no-bare-comment-marker"
  const twoLines =
    "invalid/flowchart/gram-bare-comment-marker-two-lines-in-label"
  const bareLine = { kind: "removesBareMarkerLine" } as const

  /** `db` with the text of its first vertex set to `text`. */
  function withFirstText(db: DbSummary | null, text: JsonValue): DbSummary {
    return withField(
      db,
      "vertices",
      entriesOf(db, "vertices").map((entry, index) =>
        index === 0 ? changed(entry, { text }) : entry,
      ),
    )
  }

  it(
    "removesBareMarkerLine fails where the Db has no such line before",
    async () => {
      // The Db of the input holds no such line, so the claim has nothing to show.
      const facts = await claimFactsOf(marker, twoLines, "removeTextLine")
      expectClaim(bareLine, facts)
      expectFails(bareLine, { ...facts, before: facts.after })
    },
    TIMEOUT,
  )
  it(
    "removesBareMarkerLine fails where the other lines of only `%%` go too",
    async () => {
      const facts = await claimFactsOf(marker, twoLines, "removeTextLine")
      expectFails(bareLine, {
        ...facts,
        after: withFirstText(facts.after, "a\nb"),
      })
    },
    TIMEOUT,
  )
  it(
    "removesBareMarkerLine fails where a value stops being a text",
    async () => {
      const facts = await claimFactsOf(marker, twoLines, "removeTextLine")
      expectFails(bareLine, {
        ...facts,
        after: withFirstText(facts.after, null),
      })
    },
    TIMEOUT,
  )
  it(
    "removesBareMarkerLine fails where two values change",
    async () => {
      // `click A` takes the next line as its name: with the line gone, another
      // value changes besides the one that held the line.
      const facts = await claimFactsOf(marker, twoLines, "removeTextLine")
      expectFails(bareLine, {
        ...facts,
        after: withField(facts.after, "accTitle", "changed"),
      })
    },
    TIMEOUT,
  )
  it(
    "removesVertexOfLine fails where another vertex goes instead",
    async () => {
      const claim = { kind: "removesVertexOfLine", id: "%%" } as const
      const facts = await claimFactsOf(
        marker,
        "invalid/flowchart/gram-bare-comment-marker-two-vertex-lines",
        "removeMarker",
      )
      expectClaim(claim, facts)
      expectFails(claim, {
        ...facts,
        output: facts.output.replace("\nA\n", "\n"),
        after: withField(
          facts.after,
          "vertices",
          entriesOf(facts.before, "vertices").filter(
            (entry) => idOf(entry) !== "A",
          ),
        ),
      })
    },
    TIMEOUT,
  )
})

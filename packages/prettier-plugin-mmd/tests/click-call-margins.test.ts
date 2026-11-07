import { describe, expect, it } from "vitest"
import type { DbSummary } from "@mmd-toolkit/tests"
import { clickCallDbForFormattingComparison } from "./click-call-margins.ts"

/** Two Dbs of a text, before and after it is formatted. */
interface DbPair {
  readonly name: string
  readonly before: DbSummary
  readonly after: DbSummary
}

/** The Db of a text with one click call. */
function call(args: string): DbSummary {
  return { clickCalls: [{ id: "A", name: "f", args }] }
}

const restored: readonly DbPair[] = [
  {
    name: "the whitespace at the ends and around the commas",
    before: call('  "x" ,y ,   z  '),
    after: call('"x", y, z'),
  },
  {
    name: "the whitespace beside a comma that ends a part",
    before: call('a ,"b,c" , d'),
    after: call('a, "b,c", d'),
  },
]

const kept: readonly DbPair[] = [
  {
    name: "the whitespace inside a part in quotes",
    before: call('" x ", y'),
    after: call('"x", y'),
  },
  {
    name: "the whitespace beside a comma inside quotes",
    before: call('"a , b"'),
    after: call('"a, b"'),
  },
  {
    name: "a part that changed",
    before: call("a, b"),
    after: call("a, c"),
  },
  {
    name: "a part that was added",
    before: call("a, b"),
    after: call("a, b, c"),
  },
]

describe("the whitespace of click call arguments that the formatter changes", () => {
  it.each(restored)("restores $name", ({ before, after }) => {
    expect(clickCallDbForFormattingComparison(before, after)).toEqual(before)
  })

  it.each(kept)("keeps $name as a difference", ({ before, after }) => {
    expect(clickCallDbForFormattingComparison(before, after)).toEqual(after)
  })

  it("passes a Db that is missing through", () => {
    expect(clickCallDbForFormattingComparison(null, null)).toBeNull()
  })

  it("passes a Db without click calls through", () => {
    expect(clickCallDbForFormattingComparison({}, {})).toEqual({})
  })
})

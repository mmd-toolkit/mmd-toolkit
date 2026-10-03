import { describe, expect, it } from "vitest"
import type { KindSource } from "../src/boundary-kinds.ts"
import {
  findBoundaries,
  findInnerPlaces,
  selectByKey,
} from "../src/boundary-kinds.ts"

/** A source of `text` with only the given parts. */
function sourceOf(text: string, parts: Partial<KindSource>): KindSource {
  return { text, tokens: [], comments: [], directives: [], ...parts }
}

describe("findBoundaries", () => {
  it("gives each offset where a token starts or ends the parts of its kind", () => {
    const source = sourceOf("ab cd\n", {
      tokens: [
        { type: "Identifier", value: "ab", range: [0, 2] },
        { type: "Identifier", value: "cd", range: [3, 5] },
      ],
    })
    expect(findBoundaries(source)).toEqual([
      {
        offset: 0,
        before: "-",
        position: "start",
        statement: "Identifier",
        after: "Identifier",
        atEnd: false,
      },
      {
        offset: 2,
        before: "Identifier",
        position: "mid",
        statement: "Identifier",
        after: "-",
        atEnd: false,
      },
      {
        offset: 3,
        before: "-",
        position: "mid",
        statement: "Identifier",
        after: "Identifier",
        atEnd: false,
      },
      {
        offset: 5,
        before: "Identifier",
        position: "lineEnd",
        statement: "Identifier",
        after: "-",
        atEnd: true,
      },
    ])
  })

  it("describes keywords and punctuators by value, lower-cased and cut at 14 characters", () => {
    const text = "GRAPH\nsubgraphsubgraphsubgraph -->"
    const source = sourceOf(text, {
      tokens: [
        { type: "Keyword", value: "GRAPH", range: [0, 5] },
        { type: "Keyword", value: "subgraphsubgraphsubgraph", range: [6, 30] },
        { type: "Punctuator", value: "-->", range: [31, 34] },
      ],
    })
    const boundaries = findBoundaries(source)
    expect(boundaries.map((boundary) => boundary.after)).toContain(
      "Keyword:graph",
    )
    expect(boundaries.map((boundary) => boundary.after)).toContain(
      "Keyword:subgraphsubgra",
    )
    expect(boundaries.map((boundary) => boundary.after)).toContain(
      "Punctuator:-->",
    )
    expect(boundaries.map((boundary) => boundary.statement)).toContain("graph")
    expect(boundaries.map((boundary) => boundary.statement)).toContain(
      "subgraphsubgraphsubgraph",
    )
  })

  it("describes a directive by whether it is closed, a comment by its mark, and a `;` that is ignored by its type", () => {
    const text = "%%{a}%% x; %% c\n%%{b"
    const source = sourceOf(text, {
      tokens: [
        { type: "Directive", value: "%%{a}%%", range: [0, 7] },
        { type: "Identifier", value: "x", range: [8, 9] },
        { type: "IgnoredSemicolon", value: ";", range: [9, 10] },
        { type: "Directive", value: "%%{b", range: [16, 20] },
      ],
      directives: [
        { closed: true, range: [0, 7] },
        { closed: false, range: [16, 20] },
      ],
      comments: [{ mark: "%%", range: [11, 15] }],
    })
    const boundaries = findBoundaries(source)

    /** The element before and the element after the boundary at `offset`. */
    function at(offset: number): string {
      const boundary = boundaries.find((b) => b.offset === offset)
      return `${boundary?.before} | ${boundary?.after}`
    }

    expect(at(0)).toBe("- | Directive:closed")
    expect(at(9)).toBe("Identifier | IgnoredSemicolon")
    expect(at(10)).toBe("IgnoredSemicolon | -")
    expect(at(11)).toBe("- | Comment:%%")
    expect(at(16)).toBe("- | Directive:open")
  })

  it("names a comment without a mark a fragment", () => {
    const source = sourceOf("ab", { comments: [{ mark: null, range: [0, 2] }] })
    expect(
      findBoundaries(source).map((boundary) => [
        boundary.before,
        boundary.after,
      ]),
    ).toEqual([
      ["-", "Comment:fragment"],
      ["Comment:fragment", "-"],
    ])
  })

  it("gives every position the statement of its line: the first token, or `-`", () => {
    const source = sourceOf("\nbox x y\n", {
      tokens: [
        { type: "Keyword", value: "BOX", range: [1, 4] },
        { type: "Identifier", value: "x", range: [5, 6] },
        { type: "Identifier", value: "y", range: [7, 8] },
      ],
    })
    const byOffset = new Map(
      findBoundaries(source).map((boundary) => [
        boundary.offset,
        [boundary.position, boundary.statement],
      ]),
    )
    expect(byOffset.get(1)).toEqual(["lineStart", "box"])
    expect(byOffset.get(4)).toEqual(["mid", "box"])
    expect(byOffset.get(8)).toEqual(["lineEnd", "box"])
  })

  it("gives the statement `-` to a boundary on a line without a token", () => {
    const source = sourceOf("ab", { comments: [{ mark: "%%", range: [0, 2] }] })
    expect(
      findBoundaries(source).map((boundary) => boundary.statement),
    ).toEqual(["-", "-"])
  })
})

describe("findInnerPlaces", () => {
  it("lists after the first character, the middle and before the last of a token", () => {
    const source = sourceOf("abcdef", {
      tokens: [{ type: "Identifier", value: "abcdef", range: [0, 6] }],
    })
    expect(findInnerPlaces(source)).toEqual([
      {
        offset: 1,
        token: "Identifier",
        position: "after first",
        statement: "Identifier",
      },
      {
        offset: 3,
        token: "Identifier",
        position: "middle",
        statement: "Identifier",
      },
      {
        offset: 5,
        token: "Identifier",
        position: "before last",
        statement: "Identifier",
      },
    ])
  })

  it("lists one place in a token of two characters, two in one of three, and the middle from four", () => {
    const source = sourceOf("ab cde fghi", {
      tokens: [
        { type: "Identifier", value: "ab", range: [0, 2] },
        { type: "Identifier", value: "cde", range: [3, 6] },
        { type: "Identifier", value: "fghi", range: [7, 11] },
      ],
    })
    expect(
      findInnerPlaces(source).map((place) => [place.offset, place.position]),
    ).toEqual([
      [1, "after first"],
      [4, "after first"],
      [5, "before last"],
      [8, "after first"],
      [9, "middle"],
      [10, "before last"],
    ])
  })

  it("lists each offset once", () => {
    const text = "a bc def ghij klmno"
    const tokens = []
    for (const match of text.matchAll(/[a-z]+/gu)) {
      tokens.push({
        type: "Identifier",
        value: match[0],
        range: [match.index, match.index + match[0].length] as const,
      })
    }
    const offsets = findInnerPlaces(sourceOf(text, { tokens })).map(
      (place) => place.offset,
    )
    expect(new Set(offsets).size).toBe(offsets.length)
  })

  it("puts no place between the two halves of a surrogate pair", () => {
    const text = "a\u{1F600}b\u{1F600}c"
    const source = sourceOf(text, {
      tokens: [{ type: "RawText", value: text, range: [0, text.length] }],
    })
    const offsets = findInnerPlaces(source).map((place) => place.offset)
    expect(offsets).toEqual([1, 3, 6])
    for (const offset of offsets) {
      expect(text.charCodeAt(offset) & 0xfc00).not.toBe(0xdc00)
    }
  })

  it("lists nothing in a token of one character, a directive or a comment", () => {
    const source = sourceOf("a %%{b}%% %% cc", {
      tokens: [
        { type: "Identifier", value: "a", range: [0, 1] },
        { type: "Directive", value: "%%{b}%%", range: [2, 9] },
      ],
      directives: [{ closed: true, range: [2, 9] }],
      comments: [{ mark: "%%", range: [10, 15] }],
    })
    expect(findInnerPlaces(source)).toEqual([])
  })

  it("gives a place the statement of its line, as a boundary has it", () => {
    const text = "box abcd\nxy"
    const source = sourceOf(text, {
      tokens: [
        { type: "Keyword", value: "box", range: [0, 3] },
        { type: "Identifier", value: "abcd", range: [4, 8] },
        { type: "Identifier", value: "xy", range: [9, 11] },
      ],
    })
    expect(
      findInnerPlaces(source).map((place) => [place.token, place.statement]),
    ).toEqual([
      ["Keyword:box", "box"],
      ["Keyword:box", "box"],
      ["Identifier", "box"],
      ["Identifier", "box"],
      ["Identifier", "box"],
      ["Identifier", "Identifier"],
    ])
  })

  it("describes the token as a boundary does", () => {
    const source = sourceOf("GRAPH", {
      tokens: [{ type: "Keyword", value: "GRAPH", range: [0, 5] }],
    })
    expect(
      new Set(findInnerPlaces(source).map((place) => place.token)),
    ).toEqual(new Set(["Keyword:graph"]))
  })
})

describe("selectByKey", () => {
  interface Place {
    readonly key: string
    readonly id: string
  }

  /** A place of `key`, told apart from the others by `id`. */
  function place(key: string, id: string): Place {
    return { key, id }
  }

  /** The key of a place. */
  function keyOf(candidate: Place): string {
    return candidate.key
  }

  it("takes the first place of a key from each list before a second from any", () => {
    const lists = [
      [place("a", "1-a1"), place("a", "1-a2"), place("b", "1-b1")],
      [place("a", "2-a1")],
      [place("a", "3-a1"), place("a", "3-a2")],
    ]
    const selected = selectByKey(lists, 2, keyOf)
    expect(selected.get("a")?.map((p) => p.id)).toEqual(["1-a1", "2-a1"])
    expect(selected.get("b")?.map((p) => p.id)).toEqual(["1-b1"])
  })

  it("takes further places of a key from the lists that have them when fewer than `perKey` lists do", () => {
    const lists = [[place("a", "1-a1"), place("a", "1-a2"), place("a", "1-a3")]]
    expect(
      selectByKey(lists, 2, keyOf)
        .get("a")
        ?.map((p) => p.id),
    ).toEqual(["1-a1", "1-a2"])
  })

  it("makes the key from the parts the caller chooses", () => {
    const lists = [
      [
        { position: "mid", statement: "box" },
        { position: "mid", statement: "title" },
      ],
    ]
    expect(selectByKey(lists, 1, (p) => p.position).get("mid")).toHaveLength(1)
    expect(
      selectByKey(lists, 1, (p) => `${p.position} | ${p.statement}`).size,
    ).toBe(2)
  })
})

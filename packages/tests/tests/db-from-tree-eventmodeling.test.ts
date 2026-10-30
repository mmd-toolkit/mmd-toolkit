import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  loadFixture,
} from "../src/index.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { setField } from "./check-tree-recorded.ts"
import { frontmatterOf } from "./check-tree-trees.ts"
import {
  buildEventmodeling,
  common,
  frame,
  qualified,
  sourceReference,
  dataReference,
  data,
  blockStatement,
  writtenTree,
} from "./eventmodeling-built.ts"

/** Public conversion of fixed, explicitly authored trees. */
function summary(
  built: Built,
  embedded: EmbeddedValues = {
    config: {},
    title: undefined,
    dataBlockEffects: [],
  },
) {
  return dbFromTree(
    built.source,
    built.tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

/** A test supplies occurrences without parsing its fixed source. */
function reading(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded?: EmbeddedValues,
) {
  return summary(buildEventmodeling(source, make), embedded)
}

describe("eventmodeling Db from hand-built trees", () => {
  it("publishes empty defaults, ignoring the frontmatter and authored title", () => {
    expect(
      reading("eventmodeling title T", (k) => [common(k, "Title", "T")], {
        config: {},
        title: "Frontmatter",
        dataBlockEffects: [],
      }),
    ).toEqual({ accTitle: "", accDescr: "", frames: [] })
  })

  it("publishes frames in source order and selects the first referenced data, omitting unused statements", () => {
    expect(summary(writtenTree())).toEqual({
      accTitle: "accTitle: Title",
      accDescr: " accDescr {}",
      frames: [
        {
          kind: "time",
          name: "01",
          modelEntityType: "evt",
          entityIdentifier: "Shop.Bought",
          sourceFrames: ["02"],
          data: { kind: "block", value: "{\ny\n}\n" },
        },
        {
          kind: "reset",
          name: "02",
          modelEntityType: "cmd",
          entityIdentifier: "Shop.Buy",
          sourceFrames: [],
          data: null,
        },
        {
          kind: "time",
          name: "03",
          modelEntityType: "ui",
          entityIdentifier: "Shop.Screen",
          sourceFrames: [],
          data: null,
        },
      ],
    })
  })

  it("keeps repeated frames, leading zero identities and sorted source sets without resolving names", () => {
    const result = reading(
      "eventmodeling\ntf 01 event A ->> 2 ->> 001 ->> 2 ->> 01\nrf 01 command B ->> 99",
      (k) => [
        frame(k, "01", "event", () => qualified(k, "A"), {
          sources: [
            () => sourceReference(k, "2"),
            () => sourceReference(k, "001"),
            () => sourceReference(k, "2"),
            () => sourceReference(k, "01"),
          ],
        }),
        frame(k, "01", "command", () => qualified(k, "B"), {
          keyword: "rf",
          sources: [() => sourceReference(k, "99")],
        }),
      ],
    )
    expect(result.frames).toEqual([
      {
        kind: "time",
        name: "01",
        modelEntityType: "event",
        entityIdentifier: "A",
        sourceFrames: ["001", "01", "2"],
        data: null,
      },
      {
        kind: "reset",
        name: "01",
        modelEntityType: "command",
        entityIdentifier: "B",
        sourceFrames: ["99"],
        data: null,
      },
    ])
  })

  it("chooses an empty first declaration over a later one and inline fallback, including forward references", () => {
    const result = reading(
      'eventmodeling\ntf 1 evt A [[D]] "inline"\ndata D {\n}\ndata D {\nlater\n}',
      (k) => [
        frame(k, "1", "evt", () => qualified(k, "A"), {
          reference: () => dataReference(k, "D"),
          data: () => data(k, '"inline"'),
        }),
        blockStatement(k, "data", "D", () => data(k, "{\n}", true)),
        blockStatement(k, "data", "D", () => data(k, "{\nlater\n}", true)),
      ],
    )
    expect(result.frames).toEqual([
      {
        kind: "time",
        name: "1",
        modelEntityType: "evt",
        entityIdentifier: "A",
        sourceFrames: [],
        data: { kind: "block", value: "{\n}\n" },
      },
    ])
  })

  it("falls back to inline or null for unresolved data and preserves quoted backslashes and empty bodies", () => {
    const result = reading(
      'eventmodeling\ntf 1 evt A [[Missing]] "\\n\\q"\ntf 2 evt B [[Missing]]\ntf 3 evt C {}\ntf 4 evt D ""',
      (k) => [
        frame(k, "1", "evt", () => qualified(k, "A"), {
          reference: () => dataReference(k, "Missing"),
          data: () => data(k, '"\\n\\q"'),
        }),
        frame(k, "2", "evt", () => qualified(k, "B"), {
          reference: () => dataReference(k, "Missing"),
        }),
        frame(k, "3", "evt", () => qualified(k, "C"), {
          data: () => data(k, "{}"),
        }),
        frame(k, "4", "evt", () => qualified(k, "D"), {
          data: () => data(k, '""'),
        }),
      ],
    )
    expect(
      (result.frames as { data: unknown }[]).map((part) => part.data),
    ).toEqual([
      { kind: "inline", value: '"\\n\\q"' },
      null,
      { kind: "inline", value: "{}" },
      { kind: "inline", value: '""' },
    ])
  })

  it("preserves whole metadata terminals and final empty assignments, folding only description LF whitespace", () => {
    expect(
      reading(
        "eventmodeling accTitle: Old\ndata D {\nx\n}\n\taccDescr { A\r\n  B  } accTitle:",
        (k) => [
          common(k, "AccTitle", " Old"),
          blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
          common(k, "AccDescrBlock", " A\r\n  B  "),
          common(k, "AccTitle", null),
        ],
      ),
    ).toEqual({
      accTitle: "accTitle:",
      accDescr: "\taccDescr { A\nB  }",
      frames: [],
    })
  })

  it("keeps the block's appended closing LF at EOF and omits a lookahead-only boundary", () => {
    expect(
      reading("eventmodeling\ntf 1 evt A [[D]]\ndata D {\nx\n}", (k) => [
        frame(k, "1", "evt", () => qualified(k, "A"), {
          reference: () => dataReference(k, "D"),
        }),
        blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
      ]).frames,
    ).toEqual([
      {
        kind: "time",
        name: "1",
        modelEntityType: "evt",
        entityIdentifier: "A",
        sourceFrames: [],
        data: { kind: "block", value: "{\nx\n}\n" },
      },
    ])
    expect(
      reading("eventmodeling\ndata D {\nx\n} tf 1 evt A [[D]]", (k) => [
        blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
        frame(k, "1", "evt", () => qualified(k, "A"), {
          reference: () => dataReference(k, "D"),
        }),
      ]).frames,
    ).toEqual([
      {
        kind: "time",
        name: "1",
        modelEntityType: "evt",
        entityIdentifier: "A",
        sourceFrames: [],
        data: { kind: "block", value: "{\nx\n}" },
      },
    ])
  })

  it("joins surviving horizontal prefixes across a directive and selected semicolon", () => {
    const result = reading(
      'eventmodeling tf 00 evt M "style:#x" \t; accDescr: D',
      (k) => {
        const f = frame(k, "00", "evt", () => qualified(k, "M"), {
          data: () => data(k, '"style:#x"'),
        })
        k.token("IgnoredSemicolon", ";")
        return [f, common(k, "AccDescr", " D")]
      },
    )
    expect(result.accDescr).toBe(" \t accDescr: D")
    expect(
      reading("eventmodeling tf 01 evt A \t%%{init:{}}%%  accDescr: D", (k) => {
        const f = frame(k, "01", "evt", () => qualified(k, "A"))
        k.directive("%%{init:{}}%%")
        return [f, common(k, "AccDescr", " D")]
      }).accDescr,
    ).toBe(" \t  accDescr: D")
  })

  it("applies the security fixture's site configuration only to common accessibility texts", async () => {
    const fixture = await loadFixture(
      "eventmodeling",
      "config-security-level-other",
    )
    if (!fixture.expected.accepted) throw new Error("rejected security fixture")
    const embedded = embeddedValuesOf(fixture, fixture.expected)
    if (embedded === undefined)
      throw new Error("missing embedded configuration")
    expect(
      reading(
        fixture.input,
        (k) => [
          common(k, "AccTitle", ' a<b x="y">c</b> = d'),
          frame(k, "01", "evt", () => qualified(k, "A"), {
            data: () => data(k, "{ a<b>c</b> = d }"),
          }),
        ],
        embedded,
      ),
    ).toEqual(fixture.expected.db)
  })

  it("uses the shared specified reading for the frontmatter HTML value case", async () => {
    const fixture = await loadFixture(
      "eventmodeling",
      "div-html-frontmatter-value",
    )
    const result = fixture.specified
    if (result === undefined || !result.accepted)
      throw new Error("missing HTML specified reading")
    const embedded = embeddedValuesOf(fixture, result)
    if (embedded === undefined) throw new Error("missing embedded title")
    const built = buildEventmodeling(fixture.input, (k) => [
      common(k, "AccTitle", ' b="c">d'),
    ])
    const end = fixture.input.indexOf("\n---", 4) + 4
    setField(
      built.tree,
      "frontmatter",
      frontmatterOf(fixture.input, fixture.input.slice(0, end), [4, end - 4]),
    )
    expect(summary(built, embedded)).toEqual(result.db)
    expect(result.db).not.toEqual(
      fixture.expected.accepted ? fixture.expected.db : null,
    )
  })
})

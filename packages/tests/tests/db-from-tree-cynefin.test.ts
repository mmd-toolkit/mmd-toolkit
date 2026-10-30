import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  loadFixture,
} from "../src/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { frontmatterOf } from "./check-tree-trees.ts"
import { buildCynefin, domain, item, transition } from "./cynefin-built.ts"
import { common, ignored } from "./statement-tree-built.ts"

/** Explicit authored trees use the public builder and shared converted/embedded readings. */
function summary(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: {},
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const { tree } = buildCynefin(source, make)
  return dbFromTree(
    source,
    tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("cynefin Db from hand-built trees", () => {
  it("publishes empty defaults and omits empty domains", () => {
    expect(
      summary("cynefin-beta\ncomplex\nclear", (k) => [
        domain(k, "complex"),
        domain(k, "clear"),
      ]),
    ).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      domains: [],
      transitions: [],
    })
  })

  it("publishes renderer order and keeps empty, duplicate and overflow items", () => {
    const result = summary(
      'cynefin-beta\nconfusion "1" "2" "3" "4"\nclear ""\nchaotic "A" "A"\ncomplicated "B"\ncomplex "C"',
      (k) => [
        domain(k, "confusion", [
          () => item(k, '"1"'),
          () => item(k, '"2"'),
          () => item(k, '"3"'),
          () => item(k, '"4"'),
        ]),
        domain(k, "clear", [() => item(k, '""')]),
        domain(k, "chaotic", [() => item(k, '"A"'), () => item(k, '"A"')]),
        domain(k, "complicated", [() => item(k, '"B"')]),
        domain(k, "complex", [() => item(k, '"C"')]),
      ],
    )
    expect(result.domains).toEqual([
      { name: "complex", items: [{ label: "C" }] },
      { name: "complicated", items: [{ label: "B" }] },
      { name: "chaotic", items: [{ label: "A" }, { label: "A" }] },
      { name: "clear", items: [{ label: "" }] },
      {
        name: "confusion",
        items: [{ label: "1" }, { label: "2" }, { label: "3" }, { label: "4" }],
      },
    ])
  })

  it("replaces entire blocks, including empty final blocks and a later nonempty block", () => {
    expect(
      summary(
        'cynefin-beta\ncomplex "old"\ncomplex\nclear\nclear "new"\ncomplex "last"\ncomplicated "gone"\ncomplicated',
        (k) => [
          domain(k, "complex", [() => item(k, '"old"')]),
          domain(k, "complex"),
          domain(k, "clear"),
          domain(k, "clear", [() => item(k, '"new"')]),
          domain(k, "complex", [() => item(k, '"last"')]),
          domain(k, "complicated", [() => item(k, '"gone"')]),
          domain(k, "complicated"),
        ],
      ).domains,
    ).toEqual([
      { name: "complex", items: [{ label: "last" }] },
      { name: "clear", items: [{ label: "new" }] },
    ])
  })

  it("keeps duplicate and undeclared transitions in order, omitting self loops and empty labels", () => {
    expect(
      summary(
        'cynefin-beta\nconfusion --> complex\ncomplex --> complex : "self"\nclear --> complicated : ""\nclear --> complicated : " "\nconfusion --> complex',
        (k) => [
          transition(k, "confusion", "complex"),
          transition(k, "complex", "complex", '"self"'),
          transition(k, "clear", "complicated", '""'),
          transition(k, "clear", "complicated", '" "'),
          transition(k, "confusion", "complex"),
        ],
      ).transitions,
    ).toEqual([
      { from: "confusion", to: "complex" },
      { from: "clear", to: "complicated" },
      { from: "clear", to: "complicated", label: " " },
      { from: "confusion", to: "complex" },
    ])
  })

  it("reads shared STRING escapes, entity placeholders, HTML attributes and CRLF", () => {
    const result = summary(
      'cynefin-beta\ncomplex "a\\n\\q\\u0041\\0" "<a b="c">d" "#65;" "A\r\nB"\ncomplex --> clear : "x\\tY"',
      (k) => [
        domain(k, "complex", [
          () => item(k, '"a\\n\\q\\u0041\\0"'),
          () => item(k, '"<a b="c">d"'),
          () => item(k, '"#65;"'),
          () => item(k, '"A\r\nB"'),
        ]),
        transition(k, "complex", "clear", '"x\\tY"'),
      ],
    )
    expect(result.domains).toEqual([
      {
        name: "complex",
        items: [
          { label: "a\nqu0041\0" },
          { label: "<a b='c'>d" },
          { label: "\ufb02\u00b0\u00b065\u00b6\u00df" },
          { label: "A\nB" },
        ],
      },
    ])
    expect(result.transitions).toEqual([
      { from: "complex", to: "clear", label: "x\tY" },
    ])
  })

  it("applies the final common assignment even when empty, retaining the frontmatter title", () => {
    expect(
      summary(
        "cynefin-beta\ntitle First\naccTitle: A\naccDescr: D\ntitle\naccTitle:\naccDescr {}",
        (k) => [
          common(k, "Cynefin", "Title", "First"),
          common(k, "Cynefin", "AccTitle", " A"),
          common(k, "Cynefin", "AccDescr", " D"),
          common(k, "Cynefin", "Title", null),
          common(k, "Cynefin", "AccTitle", null),
          common(k, "Cynefin", "AccDescrBlock", null),
        ],
        { config: {}, title: "Frontmatter", dataBlockEffects: [] },
      ),
    ).toMatchObject({ title: "Frontmatter", accTitle: "", accDescr: "" })
  })

  it("uses shared common line and block conversion and ignores native properties", () => {
    expect(
      summary(
        "cynefin-beta\n---\ntitle: ignored\n---\ntitle  T  U\naccTitle: A\t\tB\naccDescr { A\r\n  B\r\n\r\n C }",
        (k) => [
          ignored(k, "Cynefin", "---\ntitle: ignored\n---", "yaml-block"),
          common(k, "Cynefin", "Title", " T  U"),
          common(k, "Cynefin", "AccTitle", " A\t\tB"),
          common(k, "Cynefin", "AccDescrBlock", "A\r\n  B\r\n\r\n C"),
        ],
      ),
    ).toMatchObject({ title: "T U", accTitle: "A B", accDescr: "A\nB\nC" })
  })

  it("uses the security fixture's site configuration for common texts only", async () => {
    const fixture = await loadFixture("cynefin", "config-security-level-other")
    if (!fixture.expected.accepted) throw new Error("rejected security fixture")
    const embedded = embeddedValuesOf(fixture, fixture.expected)
    if (embedded === undefined)
      throw new Error("missing embedded configuration")
    expect(
      summary(
        fixture.input,
        (k) => [
          common(k, "Cynefin", "Title", "<b>T</b>"),
          common(k, "Cynefin", "AccTitle", " A<br>B"),
          common(k, "Cynefin", "AccDescr", " D=x"),
          domain(k, "complex", [() => item(k, '"<b>X</b>"')]),
          transition(k, "complex", "clear", '"<i>L</i>"'),
        ],
        embedded,
      ),
    ).toEqual(fixture.expected.db)
  })

  it("uses the shared specified reading of frontmatter HTML value changes", async () => {
    const fixture = await loadFixture("cynefin", "div-html-frontmatter-value")
    const result = fixture.specified
    if (result === undefined || !result.accepted)
      throw new Error("missing HTML specified reading")
    const embedded = embeddedValuesOf(fixture, result)
    if (embedded === undefined) throw new Error("missing embedded title")
    const { tree } = buildCynefin(fixture.input, (k) => [
      common(k, "Cynefin", "AccTitle", ' b="c">d'),
    ])
    const end = fixture.input.indexOf("\n---", 4) + 4
    setField(
      tree,
      "frontmatter",
      frontmatterOf(fixture.input, fixture.input.slice(0, end), [4, end - 4]),
    )
    expect(
      dbFromTree(
        fixture.input,
        tree as unknown as DbTreeRoot,
        embedded,
        cssSupportsColor,
      ),
    ).toEqual(result.db)
    expect(result.db).not.toEqual(
      fixture.expected.accepted ? fixture.expected.db : null,
    )
  })
})

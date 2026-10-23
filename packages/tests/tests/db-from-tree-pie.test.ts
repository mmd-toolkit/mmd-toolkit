import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { buildPie, common, ignored, section } from "./pie-built.ts"

/** Explicit occurrences of fixed corpus inputs, independent of the parser and the expected Db. */
const CASES: readonly {
  name: string
  showData?: boolean
  frontmatter?: boolean
  make: (kit: Kit) => CheckedNode[]
}[] = [
  { name: "header-only", make: () => [] },
  {
    name: "showdata-section-inline",
    showData: true,
    make: (kit) => [section(kit, '"A"', "1")],
  },
  {
    name: "db-all-fields",
    showData: true,
    make: (kit) => [
      common(kit, "PieTitleStatement", "Chart"),
      common(kit, "PieAccTitleStatement", " Accessible"),
      common(kit, "PieAccDescrBlockStatement", "First line\n  Second line"),
      section(kit, '"B"', "10"),
      section(kit, '"A"', "100"),
      section(kit, '"Small"', "0.1"),
      section(kit, '"Zero"', "0"),
    ],
  },
  {
    name: "db-three-definitions",
    make: (kit) => [
      section(kit, '"A"', "1"),
      section(kit, '"B"', "2"),
      section(kit, '"A"', "3"),
      section(kit, '"B"', "4"),
      section(kit, '"A"', "5"),
    ],
  },
  {
    name: "db-duplicate-negative-zero",
    make: (kit) => [section(kit, '"A"', "1"), section(kit, '"A"', "-0")],
  },
  {
    name: "db-duplicate-first-negative-zero",
    make: (kit) => [section(kit, '"A"', "-0"), section(kit, '"A"', "1")],
  },
  {
    name: "label-unknown-escapes",
    make: (kit) => [section(kit, '"\\q \\0 \\u0041 \\x41 \\/"', "1")],
  },
  {
    name: "label-escapes",
    make: (kit) => [
      section(
        kit,
        '"back\\\\slash\\nline\\rreturn\\ttab\\bback\\fform\\vvertical"',
        "1",
      ),
    ],
  },
  {
    name: "label-escaped-quotes",
    make: (kit) => [section(kit, '"A\\"B"', "1"), section(kit, "'A\\'B'", "2")],
  },
  { name: "label-empty", make: (kit) => [section(kit, '""', "1")] },
  {
    name: "title-spaces",
    make: (kit) => [
      common(kit, "PieTitleStatement", "  A  B\t\tC  "),
      section(kit, '"A"', "1"),
    ],
  },
  {
    name: "review-block-whitespace-only-lines",
    make: (kit) => [common(kit, "PieAccDescrBlockStatement", "A\n \t\nB")],
  },
  {
    name: "review-common-single-tab-lines",
    make: (kit) => [
      common(kit, "PieTitleStatement", "A\tB"),
      common(kit, "PieAccTitleStatement", " C\tD"),
      common(kit, "PieAccDescrStatement", " E\tF"),
    ],
  },
  {
    name: "review-common-quotes-backslashes",
    make: (kit) => [
      common(kit, "PieTitleStatement", "\"A\\nB\" 'C\\tD'"),
      common(kit, "PieAccTitleStatement", " \"A\\nB\" 'C\\tD'"),
      common(kit, "PieAccDescrStatement", " \"A\\nB\" 'C\\tD'"),
    ],
  },
  {
    name: "review-db-common-third-definitions",
    make: (kit) => [
      common(kit, "PieAccTitleStatement", " First"),
      common(kit, "PieAccDescrBlockStatement", "First"),
      section(kit, '"A"', "1"),
      common(kit, "PieAccTitleStatement", " Second"),
      common(kit, "PieAccDescrBlockStatement", null),
      common(kit, "PieAccTitleStatement", " Third"),
      common(kit, "PieAccDescrStatement", " Third"),
    ],
  },
  {
    name: "review-frontmatter-whitespace-body-final",
    frontmatter: true,
    make: (kit) => [
      common(kit, "PieTitleStatement", "First"),
      common(kit, "PieTitleStatement", "\t"),
    ],
  },
  {
    name: "entity-all-texts",
    make: (kit) => [
      common(kit, "PieTitleStatement", "#amp; &#65; &#x41; #35;"),
      common(kit, "PieAccTitleStatement", " #amp; &#65; &#x41; #35;"),
      common(kit, "PieAccDescrStatement", " #amp; &#65; &#x41; #35;"),
      section(kit, '"#amp; &#65; &#x41; #35;"', "1"),
    ],
  },
  {
    name: "html-all-texts",
    make: (kit) => [
      common(kit, "PieTitleStatement", "<b onclick=x>T</b> &amp; #35;"),
      common(kit, "PieAccTitleStatement", " <i>AT</i> &#65;"),
      common(
        kit,
        "PieAccDescrBlockStatement",
        "<br> <br/> <br /> </br> <BR> #br# &lt;",
      ),
      section(kit, '"<script>A</script> &amp; &#65; #35;"', "1"),
    ],
  },
  {
    name: "config-security-other",
    make: (kit) => [
      common(kit, "PieTitleStatement", "<b>T</b>"),
      common(kit, "PieAccTitleStatement", " <i>AT</i>"),
      common(kit, "PieAccDescrStatement", " <br> AD"),
      section(kit, '"<b>A</b>"', "1"),
    ],
  },
  {
    name: "review-yaml-after-section-space",
    make: (kit) => [
      section(kit, '"A"', "1", {
        after: () => [ignored(kit, "---\nx: y\n---", "yaml-block")],
      }),
      section(kit, '"B"', "2"),
    ],
  },
]

describe("the pie Db from hand-built corpus trees", () => {
  for (const row of CASES)
    it(row.name, async () => {
      const fixture = (await loadFixtures("pie")).find(
        (candidate) => candidate.name === row.name,
      )
      if (fixture === undefined) throw new Error(`missing pie/${row.name}`)
      const { input } = fixture
      const { tree } = buildPie(input, row.make, row.showData)
      if (row.frontmatter)
        setField(tree, "frontmatter", {
          type: "Frontmatter",
          range: [0, input.indexOf("\n---\n") + 4],
        })
      const result = fixture.specified ?? fixture.expected
      if (!result.accepted) throw new Error(`rejected pie/${row.name}`)
      const embedded = embeddedValuesOf(fixture, result)
      if (embedded === undefined)
        throw new Error(`no embedded values for pie/${row.name}`)
      expect(
        dbFromTree(
          input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(result.db)
    })

  it("rejects a negative duplicate before first-label retention", () => {
    const { source, tree } = buildPie('pie\n"A":1\n"A":-1\n', (kit) => [
      section(kit, '"A"', "1"),
      section(kit, '"A"', "-1"),
    ])
    expect(() =>
      dbFromTree(
        source,
        tree as unknown as DbTreeRoot,
        { config: {}, title: undefined, dataBlockEffects: [] },
        cssSupportsColor,
      ),
    ).toThrow("negative section value")
  })
})

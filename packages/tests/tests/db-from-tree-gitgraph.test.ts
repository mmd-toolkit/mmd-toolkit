import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import {
  embeddedValuesOf,
  loadFixtures,
  cssSupportsColor,
} from "../src/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { branch, checkout, commit, merge, option } from "./gitgraph-built.ts"
import { buildGitgraph, common } from "./statement-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"

/** The fixed A/b/B/main prefix of the merge and cherry-pick fixtures. */
function prefix(kit: Kit): CheckedNode[] {
  return [
    commit(kit, () => [option(kit, "Id", '"A"')]),
    branch(kit, "b"),
    commit(kit, () => [option(kit, "Id", '"B"')]),
    checkout(kit, "main"),
  ]
}

const CASES: readonly {
  name: string
  direction?: "TB"
  frontmatter?: boolean
  make: (kit: Kit) => CheckedNode[]
}[] = [
  { name: "header-only", make: () => [] },
  {
    name: "title-conversion",
    make: (kit) => [common(kit, "Gitgraph", "Title", " A  B\t C  ")],
  },
  {
    name: "accdescr-block",
    make: (kit) => [common(kit, "Gitgraph", "AccDescrBlock", "A  B\n\n  C")],
  },
  {
    name: "entity-all-fields",
    make: (kit) => [
      common(kit, "Gitgraph", "Title", "#amp;"),
      common(kit, "Gitgraph", "AccTitle", " #123;"),
      common(kit, "Gitgraph", "AccDescrBlock", "#quot;"),
      commit(kit, () => [
        option(kit, "Id", '"#amp;"'),
        option(kit, "Message", '"#123;"'),
        option(kit, "Tag", '"#quot;"'),
      ]),
      branch(kit, '"#amp;"'),
    ],
  },
  {
    name: "db-converted-duplicate-id",
    make: (kit) => [
      commit(kit, () => [option(kit, "Id", '"a\\q"')]),
      commit(kit, () => [option(kit, "Id", '"aq"')]),
    ],
  },
  {
    name: "lex-merge-string-escape",
    make: (kit) => [
      commit(kit, () => [option(kit, "Id", '"A"')]),
      branch(kit, '"a\\q"'),
      commit(kit, () => [option(kit, "Id", '"B"')]),
      checkout(kit, "main"),
      merge(kit, '"a\\q"', () => [
        option(kit, "Id", '"m\\q"'),
        option(kit, "Tag", '"t\\q"'),
      ]),
    ],
  },
  {
    name: "gram-cherry-pick",
    make: (kit) => [
      commit(kit, () => [
        option(kit, "Id", '"A"'),
        option(kit, "Message", '"base"'),
      ]),
      branch(kit, "b"),
      commit(kit, () => [
        option(kit, "Id", '"B"'),
        option(kit, "Message", '"pick"'),
      ]),
      checkout(kit, "main"),
      commit(kit, () => [option(kit, "Id", '"B"')], undefined, true),
    ],
  },
  {
    name: "db-generated-ids",
    make: (kit) => [
      commit(kit),
      branch(kit, "b"),
      commit(kit),
      checkout(kit, "main"),
      merge(kit, "b"),
    ],
  },
  {
    name: "db-generated-name-collision",
    make: (kit) => [
      commit(kit),
      commit(kit, () => [option(kit, "Id", '"generated-commit-1"')]),
      commit(kit),
    ],
  },
  {
    name: "db-three-definitions",
    make: (kit) => [
      commit(kit, () => [option(kit, "Id", '"A"')]),
      commit(kit, () => [option(kit, "Id", '"B"')]),
      commit(kit, () => [
        option(kit, "Id", '"A"'),
        option(kit, "Message", '"third"'),
      ]),
      commit(kit, () => [option(kit, "Id", '"C"')]),
    ],
  },
  {
    name: "gram-branch-order",
    make: (kit) => [
      branch(kit, "b", () => option(kit, "Order", "2")),
      branch(kit, "c", () => option(kit, "Order", "1")),
      branch(kit, "d"),
    ],
  },
  {
    name: "gram-branch-order-tie",
    make: (kit) => [
      branch(kit, "b", () => option(kit, "Order", "0")),
      branch(kit, "c", () => option(kit, "Order", "0")),
    ],
  },
  {
    name: "config-main-branch",
    make: (kit) => [
      commit(kit),
      branch(kit, "b", () => option(kit, "Order", "2")),
    ],
  },
  { name: "config-main-empty-name", make: (kit) => [commit(kit)] },
  {
    name: "gram-commit-space-values",
    make: (kit) => [
      commit(kit, () => [
        option(kit, "Id", '" "'),
        option(kit, "Message", '"  "'),
        option(kit, "Tag", '" "'),
      ]),
    ],
  },
  {
    name: "gram-commit-repeated-options",
    make: (kit) => [
      commit(kit, () => [
        option(kit, "Id", '"A"'),
        option(kit, "Id", '"B"'),
        option(kit, "Id", '"C"'),
        option(kit, "Message", '"one"', {}, true),
        option(kit, "Message", '"two"'),
        option(kit, "Message", '"three"', {}, true),
        option(kit, "Type", "NORMAL"),
        option(kit, "Type", "REVERSE"),
        option(kit, "Type", "HIGHLIGHT"),
        option(kit, "Tag", '"x"'),
        option(kit, "Tag", '"x"'),
        option(kit, "Tag", '""'),
      ]),
    ],
  },
  {
    name: "gram-merge-options",
    make: (kit) => [
      ...prefix(kit),
      merge(kit, "b", () => [
        option(kit, "Id", '"M"'),
        option(kit, "Tag", '"x"'),
        option(kit, "Tag", '""'),
        option(kit, "Type", "REVERSE"),
      ]),
    ],
  },
  {
    name: "gram-merge-empty-id",
    make: (kit) => [
      ...prefix(kit),
      merge(kit, "b", () => [option(kit, "Id", '""')]),
    ],
  },
  {
    name: "gram-cherry-pick-tags",
    make: (kit) => [
      ...prefix(kit),
      commit(
        kit,
        () => [
          option(kit, "Tag", '""'),
          option(kit, "Id", '"B"'),
          option(kit, "Tag", '"x"'),
          option(kit, "Tag", '""'),
          option(kit, "Tag", '"y"'),
        ],
        undefined,
        true,
      ),
    ],
  },
  {
    name: "gram-cherry-pick-merge-parent",
    make: (kit) => [
      ...prefix(kit),
      merge(kit, "b", () => [option(kit, "Id", '"M"')]),
      branch(kit, "c"),
      commit(
        kit,
        () => [option(kit, "Id", '"M"'), option(kit, "Parent", '"A"')],
        undefined,
        true,
      ),
    ],
  },
  {
    name: "db-cherry-pick-only-empty-tags",
    make: (kit) => [
      ...prefix(kit),
      commit(
        kit,
        () => [option(kit, "Id", '"B"'), option(kit, "Tag", '""')],
        undefined,
        true,
      ),
    ],
  },
  {
    name: "lex-cherry-pick-string-escape",
    make: (kit) => [
      commit(kit, () => [option(kit, "Id", '"A"')]),
      branch(kit, "b"),
      commit(kit, () => [option(kit, "Id", '"bq"')]),
      checkout(kit, "main"),
      commit(
        kit,
        () => [
          option(kit, "Id", '"b\\q"'),
          option(kit, "Parent", '"\\A"'),
          option(kit, "Tag", '"t\\q"'),
        ],
        undefined,
        true,
      ),
    ],
  },
  {
    name: "common-third-values",
    make: (kit) => [
      common(kit, "Gitgraph", "Title", "First"),
      common(kit, "Gitgraph", "Title", "Second"),
      common(kit, "Gitgraph", "Title", "Third"),
      common(kit, "Gitgraph", "AccTitle", " One"),
      common(kit, "Gitgraph", "AccTitle", " Two"),
      common(kit, "Gitgraph", "AccTitle", " Three"),
      common(kit, "Gitgraph", "AccDescr", " A"),
      common(kit, "Gitgraph", "AccDescr", " B"),
      common(kit, "Gitgraph", "AccDescr", " C"),
    ],
  },
  {
    name: "title-repeat-empty",
    frontmatter: true,
    make: (kit) => [
      common(kit, "Gitgraph", "Title", "First"),
      common(kit, "Gitgraph", "Title", "Second"),
      common(kit, "Gitgraph", "Title", null),
    ],
  },
  {
    name: "html-all-texts",
    make: (kit) => [
      common(kit, "Gitgraph", "Title", '<b class="x">T</b> &amp; #amp;'),
      common(kit, "Gitgraph", "AccTitle", " <i>A</i>"),
      common(kit, "Gitgraph", "AccDescrBlock", "<em>D</em>"),
      commit(kit, () => [
        option(kit, "Id", '"<b>I</b>"'),
        option(kit, "Message", '"<i>M</i>"'),
        option(kit, "Tag", '"<u>T</u>"'),
      ]),
      branch(kit, '"<b>B</b>"'),
    ],
  },
  {
    name: "config-gitgraph-html-false",
    make: (kit) => [
      commit(kit, () => [
        option(kit, "Id", '"<b>A</b>"'),
        option(kit, "Message", '"<i>M</i>"'),
        option(kit, "Tag", '"<u>T</u>"'),
      ]),
    ],
  },
  {
    name: "config-gitgraph-loose",
    make: (kit) => [
      commit(kit, () => [
        option(kit, "Id", '"<b>A</b>"'),
        option(kit, "Message", '"<i>M</i>"'),
        option(kit, "Tag", '"<u>T</u>"'),
      ]),
    ],
  },
]

describe("gitgraph Db from hand-built corpus trees", () => {
  for (const row of CASES)
    it(row.name, async () => {
      const fixture = (await loadFixtures("gitgraph")).find(
        (entry) => entry.name === row.name,
      )
      if (fixture === undefined) throw new Error(`missing gitgraph/${row.name}`)
      const { tree } = buildGitgraph(fixture.input, row.make, row.direction)
      if (row.frontmatter)
        setField(tree, "frontmatter", {
          type: "Frontmatter",
          range: [0, fixture.input.indexOf("\n---\n") + 4],
        })
      const result = fixture.specified ?? fixture.expected
      const embedded = embeddedValuesOf(fixture, result)
      if (!result.accepted || embedded === undefined)
        throw new Error(`no comparable reading: ${row.name}`)
      expect(
        dbFromTree(
          fixture.input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(result.db)
    })
})

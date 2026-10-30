import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { buildTree, itFailsEach, nodeWith } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { locationOf } from "./check-tree-trees.ts"
import { withBefore, withChildren } from "./nesting-built.ts"
import {
  buildTreemap,
  classDef,
  common as mapCommon,
  row as mapRow,
} from "./treemap-built.ts"
import {
  buildTreeview,
  common as viewCommon,
  decoration,
  prefix,
  row as viewRow,
} from "./treeview-built.ts"

/** treeview/db-file-parent: files have children at arbitrary increasing indentation. */
function fileTree(): Built {
  return buildTreeview(
    "treeView-beta\nfile.txt\n child\n  grandchild",
    (kit) => [
      withChildren(kit, viewRow(kit, 0, "file.txt"), [
        withChildren(kit, viewRow(kit, 1, "child"), [
          viewRow(kit, 2, "grandchild"),
        ]),
      ]),
    ],
  )
}

/** treemap/db-leaf-closes-open-sections: a deeper row cannot reopen closed sections. */
function leafTree(): Built {
  return buildTreemap('treemap\n"A"\n  "B"\n"L":1\n    "C":2', (kit) => [
    withChildren(kit, mapRow(kit, 0, '"A"'), [mapRow(kit, 2, '"B"')]),
    mapRow(kit, 0, '"L"', "1"),
    mapRow(kit, 4, '"C"', "2"),
  ])
}

/** treeview/gram-nesting-decoration-before-ancestor-child: the next sibling owns the gap. */
function viewGap(): Built {
  return buildTreeview(
    "treeView-beta\nroot/\n├── parent\n│   └── child\n│\n└── sibling\n",
    (kit) => [
      withChildren(kit, viewRow(kit, 0, "root/"), [
        withChildren(
          kit,
          viewRow(kit, 4, "parent", undefined, prefix(kit, "├──")),
          [viewRow(kit, 8, "child", undefined, prefix(kit, "│   └──", "└"))],
        ),
        (() => {
          const before = decoration(kit)
          return withBefore(
            kit,
            viewRow(kit, 4, "sibling", undefined, prefix(kit, "└──", "└")),
            "textBefore",
            [before],
          )
        })(),
      ]),
    ],
  )
}

/** treemap/gram-nesting-statement-before-ancestor-child: classDef stays global in a sibling's gap. */
function mapGap(): Built {
  return buildTreemap(
    'treemap\n"A"\n    "B"\n      "C":1\nclassDef xx fill:red;\n  "D":2:::xx\n',
    (kit) => [
      withChildren(kit, mapRow(kit, 0, '"A"'), [
        withChildren(kit, mapRow(kit, 4, '"B"'), [mapRow(kit, 6, '"C"', "1")]),
        (() => {
          const before = classDef(kit, 0, "xx", "fill:red")
          return withBefore(
            kit,
            mapRow(kit, 2, '"D"', "2", "xx"),
            "statementsBefore",
            [before],
          )
        })(),
      ]),
    ],
  )
}

/** treemap/gram-nesting-statement-before-section: a section owns a common gap. */
function sectionGap(): Built {
  return buildTreemap(
    'treemap\n"A"\naccTitle: Map\n  "B"\n    "C":1\n',
    (kit) => [
      withChildren(kit, mapRow(kit, 0, '"A"'), [
        (() => {
          const before = mapCommon(kit, "AccTitle", " Map")
          return withBefore(
            kit,
            withChildren(kit, mapRow(kit, 2, '"B"'), [
              mapRow(kit, 4, '"C"', "1"),
            ]),
            "statementsBefore",
            [before],
          )
        })(),
      ]),
    ],
  )
}

/** treeview/box-decoration-preamble-body: an outer decoration does not end common statements. */
function preambleDecoration(): Built {
  return buildTreeview(
    "treeView-beta\naccTitle: A\n│\naccDescr: B\n├── node",
    (kit) => [
      viewCommon(kit, "AccTitle", " A"),
      decoration(kit),
      viewCommon(kit, "AccDescr", " B"),
      viewRow(kit, 4, "node", undefined, prefix(kit, "├──")),
    ],
  )
}

/** treeview/box-decoration-trailing-body: the last decoration stays outside the node. */
function trailingDecoration(): Built {
  return buildTreeview("treeView-beta\n├── node\n│", (kit) => [
    viewRow(kit, 4, "node", undefined, prefix(kit, "├──")),
    decoration(kit),
  ])
}

/** treemap/gram-nesting-statement-after-last-child: the final class stays in body. */
function trailingStatement(): Built {
  return buildTreemap(
    'treemap\n"A"\n  "B":1\nclassDef xx fill:red;\n',
    (kit) => [
      withChildren(kit, mapRow(kit, 0, '"A"'), [mapRow(kit, 2, '"B"', "1")]),
      classDef(kit, 0, "xx", "fill:red"),
    ],
  )
}

/** One explicit bare kanban occurrence. */
function card(kit: Kit, indent: number, value: string): CheckedNode {
  const id = kit.node("KanbanLiteral", kit.token("RawText", value).range, {
    value,
  })
  return kit.node("KanbanNode", id.range, {
    indent,
    id,
    shape: null,
    data: [],
    decorations: [],
    children: [],
  })
}

/** kanban/db-indent-deeper: A, B and C are siblings under S. */
function board(): Built {
  return buildTree(
    { header: "kanban", diagramType: "kanban", bodyType: "KanbanDiagram" },
    "kanban\n S\n   A\n     B\n   C\n",
    (kit) => [
      withChildren(kit, card(kit, 1, "S"), [
        card(kit, 3, "A"),
        card(kit, 5, "B"),
        card(kit, 3, "C"),
      ]),
    ],
  )
}

/** kanban/gram-nesting-item-decoration-before-deeper-item: A owns its icon before sibling B. */
function boardDecoration(): Built {
  return buildTree(
    { header: "kanban", diagramType: "kanban", bodyType: "KanbanDiagram" },
    "kanban\n S\n   A\n ::icon(x)\n     B\n",
    (kit) => {
      const column = card(kit, 1, "S")
      const a = card(kit, 3, "A")
      const open = kit.token("Keyword", "::icon(")
      const icon = kit.node("KanbanLiteral", kit.token("RawText", "x").range, {
        value: "x",
      })
      const close = kit.token("Punctuator", ")")
      const iconStatement = kit.node(
        "KanbanIconStatement",
        [open.range[0], close.range[1]],
        { icon },
      )
      const decorated = kit.node("KanbanNode", [a.range[0], close.range[1]], {
        indent: 3,
        id: a.id,
        shape: null,
        data: [],
        decorations: [iconStatement],
        children: [],
      })
      return [withChildren(kit, column, [decorated, card(kit, 5, "B")])]
    },
  )
}

/** Update only the extent of an occurrence whose ownership a broken case changes. */
function extent(
  source: string,
  node: CheckedNode,
  from: number,
  to: number,
): void {
  setField(node, "range", [from, to])
  setField(node, "loc", locationOf(source, [from, to]))
}

/** The explicitly nested hierarchy children of an occurrence. */
function children(node: CheckedNode): CheckedNode[] {
  return node.children as CheckedNode[]
}

const PARENT = "the children do not follow"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"

describe("the nested tree contracts", () => {
  for (const [name, make] of [
    ["file parents", fileTree],
    ["leaf closes sections", leafTree],
    ["decoration before ancestor's next child", viewGap],
    ["statement before ancestor's next child", mapGap],
    ["two-level board", board],
    ["statement before a section", sectionGap],
    ["card decoration before deeper sibling", boardDecoration],
    ["decoration before first hierarchy node", preambleDecoration],
    ["decoration after last hierarchy node", trailingDecoration],
    ["statement after last hierarchy node", trailingStatement],
  ] as const)
    it(`accepts ${name}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })

  itFailsEach([
    {
      name: "an outer preamble decoration moved into the first node's textBefore",
      built: preambleDecoration,
      mutate: (tree, source) => {
        const body = tree.body.body as CheckedNode[]
        const form = body[1]
        const node = nodeWith(tree, "TreeviewNode")
        setField(node, "textBefore", [form])
        extent(source, node, form.range[0], node.range[1])
        setField(tree.body, "body", [body[0], body[2], node])
      },
      expected: "belongs to TreeviewDiagram.body",
    },
    {
      name: "a final independent statement moved into the last leaf's gap",
      built: trailingStatement,
      mutate: (tree, source) => {
        const body = tree.body.body as CheckedNode[]
        const leaf = nodeWith(tree, "TreemapLeaf")
        const statement = body[1]
        setField(leaf, "statementsBefore", [statement])
        extent(source, leaf, leaf.range[0], statement.range[1])
        extent(source, body[0], body[0].range[0], statement.range[1])
        setField(tree.body, "body", [body[0]])
      },
      expected: "belongs to TreemapDiagram.body exactly once",
    },

    {
      name: "a kanban icon moved from its card to the column",
      built: boardDecoration,
      mutate: (tree, source) => {
        const column = nodeWith(tree, "KanbanNode")
        const a = children(column)[0]
        setField(column, "decorations", a.decorations)
        setField(a, "decorations", [])
        extent(source, a, a.range[0], (a.id as CheckedNode).range[1])
      },
      expected: "the decoration belongs exactly once to the last written node",
    },
    {
      name: "a treeview range starting after its owned textBefore",
      built: viewGap,
      mutate: (tree, source) => {
        const node = nodesOf(tree).find(
          (candidate) =>
            candidate.type === "TreeviewNode" &&
            (candidate.textBefore as CheckedNode[]).length > 0,
        )!
        extent(
          source,
          node,
          (node.prefix as CheckedNode).range[0],
          node.range[1],
        )
      },
      expected: HULL,
    },
    {
      name: "a treemap range starting after its owned statementsBefore",
      built: sectionGap,
      mutate: (tree, source) => {
        const node = children(nodeWith(tree, "TreemapSection"))[0]
        extent(source, node, (node.name as CheckedNode).range[0], node.range[1])
      },
      expected: HULL,
    },

    {
      name: "a treeview node attached to its grandparent with otherwise valid ranges",
      built: fileTree,
      mutate: (tree, source) => {
        const root = nodeWith(tree, "TreeviewNode")
        const child = children(root)[0]
        const grandchild = children(child)[0]
        setField(child, "children", [])
        extent(
          source,
          child,
          child.range[0],
          (child.name as CheckedNode).range[1],
        )
        setField(root, "children", [child, grandchild])
      },
      expected: PARENT,
    },
    {
      name: "treeview children in reverse written order",
      built: viewGap,
      mutate: (tree) => {
        const root = nodeWith(tree, "TreeviewNode")
        setField(root, "children", children(root).toReversed())
      },
      expected: PARENT,
    },
    {
      name: "a treemap leaf with children",
      built: leafTree,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreemapLeaf"), "children", [
          (tree.body.body as CheckedNode[])[2],
        ]),
      expected: "field children",
    },
    {
      name: "a treemap node under a section closed by a leaf",
      built: leafTree,
      mutate: (tree, source) => {
        const roots = tree.body.body as CheckedNode[]
        const section = roots[0]
        const child = roots[2]
        setField(section, "children", [...children(section), child])
        extent(source, section, section.range[0], child.range[1])
        setField(tree.body, "body", roots.slice(0, 2))
      },
      expected: PARENT,
    },
    {
      name: "three levels in kanban despite deeper written indentation",
      built: board,
      mutate: (tree, source) => {
        const column = nodeWith(tree, "KanbanNode")
        const [a, b, c] = children(column)
        setField(a, "children", [b])
        extent(source, a, a.range[0], b.range[1])
        setField(column, "children", [a, c])
      },
      expected: PARENT,
    },
    {
      name: "a kanban card promoted to a column",
      built: board,
      mutate: (tree, source) => {
        const column = nodeWith(tree, "KanbanNode")
        const cards = children(column)
        setField(column, "children", [])
        extent(
          source,
          column,
          column.range[0],
          (column.id as CheckedNode).range[1],
        )
        setField(tree.body, "body", [column, ...cards])
      },
      expected: PARENT,
    },
    {
      name: "a treeview gap moved to body with corrected node hulls",
      built: viewGap,
      mutate: (tree, source) => {
        const sibling = nodesOf(tree).find(
          (node) =>
            node.type === "TreeviewNode" &&
            (node.textBefore as CheckedNode[]).length > 0,
        )!
        const before = (sibling.textBefore as CheckedNode[])[0]
        setField(sibling, "textBefore", [])
        extent(
          source,
          sibling,
          (sibling.prefix as CheckedNode).range[0],
          sibling.range[1],
        )
        setField(tree.body, "body", [
          ...(tree.body.body as CheckedNode[]),
          before,
        ])
      },
      expected: "belongs to TreeviewNode.textBefore",
    },
    {
      name: "a treemap gap moved to its enclosing section",
      built: mapGap,
      mutate: (tree, source) => {
        const root = nodeWith(tree, "TreemapSection")
        const sibling = children(root)[1]
        const before = sibling.statementsBefore as CheckedNode[]
        setField(sibling, "statementsBefore", [])
        extent(
          source,
          sibling,
          (sibling.name as CheckedNode).range[0],
          sibling.range[1],
        )
        setField(root, "statementsBefore", before)
      },
      expected: "belongs to TreemapLeaf.statementsBefore exactly once",
    },
    {
      name: "a duplicate treemap gap statement",
      built: mapGap,
      mutate: (tree) => {
        const statement = nodeWith(tree, "TreemapClassDefStatement")
        const owner = nodesOf(tree).find((node) =>
          (node.statementsBefore as CheckedNode[] | undefined)?.includes(
            statement,
          ),
        )!
        setField(owner, "statementsBefore", [statement, statement])
      },
      expected: "exactly once",
    },
    {
      name: "a lost treemap gap statement",
      built: mapGap,
      mutate: (tree) => {
        const statement = nodeWith(tree, "TreemapClassDefStatement")
        const owner = nodesOf(tree).find((node) =>
          (node.statementsBefore as CheckedNode[] | undefined)?.includes(
            statement,
          ),
        )!
        setField(owner, "statementsBefore", [])
      },
      expected: "lies in no value node",
    },
    {
      name: "overlapping treeview siblings",
      built: viewGap,
      mutate: (tree, source) => {
        const [a, b] = children(nodeWith(tree, "TreeviewNode"))
        extent(source, a, a.range[0], b.range[1])
      },
      expected: "overlaps the child node",
    },
    {
      name: "overlapping treemap siblings",
      built: mapGap,
      mutate: (tree, source) => {
        const [a, b] = children(nodeWith(tree, "TreemapSection"))
        extent(source, a, a.range[0], b.range[1])
      },
      expected: "overlaps the child node",
    },
    {
      name: "overlapping kanban cards",
      built: board,
      mutate: (tree, source) => {
        const [a, b] = children(nodeWith(tree, "KanbanNode"))
        extent(source, a, a.range[0], b.range[1])
      },
      expected: "overlaps the child node",
    },
    {
      name: "a treeview range missing its last descendant",
      built: fileTree,
      mutate: (tree, source) => {
        const root = nodeWith(tree, "TreeviewNode")
        extent(source, root, root.range[0], (root.name as CheckedNode).range[1])
      },
      expected: HULL,
    },
    {
      name: "a treemap range missing its last descendant",
      built: mapGap,
      mutate: (tree, source) => {
        const root = nodeWith(tree, "TreemapSection")
        extent(source, root, root.range[0], children(root)[0].range[1])
      },
      expected: HULL,
    },
    {
      name: "a kanban range missing its last card",
      built: board,
      mutate: (tree, source) => {
        const root = nodeWith(tree, "KanbanNode")
        extent(source, root, root.range[0], children(root)[1].range[1])
      },
      expected: HULL,
    },
  ])
})

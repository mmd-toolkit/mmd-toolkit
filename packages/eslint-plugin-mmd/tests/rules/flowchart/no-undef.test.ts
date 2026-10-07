/**
 * The rule `flowchart/no-undef`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with a `style`, `class`, or
 * `click` statement whose id names nothing of the diagram.
 */
import { noUndef } from "../../../src/rules/flowchart/no-undef.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-undef", noUndef, {
  sentences: [
    {
      sentence:
        "This rule reports an id in a `style`, `class`, or `click` statement that is the id of no vertex, no subgraph, and no link of the diagram.",
      cases: [
        {
          case: "`style`, `class`, and `click` of an unknown id",
          reports: true,
          inputs: [
            "docs/rules/flowchart/no-undef.md incorrect 1",
            "docs/rules/flowchart/no-undef.md incorrect 2",
            "docs/rules/flowchart/no-undef.md incorrect 3",
          ],
        },
        {
          case: "`style` of the only id of the text, and `style` of an unknown link id",
          reports: true,
          inputs: [
            "invalid/flowchart/db-undef-style-of-the-only-id",
            "invalid/flowchart/db-undef-style-of-an-unknown-link-id",
          ],
        },
        {
          case: "`class` before the vertices, and `click` that calls a function",
          reports: true,
          inputs: [
            "invalid/class-unknown-before-vertices",
            "invalid/flowchart/db-undef-click-call-of-an-unknown-id",
          ],
        },
        {
          case: "two `class` statements of an unknown id: each is reported",
          reports: true,
          inputs: ["invalid/flowchart/db-undef-two-classes-of-an-unknown-id"],
        },
        {
          case: "the tooltip form of `click`",
          reports: true,
          inputs: ["invalid/flowchart/db-tooltip-unknown-id"],
        },
        {
          case: "a comment line or CRLF line breaks before the statement",
          reports: true,
          inputs: [
            "invalid/flowchart/db-undef-style-of-an-unknown-id-after-a-comment-line",
            "invalid/style-of-an-unknown-id-crlf",
          ],
        },
        {
          case: "every id is the id of a vertex, a subgraph, or a link",
          reports: false,
          inputs: [
            "docs/rules/flowchart/no-undef.md correct 1",
            "docs/rules/flowchart/no-undef.md correct 2",
            "docs/rules/flowchart/no-undef.md correct 3",
            "docs/rules/flowchart/no-undef.md correct 4",
          ],
        },
      ],
    },
    {
      sentence:
        "It applies to `flowchart-v2`, `flowchart-elk`, and `swimlane`.",
      cases: [
        {
          case: "the header `flowchart`, a `flowchart-v2` diagram",
          reports: true,
          inputs: ["docs/rules/flowchart/no-undef.md incorrect 1"],
        },
        {
          case: "the header `graph`, a `flowchart-v2` diagram",
          reports: true,
          inputs: ["invalid/header-graph"],
        },
        {
          case: "the header `flowchart-elk`",
          reports: true,
          inputs: ["invalid/header-flowchart-elk"],
        },
        {
          case: "the header `swimlane-beta`, a `swimlane` diagram",
          reports: true,
          inputs: ["invalid/header-swimlane-beta"],
        },
      ],
    },
    {
      sentence:
        'After `A --> B`, `style C fill:red` adds a vertex `C` with the style `fill:red`, `class C foo` gives no vertex the class `foo`, and `click C href "…"` makes no vertex a link.',
      cases: [
        {
          case: "`style C` after `A --> B`",
          reports: true,
          inputs: ["invalid/flowchart/db-style-unknown-vertex"],
        },
        {
          case: "`class C foo` after `A --> B`",
          reports: true,
          inputs: ["invalid/flowchart/db-class-unknown-vertex"],
        },
        {
          case: "`click C href` after `A --> B`",
          reports: true,
          inputs: ["docs/rules/flowchart/no-undef.md incorrect 3"],
        },
      ],
    },
    {
      sentence:
        "Each id of a list is checked: `class A,C foo` gives `A` the class, and `C` is reported.",
      cases: [
        {
          case: "a list of `class` with one unknown id",
          reports: true,
          inputs: ["invalid/flowchart/db-undef-class-list-with-an-unknown-id"],
        },
        {
          case: "a list of `click` with one unknown id",
          reports: true,
          inputs: ["invalid/flowchart/db-undef-click-list-with-an-unknown-id"],
        },
        {
          case: "a list whose ids are a link and a subgraph",
          reports: false,
          inputs: ["valid/flowchart/db-class-on-edge-and-subgraph"],
        },
      ],
    },
    {
      sentence:
        "The ids of the diagram are those of its vertices and subgraphs, and those given to links, as `e1` in `A e1@--> B`, wherever they are written.",
      cases: [
        {
          case: "a vertex in a subgraph, or from a data block",
          reports: false,
          inputs: [
            "valid/flowchart/db-undef-class-of-a-vertex-in-a-subgraph",
            "valid/flowchart/db-undef-class-of-a-vertex-from-a-data-block",
          ],
        },
        {
          case: "a vertex with a class shorthand",
          reports: false,
          inputs: ["valid/flowchart/db-undef-style-of-a-vertex-with-a-class-shorthand"],
        },
        {
          case: "the id of a link, also as the id of a vertex",
          reports: false,
          inputs: [
            "valid/flowchart/db-style-edge-id",
            "valid/flowchart/db-click-on-edge",
            "valid/flowchart/db-vertex-edge-id",
          ],
        },
        {
          case: "the generated id of a subgraph",
          reports: false,
          inputs: ["valid/flowchart/db-undef-style-of-a-generated-subgraph-id"],
        },
        {
          case: "a subgraph",
          reports: false,
          inputs: ["valid/flowchart/db-style-subgraph-id"],
        },
      ],
    },
    {
      sentence:
        "A `style` statement before the vertex that it names still styles it.",
      cases: [
        {
          case: "`style` before a vertex, a subgraph, or the end of a link",
          reports: false,
          inputs: [
            "valid/flowchart/db-style-before-vertex",
            "valid/style-before-subgraph",
            "valid/flowchart/db-undef-style-before-a-vertex-that-a-link-ends-at",
          ],
        },
      ],
    },
    {
      sentence:
        "A `class` statement before the vertex that it names does nothing in mermaid.js, and a `click` statement there does not make the vertex clickable, although its tooltip still applies. Such a statement names an id of the diagram, which is written correctly, and the rule does not report it.",
      cases: [
        {
          case: "`class` before a vertex, a subgraph, or a link id",
          reports: false,
          inputs: [
            "valid/class-before-vertex",
            "valid/flowchart/db-class-before-vertex",
            "valid/class-before-subgraph",
            "valid/class-before-link-id",
          ],
        },
        {
          case: "`click` before a vertex or a link id",
          reports: false,
          inputs: ["valid/click-before-vertex", "valid/click-before-link-id"],
        },
        {
          case: "`click` with a tooltip before a vertex",
          reports: false,
          inputs: ["valid/click-tooltip-before-vertex"],
        },
      ],
    },
    {
      sentence:
        "A vertex that a `style` statement adds is a vertex of the diagram too, so the rule reports only the first `style` of an id that nothing else defines.",
      cases: [
        {
          case: "two `style` of an id that nothing defines: the first is reported",
          reports: true,
          inputs: ["invalid/style-twice-of-new-vertex"],
        },
      ],
    },
    {
      sentence:
        'After `style C fill:red`, a second `style C stroke:blue` adds its style to the vertex `C`, and `class C foo` and `click C href "…"` apply to it; none of them is reported.',
      cases: [
        {
          case: "`class` or `click` after the `style` that adds the vertex: only the `style` is reported",
          reports: true,
          inputs: [
            "invalid/class-after-style-of-new-vertex",
            "invalid/click-after-style-of-new-vertex",
            "invalid/flowchart/db-undef-style-twice-then-class-of-a-new-vertex",
          ],
        },
        {
          case: "`class` before the `style` that adds the vertex: only the `style` is reported",
          reports: true,
          inputs: ["invalid/class-before-style-of-new-vertex"],
        },
      ],
    },
    {
      sentence: "`style` with the id of a link is not reported either.",
      cases: [
        {
          case: "`style` after the link, or before it",
          reports: false,
          inputs: ["valid/style-after-link-id", "valid/style-before-link-id"],
        },
      ],
    },
  ],
})

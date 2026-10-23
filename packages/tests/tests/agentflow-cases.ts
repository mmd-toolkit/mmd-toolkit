import {
  afStyling,
  afLinkStyle,
  afCallback,
  afUrl,
  afAccessibility,
  afString,
} from "./agentflow-built.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import {
  afArrow,
  afContainer,
  afGroup,
  afId,
  afIgnored,
  afLabel,
  afLink,
  afLiteral,
  afName,
  afNode,
  afStatement,
  afVertex,
  agentflowTree,
} from "./agentflow-built.ts"
import type { VertexForm } from "./agentflow-built.ts"

/** One fixed corpus input, with all written productions supplied by hand. */
export interface AgentflowCase {
  readonly fixture: string
  readonly make: (kit: Kit) => CheckedNode[]
  readonly direction?: string | null
  readonly db?: false
}

/** One explicit occurrence in a one-member group. */
function one(
  kit: Kit,
  id: string,
  form: VertexForm | null = null,
  data: readonly string[] = [],
): CheckedNode {
  return afGroup(kit, [() => afVertex(kit, id, form, null, data)])
}

/** One ordinary contributing fragment. */
function name(kit: Kit, value: string): CheckedNode {
  return afName(kit, [afLabel(kit, value)])
}

/** Semantic fields are supplied independently of the operator spelling. */
function edge(
  kit: Kit,
  start: string,
  end: string,
  raw = "-->",
  line = "solid",
  length = 2,
  marker = "arrow",
): CheckedNode {
  const first = one(kit, start)
  return afStatement(kit, first, [
    afLink(
      kit,
      () => afArrow(kit, raw, line, length, marker),
      () => one(kit, end),
    ),
  ])
}

const SHAPES: readonly (readonly [string, VertexForm])[] = [
  ["A", { opening: "[", closing: "]", name: "rectangle", raw: "Square" }],
  [
    "B",
    { opening: "(((", closing: ")))", name: "double-circle", raw: "Double" },
  ],
  ["C", { opening: "((", closing: "))", name: "circle", raw: "Circle" }],
  ["D", { opening: "(-", closing: "-)", name: "ellipse", raw: "Ellipse" }],
  ["E", { opening: "([", closing: "])", name: "stadium", raw: "Stadium" }],
  [
    "F",
    { opening: "[[", closing: "]]", name: "framed-rectangle", raw: "Tool" },
  ],
  ["G", { opening: "[(", closing: ")]", name: "cylinder", raw: "Cylinder" }],
  ["H", { opening: "(", closing: ")", name: "rounded", raw: "Round" }],
  ["I", { opening: "{", closing: "}", name: "diamond", raw: "Decision" }],
  ["J", { opening: "{{", closing: "}}", name: "hexagon", raw: "Action" }],
  ["K", { opening: ">", closing: "]", name: "odd", raw: "Odd" }],
  [
    "L",
    { opening: "[/", closing: "\\]", name: "trapezoid-bottom", raw: "Trap" },
  ],
  [
    "M",
    { opening: "[\\", closing: "/]", name: "trapezoid-top", raw: "Inverse" },
  ],
  ["N", { opening: "[/", closing: "/]", name: "lean-right", raw: "Input" }],
  ["O", { opening: "[\\", closing: "\\]", name: "lean-left", raw: "Left" }],
]
const METADATA: readonly (readonly [string, string])[] = [
  ["db-metadata-positive-infinity", "@{ custom: .inf }"],
  ["db-metadata-negative-infinity", "@{ custom: -.inf }"],
  ["db-metadata-nan", "@{ custom: .nan }"],
  ["db-metadata-overflow", "@{ custom: 1e999 }"],
  ["db-metadata-nested-map-infinity", "@{\ncustom:\n  deep: .inf\n}"],
  ["db-metadata-nested-nan", "@{\ncustom:\n  values: [.nan]\n}"],
  ["db-metadata-scalar", "@{\n scalar\n}"],
  ["db-metadata-array", "@{\n - first\n - second\n}"],
  [
    "db-metadata-yaml-shared-alias",
    "@{\ncustom: &shared\n  deep: value\ncopy: *shared\n}",
  ],
]
/** Named existing inputs; this table never produces input text. */
export const AGENTFLOW_CASES: readonly AgentflowCase[] = [
  {
    fixture: "lex-direction-line-greedy",
    make: (kit: Kit): CheckedNode[] => {
      const before = afIgnored(kit, "A", "direction-text")
      const keyword = kit.token("Keyword", "direction")
      const value = kit.token("Keyword", "LR")
      const after = afIgnored(kit, "ignored", "direction-text")
      return [
        afNode(kit, "DirectionStatement", [before, keyword, value, after], {
          textBefore: before,
          direction: "LR",
          textAfter: after,
        }),
      ]
    },
  },
  {
    fixture: "lex-direction-value-priority",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => {
          const first = kit.token("Keyword", "direction")
          const value = kit.token("Keyword", "TB")
          const after = afIgnored(kit, "x direction LR", "direction-text")
          const statement = afNode(
            kit,
            "DirectionStatement",
            [first, value, after],
            {
              textBefore: null,
              direction: "TB",
              textAfter: after,
            },
          )
          return [statement, afStatement(kit, one(kit, "A"))]
        },
      ),
    ],
  },
  {
    fixture: "gram-class-double-semicolon",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const classes = afStyling(kit, "class", ["A"], ["hot"])
      kit.token("Punctuator", ";")
      const semicolon = kit.token("Punctuator", ";")
      const empty = afNode(kit, "EmptyStatement", [semicolon], {})
      return [vertex, classes, empty, afStatement(kit, one(kit, "B"))]
    },
  },
  {
    fixture: "db-acctitle-eof",
    make: (kit: Kit): CheckedNode[] => [afAccessibility(kit, "accTitle", null)],
  },
  {
    fixture: "lex-title-inline-percent-content",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accTitle", "T %% c"),
      afStatement(kit, one(kit, "A")),
    ],
  },
  {
    fixture: "lex-accessibility-block-comment",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accDescr", "first\n%% literal\nsecond", true),
    ],
  },
  {
    fixture: "gram-style-null-before-comment-nbsp",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const style = afStyling(kit, "style", ["A"], [null])
      kit.comment("%%", "%% c")
      return [vertex, style]
    },
  },
  {
    fixture: "div-metadata-yaml-self-alias",
    db: false,
    make: (kit: Kit): CheckedNode[] => [
      afStatement(
        kit,
        one(kit, "A", null, ["@{\ncustom: &self\n  deep: *self\n}"]),
      ),
    ],
  },
  {
    fixture: "div-data-percent-line-is-content",
    db: false,
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A", null, ["@{\n%% c\nlabel: x\n}"])),
    ],
  },

  {
    fixture: "gram-flow-name-whitespace-only",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => afName(kit, [afLabel(kit, " ", "text", " ", 23)]),
        () => [afStatement(kit, one(kit, "A"))],
      ),
    ],
  },
  {
    fixture: "db-connector-empty-id-data",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "connector",
        () => afName(kit, [afLabel(kit, " ", "text", " ", 28)]),
        undefined,
        null,
        ["@{ custom: .inf }"],
      ),
      afStatement(kit, one(kit, "A")),
    ],
  },

  { fixture: "header-only", direction: null, make: () => [] },
  {
    fixture: "gram-bracket-shapes",
    make: (kit: Kit): CheckedNode[] =>
      SHAPES.map(([id, shape]) => afStatement(kit, one(kit, id, shape))),
  },
  {
    fixture: "gram-props",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(
        kit,
        one(kit, "A", {
          opening: "[|",
          closing: "]",
          name: "rectangle",
          property: ["field", "value"],
          raw: "Label",
        }),
      ),
    ],
  },
  {
    fixture: "gram-three-edge-kinds",
    make: (kit: Kit): CheckedNode[] => [
      edge(kit, "A", "B"),
      edge(kit, "B", "C", "-.-", "dotted", 1, "none"),
      edge(kit, "C", "D", "--x", "solid", 2, "cross"),
    ],
  },
  {
    fixture: "db-edge-length-cap",
    make: (kit: Kit): CheckedNode[] => [
      edge(kit, "A", "B", "-------------->", "solid", 14),
      edge(kit, "B", "C", "-............-", "dotted", 12, "none"),
    ],
  },
  {
    fixture: "gram-edge-chain",
    make: (kit: Kit): CheckedNode[] => {
      const first = one(kit, "A")
      const a = afLink(
        kit,
        () => afArrow(kit, "-->", "solid", 2, "arrow"),
        () => one(kit, "B"),
      )
      const b = afLink(
        kit,
        () => afArrow(kit, "--x", "solid", 2, "cross"),
        () => one(kit, "C"),
      )
      const c = afLink(
        kit,
        () => afArrow(kit, "-.-", "dotted", 1, "none"),
        () => one(kit, "D"),
      )
      return [afStatement(kit, first, [a, b, c])]
    },
  },
  {
    fixture: "gram-split-failure-label",
    make: (kit: Kit): CheckedNode[] => {
      const first = one(kit, "A")
      const mark = kit.token("Punctuator", "--")
      const opening = kit.node("AgentflowOpeningArrow", mark.range, {
        value: "--",
        startMarker: "none",
        line: "solid",
      })
      const label = afLabel(kit, "failed")
      const arrow = afArrow(kit, "--x", "solid", 2, "cross")
      const target = one(kit, "B")
      return [
        afStatement(kit, first, [
          afNode(kit, "Link", [opening, target], {
            id: null,
            opening,
            arrow,
            label,
            target,
          }),
        ]),
      ]
    },
  },
  {
    fixture: "gram-flow-all-forms",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "named"),
        () => [afStatement(kit, one(kit, "A"))],
        () => afLabel(kit, "Title"),
      ),
      afContainer(
        kit,
        "flow",
        () => name(kit, "bare"),
        () => [afStatement(kit, one(kit, "B"))],
      ),
      afContainer(kit, "flow", null, () => [afStatement(kit, one(kit, "C"))]),
    ],
  },
  {
    fixture: "gram-flow-nested",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "outer"),
        () => [
          afContainer(
            kit,
            "flow",
            () => name(kit, "inner"),
            () => [edge(kit, "A", "B")],
            () => afLabel(kit, "Inner"),
          ),
          afStatement(kit, one(kit, "C")),
        ],
        () => afLabel(kit, "Outer"),
      ),
    ],
  },
  {
    fixture: "gram-global-after-flow",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [edge(kit, "A", "G")],
      ),
      afContainer(kit, "global", null, () => [afStatement(kit, one(kit, "G"))]),
    ],
  },
  {
    fixture: "db-global-flow-id",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(kit, "global", null, () => [
        afContainer(
          kit,
          "flow",
          () => name(kit, "F"),
          () => [afStatement(kit, one(kit, "A"))],
        ),
      ]),
      afContainer(
        kit,
        "flow",
        () => name(kit, "G"),
        () => [edge(kit, "X", "F")],
      ),
    ],
  },
  {
    fixture: "gram-connector-all-forms",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "connector",
        () => name(kit, "C"),
        undefined,
        () => afLabel(kit, "API"),
      ),
      afContainer(kit, "connector", () => name(kit, "D")),
      afContainer(
        kit,
        "connector",
        () => name(kit, "E"),
        undefined,
        () => afLabel(kit, "Other"),
        ["@{ endpoint: x }"],
      ),
      afContainer(kit, "connector", () => name(kit, "F"), undefined, null, [
        "@{ protocol: http }",
      ]),
    ],
  },
  {
    fixture: "db-duplicate-flow-empty-last-title",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "A"))],
        () => afLabel(kit, "First"),
      ),
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "B"))],
      ),
    ],
  },
  {
    fixture: "lex-flow-name-click-state",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(kit, "flow", () =>
        afName(kit, [
          afIgnored(kit, "click", "click"),
          afLabel(kit, "A"),
          afLabel(kit, "B"),
        ]),
      ),
    ],
  },
  {
    fixture: "lex-flow-name-click-mixed",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(kit, "flow", () =>
        afName(kit, [
          afLabel(kit, "Handle "),
          afIgnored(kit, "click", "click"),
          afLabel(kit, "events"),
          afLabel(kit, "B"),
        ]),
      ),
    ],
  },
  {
    fixture: "gram-flow-name-quoted-padding",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => afName(kit, [afLabel(kit, '" F "', "string", " F ")]),
        () => [afStatement(kit, one(kit, "A"))],
      ),
    ],
  },
  {
    fixture: "gram-classdef-multi",
    make: (kit: Kit): CheckedNode[] => [
      afStyling(kit, "classDef", ["hot", "cold"], ["fill:red", "color:blue"]),
      afStatement(kit, afGroup(kit, [() => afVertex(kit, "A", null, "hot")])),
      afStyling(kit, "class", ["A"], ["cold"]),
    ],
  },
  {
    fixture: "gram-click-callback-forms",
    make: (kit: Kit): CheckedNode[] =>
      ["A", "B", "C", "D"]
        .map((id) => afStatement(kit, one(kit, id)))
        .concat([
          afCallback(kit, ["A"], "run", false, null),
          afCallback(kit, ["B"], "run", false, null, '"tip"'),
          afCallback(kit, ["C"], "go", true, null),
          afCallback(kit, ["D"], "go", true, '1, "two,three"', '"tip"'),
        ]),
  },
  {
    fixture: "gram-click-link-forms",
    make: (kit: Kit): CheckedNode[] =>
      ["A", "B", "C", "D"]
        .map((id) => afStatement(kit, one(kit, id)))
        .concat([
          afUrl(kit, ["A"], '"https://a.example"'),
          afUrl(kit, ["B"], '"https://b.example"', false, '"tip"'),
          afUrl(kit, ["C"], '"https://c.example"', true, null, "_self"),
          afUrl(kit, ["D"], '"https://d.example"', true, '"tip"', "_top"),
        ]),
  },
  {
    fixture: "gram-linkstyle-default",
    make: (kit: Kit): CheckedNode[] => [
      afLinkStyle(kit, null, null, ["stroke:red"]),
      edge(kit, "A", "B"),
    ],
  },
  {
    fixture: "gram-linkstyle-interpolate-default",
    make: (kit: Kit): CheckedNode[] => [
      afLinkStyle(kit, null, "linear", []),
      edge(kit, "A", "B"),
      afLinkStyle(kit, null, "basis", ["stroke:red"]),
      edge(kit, "B", "C"),
    ],
  },
  {
    fixture: "db-acctitle-next-line",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accTitle", "A-->B"),
    ],
  },
  {
    fixture: "db-accdescr-next-line",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accDescr", "A-->B"),
    ],
  },
  {
    fixture: "db-accessibility-empty-block",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accDescr", "First"),
      afAccessibility(kit, "accDescr", null, true),
      afStatement(kit, one(kit, "A")),
    ],
  },
  {
    fixture: "db-metadata-before-connector",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "C", null, ["@{ instruction: before }"])),
      afContainer(kit, "connector", () => name(kit, "C")),
    ],
  },
  {
    fixture: "db-flow-three-definitions",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "A"))],
        () => afLabel(kit, "First"),
      ),
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "B"))],
        () => afLabel(kit, "Second"),
      ),
      afContainer(
        kit,
        "flow",
        () => name(kit, "G"),
        () => [afStatement(kit, one(kit, "C"))],
        () => afLabel(kit, "Partner"),
      ),
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [edge(kit, "D", "G")],
        () => afLabel(kit, "Third"),
      ),
    ],
  },
  {
    fixture: "gram-group-spaces",
    make: (kit: Kit): CheckedNode[] => {
      const first = afGroup(kit, [
        () => afVertex(kit, "A"),
        () => afVertex(kit, "B"),
      ])
      return [
        afStatement(kit, first, [
          afLink(
            kit,
            () => afArrow(kit, "-->", "solid", 2, "arrow"),
            () =>
              afGroup(kit, [
                () => afVertex(kit, "C"),
                () => afVertex(kit, "D"),
              ]),
          ),
        ]),
      ]
    },
  },
  {
    fixture: "gram-reference-quoted-pipe-label",
    make: (kit: Kit): CheckedNode[] => {
      const first = one(kit, "A")
      return [
        afStatement(kit, first, [
          afLink(
            kit,
            () => afArrow(kit, "-..-", "dotted", 2, "none"),
            () => one(kit, "B"),
            null,
            () => afLabel(kit, '"ref"', "string", "ref"),
          ),
        ]),
      ]
    },
  },
  ...METADATA.map(([fixture, raw]): AgentflowCase => ({
    fixture,
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A", null, [raw])),
    ],
  })),
  {
    fixture: "db-data-block-adjacent",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(
        kit,
        one(kit, "A", null, ["@{ shape: tool, }", "@{ label: Work }"]),
      ),
    ],
  },
  {
    fixture: "gram-flow-inline-data",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "A"))],
        () => afLabel(kit, "Title"),
        ["@{ view: collapsed, model: x }"],
      ),
    ],
  },
  {
    fixture: "db-props-proto-after-bare",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A")),
      afStatement(
        kit,
        one(kit, "A", {
          opening: "[|",
          closing: "]",
          name: "rectangle",
          property: ["__proto__", "value"],
          raw: "Label",
        }),
      ),
    ],
  },
  {
    fixture: "gram-style-whitespace-after-comma",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const keyword = kit.token("Keyword", "style")
      const id = afId(kit, "A")
      const style = afLiteral(kit, "fill:red")
      const comma = kit.token("Punctuator", ",")
      return [
        vertex,
        afNode(kit, "StyleStatement", [keyword, comma], {
          id,
          styles: [style, null],
        }),
      ]
    },
  },
  {
    fixture: "db-style-leading-whitespace",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = edge(kit, "A", "B")
      const keyword = kit.token("Keyword", "linkStyle")
      const raw = kit.token("Numeric", "0")
      const index = kit.node("NumericLiteral", raw.range, {
        value: 0,
        raw: "0",
      })
      const style = afLiteral(kit, " fill:red")
      return [
        vertex,
        afNode(kit, "LinkStyleStatement", [keyword, style], {
          indices: [index],
          interpolate: null,
          styles: [style],
        }),
      ]
    },
  },
  {
    fixture: "gram-click-erased-before-url",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const keyword = kit.token("Keyword", "click")
      const id = afId(kit, "A")
      const prefix = afIgnored(kit, "click", "click")
      const token = kit.token("String", '"u"')
      const url = kit.node("StringLiteral", token.range, {
        raw: '"u"',
        value: "u",
        closed: true,
      })
      return [
        vertex,
        afNode(kit, "ClickUrlStatement", [keyword, url], {
          ids: [id],
          textBeforeUrl: [prefix],
          url,
          textBeforeTooltip: [],
          tooltip: null,
          target: null,
        }),
      ]
    },
  },
  {
    fixture: "gram-style-all-null",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A")),
      afStyling(kit, "style", ["A"], [null]),
    ],
  },
  {
    fixture: "gram-classdef-all-null",
    make: (kit: Kit): CheckedNode[] => [
      afStyling(kit, "classDef", ["c"], [null]),
    ],
  },
  {
    fixture: "gram-classdef-trailing-empty-name",
    make: (kit: Kit): CheckedNode[] => [
      afStyling(kit, "classDef", ["hot", null], ["fill:red"]),
    ],
  },
  {
    fixture: "gram-class-target-empty-ends",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A")),
      afStyling(kit, "class", [null, "A", null], ["hot"]),
    ],
  },
  {
    fixture: "gram-linkstyle-all-null",
    make: (kit: Kit): CheckedNode[] => [
      edge(kit, "A", "B"),
      afLinkStyle(kit, ["0"], null, [null]),
    ],
  },
  {
    fixture: "gram-linkstyle-trailing-null-style",
    make: (kit: Kit): CheckedNode[] => [
      edge(kit, "A", "B"),
      afLinkStyle(kit, ["0"], null, ["stroke:red", null]),
    ],
  },
  {
    fixture: "gram-default-linkstyle-all-null",
    make: (kit: Kit): CheckedNode[] => [afLinkStyle(kit, null, null, [null])],
  },
  {
    fixture: "gram-default-linkstyle-trailing-null-style",
    make: (kit: Kit): CheckedNode[] => [
      afLinkStyle(kit, null, null, ["stroke:red", null]),
    ],
  },
  {
    fixture: "gram-click-id-empty-ends",
    make: (kit: Kit): CheckedNode[] => [
      afUrl(kit, [null, "A", null], '"u"', true, '"tip"'),
    ],
  },
  {
    fixture: "gram-callback-arguments-after-second-call",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const first = kit.token("Keyword", "click")
      const id = afId(kit, "A")
      kit.token("Keyword", "call")
      const callback = afLiteral(kit, "go")
      kit.token("Punctuator", "(")
      kit.token("Punctuator", ")")
      kit.token("Keyword", "call")
      kit.token("Punctuator", "(")
      const args = afLiteral(kit, "x")
      const last = kit.token("Punctuator", ")")
      return [
        vertex,
        afNode(kit, "ClickCallbackStatement", [first, last], {
          ids: [id],
          callback,
          arguments: args,
          textBeforeTooltip: [],
          tooltip: null,
        }),
      ]
    },
  },
  {
    fixture: "gram-click-erased-before-url-tooltip",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const first = kit.token("Keyword", "click")
      const id = afId(kit, "A")
      kit.token("Keyword", "href")
      const url = afString(kit, '"u"')
      const prefix = afIgnored(kit, "click", "click")
      const tooltip = afString(kit, '"tip"')
      return [
        vertex,
        afNode(kit, "ClickUrlStatement", [first, tooltip], {
          ids: [id],
          textBeforeUrl: [],
          url,
          textBeforeTooltip: [prefix],
          tooltip,
          target: null,
        }),
      ]
    },
  },
  {
    fixture: "gram-click-erased-before-callback-tooltip",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const first = kit.token("Keyword", "click")
      const id = afId(kit, "A")
      kit.token("Keyword", "call")
      const callback = afLiteral(kit, "go")
      kit.token("Punctuator", "(")
      kit.token("Punctuator", ")")
      const prefix = afIgnored(kit, "click", "click")
      const tooltip = afString(kit, '"tip"')
      return [
        vertex,
        afNode(kit, "ClickCallbackStatement", [first, tooltip], {
          ids: [id],
          callback,
          arguments: null,
          textBeforeTooltip: [prefix],
          tooltip,
        }),
      ]
    },
  },
  {
    fixture: "gram-empty-description-before-href",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const first = kit.token("Keyword", "click")
      const id = afId(kit, "A")
      const prefix = afIgnored(kit, "accDescr {}", "empty-description-block")
      kit.token("Keyword", "href")
      const url = afString(kit, '"u"')
      return [
        vertex,
        afNode(kit, "ClickUrlStatement", [first, url], {
          ids: [id],
          textBeforeUrl: [prefix],
          url,
          textBeforeTooltip: [],
          tooltip: null,
          target: null,
        }),
      ]
    },
  },
  {
    fixture: "lex-mixed-empty-forms-before-url-tooltip",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const first = kit.token("Keyword", "click")
      const id = afId(kit, "A")
      const url = afString(kit, '"u"')
      const textBeforeTooltip = [
        afIgnored(kit, '""', "empty-string"),
        afIgnored(kit, "call ()", "empty-call"),
        afIgnored(kit, '"``"', "empty-markdown-string"),
      ]
      const tooltip = afString(kit, '"tip"')
      return [
        vertex,
        afNode(kit, "ClickUrlStatement", [first, tooltip], {
          ids: [id],
          textBeforeUrl: [],
          url,
          textBeforeTooltip,
          tooltip,
          target: null,
        }),
      ]
    },
  },
  {
    fixture: "lex-empty-string-in-flow-name",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () =>
          afName(kit, [
            afIgnored(kit, '""', "empty-string"),
            afLabel(kit, "F"),
          ]),
        () => [afStatement(kit, one(kit, "A"))],
      ),
    ],
  },
  {
    fixture: "lex-empty-markdown-in-flow-name",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () =>
          afName(kit, [
            afIgnored(kit, '"``"', "empty-markdown-string"),
            afLabel(kit, "F"),
          ]),
        () => [afStatement(kit, one(kit, "A"))],
      ),
    ],
  },
  {
    fixture: "lex-empty-call-in-connector-name",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "connector",
        () =>
          afName(kit, [
            afIgnored(kit, "call ( \t)", "empty-call"),
            afLabel(kit, "C"),
          ]),
        undefined,
        () => afLabel(kit, "T"),
      ),
    ],
  },
  {
    fixture: "gram-global-nested",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [
          afContainer(kit, "global", null, () => [
            afStatement(kit, one(kit, "G")),
          ]),
          edge(kit, "A", "G"),
        ],
      ),
    ],
  },
  {
    fixture: "db-flow-self-reference",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [edge(kit, "A", "F")],
      ),
    ],
  },
  {
    fixture: "db-data-block-reserved-connectors",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "connectors", null, ["@{ instruction: go }"])),
    ],
  },
  {
    fixture: "db-connector-edge-id-collision",
    make: (kit: Kit): CheckedNode[] => {
      const connector = afContainer(kit, "connector", () => name(kit, "same"))
      const first = one(kit, "A")
      const link = afLink(
        kit,
        () => afArrow(kit, "-->", "solid", 2, "arrow"),
        () => one(kit, "B"),
        "same",
      )
      return [
        connector,
        afStatement(kit, first, [link]),
        afStatement(kit, one(kit, "same", null, ["@{ instruction: go }"])),
      ]
    },
  },
  {
    fixture: "db-accessibility-unclosed-block",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accDescr", "open\nA\n", true, false),
    ],
  },
  {
    fixture: "db-accessibility-empty-unclosed",
    make: (kit: Kit): CheckedNode[] => [
      afAccessibility(kit, "accDescr", "First"),
      afAccessibility(kit, "accDescr", null, true, false),
    ],
  },
  {
    fixture: "gram-hasownproperty-last-member",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [
          afStatement(kit, one(kit, "A")),
          afStatement(kit, one(kit, "hasOwnProperty")),
        ],
      ),
    ],
  },
  {
    fixture: "db-flow-repeat-before-unnamed",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "A"))],
        () => afLabel(kit, '"First"', "string", "First"),
      ),
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "B"))],
        () => afLabel(kit, '"`Second`"', "markdown", "Second"),
      ),
      afContainer(kit, "flow", null, () => [afStatement(kit, one(kit, "C"))]),
    ],
  },
  {
    fixture: "db-connector-repeated-without-title",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "connector",
        () => name(kit, "C"),
        undefined,
        () => afLabel(kit, '"First"', "string", "First"),
      ),
      afStatement(kit, one(kit, "C", null, ["@{ endpoint: x }"])),
      afContainer(kit, "connector", () => name(kit, "C")),
      afContainer(
        kit,
        "connector",
        () => name(kit, "C"),
        undefined,
        () => afLabel(kit, '" "', "string", " "),
      ),
    ],
  },
  {
    fixture: "lex-directive-in-name-empty-block-padding",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => {
          const head = afLabel(kit, "F ")
          const first = kit.token("RawText", "accDescr { ")
          kit.directive("%%{init: {}}%%")
          const last = kit.token("RawText", " }")
          return afName(kit, [
            head,
            afNode(kit, "IgnoredText", [first, last], {
              kind: "empty-description-block",
              value: "accDescr {  }",
            }),
          ])
        },
        () => [afStatement(kit, one(kit, "A"))],
      ),
    ],
  },
  {
    fixture: "db-data-block-invalid-yaml",
    db: false,
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A", null, ["@{ key: *, }"])),
    ],
  },
  {
    fixture: "db-data-block-unknown-shape",
    db: false,
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A", null, ["@{ shape: nonexistent }"])),
    ],
  },
]

/** Fixed rejected inputs with a deliberately representable, but invalid, reading. */
interface AgentflowRejectionCase extends AgentflowCase {
  readonly problem: string
}

export const AGENTFLOW_REJECTION_CASES: readonly AgentflowRejectionCase[] = [
  {
    fixture: "gram-style-null-before-comment",
    problem: "a null style needs a written whitespace style unit",
    make: (kit: Kit): CheckedNode[] => {
      const vertex = afStatement(kit, one(kit, "A"))
      const style = afStyling(kit, "style", ["A"], [null])
      kit.comment("%%", "%% c")
      return [vertex, style]
    },
  },
  {
    fixture: "gram-style-empty-value",
    problem: "a null style needs a written whitespace style unit",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A")),
      afStyling(kit, "style", ["A"], [null]),
    ],
  },
  {
    fixture: "gram-class-one-operand",
    problem: "an id list needs a written id or comma",
    make: (kit: Kit): CheckedNode[] => [
      afStyling(kit, "class", [null], ["hot"]),
    ],
  },

  {
    fixture: "lex-linkstyle-leading-zero",
    problem: "not canonical",
    make: (kit: Kit): CheckedNode[] => [
      edge(kit, "A", "B"),
      afLinkStyle(kit, ["00"], null, ["stroke:red"]),
    ],
  },
  {
    fixture: "gram-linkstyle-style-out-of-bounds",
    problem: "names no preceding edge",
    make: (kit: Kit): CheckedNode[] => [
      edge(kit, "A", "B"),
      afLinkStyle(kit, ["1"], null, ["stroke:red"]),
    ],
  },
  {
    fixture: "gram-flow-named-member-hasownproperty",
    problem: "hasOwnProperty is followed",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "Outer"),
        () => [
          afContainer(
            kit,
            "flow",
            () => name(kit, "hasOwnProperty"),
            () => [afStatement(kit, one(kit, "A"))],
          ),
          afStatement(kit, one(kit, "B")),
        ],
      ),
    ],
  },
  {
    fixture: "gram-group-unspaced",
    problem: "needs whitespace on both sides",
    make: (kit: Kit): CheckedNode[] => {
      const first = afGroup(kit, [
        () => afVertex(kit, "A"),
        () => afVertex(kit, "B"),
      ])
      return [
        afStatement(kit, first, [
          afLink(
            kit,
            () => afArrow(kit, "-->", "solid", 2, "arrow"),
            () =>
              afGroup(kit, [
                () => afVertex(kit, "C"),
                () => afVertex(kit, "D"),
              ]),
          ),
        ]),
      ]
    },
  },
  {
    fixture: "gram-pipe-label-two-spaces-after",
    problem: "at most one following space",
    make: (kit: Kit): CheckedNode[] => {
      const first = one(kit, "A")
      return [
        afStatement(kit, first, [
          afLink(
            kit,
            () => afArrow(kit, "-->", "solid", 2, "arrow"),
            () => one(kit, "B"),
            null,
            () => afLabel(kit, "x"),
          ),
        ]),
      ]
    },
  },
  {
    fixture: "lex-data-block-caret",
    problem: "unprotected brace or caret",
    make: (kit: Kit): CheckedNode[] => [
      afStatement(kit, one(kit, "A", null, ["@{ label: a^b }"])),
    ],
  },
  {
    fixture: "div-empty-string-statement",
    problem: "the field body holds a AgentflowIgnoredText",
    make: (kit: Kit): CheckedNode[] => [
      afIgnored(kit, '""', "empty-string"),
      afStatement(kit, one(kit, "A")),
    ],
  },
  {
    fixture: "div-directive-in-arrow",
    direction: "LR",
    problem: "the tokens of the arrow",
    make: (kit: Kit): CheckedNode[] => {
      const first = one(kit, "A")
      const start = kit.token("Punctuator", "-")
      kit.directive("%%{init: {}}%%")
      const end = kit.token("Punctuator", "->")
      const arrow = afNode(kit, "Arrow", [start, end], {
        value: "-->",
        startMarker: "none",
        line: "solid",
        length: 2,
        endMarker: "arrow",
      })
      const target = one(kit, "B")
      return [
        afStatement(kit, first, [
          afNode(kit, "Link", [arrow, target], {
            id: null,
            opening: null,
            arrow,
            label: null,
            target,
          }),
        ]),
      ]
    },
  },
  {
    fixture: "div-ignored-semicolon-in-arrow",
    direction: "LR",
    problem: "the tokens of the arrow",
    make: (kit: Kit): CheckedNode[] => {
      const first = one(kit, "A", {
        opening: "[",
        closing: "]",
        name: "rectangle",
        raw: "style:#x",
      })
      const start = kit.token("Punctuator", "-")
      kit.token("IgnoredSemicolon", ";")
      const end = kit.token("Punctuator", "->")
      const arrow = afNode(kit, "Arrow", [start, end], {
        value: "-->",
        startMarker: "none",
        line: "solid",
        length: 2,
        endMarker: "arrow",
      })
      const target = one(kit, "B")
      return [
        afStatement(kit, first, [
          afNode(kit, "Link", [arrow, target], {
            id: null,
            opening: null,
            arrow,
            label: null,
            target,
          }),
        ]),
      ]
    },
  },
  {
    fixture: "gram-flow-title-space-before-newline",
    problem: "heading padding",
    make: (kit: Kit): CheckedNode[] => [
      afContainer(
        kit,
        "flow",
        () => name(kit, "F"),
        () => [afStatement(kit, one(kit, "A"))],
        () => afLabel(kit, "T"),
      ),
    ],
  },
]

/** Apply the hand-supplied productions to the existing source. */
export function buildAgentflowCase(
  testCase: AgentflowCase,
  input: string,
): Built {
  return agentflowTree(
    input,
    testCase.make,
    testCase.direction === undefined ? "TB" : testCase.direction,
  )
}

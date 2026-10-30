import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { locationOf } from "./check-tree-trees.ts"

/** Written argument pieces, supplied by hand rather than read from the expected Db. */
type Arg = string | null | readonly [key: string, quoted: string]
interface Statement {
  readonly keyword: string
  readonly args?: readonly Arg[]
  readonly body?: readonly Statement[]
  readonly beforeBody?: readonly Statement[]
  readonly text?: string | null
}
interface Case {
  readonly fixture: string
  readonly body: readonly Statement[]
  readonly kind?: string
  readonly beforeBody?: readonly Statement[]
  readonly values?: Readonly<Record<string, string>>
}

/** An explicit shape call, using the ordinary Person spelling by default. */
function e(...args: Arg[]): Statement {
  return { keyword: "Person", args }
}

/** An explicit relationship call. */
function r(...args: Arg[]): Statement {
  return { keyword: "Rel", args }
}

/** An explicit update call. */
function u(keyword: string, ...args: Arg[]): Statement {
  return { keyword, args }
}

/** An explicit boundary and its children. */
function b(
  args: readonly Arg[],
  body: readonly Statement[],
  keyword = "Boundary",
  beforeBody?: readonly Statement[],
): Statement {
  return { keyword, args, body, beforeBody }
}

/** An explicit title or accessibility statement; braces and colons remain distinct spellings. */
function t(keyword: string, text: string | null): Statement {
  return { keyword, text }
}

const PERSON = e("a", '"A"')
const REL = r("a", "b", '"Uses"')
const EMPTY = t("accDescr{", null)

// The exact quoted number in the two fixed overflow fixtures.
const OVERFLOW =
  '"9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"'

/** Fixed corpus cases for every slot-mapping keyword family. */
const ELEMENT_KEYWORDS: readonly [string, string][] = [
  ["person", "Person"],
  ["person-ext", "Person_Ext"],
  ["system", "System"],
  ["systemdb", "SystemDb"],
  ["systemqueue", "SystemQueue"],
  ["system-ext", "System_Ext"],
  ["systemdb-ext", "SystemDb_Ext"],
  ["systemqueue-ext", "SystemQueue_Ext"],
  ["container", "Container"],
  ["containerdb", "ContainerDb"],
  ["containerqueue", "ContainerQueue"],
  ["container-ext", "Container_Ext"],
  ["containerdb-ext", "ContainerDb_Ext"],
  ["containerqueue-ext", "ContainerQueue_Ext"],
  ["component", "Component"],
  ["componentdb", "ComponentDb"],
  ["componentqueue", "ComponentQueue"],
  ["component-ext", "Component_Ext"],
  ["componentdb-ext", "ComponentDb_Ext"],
  ["componentqueue-ext", "ComponentQueue_Ext"],
]
const BOUNDARY_KEYWORDS: readonly [string, string, readonly Arg[]][] = [
  ["boundary", "Boundary", ["b", '"B"', '"type"', '"tags"', '"link"']],
  [
    "enterprise-boundary",
    "Enterprise_Boundary",
    ["b", '"B"', '"tags"', '"link"'],
  ],
  ["system-boundary", "System_Boundary", ["b", '"B"', '"tags"', '"link"']],
  [
    "container-boundary",
    "Container_Boundary",
    ["b", '"B"', '"tags"', '"link"'],
  ],
  [
    "deployment-node",
    "Deployment_Node",
    ["b", '"B"', '"type"', '"D"', '"sprite"', '"tags"', '"link"'],
  ],
  [
    "node",
    "Node",
    ["b", '"B"', '"type"', '"D"', '"sprite"', '"tags"', '"link"'],
  ],
  [
    "node-l",
    "Node_L",
    ["b", '"B"', '"type"', '"D"', '"sprite"', '"tags"', '"link"'],
  ],
  [
    "node-r",
    "Node_R",
    ["b", '"B"', '"type"', '"D"', '"sprite"', '"tags"', '"link"'],
  ],
]
const REL_KEYWORDS: readonly [string, string][] = [
  ["rel", "Rel"],
  ["birel", "BiRel"],
  ["rel-u", "Rel_U"],
  ["rel-up", "Rel_Up"],
  ["rel-d", "Rel_D"],
  ["rel-down", "Rel_Down"],
  ["rel-l", "Rel_L"],
  ["rel-left", "Rel_Left"],
  ["rel-r", "Rel_R"],
  ["rel-right", "Rel_Right"],
  ["rel-back", "Rel_Back"],
  ["relindex", "RelIndex"],
]

const CASES: readonly Case[] = [
  {
    fixture: "gram-proto-required-alias",
    body: [e(["__proto__", '"V"'], '"A"')],
  },
  {
    fixture: "gram-proto-layout",
    body: [u("UpdateLayoutConfig", ["__proto__", '"V"'], '"1"')],
  },
  {
    fixture: "gram-title-inside-boundary",
    body: [b(["b", '"B"'], [PERSON, t("title", "T")])],
  },
  {
    fixture: "gram-named-proto-node-ignored-sprite",
    body: [
      b(["b", '"B"', '"T"', '"D"', ["__proto__", '"V"']], [PERSON], "Node"),
    ],
  },
  {
    fixture: "gram-proto-unused-extra",
    body: [e("a", '"A"', '"D"', '"s"', '"t"', '"l"', ["__proto__", '"V"'])],
  },
  {
    fixture: "gram-proto-rel-missing-target",
    body: [u("UpdateRelStyle", "a", "b", ["__proto__", '"V"'])],
  },
  {
    fixture: "db-number-rel-style-empty",
    body: [REL, u("UpdateRelStyle", "a", "b", '"red"', '"blue"', '""', '""')],
  },
  {
    fixture: "db-style-required-named-target",
    body: [PERSON, u("UpdateElementStyle", ["alias", '"a"'], '"red"')],
  },
  {
    fixture: "db-number-rel-style-overflow",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", '"red"', '"blue"', OVERFLOW, OVERFLOW),
    ],
  },
  {
    fixture: "db-number-layout-overflow",
    body: [u("UpdateLayoutConfig", OVERFLOW, OVERFLOW)],
  },
  ...ELEMENT_KEYWORDS.map(([fixture, keyword]) => ({
    fixture: `db-keyword-${fixture}`,
    body: [
      u(
        keyword,
        "a",
        '"A"',
        ...(keyword.startsWith("Container") || keyword.startsWith("Component")
          ? ['"Java"']
          : []),
        '"D"',
        '"sprite"',
        '"tags"',
        '"link"',
      ),
    ],
  })),
  ...BOUNDARY_KEYWORDS.map(([fixture, keyword, args]) => ({
    fixture: `db-keyword-${fixture}`,
    body: [b(args, [PERSON], keyword)],
  })),
  ...REL_KEYWORDS.map(([fixture, keyword]) => ({
    fixture: `db-keyword-${fixture}`,
    body: [
      u(
        keyword,
        ...(keyword === "RelIndex" ? ['"5"'] : []),
        "a",
        "b",
        '"Uses"',
        '"HTTPS"',
        '"D"',
        '"sprite"',
        '"tags"',
        '"link"',
      ),
    ],
  })),
  {
    fixture: "db-keyword-updateelementstyle",
    body: [
      PERSON,
      u(
        "UpdateElementStyle",
        "a",
        '"red"',
        '"white"',
        '"black"',
        '"yes"',
        '"box"',
        '"sprite"',
        '"Java"',
        '"Legend"',
        '"star"',
      ),
    ],
  },
  {
    fixture: "db-keyword-updaterelstyle",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", '"red"', '"blue"', '"-4"', '"5"'),
    ],
  },
  {
    fixture: "db-keyword-updatelayoutconfig",
    body: [u("UpdateLayoutConfig", '"3"', '"1"')],
  },
  ...["context", "container", "component", "dynamic", "deployment"].map(
    (kind) => ({ fixture: `header-${kind}-minimal`, kind, body: [PERSON] }),
  ),
  { fixture: "db-title-whitespace", body: [t("title", "   T   "), PERSON] },
  { fixture: "db-title-spaces-only", body: [t("title", "  ")] },
  { fixture: "db-title-tab-only", body: [t("title", "\t")] },
  {
    fixture: "db-acc-description-whitespace",
    body: [t("accDescription", "   D   "), PERSON],
  },
  {
    fixture: "db-acc-description-spaces-only",
    body: [t("accDescription", "  ")],
  },
  { fixture: "db-acctitle-spaces", body: [t("accTitle:", "T"), PERSON] },
  { fixture: "db-accdescr-spaces", body: [t("accDescr:", "T"), PERSON] },
  { fixture: "lex-title-separator-crlf", body: [t("title", "T")] },
  { fixture: "lex-title-value-ls", body: [t("title", "A\u2028B")] },
  { fixture: "lex-empty-strings", body: [e('""', '""')] },
  { fixture: "lex-trailing-comma", body: [PERSON] },
  {
    fixture: "lex-bare-comment-line",
    body: [e("first\n%% comment\nlast", '"A"')],
    values: { "first\n%% comment\nlast": "first\nlast" },
  },
  {
    fixture: "lex-named-value-comment-line",
    body: [e("a", '"A"', ["descr", '"first\n%% comment\nlast"'])],
    values: { '"first\n%% comment\nlast"': "first\nlast" },
  },
  {
    fixture: "db-grid-entity-text-argument-quoted",
    body: [e("a", '"a#35;b"', '"D"', '"S"', '"T"', '"L"')],
  },
  {
    fixture: "db-grid-html-attribute-text-argument-quoted",
    body: [e("a", '"a<a href="x">b"', '"D"', '"S"', '"T"', '"L"')],
  },
  {
    fixture: "db-grid-crlf-text-argument-quoted",
    body: [e("a", '"a\r\nb"', '"D"', '"S"', '"T"', '"L"')],
  },
  {
    fixture: "db-grid-entity-named-key",
    body: [e("a", '"A"', ["a#35;b", '"V"'])],
  },
  {
    fixture: "db-grid-entity-named-value",
    body: [e("a", '"A"', ["descr", '"a#35;b"'])],
  },
  { fixture: "config-wrap-true", body: [PERSON] },
  ...["false", "null", "text"].map((name) => ({
    fixture: `config-wrap-${name}`,
    body: [b(["b", '"B"'], [PERSON]), REL],
  })),
  {
    fixture: "config-security-level-other",
    body: [
      t("title", "<b>T</b> = value"),
      t("accDescr:", "<i>D</i> = value"),
      e("a", '"<b>A</b> = value"'),
    ],
  },
  ...[
    "html-labels-false",
    "flowchart-html-labels-false",
    "root-overrides-flowchart",
  ].map((name) => ({
    fixture: `config-security-level-other-${name}`,
    body: [
      t("title", "<b>T</b> = value"),
      t("accDescr:", "<i>D</i> = value"),
      PERSON,
    ],
  })),
  {
    fixture: "gram-arguments-person-above",
    body: [e("a", '"A"', '"D"', '"sprite"', '"tags"', '"link"', '"ignored"')],
  },
  {
    fixture: "gram-arguments-rel-above",
    body: [
      r(
        "a",
        "b",
        '"Uses"',
        '"HTTPS"',
        '"D"',
        '"sprite"',
        '"tags"',
        '"link"',
        '"ignored"',
      ),
    ],
  },
  {
    fixture: "gram-arguments-element-style-above",
    body: [
      PERSON,
      u(
        "UpdateElementStyle",
        "a",
        '"red"',
        '"white"',
        '"black"',
        '"yes"',
        '"box"',
        '"sprite"',
        '"Java"',
        '"Legend"',
        '"star"',
        '"ignored"',
      ),
    ],
  },
  { fixture: "gram-rel-too-few-quoted", body: [r('"a"')] },
  { fixture: "gram-arguments-index-one", body: [u("RelIndex", '"5"')] },
  { fixture: "gram-rel-empty-label", body: [r("a", "b", '""')] },
  {
    fixture: "gram-arguments-rel-empty",
    body: [r('""', '""', '""', '""', '""', '""', '""', '""')],
  },
  {
    fixture: "db-number-layout-hex",
    body: [u("UpdateLayoutConfig", '"0x10"', '"0x10"')],
  },
  {
    fixture: "db-number-rel-style-hex",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", '"red"', '"blue"', '"0x10"', '"0x10"'),
    ],
  },
  {
    fixture: "db-all-fields",
    body: [
      t("title", "All fields"),
      t("accDescr:", "Accessible description"),
      b(
        ["outer", '"Outer"', '"company"', '"bt"', '"bl"'],
        [
          b(
            [
              "inner",
              '"Inner"',
              '"machine"',
              '"Node description"',
              '"node sprite"',
              '"nt"',
              '"nl"',
            ],
            [
              u(
                "Container",
                "a",
                '"A"',
                '"Java"',
                '"Description"',
                '"sprite"',
                '"tags"',
                '"javascript:alert(1)"',
              ),
              e("b", '"B"', '"Person description"', ["custom", '"own"']),
            ],
            "Node",
          ),
        ],
      ),
      r(
        "a",
        "b",
        '"Uses"',
        '"HTTPS"',
        '"Relationship"',
        '"rel sprite"',
        '"rt"',
        '"rl"',
      ),
      u(
        "UpdateElementStyle",
        "a",
        '"red"',
        '"white"',
        '"blue"',
        '"yes"',
        '"box"',
        '"changed sprite"',
        '"Changed technology"',
        '"Legend"',
        '"Legend sprite"',
      ),
      u("UpdateRelStyle", "a", "b", '"green"', '"black"', '"-4px"', '"+7.5"'),
      u("UpdateLayoutConfig", '"3"', '"1"'),
    ],
  },
  {
    fixture: "db-shape-three-definitions",
    body: [
      u("Container", "a", '"First"', '"Java"', '"First D"', [
        "tags",
        '"first"',
      ]),
      e("b", '"Partner"'),
      e("a", '"Second"'),
      b(["c", '"C"'], [u("System", "a", '"Third"', '"Third D"')]),
    ],
  },
  {
    fixture: "db-boundary-three-definitions",
    body: [
      b(["b", '"First"', '"one"', '"tags"', '"link"'], [PERSON]),
      b(["c", '"Partner"'], [e("d", '"D"')]),
      b(["b", '"Second"'], [e("e", '"E"')]),
      b(["c", '"Other"'], [b(["b", '"Third"'], [e("f", '"F"')])]),
    ],
  },
  {
    fixture: "db-rel-three-definitions",
    body: [
      r(
        "a",
        "b",
        '"First"',
        '"HTTPS"',
        '"Description"',
        '"sprite"',
        '"tags"',
        '"link"',
      ),
      r("b", "a", '"Partner"'),
      u("BiRel", "a", "b", '"Second"'),
      u("Rel_R", "a", "b", '"Third"', '"RPC"'),
    ],
  },
  {
    fixture: "gram-boundary-nested",
    body: [
      b(
        ["b", '"B"'],
        [
          b(
            ["c", '"C"'],
            [b(["d", '"D"'], [PERSON], "Container_Boundary"), e("e", '"E"')],
            "Node",
          ),
          e("f", '"F"'),
        ],
      ),
      e("g", '"G"'),
    ],
  },
  {
    fixture: "gram-boundary-global-alias",
    body: [b(["global", '"Written"'], [PERSON])],
  },
  {
    fixture: "db-boundary-alias-named-change",
    body: [b(["b", '"B"', ["alias", '"c"']], [PERSON])],
  },
  {
    fixture: "gram-boundary-reused-alias",
    body: [
      b(["b", '"B"'], [PERSON]),
      u("System", "b", '"Shape B"'),
      u("UpdateElementStyle", "b", '"red"'),
    ],
  },
  {
    fixture: "db-required-named-alias-repeat",
    body: [e(["alias", '"a"'], '"First"'), e(["alias", '"a"'], '"Second"')],
  },
  {
    fixture: "db-rel-object-endpoint-repeat",
    body: [
      r(["from", '"a"'], "b", '"First"'),
      r(["from", '"a"'], "b", '"Second"'),
    ],
  },
  {
    fixture: "db-named-person-unknown-slot-1",
    body: [e(["unknown", '"V"'], '"A"', '"D"', '"sprite"', '"tags"', '"link"')],
  },
  {
    fixture: "db-named-person-unknown-slot-2",
    body: [e("a", ["unknown", '"V"'], '"D"', '"sprite"', '"tags"', '"link"')],
  },
  {
    fixture: "db-rel-named-endpoints",
    body: [r(["from", '"a"'], ["to", '"b"'], ["label", '"Uses"'])],
  },
  {
    fixture: "db-named-text-fields",
    body: [
      u(
        "Container",
        "a",
        '"A"',
        ["label", '"Label"'],
        ["techn", '"Tech"'],
        ["descr", '"Description"'],
        ["type", '"Kind"'],
        ["tags", '"Tag"'],
      ),
    ],
  },
  {
    fixture: "db-named-repeat",
    body: [
      u(
        "Container",
        "a",
        '"A"',
        ["descr", '"First"'],
        ["descr", '"Second"'],
        ["descr", '"Third"'],
      ),
    ],
  },
  {
    fixture: "db-named-case-sensitive",
    body: [e("a", '"A"', ["Tags", '"Upper"'], ["tags", '"Lower"'])],
  },
  {
    fixture: "db-named-key-whitespace",
    body: [e("a", '"A"', ["tags", '" T "'])],
  },
  { fixture: "lex-named-empty-key", body: [e("a", '"A"', ["", '"x"'])] },
  {
    fixture: "db-boundary-style-named-type",
    body: [
      b(
        ["b", '"B"', ["type", '"Other"'], ["link", '"L"']],
        [PERSON],
        "System_Boundary",
      ),
      u("UpdateElementStyle", "b", ["type", '"Raw"']),
    ],
  },
  {
    fixture: "db-named-node-sprite-slot-3",
    body: [
      b(
        ["b", '"B"', ["sprite", '"V"'], '"D"', '"sprite"', '"tags"', '"link"'],
        [PERSON],
        "Deployment_Node",
      ),
    ],
  },
  {
    fixture: "db-named-node-sprite-slot-5",
    body: [
      b(
        ["b", '"B"', '"type"', '"D"', ["sprite", '"V"'], '"tags"', '"link"'],
        [PERSON],
        "Deployment_Node",
      ),
    ],
  },
  {
    fixture: "db-style-boundary",
    body: [
      b(["b", '"B"'], [PERSON]),
      u("UpdateElementStyle", "b", '"red"', '"white"'),
    ],
  },
  {
    fixture: "db-style-before-definition",
    body: [
      u("UpdateElementStyle", "a", '"red"'),
      u("UpdateRelStyle", "a", "b", '"red"'),
      PERSON,
      REL,
    ],
  },
  {
    fixture: "db-style-text-replacement",
    body: [
      PERSON,
      u(
        "UpdateElementStyle",
        "a",
        ["label", '"Changed"'],
        ["techn", '"Tech"'],
        ["custom", '"Own"'],
      ),
    ],
  },
  {
    fixture: "db-style-three-updates",
    body: [
      PERSON,
      u("UpdateElementStyle", "a", '"red"', '"white"', '"black"'),
      u("UpdateElementStyle", "a", ["fontColor", '"blue"']),
      u("UpdateElementStyle", "a", ["bgColor", '"green"']),
    ],
  },
  {
    fixture: "db-update-rel-style-three-times",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", '"red"', '"blue"', '"3"', '"4"'),
      u("UpdateRelStyle", "a", "b", ["textColor", '"green"']),
      u("UpdateRelStyle", "a", "b", ["offsetY", '"-7"']),
    ],
  },
  {
    fixture: "db-update-rel-style-named-text",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", ["label", '"Raw"'], ["custom", '"Own"']),
    ],
  },
  {
    fixture: "db-update-rel-style-named-number-key",
    body: [
      REL,
      u(
        "UpdateRelStyle",
        "a",
        "b",
        '"red"',
        '"blue"',
        ["custom", '"NaN"'],
        ["unknown", '"-9px"'],
      ),
    ],
  },
  {
    fixture: "db-number-rel-style-negative-zero",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", '"red"', '"blue"', '"-0"', '"-0"'),
    ],
  },
  {
    fixture: "db-number-rel-style-nan",
    body: [
      REL,
      u("UpdateRelStyle", "a", "b", '"red"', '"blue"', '"NaN"', '"NaN"'),
    ],
  },
  {
    fixture: "db-number-layout-zero",
    body: [u("UpdateLayoutConfig", '"0"', '"0"')],
  },
  {
    fixture: "db-named-layout-order",
    body: [
      u(
        "UpdateLayoutConfig",
        ["c4BoundaryInRow", '"7"'],
        ["c4ShapeInRow", '"3"'],
      ),
    ],
  },
  {
    fixture: "db-named-layout-key",
    body: [u("UpdateLayoutConfig", ["unknown", '"3"'], ["other", '"1"'])],
  },
  {
    fixture: "db-update-layout-three-times",
    body: [
      u("UpdateLayoutConfig", '"3"', '"1"'),
      u("UpdateLayoutConfig", '"0"', '"7"'),
      u("UpdateLayoutConfig", '"-2"', '"NaN"'),
    ],
  },
  {
    fixture: "db-style-layout-key-attributes",
    body: [
      u(
        "Container",
        "a",
        '"A"',
        ["x", '"17"'],
        ["width", '"20"'],
        ["constructor", '"own"'],
        ["hasOwnProperty", '"yes"'],
      ),
      r("a", "b", '"Uses"', ["startPoint", '"written"']),
    ],
  },
  {
    fixture: "db-title-acc-order",
    body: [
      t("title", "First"),
      t("accTitle:", "Second"),
      t("title", "Third"),
      t("accDescr:", "Description"),
      PERSON,
    ],
  },
  {
    fixture: "db-acc-description-order",
    body: [
      t("accDescription", "First"),
      t("accDescr:", "Second"),
      t("accDescr{", "Third"),
      PERSON,
    ],
  },
  { fixture: "gram-body-only-description-block", body: [t("accDescr{", "D")] },
  {
    fixture: "gram-acc-descr-block-text",
    body: [t("accDescr{", "First\n  Second"), PERSON],
  },
  {
    fixture: "db-empty-block-inline-two",
    body: [t("accDescr:", "Before"), EMPTY, EMPTY, PERSON],
  },
  {
    fixture: "gram-empty-block-header-gap",
    beforeBody: [EMPTY],
    body: [PERSON],
  },
  {
    fixture: "gram-empty-block-after-args-before-body",
    body: [b(["b", '"B"'], [PERSON], "Boundary", [EMPTY])],
  },
  { fixture: "db-title-frontmatter", body: [PERSON] },
  { fixture: "db-frontmatter-drawing-config", body: [PERSON] },
  {
    fixture: "db-wrap-directive",
    body: [e("a", '"wrap: A"'), r("a", "b", '"nowrap: B"')],
  },
  { fixture: "db-wrap-frontmatter", body: [PERSON] },
  { fixture: "db-wrap-init-directive", body: [b(["b", '"B"'], [PERSON]), REL] },
  {
    fixture: "db-preprocessing-style",
    body: [e("a", '"style:#x;y"')],
    values: { '"style:#x;y"': "style:#xy" },
  },
  {
    fixture: "lex-bare-crlf-directive",
    body: [e("a\r%%{init: {}}%%\nb", '"A"')],
    values: { "a\r%%{init: {}}%%\nb": "a\r\nb" },
  },
  {
    fixture: "lex-quote-crlf-directive",
    body: [e("a", '"x\r%%{init: {}}%%\ny"')],
    values: { '"x\r%%{init: {}}%%\ny"': "x\r\ny" },
  },
  {
    fixture: "lex-semicolon-key-selected",
    body: [e("a", '"style:#x"', ["de;scr", '"V"'])],
    values: { "de;scr": "descr" },
  },
  {
    fixture: "lex-semicolon-text-selected",
    body: [e("a", '"style:#x"', "bare;value", '"D"')],
    values: { "bare;value": "barevalue" },
  },
  { fixture: "lex-arguments-many-commas", body: [e(null, null)] },
  { fixture: "lex-bare-whitespace-only", body: [e(null, '"A"')] },
  { fixture: "gram-person-one-empty-string", body: [e('""')] },
  { fixture: "db-required-label-empty", body: [e("a", '""')] },
  { fixture: "db-required-alias-empty", body: [e('""', '"A"')] },
]

/** Only place the explicitly named pieces; no syntax or expected values are inferred. */
function treeOf(input: string, testCase: Case): DbTreeRoot {
  const kind = testCase.kind ?? "context"
  const header = `C4${kind.charAt(0).toUpperCase()}${kind.slice(1)}`
  let cursor = input.indexOf(header) + header.length

  /** Locate the next explicitly supplied piece. */
  function take(piece: string): TreeRange {
    const start = input.indexOf(piece, cursor)
    if (start < 0)
      throw new Error(`no ${JSON.stringify(piece)} after ${cursor}`)
    cursor = start + piece.length
    return [start, cursor]
  }

  /** A plain JSON node, with positions derived from its explicit range. */
  function node(
    type: string,
    range: TreeRange,
    fields: Record<string, unknown>,
  ): CheckedNode {
    return { type, range, loc: locationOf(input, range), ...fields }
  }

  /** A written value, with any common cuts stated by the case. */
  function leaf(raw: string, quoted = false): CheckedNode {
    return node(quoted ? "StringLiteral" : "C4Literal", take(raw), {
      value: testCase.values?.[raw] ?? (quoted ? raw.slice(1, -1) : raw),
      ...(quoted
        ? {
            raw,
            closed: true,
          }
        : {}),
    })
  }

  /** Place one explicitly described statement and its children. */
  function statement(piece: Statement): CheckedNode {
    if (piece.args !== undefined) {
      const start = take(piece.keyword)[0]
      take("(")
      const args = piece.args.map((arg) => {
        if (arg === null) {
          take(",")
          return null
        }
        if (typeof arg === "string") return leaf(arg, arg.startsWith('"'))
        const begin = take("$")[0]
        const key = arg[0] === "" ? null : leaf(arg[0])
        take("=")
        const value = leaf(arg[1], true)
        return node("C4NamedAttribute", [begin, cursor], { key, value })
      })
      take(")")
      const beforeBody = (piece.beforeBody ?? []).map(statement)
      const body =
        piece.body === undefined
          ? undefined
          : (take("{"), piece.body.map(statement))
      if (body !== undefined) take("}")
      const type =
        body !== undefined
          ? "C4BoundaryStatement"
          : piece.keyword.startsWith("Update")
            ? "C4UpdateStatement"
            : piece.keyword.startsWith("Rel") || piece.keyword === "BiRel"
              ? "C4RelationshipStatement"
              : "C4ElementStatement"
      return node(type, [start, cursor], {
        keyword: piece.keyword,
        arguments: args,
        ...(body === undefined ? {} : { beforeBody, body }),
      })
    }
    const block = piece.keyword === "accDescr{"
    const colon = piece.keyword.endsWith(":")
    const keyword = block
      ? "accDescr"
      : colon
        ? piece.keyword.slice(0, -1)
        : piece.keyword
    const start = take(keyword)[0]
    if (block) take("{")
    if (colon) take(":")
    const value =
      piece.text === null || piece.text === undefined ? null : leaf(piece.text)
    if (block) take("}")
    const type = block
      ? "C4AccDescrBlockStatement"
      : keyword === "title"
        ? "C4TitleStatement"
        : keyword === "accDescription"
          ? "C4AccDescriptionStatement"
          : keyword === "accTitle"
            ? "C4AccTitleStatement"
            : "C4AccDescrStatement"
    return node(type, [start, cursor], { value })
  }

  const beforeBody = (testCase.beforeBody ?? []).map(statement)
  const body = testCase.body.map(statement)
  return node("Root", [0, input.length], {
    diagramType: "c4",
    body: node("C4Diagram", [input.indexOf(header), cursor], {
      kind,
      beforeBody,
      body,
    }),
    frontmatter: null,
    comments: [],
    directives: [],
    tokens: [],
  }) as unknown as DbTreeRoot
}

describe("dbFromTree of C4 trees made by hand", async () => {
  const fixtures = await loadFixtures("c4")
  for (const testCase of [
    {
      fixture: "gram-named-proto-person-description",
      body: [e("a", '"A"', ["__proto__", '"V"'])],
    },
    {
      fixture: "gram-named-proto-container-technology",
      body: [u("Container", "a", '"A"', ["__proto__", '"V"'])],
    },
    {
      fixture: "gram-named-proto-boundary-type",
      body: [b(["b", '"B"', ["__proto__", '"V"']], [PERSON])],
    },
    {
      fixture: "gram-named-proto-node-type",
      body: [b(["b", '"B"', ["__proto__", '"V"']], [PERSON], "Node")],
    },
    {
      fixture: "gram-named-proto-system-boundary-tags",
      body: [
        b(["b", '"B"', ["__proto__", '"V"']], [PERSON], "System_Boundary"),
      ],
    },
    {
      fixture: "gram-named-proto-relationship-technology",
      body: [r("a", "b", '"R"', ["__proto__", '"V"'])],
    },
    {
      fixture: "gram-named-proto-index-relationship-technology",
      body: [u("RelIndex", '"1"', "a", "b", '"R"', ["__proto__", '"V"'])],
    },
    {
      fixture: "gram-named-proto-existing-relationship-style",
      body: [
        r("a", "b", '"R"'),
        u("UpdateRelStyle", "a", "b", ["__proto__", '"V"']),
      ],
    },
    {
      fixture: "gram-named-proto",
      body: [PERSON, u("UpdateElementStyle", "a", ["__proto__", '"own"'])],
    },
  ])
    it(`rejects the consumed empty-entry named object of ${testCase.fixture}`, () => {
      const fixture = fixtures.find((entry) => entry.name === testCase.fixture)
      if (fixture === undefined || fixture.expected.accepted)
        throw new Error("no rejected optional-field fixture")
      expect(() =>
        dbFromTree(
          fixture.input,
          treeOf(fixture.input, testCase),
          { config: {}, title: undefined, dataBlockEffects: [] },
          cssSupportsColor,
        ),
      ).toThrow("named __proto__ cannot be consumed as an optional field")
    })
  for (const testCase of CASES)
    it(`builds the recorded Db of ${testCase.fixture}`, () => {
      const fixture = fixtures.find((entry) => entry.name === testCase.fixture)
      if (fixture === undefined || !fixture.expected.accepted)
        throw new Error(`no accepted fixture ${testCase.fixture}`)
      const embedded = embeddedValuesOf(fixture, fixture.expected)
      if (embedded === undefined) throw new Error("no embedded values")
      const tree = treeOf(fixture.input, testCase)
      expect(
        dbFromTree(fixture.input, tree, embedded, cssSupportsColor),
      ).toEqual(fixture.expected.db)
      const plain = JSON.parse(JSON.stringify(tree)) as DbTreeRoot
      Object.defineProperty(plain, "tokens", {
        get() {
          throw new Error("read tokens")
        },
      })
      const ranges = nodesOf(plain as unknown as CheckedRoot)
        .filter(
          (node) => node.type === "C4Literal" || node.type === "StringLiteral",
        )
        .map((node) => node.range)
      const bounded = new Proxy(
        {},
        {
          get(_target, key) {
            // HTML tag context is source-wide; value slices stay in their nodes.
            if (key === "indexOf")
              return fixture.input.indexOf.bind(fixture.input)
            if (key === "charCodeAt")
              return fixture.input.charCodeAt.bind(fixture.input)
            if (key !== "slice")
              throw new Error(`source read through ${String(key)}`)
            return (from: number, to: number) => {
              expect(ranges).toContainEqual([from, to])
              return fixture.input.slice(from, to)
            }
          },
        },
      ) as string
      expect(dbFromTree(bounded, plain, embedded, cssSupportsColor)).toEqual(
        fixture.expected.db,
      )
    })
})

import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { REQUIREMENT_CHILD_TYPES } from "../src/check-tree/requirement.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  copyOf,
  firstNode,
  problemsOf,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import {
  buildTree,
  endAt,
  itFailsEach,
  nodeWith,
  ownKind,
  retype,
  tokenWith,
} from "./check-tree-built.ts"
import type { BrokenCase } from "./check-tree-built.ts"
import { frontmatterOf, tokenOf } from "./check-tree-trees.ts"
import { readFieldTables, readTreeDocuments } from "./spec-field-tables.ts"

// The trees of a requirement diagram made by hand: they are the smallest trees
// that hold the case they are about (see `check-tree-built.ts`); the recorded
// trees of the corpus are the other half of the tests below. The kinds of the
// tokens and the ranges of the nodes are those of the documents of the parser
// (`tokens/requirement.md` and `positions/requirement.md`).

/** A requirement tree: the header `requirementDiagram`, a line feed, and the statements. */
function build(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "requirementDiagram",
      diagramType: "requirement",
      bodyType: "RequirementDiagram",
    },
    source,
    makeStatements,
  )
}

/** A name without quotes: its token of the kind `kind`, and the `RequirementIdentifier` that holds it. */
function name(
  kit: Kit,
  text: string,
  value = text,
  kind = "RawText",
): CheckedNode {
  const token = kit.token(kind, text)
  return kit.node("RequirementIdentifier", token.range, { name: value })
}

/** A text without quotes: its `RawText` token, and the `RequirementLiteral` that holds it. */
function literal(kit: Kit, text: string, value = text): CheckedNode {
  const token = kit.token("RawText", text)
  return kit.node("RequirementLiteral", token.range, { value })
}

/** A string, `source` with its quotes: its `String` token, and the `StringLiteral` that holds it. */
function quoted(kit: Kit, source: string): CheckedNode {
  const token = kit.token("String", source)
  return kit.node("StringLiteral", token.range, {
    value: source.slice(1, -1),
    raw: source,
    closed: true,
  })
}

/** An empty description block as an item of a body: `accDescr {}`. */
function emptyBlockItem(kit: Kit): CheckedNode {
  const keyword = kit.token("Keyword", "accDescr")
  kit.token("Punctuator", "{")
  const close = kit.token("Punctuator", "}")
  return kit.node(
    "RequirementIgnoredText",
    [keyword.range[0], close.range[1]],
    {
      value: "accDescr {}",
    },
  )
}

/** A requirement with every kind of item, written in upper case and mixed case, with two classes, a quoted name, and an empty description block among the items. */
function requirementWithEverything(): Built {
  return build(
    'requirementDiagram\nFUNCTIONALREQUIREMENT "my req":::a,b {\nID: 1.2\ntext: "x: y"\nRisk: HIGH\nVERIFYMETHOD: Test\naccDescr {}\n}',
    (kit) => {
      const type = kit.token("Keyword", "FUNCTIONALREQUIREMENT")
      const requirementName = quoted(kit, '"my req"')
      kit.token("Punctuator", ":::")
      const a = name(kit, "a")
      kit.token("Punctuator", ",")
      const b = name(kit, "b")
      kit.token("Punctuator", "{")
      const idKeyword = kit.token("Keyword", "ID")
      kit.token("Punctuator", ":")
      const idValue = literal(kit, "1.2")
      const textKeyword = kit.token("Keyword", "text")
      kit.token("Punctuator", ":")
      const textValue = quoted(kit, '"x: y"')
      const riskKeyword = kit.token("Keyword", "Risk")
      kit.token("Punctuator", ":")
      const risk = kit.token("Keyword", "HIGH")
      const methodKeyword = kit.token("Keyword", "VERIFYMETHOD")
      kit.token("Punctuator", ":")
      const method = kit.token("Keyword", "Test")
      const ignored = emptyBlockItem(kit)
      const close = kit.token("Punctuator", "}")
      return [
        kit.node(
          "RequirementRequirementStatement",
          [type.range[0], close.range[1]],
          {
            requirementType: "functionalRequirement",
            name: requirementName,
            cssClasses: [a, b],
            body: [
              kit.node(
                "RequirementValueField",
                [idKeyword.range[0], idValue.range[1]],
                { field: "id", value: idValue },
              ),
              kit.node(
                "RequirementValueField",
                [textKeyword.range[0], textValue.range[1]],
                { field: "text", value: textValue },
              ),
              kit.node(
                "RequirementRiskField",
                [riskKeyword.range[0], risk.range[1]],
                { risk: "high" },
              ),
              kit.node(
                "RequirementVerifyMethodField",
                [methodKeyword.range[0], method.range[1]],
                { verifyMethod: "test" },
              ),
              ignored,
            ],
          },
        ),
      ]
    },
  )
}

/** `requirement r {` and `}` on the next line: a body without items. */
function requirementWithoutItems(): Built {
  return build("requirementDiagram\nrequirement r {\n}", (kit) => {
    const type = kit.token("Keyword", "requirement")
    const requirementName = name(kit, "r")
    kit.token("Punctuator", "{")
    const close = kit.token("Punctuator", "}")
    return [
      kit.node(
        "RequirementRequirementStatement",
        [type.range[0], close.range[1]],
        {
          requirementType: "requirement",
          name: requirementName,
          cssClasses: [],
          body: [],
        },
      ),
    ]
  })
}

/** `text: "a%%{x}%%b"`: a string that a directive cuts into `StringFragment` tokens; its `raw` is the whole source text, its `value` the text without the directive. */
function requirementWithStringCutByDirective(): Built {
  const source = 'requirementDiagram\nrequirement r {\ntext: "a%%{x}%%b"\n}'
  return build(source, (kit) => {
    const type = kit.token("Keyword", "requirement")
    const requirementName = name(kit, "r")
    kit.token("Punctuator", "{")
    const field = kit.token("Keyword", "text")
    kit.token("Punctuator", ":")
    const before = kit.token("StringFragment", '"a')
    kit.directive("%%{x}%%")
    const after = kit.token("StringFragment", 'b"')
    const value = kit.node("StringLiteral", [before.range[0], after.range[1]], {
      value: "ab",
      raw: '"a%%{x}%%b"',
      closed: true,
    })
    const close = kit.token("Punctuator", "}")
    const item = kit.node(
      "RequirementValueField",
      [field.range[0], after.range[1]],
      { field: "text", value },
    )
    return [
      kit.node(
        "RequirementRequirementStatement",
        [type.range[0], close.range[1]],
        {
          requirementType: "requirement",
          name: requirementName,
          cssClasses: [],
          body: [item],
        },
      ),
    ]
  })
}

/** `requirement  spaced name  {`: a name that holds whitespace, and the whitespace after it that is no part of it. */
function requirementWithSpacedName(): Built {
  return build("requirementDiagram\nrequirement  spaced name  {\n}", (kit) => {
    const type = kit.token("Keyword", "requirement")
    const requirementName = name(kit, "spaced name")
    kit.token("Punctuator", "{")
    const close = kit.token("Punctuator", "}")
    return [
      kit.node(
        "RequirementRequirementStatement",
        [type.range[0], close.range[1]],
        {
          requirementType: "requirement",
          name: requirementName,
          cssClasses: [],
          body: [],
        },
      ),
    ]
  })
}

/** An element with a class, a type, and a document reference that is a string. */
function element(): Built {
  return build(
    'requirementDiagram\nelement e1:::c {\ntype: simulation\nDocRef: "http://x"\n}',
    (kit) => {
      const keyword = kit.token("Keyword", "element")
      const elementName = name(kit, "e1")
      kit.token("Punctuator", ":::")
      const c = name(kit, "c")
      kit.token("Punctuator", "{")
      const typeKeyword = kit.token("Keyword", "type")
      kit.token("Punctuator", ":")
      const typeValue = literal(kit, "simulation")
      const docRefKeyword = kit.token("Keyword", "DocRef")
      kit.token("Punctuator", ":")
      const docRefValue = quoted(kit, '"http://x"')
      const close = kit.token("Punctuator", "}")
      return [
        kit.node(
          "RequirementElementStatement",
          [keyword.range[0], close.range[1]],
          {
            name: elementName,
            cssClasses: [c],
            body: [
              kit.node(
                "RequirementElementField",
                [typeKeyword.range[0], typeValue.range[1]],
                { field: "type", value: typeValue },
              ),
              kit.node(
                "RequirementElementField",
                [docRefKeyword.range[0], docRefValue.range[1]],
                { field: "docref", value: docRefValue },
              ),
            ],
          },
        ),
      ]
    },
  )
}

/** A forward relationship with a quoted name, and a backward one written in upper case. */
function relationships(): Built {
  return build(
    'requirementDiagram\na - satisfies -> "b"\nc <- COPIES - d',
    (kit) => {
      const forwardLeft = name(kit, "a")
      kit.token("Punctuator", "-")
      kit.token("Keyword", "satisfies")
      kit.token("Punctuator", "->")
      const forwardRight = quoted(kit, '"b"')
      const backwardLeft = name(kit, "c")
      kit.token("Punctuator", "<-")
      kit.token("Keyword", "COPIES")
      kit.token("Punctuator", "-")
      const backwardRight = name(kit, "d")
      return [
        kit.node(
          "RequirementRelationshipStatement",
          [forwardLeft.range[0], forwardRight.range[1]],
          {
            left: forwardLeft,
            relationship: "satisfies",
            arrow: "forward",
            right: forwardRight,
          },
        ),
        kit.node(
          "RequirementRelationshipStatement",
          [backwardLeft.range[0], backwardRight.range[1]],
          {
            left: backwardLeft,
            relationship: "copies",
            arrow: "backward",
            right: backwardRight,
          },
        ),
      ]
    },
  )
}

/** A direction line with text before and after, in lower case, and a plain one. */
function directions(): Built {
  return build(
    "requirementDiagram\nfoo direction lr bar\ndirection TB",
    (kit) => {
      const before = kit.token("RawText", "foo")
      kit.token("Keyword", "direction")
      kit.token("Keyword", "lr")
      const after = kit.token("RawText", "bar")
      const plainKeyword = kit.token("Keyword", "direction")
      const plainValue = kit.token("Keyword", "TB")
      return [
        kit.node(
          "RequirementDirectionStatement",
          [before.range[0], after.range[1]],
          {
            textBefore: kit.node("RequirementIgnoredText", before.range, {
              value: "foo",
            }),
            direction: "LR",
            textAfter: kit.node("RequirementIgnoredText", after.range, {
              value: "bar",
            }),
          },
        ),
        kit.node(
          "RequirementDirectionStatement",
          [plainKeyword.range[0], plainValue.range[1]],
          { textBefore: null, direction: "TB", textAfter: null },
        ),
      ]
    },
  )
}

/** A direction line in lower case, with the text `before` and `after` around it, of which one or both may be none. */
function directionLine(
  source: string,
  before: string | null,
  after: string | null,
): Built {
  return build(source, (kit) => {
    const beforeToken = before === null ? null : kit.token("RawText", before)
    const keyword = kit.token("Keyword", "direction")
    const value = kit.token("Keyword", "lr")
    const afterToken = after === null ? null : kit.token("RawText", after)
    return [
      kit.node(
        "RequirementDirectionStatement",
        [(beforeToken ?? keyword).range[0], (afterToken ?? value).range[1]],
        {
          textBefore:
            beforeToken === null
              ? null
              : kit.node("RequirementIgnoredText", beforeToken.range, {
                  value: before,
                }),
          direction: "LR",
          textAfter:
            afterToken === null
              ? null
              : kit.node("RequirementIgnoredText", afterToken.range, {
                  value: after,
                }),
        },
      ),
    ]
  })
}

/** `direction lr bar baz`: the text after the value holds a space. */
function directionWithLongTextAfter(): Built {
  return directionLine(
    "requirementDiagram\ndirection lr bar baz",
    null,
    "bar baz",
  )
}

/** `foo bar direction lr`: the text before the keyword holds a space. */
function directionWithLongTextBefore(): Built {
  return directionLine(
    "requirementDiagram\nfoo bar direction lr",
    "foo bar",
    null,
  )
}

/** `direction lr x bar`: the text after the value holds a space. */
function directionWithTextAfterOfTwoWords(): Built {
  return directionLine("requirementDiagram\ndirection lr x bar", null, "x bar")
}

/** `direction lr bar`, U+2028, `baz`: the text after the value may hold a U+2028. */
function directionWithLineSeparatorInTextAfter(): Built {
  return directionLine(
    "requirementDiagram\ndirection lr bar\u2028baz",
    null,
    "bar\u2028baz",
  )
}

/** The kinds of requirement, as ast/requirement.md writes them, and the keyword that starts a statement of each. */
const KINDS: readonly string[] = [
  "requirement",
  "functionalRequirement",
  "interfaceRequirement",
  "performanceRequirement",
  "physicalRequirement",
  "designConstraint",
]

/** One requirement of each kind, written as ast/requirement.md writes the kind. */
function requirementsOfEveryKind(): Built {
  const source = `requirementDiagram\n${KINDS.map((kind, index) => `${kind} k${index} {\n}`).join("\n")}`
  return build(source, (kit) =>
    KINDS.map((kind, index) => {
      const keyword = kit.token("Keyword", kind)
      const requirementName = name(kit, `k${index}`)
      kit.token("Punctuator", "{")
      const close = kit.token("Punctuator", "}")
      return kit.node(
        "RequirementRequirementStatement",
        [keyword.range[0], close.range[1]],
        {
          requirementType: kind,
          name: requirementName,
          cssClasses: [],
          body: [],
        },
      )
    }),
  )
}

/** The risks and the verification methods, as ast/requirement.md writes them. */
const RISKS: readonly string[] = ["low", "medium", "high"]
const METHODS: readonly string[] = [
  "analysis",
  "demonstration",
  "inspection",
  "test",
]

/** A requirement with a risk field for each risk and a verification method field for each method. */
function requirementWithEveryRiskAndMethod(): Built {
  const lines = [
    ...RISKS.map((risk) => `risk: ${risk}`),
    ...METHODS.map((method) => `verifyMethod: ${method}`),
  ]
  const source = `requirementDiagram\nrequirement r {\n${lines.join("\n")}\n}`
  return build(source, (kit) => {
    const keyword = kit.token("Keyword", "requirement")
    const requirementName = name(kit, "r")
    kit.token("Punctuator", "{")
    const risks = RISKS.map((risk) => {
      const start = kit.token("Keyword", "risk")
      kit.token("Punctuator", ":")
      const end = kit.token("Keyword", risk)
      return kit.node("RequirementRiskField", [start.range[0], end.range[1]], {
        risk,
      })
    })
    const methods = METHODS.map((method) => {
      const start = kit.token("Keyword", "verifyMethod")
      kit.token("Punctuator", ":")
      const end = kit.token("Keyword", method)
      return kit.node(
        "RequirementVerifyMethodField",
        [start.range[0], end.range[1]],
        { verifyMethod: method },
      )
    })
    const close = kit.token("Punctuator", "}")
    return [
      kit.node(
        "RequirementRequirementStatement",
        [keyword.range[0], close.range[1]],
        {
          requirementType: "requirement",
          name: requirementName,
          cssClasses: [],
          body: [...risks, ...methods],
        },
      ),
    ]
  })
}

/** The relationships, as ast/requirement.md writes them. */
const RELATIONSHIPS: readonly string[] = [
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
]

/** A relationship of each kind, forward. */
function everyRelationship(): Built {
  const source = `requirementDiagram\n${RELATIONSHIPS.map((relationship) => `a - ${relationship} -> b`).join("\n")}`
  return build(source, (kit) =>
    RELATIONSHIPS.map((relationship) => {
      const left = name(kit, "a")
      kit.token("Punctuator", "-")
      kit.token("Keyword", relationship)
      kit.token("Punctuator", "->")
      const right = name(kit, "b")
      return kit.node(
        "RequirementRelationshipStatement",
        [left.range[0], right.range[1]],
        { left, relationship, arrow: "forward", right },
      )
    }),
  )
}

/** The directions, as ast/requirement.md writes them. */
const DIRECTION_VALUES: readonly string[] = ["TB", "BT", "RL", "LR"]

/** A direction statement for each direction. */
function everyDirection(): Built {
  const source = `requirementDiagram\n${DIRECTION_VALUES.map((direction) => `direction ${direction}`).join("\n")}`
  return build(source, (kit) =>
    DIRECTION_VALUES.map((direction) => {
      const keyword = kit.token("Keyword", "direction")
      const value = kit.token("Keyword", direction)
      return kit.node(
        "RequirementDirectionStatement",
        [keyword.range[0], value.range[1]],
        { textBefore: null, direction, textAfter: null },
      )
    }),
  )
}

/** `style`, `classDef`, `class`, and a shorthand, each with lists: two names, a string name, two styles, and a style of three units, also in the class definition. */
function stylesAndClasses(): Built {
  return build(
    'requirementDiagram\nstyle r,"e" fill:blue,stroke : green\nclassDef cA,cB fill : red\nclass rq,el cA,cB\nrq:::cA,cB',
    (kit) => {
      const styleKeyword = kit.token("Keyword", "style")
      const r = name(kit, "r", "r", "Identifier")
      kit.token("Punctuator", ",")
      const e = quoted(kit, '"e"')
      const fill = literal(kit, "fill:blue")
      kit.token("Punctuator", ",")
      const stroke = kit.token("RawText", "stroke")
      kit.token("RawText", ":")
      const color = kit.token("RawText", "green")
      const strokeStyle = kit.node(
        "RequirementLiteral",
        [stroke.range[0], color.range[1]],
        { value: "stroke:green" },
      )
      const classDefKeyword = kit.token("Keyword", "classDef")
      const cA = name(kit, "cA", "cA", "Identifier")
      kit.token("Punctuator", ",")
      const cB = name(kit, "cB", "cB", "Identifier")
      const redStart = kit.token("RawText", "fill")
      kit.token("RawText", ":")
      const redEnd = kit.token("RawText", "red")
      const red = kit.node(
        "RequirementLiteral",
        [redStart.range[0], redEnd.range[1]],
        { value: "fill:red" },
      )
      const classKeyword = kit.token("Keyword", "class")
      const rq = name(kit, "rq", "rq", "Identifier")
      kit.token("Punctuator", ",")
      const el = name(kit, "el", "el", "Identifier")
      const classA = name(kit, "cA", "cA", "Identifier")
      kit.token("Punctuator", ",")
      const classB = name(kit, "cB", "cB", "Identifier")
      const shortName = name(kit, "rq")
      kit.token("Punctuator", ":::")
      const shortA = name(kit, "cA")
      kit.token("Punctuator", ",")
      const shortB = name(kit, "cB")
      return [
        kit.node(
          "RequirementStyleStatement",
          [styleKeyword.range[0], strokeStyle.range[1]],
          { names: [r, e], styles: [fill, strokeStyle] },
        ),
        kit.node(
          "RequirementClassDefStatement",
          [classDefKeyword.range[0], red.range[1]],
          { cssClasses: [cA, cB], styles: [red] },
        ),
        kit.node(
          "RequirementClassStatement",
          [classKeyword.range[0], classB.range[1]],
          { names: [rq, el], cssClasses: [classA, classB] },
        ),
        kit.node(
          "RequirementClassShorthandStatement",
          [shortName.range[0], shortB.range[1]],
          { name: shortName, cssClasses: [shortA, shortB] },
        ),
      ]
    },
  )
}

/** The accessibility statements: a title that holds a colon, a description on the line after its colon, a block, and an empty block. */
function accessibility(): Built {
  return build(
    "requirementDiagram\naccTitle: T: u, v  \naccDescr:\n  D\naccDescr { d e }\naccDescr {  }",
    (kit) => {
      const titleKeyword = kit.token("Keyword", "accTitle")
      kit.token("Punctuator", ":")
      const title = literal(kit, "T: u, v")
      const descrKeyword = kit.token("Keyword", "accDescr")
      kit.token("Punctuator", ":")
      const descr = literal(kit, "D")
      const blockKeyword = kit.token("Keyword", "accDescr")
      kit.token("Punctuator", "{")
      const blockText = literal(kit, "d e")
      const blockClose = kit.token("Punctuator", "}")
      const emptyKeyword = kit.token("Keyword", "accDescr")
      kit.token("Punctuator", "{")
      const emptyClose = kit.token("Punctuator", "}")
      return [
        kit.node(
          "RequirementAccTitleStatement",
          [titleKeyword.range[0], title.range[1]],
          { value: title },
        ),
        kit.node(
          "RequirementAccDescrStatement",
          [descrKeyword.range[0], descr.range[1]],
          { value: descr },
        ),
        kit.node(
          "RequirementAccDescrBlockStatement",
          [blockKeyword.range[0], blockClose.range[1]],
          { value: blockText },
        ),
        kit.node(
          "RequirementAccDescrBlockStatement",
          [emptyKeyword.range[0], emptyClose.range[1]],
          { value: null },
        ),
      ]
    },
  )
}

/** Diagram comments of the three marks, `#`, `%`, and `%%`, before and among the statements. */
function statementsAmongComments(): Built {
  return build(
    'requirementDiagram\n# c\n% c\nrequirement r { # x\nid: "1" %% y\n}',
    (kit) => {
      kit.comment("#", "# c")
      kit.comment("%", "% c")
      const type = kit.token("Keyword", "requirement")
      const requirementName = name(kit, "r")
      kit.token("Punctuator", "{")
      kit.comment("#", "# x")
      const idKeyword = kit.token("Keyword", "id")
      kit.token("Punctuator", ":")
      const idValue = quoted(kit, '"1"')
      kit.comment("%%", "%% y")
      const close = kit.token("Punctuator", "}")
      return [
        kit.node(
          "RequirementRequirementStatement",
          [type.range[0], close.range[1]],
          {
            requirementType: "requirement",
            name: requirementName,
            cssClasses: [],
            body: [
              kit.node(
                "RequirementValueField",
                [idKeyword.range[0], idValue.range[1]],
                { field: "id", value: idValue },
              ),
            ],
          },
        ),
      ]
    },
  )
}

/** Comment lines in a body, inside an empty description block that is an item of the body, and inside a description block that is a statement. */
function commentLinesInBodiesAndBlocks(): Built {
  return build(
    "requirementDiagram\nrequirement r {\n%% c\naccDescr {\n%% d\n}\nid: 1\n}\naccDescr {\n%% e\nx\n}",
    (kit) => {
      const type = kit.token("Keyword", "requirement")
      const requirementName = name(kit, "r")
      kit.token("Punctuator", "{")
      kit.comment("%%", "%% c")
      const blockStart = kit.token("Keyword", "accDescr")
      kit.token("Punctuator", "{")
      kit.comment("%%", "%% d")
      const blockEnd = kit.token("Punctuator", "}")
      const idKeyword = kit.token("Keyword", "id")
      kit.token("Punctuator", ":")
      const idValue = literal(kit, "1")
      const close = kit.token("Punctuator", "}")
      const statementKeyword = kit.token("Keyword", "accDescr")
      kit.token("Punctuator", "{")
      kit.comment("%%", "%% e")
      const text = literal(kit, "x")
      const statementClose = kit.token("Punctuator", "}")
      return [
        kit.node(
          "RequirementRequirementStatement",
          [type.range[0], close.range[1]],
          {
            requirementType: "requirement",
            name: requirementName,
            cssClasses: [],
            body: [
              kit.node(
                "RequirementIgnoredText",
                [blockStart.range[0], blockEnd.range[1]],
                { value: "accDescr {\n}" },
              ),
              kit.node(
                "RequirementValueField",
                [idKeyword.range[0], idValue.range[1]],
                { field: "id", value: idValue },
              ),
            ],
          },
        ),
        kit.node(
          "RequirementAccDescrBlockStatement",
          [statementKeyword.range[0], statementClose.range[1]],
          { value: text },
        ),
      ]
    },
  )
}

/** A frontmatter before the header: its tokens belong to the root, and to no statement. */
function withFrontmatter(): Built {
  const { source, tree } = build(
    "---\ntitle: T\n---\nrequirementDiagram\nrequirement r {\n}",
    (kit) => {
      const type = kit.token("Keyword", "requirement")
      const requirementName = name(kit, "r")
      kit.token("Punctuator", "{")
      const close = kit.token("Punctuator", "}")
      return [
        kit.node(
          "RequirementRequirementStatement",
          [type.range[0], close.range[1]],
          {
            requirementType: "requirement",
            name: requirementName,
            cssClasses: [],
            body: [],
          },
        ),
      ]
    },
  )
  return {
    source,
    tree: {
      ...tree,
      frontmatter: frontmatterOf(source, "---\ntitle: T\n---", [4, 12]),
      tokens: [
        tokenOf(source, "Punctuator", "---"),
        tokenOf(source, "RawText", "title: T"),
        tokenOf(source, "Punctuator", { text: "---", from: 4 }),
        ...tree.tokens,
      ],
    },
  }
}

/** The header `requirementdiagram` with a lower case `d`, which the lexer reads as the header, and no statement. */
function lowerCaseHeader(): Built {
  return buildTree(
    {
      header: "requirementdiagram",
      diagramType: "requirement",
      bodyType: "RequirementDiagram",
    },
    "requirementdiagram",
    () => [],
  )
}

/** The trees that satisfy every sentence, by name. */
const VALID: Readonly<Record<string, () => Built>> = {
  "a requirement with every kind of item, in upper case and mixed case":
    requirementWithEverything,
  "a requirement with a body without items": requirementWithoutItems,
  "a requirement whose name holds whitespace": requirementWithSpacedName,
  "a requirement whose text is a string that a directive cuts":
    requirementWithStringCutByDirective,
  "an element with a class and both fields": element,
  "a forward and a backward relationship": relationships,
  "a direction line with text around it, and a plain one": directions,
  "a direction line whose text after the value holds a space":
    directionWithLongTextAfter,
  "a direction line whose text before the keyword holds a space":
    directionWithLongTextBefore,
  "a requirement of every kind": requirementsOfEveryKind,
  "a requirement with every risk and every verification method":
    requirementWithEveryRiskAndMethod,
  "a relationship of every kind": everyRelationship,
  "a direction statement of every direction": everyDirection,
  "a direction line whose text after the value holds a U+2028":
    directionWithLineSeparatorInTextAfter,
  "a style, a class definition, a class statement, and a shorthand":
    stylesAndClasses,
  "the accessibility statements": accessibility,
  "statements among diagram comments of three marks": statementsAmongComments,
  "comment lines in a body and in description blocks":
    commentLinesInBodiesAndBlocks,
  "a requirement after a frontmatter": withFrontmatter,
  "a header with a lower case d and no statement": lowerCaseHeader,
}

describe("checkTree: a requirement tree made by hand", () => {
  for (const [title, make] of Object.entries(VALID)) {
    it(`accepts ${title}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

/** Makes the token of the text `from` and the node of the type `type` whose field `field` is `from` cover only the first (`start`) or the last (`end`) `length` characters of the text, with the text that they cover. */
function shrink(
  tree: CheckedRoot,
  from: string,
  type: string,
  field: string,
  side: "start" | "end",
  length: number,
): void {
  const token = tokenWith(tree, from)
  const range: [number, number] =
    side === "start"
      ? [token.range[0], token.range[0] + length]
      : [token.range[1] - length, token.range[1]]
  const text = side === "start" ? from.slice(0, length) : from.slice(-length)
  const node = nodeWith(tree, type, field, from)
  for (const target of [token, node]) setField(target, "range", range)
  setField(token, "value", text)
  setField(node, field, text)
}

/** Sets the field `field` of the first node of the type `type` to `value`. */
function setIn(
  type: string,
  field: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, type), field, value)
  }
}

/** Sets the field `field` of the node of the type `type` whose field `by` is `is` to `value`. */
function setOf(
  type: string,
  by: string,
  is: string,
  field: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, type, by, is), field, value)
  }
}

/** Makes the node of the type `type` whose field `by` is `is` a node of the type `to` with the field `field` in place of `from`, as a node of the other type would be. */
function become(
  type: string,
  by: string,
  is: string,
  to: string,
  from: string,
  field: string,
): BrokenCase["mutate"] {
  return (tree) => {
    const node = nodeWith(tree, type, by, is)
    setField(node, "type", to)
    setField(node, field, node[from])
    Reflect.deleteProperty(node, from)
  }
}

/** Removes the first token of `tree` that has the text `value`. */
function removeToken(value: string): BrokenCase["mutate"] {
  return (tree) => {
    const index = tree.tokens.findIndex((token) => token.value === value)
    setField(
      tree,
      "tokens",
      tree.tokens.filter((_token, position) => position !== index),
    )
  }
}

/** The part of the message of a problem that the node `owner` reports at its tokens and fields: `where: message`. */
function at(owner: string, message: string): string {
  return `${owner} at #: ${message}`
}

/** The message of the problem for the tokens and the child nodes of a node in the wrong order or number. */
const PARTS =
  "the tokens that the node writes itself and its child nodes, in source order"

/** The message of the problem for a range that is not the hull of the tokens and child nodes of a node. */
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"

const BROKEN: readonly BrokenCase[] = [
  // The kinds of the tokens and the ranges of the nodes (parser/docs/tokens/
  // requirement.md and positions/requirement.md).
  {
    name: "the keyword of a requirement as a RawText token",
    built: requirementWithEverything,
    mutate: retype("FUNCTIONALREQUIREMENT", "RawText"),
    expected: ownKind(
      "FUNCTIONALREQUIREMENT",
      "RequirementRequirementStatement",
      "RawText",
      "Keyword",
    ),
  },
  {
    name: "the `:::` of a requirement as a Keyword token",
    built: requirementWithEverything,
    mutate: retype(":::", "Keyword"),
    expected: ownKind(
      ":::",
      "RequirementRequirementStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the comma between the classes of a requirement as a Keyword token",
    built: requirementWithEverything,
    mutate: retype(",", "Keyword"),
    expected: ownKind(
      ",",
      "RequirementRequirementStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the closing brace of a requirement as a Keyword token",
    built: requirementWithoutItems,
    mutate: retype("}", "Keyword"),
    expected: ownKind(
      "}",
      "RequirementRequirementStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the opening brace of an element as a RawText token",
    built: element,
    mutate: retype("{", "RawText"),
    expected: ownKind(
      "{",
      "RequirementElementStatement",
      "RawText",
      "Punctuator",
    ),
  },
  {
    name: "the colon of a field as a Keyword token",
    built: element,
    mutate: retype(":", "Keyword"),
    expected: ownKind(":", "RequirementElementField", "Keyword", "Punctuator"),
  },
  {
    name: "the risk of a risk field as a RawText token",
    built: requirementWithEverything,
    mutate: retype("HIGH", "RawText"),
    expected: ownKind("HIGH", "RequirementRiskField", "RawText", "Keyword"),
  },
  {
    name: "the arrow of a relationship as a Keyword token",
    built: relationships,
    mutate: retype("->", "Keyword"),
    expected: ownKind(
      "->",
      "RequirementRelationshipStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the relationship of a relationship statement as a Punctuator token",
    built: relationships,
    mutate: retype("satisfies", "Punctuator"),
    expected: ownKind(
      "satisfies",
      "RequirementRelationshipStatement",
      "Punctuator",
      "Keyword",
    ),
  },
  {
    name: "the keyword of a direction statement as an Identifier token",
    built: directions,
    mutate: retype("direction", "Identifier"),
    expected: ownKind(
      "direction",
      "RequirementDirectionStatement",
      "Identifier",
      "Keyword",
    ),
  },
  {
    name: "the comma between two styles as a Keyword token",
    built: stylesAndClasses,
    mutate: (tree) => {
      const commas = tree.tokens.filter((token) => token.value === ",")
      setField(commas[1], "type", "Keyword")
    },
    expected: ownKind(
      ",",
      "RequirementStyleStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the colon of an accessibility title as a Keyword token",
    built: accessibility,
    mutate: retype(":", "Keyword"),
    expected: ownKind(
      ":",
      "RequirementAccTitleStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the closing brace of a description block as a Keyword token",
    built: accessibility,
    mutate: (tree) => {
      const braces = tree.tokens.filter((token) => token.value === "}")
      setField(braces[0], "type", "Keyword")
    },
    expected: ownKind(
      "}",
      "RequirementAccDescrBlockStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the header as an Identifier token",
    built: requirementWithoutItems,
    mutate: retype("requirementDiagram", "Identifier"),
    expected: ownKind(
      "requirementDiagram",
      "RequirementDiagram",
      "Identifier",
      "Keyword",
    ),
  },
  {
    name: "a name as a Keyword token",
    built: requirementWithoutItems,
    mutate: retype("r", "Keyword"),
    expected: at(
      "RequirementIdentifier",
      "the tokens of a RequirementIdentifier in name are not all of the kind RawText: Keyword",
    ),
  },
  {
    name: "the name of a requirement as an Identifier token",
    built: requirementWithoutItems,
    mutate: retype("r", "Identifier"),
    expected: at(
      "RequirementIdentifier",
      "the tokens of a RequirementIdentifier in name are not all of the kind RawText: Identifier",
    ),
  },
  {
    name: "a name of a style as a RawText token",
    built: stylesAndClasses,
    mutate: retype("r", "RawText"),
    expected: at(
      "RequirementIdentifier",
      "the tokens of a RequirementIdentifier in names are not all of the kind Identifier: RawText",
    ),
  },
  {
    name: "a class of a class definition as a RawText token",
    built: stylesAndClasses,
    mutate: retype("cA", "RawText"),
    expected: at(
      "RequirementIdentifier",
      "the tokens of a RequirementIdentifier in cssClasses are not all of the kind Identifier: RawText",
    ),
  },
  {
    name: "a name as a String token",
    built: requirementWithoutItems,
    mutate: retype("r", "String"),
    expected: at(
      "RequirementIdentifier",
      "the tokens of a RequirementIdentifier in name are not all of the kind RawText: String",
    ),
  },
  {
    name: "the value of a field as a Keyword token",
    built: requirementWithEverything,
    mutate: retype("1.2", "Keyword"),
    expected: at(
      "RequirementLiteral",
      "the tokens of a RequirementLiteral are not all of the kind RawText: Keyword",
    ),
  },
  {
    name: "the value of a field as an Identifier token",
    built: requirementWithEverything,
    mutate: retype("1.2", "Identifier"),
    expected: at(
      "RequirementLiteral",
      "the tokens of a RequirementLiteral are not all of the kind RawText: Identifier",
    ),
  },
  {
    name: "the name of a requirement, a string, as a RawText token",
    built: requirementWithEverything,
    mutate: retype('"my req"', "RawText"),
    expected: at(
      "StringLiteral",
      "the tokens of the string are not one String token or StringFragment tokens: RawText",
    ),
  },
  {
    name: "a string that two String tokens make",
    built: element,
    mutate: (tree) => {
      const token = tokenWith(tree, '"http://x"')
      const [start, end] = token.range
      setField(token, "range", [start, end - 1])
      setField(token, "value", '"http://x')
      setField(tree, "tokens", [
        ...tree.tokens,
        { ...token, range: [end - 1, end], value: '"' },
      ])
    },
    expected: at(
      "StringLiteral",
      "the tokens of the string are not one String token or StringFragment tokens: String, String",
    ),
  },
  {
    name: "the text before a direction as a Keyword token",
    built: directions,
    mutate: retype("foo", "Keyword"),
    expected: at(
      "RequirementIgnoredText",
      "the tokens of the text of a direction line are not all of the kind RawText: Keyword",
    ),
  },
  {
    name: "a field whose range covers the line feed after its value",
    built: requirementWithEverything,
    mutate: endAt(
      "RequirementValueField",
      (tree) => nodeWith(tree, "RequirementLiteral").range[1] + 1,
    ),
    expected: at("RequirementValueField", HULL),
  },
  {
    name: "a relationship whose range covers the line feed after it",
    built: relationships,
    mutate: endAt(
      "RequirementRelationshipStatement",
      (tree) => nodeWith(tree, "StringLiteral").range[1] + 1,
    ),
    expected: at("RequirementRelationshipStatement", HULL),
  },
  {
    name: "a direction whose range starts at the keyword, after its text before",
    built: directions,
    mutate: (tree) => {
      const statement = nodeWith(tree, "RequirementDirectionStatement")
      setField(statement, "range", [
        tokenWith(tree, "direction").range[0],
        statement.range[1],
      ])
    },
    expected: at("RequirementDirectionStatement", HULL),
  },
  {
    name: "a style whose range ends before its last style",
    built: stylesAndClasses,
    mutate: endAt(
      "RequirementStyleStatement",
      (tree) =>
        nodeWith(tree, "RequirementLiteral", "value", "fill:blue").range[1],
    ),
    expected: at("RequirementStyleStatement", HULL),
  },
  {
    name: "a shorthand whose range ends before its last class",
    built: stylesAndClasses,
    mutate: endAt(
      "RequirementClassShorthandStatement",
      (_tree, source) => source.length - 1,
    ),
    expected: at("RequirementClassShorthandStatement", HULL),
  },
  {
    name: "an accessibility title whose range covers the whitespace after its text",
    built: accessibility,
    mutate: endAt(
      "RequirementAccTitleStatement",
      (tree) =>
        nodeWith(tree, "RequirementLiteral", "value", "T: u, v").range[1] + 2,
    ),
    expected: at("RequirementAccTitleStatement", HULL),
  },
  {
    name: "a string without a token",
    built: requirementWithEverything,
    mutate: removeToken('"my req"'),
    expected: at(
      "StringLiteral",
      "the tokens of the string are not one String token or StringFragment tokens: ",
    ),
  },
  // The kinds of the tokens that a node writes itself: the header and the
  // fixed words are `Keyword` tokens, and the marks are `Punctuator` tokens.
  // The tokens of a name, a text, and a string.
  // The types of the nodes in a field, which the unit that was written decides.
  {
    name: "the name of a requirement as a RequirementLiteral",
    built: requirementWithoutItems,
    mutate: become(
      "RequirementIdentifier",
      "name",
      "r",
      "RequirementLiteral",
      "name",
      "value",
    ),
    expected: at(
      "RequirementRequirementStatement",
      "the field name holds a RequirementLiteral, not a RequirementIdentifier or StringLiteral",
    ),
  },
  {
    name: "the value of a field as a RequirementIdentifier",
    built: requirementWithEverything,
    mutate: become(
      "RequirementLiteral",
      "value",
      "1.2",
      "RequirementIdentifier",
      "value",
      "name",
    ),
    expected: at(
      "RequirementValueField",
      "the field value holds a RequirementIdentifier, not a RequirementLiteral or StringLiteral",
    ),
  },
  {
    name: "a style as a RequirementIdentifier",
    built: stylesAndClasses,
    mutate: become(
      "RequirementLiteral",
      "value",
      "fill:blue",
      "RequirementIdentifier",
      "value",
      "name",
    ),
    expected: at(
      "RequirementStyleStatement",
      "the field styles holds a RequirementIdentifier, not a RequirementLiteral",
    ),
  },
  {
    name: "an item of the body of an element that is a RequirementValueField",
    built: element,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "RequirementElementField"),
        "type",
        "RequirementValueField",
      )
    },
    expected: at(
      "RequirementElementStatement",
      "the field body holds a RequirementValueField, not a RequirementElementField or RequirementIgnoredText",
    ),
  },
  {
    name: "an item of the body of a requirement that is a RequirementElementField",
    built: requirementWithEverything,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "RequirementValueField"),
        "type",
        "RequirementElementField",
      )
    },
    expected: at(
      "RequirementRequirementStatement",
      "the field body holds a RequirementElementField, not a RequirementValueField or RequirementRiskField or RequirementVerifyMethodField or RequirementIgnoredText",
    ),
  },
  {
    name: "a class that is null",
    built: requirementWithEverything,
    mutate: setIn("RequirementRequirementStatement", "cssClasses", [null]),
    expected: "RequirementRequirementStatement at #.cssClasses[0]: is no node",
  },
  // The tokens that a node writes itself and its child nodes, in source order.
  {
    name: "the classes of a requirement left out of the node, with their tokens",
    built: requirementWithEverything,
    mutate: setIn("RequirementRequirementStatement", "cssClasses", []),
    expected: at("RequirementRequirementStatement", PARTS),
  },
  {
    name: "a class more than the source writes",
    built: requirementWithEverything,
    mutate: (tree) => {
      const statement = nodeWith(tree, "RequirementRequirementStatement")
      const classes = statement.cssClasses as CheckedNode[]
      setField(statement, "cssClasses", [...classes, ...classes])
    },
    expected: at("RequirementRequirementStatement", PARTS),
  },
  {
    name: "a requirement without its `:::`",
    built: requirementWithEverything,
    mutate: removeToken(":::"),
    expected: at("RequirementRequirementStatement", PARTS),
  },
  {
    name: "a requirement without the comma between its classes",
    built: requirementWithEverything,
    mutate: removeToken(","),
    expected: at("RequirementRequirementStatement", PARTS),
  },
  {
    name: "a requirement without its opening brace",
    built: requirementWithoutItems,
    mutate: removeToken("{"),
    expected: at("RequirementRequirementStatement", PARTS),
  },
  {
    name: "an element without its closing brace",
    built: element,
    mutate: removeToken("}"),
    expected: at("RequirementElementStatement", PARTS),
  },
  {
    name: "an element whose name is after its classes",
    built: element,
    mutate: (tree) => {
      const statement = nodeWith(tree, "RequirementElementStatement")
      const classes = statement.cssClasses as CheckedNode[]
      setField(statement, "cssClasses", [statement.name])
      setField(statement, "name", classes[0])
    },
    expected: at("RequirementElementStatement", PARTS),
  },
  {
    name: "a forward relationship whose arrow is backward",
    built: relationships,
    mutate: setIn("RequirementRelationshipStatement", "arrow", "backward"),
    expected: at("RequirementRelationshipStatement", PARTS),
  },
  {
    name: "a backward relationship whose arrow is forward",
    built: relationships,
    mutate: setOf(
      "RequirementRelationshipStatement",
      "arrow",
      "backward",
      "arrow",
      "forward",
    ),
    expected: at("RequirementRelationshipStatement", PARTS),
  },
  {
    name: "a relationship whose names are swapped",
    built: relationships,
    mutate: (tree) => {
      const statement = nodeWith(tree, "RequirementRelationshipStatement")
      const { left, right } = statement
      setField(statement, "left", right)
      setField(statement, "right", left)
    },
    expected: at("RequirementRelationshipStatement", PARTS),
  },
  {
    name: "a relationship that is another than its keyword",
    built: relationships,
    mutate: setIn("RequirementRelationshipStatement", "relationship", "copies"),
    expected: at("RequirementRelationshipStatement", PARTS),
  },
  {
    name: "a field that is another than its keyword",
    built: requirementWithEverything,
    mutate: setIn("RequirementValueField", "field", "text"),
    expected: at("RequirementValueField", PARTS),
  },
  {
    name: "an element field that is another than its keyword",
    built: element,
    mutate: setIn("RequirementElementField", "field", "docref"),
    expected: at("RequirementElementField", PARTS),
  },
  {
    name: "a risk that is another than its keyword",
    built: requirementWithEverything,
    mutate: setIn("RequirementRiskField", "risk", "low"),
    expected: at("RequirementRiskField", PARTS),
  },
  {
    name: "a verification method that is another than its keyword",
    built: requirementWithEverything,
    mutate: setIn("RequirementVerifyMethodField", "verifyMethod", "analysis"),
    expected: at("RequirementVerifyMethodField", PARTS),
  },
  {
    name: "a kind of requirement that is another than its keyword",
    built: requirementWithEverything,
    mutate: setIn(
      "RequirementRequirementStatement",
      "requirementType",
      "requirement",
    ),
    expected: at("RequirementRequirementStatement", PARTS),
  },
  {
    name: "a direction that is another than its value",
    built: directions,
    mutate: setIn("RequirementDirectionStatement", "direction", "RL"),
    expected: at("RequirementDirectionStatement", PARTS),
  },
  {
    name: "a direction statement whose text before is null where the source writes it",
    built: directions,
    mutate: setIn("RequirementDirectionStatement", "textBefore", null),
    expected: 'RawText at # of "foo": lies in no value node',
  },
  {
    name: "a direction statement whose text after is null where the source writes it",
    built: directions,
    mutate: setIn("RequirementDirectionStatement", "textAfter", null),
    expected: 'RawText at # of "bar": lies in no value node',
  },
  {
    name: "a style without the comma between its names",
    built: stylesAndClasses,
    mutate: removeToken(","),
    expected: at("RequirementStyleStatement", PARTS),
  },
  {
    name: "a class definition whose styles are before its names",
    built: stylesAndClasses,
    mutate: (tree) => {
      const statement = nodeWith(tree, "RequirementClassDefStatement")
      const { cssClasses, styles } = statement
      setField(statement, "cssClasses", styles)
      setField(statement, "styles", cssClasses)
    },
    expected: at("RequirementClassDefStatement", PARTS),
  },
  {
    name: "a class statement whose names are the classes",
    built: stylesAndClasses,
    mutate: (tree) => {
      const statement = nodeWith(tree, "RequirementClassStatement")
      const { names, cssClasses } = statement
      setField(statement, "names", cssClasses)
      setField(statement, "cssClasses", names)
    },
    expected: at("RequirementClassStatement", PARTS),
  },
  {
    name: "a shorthand without its `:::`",
    built: stylesAndClasses,
    mutate: removeToken(":::"),
    expected: at("RequirementClassShorthandStatement", PARTS),
  },
  {
    name: "an accessibility title without its colon",
    built: accessibility,
    mutate: removeToken(":"),
    expected: at("RequirementAccTitleStatement", PARTS),
  },
  {
    name: "an empty description block that has its value before its brace",
    built: accessibility,
    mutate: (tree) => {
      const braces = tree.tokens.filter((token) => token.value === "{")
      const index = tree.tokens.indexOf(braces[1])
      setField(
        tree,
        "tokens",
        tree.tokens.filter((_token, position) => position !== index),
      )
    },
    expected: at("RequirementAccDescrBlockStatement", PARTS),
  },
  // The lists that are never empty.
  {
    name: "a style without names",
    built: stylesAndClasses,
    mutate: setIn("RequirementStyleStatement", "names", []),
    expected: at("RequirementStyleStatement", "the list names is empty"),
  },
  {
    name: "a style without a style",
    built: stylesAndClasses,
    mutate: setIn("RequirementStyleStatement", "styles", []),
    expected: at("RequirementStyleStatement", "the list styles is empty"),
  },
  {
    name: "a class definition without classes",
    built: stylesAndClasses,
    mutate: setIn("RequirementClassDefStatement", "cssClasses", []),
    expected: at(
      "RequirementClassDefStatement",
      "the list cssClasses is empty",
    ),
  },
  {
    name: "a class definition without styles",
    built: stylesAndClasses,
    mutate: setIn("RequirementClassDefStatement", "styles", []),
    expected: at("RequirementClassDefStatement", "the list styles is empty"),
  },
  {
    name: "a class statement without names",
    built: stylesAndClasses,
    mutate: setIn("RequirementClassStatement", "names", []),
    expected: at("RequirementClassStatement", "the list names is empty"),
  },
  {
    name: "a class statement without classes",
    built: stylesAndClasses,
    mutate: setIn("RequirementClassStatement", "cssClasses", []),
    expected: at("RequirementClassStatement", "the list cssClasses is empty"),
  },
  {
    name: "a shorthand without classes",
    built: stylesAndClasses,
    mutate: setIn("RequirementClassShorthandStatement", "cssClasses", []),
    expected: at(
      "RequirementClassShorthandStatement",
      "the list cssClasses is empty",
    ),
  },
  // The words of the fields.
  {
    name: "a kind of requirement that is not in the form of the names of the kinds",
    built: requirementWithEverything,
    mutate: setIn(
      "RequirementRequirementStatement",
      "requirementType",
      "FUNCTIONALREQUIREMENT",
    ),
    expected: at(
      "RequirementRequirementStatement",
      'the field requirementType is "FUNCTIONALREQUIREMENT", none of requirement, functionalRequirement, interfaceRequirement, performanceRequirement, physicalRequirement, designConstraint',
    ),
  },
  {
    name: "a field that is not in lower case",
    built: requirementWithEverything,
    mutate: setIn("RequirementValueField", "field", "ID"),
    expected: at(
      "RequirementValueField",
      'the field field is "ID", none of id, text',
    ),
  },
  {
    name: "an element field that is none of the two",
    built: element,
    mutate: setIn("RequirementElementField", "field", "kind"),
    expected: at(
      "RequirementElementField",
      'the field field is "kind", none of type, docref',
    ),
  },
  {
    name: "a risk that is not in lower case",
    built: requirementWithEverything,
    mutate: setIn("RequirementRiskField", "risk", "HIGH"),
    expected: at(
      "RequirementRiskField",
      'the field risk is "HIGH", none of low, medium, high',
    ),
  },
  {
    name: "a verification method that is not in lower case",
    built: requirementWithEverything,
    mutate: setIn("RequirementVerifyMethodField", "verifyMethod", "Test"),
    expected: at(
      "RequirementVerifyMethodField",
      'the field verifyMethod is "Test", none of analysis, demonstration, inspection, test',
    ),
  },
  {
    name: "a relationship that is not in lower case",
    built: relationships,
    mutate: setIn(
      "RequirementRelationshipStatement",
      "relationship",
      "Satisfies",
    ),
    expected: at(
      "RequirementRelationshipStatement",
      'the field relationship is "Satisfies", none of contains, copies, derives, satisfies, verifies, refines, traces',
    ),
  },
  {
    name: "an arrow that is neither forward nor backward",
    built: relationships,
    mutate: setIn("RequirementRelationshipStatement", "arrow", "forwards"),
    expected: at(
      "RequirementRelationshipStatement",
      'the field arrow is "forwards", none of forward, backward',
    ),
  },
  {
    name: "a direction that is not in upper case",
    built: directions,
    mutate: setIn("RequirementDirectionStatement", "direction", "lr"),
    expected: at(
      "RequirementDirectionStatement",
      'the field direction is "lr", none of TB, BT, RL, LR',
    ),
  },
  // The text around a direction.
  {
    name: "a direction line that goes on after its text after",
    built: directionWithLongTextAfter,
    mutate: (tree) => {
      shrink(tree, "bar baz", "RequirementIgnoredText", "value", "start", 3)
    },
    expected: at(
      "RequirementDirectionStatement",
      "the direction line goes on after the last part of the statement",
    ),
  },
  {
    name: "a direction line with text between the text before and the keyword",
    built: directionWithLongTextBefore,
    mutate: (tree) => {
      shrink(tree, "foo bar", "RequirementIgnoredText", "value", "start", 3)
    },
    expected: at(
      "RequirementDirectionStatement",
      'the written text between the text before and `direction` is " bar ", not whitespace only',
    ),
  },
  {
    name: "a direction line with text between the value and the text after",
    built: directionWithTextAfterOfTwoWords,
    mutate: (tree) => {
      shrink(tree, "x bar", "RequirementIgnoredText", "value", "end", 3)
    },
    expected: at(
      "RequirementDirectionStatement",
      'the written text between the value and the text after is " x ", not whitespace only',
    ),
  },
  {
    name: "a direction whose value follows the keyword with nothing between",
    built: directionWithLongTextAfter,
    mutate: (tree) => {
      const keyword = tokenWith(tree, "direction")
      setField(tokenWith(tree, "lr"), "range", [
        keyword.range[1],
        keyword.range[1] + 2,
      ])
    },
    expected: at(
      "RequirementDirectionStatement",
      'the written text between `direction` and the value is "", not whitespace',
    ),
  },
  {
    name: "a text before a direction that starts with whitespace",
    built: directions,
    mutate: setOf("RequirementIgnoredText", "value", "foo", "value", " foo"),
    expected: at(
      "RequirementIgnoredText",
      'the RequirementIgnoredText starts or ends with whitespace: " foo"',
    ),
  },
  {
    name: "a text after a direction that is empty",
    built: directions,
    mutate: setOf("RequirementIgnoredText", "value", "bar", "value", ""),
    expected: at(
      "RequirementIgnoredText",
      "the RequirementIgnoredText is empty",
    ),
  },
  {
    name: "an item of a body that is no empty description block",
    built: requirementWithEverything,
    mutate: setOf(
      "RequirementIgnoredText",
      "value",
      "accDescr {}",
      "value",
      "accDescr {x}",
    ),
    expected: at(
      "RequirementIgnoredText",
      'the text of an item of a body, without its whitespace, which is an empty description block: "accdescr{x}", not "accdescr{}"',
    ),
  },
  // The names and the texts without quotes.
  {
    name: "a name that is empty",
    built: requirementWithoutItems,
    mutate: setIn("RequirementIdentifier", "name", ""),
    expected: at("RequirementIdentifier", "the RequirementIdentifier is empty"),
  },
  {
    name: "a name that ends with whitespace",
    built: requirementWithSpacedName,
    mutate: setIn("RequirementIdentifier", "name", "spaced name "),
    expected: at(
      "RequirementIdentifier",
      'the RequirementIdentifier starts or ends with whitespace: "spaced name "',
    ),
  },
  {
    name: "a name that starts with whitespace",
    built: requirementWithSpacedName,
    mutate: setIn("RequirementIdentifier", "name", " spaced name"),
    expected: at(
      "RequirementIdentifier",
      'the RequirementIdentifier starts or ends with whitespace: " spaced name"',
    ),
  },
  {
    name: "the value of an element field that holds a dash",
    built: element,
    mutate: setOf(
      "RequirementLiteral",
      "value",
      "simulation",
      "value",
      "sim-ulation",
    ),
    expected: at(
      "RequirementLiteral",
      '"sim-ulation" holds "-", which ends an unquoted name or value',
    ),
  },
  {
    name: "a text that is empty",
    built: requirementWithEverything,
    mutate: setOf("RequirementLiteral", "value", "1.2", "value", ""),
    expected: at("RequirementLiteral", "the RequirementLiteral is empty"),
  },
  {
    name: "a text that ends with whitespace",
    built: requirementWithEverything,
    mutate: setOf("RequirementLiteral", "value", "1.2", "value", "1.2 "),
    expected: at(
      "RequirementLiteral",
      'the RequirementLiteral starts or ends with whitespace: "1.2 "',
    ),
  },
  {
    name: "a text that starts with whitespace",
    built: requirementWithEverything,
    mutate: setOf("RequirementLiteral", "value", "1.2", "value", " 1.2"),
    expected: at(
      "RequirementLiteral",
      'the RequirementLiteral starts or ends with whitespace: " 1.2"',
    ),
  },
  {
    name: "a style that holds a comma",
    built: stylesAndClasses,
    mutate: setOf(
      "RequirementLiteral",
      "value",
      "fill:blue",
      "value",
      "fill,blue",
    ),
    expected: at(
      "RequirementLiteral",
      'the style "fill,blue" holds a `,`, which separates styles',
    ),
  },
  {
    name: "a style of a class definition that holds a comma",
    built: stylesAndClasses,
    mutate: setOf(
      "RequirementLiteral",
      "value",
      "fill:red",
      "value",
      "fill,red",
    ),
    expected: at(
      "RequirementLiteral",
      'the style "fill,red" holds a `,`, which separates styles',
    ),
  },
  // The strings.
  {
    name: "a string that is not closed",
    built: requirementWithEverything,
    mutate: setOf("StringLiteral", "value", "x: y", "closed", false),
    expected: at("StringLiteral", "the string is not closed"),
  },
  {
    name: "a string that is empty",
    built: requirementWithEverything,
    mutate: setOf("StringLiteral", "value", "x: y", "value", ""),
    expected: at("StringLiteral", "the string is empty"),
  },
  // The ranges.
  {
    name: "a requirement whose range ends before its closing brace",
    built: requirementWithEverything,
    mutate: endAt(
      "RequirementRequirementStatement",
      (tree) => nodeWith(tree, "RequirementIgnoredText").range[1],
    ),
    expected: at("RequirementRequirementStatement", PARTS),
  },
  // The header.
  {
    name: "a header that does not start with `requirement` in lower case",
    built: requirementWithoutItems,
    mutate: (tree) => {
      setField(
        tokenWith(tree, "requirementDiagram"),
        "value",
        "RequirementDiagram",
      )
    },
    expected: at(
      "RequirementDiagram",
      'the header "RequirementDiagram" does not start with `requirement` in lower case',
    ),
  },
  {
    name: "a header that is not requirementdiagram",
    built: requirementWithoutItems,
    mutate: (tree) => {
      setField(
        tokenWith(tree, "requirementDiagram"),
        "value",
        "requirementdiagrams",
      )
    },
    expected: at("RequirementDiagram", PARTS),
  },
  // The accessibility statements.
  {
    name: "an accessibility title whose value ends with whitespace",
    built: accessibility,
    mutate: setOf(
      "RequirementLiteral",
      "value",
      "T: u, v",
      "value",
      "T: u, v ",
    ),
    expected: at(
      "RequirementAccTitleStatement",
      'the value of an accessibility statement starts or ends with whitespace: "T: u, v "',
    ),
  },
  {
    name: "an accessibility title whose value stops before the end of its line",
    built: accessibility,
    mutate: (tree) => {
      shrink(tree, "T: u, v", "RequirementLiteral", "value", "start", 1)
    },
    expected: at(
      "RequirementAccTitleStatement",
      "the value ends before the end of its line and not only whitespace follows it",
    ),
  },
  {
    name: "a description block whose value is null where text lies between the braces",
    built: accessibility,
    mutate: setIn("RequirementAccDescrBlockStatement", "value", null),
    expected: at(
      "RequirementAccDescrBlockStatement",
      'the value is null, but the braces hold " d e "',
    ),
  },
  {
    name: "a description block whose value leaves out text between the braces",
    built: accessibility,
    mutate: (tree) => {
      shrink(tree, "d e", "RequirementLiteral", "value", "start", 1)
    },
    expected: at(
      "RequirementAccDescrBlockStatement",
      'the text between the braces has " " before the value and " e " after it, not whitespace only',
    ),
  },
  {
    name: "a description block whose value ends with whitespace",
    built: accessibility,
    mutate: setOf("RequirementLiteral", "value", "d e", "value", "d e "),
    expected: at(
      "RequirementAccDescrBlockStatement",
      'the value of a description block starts or ends with whitespace: "d e "',
    ),
  },
  {
    name: "a description block whose value holds a closing brace",
    built: accessibility,
    mutate: setOf("RequirementLiteral", "value", "d e", "value", "d}e"),
    expected: at(
      "RequirementAccDescrBlockStatement",
      'the value "d}e" holds a `}`, which closes the block',
    ),
  },
  // A statement that lacks a token is reported, and no check reads past it.
  {
    name: "a direction statement without its value token",
    built: directions,
    mutate: removeToken("lr"),
    expected: at("RequirementDirectionStatement", PARTS),
  },
  {
    name: "a direction statement without its keyword token",
    built: directions,
    mutate: removeToken("direction"),
    expected: at("RequirementDirectionStatement", PARTS),
  },
  // The value of a node is its written text, or the texts of its units joined.
  {
    name: "a name that is not its written text",
    built: requirementWithoutItems,
    mutate: setIn("RequirementIdentifier", "name", "rZ"),
    expected: at("RequirementIdentifier", "name is not its written text"),
  },
  {
    name: "a text that is not its written text",
    built: requirementWithEverything,
    mutate: setOf("RequirementLiteral", "value", "1.2", "value", "1.2Z"),
    expected: at("RequirementLiteral", "value is not its written text"),
  },
  {
    name: "a string that is not its written text",
    built: requirementWithEverything,
    mutate: setOf("StringLiteral", "value", "x: y", "value", "x: yZ"),
    expected: at("StringLiteral", "value is not its written text"),
  },
  {
    name: "a style that is not the texts of its units joined",
    built: stylesAndClasses,
    mutate: setOf(
      "RequirementLiteral",
      "value",
      "stroke:green",
      "value",
      "stroke : green",
    ),
    expected: at(
      "RequirementLiteral",
      "value is not the texts of its tokens joined",
    ),
  },
  {
    name: "a style of a class definition that is not the texts of its units joined",
    built: stylesAndClasses,
    mutate: setOf(
      "RequirementLiteral",
      "value",
      "fill:red",
      "value",
      "fill : red",
    ),
    expected: at(
      "RequirementLiteral",
      "value is not the texts of its tokens joined",
    ),
  },
  {
    name: "a text of a direction line that is not its written text",
    built: directions,
    mutate: setOf("RequirementIgnoredText", "value", "foo", "value", "fooZ"),
    expected: at("RequirementIgnoredText", "value is not its written text"),
  },
  {
    name: "an empty description block among the items of a body that leaves a character out of its tokens",
    built: requirementWithEverything,
    mutate: removeToken("accDescr"),
    expected: at(
      "RequirementIgnoredText",
      "a character of its written text other than whitespace lies in no token",
    ),
  },
  // An unquoted name and an unquoted value start with an ASCII word character.
  {
    name: "a name that starts with a dot",
    built: requirementWithoutItems,
    mutate: setIn("RequirementIdentifier", "name", ".r"),
    expected: at(
      "RequirementIdentifier",
      '".r" starts with ".", which is no ASCII word character, with which an unquoted name or value starts',
    ),
  },
  {
    name: "the value of a field that starts with a dot",
    built: requirementWithEverything,
    mutate: setOf("RequirementLiteral", "value", "1.2", "value", ".2"),
    expected: at(
      "RequirementLiteral",
      '".2" starts with ".", which is no ASCII word character, with which an unquoted name or value starts',
    ),
  },
  // The marks of the diagram comments.
  {
    name: "a diagram comment with a mark that no comment of the diagram has",
    built: statementsAmongComments,
    mutate: (tree) => {
      setField(tree.comments[0], "mark", "//")
    },
    expected:
      "Comment at #: the mark // is no mark of the comments of a RequirementDiagram",
  },
]

/** The characters that end an unquoted unit, each in a name and in a value that holds it. */
const CHARACTERS_OF_NO_UNQUOTED_TEXT: readonly string[] = [
  ":",
  ",",
  "{",
  "<",
  ">",
  "-",
  "=",
  "\n",
  "\r",
]

const BROKEN_BY_CHARACTER: readonly BrokenCase[] =
  CHARACTERS_OF_NO_UNQUOTED_TEXT.flatMap((character) => [
    {
      name: `a name that holds ${JSON.stringify(character)}`,
      built: requirementWithoutItems,
      mutate: setIn("RequirementIdentifier", "name", `a${character}b`),
      expected: at(
        "RequirementIdentifier",
        `${JSON.stringify(`a${character}b`)} holds ${JSON.stringify(character)}, which ends an unquoted name or value`,
      ),
    },
    {
      name: `the value of a field that holds ${JSON.stringify(character)}`,
      built: requirementWithEverything,
      mutate: setOf(
        "RequirementLiteral",
        "value",
        "1.2",
        "value",
        `a${character}b`,
      ),
      expected: at(
        "RequirementLiteral",
        `${JSON.stringify(`a${character}b`)} holds ${JSON.stringify(character)}, which ends an unquoted name or value`,
      ),
    },
  ])

/** The characters that the text before `direction` holds none of, each in a text before. */
const BROKEN_TEXT_BEFORE: readonly BrokenCase[] = [
  "\n",
  "\r",
  "\u2028",
  "\u2029",
].map((character) => ({
  name: `a text before a direction that holds ${JSON.stringify(character)}`,
  built: directions,
  mutate: setOf(
    "RequirementIgnoredText",
    "value",
    "foo",
    "value",
    `fo${character}o`,
  ),
  expected: at(
    "RequirementDirectionStatement",
    `the text before ${JSON.stringify(`fo${character}o`)} holds ${JSON.stringify(character)}, which ends a direction line or the text before`,
  ),
}))

/** The characters that the text after the value holds none of, each in a text after. */
const BROKEN_TEXT_AFTER: readonly BrokenCase[] = ["\n", "\r"].map(
  (character) => ({
    name: `a text after a direction that holds ${JSON.stringify(character)}`,
    built: directions,
    mutate: setOf(
      "RequirementIgnoredText",
      "value",
      "bar",
      "value",
      `ba${character}r`,
    ),
    expected: at(
      "RequirementDirectionStatement",
      `the text after ${JSON.stringify(`ba${character}r`)} holds ${JSON.stringify(character)}, which ends the direction line`,
    ),
  }),
)

describe("checkTree: the tokens and ranges of a requirement tree", () => {
  itFailsEach(BROKEN)
  itFailsEach(BROKEN_BY_CHARACTER)
  itFailsEach(BROKEN_TEXT_BEFORE)
  itFailsEach(BROKEN_TEXT_AFTER)

  it("reports the text before a direction as a token that no value node holds when the statement has no text before", () => {
    const { source, tree } = directionLine(
      "requirementDiagram\nfoo direction lr",
      "foo",
      null,
    )
    const broken = copyOf(tree)
    setField(
      nodeWith(broken, "RequirementDirectionStatement"),
      "textBefore",
      null,
    )
    expect(
      says(checkTree(source, broken), 'RawText at 19-22 of "foo": lies in no'),
    ).toBe(true)
  })

  it("reports a statement among the items of the body of the diagram that is none of the statements", () => {
    const { source, tree } = build("requirementDiagram\nfoo", (kit) => {
      const token = kit.token("RawText", "foo")
      return [kit.node("RequirementIgnoredText", token.range, { value: "foo" })]
    })
    expect(
      says(
        checkTree(source, tree),
        "the field body holds a RequirementIgnoredText, not a RequirementRequirementStatement or",
      ),
    ).toBe(true)
  })
})

/** The words of `text` that are type names. */
function typeNamesIn(text: string): string[] {
  return [...text.matchAll(/[A-Z][A-Za-z]*[a-z][A-Za-z]*/gu)].map(
    (match) => match[0],
  )
}

/** The type names that the sentence `**RequirementStatement** is a …` of ast/requirement.md lists. */
function statementTypesOfDocument(): string[] {
  const document = readTreeDocuments().find((text) =>
    text.includes("**RequirementStatement** is a "),
  )
  if (document === undefined) throw new Error("no RequirementStatement")
  const start = document.indexOf("**RequirementStatement** is a ")
  const sentence = document.slice(start, document.indexOf(".\n", start))
  return typeNamesIn(sentence.slice("**RequirementStatement**".length))
}

/** The node types that the Type column cell `cell` names, with `RequirementStatement` as the statements it stands for. */
function typesOfCell(cell: string): string[] {
  return typeNamesIn(cell).flatMap((type) =>
    type === "RequirementStatement" ? statementTypesOfDocument() : [type],
  )
}

describe("the types of the child nodes of a requirement tree", () => {
  it("are the types that the Type column of ast/requirement.md gives", () => {
    const documented = readFieldTables()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(REQUIREMENT_CHILD_TYPES)) {
      for (const [field, allowed] of Object.entries(fields)) {
        const cell = documented.get(type)?.get(field) ?? ""
        if (
          JSON.stringify(typesOfCell(cell).sort()) !==
          JSON.stringify([...allowed].sort())
        ) {
          differing.push(`${type}.${field}: ${cell}`)
        }
      }
    }
    expect(differing).toEqual([])
  })

  it("are given for every field of the requirement types that holds a node", () => {
    const documented = readFieldTables()
    const missing: string[] = []
    for (const [type, fields] of documented) {
      if (!type.startsWith("Requirement")) continue
      for (const [field, cell] of fields) {
        if (
          typesOfCell(cell).length > 0 &&
          REQUIREMENT_CHILD_TYPES[type]?.[field] === undefined
        ) {
          missing.push(`${type}.${field}: ${cell}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture. The kinds of the tokens
// and the ranges are not among them (see the top of this file).

/** A case that sets `field` of the first node of the type `type` to `value`. */
function setFirst(
  type: string,
  field: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type), field, value)
  }
}

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "a kind of requirement that is not the keyword that was written",
    fixture: "db-requirement-defaults",
    mutate: setFirst(
      "RequirementRequirementStatement",
      "requirementType",
      "designConstraint",
    ),
    expected: PARTS,
  },
  // The kinds of the tokens and the ranges, against the recorded trees.
  {
    name: "the colon of a field as a Keyword token",
    fixture: "db-requirement-all-fields",
    mutate: retypeIn("RequirementValueField", "Punctuator", ":", "Keyword"),
    expected: 'the kind of a token that the node writes itself: "Keyword"',
  },
  {
    name: "the arrow of a relationship as a Keyword token",
    fixture: "db-relationship-arrows",
    mutate: retypeIn(
      "RequirementRelationshipStatement",
      "Punctuator",
      "->",
      "Keyword",
    ),
    expected: 'the kind of a token that the node writes itself: "Keyword"',
  },
  {
    name: "the value of a direction as a RawText token",
    fixture: "db-direction-last-wins",
    mutate: retypeIn(
      "RequirementDirectionStatement",
      "Keyword",
      "LR",
      "RawText",
    ),
    expected: 'the kind of a token that the node writes itself: "RawText"',
  },
  {
    name: "a name of a style as a RawText token",
    fixture: "db-style-statement",
    mutate: retypeIn(
      "RequirementStyleStatement",
      "Identifier",
      null,
      "RawText",
    ),
    expected:
      "the tokens of a RequirementIdentifier in names are not all of the kind Identifier: RawText",
  },
  {
    name: "the name of a requirement as an Identifier token",
    fixture: "db-requirement-defaults",
    mutate: retypeIn("RequirementIdentifier", "RawText", null, "Identifier"),
    expected:
      "the tokens of a RequirementIdentifier in name are not all of the kind RawText: Identifier",
  },
  {
    name: "the name of a shorthand as an Identifier token",
    fixture: "db-class-colon-form",
    mutate: retypeIn(
      "RequirementClassShorthandStatement",
      "RawText",
      null,
      "Identifier",
    ),
    expected:
      "the tokens of a RequirementIdentifier in name are not all of the kind RawText: Identifier",
  },
  {
    name: "the end of a relationship as an Identifier token",
    fixture: "db-relationship-arrows",
    mutate: retypeIn(
      "RequirementRelationshipStatement",
      "RawText",
      null,
      "Identifier",
    ),
    expected:
      "the tokens of a RequirementIdentifier in left are not all of the kind RawText: Identifier",
  },
  {
    name: "the brace of an empty description block in a body as a RawText token",
    fixture: "gram-empty-description-block-in-body",
    mutate: retypeIn("RequirementIgnoredText", "Punctuator", "{", "RawText"),
    expected:
      "the tokens of an empty description block, `accDescr {}` are not all of the kind Keyword or Punctuator: Keyword, RawText, Punctuator",
  },
  {
    name: "a string as a RawText token",
    fixture: "db-requirement-quoted-values",
    mutate: retypeIn("StringLiteral", "String", null, "RawText"),
    expected:
      "the tokens of the string are not one String token or StringFragment tokens: RawText",
  },
  {
    name: "a field whose range covers the whitespace after its value",
    fixture: "db-requirement-value-spaces",
    mutate: setEnd("RequirementValueField", (root) => root.range[1]),
    expected: HULL,
  },
  {
    name: "a risk that is not the keyword that was written",
    fixture: "db-requirement-all-fields",
    mutate: setFirst("RequirementRiskField", "risk", "high"),
    expected: PARTS,
  },
  {
    name: "an arrow that is not the line that was written",
    fixture: "db-relationship-arrows",
    mutate: setFirst("RequirementRelationshipStatement", "arrow", "backward"),
    expected: PARTS,
  },
  {
    name: "a direction that is not the value that was written",
    fixture: "db-direction-last-wins",
    mutate: setFirst("RequirementDirectionStatement", "direction", "BT"),
    expected: PARTS,
  },
  {
    name: "a style statement without its styles",
    fixture: "db-style-statement",
    mutate: setFirst("RequirementStyleStatement", "styles", []),
    expected: "the list styles is empty",
  },
  {
    name: "a string that is not closed",
    fixture: "db-requirement-quoted-values",
    mutate: setFirst("StringLiteral", "closed", false),
    expected: "the string is not closed",
  },
  {
    name: "a name with a character that ends an unquoted name",
    fixture: "db-requirement-defaults",
    mutate: setFirst("RequirementIdentifier", "name", "r:"),
    expected: "which ends an unquoted name or value",
  },
  {
    name: "an item of a body that is no empty description block",
    fixture: "gram-empty-description-block-in-body",
    mutate: setFirst("RequirementIgnoredText", "value", "accDescr {x}"),
    expected:
      "the text of an item of a body, without its whitespace, which is an empty description block",
  },
  {
    name: "the text of a description block that holds a closing brace",
    fixture: "db-acc-descr-block",
    mutate: (root) => {
      const value = firstNode(root, "RequirementAccDescrBlockStatement").value
      setField(value as CheckedNode, "value", "a}b")
    },
    expected: "which closes the block",
  },
]

describe("the check of a requirement tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("requirement", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})

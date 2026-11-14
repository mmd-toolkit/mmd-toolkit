import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  copyOf,
  firstNode,
  problemsOf,
  recordedTree,
  setField,
} from "./check-tree-recorded.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  directiveOf,
  frontmatterOf,
  handMadeRoot,
  locationOf,
} from "./check-tree-trees.ts"

// The conditions of packages/spec/docs/ast.md that no other test of the
// check of a tree breaks. Each case changes one condition of a valid hand
// made tree or the recorded tree of a named fixture and expects the problem
// that `checkTree` reports. The cases do not change the check itself.

describe("checkTree: the form of nodes (ast.md, Design goals and ErrorDiagram)", () => {
  const text = "error alpha"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["RawText", "alpha"],
    ],
  })

  it("passes the valid tree for the form of nodes (ast.md, Design goals and ErrorDiagram)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a generic children list added to ErrorDiagram", () => {
    const broken = copyOf(root)
    setField(broken.body, "children", [])
    expect(checkTree(text, broken)).toEqual([
      {
        where: "ErrorDiagram at 0-11",
        message: "has the field children, which its type does not have",
      },
    ])
  })

  it("fails an ErrorDiagram replaced by a Punctuator node", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "Punctuator")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Punctuator at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an ErrorDiagram replaced by a Keyword node", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "Keyword")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Keyword at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an ErrorDiagram replaced by a Whitespace node", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "Whitespace")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Whitespace at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an ErrorDiagram replaced by a LineTerminator node", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "LineTerminator")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "LineTerminator at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an ErrorDiagram replaced by a RawText node", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "RawText")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "RawText at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an ErrorDiagram replaced by a catch-all Node", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "Node")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Node at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an ErrorDiagram with a numeric type", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Root at 0-11",
        message: "the field body is object, not a node",
      },
    ])
  })

  it("fails a pseudo-diagram id of three dashes", () => {
    const broken = copyOf(root)
    setField(broken, "diagramType", "---")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Root",
        message:
          "the diagram type --- is not one of those of a ErrorDiagram: error",
      },
    ])
  })

  it("fails a diagram node without its diagram prefix", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "Diagram")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Diagram at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails a normal diagram node with an IgnoredText suffix", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "ErrorIgnoredText")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "ErrorIgnoredText at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails a body node given a role-specific type name", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "Body")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Body at 0-11",
        message: "is of a type that the specification does not define",
      },
    ])
  })
})

describe("checkTree: directive records (ast.md, Directives and frontmatter)", () => {
  const text = "error\n%%{init: {}}%%\n%%{config: x}%%\n"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["Directive", "%%{init: {}}%%"],
      ["Directive", "%%{config: x}%%"],
    ],
    directives: [
      directiveOf(text, "%%{init: {}}%%"),
      directiveOf(text, "%%{config: x}%%"),
    ],
  })

  it("passes the valid tree for directive records (ast.md, Directives and frontmatter)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a directive held by a diagram node", () => {
    const broken = copyOf(root)
    setField(broken.body, "directive", broken.directives[0])
    expect(checkTree(text, broken)).toEqual([
      {
        where: "ErrorDiagram at 0-5",
        message: "has the field directive, which its type does not have",
      },
    ])
  })

  it("reports a directive record with its type removed", () => {
    const broken = copyOf(root)
    Reflect.deleteProperty(broken.directives[0], "type")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Root at 0-37.directives[0]",
        message: "is no node: it has no type and no range",
      },
    ])
  })

  it("fails a directive name that is a number", () => {
    const broken = copyOf(root)
    setField(broken.directives[0], "name", 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Directive at 6-20",
        message: "the field name is number, not string",
      },
    ])
  })

  it("fails a directive value that is an object", () => {
    const broken = copyOf(root)
    setField(broken.directives[0], "value", {})
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Directive at 6-20",
        message: "the field value is object, not string",
      },
    ])
  })

  it("fails a directive closed flag that is a string", () => {
    const broken = copyOf(root)
    setField(broken.directives[0], "closed", "true")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Directive at 6-20",
        message: "the field closed is string, not boolean",
      },
    ])
  })

  it("fails parsed arguments added to a directive record", () => {
    const broken = copyOf(root)
    setField(broken.directives[0], "argument", {})
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Directive at 6-20",
        message: "has the field argument, which its type does not have",
      },
    ])
  })

  it("fails directives listed in reverse source order", () => {
    const broken = copyOf(root)
    setField(broken, "directives", [...broken.directives].reverse())
    expect(checkTree(text, broken)).toEqual([
      {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[21,36],true],[[6,20],true]], not [[[6,20],true],[[21,36],true]]",
      },
      {
        where: "the Directive tokens",
        message:
          "are not those of the directives outside all other tokens and all comments: [[6,20],[21,36]], not [[21,36],[6,20]]",
      },
      {
        where: "Directive at 6-20",
        message: "overlaps the Directive before it, or comes before it",
      },
    ])
  })
})

describe("checkTree: unclosed directive records (ast.md, Directive)", () => {
  const text = "error\n%%{init: one"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["Directive", "%%{init: one"],
    ],
    directives: [directiveOf(text, "%%{init: one")],
  })

  it("passes the valid tree for unclosed directive records (ast.md, Directive)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an unclosed directive ending before its argument ends", () => {
    const broken = copyOf(root)
    const directive = broken.directives[0]
    setField(directive, "range", [6, 16])
    setField(directive, "loc", locationOf(text, [6, 16]))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[6,16],false]], not [[[6,18],false]]",
      },
      {
        where: "Directive at 6-16",
        message: 'value: "init: one", not "init: o"',
      },
      {
        where: "the Directive tokens",
        message:
          "are not those of the directives outside all other tokens and all comments: [[6,18]], not [[6,16]]",
      },
    ])
  })

  it("fails an unclosed directive marked closed", () => {
    const broken = copyOf(root)
    setField(broken.directives[0], "closed", true)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[6,18],true]], not [[[6,18],false]]",
      },
      {
        where: "Directive at 6-18",
        message: 'value: "init: one", not "init: "',
      },
    ])
  })
})

describe("checkTree: frontmatter records (ast.md, Frontmatter)", () => {
  const text = "---\n  title: Test\n---\nerror"
  const root = handMadeRoot(text, {
    tokens: [
      ["Punctuator", "---"],
      ["RawText", "title: Test"],
      ["Punctuator", { text: "---", from: 3 }],
      ["RawText", "error"],
    ],
    frontmatter: frontmatterOf(text, "---\n  title: Test\n---", [4, 18]),
  })

  it("passes the valid tree for frontmatter records (ast.md, Frontmatter)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails frontmatter held by a diagram node", () => {
    const broken = copyOf(root)
    setField(broken.body, "frontmatter", broken.frontmatter)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "ErrorDiagram at 22-27",
        message: "has the field frontmatter, which its type does not have",
      },
    ])
  })

  it("fails a frontmatter value that is an object", () => {
    const broken = copyOf(root)
    setField(broken.frontmatter!, "value", {})
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Frontmatter at 0-21",
        message: "the field value is object, not string",
      },
    ])
  })

  it("fails a dedented frontmatter value", () => {
    const broken = copyOf(root)
    setField(broken.frontmatter!, "value", "title: Test\n")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Frontmatter at 0-21",
        message: 'value: "title: Test\\n", not "  title: Test\\n"',
      },
    ])
  })

  it("fails parsed YAML added to frontmatter", () => {
    const broken = copyOf(root)
    setField(broken.frontmatter!, "yaml", { title: "Test" })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Frontmatter at 0-21",
        message: "has the field yaml, which its type does not have",
      },
    ])
  })

  it("reports source frontmatter missing from Root.frontmatter", () => {
    const broken = copyOf(root)
    setField(broken, "frontmatter", null)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Root.body",
        message:
          "does not run from its first token to its last: [22,27], not [0,27]",
      },
      {
        where: "Punctuator at 0-3",
        message: 'the Punctuator text "---" is none of those of a ErrorDiagram',
      },
      {
        where: "Punctuator at 18-21",
        message: 'the Punctuator text "---" is none of those of a ErrorDiagram',
      },
      {
        where: "Punctuator at 0-3",
        message: 'kind: "Punctuator", not "RawText"',
      },
      {
        where: "RawText at 6-17",
        message: "holds whitespace or a line terminator",
      },
      {
        where: "Punctuator at 18-21",
        message: 'kind: "Punctuator", not "RawText"',
      },
    ])
  })

  it("fails a frontmatter record with its type removed", () => {
    const broken = copyOf(root)
    Reflect.deleteProperty(broken.frontmatter!, "type")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Root at 0-27",
        message: "the field frontmatter is object, not a node or null",
      },
    ])
  })
})

describe("checkTree: written text and shared leaves (ast.md, Nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "flowchart",
    "lex-directive-after-arrow",
  )

  it("passes the valid tree for written text and shared leaves (ast.md, Nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an arrow value that includes surrounding whitespace", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "FlowchartArrow"), "value", " --> ")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartArrow at 15-18",
        message: 'value is not its written text: " --> ", not "-->"',
      },
      {
        where: "FlowchartArrow at 15-18",
        message:
          'the fields of the arrow, written  --> : {"endMarker":"arrow","length":2,"line":"solid","startMarker":"none"}, not {"length":2,"line":"solid"}',
      },
    ])
  })

  it("fails an arrow range that includes preceding whitespace", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "FlowchartArrow")
    setField(node, "range", [14, 18])
    setField(node, "loc", locationOf(text, [14, 18]))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartArrow at 14-18",
        message: "lies outside FlowchartLink at 15-35",
      },
      {
        where: "FlowchartArrow at 14-18",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "FlowchartArrow at 14-18",
        message: 'value is not its written text: "-->", not " -->"',
      },
      {
        where: "FlowchartArrow at 14-18",
        message:
          'the texts of its tokens joined are not its written text: "-->", not " -->"',
      },
      {
        where: "FlowchartArrow at 14-18",
        message:
          'the tokens of the arrow: [["Punctuator",[15,18]]], not [["Punctuator",[14,18]]]',
      },
    ])
  })

  it("fails an authored identifier replaced by a string field", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "FlowchartVertex"), "id", "A")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartVertex at 13-14",
        message: "the field id is string, not a node",
      },
    ])
  })

  it("fails an arrow replaced by its text", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "FlowchartLink"), "arrow", "-->")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartLink at 15-35",
        message: "the field arrow is string, not a node",
      },
    ])
  })

  it("fails an arrow line word replaced by a node", () => {
    const broken = copyOf(root)
    setField(
      firstNode(broken, "FlowchartArrow"),
      "line",
      firstNode(broken, "Identifier"),
    )
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartArrow at 15-18",
        message: "the field line is object, not string",
      },
    ])
  })

  it("fails an arrow with a renamed marker field", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "FlowchartArrow")
    setField(node, "start", node.startMarker)
    Reflect.deleteProperty(node, "startMarker")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartArrow at 15-18",
        message: "has the field start, which its type does not have",
      },
      {
        where: "FlowchartArrow at 15-18",
        message: "lacks the field startMarker",
      },
    ])
  })

  it("fails an Identifier name that is a number", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "Identifier"), "name", 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Identifier at 13-14",
        message: "the field name is number, not string",
      },
    ])
  })

  it("fails children added to an Identifier", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "Identifier"), "children", [])
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Identifier at 13-14",
        message: "has the field children, which its type does not have",
      },
    ])
  })

  it("fails whitespace added to an Identifier name", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "Identifier"), "name", "A B")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Identifier at 13-14",
        message: 'name is not the texts of its tokens joined: "A B", not "A"',
      },
    ])
  })

  it("fails a diagram prefix added to the shared Identifier type", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "Identifier"), "type", "FlowchartIdentifier")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartIdentifier at 13-14",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails an Identifier without its own range", () => {
    const broken = copyOf(root)
    Reflect.deleteProperty(firstNode(broken, "Identifier"), "range")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartVertex at 13-14",
        message: "the field id is object, not a node",
      },
    ])
  })

  it("fails a shared Identifier with a diagram-specific field", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "Identifier"), "flowchartName", "A")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Identifier at 13-14",
        message: "has the field flowchartName, which its type does not have",
      },
    ])
  })
})

describe("checkTree: written label values (ast.md, Nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "flowchart",
    "tokens-label-string-inner-whitespace",
  )

  it("passes the valid tree for written label values (ast.md, Nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a string label value with its inner spaces trimmed", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "FlowchartLabel"), "value", "x")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "FlowchartLabel at 15-20",
        message: 'value is not its written text: "x", not " x "',
      },
    ])
  })
})

describe("checkTree: directives in written string values (ast.md, Nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "flowchart",
    "lex-directive-in-click-href-string",
  )

  it("passes the valid tree for directives in written string values (ast.md, Nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a StringLiteral value that retains an internal directive", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "value", "u%%{init: {}}%%v")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 28-46",
        message: 'value is not its written text: "u%%{init: {}}%%v", not "uv"',
      },
    ])
  })
})

describe("checkTree: comments in written string values (ast.md, Nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "flowchart",
    "tokens-string-literal-comment-line",
  )

  it("passes the valid tree for comments in written string values (ast.md, Nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a StringLiteral value that retains a comment region", () => {
    const broken = copyOf(root)
    const node = nodesOf(broken).find(
      (candidate) =>
        candidate.type === "StringLiteral" && candidate.value === "one\ntwo",
    )!
    setField(node, "value", "one\n%% c\ntwo")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 27-41",
        message:
          'value is not its written text: "one\\n%% c\\ntwo", not "one\\ntwo"',
      },
    ])
  })
})

describe("checkTree: ignored separators in written values (ast.md, Nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "class",
    "tokens-ignored-semicolon-in-relation-name",
  )

  it("passes the valid tree for ignored separators in written values (ast.md, Nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a class identifier name that retains an ignored semicolon", () => {
    const broken = copyOf(root)
    const node = nodesOf(broken).find(
      (candidate) =>
        candidate.type === "ClassIdentifier" && candidate.name === "BC",
    )!
    setField(node, "name", "B;C")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "ClassIdentifier at 32-35",
        message: 'name is not the texts of its tokens joined: "B;C", not "BC"',
      },
    ])
  })
})

describe("checkTree: empty description blocks in written text (ast.md, Nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "eventmodeling",
    "gram-written-tree",
  )

  it("passes the valid tree for empty description blocks in written text (ast.md, Nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a title value that retains a preceding empty description block", () => {
    const broken = copyOf(root)
    setField(
      firstNode(broken, "EventmodelingTitleStatement").value as object,
      "value",
      "accDescr {} All",
    )
    expect(checkTree(text, broken)).toEqual([
      {
        where: "EventmodelingLiteral at 266-269",
        message: 'value is not its written text: "accDescr {} All", not "All"',
      },
    ])
  })

  it("fails an authored ignored-text node replaced by its text", () => {
    const broken = copyOf(root)
    const body = broken.body.body as unknown[]
    const at = body.findIndex(
      (node) => (node as { type?: string }).type === "EventmodelingIgnoredText",
    )
    body[at] = "---\nhidden\n---"
    expect(checkTree(text, broken)).toEqual([
      {
        where: "EventmodelingDiagram at 0-269.body[8]",
        message: "is no node: it has no type and no range",
      },
    ])
  })

  it("fails an ignored-text node without its IgnoredText suffix", () => {
    const broken = copyOf(root)
    setField(
      firstNode(broken, "EventmodelingIgnoredText"),
      "type",
      "EventmodelingHiddenText",
    )
    expect(checkTree(text, broken)).toEqual([
      {
        where: "EventmodelingHiddenText at 212-226",
        message: "is of a type that the specification does not define",
      },
    ])
  })

  it("fails a numeric frame name represented by a NumericLiteral", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "EventmodelingTimeFrameStatement")
    const name = node.name as CheckedNode
    setField(node, "name", {
      type: "NumericLiteral",
      value: 1,
      raw: "01",
      range: name.range,
      loc: name.loc,
    })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "EventmodelingTimeFrameStatement at 30-81",
        message: "the field name holds a NumericLiteral, not a Identifier",
      },
    ])
  })

  it("fails a qualified eventmodeling name without its head", () => {
    const broken = copyOf(root)
    Reflect.deleteProperty(
      firstNode(broken, "EventmodelingQualifiedName"),
      "head",
    )
    expect(checkTree(text, broken)).toEqual([
      {
        where: "EventmodelingQualifiedName at 40-51",
        message: "lacks the field head",
      },
    ])
  })

  it("fails a source-frame occurrence removed from its authored list", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "EventmodelingTimeFrameStatement")
    const frames = node.sourceFrames as unknown[]
    frames.splice(1, 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: 'Identifier at 63-65 of "02"',
        message: "lies in no value node",
      },
      {
        where:
          'Identifier at 63-65 of "02" in EventmodelingTimeFrameStatement at 30-81',
        message:
          'the kind of a token that the node writes itself: "Identifier", not "Keyword"',
      },
      {
        where: "EventmodelingTimeFrameStatement at 30-81",
        message: 'the component gap contains unowned text: " ->> 02 "',
      },
      {
        where: "EventmodelingTimeFrameStatement at 30-81",
        message:
          "the supplied components must fill the complete node in source order",
      },
    ])
  })
})

describe("checkTree: authored GWT type words (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "eventmodeling",
    "gram-gwt-unassigned-type",
  )

  it("passes the valid tree for authored GWT type words (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an unassigned GWT item removed from its clause", () => {
    const broken = copyOf(root)
    const clause = firstNode(broken, "EventmodelingGwtClause")
    const body = clause.body as unknown[]
    body.splice(1, 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: 'Identifier at 36-37 of "B"',
        message: "lies in no value node",
      },
      {
        where: 'Identifier at 36-37 of "B" in EventmodelingGwtClause at 21-37',
        message:
          'the kind of a token that the node writes itself: "Identifier", not "Keyword"',
      },
      {
        where: "EventmodelingGwtClause at 21-37",
        message:
          "the supplied components must fill the complete node in source order",
      },
    ])
  })
})

describe("checkTree: shared string fields (ast.md, StringLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "usecase",
    "lex-native-single-quoted-keys",
  )

  it("passes the valid tree for shared string fields (ast.md, StringLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a quoted value replaced by a plain string field", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    const parent = nodesOf(broken).find((candidate) =>
      Object.values(candidate).includes(node),
    )!
    const field = Object.keys(parent).find((key) => parent[key] === node)!
    setField(parent, field, node.value)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "UsecaseMetadataProperty at 22-37",
        message: "the field key is string, not a node",
      },
    ])
  })

  it("fails a StringLiteral value that is a number", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "value", 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 22-28",
        message: "the field value is number, not string",
      },
    ])
  })

  it("fails a StringLiteral raw value that is a number", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "raw", 1)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 22-28",
        message: "the field raw is number, not string",
      },
    ])
  })

  it("fails a StringLiteral closed flag that is a string", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "closed", "true")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 22-28",
        message: "the field closed is string, not boolean",
      },
    ])
  })

  it("fails children added to a StringLiteral", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "children", [])
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 22-28",
        message: "has the field children, which its type does not have",
      },
    ])
  })

  it("fails a quoted metadata key represented by an unquoted Identifier", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    const parent = nodesOf(broken).find((candidate) =>
      Object.values(candidate).includes(node),
    )!
    const field = Object.keys(parent).find((key) => parent[key] === node)!
    setField(parent, field, {
      type: "Identifier",
      name: node.raw,
      range: node.range,
      loc: node.loc,
    })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Identifier at 22-28",
        message: "the value has no lexical Identifier unit in its position",
      },
      {
        where: "Identifier at 22-28",
        message:
          "the tokens of a usecase identifier are not all of the kind Identifier: String",
      },
      {
        where: "UsecaseMetadataProperty at 22-37",
        message:
          "usecase Db: UsecaseMetadataProperty: unknown actor metadata key \"'type'\"",
      },
    ])
  })
})

describe("checkTree: unclosed backquoted names (ast.md, StringLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "class",
    "lex-backquote-unclosed-directive-after-line-break",
  )

  it("passes the valid tree for unclosed backquoted names (ast.md, StringLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an unclosed backquoted value with its final line feed omitted", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "value", "x\n")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-37",
        message: 'value is not its written text: "x\\n", not "x\\n\\n"',
      },
    ])
  })

  it("fails an unclosed backquoted raw value with a closing quote added", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    setField(node, "raw", `${String(node.raw)}\``)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-37",
        message: 'raw: "`x\\n%%{init: {}}%%\\n`", not "`x\\n%%{init: {}}%%\\n"',
      },
      {
        where: "StringLiteral at 19-37",
        message: "closed: false, not true",
      },
    ])
  })

  it("fails an unclosed backquoted value that keeps its opening quote", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "value", "`x\n\n")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-37",
        message: 'value is not its written text: "`x\\n\\n", not "x\\n\\n"',
      },
    ])
  })

  it("fails an unclosed backquoted name marked closed", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "closed", true)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-37",
        message: "closed: true, not false",
      },
      {
        where: "StringLiteral at 19-37",
        message: 'value is not its written text: "x\\n\\n", not "x\\n"',
      },
    ])
  })

  it("fails an unclosed backquoted fragment with its internal line feed omitted", () => {
    const broken = copyOf(root)
    const token = broken.tokens.find(
      (candidate) => candidate.type === "StringFragment",
    )!
    setField(token, "range", [token.range[0], token.range[1] - 1])
    setField(token, "loc", locationOf(text, token.range))
    setField(token, "value", token.value.slice(0, -1))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-37",
        message:
          'the texts of its tokens joined are not its written text: "x\\n", not "x\\n\\n"',
      },
    ])
  })
})

describe("checkTree: directives after unclosed names (ast.md, StringLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "class",
    "lex-backquote-unclosed-directive-at-end",
  )

  it("passes the valid tree for directives after unclosed names (ast.md, StringLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an unclosed backquoted range extended through a following directive", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    setField(node, "range", [19, text.length])
    setField(node, "loc", locationOf(text, [19, text.length]))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-36",
        message: "lies outside ClassName at 19-22",
      },
      {
        where: "StringLiteral at 19-36",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "StringLiteral at 19-36",
        message: 'raw: "`b ", not "`b %%{init: {}}%%"',
      },
    ])
  })

  it("fails an unclosed backquoted value with its trailing space omitted", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "value", "b")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 19-22",
        message: 'value is not its written text: "b", not "b "',
      },
    ])
  })
})

describe("checkTree: treemap numeric commas (ast.md, NumericLiteral)", () => {
  const { input: text, tree: root } = recordedTree("treemap", "db-number-comma")

  it("passes the valid tree for treemap numeric commas (ast.md, NumericLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a numeric leaf replaced by a string field", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "NumericLiteral")
    const parent = nodesOf(broken).find((candidate) =>
      Object.values(candidate).includes(node),
    )!
    const field = Object.keys(parent).find((key) => parent[key] === node)!
    setField(parent, field, "1,234.50")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "TreemapLeaf at 8-20",
        message: "the field value is string, not a node",
      },
    ])
  })

  it("fails a NumericLiteral value that is a string", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "value", "1234.5")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-20",
        message: "the field value is string, not number",
      },
    ])
  })

  it("fails a NumericLiteral raw value that is a number", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "raw", 1234.5)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-20",
        message: "the field raw is number, not string",
      },
    ])
  })

  it("fails children added to a NumericLiteral", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "children", [])
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-20",
        message: "has the field children, which its type does not have",
      },
    ])
  })
})

describe("checkTree: treemap numeric prefixes (ast.md, NumericLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "treemap",
    "db-number-underscore",
  )

  it("passes the valid tree for treemap numeric prefixes (ast.md, NumericLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a treemap value read past its first underscore", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "value", 1234.5)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-20",
        message:
          "value is not the number that its written text writes: 1234.5, not 1",
      },
    ])
  })

  it("fails a treemap raw value with its unread suffix omitted", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "raw", "1")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-20",
        message: 'raw: "1", not "1_234.50"',
      },
    ])
  })
})

describe("checkTree: extra dots in treemap values (ast.md, NumericLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "treemap",
    "db-number-multiple-dots",
  )

  it("passes the valid tree for extra dots in treemap values (ast.md, NumericLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a treemap value read past its second dot", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "value", 1.23)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-17",
        message:
          "value is not the number that its written text writes: 1.23, not 1.2",
      },
    ])
  })
})

describe("checkTree: treemap values without a numeric prefix (ast.md, NumericLiteral)", () => {
  const { input: text, tree: root } = recordedTree("treemap", "db-number-nan")

  it("passes the valid tree for treemap values without a numeric prefix (ast.md, NumericLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a treemap dot without a digit read as zero", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "value", 0)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-13",
        message:
          "value is not the number that its written text writes: 0, not NaN",
      },
    ])
  })
})

describe("checkTree: shared railroad bodies (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "railroad",
    "ir-gram-written-tree",
  )

  it("passes the valid tree for shared railroad bodies (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a railroad body with an extra header-kind field", () => {
    const broken = copyOf(root)
    setField(broken.body, "headerKind", "railroad")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "RailroadDiagram at 0-250",
        message: "has the field headerKind, which its type does not have",
      },
    ])
  })
})

describe("checkTree: Wardley name node types (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree("wardley", "db-all-fields")

  it("passes the valid tree for Wardley name node types (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a bare Wardley name represented by shared Identifier", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "WardleyIdentifier"), "type", "Identifier")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "WardleyEvolutionStage at 76-89",
        message:
          "the field secondName holds a Identifier, not a WardleyIdentifier or StringLiteral",
      },
    ])
  })

  it("fails a quoted Wardley name represented by WardleyIdentifier", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    const parent = nodesOf(broken).find((candidate) =>
      Object.values(candidate).includes(node),
    )!
    const field = Object.keys(parent).find((key) => parent[key] === node)!
    setField(parent, field, {
      type: "WardleyIdentifier",
      name: node.value,
      range: node.range,
      loc: node.loc,
    })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "WardleyIdentifier at 76-81",
        message: 'name is not its written text: " G ", not "\\" G \\""',
      },
      {
        where: "WardleyIdentifier at 76-81",
        message: "the name is not one complete first-match lexical unit",
      },
      {
        where: "WardleyIdentifier at 76-81",
        message:
          "the tokens of a Wardley comparison name are not all of the kind Identifier: String",
      },
    ])
  })
})

describe("checkTree: Cynefin label node types (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree("cynefin", "db-all-fields")

  it("passes the valid tree for Cynefin label node types (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a Cynefin item label represented by CynefinLiteral", () => {
    const broken = copyOf(root)
    const item = firstNode(broken, "CynefinDomainItem")
    const node = item.label as CheckedNode
    setField(item, "label", {
      type: "CynefinLiteral",
      value: node.value,
      range: node.range,
      loc: node.loc,
    })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "CynefinLiteral at 60-63",
        message: 'value is not its written text: "F", not "\\"F\\""',
      },
      {
        where: "CynefinDomainItem at 60-63",
        message: "the field label holds a CynefinLiteral, not a StringLiteral",
      },
      {
        where: "CynefinLiteral at 60-63",
        message:
          "the tokens of a common value or hidden form are not all of the kind RawText: String",
      },
    ])
  })

  it("fails a Cynefin transition label represented by CynefinLiteral", () => {
    const broken = copyOf(root)
    const node = nodesOf(broken).find(
      (candidate) =>
        candidate.type === "StringLiteral" && candidate.value === "Move",
    )!
    const parent = nodesOf(broken).find((candidate) =>
      Object.values(candidate).includes(node),
    )!
    const field = Object.keys(parent).find((key) => parent[key] === node)!
    setField(parent, field, {
      type: "CynefinLiteral",
      value: node.value,
      range: node.range,
      loc: node.loc,
    })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "CynefinLiteral at 156-162",
        message: 'value is not its written text: "Move", not "\\"Move\\""',
      },
      {
        where: "CynefinTransitionStatement at 130-162",
        message: "the field label holds a CynefinLiteral, not a StringLiteral",
      },
      {
        where: "CynefinLiteral at 156-162",
        message:
          "the tokens of a common value or hidden form are not all of the kind RawText: String",
      },
    ])
  })
})

describe("checkTree: Treeview name node types (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "treeview",
    "gram-written-tree",
  )

  it("passes the valid tree for Treeview name node types (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a bare Treeview name represented by shared Identifier", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "TreeviewIdentifier"), "type", "Identifier")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "TreeviewNode at 90-160",
        message:
          "the field name holds a Identifier, not a TreeviewIdentifier or StringLiteral",
      },
      {
        where: "Identifier at 90-95",
        message:
          "the class or complete icon reference must be one nonempty name atom",
      },
      {
        where: "Identifier at 90-95",
        message:
          "the tokens of a class or icon name are not all of the kind Identifier: RawText",
      },
    ])
  })

  it("fails a quoted Treeview name represented by TreeviewIdentifier", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    const parent = nodesOf(broken).find((candidate) =>
      Object.values(candidate).includes(node),
    )!
    const field = Object.keys(parent).find((key) => parent[key] === node)!
    setField(parent, field, {
      type: "TreeviewIdentifier",
      name: node.value,
      range: node.range,
      loc: node.loc,
    })
    expect(checkTree(text, broken)).toEqual([
      {
        where: "TreeviewIdentifier at 151-160",
        message: 'name is not its written text: "child/ ", not "\\"child/ \\""',
      },
      {
        where: "TreeviewIdentifier at 151-160",
        message:
          "the name must be one complete first-priority bare or closed quoted unit",
      },
      {
        where: "TreeviewIdentifier at 151-160",
        message:
          "the tokens of a bare name are not all of the kind RawText: String",
      },
    ])
  })

  it("fails a Treeview class name represented by TreeviewIdentifier", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "Identifier"), "type", "TreeviewIdentifier")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "TreeviewClassAnnotation at 96-104",
        message: "the field name holds a TreeviewIdentifier, not a Identifier",
      },
      {
        where: "TreeviewIdentifier at 99-104",
        message:
          "the tokens of a bare name are not all of the kind RawText: Identifier",
      },
    ])
  })
})

describe("checkTree: an unclosed directive running to EOF (ast.md, Directive)", () => {
  const text = "error\n%%{init: {x"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["Directive", "%%{init: {x"],
    ],
    directives: [directiveOf(text, "%%{init: {x")],
  })

  it("passes the valid tree for an unclosed directive running to EOF (ast.md, Directive)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an unclosed directive stopped before the end of the text", () => {
    const broken = copyOf(root)
    const directive = broken.directives[0]
    setField(directive, "range", [6, text.length - 1])
    setField(directive, "loc", locationOf(text, [6, text.length - 1]))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[6,16],false]], not [[[6,17],false]]",
      },
      {
        where: "Directive at 6-16",
        message: 'value: "init: {x", not "init: {"',
      },
      {
        where: "the Directive tokens",
        message:
          "are not those of the directives outside all other tokens and all comments: [[6,17]], not [[6,16]]",
      },
    ])
  })
})

describe("checkTree: an unclosed word-argument directive (ast.md, Directive)", () => {
  const text = "error\n%%{init: one  \nmore"
  const root = handMadeRoot(text, {
    tokens: [
      ["RawText", "error"],
      ["Directive", "%%{init: one"],
      ["RawText", "more"],
    ],
    directives: [directiveOf(text, "%%{init: one")],
  })

  it("passes the valid tree for an unclosed word-argument directive (ast.md, Directive)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails an unclosed word-argument directive extended through following whitespace", () => {
    const broken = copyOf(root)
    const directive = broken.directives[0]
    setField(directive, "range", [6, 21])
    setField(directive, "loc", locationOf(text, [6, 21]))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[6,21],false]], not [[[6,18],false]]",
      },
      {
        where: "Directive at 6-21",
        message: 'value: "init: one", not "init: one  \\n"',
      },
      {
        where: "the Directive tokens",
        message:
          "are not those of the directives outside all other tokens and all comments: [[6,18]], not [[6,21]]",
      },
    ])
  })
})

describe("checkTree: nested string delimiters (ast.md, StringLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "flowchart",
    "gram-string-nested-empty-markdown",
  )

  it("passes the valid tree for nested string delimiters (ast.md, StringLiteral)", () => {
    expect(checkTree(text, root)).toEqual([])
  })

  it("fails a StringLiteral value that retains nested delimiters", () => {
    const broken = copyOf(root)
    const node = firstNode(broken, "StringLiteral")
    setField(node, "value", String(node.raw).slice(1, -1))
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 28-35",
        message: 'value is not its written text: "u\\"``\\"", not "u"',
      },
    ])
  })
})

describe("checkTree: integer flowchart values (ast.md, NumericLiteral)", () => {
  const { input: text, tree: root } = recordedTree(
    "flowchart",
    "db-linkstyle-shared-fill",
  )
  it("passes a flowchart with integer link-style indices", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails a flowchart NumericLiteral value changed to a fraction", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "value", 0.5)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 35-36",
        message:
          "value is not the number that its written text writes: 0.5, not 0",
      },
    ])
  })
})

describe("checkTree: non-ignored statement names (ast.md, Diagram nodes)", () => {
  const text = "error"
  const root = handMadeRoot(text, { tokens: [["RawText", "error"]] })
  it("passes a non-ignored ErrorDiagram", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails a normal diagram node with an IgnoredStatement suffix", () => {
    const broken = copyOf(root)
    setField(broken.body, "type", "ErrorIgnoredStatement")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "ErrorIgnoredStatement at 0-5",
        message: "is of a type that the specification does not define",
      },
    ])
  })
})

describe("checkTree: shared literal forms (ast.md, Shared leaf nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "usecase",
    "lex-native-single-quoted-keys",
  )
  it("passes the valid tree for shared literal forms (ast.md, Shared leaf nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails a shared StringLiteral with a diagram-specific field", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "StringLiteral"), "usecaseValue", "type")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StringLiteral at 22-28",
        message: "has the field usecaseValue, which its type does not have",
      },
    ])
  })
})

describe("checkTree: shared numeric forms (ast.md, Shared leaf nodes)", () => {
  const { input: text, tree: root } = recordedTree("treemap", "db-number-comma")
  it("passes the valid tree for shared numeric forms (ast.md, Shared leaf nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails a shared NumericLiteral with a diagram-specific field", () => {
    const broken = copyOf(root)
    setField(firstNode(broken, "NumericLiteral"), "treemapValue", 1234.5)
    expect(checkTree(text, broken)).toEqual([
      {
        where: "NumericLiteral at 12-20",
        message: "has the field treemapValue, which its type does not have",
      },
    ])
  })
})

describe("checkTree: qualified name tails (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "eventmodeling",
    "gram-written-tree",
  )
  it("passes the valid tree for qualified name tails (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails an eventmodeling qualified name without its tail", () => {
    const broken = copyOf(root)
    Reflect.deleteProperty(
      firstNode(broken, "EventmodelingQualifiedName"),
      "tail",
    )
    expect(checkTree(text, broken)).toEqual([
      {
        where: "EventmodelingQualifiedName at 40-51",
        message: "lacks the field tail",
      },
    ])
  })
})

describe("checkTree: Treeview icon names (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "treeview",
    "gram-written-tree",
  )
  it("passes the valid tree for Treeview icon names (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails a Treeview icon name represented by TreeviewIdentifier", () => {
    const broken = copyOf(root)
    const icon = firstNode(broken, "TreeviewIconAnnotation")
    setField(icon.name as CheckedNode, "type", "TreeviewIdentifier")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "TreeviewIconAnnotation at 105-120",
        message: "the field name holds a TreeviewIdentifier, not a Identifier",
      },
      {
        where: "TreeviewIdentifier at 110-119",
        message:
          "the name must be one complete first-priority bare or closed quoted unit",
      },
      {
        where: "TreeviewIdentifier at 110-119",
        message:
          "the tokens of a bare name are not all of the kind RawText: Identifier",
      },
    ])
  })
})

describe("checkTree: ignored statement type names (ast.md, Diagram nodes)", () => {
  const { input: text, tree: root } = recordedTree(
    "state",
    "tokens-ignored-statement-directive-between-empty-strings",
  )
  it("passes the valid tree for ignored statement type names (ast.md, Diagram nodes)", () => {
    expect(checkTree(text, root)).toEqual([])
  })
  it("fails an ignored statement without its IgnoredStatement suffix", () => {
    const broken = copyOf(root)
    setField(
      firstNode(broken, "StateIgnoredStatement"),
      "type",
      "StateHiddenStatement",
    )
    expect(checkTree(text, broken)).toEqual([
      {
        where: "StateHiddenStatement at 24-44",
        message: "is of a type that the specification does not define",
      },
    ])
  })
})

describe("checkTree: cases named by the shared AST conditions", () => {
  const flowchartCases: readonly MutationCase[] = [
    {
      name: "reports a fractional value in an integer arrow-length field",
      fixture: "lex-directive-after-arrow",
      mutate(root) {
        setField(firstNode(root, "FlowchartArrow"), "length", 2.5)
      },
      expected: "the fields of the arrow",
    },
    {
      name: "reports a parenthesized list type replaced by a null list",
      fixture: "gram-click-comma-only-href",
      mutate(root) {
        setField(firstNode(root, "FlowchartClickUrlStatement"), "ids", null)
      },
      expected: "the field ids is null, not a list",
    },
    {
      name: "reports a parenthesized list element that is no node or null",
      fixture: "gram-click-comma-only-href",
      mutate(root) {
        setField(firstNode(root, "FlowchartClickUrlStatement"), "ids", [5])
      },
      expected: "is no node: it has no type and no range",
    },
    {
      name: "reports a comma vertex id split into several authored ids",
      fixture: "gram-vertex-id-comma",
      mutate(root) {
        const vertex = firstNode(root, "FlowchartVertex")
        const id = vertex.id as CheckedNode
        setField(vertex, "id", [
          {
            ...id,
            name: "A",
            range: [id.range[0], id.range[0] + 1],
            loc: {
              start: id.loc.start,
              end: {
                line: id.loc.start.line,
                column: id.loc.start.column + 1,
              },
            },
          },
          {
            ...id,
            name: "B",
            range: [id.range[1] - 1, id.range[1]],
            loc: {
              start: {
                line: id.loc.end.line,
                column: id.loc.end.column - 1,
              },
              end: id.loc.end,
            },
          },
        ])
      },
      expected: "the field id is a list, not a node",
    },
    {
      name: "reports the comma-separated class ids collapsed into one node",
      fixture: "db-class-on-edge-and-subgraph",
      mutate(root) {
        const node = firstNode(root, "FlowchartClassStatement")
        const ids = node.ids as CheckedNode[]
        const first = ids[0]
        const last = ids.at(-1)!
        setField(node, "ids", {
          ...first,
          name: ids.map((id) => String(id.name)).join(","),
          range: [first.range[0], last.range[1]],
          loc: { start: first.loc.start, end: last.loc.end },
        })
      },
      expected: "the field ids is object, not a list",
    },
    {
      name: "reports a StringLiteral raw value with its internal directive removed",
      fixture: "lex-directive-in-click-href-string",
      mutate(root) {
        setField(firstNode(root, "StringLiteral"), "raw", '"uv"')
      },
      expected: 'raw: "\\"uv\\"", not',
    },
    {
      name: "reports a StringLiteral raw value with its comment region removed",
      fixture: "tokens-string-literal-comment-line",
      mutate(root) {
        const node = nodesOf(root).find(
          (candidate) =>
            candidate.type === "StringLiteral" &&
            candidate.value === "one\ntwo",
        )!
        setField(node, "raw", '"one\ntwo"')
      },
      expected: 'raw: "\\"one\\ntwo\\"", not',
    },
  ]
  for (const testCase of flowchartCases) {
    it(testCase.name, () => {
      const { base, mutated } = problemsOf("flowchart", testCase)
      expect(base).toEqual([])
      expect(mutated.map((problem) => problem.message)).toContainEqual(
        expect.stringContaining(testCase.expected),
      )
    })
  }

  const stateCases: readonly MutationCase[] = [
    {
      name: "reports ignored text that retains an ordinary percent comment",
      fixture: "tokens-ignored-text-comment-between-units",
      mutate(root) {
        setField(
          firstNode(root, "StateIgnoredText"),
          "value",
          "state %% c\n  state",
        )
      },
      expected: "value is not its written text",
    },
    {
      name: "reports ignored text that retains an ordinary hash comment",
      fixture: "tokens-ignored-text-hash-comment-between-units",
      mutate(root) {
        setField(
          firstNode(root, "StateIgnoredText"),
          "value",
          "state # c\n  state",
        )
      },
      expected: "value is not its written text",
    },
    {
      name: "reports ignored text that retains a directive between empty strings",
      fixture: "tokens-ignored-text-directive-between-empty-strings",
      mutate(root) {
        setField(
          firstNode(root, "StateIgnoredText"),
          "value",
          '"" %%{init: {}}%% ""',
        )
      },
      expected: "value is not its written text",
    },
    {
      name: "reports ignored text that loses a space between empty strings",
      fixture: "tokens-ignored-text-directive-between-empty-strings",
      mutate(root) {
        setField(firstNode(root, "StateIgnoredText"), "value", '"" ""')
      },
      expected: "value is not its written text",
    },
  ]
  for (const testCase of stateCases) {
    it(testCase.name, () => {
      const { base, mutated } = problemsOf("state", testCase)
      expect(base).toEqual([])
      expect(
        mutated.some((problem) => problem.message.includes(testCase.expected)),
      ).toBe(true)
    })
  }

  it("passes a fractional number and the node and null elements of a parenthesized list", () => {
    const fraction = recordedTree("treemap", "number-leading-dot")
    expect(firstNode(fraction.tree, "NumericLiteral").value).toBe(0.5)
    expect(checkTree(fraction.input, fraction.tree)).toEqual([])
    const holes = recordedTree("flowchart", "gram-click-comma-only-href")
    expect(firstNode(holes.tree, "FlowchartClickUrlStatement").ids).toEqual([
      null,
      null,
    ])
    expect(checkTree(holes.input, holes.tree)).toEqual([])
    const names = recordedTree(
      "flowchart",
      "lex-directive-in-click-href-string",
    )
    expect(
      firstNode(names.tree, "FlowchartClickUrlStatement").ids,
    ).toHaveLength(1)
    expect(checkTree(names.input, names.tree)).toEqual([])
  })

  it("passes a nullable field with null and with its named node type", () => {
    const plain = handMadeRoot("error", { tokens: [["RawText", "error"]] })
    expect(plain.frontmatter).toBeNull()
    expect(checkTree("error", plain)).toEqual([])
    const text = "---\ntitle: X\n---\nerror"
    const withFrontmatter = handMadeRoot(text, {
      tokens: [
        ["Punctuator", "---"],
        ["RawText", "title: X"],
        ["Punctuator", { text: "---", from: 3 }],
        ["RawText", "error"],
      ],
      frontmatter: frontmatterOf(text, "---\ntitle: X\n---", [4, 13]),
    })
    expect(checkTree(text, withFrontmatter)).toEqual([])
  })

  it("reports an unclosed directive value that stops before its last character", () => {
    const text = "error\n%%{init: one"
    const root = handMadeRoot(text, {
      tokens: [
        ["RawText", "error"],
        ["Directive", "%%{init: one"],
      ],
      directives: [directiveOf(text, "%%{init: one")],
    })
    expect(checkTree(text, root)).toEqual([])
    setField(root.directives[0], "value", "init: on")
    expect(checkTree(text, root)).toContainEqual({
      where: "Directive at 6-18",
      message: 'value: "init: on", not "init: one"',
    })
  })

  it("reports a StringLiteral raw value with its ignored semicolon removed", () => {
    const { input, tree } = recordedTree(
      "requirement",
      "tokens-ignored-semicolon-in-string-value",
    )
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "StringLiteral"), "raw", '"style:#x ab"')
    expect(
      checkTree(input, tree).some((problem) =>
        problem.message.startsWith("raw:"),
      ),
    ).toBe(true)
  })

  it("reports a StringLiteral raw value with its nested quotes removed", () => {
    const { input, tree } = recordedTree(
      "flowchart",
      "gram-string-nested-empty-markdown",
    )
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "StringLiteral"), "raw", '"u"')
    expect(
      checkTree(input, tree).some((problem) =>
        problem.message.startsWith("raw:"),
      ),
    ).toBe(true)
  })

  it("reports a StringLiteral raw value whose backslash spelling was decoded", () => {
    const { input, tree } = recordedTree(
      "usecase",
      "lex-native-string-backslashes",
    )
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "StringLiteral"), "raw", '"fa\nuser"')
    expect(
      checkTree(input, tree).some((problem) =>
        problem.message.startsWith("raw:"),
      ),
    ).toBe(true)
  })

  it("reports a treemap leading-dot fraction recorded without the fraction", () => {
    const { input, tree } = recordedTree("treemap", "number-leading-dot")
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "NumericLiteral"), "value", 5)
    expect(checkTree(input, tree)).toContainEqual({
      where: "NumericLiteral at 12-14",
      message:
        "value is not the number that its written text writes: 5, not 0.5",
    })
  })

  it("reports a treemap trailing-dot number recorded as a fraction", () => {
    const { input, tree } = recordedTree("treemap", "number-trailing-dot")
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "NumericLiteral"), "value", 0.5)
    expect(checkTree(input, tree)).toContainEqual({
      where: "NumericLiteral at 12-14",
      message:
        "value is not the number that its written text writes: 0.5, not 5",
    })
  })
})

describe("checkTree: the fields of a node", () => {
  const { input, tree } = recordedTree(
    "flowchart",
    "spec-flow-singlenode-a5fa3415",
  )

  it("reports Root without its type field", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(broken, "type")
    expect(checkTree(input, broken)).toEqual([
      { where: "the tree", message: "is no node: it has no type and no range" },
    ])
  })

  it("reports a node inside the body without its type field", () => {
    const broken = copyOf(tree)
    Reflect.deleteProperty(
      firstNode(broken, "FlowchartVertexStatement"),
      "type",
    )
    expect(checkTree(input, broken)).toEqual([
      {
        where: "FlowchartDiagram at 0-11.body[0]",
        message: "is no node: it has no type and no range",
      },
    ])
  })

  it("reports a null element in a child list whose type allows no null", () => {
    const broken = copyOf(tree)
    setField(broken.body, "body", [null])
    expect(checkTree(input, broken)).toEqual([
      {
        where: "FlowchartDiagram at 0-11.body[0]",
        message: "is no node: it has no type and no range",
      },
    ])
  })

  it("reports a child field whose value is a primitive instead of a child node", () => {
    const broken = copyOf(tree)
    setField(firstNode(broken, "FlowchartVertexStatement"), "first", "A")
    expect(checkTree(input, broken)).toEqual([
      {
        where: "FlowchartVertexStatement at 9-10",
        message: "the field first is string, not a node",
      },
    ])
  })
})

describe("checkTree: another diagram's number read as a treemap number", () => {
  it("reports a flowchart number read with treemap comma handling", () => {
    const { input, tree } = recordedTree(
      "flowchart",
      "db-linkstyle-shared-fill",
    )
    const text = input.replace("0,1", "1,2")
    const node = firstNode(tree, "NumericLiteral")
    setField(node, "raw", "1,2")
    setField(node, "value", 12)
    setField(node, "range", [35, 38])
    setField(node, "loc", locationOf(text, [35, 38]))
    setField(firstNode(tree, "FlowchartLinkStyleStatement"), "indices", [node])
    const first = tree.tokens.findIndex((token) => token.type === "Numeric")
    tree.tokens.splice(first, 3, {
      type: "Numeric",
      value: "1,2",
      range: [35, 38],
      loc: locationOf(text, [35, 38]),
    })
    expect(checkTree(text, tree)).toEqual([
      {
        where: "NumericLiteral at 35-38",
        message:
          "value is not the number that its written text writes: 12, not NaN",
      },
    ])
  })
})

describe("checkTree: unread text keeps the leaf type of its diagram", () => {
  it("reports a child node added to an unread-text leaf", () => {
    const { input, tree } = recordedTree(
      "flowchart",
      "db-subgraph-dir-after-nested-end-ignored-semicolon",
    )
    const node = firstNode(tree, "FlowchartIgnoredText")
    setField(node, "children", [{ ...node }])
    expect(checkTree(input, tree)).toEqual([
      {
        where: "FlowchartIgnoredText at 54-64",
        message: "has the field children, which its type does not have",
      },
    ])
  })

  for (const [diagram, fixture, type, literal, field] of [
    [
      "agentflow",
      "gram-click-erased-after-href",
      "AgentflowIgnoredText",
      "AgentflowLiteral",
      "textBeforeUrl",
    ],
    [
      "architecture",
      "detect-retained-bare-ascii",
      "ArchitectureIgnoredText",
      "ArchitectureLiteral",
      "textBeforeHeader",
    ],
    [
      "cynefin",
      "detect-block-after-directive",
      "CynefinIgnoredText",
      "CynefinLiteral",
      "textBeforeHeader",
    ],
    [
      "eventmodeling",
      "comment-line-inside-hidden-directive",
      "EventmodelingIgnoredText",
      "EventmodelingLiteral",
      "textBeforeHeader",
    ],
    [
      "gitgraph",
      "db-state-common-forms-preserve-head",
      "GitgraphIgnoredText",
      "GitgraphLiteral",
      "body",
    ],
    [
      "info",
      "detect-block-after-real-frontmatter",
      "InfoIgnoredText",
      "InfoLiteral",
      "textBeforeHeader",
    ],
    [
      "packet",
      "c4-hidden-suffix-lf",
      "PacketIgnoredText",
      "PacketLiteral",
      "textAfter",
    ],
    [
      "pie",
      "lex-preheader-retained-yaml-bare-then-directive-ascii",
      "PieIgnoredText",
      "PieLiteral",
      "textBeforeHeader",
    ],
    [
      "radar",
      "detect-retained-indent-open-native",
      "RadarIgnoredText",
      "RadarLiteral",
      "textBeforeHeader",
    ],
    [
      "railroad",
      "abnf-frontmatter-retained",
      "RailroadIgnoredText",
      "RailroadLiteral",
      "textBeforeHeader",
    ],
    [
      "requirement",
      "gram-empty-description-block-after-brace",
      "RequirementIgnoredText",
      "RequirementLiteral",
      "body",
    ],
    [
      "treeview",
      "ast-annotation-prefixes",
      "TreeviewIgnoredText",
      "TreeviewLiteral",
      "textBefore",
    ],
    [
      "venn",
      "db-grid-comment-header-line",
      "VennIgnoredText",
      "VennLiteral",
      "body",
    ],
    [
      "wardley",
      "detect-block-after-frontmatter",
      "WardleyIgnoredText",
      "WardleyLiteral",
      "textBeforeHeader",
    ],
  ] as const) {
    it(`reports ${diagram} unread text represented by an ordinary literal`, () => {
      const { input, tree } = recordedTree(diagram, fixture)
      const node = firstNode(tree, type)
      setField(node, "type", literal)
      Reflect.deleteProperty(node, "kind")
      expect(
        checkTree(input, tree).map((problem) => problem.message),
      ).toContainEqual(
        expect.stringContaining(
          `the field ${field} holds a ${literal}, not a `,
        ),
      )
    })
  }
})

describe("checkTree: railroad diagram type agrees with its dialect header", () => {
  it("reports an ABNF header recorded with another railroad diagram type", () => {
    const { input, tree } = recordedTree("railroad", "abnf-bare-unicode")
    setField(tree, "diagramType", "railroadPeg")
    expect(checkTree(input, tree).map((problem) => problem.message)).toContain(
      "the diagram owns exactly its dialect's complete lowercase header",
    )
  })
  it("reports an EBNF header recorded with another railroad diagram type", () => {
    const { input, tree } = recordedTree(
      "railroad",
      "db-acc-descr-block-two-lines-before-statement",
    )
    setField(tree, "diagramType", "railroadPeg")
    expect(checkTree(input, tree).map((problem) => problem.message)).toContain(
      "the diagram owns exactly its dialect's complete lowercase header",
    )
  })
  it("reports a PEG header recorded with another railroad diagram type", () => {
    const { input, tree } = recordedTree(
      "railroad",
      "lex-peg-acc-descr-block-line-separator-then-comment-line",
    )
    setField(tree, "diagramType", "railroad")
    expect(checkTree(input, tree).map((problem) => problem.message)).toContain(
      "the diagram owns exactly its dialect's complete lowercase header",
    )
  })
})

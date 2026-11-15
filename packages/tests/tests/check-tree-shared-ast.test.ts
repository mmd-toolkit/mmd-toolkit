import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  copyOf,
  firstNode,
  problemsOf,
  itFailsEachRecorded,
  recordedTree,
  says,
  setField,
} from "./check-tree-recorded.ts"
import type { InputCase, MutationCase } from "./check-tree-recorded.ts"
import { itFailsEach } from "./check-tree-built.ts"
import type { Built } from "./check-tree-built.ts"
import { buildPacket, range as rangeBlock, relative } from "./packet-built.ts"
import { ignored } from "./statement-tree-built.ts"
import {
  directiveOf,
  frontmatterOf,
  handMadeRoot,
  locationOf,
} from "./check-tree-trees.ts"

// The conditions of packages/spec/docs/ast.md and of the tree documents of
// the diagram types (packages/spec/docs/ast/<diagram>.md) that no other test
// of the check of a tree breaks. Each case changes one condition of a valid hand
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

describe("checkTree: where an unclosed directive ends (ast.md, Directive)", () => {
  // Each recorded directive is extended by one character past the end of its
  // argument: the whitespace after a word argument, or the U+2028 or U+2029
  // that stops a free-text argument.
  for (const [name, diagram, fixture, expected] of [
    [
      "fails an unclosed directive that takes the line feed after its word argument",
      "common",
      "comment-directive-word-argument-takes-next-lines",
      "the directives of the tree are not those of the source: [[[18,28],false]], not [[[18,27],false]]",
    ],
    [
      "fails an unclosed directive that takes the U+2028 that stops its argument",
      "ishikawa",
      "directive-open-object-u2028",
      "the directives of the tree are not those of the source: [[[10,22],false]], not [[[10,21],false]]",
    ],
    [
      "fails an unclosed directive that takes the U+2029 that stops its argument",
      "ishikawa",
      "directive-open-object-u2029",
      "the directives of the tree are not those of the source: [[[13,25],false]], not [[[13,24],false]]",
    ],
  ] as const) {
    it(name, () => {
      const { input, tree } = recordedTree(diagram, fixture)
      const broken = copyOf(tree)
      const directive = broken.directives[0]
      const range = [directive.range[0], directive.range[1] + 1] as const
      setField(directive, "range", range)
      setField(directive, "loc", locationOf(input, range))
      expect(checkTree(input, broken)).toContainEqual({
        where: "the directives",
        message: expected,
      })
    })
  }

  it("fails an unclosed directive whose name is not the directive's name", () => {
    const { input, tree } = recordedTree("common", "directive-unclosed")
    const broken = copyOf(tree)
    setField(broken.directives[0], "name", "xinit")
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 19-42",
      message: 'name: "xinit", not "init"',
    })
  })

  it("fails an unclosed directive whose value is not what is written after its opening", () => {
    const { input, tree } = recordedTree("common", "directive-unclosed")
    const broken = copyOf(tree)
    setField(broken.directives[0], "value", 'init: {"x": 1}\nC-->Dx')
    expect(checkTree(input, broken)).toContainEqual({
      where: "Directive at 19-42",
      message:
        'value: "init: {\\"x\\": 1}\\nC-->Dx", not "init: {\\"x\\": 1}\\nC-->D"',
    })
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
    frontmatter: frontmatterOf(text, "---\n  title: Test\n---", [4, 17]),
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
    setField(broken.frontmatter!, "value", "title: Test")
    expect(checkTree(text, broken)).toEqual([
      {
        where: "Frontmatter at 0-21",
        message: 'value: "title: Test", not "  title: Test"',
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
    const tokens = [...tree.tokens]
    const first = tokens.findIndex((token) => token.type === "Numeric")
    tokens.splice(first, 3, {
      type: "Numeric",
      value: "1,2",
      range: [35, 38],
      loc: locationOf(text, [35, 38]),
    })
    setField(tree, "tokens", tokens)
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
  const leafCases = [
    {
      name: "reports a child node added to an unread-text leaf",
      diagram: "flowchart",
      fixture: "db-subgraph-dir-after-nested-end-ignored-semicolon",
      type: "FlowchartIgnoredText",
      where: "FlowchartIgnoredText at 54-64",
    },
  ] as const
  for (const testCase of leafCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const node = firstNode(tree, testCase.type)
      setField(node, "children", [{ ...node }])
      expect(checkTree(input, tree)).toEqual([
        {
          where: testCase.where,
          message: "has the field children, which its type does not have",
        },
      ])
    })
  }

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

describe("checkTree: the remaining shared AST conditions", () => {
  // An empty description block where a statement starts is a description
  // block statement without text (ast.md, Diagram nodes). Each case gives
  // that node the type of the description statement of its diagram and
  // keeps its other fields.
  const emptyDescriptionTypeCases = [
    {
      name: "fails an empty description block of agentflow retyped as AgentflowAccDescrStatement",
      diagram: "agentflow",
      fixture: "db-accessibility-empty-block",
      nodeType: "AgentflowAccDescrBlockStatement",
      range: [34, 45],
      replacementType: "AgentflowAccDescrStatement",
      expected: {
        where: "AgentflowAccDescrStatement at 34-45",
        message: "has the field closed, which its type does not have",
      },
    },
    {
      name: "fails an empty description block of architecture retyped as ArchitectureAccDescrStatement",
      diagram: "architecture",
      fixture: "common-empty-block-after-value",
      nodeType: "ArchitectureAccDescrBlockStatement",
      range: [34, 45],
      replacementType: "ArchitectureAccDescrStatement",
      expected: {
        where: "ArchitectureAccDescrStatement at 34-45",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of block retyped as BlockAccDescrStatement",
      diagram: "block",
      fixture: "db-composite-after-outermost-end-empty-block",
      nodeType: "BlockAccDescrBlockStatement",
      range: [37, 48],
      replacementType: "BlockAccDescrStatement",
      expected: {
        where: "BlockAccDescrStatement at 37-48",
        message: "is of a type that the specification does not define",
      },
    },
    {
      name: "fails an empty description block of c4 retyped as C4AccDescrStatement",
      diagram: "c4",
      fixture: "db-empty-block-inline-after-shape",
      nodeType: "C4AccDescrBlockStatement",
      range: [41, 52],
      replacementType: "C4AccDescrStatement",
      expected: {
        where: "C4AccDescrStatement at 41-52",
        message:
          'the tokens that the node writes itself and its child nodes, in source order: ["accDescr","{","}"], not ["accDescr",":"]',
      },
    },
    {
      name: "fails an empty description block of class retyped as ClassAccDescrStatement",
      diagram: "class",
      fixture: "db-acc-descr-empty-block-before-separator-keeps-block",
      nodeType: "ClassAccDescrBlockStatement",
      range: [51, 62],
      replacementType: "ClassAccDescrStatement",
      expected: {
        where: "ClassAccDescrStatement at 51-62",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of cynefin retyped as CynefinAccDescrStatement",
      diagram: "cynefin",
      fixture: "common-block-comment-only",
      nodeType: "CynefinAccDescrBlockStatement",
      range: [13, 36],
      replacementType: "CynefinAccDescrStatement",
      expected: {
        where: "CynefinAccDescrStatement at 13-36",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of er retyped as ErAccDescrStatement",
      diagram: "er",
      fixture: "db-acc-descr-block-then-empty",
      nodeType: "ErAccDescrBlockStatement",
      range: [25, 36],
      replacementType: "ErAccDescrStatement",
      expected: {
        where: "ErAccDescrStatement at 25-36",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of eventmodeling retyped as EventmodelingAccDescrStatement",
      diagram: "eventmodeling",
      fixture: "common-description-repeat",
      nodeType: "EventmodelingAccDescrBlockStatement",
      range: [45, 56],
      replacementType: "EventmodelingAccDescrStatement",
      expected: {
        where: "EventmodelingAccDescrStatement at 45-56",
        message:
          "the common statement must be its complete composite unit at the current position after common removals",
      },
    },
    {
      name: "fails an empty description block of flowchart retyped as FlowchartAccDescrStatement",
      diagram: "flowchart",
      fixture: "comment-lines-after-separator-006f79fb",
      nodeType: "FlowchartAccDescrBlockStatement",
      range: [25, 36],
      replacementType: "FlowchartAccDescrStatement",
      expected: {
        where: "FlowchartAccDescrStatement at 25-36",
        message: "has the field closed, which its type does not have",
      },
    },
    {
      name: "fails an empty description block of gantt retyped as GanttAccDescrStatement",
      diagram: "gantt",
      fixture: "db-acc-descr-then-empty-block",
      nodeType: "GanttAccDescrBlockStatement",
      range: [18, 29],
      replacementType: "GanttAccDescrStatement",
      expected: {
        where: "GanttAccDescrStatement at 18-29",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of gitgraph retyped as GitgraphAccDescrStatement",
      diagram: "gitgraph",
      fixture: "accdescr-repeat-empty",
      nodeType: "GitgraphAccDescrBlockStatement",
      range: [42, 53],
      replacementType: "GitgraphAccDescrStatement",
      expected: {
        where: "GitgraphAccDescrStatement at 42-53",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of info retyped as InfoAccDescrStatement",
      diagram: "info",
      fixture: "accdescr-block-empty",
      nodeType: "InfoAccDescrBlockStatement",
      range: [5, 16],
      replacementType: "InfoAccDescrStatement",
      expected: {
        where: "InfoAccDescrStatement at 5-16",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of journey retyped as JourneyAccDescrStatement",
      diagram: "journey",
      fixture: "gram-acc-descr-block-empty",
      nodeType: "JourneyAccDescrBlockStatement",
      range: [10, 21],
      replacementType: "JourneyAccDescrStatement",
      expected: {
        where: "JourneyAccDescrStatement at 10-21",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of packet retyped as PacketAccDescrStatement",
      diagram: "packet",
      fixture: "accdescr-block-repeat",
      nodeType: "PacketAccDescrBlockStatement",
      range: [43, 54],
      replacementType: "PacketAccDescrStatement",
      expected: {
        where: "PacketAccDescrStatement at 43-54",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of pie retyped as PieAccDescrStatement",
      diagram: "pie",
      fixture: "accdescr-empty-block-last",
      nodeType: "PieAccDescrBlockStatement",
      range: [20, 31],
      replacementType: "PieAccDescrStatement",
      expected: {
        where: "PieAccDescrStatement at 20-31",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of quadrant retyped as QuadrantAccDescrStatement",
      diagram: "quadrant",
      fixture: "db-acc-descr-block-empty",
      nodeType: "QuadrantAccDescrBlockStatement",
      range: [14, 26],
      replacementType: "QuadrantAccDescrStatement",
      expected: {
        where: "QuadrantAccDescrStatement at 14-26",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of radar retyped as RadarAccDescrStatement",
      diagram: "radar",
      fixture: "common-block-empty-interleaved",
      nodeType: "RadarAccDescrBlockStatement",
      range: [35, 46],
      replacementType: "RadarAccDescrStatement",
      expected: {
        where: "RadarAccDescrStatement at 35-46",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of railroad retyped as RailroadAccDescrStatement",
      diagram: "railroad",
      fixture: "abnf-common-repeat-empty",
      nodeType: "RailroadAccDescrBlockStatement",
      range: [79, 90],
      replacementType: "RailroadAccDescrStatement",
      expected: {
        where: "RailroadAccDescrStatement at 79-90",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of requirement retyped as RequirementAccDescrStatement",
      diagram: "requirement",
      fixture: "db-empty-description-block-keeps-acc-descr-block",
      nodeType: "RequirementAccDescrBlockStatement",
      range: [34, 47],
      replacementType: "RequirementAccDescrStatement",
      expected: {
        where: "RequirementAccDescrStatement at 34-47",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of sequence retyped as SequenceAccDescrStatement",
      diagram: "sequence",
      fixture: "db-acc-descr-block-comment-only-after-message",
      nodeType: "SequenceAccDescrBlockStatement",
      range: [25, 42],
      replacementType: "SequenceAccDescrStatement",
      expected: {
        where: "SequenceAccDescrStatement at 25-42",
        message: "has the field closed, which its type does not have",
      },
    },
    {
      name: "fails an empty description block of state retyped as StateAccDescrStatement",
      diagram: "state",
      fixture: "db-acc-descr-comment-block-keeps",
      nodeType: "StateAccDescrBlockStatement",
      range: [28, 45],
      replacementType: "StateAccDescrStatement",
      expected: {
        where: "StateAccDescrStatement at 28-45",
        message: "has the field closed, which its type does not have",
      },
    },
    {
      name: "fails an empty description block of timeline retyped as TimelineAccDescrStatement",
      diagram: "timeline",
      fixture: "db-acc-descr-block-braces-only",
      nodeType: "TimelineAccDescrBlockStatement",
      range: [11, 22],
      replacementType: "TimelineAccDescrStatement",
      expected: {
        where: "TimelineAccDescrStatement at 11-22",
        message: "the field value is null, not a node",
      },
    },
    {
      name: "fails an empty description block of treemap retyped as TreemapAccDescrStatement",
      diagram: "treemap",
      fixture: "common-block-comment-only",
      nodeType: "TreemapAccDescrBlockStatement",
      range: [8, 31],
      replacementType: "TreemapAccDescrStatement",
      expected: {
        where: "TreemapAccDescrStatement at 8-31",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of treeview retyped as TreeviewAccDescrStatement",
      diagram: "treeview",
      fixture: "ast-common-removal-only-values",
      nodeType: "TreeviewAccDescrBlockStatement",
      range: [83, 108],
      replacementType: "TreeviewAccDescrStatement",
      expected: {
        where: "TreeviewAccDescrStatement at 83-108",
        message: "has the field textBeforeOpen, which its type does not have",
      },
    },
    {
      name: "fails an empty description block of usecase retyped as UsecaseAccDescrStatement",
      diagram: "usecase",
      fixture: "db-accdescr-empty",
      nodeType: "UsecaseAccDescrBlockStatement",
      range: [30, 41],
      replacementType: "UsecaseAccDescrStatement",
      expected: {
        where: "UsecaseAccDescrStatement at 30-41",
        message:
          'the tokens that the node writes itself and its child nodes, in source order: ["accDescr","{","}"], not ["accDescr",":"]',
      },
    },
    {
      name: "fails an empty description block of wardley retyped as WardleyAccDescrStatement",
      diagram: "wardley",
      fixture: "common-empty-interleaved",
      nodeType: "WardleyAccDescrBlockStatement",
      range: [30, 41],
      replacementType: "WardleyAccDescrStatement",
      expected: {
        where: "WardleyAccDescrStatement at 30-41",
        message:
          'the common statement\'s fixed components: "accDescr{}", not "accDescr:"',
      },
    },
    {
      name: "fails an empty description block of xychart retyped as XychartAccDescrStatement",
      diagram: "xychart",
      fixture: "db-acc-descr-block-empty",
      nodeType: "XychartAccDescrBlockStatement",
      range: [14, 25],
      replacementType: "XychartAccDescrStatement",
      expected: {
        where: "XychartAccDescrStatement at 14-25",
        message: "has the field closed, which its type does not have",
      },
    },
  ] as const
  for (const testCase of emptyDescriptionTypeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "type", testCase.replacementType)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  it("fails an empty description block on a line of a requirement body retyped as RequirementAccDescrBlockStatement", () => {
    // ast.md, Diagram nodes: where no statement starts, the block is a
    // RequirementIgnoredText.
    const { input, tree } = recordedTree(
      "requirement",
      "gram-empty-description-block-in-body",
    )
    const broken = copyOf(tree)
    setField(
      firstNode(broken, "RequirementIgnoredText"),
      "type",
      "RequirementAccDescrBlockStatement",
    )
    expect(checkTree(input, broken)).toContainEqual({
      where: "RequirementAccDescrBlockStatement at 35-46",
      message: "the field value is string, not a node or null",
    })
  })

  it("fails an eventmodeling string closed at the first of its matching quotes", () => {
    // ast.md, StringLiteral: the lexical rules of eventmodeling close an inline
    // string at the last matching quote of its line. Ending the string at the
    // first one leaves the rest of the unit outside every token.
    const { input, tree } = recordedTree(
      "eventmodeling",
      "lex-inline-quote-greedy",
    )
    const broken = copyOf(tree)
    const string = firstNode(broken, "StringLiteral")
    setField(string, "range", [26, 31])
    setField(string, "loc", locationOf(input, [26, 31]))
    setField(string, "raw", '"one"')
    setField(string, "value", "one")
    const tokens = [...broken.tokens]
    tokens[5] = {
      ...tokens[5],
      value: '"one"',
      range: [26, 31],
      loc: locationOf(input, [26, 31]),
    }
    setField(broken, "tokens", tokens)
    expect(checkTree(input, broken)).toContainEqual({
      where: "StringLiteral at 26-31",
      message: "the string must be the complete greedy same-line inline unit",
    })
  })

  const quotedStringTypeCases = [
    {
      name: "reports gantt string-type (config-security-level-antiscript-click-call)",
      diagram: "gantt",
      fixture: "config-security-level-antiscript-click-call",
      nodeType: "StringLiteral",
      range: [65, 86],
      replacementType: "GanttLiteral",
      value: '"javascript:alert(1)"',
      expected: {
        where: "GanttLiteral at 65-86",
        message: "the URL is empty or not closed",
      },
    },
  ] as const
  for (const testCase of quotedStringTypeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      const before = { ...node }
      for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
      Object.assign(node, {
        type: testCase.replacementType,
        range: before.range,
        loc: before.loc,
        value: testCase.value,
      })
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const mismatchedQuoteCases = [
    {
      name: "reports architecture mismatched-single-quote (c4-component-icontext)",
      diagram: "architecture",
      fixture: "c4-component-icontext",
      nodeType: "StringLiteral",
      range: [30, 43],
      quoteOffset: 42,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 30-43",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports cynefin mismatched-single-quote (directive-every-field)",
      diagram: "cynefin",
      fixture: "directive-every-field",
      nodeType: "StringLiteral",
      range: [165, 183],
      quoteOffset: 182,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 165-183",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports eventmodeling mismatched-single-quote (data-all-types)",
      diagram: "eventmodeling",
      fixture: "data-all-types",
      nodeType: "StringLiteral",
      range: [117, 123],
      quoteOffset: 122,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 117-123",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports gitgraph mismatched-single-quote (db-compare-bare-and-quoted)",
      diagram: "gitgraph",
      fixture: "db-compare-bare-and-quoted",
      nodeType: "StringLiteral",
      range: [78, 87],
      quoteOffset: 86,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 78-87",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports packet mismatched-single-quote (db-label-single)",
      diagram: "packet",
      fixture: "db-label-single",
      nodeType: "StringLiteral",
      range: [9, 12],
      quoteOffset: 11,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 9-12",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports pie mismatched-single-quote (comment-label-single-line)",
      diagram: "pie",
      fixture: "comment-label-single-line",
      nodeType: "StringLiteral",
      range: [4, 19],
      quoteOffset: 18,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 4-19",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports radar mismatched-single-quote (comment-label)",
      diagram: "radar",
      fixture: "comment-label",
      nodeType: "StringLiteral",
      range: [35, 42],
      quoteOffset: 41,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 35-42",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports railroad mismatched-single-quote (ebnf-div-html-frontmatter-rule-single)",
      diagram: "railroad",
      fixture: "ebnf-div-html-frontmatter-rule-single",
      nodeType: "StringLiteral",
      range: [41, 49],
      quoteOffset: 48,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 41-49",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports treemap mismatched-single-quote (div-html-frontmatter-reverse)",
      diagram: "treemap",
      fixture: "div-html-frontmatter-reverse",
      nodeType: "StringLiteral",
      range: [26, 34],
      quoteOffset: 33,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 26-34",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports treeview mismatched-single-quote (box-quoted-tail-decoration-single-quoted)",
      diagram: "treeview",
      fixture: "box-quoted-tail-decoration-single-quoted",
      nodeType: "StringLiteral",
      range: [14, 20],
      quoteOffset: 19,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 14-20",
        message:
          "the name must be one complete first-priority bare or closed quoted unit",
      },
    },
    {
      name: "reports wardley mismatched-single-quote (c4-component-flow-label)",
      diagram: "wardley",
      fixture: "c4-component-flow-label",
      nodeType: "StringLiteral",
      range: [16, 29],
      quoteOffset: 28,
      quote: '"',
      valueOwners: [
        {
          type: "WardleyArrow",
          range: [15, 30],
        },
      ],
      expected: {
        where: "StringLiteral at 16-29",
        message: "closed: true, not false",
      },
    },
    {
      name: "reports usecase mismatched-single-quote (lex-native-single-quote-comment-region-control)",
      diagram: "usecase",
      fixture: "lex-native-single-quote-comment-region-control",
      nodeType: "StringLiteral",
      range: [27, 39],
      quoteOffset: 38,
      quote: '"',
      valueOwners: [],
      expected: {
        where: "StringLiteral at 27-39",
        message: "closed: true, not false",
      },
    },
  ] as const
  for (const testCase of mismatchedQuoteCases) {
    it(testCase.name, () => {
      const recorded = recordedTree(testCase.diagram, testCase.fixture)
      const tree = recorded.tree
      const input =
        recorded.input.slice(0, testCase.quoteOffset) +
        testCase.quote +
        recorded.input.slice(testCase.quoteOffset + 1)
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      for (const token of tree.tokens)
        setField(token, "value", input.slice(...token.range))
      for (const owner of testCase.valueOwners) {
        const valueOwner = nodesOf(tree).find(
          (candidate) =>
            candidate.type === owner.type &&
            candidate.range[0] === owner.range[0] &&
            candidate.range[1] === owner.range[1],
        )!
        setField(valueOwner, "value", input.slice(...valueOwner.range))
      }
      setField(node, "raw", input.slice(...node.range))
      expect(checkTree(input, tree)).toContainEqual(testCase.expected)
    })
  }

  const earlierQuoteCases = [
    {
      name: "reports agentflow earlier-matching-quote (config-other-all-texts)",
      diagram: "agentflow",
      fixture: "config-other-all-texts",
      nodeType: "StringLiteral",
      range: [156, 177],
      quoteOffset: 157,
      quote: '"',
      valueRange: [157, 176],
      expected: {
        where: "StringLiteral at 156-177",
        message:
          "its string cannot be read: graph Db: a string with 0 runs of content",
      },
    },
    {
      name: "reports architecture earlier-matching-quote (c4-component-icontext)",
      diagram: "architecture",
      fixture: "c4-component-icontext",
      nodeType: "StringLiteral",
      range: [30, 43],
      quoteOffset: 31,
      quote: "'",
      valueRange: [31, 42],
      expected: {
        where: "StringLiteral at 30-43",
        message: "the value is not a complete closed STRING lexical unit",
      },
    },
    {
      name: "reports block earlier-matching-quote (config-flowchart-html-labels-false)",
      diagram: "block",
      fixture: "config-flowchart-html-labels-false",
      nodeType: "StringLiteral",
      range: [15, 36],
      quoteOffset: 16,
      quote: '"',
      valueRange: [16, 35],
      expected: {
        where: "StringLiteral at 15-36",
        message:
          "the label is not a closed nonempty string without markdown or inner quotes",
      },
    },
    {
      name: "reports c4 earlier-matching-quote (config-security-level-other)",
      diagram: "c4",
      fixture: "config-security-level-other",
      nodeType: "StringLiteral",
      range: [70, 88],
      quoteOffset: 71,
      quote: '"',
      valueRange: [71, 87],
      expected: {
        where: "StringLiteral at 70-88",
        message: "the string is not a double-quoted C4 argument",
      },
    },
    {
      name: "reports cynefin earlier-matching-quote (c4-component-item)",
      diagram: "cynefin",
      fixture: "c4-component-item",
      nodeType: "StringLiteral",
      range: [21, 34],
      quoteOffset: 22,
      quote: '"',
      valueRange: [22, 33],
      expected: {
        where: "StringLiteral at 21-34",
        message: "the value is not a complete closed STRING lexical unit",
      },
    },
    {
      name: "reports flowchart earlier-matching-quote (click-callback-tooltip)",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      nodeType: "StringLiteral",
      range: [42, 57],
      quoteOffset: 43,
      quote: '"',
      valueRange: [43, 56],
      expected: {
        where: "StringLiteral at 42-57",
        message:
          "its string cannot be read: graph Db: a string with 0 runs of content",
      },
    },
    {
      name: "reports gitgraph earlier-matching-quote (comment-bare-string)",
      diagram: "gitgraph",
      fixture: "comment-bare-string",
      nodeType: "StringLiteral",
      range: [20, 28],
      quoteOffset: 21,
      quote: '"',
      valueRange: [21, 27],
      expected: {
        where: "StringLiteral at 20-28",
        message: "the value is not a complete closed STRING lexical unit",
      },
    },
    {
      name: "reports packet earlier-matching-quote (c4-hidden-suffix-lf)",
      diagram: "packet",
      fixture: "c4-hidden-suffix-lf",
      nodeType: "StringLiteral",
      range: [9, 12],
      quoteOffset: 10,
      quote: '"',
      valueRange: [10, 11],
      expected: {
        where: "StringLiteral at 9-12",
        message: "the value is not a complete closed STRING lexical unit",
      },
    },
    {
      name: "reports pie earlier-matching-quote (accdescr-blank-gap)",
      diagram: "pie",
      fixture: "accdescr-blank-gap",
      nodeType: "StringLiteral",
      range: [15, 18],
      quoteOffset: 16,
      quote: '"',
      valueRange: [16, 17],
      expected: {
        where: "StringLiteral at 15-18",
        message: "the label is not a closed STRING lexical unit",
      },
    },
    {
      name: "reports radar earlier-matching-quote (c4-component-axis-label)",
      diagram: "radar",
      fixture: "c4-component-axis-label",
      nodeType: "StringLiteral",
      range: [18, 31],
      quoteOffset: 19,
      quote: '"',
      valueRange: [19, 30],
      expected: {
        where: "StringLiteral at 18-31",
        message: "the value is not a complete closed STRING lexical unit",
      },
    },
    {
      name: "reports railroad earlier-matching-quote (abnf-bare-unicode)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      nodeType: "StringLiteral",
      range: [27, 30],
      quoteOffset: 28,
      quote: '"',
      valueRange: [28, 29],
      expected: {
        where: "StringLiteral at 27-30",
        message: "the string is not a complete first-match lexical unit",
      },
    },
    {
      name: "reports sankey earlier-matching-quote (config-security-level-other-title-and-ids)",
      diagram: "sankey",
      fixture: "config-security-level-other-title-and-ids",
      nodeType: "StringLiteral",
      range: [70, 91],
      quoteOffset: 71,
      quote: '"',
      valueRange: [71, 90],
      expected: {
        where: "StringLiteral at 70-91",
        message:
          'the string "\\"<i>z</i> &amp; <u>" holds a `"` that is not in a pair of `"`, which would close it',
      },
    },
    {
      name: "reports treeview earlier-matching-quote (annotation-comment-gap)",
      diagram: "treeview",
      fixture: "annotation-comment-gap",
      nodeType: "StringLiteral",
      range: [14, 20],
      quoteOffset: 15,
      quote: '"',
      valueRange: [15, 19],
      expected: {
        where: "StringLiteral at 14-20",
        message:
          "the name must be one complete first-priority bare or closed quoted unit",
      },
    },
    {
      name: "reports usecase earlier-matching-quote (db-actor-variants)",
      diagram: "usecase",
      fixture: "db-actor-variants",
      nodeType: "StringLiteral",
      range: [149, 158],
      quoteOffset: 150,
      quote: '"',
      valueRange: [150, 157],
      expected: {
        where: "StringLiteral at 149-158",
        message: "the native string must be one closed plain-string unit",
      },
    },
    {
      name: "reports venn earlier-matching-quote (config-security-other)",
      diagram: "venn",
      fixture: "config-security-other",
      nodeType: "StringLiteral",
      range: [37, 47],
      quoteOffset: 38,
      quote: '"',
      valueRange: [38, 46],
      expected: {
        where: "StringLiteral at 37-47",
        message: "the string is not a closed double-quoted Venn string",
      },
    },
    {
      name: "reports wardley earlier-matching-quote (c4-component-accelerator)",
      diagram: "wardley",
      fixture: "c4-component-accelerator",
      nodeType: "StringLiteral",
      range: [25, 38],
      quoteOffset: 26,
      quote: '"',
      valueRange: [26, 37],
      expected: {
        where: "StringLiteral at 25-38",
        message:
          "the string is not one complete closed lexical value in its authored role",
      },
    },
    {
      name: "reports xychart earlier-matching-quote (config-security-level-loose-all)",
      diagram: "xychart",
      fixture: "config-security-level-loose-all",
      nodeType: "StringLiteral",
      range: [20, 31],
      quoteOffset: 21,
      quote: '"',
      valueRange: [21, 30],
      expected: {
        where: "StringLiteral at 20-31",
        message: 'the string "\\"<b>x</b>" holds a `"`, which would close it',
      },
    },
  ] as const
  for (const testCase of earlierQuoteCases) {
    it(testCase.name, () => {
      const recorded = recordedTree(testCase.diagram, testCase.fixture)
      const tree = recorded.tree
      const input =
        recorded.input.slice(0, testCase.quoteOffset) +
        testCase.quote +
        recorded.input.slice(testCase.quoteOffset + 1)
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      for (const token of tree.tokens)
        setField(token, "value", input.slice(...token.range))
      setField(node, "raw", input.slice(...node.range))
      setField(node, "value", input.slice(...testCase.valueRange))
      expect(checkTree(input, tree)).toContainEqual(testCase.expected)
    })
  }

  const recordBodyCases = [
    {
      name: "reports a Directive record held as the Root.body child",
      fixture: "error-directive-adjacent",
      record: (tree: CheckedRoot) => tree.directives[0],
      expected: {
        where: "Root.body",
        message: "the body type Directive is no diagram of the specification",
      },
    },
    {
      name: "reports a Frontmatter record held as the Root.body child",
      fixture: "frontmatter-yaml-error",
      record: (tree: CheckedRoot) => tree.frontmatter,
      expected: {
        where: "Root.body",
        message: "the body type Frontmatter is no diagram of the specification",
      },
    },
  ] as const
  for (const testCase of recordBodyCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree("common", testCase.fixture)
      setField(tree, "body", testCase.record(tree))
      expect(checkTree(input, tree)).toContainEqual(testCase.expected)
    })
  }

  const names = [
    {
      name: "reports block whitespace-permitting name position represented by Identifier",
      diagram: "block",
      fixture: "db-class-apply-constructor-class",
      type: "BlockClassStatement",
      field: "cssClass",
      expected: {
        where: "BlockClassStatement at 17-36",
        message: "the field cssClass holds a Identifier, not a BlockLiteral",
      },
    },
    {
      name: "reports agentflow whitespace-permitting name position represented by Identifier",
      diagram: "agentflow",
      fixture: "entity-callback-arguments",
      type: "AgentflowClickCallbackStatement",
      field: "callback",
      expected: {
        where: "Identifier at 33-35",
        message: "the callback kind must follow its bare or call spelling",
      },
    },
    {
      name: "reports timeline whitespace-permitting name position represented by Identifier",
      diagram: "timeline",
      fixture: "db-section-statement",
      type: "TimelineSectionStatement",
      field: "name",
      expected: {
        where: "TimelineSectionStatement at 11-20",
        message: "the field name holds a Identifier, not a TimelineLiteral",
      },
    },
    {
      name: "reports c4 whitespace-permitting name position represented by Identifier",
      diagram: "c4",
      fixture: "spec-c4-named-attributes-bd7f9fb7",
      type: "C4NamedAttribute",
      field: "key",
      expected: {
        where: "C4NamedAttribute at 34-43",
        message: "the field key holds a Identifier, not a C4Literal",
      },
    },
  ] as const
  for (const testCase of names) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const node = firstNode(tree, testCase.type)[testCase.field] as CheckedNode
      const before = { ...node }
      for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
      Object.assign(node, {
        type: "Identifier",
        name: before.value,
        range: before.range,
        loc: before.loc,
      })
      expect(checkTree(input, tree)).toContainEqual(testCase.expected)
    })
  }

  it("reports a one-segment eventmodeling qualified name represented by Identifier", () => {
    const { input, tree } = recordedTree("eventmodeling", "db-qualified-names")
    const node = firstNode(tree, "EventmodelingQualifiedName")
    const before = { ...node }
    for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
    Object.assign(node, {
      type: "Identifier",
      name: (before.head as CheckedNode).name,
      range: before.range,
      loc: before.loc,
    })
    expect(checkTree(input, tree)).toEqual([
      {
        where: "EventmodelingTimeFrameStatement at 14-25",
        message:
          "the field entityIdentifier holds a Identifier, not a EventmodelingQualifiedName",
      },
    ])
  })

  it("reports a digit-only Treeview icon name represented by NumericLiteral", () => {
    const recorded = recordedTree("treeview", "annotation-icon-underscore")
    const tree = recorded.tree
    const node = firstNode(tree, "Identifier")
    const input = `${recorded.input.slice(0, node.range[0])}12345${recorded.input.slice(node.range[1])}`
    setField(node, "name", "12345")
    for (const token of tree.tokens)
      setField(token, "value", input.slice(...token.range))
    // diagrams/treeview.md, Annotations, permits ASCII word characters, including digits, in an icon reference.
    expect(checkTree(input, tree)).toEqual([])
    const before = { ...node }
    for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
    Object.assign(node, {
      type: "NumericLiteral",
      value: 12345,
      raw: "12345",
      range: before.range,
      loc: before.loc,
    })
    expect(checkTree(input, tree)).toContainEqual({
      where: "TreeviewIconAnnotation at 19-30",
      message: "the field name holds a NumericLiteral, not a Identifier",
    })
  })
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

describe("checkTree: the diagram ids named by ast.md, Diagram nodes", () => {
  const cases: readonly {
    readonly name: string
    readonly diagram: DiagramType
    readonly fixture: string
    readonly expected: string
  }[] = [
    {
      name: "reports flowchart/spec-flow-singlenode-a5fa3415 with another diagram type",
      diagram: "flowchart",
      fixture: "spec-flow-singlenode-a5fa3415",
      expected:
        "the diagram type error is not one of those of a FlowchartDiagram: flowchart-v2, flowchart-elk, swimlane",
    },
    {
      name: "reports flowchart/demo-flowchart-elk-dd7d446d with another diagram type",
      diagram: "flowchart",
      fixture: "demo-flowchart-elk-dd7d446d",
      expected:
        "the diagram type error is not one of those of a FlowchartDiagram: flowchart-v2, flowchart-elk, swimlane",
    },
    {
      name: "reports flowchart/spec-flow-92e675d0 with another diagram type",
      diagram: "flowchart",
      fixture: "spec-flow-92e675d0",
      expected:
        "the diagram type error is not one of those of a FlowchartDiagram: flowchart-v2, flowchart-elk, swimlane",
    },
    {
      name: "reports sequence/db-message-activate-target with another diagram type",
      diagram: "sequence",
      fixture: "db-message-activate-target",
      expected:
        "the diagram type error is not one of those of a SequenceDiagram: sequence",
    },
    {
      name: "reports class/header-v2 with another diagram type",
      diagram: "class",
      fixture: "header-v2",
      expected:
        "the diagram type error is not one of those of a ClassDiagram: classDiagram",
    },
    {
      name: "reports state/header-only with another diagram type",
      diagram: "state",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a StateDiagram: stateDiagram",
    },
    {
      name: "reports er/header-only with another diagram type",
      diagram: "er",
      fixture: "header-only",
      expected: "the diagram type error is not one of those of a ErDiagram: er",
    },
    {
      name: "reports gantt/header-only with another diagram type",
      diagram: "gantt",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a GanttDiagram: gantt",
    },
    {
      name: "reports journey/header-only with another diagram type",
      diagram: "journey",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a JourneyDiagram: journey",
    },
    {
      name: "reports requirement/header-only with another diagram type",
      diagram: "requirement",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a RequirementDiagram: requirement",
    },
    {
      name: "reports mindmap/header-root-at-end with another diagram type",
      diagram: "mindmap",
      fixture: "header-root-at-end",
      expected:
        "the diagram type error is not one of those of a MindmapDiagram: mindmap",
    },
    {
      name: "reports timeline/header-without-line-feed with another diagram type",
      diagram: "timeline",
      fixture: "header-without-line-feed",
      expected:
        "the diagram type error is not one of those of a TimelineDiagram: timeline",
    },
    {
      name: "reports sankey/header-after-blank-lines with another diagram type",
      diagram: "sankey",
      fixture: "header-after-blank-lines",
      expected:
        "the diagram type error is not one of those of a SankeyDiagram: sankey",
    },
    {
      name: "reports xychart/header-without-line-feed with another diagram type",
      diagram: "xychart",
      fixture: "header-without-line-feed",
      expected:
        "the diagram type error is not one of those of a XychartDiagram: xychart",
    },
    {
      name: "reports quadrant/header-trailing-spaces with another diagram type",
      diagram: "quadrant",
      fixture: "header-trailing-spaces",
      expected:
        "the diagram type error is not one of those of a QuadrantDiagram: quadrantChart",
    },
    {
      name: "reports block/header-block with another diagram type",
      diagram: "block",
      fixture: "header-block",
      expected:
        "the diagram type error is not one of those of a BlockDiagram: block",
    },
    {
      name: "reports kanban/header-header-space-only with another diagram type",
      diagram: "kanban",
      fixture: "header-header-space-only",
      expected:
        "the diagram type error is not one of those of a KanbanDiagram: kanban",
    },
    {
      name: "reports venn/header-statement-on-line with another diagram type",
      diagram: "venn",
      fixture: "header-statement-on-line",
      expected:
        "the diagram type error is not one of those of a VennDiagram: venn",
    },
    {
      name: "reports ishikawa/header-only-lf with another diagram type",
      diagram: "ishikawa",
      fixture: "header-only-lf",
      expected:
        "the diagram type error is not one of those of a IshikawaDiagram: ishikawa",
    },
    {
      name: "reports agentflow/header-only with another diagram type",
      diagram: "agentflow",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a AgentflowDiagram: agentflow",
    },
    {
      name: "reports usecase/header-lf with another diagram type",
      diagram: "usecase",
      fixture: "header-lf",
      expected:
        "the diagram type error is not one of those of a UsecaseDiagram: usecase",
    },
    {
      name: "reports pie/header-only with another diagram type",
      diagram: "pie",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a PieDiagram: pie",
    },
    {
      name: "reports gitgraph/header-only with another diagram type",
      diagram: "gitgraph",
      fixture: "header-only",
      expected:
        "the diagram type error is not one of those of a GitgraphDiagram: gitGraph",
    },
    {
      name: "reports info/header-lf with another diagram type",
      diagram: "info",
      fixture: "header-lf",
      expected:
        "the diagram type error is not one of those of a InfoDiagram: info",
    },
    {
      name: "reports packet/gram-mixed with another diagram type",
      diagram: "packet",
      fixture: "gram-mixed",
      expected:
        "the diagram type error is not one of those of a PacketDiagram: packet",
    },
    {
      name: "reports architecture/header-beta with another diagram type",
      diagram: "architecture",
      fixture: "header-beta",
      expected:
        "the diagram type error is not one of those of a ArchitectureDiagram: architecture",
    },
    {
      name: "reports radar/gram-written-tree with another diagram type",
      diagram: "radar",
      fixture: "gram-written-tree",
      expected:
        "the diagram type error is not one of those of a RadarDiagram: radar",
    },
    {
      name: "reports treemap/gram-written-tree with another diagram type",
      diagram: "treemap",
      fixture: "gram-written-tree",
      expected:
        "the diagram type error is not one of those of a TreemapDiagram: treemap",
    },
    {
      name: "reports wardley/db-all-fields with another diagram type",
      diagram: "wardley",
      fixture: "db-all-fields",
      expected:
        "the diagram type error is not one of those of a WardleyDiagram: wardley",
    },
    {
      name: "reports cynefin/db-all-fields with another diagram type",
      diagram: "cynefin",
      fixture: "db-all-fields",
      expected:
        "the diagram type error is not one of those of a CynefinDiagram: cynefin",
    },
    {
      name: "reports treeview/gram-written-tree with another diagram type",
      diagram: "treeview",
      fixture: "gram-written-tree",
      expected:
        "the diagram type error is not one of those of a TreeviewDiagram: treeView",
    },
  ]
  for (const testCase of cases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      setField(tree, "diagramType", "error")
      expect(checkTree(input, tree)).toEqual([
        { where: "Root", message: testCase.expected },
      ])
    })
  }
})

describe("checkTree: authored nodes named by ast.md, Diagram nodes", () => {
  const cases: readonly (MutationCase & { readonly diagram: DiagramType })[] = [
    {
      name: "reports a railroad IR header recorded with another railroad diagram type",
      diagram: "railroad",
      fixture: "ir-gram-written-tree",
      mutate: (tree) => {
        setField(tree, "diagramType", "railroadPeg")
      },
      expected:
        "RailroadDiagram at 0-250: the diagram owns exactly its dialect's complete lowercase header",
    },
    {
      name: "reports a Cynefin name domain word represented by a node",
      diagram: "cynefin",
      fixture: "db-all-fields",
      mutate: (tree) => {
        setField(firstNode(tree, "CynefinDomainStatement"), "name", {
          type: "Identifier",
          name: "complex",
          range: [0, 1],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      },
      expected:
        "CynefinDomainStatement at 50-75: the field name is object, not string",
    },
    {
      name: "reports a Cynefin from domain word represented by a node",
      diagram: "cynefin",
      fixture: "db-all-fields",
      mutate: (tree) => {
        setField(firstNode(tree, "CynefinTransitionStatement"), "from", {
          type: "Identifier",
          name: "complex",
          range: [0, 1],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      },
      expected:
        "CynefinTransitionStatement at 130-162: the field from is object, not string",
    },
    {
      name: "reports a Cynefin to domain word represented by a node",
      diagram: "cynefin",
      fixture: "db-all-fields",
      mutate: (tree) => {
        setField(firstNode(tree, "CynefinTransitionStatement"), "to", {
          type: "Identifier",
          name: "complex",
          range: [0, 1],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      },
      expected:
        "CynefinTransitionStatement at 130-162: the field to is object, not string",
    },
    {
      name: "reports an authored eventmodeling inline data tag omitted from the tree",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate: (tree) => {
        setField(firstNode(tree, "EventmodelingInlineData"), "dataType", null)
      },
      expected:
        'EventmodelingInlineData at 72-81: the written dataType: null, not "json"',
    },
    {
      name: "reports a Treeview box prefix that rewrites its authored drawing",
      diagram: "treeview",
      fixture: "box-written-tree",
      mutate: (tree) => {
        setField(firstNode(tree, "TreeviewBranchPrefix"), "value", "   ")
      },
      expected:
        'TreeviewBranchPrefix at 20-23: value is not its written text: "   ", not "├──"',
    },
    {
      name: "reports a Treeview decoration that rewrites its authored drawing",
      diagram: "treeview",
      fixture: "box-written-tree",
      mutate: (tree) => {
        setField(firstNode(tree, "TreeviewIgnoredText"), "value", " ")
      },
      expected:
        'TreeviewIgnoredText at 59-60: value is not its written text: " ", not "│"',
    },
  ]
  for (const testCase of cases) {
    it(testCase.name, () => {
      const { base, mutated } = problemsOf(testCase.diagram, testCase)
      expect(base).toEqual([])
      expect(
        mutated
          .map((problem) => `${problem.where}: ${problem.message}`)
          .join("\n"),
      ).toContain(testCase.expected)
    })
  }
})

describe("checkTree: digit-string names use Identifier (ast.md, Diagram nodes)", () => {
  const cases: readonly {
    readonly name: string
    readonly diagram: DiagramType
    readonly fixture: string
    readonly written: string
    readonly expected: string
  }[] = [
    {
      name: "reports agentflow digit-string Identifier replaced by NumericLiteral (gram-id-numbers-unicode)",
      diagram: "agentflow",
      fixture: "gram-id-numbers-unicode",
      written: "123",
      expected: "the field id holds a NumericLiteral, not a Identifier",
    },
    {
      name: "reports architecture digit-string Identifier replaced by NumericLiteral (lex-id-numeric)",
      diagram: "architecture",
      fixture: "lex-id-numeric",
      written: "12",
      expected: "the field id holds a NumericLiteral, not a Identifier",
    },
    {
      name: "reports block digit-string Identifier replaced by NumericLiteral (db-class-def-digits)",
      diagram: "block",
      fixture: "db-class-def-digits",
      written: "1",
      expected: "the field name holds a NumericLiteral, not a Identifier",
    },
    {
      name: "reports quadrant digit-string Identifier replaced by NumericLiteral (db-class-digits)",
      diagram: "quadrant",
      fixture: "db-class-digits",
      written: "1",
      expected: "the field className holds a NumericLiteral, not a Identifier",
    },
    {
      name: "reports usecase digit-string Identifier replaced by NumericLiteral (gram-metadata-number-icon)",
      diagram: "usecase",
      fixture: "gram-metadata-number-icon",
      written: "1",
      expected:
        "the field value holds a NumericLiteral, not a Identifier or StringLiteral",
    },
  ]
  for (const testCase of cases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === "Identifier" &&
          candidate.name === testCase.written,
      )!
      setField(node, "type", "NumericLiteral")
      setField(node, "value", Number(testCase.written))
      setField(node, "raw", testCase.written)
      Reflect.deleteProperty(node, "name")
      expect(
        checkTree(input, tree).map((problem) => problem.message),
      ).toContain(testCase.expected)
    })
  }
})

// ast.md, Nodes: leaf values, literal raw text, and whitespace outside a node.
describe("checkTree: written values in each diagram", () => {
  const surroundingWhitespaceCases = [
    {
      name: "reports agentflow node range including surrounding whitespace (directive-before-header)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeIndex: 1,
      nodeType: "AgentflowDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [47, 78],
    },
    {
      name: "reports architecture node range including surrounding whitespace (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeIndex: 2,
      nodeType: "ArchitectureAccTitleStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [17, 35],
    },
    {
      name: "reports block node range including surrounding whitespace (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeIndex: 2,
      nodeType: "BlockCompositeStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [12, 42],
    },
    {
      name: "reports c4 node range including surrounding whitespace (db-grid-empty-header-line)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeIndex: 2,
      nodeType: "C4ElementStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [10, 25],
    },
    {
      name: "reports class node range including surrounding whitespace (div-comment-after-header)",
      diagram: "class",
      fixture: "div-comment-after-header",
      nodeIndex: 2,
      nodeType: "ClassDeclaration",
      expected: "does not run from the start of a token to the end of a token",
      range: [23, 36],
    },
    {
      name: "reports cynefin node range including surrounding whitespace (comment-header)",
      diagram: "cynefin",
      fixture: "comment-header",
      nodeIndex: 2,
      nodeType: "CynefinDomainStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [23, 35],
    },
    {
      name: "reports er node range including surrounding whitespace (demo-error-f7bc02f0)",
      diagram: "er",
      fixture: "demo-error-f7bc02f0",
      nodeIndex: 2,
      nodeType: "ErRelationshipStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [9, 63],
    },
    {
      name: "reports eventmodeling node range including surrounding whitespace (comment-header)",
      diagram: "eventmodeling",
      fixture: "comment-header",
      nodeIndex: 2,
      nodeType: "EventmodelingTimeFrameStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [24, 36],
    },
    {
      name: "reports flowchart node range including surrounding whitespace (lex-directive-after-arrow)",
      diagram: "flowchart",
      fixture: "lex-directive-after-arrow",
      nodeIndex: 2,
      nodeType: "FlowchartVertexStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [12, 35],
    },
    {
      name: "reports gantt node range including surrounding whitespace (div-percent-brace-glued-after-header)",
      diagram: "gantt",
      fixture: "div-percent-brace-glued-after-header",
      nodeIndex: 2,
      nodeType: "GanttTitleStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [12, 20],
    },
    {
      name: "reports gitgraph node range including surrounding whitespace (comment-bare-before-header)",
      diagram: "gitgraph",
      fixture: "comment-bare-before-header",
      nodeIndex: 1,
      nodeType: "GitgraphDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [2, 11],
    },
    {
      name: "reports info node range including surrounding whitespace (bare-before-header-space)",
      diagram: "info",
      fixture: "bare-before-header-space",
      nodeIndex: 1,
      nodeType: "InfoDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [3, 8],
    },
    {
      name: "reports ishikawa node range including surrounding whitespace (comment-header-glued)",
      diagram: "ishikawa",
      fixture: "comment-header-glued",
      nodeIndex: 2,
      nodeType: "IshikawaNode",
      expected: "does not run from the start of a token to the end of a token",
      range: [15, 17],
    },
    {
      name: "reports journey node range including surrounding whitespace (gram-empty-description-block-after-header)",
      diagram: "journey",
      fixture: "gram-empty-description-block-after-header",
      nodeIndex: 2,
      nodeType: "JourneyAccDescrBlockStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [7, 19],
    },
    {
      name: "reports kanban node range including surrounding whitespace (db-frontmatter-after-header)",
      diagram: "kanban",
      fixture: "db-frontmatter-after-header",
      nodeIndex: 2,
      nodeType: "KanbanNode",
      expected: "does not run from the start of a token to the end of a token",
      range: [6, 10],
    },
    {
      name: "reports mindmap node range including surrounding whitespace (db-blank-line-after-header)",
      diagram: "mindmap",
      fixture: "db-blank-line-after-header",
      nodeIndex: 2,
      nodeType: "MindmapNode",
      expected: "does not run from the start of a token to the end of a token",
      range: [10, 15],
    },
    {
      name: "reports packet node range including surrounding whitespace (gram-mixed)",
      diagram: "packet",
      fixture: "gram-mixed",
      nodeIndex: 2,
      nodeType: "PacketRelativeBlockStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [6, 15],
    },
    {
      name: "reports pie node range including surrounding whitespace (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeIndex: 1,
      nodeType: "PieDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [10, 20],
    },
    {
      name: "reports quadrant node range including surrounding whitespace (db-block-on-header-line)",
      diagram: "quadrant",
      fixture: "db-block-on-header-line",
      nodeIndex: 2,
      nodeType: "QuadrantAccDescrBlockStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [13, 26],
    },
    {
      name: "reports radar node range including surrounding whitespace (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeIndex: 2,
      nodeType: "RadarAxisStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [11, 30],
    },
    {
      name: "reports railroad node range including surrounding whitespace (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeIndex: 2,
      nodeType: "RailroadTitleStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [18, 33],
    },
    {
      name: "reports requirement node range including surrounding whitespace (header-after-bare-percent-line-and-whitespace-line)",
      diagram: "requirement",
      fixture: "header-after-bare-percent-line-and-whitespace-line",
      nodeIndex: 1,
      nodeType: "RequirementDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [5, 42],
    },
    {
      name: "reports sankey node range including surrounding whitespace (db-header-beta-upper-case)",
      diagram: "sankey",
      fixture: "db-header-beta-upper-case",
      nodeIndex: 2,
      nodeType: "SankeyLinkStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [11, 17],
    },
    {
      name: "reports sequence node range including surrounding whitespace (header-after-bare-percent-cr)",
      diagram: "sequence",
      fixture: "header-after-bare-percent-cr",
      nodeIndex: 1,
      nodeType: "SequenceDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [2, 27],
    },
    {
      name: "reports state node range including surrounding whitespace (header-after-bare-percent-line)",
      diagram: "state",
      fixture: "header-after-bare-percent-line",
      nodeIndex: 1,
      nodeType: "StateDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [2, 28],
    },
    {
      name: "reports timeline node range including surrounding whitespace (db-comment-hash-between-header-and-first-line)",
      diagram: "timeline",
      fixture: "db-comment-hash-between-header-and-first-line",
      nodeIndex: 2,
      nodeType: "TimelinePeriodStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [14, 16],
    },
    {
      name: "reports treemap node range including surrounding whitespace (gram-written-tree)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      nodeIndex: 2,
      nodeType: "TreemapTitleStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [12, 22],
    },
    {
      name: "reports treeview node range including surrounding whitespace (detect-no-bare-unicode-before-header)",
      diagram: "treeview",
      fixture: "detect-no-bare-unicode-before-header",
      nodeIndex: 1,
      nodeType: "TreeviewDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [1, 20],
    },
    {
      name: "reports usecase node range including surrounding whitespace (directive-after-header)",
      diagram: "usecase",
      fixture: "directive-after-header",
      nodeIndex: 2,
      nodeType: "UsecaseEntityStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [26, 28],
    },
    {
      name: "reports venn node range including surrounding whitespace (db-grid-comment-header-line)",
      diagram: "venn",
      fixture: "db-grid-comment-header-line",
      nodeIndex: 2,
      nodeType: "VennIgnoredText",
      expected: "does not run from the start of a token to the end of a token",
      range: [9, 11],
    },
    {
      name: "reports wardley node range including surrounding whitespace (comment-header)",
      diagram: "wardley",
      fixture: "comment-header",
      nodeIndex: 2,
      nodeType: "WardleyComponentStatement",
      expected: "does not run from the start of a token to the end of a token",
      range: [23, 45],
    },
    {
      name: "reports xychart node range including surrounding whitespace (config-orientation-frontmatter-header-wins)",
      diagram: "xychart",
      fixture: "config-orientation-frontmatter-header-wins",
      nodeIndex: 1,
      nodeType: "XychartDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [59, 91],
    },
    {
      name: "reports error node range including surrounding whitespace (config-init-detection-rejects)",
      diagram: "common",
      fixture: "config-init-detection-rejects",
      nodeIndex: 1,
      nodeType: "ErrorDiagram",
      expected: "does not run from the start of a token to the end of a token",
      range: [14, 20],
    },
  ] as const
  for (const testCase of surroundingWhitespaceCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken)[testCase.nodeIndex]
      expect(node.type).toBe(testCase.nodeType)
      setField(node, "range", testCase.range)
      setField(node, "loc", locationOf(input, node.range))
      expect(
        checkTree(input, broken).map((problem) => problem.message),
      ).toContain(testCase.expected)
    })
  }

  const writtenFieldCases = [
    {
      name: "reports agentflow leaf value differing from its written text (directive-before-header)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeIndex: 4,
      nodeType: "AgentflowLabel",
      field: "value",
      value: "FZ",
      expected: 'value is not its written text: "FZ", not "F"',
    },
    {
      name: "reports agentflow NumericLiteral value differing from its written number (db-all-fields)",
      diagram: "agentflow",
      fixture: "db-all-fields",
      nodeIndex: 47,
      nodeType: "NumericLiteral",
      field: "value",
      value: 1,
      expected:
        "value is not the number that its written text writes: 1, not 0",
    },
    {
      name: "reports agentflow Identifier name differing from its units joined (directive-before-header)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeIndex: 8,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports agentflow delimited value losing inner whitespace (spec-agentflow-yaml-error-position-31aff8fe)",
      diagram: "agentflow",
      fixture: "spec-agentflow-yaml-error-position-31aff8fe",
      nodeIndex: 8,
      nodeType: "AgentflowDataBlock",
      field: "value",
      value: "shape: rounded",
      expected:
        'value is not its written text: "shape: rounded", not " shape: rounded "',
    },
    {
      name: "reports agentflow StringLiteral raw differing from complete source (config-other-all-texts)",
      diagram: "agentflow",
      fixture: "config-other-all-texts",
      nodeIndex: 28,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zhttps://example.com"',
      expected:
        'raw: "\\"Zhttps://example.com\\"", not "\\"https://example.com\\""',
    },
    {
      name: "reports agentflow NumericLiteral raw differing from complete source (db-all-fields)",
      diagram: "agentflow",
      fixture: "db-all-fields",
      nodeIndex: 47,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "0Z",
      expected: 'raw: "0Z", not "0"',
    },
    {
      name: "reports architecture leaf value differing from its written text (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeIndex: 3,
      nodeType: "ArchitectureLiteral",
      field: "value",
      value: " NetworkZ",
      expected: 'value is not its written text: " NetworkZ", not " Network"',
    },
    {
      name: "reports architecture Identifier name differing from its units joined (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeIndex: 7,
      nodeType: "Identifier",
      field: "name",
      value: "crossZ",
      expected:
        'name is not the texts of its tokens joined: "crossZ", not "cross"',
    },
    {
      name: "reports architecture delimited value losing inner whitespace (space-unicode-values)",
      diagram: "architecture",
      fixture: "space-unicode-values",
      nodeIndex: 11,
      nodeType: "StringLiteral",
      field: "value",
      value: "I",
      expected: 'value is not its written text: "I", not "\ufeffI\u00a0\u3000"',
    },
    {
      name: "reports architecture StringLiteral raw differing from complete source (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeIndex: 11,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZAPI\\nnode"',
      expected: 'raw: "\\"ZAPI\\\\nnode\\"", not "\\"API\\\\nnode\\""',
    },
    {
      name: "reports block leaf value differing from its written text (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeIndex: 5,
      nodeType: "Identifier",
      field: "name",
      value: "GZ",
      expected: 'name is not the texts of its tokens joined: "GZ", not "G"',
    },
    {
      name: "reports block NumericLiteral value differing from its written number (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeIndex: 7,
      nodeType: "NumericLiteral",
      field: "value",
      value: 3,
      expected:
        "value is not the number that its written text writes: 3, not 2",
    },
    {
      name: "reports block Identifier name differing from its units joined (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeIndex: 5,
      nodeType: "Identifier",
      field: "name",
      value: "GZ",
      expected: 'name is not the texts of its tokens joined: "GZ", not "G"',
    },
    {
      name: "reports block delimited value losing inner whitespace (db-arrow-spaces-label)",
      diagram: "block",
      fixture: "db-arrow-spaces-label",
      nodeIndex: 6,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not " "',
    },
    {
      name: "reports block StringLiteral raw differing from complete source (db-composite-shape-edge-header)",
      diagram: "block",
      fixture: "db-composite-shape-edge-header",
      nodeIndex: 7,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zx"',
      expected: 'raw: "\\"Zx\\"", not "\\"x\\""',
    },
    {
      name: "reports block NumericLiteral raw differing from complete source (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeIndex: 7,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "2Z",
      expected: 'raw: "2Z", not "2"',
    },
    {
      name: "reports c4 leaf value differing from its written text (db-grid-empty-header-line)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeIndex: 3,
      nodeType: "C4Literal",
      field: "value",
      value: "aZ",
      expected: 'value is not its written text: "aZ", not "a"',
    },
    {
      name: "reports c4 delimited value losing inner whitespace (db-named-key-whitespace)",
      diagram: "c4",
      fixture: "db-named-key-whitespace",
      nodeIndex: 7,
      nodeType: "StringLiteral",
      field: "value",
      value: "T",
      expected: 'value is not its written text: "T", not " T "',
    },
    {
      name: "reports c4 StringLiteral raw differing from complete source (db-grid-empty-header-line)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZA"',
      expected: 'raw: "\\"ZA\\"", not "\\"A\\""',
    },
    {
      name: "reports class leaf value differing from its written text (div-comment-after-header)",
      diagram: "class",
      fixture: "div-comment-after-header",
      nodeIndex: 4,
      nodeType: "ClassIdentifier",
      field: "name",
      value: "AnimalZ",
      expected:
        'name is not the texts of its tokens joined: "AnimalZ", not "Animal"',
    },
    {
      name: "reports class Identifier name differing from its units joined (config-security-level-other-annotation-statement)",
      diagram: "class",
      fixture: "config-security-level-other-annotation-statement",
      nodeIndex: 7,
      nodeType: "Identifier",
      field: "name",
      value: "interfaceZ",
      expected:
        'name is not the texts of its tokens joined: "interfaceZ", not "interface"',
    },
    {
      name: "reports class ClassIdentifier name differing from its units joined (db-generic-blank-directive-between-spaces)",
      diagram: "class",
      fixture: "db-generic-blank-directive-between-spaces",
      nodeIndex: 4,
      nodeType: "ClassIdentifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports class class style differing from its units joined (tokens-style-ignored-semicolon)",
      diagram: "class",
      fixture: "tokens-style-ignored-semicolon",
      nodeIndex: 7,
      nodeType: "ClassLiteral",
      field: "value",
      value: "fill:#f00Z",
      expected:
        'value is not the texts of its tokens joined: "fill:#f00Z", not "fill:#f00"',
    },
    {
      name: "reports class delimited value losing inner whitespace (db-cardinality-spaces)",
      diagram: "class",
      fixture: "db-cardinality-spaces",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not " "',
    },
    {
      name: "reports class StringLiteral raw differing from complete source (db-link-undefined-class)",
      diagram: "class",
      fixture: "db-link-undefined-class",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zu"',
      expected: 'raw: "\\"Zu\\"", not "\\"u\\""',
    },
    {
      name: "reports cynefin leaf value differing from its written text (comment-header)",
      diagram: "cynefin",
      fixture: "comment-header",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "value",
      value: "AZ",
      expected: 'value is not its written text: "AZ", not "A"',
    },
    {
      name: "reports cynefin delimited value losing inner whitespace (space-string-values)",
      diagram: "cynefin",
      fixture: "space-string-values",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "value",
      value: "A\ufeffB\u00a0C",
      expected:
        'value is not its written text: "A\ufeffB\u00a0C", not "\\tA\ufeffB\u00a0C\u3000 "',
    },
    {
      name: "reports cynefin StringLiteral raw differing from complete source (comment-header)",
      diagram: "cynefin",
      fixture: "comment-header",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZA"',
      expected: 'raw: "\\"ZA\\"", not "\\"A\\""',
    },
    {
      name: "reports er leaf value differing from its written text (demo-error-f7bc02f0)",
      diagram: "er",
      fixture: "demo-error-f7bc02f0",
      nodeIndex: 4,
      nodeType: "ErIdentifier",
      field: "name",
      value: "ATLAS-ORGANIZATIONZ",
      expected:
        'name is not its written text: "ATLAS-ORGANIZATIONZ", not "ATLAS-ORGANIZATION"',
    },
    {
      name: "reports er Identifier name differing from its units joined (config-security-level-other-names-as-written)",
      diagram: "er",
      fixture: "config-security-level-other-names-as-written",
      nodeIndex: 8,
      nodeType: "Identifier",
      field: "name",
      value: "PKZ",
      expected: 'name is not the texts of its tokens joined: "PKZ", not "PK"',
    },
    {
      name: "reports er delimited value losing inner whitespace (config-security-level-other-subgraph-title-trimmed)",
      diagram: "er",
      fixture: "config-security-level-other-subgraph-title-trimmed",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "value",
      value: "<br>x",
      expected: 'value is not its written text: "<br>x", not " <br>x"',
    },
    {
      name: "reports er StringLiteral raw differing from complete source (demo-error-f7bc02f0)",
      diagram: "er",
      fixture: "demo-error-f7bc02f0",
      nodeIndex: 8,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zhas many"',
      expected: 'raw: "\\"Zhas many\\"", not "\\"has many\\""',
    },
    {
      name: "reports eventmodeling leaf value differing from its written text (comment-header)",
      diagram: "eventmodeling",
      fixture: "comment-header",
      nodeIndex: 3,
      nodeType: "Identifier",
      field: "name",
      value: "01Z",
      expected: 'name is not the texts of its tokens joined: "01Z", not "01"',
    },
    {
      name: "reports eventmodeling Identifier name differing from its units joined (comment-header)",
      diagram: "eventmodeling",
      fixture: "comment-header",
      nodeIndex: 3,
      nodeType: "Identifier",
      field: "name",
      value: "01Z",
      expected: 'name is not the texts of its tokens joined: "01Z", not "01"',
    },
    {
      name: "reports eventmodeling delimited value losing inner whitespace (spec-eventmodeling-test-ts-a2005e91)",
      diagram: "eventmodeling",
      fixture: "spec-eventmodeling-test-ts-a2005e91",
      nodeIndex: 50,
      nodeType: "StringLiteral",
      field: "value",
      value: '{ "a": { "c": true } }',
      expected:
        'value is not its written text: "{ \\"a\\": { \\"c\\": true } }", not " { \\"a\\": { \\"c\\": true } } "',
    },
    {
      name: "reports eventmodeling StringLiteral raw differing from complete source (c4-component-inline)",
      diagram: "eventmodeling",
      fixture: "c4-component-inline",
      nodeIndex: 7,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZC4Component"',
      expected: 'raw: "\\"ZC4Component\\"", not "\\"C4Component\\""',
    },
    {
      name: "reports flowchart leaf value differing from its written text (lex-directive-after-arrow)",
      diagram: "flowchart",
      fixture: "lex-directive-after-arrow",
      nodeIndex: 5,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports flowchart NumericLiteral value differing from its written number (db-linkstyle-interpolate-and-styles)",
      diagram: "flowchart",
      fixture: "db-linkstyle-interpolate-and-styles",
      nodeIndex: 12,
      nodeType: "NumericLiteral",
      field: "value",
      value: 1,
      expected:
        "value is not the number that its written text writes: 1, not 0",
    },
    {
      name: "reports flowchart Identifier name differing from its units joined (config-inherit-dir-no-header-direction)",
      diagram: "flowchart",
      fixture: "config-inherit-dir-no-header-direction",
      nodeIndex: 7,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports flowchart delimited value losing inner whitespace (comment-lines-after-separator-006f79fb)",
      diagram: "flowchart",
      fixture: "comment-lines-after-separator-006f79fb",
      nodeIndex: 3,
      nodeType: "FlowchartLabel",
      field: "value",
      value: "S",
      expected: 'value is not its written text: "S", not "S "',
    },
    {
      name: "reports flowchart StringLiteral raw differing from complete source (click-callback-tooltip)",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      nodeIndex: 14,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZTooltip for A"',
      expected: 'raw: "\\"ZTooltip for A\\"", not "\\"Tooltip for A\\""',
    },
    {
      name: "reports flowchart NumericLiteral raw differing from complete source (db-linkstyle-interpolate-and-styles)",
      diagram: "flowchart",
      fixture: "db-linkstyle-interpolate-and-styles",
      nodeIndex: 12,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "0Z",
      expected: 'raw: "0Z", not "0"',
    },
    {
      name: "reports gantt leaf value differing from its written text (div-percent-brace-glued-after-header)",
      diagram: "gantt",
      fixture: "div-percent-brace-glued-after-header",
      nodeIndex: 3,
      nodeType: "GanttLiteral",
      field: "value",
      value: "TZ",
      expected: 'value is not its written text: "TZ", not "T"',
    },
    {
      name: "reports gantt Identifier name differing from its units joined (config-security-level-antiscript-click-call)",
      diagram: "gantt",
      fixture: "config-security-level-antiscript-click-call",
      nodeIndex: 8,
      nodeType: "Identifier",
      field: "name",
      value: "aZ",
      expected: 'name is not the texts of its tokens joined: "aZ", not "a"',
    },
    {
      name: "reports gantt delimited value losing inner whitespace (lex-href-line-feed-url)",
      diagram: "gantt",
      fixture: "lex-href-line-feed-url",
      nodeIndex: 9,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not "\\n"',
    },
    {
      name: "reports gantt StringLiteral raw differing from complete source (config-security-level-antiscript-click-call)",
      diagram: "gantt",
      fixture: "config-security-level-antiscript-click-call",
      nodeIndex: 14,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zjavascript:alert(1)"',
      expected:
        'raw: "\\"Zjavascript:alert(1)\\"", not "\\"javascript:alert(1)\\""',
    },
    {
      name: "reports gitgraph leaf value differing from its written text (div-lex-preheader-bare-between-retained-unicode)",
      diagram: "gitgraph",
      fixture: "div-lex-preheader-bare-between-retained-unicode",
      nodeIndex: 2,
      nodeType: "GitgraphIgnoredText",
      field: "value",
      value: "---\nx\n---Z",
      expected:
        'value is not its written text: "---\\nx\\n---Z", not "---\\nx\\n---"',
    },
    {
      name: "reports gitgraph NumericLiteral value differing from its written number (config-main-branch)",
      diagram: "gitgraph",
      fixture: "config-main-branch",
      nodeIndex: 6,
      nodeType: "NumericLiteral",
      field: "value",
      value: 3,
      expected:
        "value is not the number that its written text writes: 3, not 2",
    },
    {
      name: "reports gitgraph Identifier name differing from its units joined (gram-header-inline-branch)",
      diagram: "gitgraph",
      fixture: "gram-header-inline-branch",
      nodeIndex: 3,
      nodeType: "Identifier",
      field: "name",
      value: "bZ",
      expected: 'name is not the texts of its tokens joined: "bZ", not "b"',
    },
    {
      name: "reports gitgraph delimited value losing inner whitespace (db-compare-empty-and-whitespace)",
      diagram: "gitgraph",
      fixture: "db-compare-empty-and-whitespace",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not " "',
    },
    {
      name: "reports gitgraph StringLiteral raw differing from complete source (comment-bare-string)",
      diagram: "gitgraph",
      fixture: "comment-bare-string",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZA\n%%\nB"',
      expected: 'raw: "\\"ZA\\n%%\\nB\\"", not "\\"A\\n%%\\nB\\""',
    },
    {
      name: "reports gitgraph NumericLiteral raw differing from complete source (config-main-branch)",
      diagram: "gitgraph",
      fixture: "config-main-branch",
      nodeIndex: 6,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "2Z",
      expected: 'raw: "2Z", not "2"',
    },
    {
      name: "reports info leaf value differing from its written text (header-common-inline)",
      diagram: "info",
      fixture: "header-common-inline",
      nodeIndex: 3,
      nodeType: "InfoLiteral",
      field: "value",
      value: "TZ",
      expected: 'value is not its written text: "TZ", not "T"',
    },
    {
      name: "reports ishikawa leaf value differing from its written text (comment-header-glued)",
      diagram: "ishikawa",
      fixture: "comment-header-glued",
      nodeIndex: 3,
      nodeType: "IshikawaLiteral",
      field: "value",
      value: "RZ",
      expected: 'value is not its written text: "RZ", not "R"',
    },
    {
      name: "reports journey leaf value differing from its written text (gram-empty-description-block-after-header)",
      diagram: "journey",
      fixture: "gram-empty-description-block-after-header",
      nodeIndex: 4,
      nodeType: "JourneyLiteral",
      field: "value",
      value: "AZ",
      expected: 'value is not its written text: "AZ", not "A"',
    },
    {
      name: "reports kanban leaf value differing from its written text (db-frontmatter-after-header)",
      diagram: "kanban",
      fixture: "db-frontmatter-after-header",
      nodeIndex: 3,
      nodeType: "KanbanLiteral",
      field: "value",
      value: "---Z",
      expected: 'value is not its written text: "---Z", not "---"',
    },
    {
      name: "reports kanban delimited value losing inner whitespace (db-metadata-spaces)",
      diagram: "kanban",
      fixture: "db-metadata-spaces",
      nodeIndex: 6,
      nodeType: "KanbanDataBlock",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not "   "',
    },
    {
      name: "reports mindmap leaf value differing from its written text (db-blank-line-after-header)",
      diagram: "mindmap",
      fixture: "db-blank-line-after-header",
      nodeIndex: 3,
      nodeType: "MindmapLiteral",
      field: "value",
      value: "rootZ",
      expected: 'value is not its written text: "rootZ", not "root"',
    },
    {
      name: "reports mindmap delimited value losing inner whitespace (gram-shape-text-quoted-with-space)",
      diagram: "mindmap",
      fixture: "gram-shape-text-quoted-with-space",
      nodeIndex: 7,
      nodeType: "MindmapLabel",
      field: "value",
      value: '"x"',
      expected: 'value is not its written text: "\\"x\\"", not " \\"x\\" "',
    },
    {
      name: "reports packet leaf value differing from its written text (c4-retained-preheader-yaml)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeIndex: 2,
      nodeType: "PacketIgnoredText",
      field: "value",
      value: "---\nC4Container\n---Z",
      expected:
        'value is not its written text: "---\\nC4Container\\n---Z", not "---\\nC4Container\\n---"',
    },
    {
      name: "reports packet NumericLiteral value differing from its written number (c4-retained-preheader-yaml)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeIndex: 4,
      nodeType: "NumericLiteral",
      field: "value",
      value: 1,
      expected:
        "value is not the number that its written text writes: 1, not 0",
    },
    {
      name: "reports packet delimited value losing inner whitespace (db-label-space)",
      diagram: "packet",
      fixture: "db-label-space",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not " \\t "',
    },
    {
      name: "reports packet StringLiteral raw differing from complete source (c4-retained-preheader-yaml)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZA"',
      expected: 'raw: "\\"ZA\\"", not "\\"A\\""',
    },
    {
      name: "reports packet NumericLiteral raw differing from complete source (c4-retained-preheader-yaml)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeIndex: 4,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "0Z",
      expected: 'raw: "0Z", not "0"',
    },
    {
      name: "reports pie leaf value differing from its written text (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "value",
      value: "AZ",
      expected: 'value is not its written text: "AZ", not "A"',
    },
    {
      name: "reports pie NumericLiteral value differing from its written number (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeIndex: 4,
      nodeType: "NumericLiteral",
      field: "value",
      value: 2,
      expected:
        "value is not the number that its written text writes: 2, not 1",
    },
    {
      name: "reports pie delimited value losing inner whitespace (label-unicode-whitespace-only)",
      diagram: "pie",
      fixture: "label-unicode-whitespace-only",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not "\u00a0\u3000"',
    },
    {
      name: "reports pie StringLiteral raw differing from complete source (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZA"',
      expected: 'raw: "\\"ZA\\"", not "\\"A\\""',
    },
    {
      name: "reports pie NumericLiteral raw differing from complete source (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeIndex: 4,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "1Z",
      expected: 'raw: "1Z", not "1"',
    },
    {
      name: "reports quadrant leaf value differing from its written text (db-block-on-header-line)",
      diagram: "quadrant",
      fixture: "db-block-on-header-line",
      nodeIndex: 3,
      nodeType: "QuadrantLiteral",
      field: "value",
      value: "xZ",
      expected:
        'value is not its written text without the whitespace at its ends: "xZ", not "x"',
    },
    {
      name: "reports quadrant Identifier name differing from its units joined (db-after-point-class-cr)",
      diagram: "quadrant",
      fixture: "db-after-point-class-cr",
      nodeIndex: 4,
      nodeType: "Identifier",
      field: "name",
      value: "c1Z",
      expected: 'name is not the texts of its tokens joined: "c1Z", not "c1"',
    },
    {
      name: "reports quadrant delimited value losing inner whitespace (db-x-axis-spaces-only-string)",
      diagram: "quadrant",
      fixture: "db-x-axis-spaces-only-string",
      nodeIndex: 3,
      nodeType: "QuadrantLabel",
      field: "value",
      value: "",
      expected:
        'the value is not what the kind of the label makes of its written text: "", not "  "',
    },
    {
      name: "reports radar leaf value differing from its written text (comment-header)",
      diagram: "radar",
      fixture: "comment-header",
      nodeIndex: 4,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports radar NumericLiteral value differing from its written number (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeIndex: 14,
      nodeType: "NumericLiteral",
      field: "value",
      value: 2,
      expected:
        "value is not the number that its written text writes: 2, not 1",
    },
    {
      name: "reports radar Identifier name differing from its units joined (comment-header)",
      diagram: "radar",
      fixture: "comment-header",
      nodeIndex: 4,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports radar delimited value losing inner whitespace (db-label-whitespace)",
      diagram: "radar",
      fixture: "db-label-whitespace",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "value",
      value: "a\t  b",
      expected: 'value is not its written text: "a\\t  b", not "  a\\t  b  "',
    },
    {
      name: "reports radar StringLiteral raw differing from complete source (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZAxis A"',
      expected: 'raw: "\\"ZAxis A\\"", not "\\"Axis A\\""',
    },
    {
      name: "reports radar NumericLiteral raw differing from complete source (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeIndex: 14,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "1Z",
      expected: 'raw: "1Z", not "1"',
    },
    {
      name: "reports railroad leaf value differing from its written text (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeIndex: 3,
      nodeType: "RailroadLiteral",
      field: "value",
      value: '"Syntax"Z',
      expected:
        'value is not its written text: "\\"Syntax\\"Z", not "\\"Syntax\\""',
    },
    {
      name: "reports railroad NumericLiteral value differing from its written number (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeIndex: 17,
      nodeType: "NumericLiteral",
      field: "value",
      value: 3,
      expected:
        "value is not the number that its written text writes: 3, not 2",
    },
    {
      name: "reports railroad Identifier name differing from its units joined (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeIndex: 12,
      nodeType: "Identifier",
      field: "name",
      value: "itemZ",
      expected:
        'name is not the texts of its tokens joined: "itemZ", not "item"',
    },
    {
      name: "reports railroad delimited value losing inner whitespace (ebnf-special-whitespace)",
      diagram: "railroad",
      fixture: "ebnf-special-whitespace",
      nodeIndex: 4,
      nodeType: "RailroadSpecialSequence",
      field: "value",
      value: "a\n b",
      expected: 'value is not its written text: "a\\n b", not "  a\\n b  "',
    },
    {
      name: "reports railroad StringLiteral raw differing from complete source (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeIndex: 22,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Za"',
      expected: 'raw: "\\"Za\\"", not "\\"a\\""',
    },
    {
      name: "reports railroad NumericLiteral raw differing from complete source (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeIndex: 17,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "002Z",
      expected: 'raw: "002Z", not "002"',
    },
    {
      name: "reports requirement leaf value differing from its written text (header-after-bare-percent-line-and-whitespace-line)",
      diagram: "requirement",
      fixture: "header-after-bare-percent-line-and-whitespace-line",
      nodeIndex: 3,
      nodeType: "RequirementIdentifier",
      field: "name",
      value: "rZ",
      expected: 'name is not its written text: "rZ", not "r"',
    },
    {
      name: "reports requirement delimited value losing inner whitespace (db-requirement-quoted-values)",
      diagram: "requirement",
      fixture: "db-requirement-quoted-values",
      nodeIndex: 5,
      nodeType: "StringLiteral",
      field: "value",
      value: "a: b, c - d",
      expected:
        'value is not its written text: "a: b, c - d", not " a: b, c - d "',
    },
    {
      name: "reports requirement StringLiteral raw differing from complete source (config-security-level-other-names-as-written)",
      diagram: "requirement",
      fixture: "config-security-level-other-names-as-written",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zr<b>1"',
      expected: 'raw: "\\"Zr<b>1\\"", not "\\"r<b>1\\""',
    },
    {
      name: "reports sankey leaf value differing from its written text (db-header-beta-upper-case)",
      diagram: "sankey",
      fixture: "db-header-beta-upper-case",
      nodeIndex: 3,
      nodeType: "SankeyIdentifier",
      field: "name",
      value: "aZ",
      expected:
        'name is not its written text without the whitespace at its ends: "aZ", not "a"',
    },
    {
      name: "reports sankey delimited value losing inner whitespace (db-quoted-both-line-feed-ids)",
      diagram: "sankey",
      fixture: "db-quoted-both-line-feed-ids",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "value",
      value: "a",
      expected: 'value is not its written text: "a", not "a\\n"',
    },
    {
      name: "reports sankey StringLiteral raw differing from complete source (config-security-level-other-title-and-ids)",
      diagram: "sankey",
      fixture: "config-security-level-other-title-and-ids",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZB<i>z</i> &amp; <u>"',
      expected:
        'raw: "\\"ZB<i>z</i> &amp; <u>\\"", not "\\"B<i>z</i> &amp; <u>\\""',
    },
    {
      name: "reports sequence leaf value differing from its written text (header-after-bare-percent-cr)",
      diagram: "sequence",
      fixture: "header-after-bare-percent-cr",
      nodeIndex: 3,
      nodeType: "SequenceIdentifier",
      field: "name",
      value: "AZ",
      expected: 'name is not its written text: "AZ", not "A"',
    },
    {
      name: "reports sequence NumericLiteral value differing from its written number (config-wrap-site-autonumber)",
      diagram: "sequence",
      fixture: "config-wrap-site-autonumber",
      nodeIndex: 3,
      nodeType: "NumericLiteral",
      field: "value",
      value: 3,
      expected:
        "value is not the number that its written text writes: 3, not 2",
    },
    {
      name: "reports sequence delimited value losing inner whitespace (lex-id-space-before-data)",
      diagram: "sequence",
      fixture: "lex-id-space-before-data",
      nodeIndex: 4,
      nodeType: "SequenceDataBlock",
      field: "value",
      value: '"type": "queue"',
      expected:
        'value is not its written text: "\\"type\\": \\"queue\\"", not " \\"type\\": \\"queue\\" "',
    },
    {
      name: "reports sequence NumericLiteral raw differing from complete source (db-autonumber-fraction)",
      diagram: "sequence",
      fixture: "db-autonumber-fraction",
      nodeIndex: 3,
      nodeType: "NumericLiteral",
      field: "raw",
      value: ".5Z",
      expected: 'raw: ".5Z", not ".5"',
    },
    {
      name: "reports state leaf value differing from its written text (header-after-bare-percent-line)",
      diagram: "state",
      fixture: "header-after-bare-percent-line",
      nodeIndex: 6,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports state NumericLiteral value differing from its written number (gram-scale-width-overflow)",
      diagram: "state",
      fixture: "gram-scale-width-overflow",
      nodeIndex: 3,
      nodeType: "NumericLiteral",
      field: "value",
      value: "nullZ",
      expected: "the field value is string, not number",
    },
    {
      name: "reports state Identifier name differing from its units joined (header-after-bare-percent-line)",
      diagram: "state",
      fixture: "header-after-bare-percent-line",
      nodeIndex: 6,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports state delimited value losing inner whitespace (db-alias-blank-end-id-after-transition)",
      diagram: "state",
      fixture: "db-alias-blank-end-id-after-transition",
      nodeIndex: 8,
      nodeType: "StringLiteral",
      field: "value",
      value: "",
      expected: 'value is not its written text: "", not " "',
    },
    {
      name: "reports state StringLiteral raw differing from complete source (config-html-labels-false)",
      diagram: "state",
      fixture: "config-html-labels-false",
      nodeIndex: 14,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zhttps://example.com"',
      expected:
        'raw: "\\"Zhttps://example.com\\"", not "\\"https://example.com\\""',
    },
    {
      name: "reports state NumericLiteral raw differing from complete source (gram-scale-width-overflow)",
      diagram: "state",
      fixture: "gram-scale-width-overflow",
      nodeIndex: 3,
      nodeType: "NumericLiteral",
      field: "raw",
      value:
        "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999Z",
      expected:
        'raw: "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999Z", not "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"',
    },
    {
      name: "reports timeline leaf value differing from its written text (db-comment-hash-between-header-and-first-line)",
      diagram: "timeline",
      fixture: "db-comment-hash-between-header-and-first-line",
      nodeIndex: 3,
      nodeType: "TimelineLiteral",
      field: "value",
      value: "aZ",
      expected: 'value is not its written text: "aZ", not "a"',
    },
    {
      name: "reports treemap leaf value differing from its written text (comment-header)",
      diagram: "treemap",
      fixture: "comment-header",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "value",
      value: "AZ",
      expected: 'value is not its written text: "AZ", not "A"',
    },
    {
      name: "reports treemap NumericLiteral value differing from its written number (comment-header)",
      diagram: "treemap",
      fixture: "comment-header",
      nodeIndex: 4,
      nodeType: "NumericLiteral",
      field: "value",
      value: 2,
      expected:
        "value is not the number that its written text writes: 2, not 1",
    },
    {
      name: "reports treemap Identifier name differing from its units joined (gram-written-tree)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      nodeIndex: 6,
      nodeType: "Identifier",
      field: "name",
      value: "aaZ",
      expected: 'name is not the texts of its tokens joined: "aaZ", not "aa"',
    },
    {
      name: "reports treemap delimited value losing inner whitespace (space-name-values)",
      diagram: "treemap",
      fixture: "space-name-values",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "value",
      value: "A",
      expected:
        'value is not its written text: "A", not " \\tA\ufeff\u00a0\u3000 "',
    },
    {
      name: "reports treemap StringLiteral raw differing from complete source (comment-header)",
      diagram: "treemap",
      fixture: "comment-header",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZA"',
      expected: 'raw: "\\"ZA\\"", not "\\"A\\""',
    },
    {
      name: "reports treemap NumericLiteral raw differing from complete source (comment-header)",
      diagram: "treemap",
      fixture: "comment-header",
      nodeIndex: 4,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "1Z",
      expected: 'raw: "1Z", not "1"',
    },
    {
      name: "reports treeview leaf value differing from its written text (detect-no-bare-unicode-before-header)",
      diagram: "treeview",
      fixture: "detect-no-bare-unicode-before-header",
      nodeIndex: 3,
      nodeType: "TreeviewIdentifier",
      field: "name",
      value: "nodeZ",
      expected: 'name is not its written text: "nodeZ", not "node"',
    },
    {
      name: "reports treeview Identifier name differing from its units joined (gram-written-tree)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeIndex: 13,
      nodeType: "Identifier",
      field: "name",
      value: "firstZ",
      expected:
        'name is not the texts of its tokens joined: "firstZ", not "first"',
    },
    {
      name: "reports treeview delimited value losing inner whitespace (gram-written-tree)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeIndex: 22,
      nodeType: "StringLiteral",
      field: "value",
      value: "child/",
      expected: 'value is not its written text: "child/", not "child/ "',
    },
    {
      name: "reports treeview StringLiteral raw differing from complete source (gram-written-tree)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeIndex: 22,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zchild/ "',
      expected: 'raw: "\\"Zchild/ \\"", not "\\"child/ \\""',
    },
    {
      name: "reports usecase leaf value differing from its written text (directive-after-header)",
      diagram: "usecase",
      fixture: "directive-after-header",
      nodeIndex: 4,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports usecase Identifier name differing from its units joined (directive-after-header)",
      diagram: "usecase",
      fixture: "directive-after-header",
      nodeIndex: 4,
      nodeType: "Identifier",
      field: "name",
      value: "AZ",
      expected: 'name is not the texts of its tokens joined: "AZ", not "A"',
    },
    {
      name: "reports usecase delimited value losing inner whitespace (div-lex-json-ps-whitespace)",
      diagram: "usecase",
      fixture: "div-lex-json-ps-whitespace",
      nodeIndex: 4,
      nodeType: "UsecaseJsonDataBlock",
      field: "value",
      value: '"a":1',
      expected:
        'value is not its written text: "\\"a\\":1", not "\u2029\\"a\\":1"',
    },
    {
      name: "reports usecase StringLiteral raw differing from complete source (db-actor-variants)",
      diagram: "usecase",
      fixture: "db-actor-variants",
      nodeIndex: 35,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Zfa:user"',
      expected: 'raw: "\\"Zfa:user\\"", not "\\"fa:user\\""',
    },
    {
      name: "reports venn leaf value differing from its written text (db-grid-comment-header-line)",
      diagram: "venn",
      fixture: "db-grid-comment-header-line",
      nodeIndex: 2,
      nodeType: "VennIgnoredText",
      field: "value",
      value: "aZ",
      expected: 'value is not its written text: "aZ", not "a"',
    },
    {
      name: "reports venn NumericLiteral value differing from its written number (db-after-indent-number-blank)",
      diagram: "venn",
      fixture: "db-after-indent-number-blank",
      nodeIndex: 5,
      nodeType: "NumericLiteral",
      field: "value",
      value: 3,
      expected:
        "value is not the number that its written text writes: 3, not 2",
    },
    {
      name: "reports venn Identifier name differing from its units joined (db-grid-comment-header-line)",
      diagram: "venn",
      fixture: "db-grid-comment-header-line",
      nodeIndex: 4,
      nodeType: "Identifier",
      field: "name",
      value: "ZZ",
      expected: 'name is not the texts of its tokens joined: "ZZ", not "Z"',
    },
    {
      name: "reports venn delimited value losing inner whitespace (lex-identifier-spaces)",
      diagram: "venn",
      fixture: "lex-identifier-spaces",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "value",
      value: "a",
      expected: 'value is not its written text: "a", not "  a  "',
    },
    {
      name: "reports venn StringLiteral raw differing from complete source (db-grid-keyword-header-identifier-quoted)",
      diagram: "venn",
      fixture: "db-grid-keyword-header-identifier-quoted",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"Za venn-beta b"',
      expected: 'raw: "\\"Za venn-beta b\\"", not "\\"a venn-beta b\\""',
    },
    {
      name: "reports venn NumericLiteral raw differing from complete source (db-after-indent-number-blank)",
      diagram: "venn",
      fixture: "db-after-indent-number-blank",
      nodeIndex: 5,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "2Z",
      expected: 'raw: "2Z", not "2"',
    },
    {
      name: "reports wardley leaf value differing from its written text (comment-header)",
      diagram: "wardley",
      fixture: "comment-header",
      nodeIndex: 3,
      nodeType: "WardleyIdentifier",
      field: "name",
      value: "AZ",
      expected: 'name is not its written text: "AZ", not "A"',
    },
    {
      name: "reports wardley NumericLiteral value differing from its written number (comment-header)",
      diagram: "wardley",
      fixture: "comment-header",
      nodeIndex: 5,
      nodeType: "NumericLiteral",
      field: "value",
      value: 1.1,
      expected:
        "value is not the number that its written text writes: 1.1, not 0.1",
    },
    {
      name: "reports wardley delimited value losing inner whitespace (space-every-text)",
      diagram: "wardley",
      fixture: "space-every-text",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "value",
      value: "G\tH\ufeffI\u00a0J\u3000K",
      expected:
        'value is not its written text: "G\\tH\ufeffI\u00a0J\u3000K", not " G\\tH\ufeffI\u00a0J\u3000K "',
    },
    {
      name: "reports wardley StringLiteral raw differing from complete source (c4-component-accelerator)",
      diagram: "wardley",
      fixture: "c4-component-accelerator",
      nodeIndex: 3,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZC4Component"',
      expected: 'raw: "\\"ZC4Component\\"", not "\\"C4Component\\""',
    },
    {
      name: "reports wardley NumericLiteral raw differing from complete source (comment-header)",
      diagram: "wardley",
      fixture: "comment-header",
      nodeIndex: 5,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "0.1Z",
      expected: 'raw: "0.1Z", not "0.1"',
    },
    {
      name: "reports xychart leaf value differing from its written text (header-statement-on-header-line)",
      diagram: "xychart",
      fixture: "header-statement-on-header-line",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "value",
      value: "TZ",
      expected: 'value is not its written text: "TZ", not "T"',
    },
    {
      name: "reports xychart NumericLiteral value differing from its written number (config-orientation-frontmatter-header-wins)",
      diagram: "xychart",
      fixture: "config-orientation-frontmatter-header-wins",
      nodeIndex: 5,
      nodeType: "NumericLiteral",
      field: "value",
      value: 2,
      expected:
        "value is not the number that its written text writes: 2, not 1",
    },
    {
      name: "reports xychart delimited value losing inner whitespace (db-label-spaces-trimmed)",
      diagram: "xychart",
      fixture: "db-label-spaces-trimmed",
      nodeIndex: 6,
      nodeType: "StringLiteral",
      field: "value",
      value: "a",
      expected: 'value is not its written text: "a", not "  a  "',
    },
    {
      name: "reports xychart StringLiteral raw differing from complete source (header-statement-on-header-line)",
      diagram: "xychart",
      fixture: "header-statement-on-header-line",
      nodeIndex: 4,
      nodeType: "StringLiteral",
      field: "raw",
      value: '"ZT"',
      expected: 'raw: "\\"ZT\\"", not "\\"T\\""',
    },
    {
      name: "reports xychart NumericLiteral raw differing from complete source (config-orientation-frontmatter-header-wins)",
      diagram: "xychart",
      fixture: "config-orientation-frontmatter-header-wins",
      nodeIndex: 5,
      nodeType: "NumericLiteral",
      field: "raw",
      value: "1Z",
      expected: 'raw: "1Z", not "1"',
    },
  ] as const
  for (const testCase of writtenFieldCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken)[testCase.nodeIndex]
      expect(node.type).toBe(testCase.nodeType)
      setField(node, testCase.field, testCase.value)
      expect(
        checkTree(input, broken).map((problem) => problem.message),
      ).toContain(testCase.expected)
    })
  }
})

describe("checkTree: the data block example of written text", () => {
  it("reports a flowchart data block value with its inner line feeds trimmed", () => {
    const { input, tree } = recordedTree(
      "flowchart",
      "gram-data-consecutive-blocks",
    )
    const broken = copyOf(tree)
    const node = firstNode(broken, "FlowchartDataBlock")
    setField(node, "value", String(node.value).trim())
    expect(checkTree(input, broken)).toEqual([
      {
        where: "FlowchartDataBlock at 14-30",
        message:
          'value is not its written text: "shape: rect", not "\\nshape: rect\\n"',
      },
    ])
  })
})
// packages/spec/docs/ast.md, Design goals and Root: the baselines have
// named child fields and keep the diagram body as a child of Root.
describe("checkTree: shared AST conditions in each diagram", () => {
  const cases: readonly (MutationCase & {
    readonly diagram: Parameters<typeof recordedTree>[0]
  })[] = [
    {
      name: "reports a body replaced by a string instead of a named child node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (agentflow)",
      diagram: "agentflow",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (architecture)",
      diagram: "architecture",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (block)",
      diagram: "block",
      fixture: "config-block-padding",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (c4)",
      diagram: "c4",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (class)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-17d57580",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (cynefin)",
      diagram: "cynefin",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (er)",
      diagram: "er",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (eventmodeling)",
      diagram: "eventmodeling",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (flowchart)",
      diagram: "flowchart",
      fixture: "basic-edge",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (gantt)",
      diagram: "gantt",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (gitgraph)",
      diagram: "gitgraph",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (info)",
      diagram: "info",
      fixture: "accdescr-block-empty",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (ishikawa)",
      diagram: "ishikawa",
      fixture: "comment-child-inline-eof",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (journey)",
      diagram: "journey",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (kanban)",
      diagram: "kanban",
      fixture: "config-security-level-other",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (mindmap)",
      diagram: "mindmap",
      fixture: "config-mindmap-padding-and-width",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (packet)",
      diagram: "packet",
      fixture: "accdescr-block-gap-bom",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (pie)",
      diagram: "pie",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (quadrant)",
      diagram: "quadrant",
      fixture: "config-security-level-default-script",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (radar)",
      diagram: "radar",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (railroad)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (requirement)",
      diagram: "requirement",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (sankey)",
      diagram: "sankey",
      fixture: "config-sankey-settings",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (sequence)",
      diagram: "sequence",
      fixture: "config-init-trailing-comma",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (state)",
      diagram: "state",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (timeline)",
      diagram: "timeline",
      fixture: "config-security-level-loose-title",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (treemap)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (treeview)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (usecase)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (venn)",
      diagram: "venn",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (wardley)",
      diagram: "wardley",
      fixture: "header-only",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
    {
      name: "reports a generic children list added to a diagram (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "children", [])
      },
      expected: "has the field children, which its type does not have",
    },
    {
      name: "reports a diagram body represented by a Punctuator node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "Punctuator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Keyword node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "Keyword")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a Whitespace node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "Whitespace")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a LineTerminator node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "LineTerminator")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a RawText node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "RawText")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body represented by a catch-all Node (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "Node")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a diagram body given a role-specific Body type (xychart)",
      diagram: "xychart",
      fixture: "config-orientation-directive",
      mutate(root) {
        setField(root.body, "type", "Body")
      },
      expected: "is of a type that the specification does not define",
    },
    {
      name: "reports a body replaced by a string instead of a named child node (error)",
      diagram: "common",
      fixture: "error-directive-adjacent",
      mutate(root) {
        setField(root, "body", "body")
      },
      expected: "the field body is string, not a node",
    },
  ]

  for (const testCase of cases) {
    it(testCase.name, () => {
      const { base, mutated } = problemsOf(testCase.diagram, testCase)
      expect(base).toEqual([])
      expect(
        mutated.map((problem) => `${problem.where}: ${problem.message}`),
      ).toContainEqual(expect.stringContaining(testCase.expected))
    })
  }
})

describe("checkTree: grammar-selected shared leaf types (ast.md, Shared leaf nodes)", () => {
  const leafFieldTypeCases = [
    {
      name: "reports agentflow Identifier replaced by AgentflowLiteral (directive-before-header)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeType: "Identifier",
      replacementType: "AgentflowLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "AgentflowVertex at 73-74",
        message: "the field id holds a AgentflowLiteral, not a Identifier",
      },
    },
    {
      name: "reports architecture Identifier replaced by ArchitectureLiteral (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "Identifier",
      replacementType: "ArchitectureLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "ArchitectureJunctionStatement at 71-94",
        message: "the field id holds a ArchitectureLiteral, not a Identifier",
      },
    },
    {
      name: "reports block Identifier replaced by BlockLiteral (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeType: "Identifier",
      replacementType: "BlockLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "BlockNode at 19-20",
        message: "the field id holds a BlockLiteral, not a Identifier",
      },
    },
    {
      name: "reports eventmodeling Identifier replaced by EventmodelingLiteral (comment-header)",
      diagram: "eventmodeling",
      fixture: "comment-header",
      nodeType: "Identifier",
      replacementType: "EventmodelingLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "EventmodelingTimeFrameStatement at 25-36",
        message:
          "the field name holds a EventmodelingLiteral, not a Identifier",
      },
    },
    {
      name: "reports gitgraph Identifier replaced by GitgraphLiteral (gram-header-inline-branch)",
      diagram: "gitgraph",
      fixture: "gram-header-inline-branch",
      nodeType: "Identifier",
      replacementType: "GitgraphLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "GitgraphBranchStatement at 9-17",
        message:
          "the field name holds a GitgraphLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports quadrant Identifier replaced by QuadrantLiteral (db-after-point-class-cr)",
      diagram: "quadrant",
      fixture: "db-after-point-class-cr",
      nodeType: "Identifier",
      replacementType: "QuadrantLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "QuadrantPointStatement at 14-32",
        message:
          "the field className holds a QuadrantLiteral, not a Identifier",
      },
    },
    {
      name: "reports radar Identifier replaced by RadarLiteral (comment-header)",
      diagram: "radar",
      fixture: "comment-header",
      nodeType: "Identifier",
      replacementType: "RadarLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "RadarAxis at 26-27",
        message: "the field name holds a RadarLiteral, not a Identifier",
      },
    },
    {
      name: "reports railroad Identifier replaced by RailroadLiteral (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "Identifier",
      replacementType: "RailroadLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "RailroadRule at 99-156",
        message: "the field name holds a RailroadLiteral, not a Identifier",
      },
    },
    {
      name: "reports requirement Identifier replaced by RequirementLiteral (db-style-statement)",
      diagram: "requirement",
      fixture: "db-style-statement",
      nodeType: "Identifier",
      replacementType: "RequirementLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "RequirementStyleStatement at 51-82",
        message:
          "the field names holds a RequirementLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports treemap Identifier replaced by TreemapLiteral (gram-written-tree)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      nodeType: "Identifier",
      replacementType: "TreemapLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "TreemapSection at 23-115",
        message:
          "the field classSelector holds a TreemapLiteral, not a Identifier",
      },
    },
    {
      name: "reports treeview Identifier replaced by TreeviewLiteral (gram-written-tree)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeType: "Identifier",
      replacementType: "TreeviewLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "TreeviewClassAnnotation at 96-104",
        message: "the field name holds a TreeviewLiteral, not a Identifier",
      },
    },
    {
      name: "reports usecase Identifier replaced by UsecaseLiteral (directive-after-header)",
      diagram: "usecase",
      fixture: "directive-after-header",
      nodeType: "Identifier",
      replacementType: "UsecaseLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "UsecaseEntity at 27-28",
        message: "the field id holds a UsecaseLiteral, not a Identifier",
      },
    },
    {
      name: "reports venn Identifier replaced by VennLiteral (db-grid-comment-header-line)",
      diagram: "venn",
      fixture: "db-grid-comment-header-line",
      nodeType: "Identifier",
      replacementType: "VennLiteral",
      valueField: "value",
      sourceField: "name",
      additionalFields: {},
      expected: {
        where: "VennSubsetStatement at 17-22",
        message:
          "the field sets holds a VennLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports agentflow AgentflowLiteral replaced by FlowchartLiteral (comment-after-style)",
      diagram: "agentflow",
      fixture: "comment-after-style",
      nodeType: "AgentflowLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "AgentflowStyleStatement at 20-36",
        message:
          "the field styles holds a FlowchartLiteral, not a AgentflowLiteral",
      },
    },
    {
      name: "reports architecture ArchitectureLiteral replaced by FlowchartLiteral (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "ArchitectureLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "ArchitectureAccTitleStatement at 18-35",
        message:
          "the field value holds a FlowchartLiteral, not a ArchitectureLiteral",
      },
    },
    {
      name: "reports block BlockLiteral replaced by FlowchartLiteral (db-grid-keyword-class-header-line)",
      diagram: "block",
      fixture: "db-grid-keyword-class-header-line",
      nodeType: "BlockLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "BlockClassStatement at 11-22",
        message: "the field ids holds a FlowchartLiteral, not a BlockLiteral",
      },
    },
    {
      name: "reports c4 C4Literal replaced by FlowchartLiteral (db-grid-empty-header-line)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeType: "C4Literal",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "C4ElementStatement at 11-25",
        message:
          "the field arguments holds a FlowchartLiteral, not a C4Literal or StringLiteral or C4NamedAttribute",
      },
    },
    {
      name: "reports cynefin CynefinLiteral replaced by FlowchartLiteral (header-colon-title)",
      diagram: "cynefin",
      fixture: "header-colon-title",
      nodeType: "CynefinLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "CynefinTitleStatement at 13-20",
        message:
          "the field value holds a FlowchartLiteral, not a CynefinLiteral",
      },
    },
    {
      name: "reports eventmodeling EventmodelingLiteral replaced by FlowchartLiteral (gram-common-leading-directive-after-header)",
      diagram: "eventmodeling",
      fixture: "gram-common-leading-directive-after-header",
      nodeType: "EventmodelingLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "EventmodelingAccDescrStatement at 25-36",
        message:
          "the field value holds a FlowchartLiteral, not a EventmodelingLiteral",
      },
    },
    {
      name: "reports gitgraph GitgraphLiteral replaced by FlowchartLiteral (gram-header-inline-accdescr)",
      diagram: "gitgraph",
      fixture: "gram-header-inline-accdescr",
      nodeType: "GitgraphLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "GitgraphAccDescrBlockStatement at 9-23",
        message:
          "the field value holds a FlowchartLiteral, not a GitgraphLiteral",
      },
    },
    {
      name: "reports info InfoLiteral replaced by FlowchartLiteral (header-common-inline)",
      diagram: "info",
      fixture: "header-common-inline",
      nodeType: "InfoLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "InfoTitleStatement at 5-12",
        message: "the field value holds a FlowchartLiteral, not a InfoLiteral",
      },
    },
    {
      name: "reports ishikawa IshikawaLiteral replaced by FlowchartLiteral (comment-header-glued)",
      diagram: "ishikawa",
      fixture: "comment-header-glued",
      nodeType: "IshikawaLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "IshikawaNode at 16-17",
        message:
          "the field text holds a FlowchartLiteral, not a IshikawaLiteral",
      },
    },
    {
      name: "reports kanban KanbanLiteral replaced by FlowchartLiteral (db-frontmatter-after-header)",
      diagram: "kanban",
      fixture: "db-frontmatter-after-header",
      nodeType: "KanbanLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "KanbanNode at 7-10",
        message: "the field id holds a FlowchartLiteral, not a KanbanLiteral",
      },
    },
    {
      name: "reports mindmap MindmapLiteral replaced by FlowchartLiteral (db-blank-line-after-header)",
      diagram: "mindmap",
      fixture: "db-blank-line-after-header",
      nodeType: "MindmapLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "MindmapNode at 11-15",
        message: "the field id holds a FlowchartLiteral, not a MindmapLiteral",
      },
    },
    {
      name: "reports packet PacketLiteral replaced by FlowchartLiteral (header-beta-title)",
      diagram: "packet",
      fixture: "header-beta-title",
      nodeType: "PacketLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "PacketTitleStatement at 11-18",
        message:
          "the field value holds a FlowchartLiteral, not a PacketLiteral",
      },
    },
    {
      name: "reports pie PieLiteral replaced by FlowchartLiteral (header-title-inline)",
      diagram: "pie",
      fixture: "header-title-inline",
      nodeType: "PieLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "PieTitleStatement at 4-16",
        message: "the field value holds a FlowchartLiteral, not a PieLiteral",
      },
    },
    {
      name: "reports quadrant QuadrantLiteral replaced by FlowchartLiteral (db-block-on-header-line)",
      diagram: "quadrant",
      fixture: "db-block-on-header-line",
      nodeType: "QuadrantLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "QuadrantAccDescrBlockStatement at 14-26",
        message:
          "the field value holds a FlowchartLiteral, not a QuadrantLiteral",
      },
    },
    {
      name: "reports radar RadarLiteral replaced by FlowchartLiteral (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeType: "RadarLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "RadarTitleStatement at 125-136",
        message: "the field value holds a FlowchartLiteral, not a RadarLiteral",
      },
    },
    {
      name: "reports railroad RailroadLiteral replaced by FlowchartLiteral (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "RailroadLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "RailroadTitleStatement at 19-33",
        message:
          "the field value holds a FlowchartLiteral, not a RailroadLiteral",
      },
    },
    {
      name: "reports requirement RequirementLiteral replaced by FlowchartLiteral (config-security-level-other-names-as-written)",
      diagram: "requirement",
      fixture: "config-security-level-other-names-as-written",
      nodeType: "RequirementLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "RequirementClassDefStatement at 155-175",
        message:
          "the field styles holds a FlowchartLiteral, not a RequirementLiteral",
      },
    },
    {
      name: "reports sankey SankeyLiteral replaced by FlowchartLiteral (db-header-beta-upper-case)",
      diagram: "sankey",
      fixture: "db-header-beta-upper-case",
      nodeType: "SankeyLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "SankeyLinkStatement at 12-17",
        message:
          "the field value holds a FlowchartLiteral, not a SankeyLiteral or StringLiteral",
      },
    },
    {
      name: "reports timeline TimelineLiteral replaced by FlowchartLiteral (db-comment-hash-between-header-and-first-line)",
      diagram: "timeline",
      fixture: "db-comment-hash-between-header-and-first-line",
      nodeType: "TimelineLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "TimelinePeriodStatement at 15-16",
        message:
          "the field period holds a FlowchartLiteral, not a TimelineLiteral",
      },
    },
    {
      name: "reports treemap TreemapLiteral replaced by FlowchartLiteral (gram-written-tree)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      nodeType: "TreemapLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "TreemapTitleStatement at 13-22",
        message:
          "the field value holds a FlowchartLiteral, not a TreemapLiteral",
      },
    },
    {
      name: "reports treeview TreeviewLiteral replaced by FlowchartLiteral (gram-written-tree)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeType: "TreeviewLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "TreeviewTitleStatement at 14-26",
        message:
          "the field value holds a FlowchartLiteral, not a TreeviewLiteral",
      },
    },
    {
      name: "reports usecase UsecaseLiteral replaced by FlowchartLiteral (comment-after-acctitle)",
      diagram: "usecase",
      fixture: "comment-after-acctitle",
      nodeType: "UsecaseLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "UsecaseAccTitleStatement at 13-38",
        message:
          "the field value holds a FlowchartLiteral, not a UsecaseLiteral",
      },
    },
    {
      name: "reports venn VennLiteral replaced by FlowchartLiteral (db-grid-keyword-header-title)",
      diagram: "venn",
      fixture: "db-grid-keyword-header-title",
      nodeType: "VennLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "VennTitleStatement at 10-29",
        message: "the field value holds a FlowchartLiteral, not a VennLiteral",
      },
    },
    {
      name: "reports wardley WardleyLiteral replaced by FlowchartLiteral (c4-component-acctitle)",
      diagram: "wardley",
      fixture: "c4-component-acctitle",
      nodeType: "WardleyLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "WardleyAccTitleStatement at 13-34",
        message:
          "the field value holds a FlowchartLiteral, not a WardleyLiteral",
      },
    },
    {
      name: "reports xychart XychartLiteral replaced by FlowchartLiteral (db-header-line-description-block)",
      diagram: "xychart",
      fixture: "db-header-line-description-block",
      nodeType: "XychartLiteral",
      replacementType: "FlowchartLiteral",
      valueField: "value",
      sourceField: "value",
      additionalFields: {},
      expected: {
        where: "XychartAccDescrBlockStatement at 8-20",
        message:
          "the field value holds a FlowchartLiteral, not a XychartLiteral",
      },
    },
  ] as const
  for (const testCase of leafFieldTypeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = firstNode(broken, testCase.nodeType)
      const value = node[testCase.sourceField]
      const replacement = {
        type: testCase.replacementType,
        [testCase.valueField]: value,
        range: node.range,
        loc: node.loc,
        ...testCase.additionalFields,
      }
      for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
      Object.assign(node, replacement)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const leafSourceTypeCases = [
    {
      name: "reports agentflow StringLiteral replaced by AgentflowLiteral (config-other-all-texts)",
      diagram: "agentflow",
      fixture: "config-other-all-texts",
      nodeType: "StringLiteral",
      replacementType: "AgentflowLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "AgentflowClickUrlStatement at 143-186",
        message: "the field url holds a AgentflowLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports architecture StringLiteral replaced by ArchitectureLiteral (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "StringLiteral",
      replacementType: "ArchitectureLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "ArchitectureServiceStatement at 95-133",
        message:
          "the field icon holds a ArchitectureLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports block StringLiteral replaced by BlockLiteral (db-composite-shape-edge-header)",
      diagram: "block",
      fixture: "db-composite-shape-edge-header",
      nodeType: "StringLiteral",
      replacementType: "BlockLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "BlockShape at 20-25",
        message: "the field label holds a BlockLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports cynefin StringLiteral replaced by CynefinLiteral (comment-header)",
      diagram: "cynefin",
      fixture: "comment-header",
      nodeType: "StringLiteral",
      replacementType: "CynefinLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "CynefinDomainItem at 32-35",
        message: "the field label holds a CynefinLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports gitgraph StringLiteral replaced by GitgraphLiteral (comment-bare-string)",
      diagram: "gitgraph",
      fixture: "comment-bare-string",
      nodeType: "StringLiteral",
      replacementType: "GitgraphLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "GitgraphMessageOption at 16-28",
        message: "the field value holds a GitgraphLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports packet StringLiteral replaced by PacketLiteral (c4-retained-preheader-yaml)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeType: "StringLiteral",
      replacementType: "PacketLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "PacketSingleBlockStatement at 32-37",
        message: "the field label holds a PacketLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports pie StringLiteral replaced by PieLiteral (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeType: "StringLiteral",
      replacementType: "PieLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "PieSectionStatement at 15-20",
        message: "the field label holds a PieLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports radar StringLiteral replaced by RadarLiteral (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeType: "StringLiteral",
      replacementType: "RadarLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "RadarAxis at 17-28",
        message: "the field label holds a RadarLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports railroad StringLiteral replaced by RailroadLiteral (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "StringLiteral",
      replacementType: "RailroadLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "RailroadExpressionMember at 114-117",
        message:
          "the field expression holds a RailroadLiteral, not a RailroadSequenceCall or RailroadChoiceCall or RailroadOptionalCall or RailroadOneOrMoreCall or RailroadZeroOrMoreCall or RailroadTerminalCall or RailroadNonterminalCall or RailroadSpecialCall or Identifier or StringLiteral or RailroadChoiceExpression or RailroadSequenceExpression or RailroadGroupExpression or RailroadOptionalGroupExpression or RailroadRepetitionGroupExpression or RailroadPostfixExpression or RailroadExceptionExpression or RailroadSpecialSequence or RailroadRepeatExpression or RailroadNumericValue or RailroadPredicateExpression or RailroadAnyExpression",
      },
    },
    {
      name: "reports requirement StringLiteral replaced by RequirementLiteral (config-security-level-other-names-as-written)",
      diagram: "requirement",
      fixture: "config-security-level-other-names-as-written",
      nodeType: "StringLiteral",
      replacementType: "RequirementLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "RequirementRequirementStatement at 19-72",
        message:
          "the field name holds a RequirementLiteral, not a RequirementIdentifier or StringLiteral",
      },
    },
    {
      name: "reports sankey StringLiteral replaced by SankeyLiteral (config-security-level-other-title-and-ids)",
      diagram: "sankey",
      fixture: "config-security-level-other-title-and-ids",
      nodeType: "StringLiteral",
      replacementType: "SankeyLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "SankeyLinkStatement at 39-93",
        message:
          "the field target holds a SankeyLiteral, not a SankeyIdentifier or StringLiteral",
      },
    },
    {
      name: "reports treemap StringLiteral replaced by TreemapLiteral (comment-header)",
      diagram: "treemap",
      fixture: "comment-header",
      nodeType: "StringLiteral",
      replacementType: "TreemapLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "TreemapLeaf at 18-23",
        message: "the field name holds a TreemapLiteral, not a StringLiteral",
      },
    },
    {
      name: "reports treeview StringLiteral replaced by TreeviewLiteral (gram-written-tree)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeType: "StringLiteral",
      replacementType: "TreeviewLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "TreeviewNode at 151-160",
        message:
          "the field name holds a TreeviewLiteral, not a TreeviewIdentifier or StringLiteral",
      },
    },
    {
      name: "reports usecase StringLiteral replaced by UsecaseLiteral (db-actor-variants)",
      diagram: "usecase",
      fixture: "db-actor-variants",
      nodeType: "StringLiteral",
      replacementType: "UsecaseLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "UsecaseMetadataProperty at 144-158",
        message:
          "the field value holds a UsecaseLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports usecase StringLiteral replaced by UsecaseLiteral (lex-native-single-quoted-keys)",
      diagram: "usecase",
      fixture: "lex-native-single-quoted-keys",
      nodeType: "StringLiteral",
      replacementType: "UsecaseLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "UsecaseMetadataProperty at 22-37",
        message:
          "the field key holds a UsecaseLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports venn StringLiteral replaced by VennLiteral (db-grid-keyword-header-identifier-quoted)",
      diagram: "venn",
      fixture: "db-grid-keyword-header-identifier-quoted",
      nodeType: "StringLiteral",
      replacementType: "VennLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "VennSubsetStatement at 10-29",
        message:
          "the field sets holds a VennLiteral, not a Identifier or StringLiteral",
      },
    },
    {
      name: "reports wardley StringLiteral replaced by WardleyLiteral (c4-component-accelerator)",
      diagram: "wardley",
      fixture: "c4-component-accelerator",
      nodeType: "StringLiteral",
      replacementType: "WardleyLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "WardleyAcceleratorStatement at 13-48",
        message:
          "the field name holds a WardleyLiteral, not a WardleyIdentifier or StringLiteral",
      },
    },
    {
      name: "reports agentflow NumericLiteral replaced by AgentflowLiteral (db-all-fields)",
      diagram: "agentflow",
      fixture: "db-all-fields",
      nodeType: "NumericLiteral",
      replacementType: "AgentflowLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "AgentflowLinkStyleStatement at 278-300",
        message:
          "the field indices holds a AgentflowLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports block NumericLiteral replaced by BlockLiteral (db-columns-in-block-header-line)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeType: "NumericLiteral",
      replacementType: "BlockLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "BlockColumnsStatement at 21-30",
        message: "the field count holds a BlockLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports gitgraph NumericLiteral replaced by GitgraphLiteral (config-main-branch)",
      diagram: "gitgraph",
      fixture: "config-main-branch",
      nodeType: "NumericLiteral",
      replacementType: "GitgraphLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "GitgraphOrderOption at 25-32",
        message:
          "the field value holds a GitgraphLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports packet NumericLiteral replaced by PacketLiteral (c4-retained-preheader-yaml)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeType: "NumericLiteral",
      replacementType: "PacketLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "PacketSingleBlockStatement at 32-37",
        message: "the field start holds a PacketLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports pie NumericLiteral replaced by PieLiteral (comment-before-header)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeType: "NumericLiteral",
      replacementType: "PieLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "PieSectionStatement at 15-20",
        message: "the field value holds a PieLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports radar NumericLiteral replaced by RadarLiteral (gram-written-tree)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeType: "NumericLiteral",
      replacementType: "RadarLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "RadarNamedEntry at 48-51",
        message: "the field value holds a RadarLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports railroad NumericLiteral replaced by RailroadLiteral (abnf-gram-written-tree)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "NumericLiteral",
      replacementType: "RailroadLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "RailroadRepeatRange at 106-113",
        message:
          "the field minimum holds a RailroadLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports treemap NumericLiteral replaced by TreemapLiteral (db-number-comma)",
      diagram: "treemap",
      fixture: "db-number-comma",
      nodeType: "NumericLiteral",
      replacementType: "TreemapLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "TreemapLeaf at 8-20",
        message: "the field value holds a TreemapLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports venn NumericLiteral replaced by VennLiteral (db-after-indent-number-blank)",
      diagram: "venn",
      fixture: "db-after-indent-number-blank",
      nodeType: "NumericLiteral",
      replacementType: "VennLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "VennTextStatement at 17-23",
        message:
          "the field id holds a VennLiteral, not a Identifier or StringLiteral or NumericLiteral",
      },
    },
    {
      name: "reports wardley NumericLiteral replaced by WardleyLiteral (comment-header)",
      diagram: "wardley",
      fixture: "comment-header",
      nodeType: "NumericLiteral",
      replacementType: "WardleyLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "WardleyCoordinates at 36-45",
        message:
          "the field visibility holds a WardleyLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports xychart NumericLiteral replaced by XychartLiteral (config-orientation-frontmatter-header-wins)",
      diagram: "xychart",
      fixture: "config-orientation-frontmatter-header-wins",
      nodeType: "NumericLiteral",
      replacementType: "XychartLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "XychartValue at 89-90",
        message: "the field value holds a XychartLiteral, not a NumericLiteral",
      },
    },
    {
      name: "reports quadrant QuadrantIdentifier replaced by Identifier (db-after-classdef-cr)",
      diagram: "quadrant",
      fixture: "db-after-classdef-cr",
      nodeType: "QuadrantIdentifier",
      replacementType: "Identifier",
      valueField: "name",
      additionalFields: {},
      expected: {
        where: "QuadrantClassDefStatement at 14-37",
        message: "the field name holds a Identifier, not a QuadrantIdentifier",
      },
    },
    {
      name: "reports requirement RequirementIdentifier replaced by Identifier (header-after-bare-percent-line-and-whitespace-line)",
      diagram: "requirement",
      fixture: "header-after-bare-percent-line-and-whitespace-line",
      nodeType: "RequirementIdentifier",
      replacementType: "Identifier",
      valueField: "name",
      additionalFields: {},
      expected: {
        where: "RequirementRequirementStatement at 25-42",
        message:
          "the field name holds a Identifier, not a RequirementIdentifier or StringLiteral",
      },
    },
    {
      name: "reports sankey SankeyIdentifier replaced by Identifier (db-header-beta-upper-case)",
      diagram: "sankey",
      fixture: "db-header-beta-upper-case",
      nodeType: "SankeyIdentifier",
      replacementType: "Identifier",
      valueField: "name",
      additionalFields: {},
      expected: {
        where: "SankeyLinkStatement at 12-17",
        message:
          "the field source holds a Identifier, not a SankeyIdentifier or StringLiteral",
      },
    },
    {
      name: "reports treeview TreeviewIdentifier replaced by Identifier (detect-no-bare-unicode-before-header)",
      diagram: "treeview",
      fixture: "detect-no-bare-unicode-before-header",
      nodeType: "TreeviewIdentifier",
      replacementType: "Identifier",
      valueField: "name",
      additionalFields: {},
      expected: {
        where: "TreeviewNode at 16-20",
        message:
          "the field name holds a Identifier, not a TreeviewIdentifier or StringLiteral",
      },
    },
    {
      name: "reports usecase UsecaseIdentifier replaced by Identifier (comment-after-classdef)",
      diagram: "usecase",
      fixture: "comment-after-classdef",
      nodeType: "UsecaseIdentifier",
      replacementType: "Identifier",
      valueField: "name",
      additionalFields: {},
      expected: {
        where: "UsecaseStyleDeclaration at 26-45",
        message: "the field name holds a Identifier, not a UsecaseIdentifier",
      },
    },
    {
      name: "reports wardley WardleyIdentifier replaced by Identifier (db-unquoted-names)",
      diagram: "wardley",
      fixture: "db-unquoted-names",
      nodeType: "WardleyIdentifier",
      replacementType: "Identifier",
      valueField: "name",
      additionalFields: {},
      expected: {
        where: "WardleyComponentStatement at 13-65",
        message:
          "the field name holds a Identifier, not a WardleyIdentifier or StringLiteral",
      },
    },
    {
      name: "reports agentflow AgentflowLabel replaced by AgentflowLiteral (directive-before-header)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeType: "AgentflowLabel",
      replacementType: "AgentflowLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "AgentflowName at 71-72",
        message:
          "the field parts holds a AgentflowLiteral, not a AgentflowLabel or AgentflowIgnoredText",
      },
    },
    {
      name: "reports architecture ArchitectureLabel replaced by ArchitectureLiteral (db-mixed)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "ArchitectureLabel",
      replacementType: "ArchitectureLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "ArchitectureServiceStatement at 95-133",
        message:
          "the field title holds a ArchitectureLiteral, not a ArchitectureLabel",
      },
    },
    {
      name: "reports kanban KanbanLabel replaced by KanbanLiteral (db-grid-keyword-header-item-id)",
      diagram: "kanban",
      fixture: "db-grid-keyword-header-item-id",
      nodeType: "KanbanLabel",
      replacementType: "KanbanLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "KanbanShape at 23-29",
        message: "the field label holds a KanbanLiteral, not a KanbanLabel",
      },
    },
    {
      name: "reports mindmap MindmapLabel replaced by MindmapLiteral (header-shape-glued)",
      diagram: "mindmap",
      fixture: "header-shape-glued",
      nodeType: "MindmapLabel",
      replacementType: "MindmapLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "MindmapShape at 7-10",
        message: "the field label holds a MindmapLiteral, not a MindmapLabel",
      },
    },
    {
      name: "reports quadrant QuadrantLabel replaced by QuadrantLiteral (db-name-quoted-header-word)",
      diagram: "quadrant",
      fixture: "db-name-quoted-header-word",
      nodeType: "QuadrantLabel",
      replacementType: "QuadrantLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "QuadrantPointStatement at 14-41",
        message: "the field name holds a QuadrantLiteral, not a QuadrantLabel",
      },
    },
    {
      name: "reports usecase UsecaseLabel replaced by UsecaseLiteral (lex-keyword-header-label)",
      diagram: "usecase",
      fixture: "lex-keyword-header-label",
      nodeType: "UsecaseLabel",
      replacementType: "UsecaseLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "UsecaseEntity at 13-28",
        message: "the field label holds a UsecaseLiteral, not a UsecaseLabel",
      },
    },
    {
      name: "reports venn VennLabel replaced by VennLiteral (db-grid-keyword-header-label-bare)",
      diagram: "venn",
      fixture: "db-grid-keyword-header-label-bare",
      nodeType: "VennLabel",
      replacementType: "VennLiteral",
      valueField: "value",
      additionalFields: {},
      expected: {
        where: "VennSubsetStatement at 10-30",
        message: "the field label holds a VennLiteral, not a VennLabel",
      },
    },
  ] as const
  for (const testCase of leafSourceTypeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = firstNode(broken, testCase.nodeType)
      const value = input.slice(...node.range)
      const replacement = {
        type: testCase.replacementType,
        [testCase.valueField]: value,
        range: node.range,
        loc: node.loc,
        ...testCase.additionalFields,
      }
      for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
      Object.assign(node, replacement)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const stringTailTypeCases = [
    {
      name: "reports c4 StringLiteral replaced by FlowchartLabel (db-grid-empty-header-line)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeType: "StringLiteral",
      replacementType: "FlowchartLabel",
      valueField: "value",
      additionalFields: {
        kind: "string",
      },
      expected: {
        where: "C4ElementStatement at 11-25",
        message:
          "the field arguments holds a FlowchartLabel, not a C4Literal or StringLiteral or C4NamedAttribute",
      },
    },
    {
      name: "reports eventmodeling StringLiteral replaced by FlowchartLabel (c4-component-inline)",
      diagram: "eventmodeling",
      fixture: "c4-component-inline",
      nodeType: "StringLiteral",
      replacementType: "FlowchartLabel",
      valueField: "value",
      additionalFields: {
        kind: "string",
      },
      expected: {
        where: "EventmodelingInlineData at 26-39",
        message:
          "the field value holds a FlowchartLabel, not a EventmodelingLiteral or StringLiteral",
      },
    },
    {
      name: "reports xychart StringLiteral replaced by FlowchartLabel (header-statement-on-header-line)",
      diagram: "xychart",
      fixture: "header-statement-on-header-line",
      nodeType: "StringLiteral",
      replacementType: "FlowchartLabel",
      valueField: "value",
      additionalFields: {
        kind: "string",
      },
      expected: {
        where: "XychartTitleStatement at 13-22",
        message:
          "the field value holds a FlowchartLabel, not a XychartLiteral or StringLiteral",
      },
    },
  ] as const
  for (const testCase of stringTailTypeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = firstNode(broken, testCase.nodeType)
      const value = `${String(node.value)}"`
      const replacement = {
        type: testCase.replacementType,
        [testCase.valueField]: value,
        range: node.range,
        loc: node.loc,
        ...testCase.additionalFields,
      }
      for (const field of Object.keys(node)) Reflect.deleteProperty(node, field)
      Object.assign(node, replacement)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }
})

describe("checkTree: shared leaf fields in each diagram (ast.md)", () => {
  const missingLeafRangeCases = [
    {
      name: "reports agentflow Identifier without its own range (directive-before-header, first)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeType: "Identifier",
      range: [73, 74],
      expected: {
        where: "AgentflowVertex at 73-74",
        message: "the field id is object, not a node",
      },
    },
    {
      name: "reports architecture Identifier without its own range (db-mixed, first)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "Identifier",
      range: [80, 85],
      expected: {
        where: "ArchitectureJunctionStatement at 71-94",
        message: "the field id is object, not a node",
      },
    },
    {
      name: "reports block Identifier without its own range (db-columns-in-block-header-line, first)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeType: "Identifier",
      range: [19, 20],
      expected: {
        where: "BlockNode at 19-20",
        message: "the field id is object, not a node",
      },
    },
    {
      name: "reports eventmodeling Identifier without its own range (comment-header, first)",
      diagram: "eventmodeling",
      fixture: "comment-header",
      nodeType: "Identifier",
      range: [28, 30],
      expected: {
        where: "EventmodelingTimeFrameStatement at 25-36",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports gitgraph Identifier without its own range (gram-header-inline-branch, first)",
      diagram: "gitgraph",
      fixture: "gram-header-inline-branch",
      nodeType: "Identifier",
      range: [16, 17],
      expected: {
        where: "GitgraphBranchStatement at 9-17",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports quadrant Identifier without its own range (db-after-point-class-cr, first)",
      diagram: "quadrant",
      fixture: "db-after-point-class-cr",
      nodeType: "Identifier",
      range: [18, 20],
      expected: {
        where: "QuadrantPointStatement at 14-32",
        message: "the field className is object, not a node or null",
      },
    },
    {
      name: "reports radar Identifier without its own range (comment-header, first)",
      diagram: "radar",
      fixture: "comment-header",
      nodeType: "Identifier",
      range: [26, 27],
      expected: {
        where: "RadarAxis at 26-27",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports railroad Identifier without its own range (abnf-gram-written-tree, first)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "Identifier",
      range: [99, 103],
      expected: {
        where: "RailroadRule at 99-156",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports treemap Identifier without its own range (gram-written-tree, first)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      nodeType: "Identifier",
      range: [32, 34],
      expected: {
        where: "TreemapSection at 23-115",
        message: "the field classSelector is object, not a node or null",
      },
    },
    {
      name: "reports treeview Identifier without its own range (gram-written-tree, first)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeType: "Identifier",
      range: [99, 104],
      expected: {
        where: "TreeviewClassAnnotation at 96-104",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports usecase Identifier without its own range (directive-after-header, first)",
      diagram: "usecase",
      fixture: "directive-after-header",
      nodeType: "Identifier",
      range: [27, 28],
      expected: {
        where: "UsecaseEntity at 27-28",
        message: "the field id is object, not a node or null",
      },
    },
    {
      name: "reports venn Identifier without its own range (db-grid-comment-header-line, first)",
      diagram: "venn",
      fixture: "db-grid-comment-header-line",
      nodeType: "Identifier",
      range: [21, 22],
      expected: {
        where: "VennSubsetStatement at 17-22.sets[0]",
        message: "is no node: it has no type and no range",
      },
    },
    {
      name: "reports c4 StringLiteral without its own range (db-grid-empty-header-line, first)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeType: "StringLiteral",
      range: [21, 24],
      expected: {
        where: "C4ElementStatement at 11-25.arguments[1]",
        message: "is no node: it has no type and no range",
      },
    },
    {
      name: "reports cynefin StringLiteral without its own range (comment-header, first)",
      diagram: "cynefin",
      fixture: "comment-header",
      nodeType: "StringLiteral",
      range: [32, 35],
      expected: {
        where: "CynefinDomainItem at 32-35",
        message: "the field label is object, not a node",
      },
    },
    {
      name: "reports packet StringLiteral without its own range (c4-retained-preheader-yaml, first)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeType: "StringLiteral",
      range: [34, 37],
      expected: {
        where: "PacketSingleBlockStatement at 32-37",
        message: "the field label is object, not a node",
      },
    },
    {
      name: "reports pie StringLiteral without its own range (comment-before-header, first)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeType: "StringLiteral",
      range: [15, 18],
      expected: {
        where: "PieSectionStatement at 15-20",
        message: "the field label is object, not a node",
      },
    },
    {
      name: "reports requirement StringLiteral without its own range (config-security-level-other-names-as-written, first)",
      diagram: "requirement",
      fixture: "config-security-level-other-names-as-written",
      nodeType: "StringLiteral",
      range: [31, 38],
      expected: {
        where: "RequirementRequirementStatement at 19-72",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports sankey StringLiteral without its own range (config-security-level-other-title-and-ids, first)",
      diagram: "sankey",
      fixture: "config-security-level-other-title-and-ids",
      nodeType: "StringLiteral",
      range: [70, 91],
      expected: {
        where: "SankeyLinkStatement at 39-93",
        message: "the field target is object, not a node",
      },
    },
    {
      name: "reports wardley StringLiteral without its own range (c4-component-accelerator, first)",
      diagram: "wardley",
      fixture: "c4-component-accelerator",
      nodeType: "StringLiteral",
      range: [25, 38],
      expected: {
        where: "WardleyAcceleratorStatement at 13-48",
        message: "the field name is object, not a node",
      },
    },
    {
      name: "reports xychart StringLiteral without its own range (header-statement-on-header-line, first)",
      diagram: "xychart",
      fixture: "header-statement-on-header-line",
      nodeType: "StringLiteral",
      range: [19, 22],
      expected: {
        where: "XychartTitleStatement at 13-22",
        message: "the field value is object, not a node",
      },
    },
    {
      name: "reports info InfoLiteral without its own range (header-common-inline, first)",
      diagram: "info",
      fixture: "header-common-inline",
      nodeType: "InfoLiteral",
      range: [11, 12],
      expected: {
        where: "InfoTitleStatement at 5-12",
        message: "the field value is object, not a node or null",
      },
    },
    {
      name: "reports ishikawa IshikawaLiteral without its own range (comment-header-glued, first)",
      diagram: "ishikawa",
      fixture: "comment-header-glued",
      nodeType: "IshikawaLiteral",
      range: [16, 17],
      expected: {
        where: "IshikawaNode at 16-17",
        message: "the field text is object, not a node",
      },
    },
    {
      name: "reports kanban KanbanLiteral without its own range (db-frontmatter-after-header, first)",
      diagram: "kanban",
      fixture: "db-frontmatter-after-header",
      nodeType: "KanbanLiteral",
      range: [7, 10],
      expected: {
        where: "KanbanNode at 7-10",
        message: "the field id is object, not a node or null",
      },
    },
    {
      name: "reports mindmap MindmapLiteral without its own range (db-blank-line-after-header, first)",
      diagram: "mindmap",
      fixture: "db-blank-line-after-header",
      nodeType: "MindmapLiteral",
      range: [11, 15],
      expected: {
        where: "MindmapNode at 11-15",
        message: "the field id is object, not a node or null",
      },
    },
    {
      name: "reports timeline TimelineLiteral without its own range (db-comment-hash-between-header-and-first-line, first)",
      diagram: "timeline",
      fixture: "db-comment-hash-between-header-and-first-line",
      nodeType: "TimelineLiteral",
      range: [15, 16],
      expected: {
        where: "TimelinePeriodStatement at 15-16",
        message: "the field period is object, not a node",
      },
    },
  ] as const
  for (const testCase of missingLeafRangeCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      Reflect.deleteProperty(node, "range")
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const extraLeafChildCases = [
    {
      name: "reports agentflow Identifier with a generic child list (directive-before-header, first)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeType: "Identifier",
      range: [73, 74],
      expected: {
        where: "Identifier at 73-74",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports architecture Identifier with a generic child list (db-mixed, first)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "Identifier",
      range: [80, 85],
      expected: {
        where: "Identifier at 80-85",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports block Identifier with a generic child list (db-columns-in-block-header-line, first)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeType: "Identifier",
      range: [19, 20],
      expected: {
        where: "Identifier at 19-20",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports eventmodeling Identifier with a generic child list (comment-header, first)",
      diagram: "eventmodeling",
      fixture: "comment-header",
      nodeType: "Identifier",
      range: [28, 30],
      expected: {
        where: "Identifier at 28-30",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports gitgraph Identifier with a generic child list (gram-header-inline-branch, first)",
      diagram: "gitgraph",
      fixture: "gram-header-inline-branch",
      nodeType: "Identifier",
      range: [16, 17],
      expected: {
        where: "Identifier at 16-17",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports quadrant Identifier with a generic child list (db-after-point-class-cr, first)",
      diagram: "quadrant",
      fixture: "db-after-point-class-cr",
      nodeType: "Identifier",
      range: [18, 20],
      expected: {
        where: "Identifier at 18-20",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports radar Identifier with a generic child list (comment-header, first)",
      diagram: "radar",
      fixture: "comment-header",
      nodeType: "Identifier",
      range: [26, 27],
      expected: {
        where: "Identifier at 26-27",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports railroad Identifier with a generic child list (abnf-gram-written-tree, first)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "Identifier",
      range: [99, 103],
      expected: {
        where: "Identifier at 99-103",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports treemap Identifier with a generic child list (gram-written-tree, first)",
      diagram: "treemap",
      fixture: "gram-written-tree",
      nodeType: "Identifier",
      range: [32, 34],
      expected: {
        where: "Identifier at 32-34",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports treeview Identifier with a generic child list (gram-written-tree, first)",
      diagram: "treeview",
      fixture: "gram-written-tree",
      nodeType: "Identifier",
      range: [99, 104],
      expected: {
        where: "Identifier at 99-104",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports usecase Identifier with a generic child list (directive-after-header, first)",
      diagram: "usecase",
      fixture: "directive-after-header",
      nodeType: "Identifier",
      range: [27, 28],
      expected: {
        where: "Identifier at 27-28",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports venn Identifier with a generic child list (db-grid-comment-header-line, first)",
      diagram: "venn",
      fixture: "db-grid-comment-header-line",
      nodeType: "Identifier",
      range: [21, 22],
      expected: {
        where: "Identifier at 21-22",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports c4 StringLiteral with a generic child list (db-grid-empty-header-line, first)",
      diagram: "c4",
      fixture: "db-grid-empty-header-line",
      nodeType: "StringLiteral",
      range: [21, 24],
      expected: {
        where: "StringLiteral at 21-24",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports cynefin StringLiteral with a generic child list (comment-header, first)",
      diagram: "cynefin",
      fixture: "comment-header",
      nodeType: "StringLiteral",
      range: [32, 35],
      expected: {
        where: "StringLiteral at 32-35",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports packet StringLiteral with a generic child list (c4-retained-preheader-yaml, first)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeType: "StringLiteral",
      range: [34, 37],
      expected: {
        where: "StringLiteral at 34-37",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports pie StringLiteral with a generic child list (comment-before-header, first)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeType: "StringLiteral",
      range: [15, 18],
      expected: {
        where: "StringLiteral at 15-18",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports requirement StringLiteral with a generic child list (config-security-level-other-names-as-written, first)",
      diagram: "requirement",
      fixture: "config-security-level-other-names-as-written",
      nodeType: "StringLiteral",
      range: [31, 38],
      expected: {
        where: "StringLiteral at 31-38",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports sankey StringLiteral with a generic child list (config-security-level-other-title-and-ids, first)",
      diagram: "sankey",
      fixture: "config-security-level-other-title-and-ids",
      nodeType: "StringLiteral",
      range: [70, 91],
      expected: {
        where: "StringLiteral at 70-91",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports wardley StringLiteral with a generic child list (c4-component-accelerator, first)",
      diagram: "wardley",
      fixture: "c4-component-accelerator",
      nodeType: "StringLiteral",
      range: [25, 38],
      expected: {
        where: "StringLiteral at 25-38",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports xychart StringLiteral with a generic child list (header-statement-on-header-line, first)",
      diagram: "xychart",
      fixture: "header-statement-on-header-line",
      nodeType: "StringLiteral",
      range: [19, 22],
      expected: {
        where: "StringLiteral at 19-22",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports info InfoLiteral with a generic child list (header-common-inline, first)",
      diagram: "info",
      fixture: "header-common-inline",
      nodeType: "InfoLiteral",
      range: [11, 12],
      expected: {
        where: "InfoLiteral at 11-12",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports ishikawa IshikawaLiteral with a generic child list (comment-header-glued, first)",
      diagram: "ishikawa",
      fixture: "comment-header-glued",
      nodeType: "IshikawaLiteral",
      range: [16, 17],
      expected: {
        where: "IshikawaLiteral at 16-17",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports kanban KanbanLiteral with a generic child list (db-frontmatter-after-header, first)",
      diagram: "kanban",
      fixture: "db-frontmatter-after-header",
      nodeType: "KanbanLiteral",
      range: [7, 10],
      expected: {
        where: "KanbanLiteral at 7-10",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports mindmap MindmapLiteral with a generic child list (db-blank-line-after-header, first)",
      diagram: "mindmap",
      fixture: "db-blank-line-after-header",
      nodeType: "MindmapLiteral",
      range: [11, 15],
      expected: {
        where: "MindmapLiteral at 11-15",
        message: "has the field children, which its type does not have",
      },
    },
    {
      name: "reports timeline TimelineLiteral with a generic child list (db-comment-hash-between-header-and-first-line, first)",
      diagram: "timeline",
      fixture: "db-comment-hash-between-header-and-first-line",
      nodeType: "TimelineLiteral",
      range: [15, 16],
      expected: {
        where: "TimelineLiteral at 15-16",
        message: "has the field children, which its type does not have",
      },
    },
  ] as const
  for (const testCase of extraLeafChildCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "children", [])
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const missingLabelKindCases = [
    {
      name: "reports agentflow AgentflowLabel without its kind (directive-before-header, first)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeType: "AgentflowLabel",
      range: [71, 72],
      expected: {
        where: "AgentflowLabel at 71-72",
        message: "lacks the field kind",
      },
    },
    {
      name: "reports architecture ArchitectureLabel without its kind (db-mixed, first)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "ArchitectureLabel",
      range: [119, 124],
      expected: {
        where: "ArchitectureLabel at 119-124",
        message: "lacks the field kind",
      },
    },
    {
      name: "reports kanban KanbanLabel without its kind (db-grid-keyword-header-item-id, first)",
      diagram: "kanban",
      fixture: "db-grid-keyword-header-item-id",
      nodeType: "KanbanLabel",
      range: [24, 28],
      expected: {
        where: "KanbanLabel at 24-28",
        message: "lacks the field kind",
      },
    },
    {
      name: "reports mindmap MindmapLabel without its kind (header-shape-glued, first)",
      diagram: "mindmap",
      fixture: "header-shape-glued",
      nodeType: "MindmapLabel",
      range: [8, 9],
      expected: {
        where: "MindmapLabel at 8-9",
        message: "lacks the field kind",
      },
    },
    {
      name: "reports quadrant QuadrantLabel without its kind (db-name-quoted-header-word, first)",
      diagram: "quadrant",
      fixture: "db-name-quoted-header-word",
      nodeType: "QuadrantLabel",
      range: [14, 29],
      expected: {
        where: "QuadrantLabel at 14-29",
        message: "lacks the field kind",
      },
    },
    {
      name: "reports usecase UsecaseLabel without its kind (lex-keyword-header-label, first)",
      diagram: "usecase",
      fixture: "lex-keyword-header-label",
      nodeType: "UsecaseLabel",
      range: [15, 27],
      expected: {
        where: "UsecaseLabel at 15-27",
        message: "lacks the field kind",
      },
    },
    {
      name: "reports venn VennLabel without its kind (db-grid-keyword-header-label-bare, first)",
      diagram: "venn",
      fixture: "db-grid-keyword-header-label-bare",
      nodeType: "VennLabel",
      range: [15, 30],
      expected: {
        where: "VennLabel at 15-30",
        message: "lacks the field kind",
      },
    },
  ] as const
  for (const testCase of missingLabelKindCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      Reflect.deleteProperty(node, "kind")
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const missingLabelValueCases = [
    {
      name: "reports agentflow AgentflowLabel without its value (directive-before-header, first)",
      diagram: "agentflow",
      fixture: "directive-before-header",
      nodeType: "AgentflowLabel",
      range: [71, 72],
      expected: {
        where: "AgentflowLabel at 71-72",
        message: "lacks the field value",
      },
    },
    {
      name: "reports architecture ArchitectureLabel without its value (db-mixed, first)",
      diagram: "architecture",
      fixture: "db-mixed",
      nodeType: "ArchitectureLabel",
      range: [119, 124],
      expected: {
        where: "ArchitectureLabel at 119-124",
        message: "lacks the field value",
      },
    },
    {
      name: "reports kanban KanbanLabel without its value (db-grid-keyword-header-item-id, first)",
      diagram: "kanban",
      fixture: "db-grid-keyword-header-item-id",
      nodeType: "KanbanLabel",
      range: [24, 28],
      expected: {
        where: "KanbanLabel at 24-28",
        message: "lacks the field value",
      },
    },
    {
      name: "reports mindmap MindmapLabel without its value (header-shape-glued, first)",
      diagram: "mindmap",
      fixture: "header-shape-glued",
      nodeType: "MindmapLabel",
      range: [8, 9],
      expected: {
        where: "MindmapLabel at 8-9",
        message: "lacks the field value",
      },
    },
    {
      name: "reports quadrant QuadrantLabel without its value (db-name-quoted-header-word, first)",
      diagram: "quadrant",
      fixture: "db-name-quoted-header-word",
      nodeType: "QuadrantLabel",
      range: [14, 29],
      expected: {
        where: "QuadrantLabel at 14-29",
        message: "lacks the field value",
      },
    },
    {
      name: "reports usecase UsecaseLabel without its value (lex-keyword-header-label, first)",
      diagram: "usecase",
      fixture: "lex-keyword-header-label",
      nodeType: "UsecaseLabel",
      range: [15, 27],
      expected: {
        where: "UsecaseLabel at 15-27",
        message: "lacks the field value",
      },
    },
    {
      name: "reports venn VennLabel without its value (db-grid-keyword-header-label-bare, first)",
      diagram: "venn",
      fixture: "db-grid-keyword-header-label-bare",
      nodeType: "VennLabel",
      range: [15, 30],
      expected: {
        where: "VennLabel at 15-30",
        message: "lacks the field value",
      },
    },
  ] as const
  for (const testCase of missingLabelValueCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      Reflect.deleteProperty(node, "value")
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const incorrectLeafClosedFlagCases = [
    {
      name: "reports agentflow StringLiteral marked unclosed despite its closing quote (config-other-all-texts, closed)",
      diagram: "agentflow",
      fixture: "config-other-all-texts",
      nodeType: "StringLiteral",
      range: [156, 177],
      expected: {
        where: "StringLiteral at 156-177",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports architecture StringLiteral marked unclosed despite its closing quote (c4-component-icontext, closed)",
      diagram: "architecture",
      fixture: "c4-component-icontext",
      nodeType: "StringLiteral",
      range: [30, 43],
      expected: {
        where: "StringLiteral at 30-43",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports block StringLiteral marked unclosed despite its closing quote (config-flowchart-html-labels-false, closed)",
      diagram: "block",
      fixture: "config-flowchart-html-labels-false",
      nodeType: "StringLiteral",
      range: [15, 36],
      expected: {
        where: "StringLiteral at 15-36",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports c4 StringLiteral marked unclosed despite its closing quote (config-security-level-other, closed)",
      diagram: "c4",
      fixture: "config-security-level-other",
      nodeType: "StringLiteral",
      range: [70, 88],
      expected: {
        where: "StringLiteral at 70-88",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports cynefin StringLiteral marked unclosed despite its closing quote (c4-component-item, closed)",
      diagram: "cynefin",
      fixture: "c4-component-item",
      nodeType: "StringLiteral",
      range: [21, 34],
      expected: {
        where: "StringLiteral at 21-34",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports flowchart StringLiteral marked unclosed despite its closing quote (click-callback-tooltip, closed)",
      diagram: "flowchart",
      fixture: "click-callback-tooltip",
      nodeType: "StringLiteral",
      range: [42, 57],
      expected: {
        where: "StringLiteral at 42-57",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports gitgraph StringLiteral marked unclosed despite its closing quote (comment-bare-string, closed)",
      diagram: "gitgraph",
      fixture: "comment-bare-string",
      nodeType: "StringLiteral",
      range: [20, 28],
      expected: {
        where: "StringLiteral at 20-28",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports packet StringLiteral marked unclosed despite its closing quote (c4-hidden-suffix-lf, closed)",
      diagram: "packet",
      fixture: "c4-hidden-suffix-lf",
      nodeType: "StringLiteral",
      range: [9, 12],
      expected: {
        where: "StringLiteral at 9-12",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports pie StringLiteral marked unclosed despite its closing quote (accdescr-blank-gap, closed)",
      diagram: "pie",
      fixture: "accdescr-blank-gap",
      nodeType: "StringLiteral",
      range: [15, 18],
      expected: {
        where: "StringLiteral at 15-18",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports radar StringLiteral marked unclosed despite its closing quote (c4-component-axis-label, closed)",
      diagram: "radar",
      fixture: "c4-component-axis-label",
      nodeType: "StringLiteral",
      range: [18, 31],
      expected: {
        where: "StringLiteral at 18-31",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports railroad StringLiteral marked unclosed despite its closing quote (abnf-bare-unicode, closed)",
      diagram: "railroad",
      fixture: "abnf-bare-unicode",
      nodeType: "StringLiteral",
      range: [27, 30],
      expected: {
        where: "StringLiteral at 27-30",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports sankey StringLiteral marked unclosed despite its closing quote (config-security-level-other-title-and-ids, closed)",
      diagram: "sankey",
      fixture: "config-security-level-other-title-and-ids",
      nodeType: "StringLiteral",
      range: [70, 91],
      expected: {
        where: "StringLiteral at 70-91",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports treeview StringLiteral marked unclosed despite its closing quote (annotation-comment-gap, closed)",
      diagram: "treeview",
      fixture: "annotation-comment-gap",
      nodeType: "StringLiteral",
      range: [14, 20],
      expected: {
        where: "StringLiteral at 14-20",
        message:
          "the name must be one complete first-priority bare or closed quoted unit",
      },
      closed: false,
    },
    {
      name: "reports usecase StringLiteral marked unclosed despite its closing quote (db-actor-variants, closed)",
      diagram: "usecase",
      fixture: "db-actor-variants",
      nodeType: "StringLiteral",
      range: [149, 158],
      expected: {
        where: "StringLiteral at 149-158",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports venn StringLiteral marked unclosed despite its closing quote (config-security-other, closed)",
      diagram: "venn",
      fixture: "config-security-other",
      nodeType: "StringLiteral",
      range: [37, 47],
      expected: {
        where: "StringLiteral at 37-47",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports wardley StringLiteral marked unclosed despite its closing quote (c4-component-accelerator, closed)",
      diagram: "wardley",
      fixture: "c4-component-accelerator",
      nodeType: "StringLiteral",
      range: [25, 38],
      expected: {
        where: "StringLiteral at 25-38",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports xychart StringLiteral marked unclosed despite its closing quote (config-security-level-loose-all, closed)",
      diagram: "xychart",
      fixture: "config-security-level-loose-all",
      nodeType: "StringLiteral",
      range: [20, 31],
      expected: {
        where: "StringLiteral at 20-31",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports treemap StringLiteral marked unclosed despite its closing quote (comment-header, first)",
      diagram: "treemap",
      fixture: "comment-header",
      nodeType: "StringLiteral",
      range: [18, 21],
      expected: {
        where: "StringLiteral at 18-21",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports class StringLiteral marked unclosed despite its closing quote (config-security-level-loose-click, closed)",
      diagram: "class",
      fixture: "config-security-level-loose-click",
      nodeType: "StringLiteral",
      range: [64, 69],
      expected: {
        where: "StringLiteral at 64-69",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports er StringLiteral marked unclosed despite its closing quote (config-security-level-antiscript-subgraph-title, closed)",
      diagram: "er",
      fixture: "config-security-level-antiscript-subgraph-title",
      nodeType: "StringLiteral",
      range: [24, 37],
      expected: {
        where: "StringLiteral at 24-37",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports eventmodeling StringLiteral marked unclosed despite its closing quote (c4-component-inline, closed)",
      diagram: "eventmodeling",
      fixture: "c4-component-inline",
      nodeType: "StringLiteral",
      range: [26, 39],
      expected: {
        where: "StringLiteral at 26-39",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports gantt StringLiteral marked unclosed despite its closing quote (config-security-level-antiscript-click-call, closed)",
      diagram: "gantt",
      fixture: "config-security-level-antiscript-click-call",
      nodeType: "StringLiteral",
      range: [65, 86],
      expected: {
        where: "StringLiteral at 65-86",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports requirement StringLiteral marked unclosed despite its closing quote (config-security-level-other-names-as-written, closed)",
      diagram: "requirement",
      fixture: "config-security-level-other-names-as-written",
      nodeType: "StringLiteral",
      range: [31, 38],
      expected: {
        where: "StringLiteral at 31-38",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports state StringLiteral marked unclosed despite its closing quote (config-html-labels-false, closed)",
      diagram: "state",
      fixture: "config-html-labels-false",
      nodeType: "StringLiteral",
      range: [102, 123],
      expected: {
        where: "StringLiteral at 102-123",
        message: "closed: false, not true",
      },
      closed: false,
    },
    {
      name: "reports agentflow AgentflowAccDescrBlockStatement marked closed despite its missing closer (db-accessibility-empty-unclosed, unclosed)",
      diagram: "agentflow",
      fixture: "db-accessibility-empty-unclosed",
      nodeType: "AgentflowAccDescrBlockStatement",
      range: [34, 44],
      expected: {
        where: "AgentflowAccDescrBlockStatement at 34-44",
        message:
          'the tokens that the node writes itself and its child nodes, in source order: ["accdescr","{"], not ["accdescr","{","}"]',
      },
      closed: true,
    },
    {
      name: "reports flowchart FlowchartAccDescrBlockStatement marked closed despite its missing closer (db-acc-descr-unclosed-empty-replaces, unclosed)",
      diagram: "flowchart",
      fixture: "db-acc-descr-unclosed-empty-replaces",
      nodeType: "FlowchartAccDescrBlockStatement",
      range: [27, 37],
      expected: {
        where: "FlowchartAccDescrBlockStatement at 27-37",
        message: "closed is not whether the last token is `}`: true, not false",
      },
      closed: true,
    },
    {
      name: "reports state StateAccDescrBlockStatement marked closed despite its missing closer (db-acc-descr-block-unclosed-takes-lines, unclosed)",
      diagram: "state",
      fixture: "db-acc-descr-block-unclosed-takes-lines",
      nodeType: "StateAccDescrBlockStatement",
      range: [28, 56],
      expected: {
        where: "StateAccDescrBlockStatement at 28-56",
        message: "closed, which is whether it ends with }: false, not true",
      },
      closed: true,
    },
    {
      name: "reports xychart XychartAccDescrBlockStatement marked closed despite its missing closer (db-acc-descr-unclosed-block, unclosed)",
      diagram: "xychart",
      fixture: "db-acc-descr-unclosed-block",
      nodeType: "XychartAccDescrBlockStatement",
      range: [14, 27],
      expected: {
        where: "XychartAccDescrBlockStatement at 14-27",
        message: "closed, which is whether it ends with }: true, not false",
      },
      closed: true,
    },
    {
      name: "reports sequence SequenceAccDescrBlockStatement marked closed despite its missing closer (db-acc-descr-block-unclosed-line-separator, unclosed)",
      diagram: "sequence",
      fixture: "db-acc-descr-block-unclosed-line-separator",
      nodeType: "SequenceAccDescrBlockStatement",
      range: [28, 42],
      expected: {
        where: "SequenceAccDescrBlockStatement at 28-42",
        message: "closed, by whether its last token is `}`: true, not false",
      },
      closed: true,
    },
  ] as const
  for (const testCase of incorrectLeafClosedFlagCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "closed", testCase.closed)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const incorrectNumericValueCases = [
    {
      name: "reports block NumericLiteral with the wrong double (db-columns-in-block-header-line, first)",
      diagram: "block",
      fixture: "db-columns-in-block-header-line",
      nodeType: "NumericLiteral",
      range: [29, 30],
      expected: {
        where: "NumericLiteral at 29-30",
        message:
          "value is not the number that its written text writes: 3, not 2",
      },
      value: 3,
    },
    {
      name: "reports gitgraph NumericLiteral with the wrong double (config-main-branch, first)",
      diagram: "gitgraph",
      fixture: "config-main-branch",
      nodeType: "NumericLiteral",
      range: [31, 32],
      expected: {
        where: "NumericLiteral at 31-32",
        message:
          "value is not the number that its written text writes: 3, not 2",
      },
      value: 3,
    },
    {
      name: "reports packet NumericLiteral with the wrong double (c4-retained-preheader-yaml, first)",
      diagram: "packet",
      fixture: "c4-retained-preheader-yaml",
      nodeType: "NumericLiteral",
      range: [32, 33],
      expected: {
        where: "NumericLiteral at 32-33",
        message:
          "value is not the number that its written text writes: 1, not 0",
      },
      value: 1,
    },
    {
      name: "reports pie NumericLiteral with the wrong double (comment-before-header, first)",
      diagram: "pie",
      fixture: "comment-before-header",
      nodeType: "NumericLiteral",
      range: [19, 20],
      expected: {
        where: "NumericLiteral at 19-20",
        message:
          "value is not the number that its written text writes: 2, not 1",
      },
      value: 2,
    },
    {
      name: "reports radar NumericLiteral with the wrong double (gram-written-tree, first)",
      diagram: "radar",
      fixture: "gram-written-tree",
      nodeType: "NumericLiteral",
      range: [50, 51],
      expected: {
        where: "NumericLiteral at 50-51",
        message:
          "value is not the number that its written text writes: 2, not 1",
      },
      value: 2,
    },
    {
      name: "reports railroad NumericLiteral with the wrong double (abnf-gram-written-tree, first)",
      diagram: "railroad",
      fixture: "abnf-gram-written-tree",
      nodeType: "NumericLiteral",
      range: [106, 109],
      expected: {
        where: "NumericLiteral at 106-109",
        message:
          "value is not the number that its written text writes: 3, not 2",
      },
      value: 3,
    },
    {
      name: "reports sequence NumericLiteral with the wrong double (config-wrap-site-autonumber, first)",
      diagram: "sequence",
      fixture: "config-wrap-site-autonumber",
      nodeType: "NumericLiteral",
      range: [27, 28],
      expected: {
        where: "NumericLiteral at 27-28",
        message:
          "value is not the number that its written text writes: 3, not 2",
      },
      value: 3,
    },
    {
      name: "reports state NumericLiteral with the wrong double (gram-scale, first)",
      diagram: "state",
      fixture: "gram-scale",
      nodeType: "NumericLiteral",
      range: [24, 27],
      expected: {
        where: "NumericLiteral at 24-27",
        message:
          "value is not the number that its written text writes: 351, not 350",
      },
      value: 351,
    },
    {
      name: "reports treemap NumericLiteral with the wrong double (db-number-comma, first)",
      diagram: "treemap",
      fixture: "db-number-comma",
      nodeType: "NumericLiteral",
      range: [12, 20],
      expected: {
        where: "NumericLiteral at 12-20",
        message:
          "value is not the number that its written text writes: 1235.5, not 1234.5",
      },
      value: 1235.5,
    },
    {
      name: "reports venn NumericLiteral with the wrong double (db-after-indent-number-blank, first)",
      diagram: "venn",
      fixture: "db-after-indent-number-blank",
      nodeType: "NumericLiteral",
      range: [22, 23],
      expected: {
        where: "NumericLiteral at 22-23",
        message:
          "value is not the number that its written text writes: 3, not 2",
      },
      value: 3,
    },
    {
      name: "reports wardley NumericLiteral with the wrong double (comment-header, first)",
      diagram: "wardley",
      fixture: "comment-header",
      nodeType: "NumericLiteral",
      range: [37, 40],
      expected: {
        where: "NumericLiteral at 37-40",
        message:
          "value is not the number that its written text writes: 1.1, not 0.1",
      },
      value: 1.1,
    },
    {
      name: "reports xychart NumericLiteral with the wrong double (config-orientation-frontmatter-header-wins, first)",
      diagram: "xychart",
      fixture: "config-orientation-frontmatter-header-wins",
      nodeType: "NumericLiteral",
      range: [89, 90],
      expected: {
        where: "NumericLiteral at 89-90",
        message:
          "value is not the number that its written text writes: 2, not 1",
      },
      value: 2,
    },
    {
      name: "reports block NumericLiteral with the wrong double (db-columns-overflow, nonfinite)",
      diagram: "block",
      fixture: "db-columns-overflow",
      nodeType: "NumericLiteral",
      range: [21, 421],
      expected: {
        where: "NumericLiteral at 21-421",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports gitgraph NumericLiteral with the wrong double (number-overflow, nonfinite)",
      diagram: "gitgraph",
      fixture: "number-overflow",
      nodeType: "NumericLiteral",
      range: [24, 334],
      expected: {
        where: "NumericLiteral at 24-334",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports packet NumericLiteral with the wrong double (db-explicit-end-overflow-continuity, nonfinite)",
      diagram: "packet",
      fixture: "db-explicit-end-overflow-continuity",
      nodeType: "NumericLiteral",
      range: [9, 409],
      expected: {
        where: "NumericLiteral at 9-409",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports pie NumericLiteral with the wrong double (number-overflow, nonfinite)",
      diagram: "pie",
      fixture: "number-overflow",
      nodeType: "NumericLiteral",
      range: [8, 320],
      expected: {
        where: "NumericLiteral at 8-320",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports radar NumericLiteral with the wrong double (db-number-overflow, nonfinite)",
      diagram: "radar",
      fixture: "db-number-overflow",
      nodeType: "NumericLiteral",
      range: [26, 336],
      expected: {
        where: "NumericLiteral at 26-336",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports railroad NumericLiteral with the wrong double (abnf-db-repeat-max-overflow, nonfinite)",
      diagram: "railroad",
      fixture: "abnf-db-repeat-max-overflow",
      nodeType: "NumericLiteral",
      range: [25, 334],
      expected: {
        where: "NumericLiteral at 25-334",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports sequence NumericLiteral with the wrong double (db-autonumber-start-overflow, nonfinite)",
      diagram: "sequence",
      fixture: "db-autonumber-start-overflow",
      nodeType: "NumericLiteral",
      range: [27, 427],
      expected: {
        where: "NumericLiteral at 27-427",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports sequence NumericLiteral with the wrong double (db-autonumber-step-overflow, nonfinite)",
      diagram: "sequence",
      fixture: "db-autonumber-step-overflow",
      nodeType: "NumericLiteral",
      range: [29, 429],
      expected: {
        where: "NumericLiteral at 29-429",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports state NumericLiteral with the wrong double (gram-scale-width-overflow, nonfinite)",
      diagram: "state",
      fixture: "gram-scale-width-overflow",
      nodeType: "NumericLiteral",
      range: [22, 422],
      expected: {
        where: "NumericLiteral at 22-422",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports treemap NumericLiteral with the wrong double (db-number-overflow, nonfinite)",
      diagram: "treemap",
      fixture: "db-number-overflow",
      nodeType: "NumericLiteral",
      range: [12, 332],
      expected: {
        where: "NumericLiteral at 12-332",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports venn NumericLiteral with the wrong double (db-size-overflow, nonfinite)",
      diagram: "venn",
      fixture: "db-size-overflow",
      nodeType: "NumericLiteral",
      range: [16, 332],
      expected: {
        where: "NumericLiteral at 16-332",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports venn NumericLiteral with the wrong double (db-size-negative-overflow, nonfinite)",
      diagram: "venn",
      fixture: "db-size-negative-overflow",
      nodeType: "NumericLiteral",
      range: [16, 333],
      expected: {
        where: "NumericLiteral at 16-333",
        message:
          "value is not the number that its written text writes: 0, not -Infinity",
      },
      value: 0,
    },
    {
      name: "reports wardley NumericLiteral with the wrong double (db-number-overflow, nonfinite)",
      diagram: "wardley",
      fixture: "db-number-overflow",
      nodeType: "NumericLiteral",
      range: [19, 331],
      expected: {
        where: "NumericLiteral at 19-331",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports xychart NumericLiteral with the wrong double (db-plot-values-overflow, nonfinite)",
      diagram: "xychart",
      fixture: "db-plot-values-overflow",
      nodeType: "NumericLiteral",
      range: [19, 419],
      expected: {
        where: "NumericLiteral at 19-419",
        message:
          "value is not the number that its written text writes: 0, not Infinity",
      },
      value: 0,
    },
    {
      name: "reports xychart NumericLiteral with the wrong double (db-plot-values-negative-overflow, nonfinite)",
      diagram: "xychart",
      fixture: "db-plot-values-negative-overflow",
      nodeType: "NumericLiteral",
      range: [13, 414],
      expected: {
        where: "NumericLiteral at 13-414",
        message:
          "value is not the number that its written text writes: 0, not -Infinity",
      },
      value: 0,
    },
    {
      name: "reports sequence NumericLiteral with the wrong double (db-autonumber-fraction, first)",
      diagram: "sequence",
      fixture: "db-autonumber-fraction",
      nodeType: "NumericLiteral",
      range: [27, 29],
      expected: {
        where: "NumericLiteral at 27-29",
        message:
          "value is not the number that its written text writes: 1.5, not 0.5",
      },
      value: 1.5,
    },
    {
      name: "reports sequence NumericLiteral with the wrong double (db-autonumber-leading-zero, first)",
      diagram: "sequence",
      fixture: "db-autonumber-leading-zero",
      nodeType: "NumericLiteral",
      range: [27, 29],
      expected: {
        where: "NumericLiteral at 27-29",
        message:
          "value is not the number that its written text writes: 6, not 5",
      },
      value: 6,
    },
    {
      name: "reports xychart NumericLiteral with the wrong double (db-plot-values-large, first)",
      diagram: "xychart",
      fixture: "db-plot-values-large",
      nodeType: "NumericLiteral",
      range: [19, 39],
      expected: {
        where: "NumericLiteral at 19-39",
        message:
          "value is not the number that its written text writes: 0, not 100000000000000000000",
      },
      value: 0,
    },
    {
      name: "reports xychart NumericLiteral with the wrong double (db-plot-values-underflow, first)",
      diagram: "xychart",
      fixture: "db-plot-values-underflow",
      nodeType: "NumericLiteral",
      range: [14, 416],
      expected: {
        where: "NumericLiteral at 14-416",
        message:
          "value is not the number that its written text writes: 1, not 0",
      },
      value: 1,
    },
  ] as const
  for (const testCase of incorrectNumericValueCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "value", testCase.value)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const incorrectStringValueCases = [
    {
      name: "reports flowchart StringLiteral with incorrect content (gram-click-href, first)",
      diagram: "flowchart",
      fixture: "gram-click-href",
      nodeType: "StringLiteral",
      range: [28, 31],
      expected: {
        where: "StringLiteral at 28-31",
        message: 'value is not its written text: "uZ", not "u"',
      },
      value: "uZ",
    },
    {
      name: "reports flowchart StringLiteral retaining its comment region in its value (tokens-string-literal-comment-line, tooltip)",
      diagram: "flowchart",
      fixture: "tokens-string-literal-comment-line",
      nodeType: "StringLiteral",
      range: [27, 41],
      expected: {
        where: "StringLiteral at 27-41",
        message:
          'value is not its written text: "one\\n%% c\\ntwo", not "one\\ntwo"',
      },
      value: "one\n%% c\ntwo",
    },
    {
      name: "reports flowchart StringLiteral retaining its directive in its value (lex-directive-in-click-href-string, first)",
      diagram: "flowchart",
      fixture: "lex-directive-in-click-href-string",
      nodeType: "StringLiteral",
      range: [28, 46],
      expected: {
        where: "StringLiteral at 28-46",
        message: 'value is not its written text: "u%%{init: {}}%%v", not "uv"',
      },
      value: "u%%{init: {}}%%v",
    },
  ] as const
  for (const testCase of incorrectStringValueCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "value", testCase.value)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const incorrectStringRawCases = [
    {
      name: "reports flowchart StringLiteral without its source quotes (gram-click-href, first)",
      diagram: "flowchart",
      fixture: "gram-click-href",
      nodeType: "StringLiteral",
      range: [28, 31],
      expected: {
        where: "StringLiteral at 28-31",
        message: 'raw: "u", not "\\"u\\""',
      },
      raw: "u",
    },
    {
      name: "reports flowchart StringLiteral without its comment region in raw (tokens-string-literal-comment-line, tooltip)",
      diagram: "flowchart",
      fixture: "tokens-string-literal-comment-line",
      nodeType: "StringLiteral",
      range: [27, 41],
      expected: {
        where: "StringLiteral at 27-41",
        message: 'raw: "\\"one\\ntwo\\"", not "\\"one\\n%% c\\ntwo\\""',
      },
      raw: '"one\ntwo"',
    },
    {
      name: "reports flowchart StringLiteral without its directive in raw (lex-directive-in-click-href-string, first)",
      diagram: "flowchart",
      fixture: "lex-directive-in-click-href-string",
      nodeType: "StringLiteral",
      range: [28, 46],
      expected: {
        where: "StringLiteral at 28-46",
        message: 'raw: "\\"uv\\"", not "\\"u%%{init: {}}%%v\\""',
      },
      raw: '"uv"',
    },
  ] as const
  for (const testCase of incorrectStringRawCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "raw", testCase.raw)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }

  const incorrectDirectiveClosedFlagCases = [
    {
      name: "reports agentflow Directive marked closed despite its missing closer (comment-open-directive-takes-lf, unclosed)",
      diagram: "agentflow",
      fixture: "comment-open-directive-takes-lf",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[23,32],true]], not [[[23,32],false]]",
      },
    },
    {
      name: "reports architecture Directive marked closed despite its missing closer (hidden-directive-unclosed, unclosed)",
      diagram: "architecture",
      fixture: "hidden-directive-unclosed",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[29,43],true]], not [[[29,43],false]]",
      },
    },
    {
      name: "reports block Directive marked closed despite its missing closer (db-directive-unclosed-end-of-text, unclosed)",
      diagram: "block",
      fixture: "db-directive-unclosed-end-of-text",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[17,28],true]], not [[[17,28],false]]",
      },
    },
    {
      name: "reports c4 Directive marked closed despite its missing closer (db-unclosed-directive-at-end, unclosed)",
      diagram: "c4",
      fixture: "db-unclosed-directive-at-end",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[25,35],true]], not [[[25,35],false]]",
      },
    },
    {
      name: "reports class Directive marked closed despite its missing closer (bare-marker-directive-lines-eef9f5ec, unclosed)",
      diagram: "class",
      fixture: "bare-marker-directive-lines-eef9f5ec",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[18,37],true]], not [[[18,37],false]]",
      },
    },
    {
      name: "reports cynefin Directive marked closed despite its missing closer (directive-unclosed-string, unclosed)",
      diagram: "cynefin",
      fixture: "directive-unclosed-string",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[23,33],true]], not [[[23,33],false]]",
      },
    },
    {
      name: "reports er Directive marked closed despite its missing closer (tokens-unclosed-directive-after-header, unclosed)",
      diagram: "er",
      fixture: "tokens-unclosed-directive-after-header",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[10,23],true]], not [[[10,23],false]]",
      },
    },
    {
      name: "reports eventmodeling Directive marked closed despite its missing closer (directive-unclosed-tail, unclosed)",
      diagram: "eventmodeling",
      fixture: "directive-unclosed-tail",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[26,38],true]], not [[[26,38],false]]",
      },
    },
    {
      name: "reports flowchart Directive marked closed despite its missing closer (ignored-semicolon-after-directive-11e6218c, unclosed)",
      diagram: "flowchart",
      fixture: "ignored-semicolon-after-directive-11e6218c",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[25,36],true]], not [[[25,36],false]]",
      },
    },
    {
      name: "reports gantt Directive marked closed despite its missing closer (tokens-unclosed-directive-after-header, unclosed)",
      diagram: "gantt",
      fixture: "tokens-unclosed-directive-after-header",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[6,24],true]], not [[[6,24],false]]",
      },
    },
    {
      name: "reports gitgraph Directive marked closed despite its missing closer (comment-unclosed-brace, unclosed)",
      diagram: "gitgraph",
      fixture: "comment-unclosed-brace",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[9,19],true]], not [[[9,19],false]]",
      },
    },
    {
      name: "reports packet Directive marked closed despite its missing closer (directive-unclosed-after-header, unclosed)",
      diagram: "packet",
      fixture: "directive-unclosed-after-header",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[7,20],true]], not [[[7,20],false]]",
      },
    },
    {
      name: "reports pie Directive marked closed despite its missing closer (directive-block-open-eof, unclosed)",
      diagram: "pie",
      fixture: "directive-block-open-eof",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[18,26],true]], not [[[18,26],false]]",
      },
    },
    {
      name: "reports radar Directive marked closed despite its missing closer (directive-unclosed, unclosed)",
      diagram: "radar",
      fixture: "directive-unclosed",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[11,28],true]], not [[[11,28],false]]",
      },
    },
    {
      name: "reports railroad Directive marked closed despite its missing closer (ir-directive-unclosed-tail, unclosed)",
      diagram: "railroad",
      fixture: "ir-directive-unclosed-tail",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[32,43],true]], not [[[32,43],false]]",
      },
    },
    {
      name: "reports requirement Directive marked closed despite its missing closer (tokens-unclosed-directive-after-style, unclosed)",
      diagram: "requirement",
      fixture: "tokens-unclosed-directive-after-style",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[54,79],true]], not [[[54,79],false]]",
      },
    },
    {
      name: "reports sankey Directive marked closed despite its missing closer (db-directive-unclosed-at-end, unclosed)",
      diagram: "sankey",
      fixture: "db-directive-unclosed-at-end",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[13,20],true]], not [[[13,20],false]]",
      },
    },
    {
      name: "reports state Directive marked closed despite its missing closer (directive-unclosed-between-statements, unclosed)",
      diagram: "state",
      fixture: "directive-unclosed-between-statements",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[28,65],true]], not [[[28,65],false]]",
      },
    },
    {
      name: "reports treeview Directive marked closed despite its missing closer (directive-accline-open, unclosed)",
      diagram: "treeview",
      fixture: "directive-accline-open",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[25,40],true]], not [[[25,40],false]]",
      },
    },
    {
      name: "reports usecase Directive marked closed despite its missing closer (comment-open-directive, unclosed)",
      diagram: "usecase",
      fixture: "comment-open-directive",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[13,22],true]], not [[[13,22],false]]",
      },
    },
    {
      name: "reports venn Directive marked closed despite its missing closer (db-after-indent-id-label-unclosed-directive, unclosed)",
      diagram: "venn",
      fixture: "db-after-indent-id-label-unclosed-directive",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[29,40],true]], not [[[29,40],false]]",
      },
    },
    {
      name: "reports wardley Directive marked closed despite its missing closer (tail-accelerator-open-directive, unclosed)",
      diagram: "wardley",
      fixture: "tail-accelerator-open-directive",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[37,50],true]], not [[[37,50],false]]",
      },
    },
    {
      name: "reports xychart Directive marked closed despite its missing closer (db-directive-unclosed-after-categories, unclosed)",
      diagram: "xychart",
      fixture: "db-directive-unclosed-after-categories",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[24,31],true]], not [[[24,31],false]]",
      },
    },
    {
      name: "reports info Directive marked closed despite its missing closer (directive-unclosed-after-header, unclosed)",
      diagram: "info",
      fixture: "directive-unclosed-after-header",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[5,28],true]], not [[[5,28],false]]",
      },
    },
    {
      name: "reports ishikawa Directive marked closed despite its missing closer (comment-unclosed-percent-brace, unclosed)",
      diagram: "ishikawa",
      fixture: "comment-unclosed-percent-brace",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[12,18],true]], not [[[12,18],false]]",
      },
    },
    {
      name: "reports journey Directive marked closed despite its missing closer (tokens-unclosed-directive-after-header, unclosed)",
      diagram: "journey",
      fixture: "tokens-unclosed-directive-after-header",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[10,28],true]], not [[[10,28],false]]",
      },
    },
    {
      name: "reports kanban Directive marked closed despite its missing closer (lex-after-bare-directive-unclosed, unclosed)",
      diagram: "kanban",
      fixture: "lex-after-bare-directive-unclosed",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[14,25],true]], not [[[14,25],false]]",
      },
    },
    {
      name: "reports mindmap Directive marked closed despite its missing closer (tokens-unclosed-directive-takes-rest, unclosed)",
      diagram: "mindmap",
      fixture: "tokens-unclosed-directive-takes-rest",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[17,25],true]], not [[[17,25],false]]",
      },
    },
    {
      name: "reports quadrant Directive marked closed despite its missing closer (db-after-acc-descr-directive-unclosed, unclosed)",
      diagram: "quadrant",
      fixture: "db-after-acc-descr-directive-unclosed",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[26,45],true]], not [[[26,45],false]]",
      },
    },
    {
      name: "reports sequence Directive marked closed despite its missing closer (db-unclosed-directive-in-message-text, unclosed)",
      diagram: "sequence",
      fixture: "db-unclosed-directive-in-message-text",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[27,40],true]], not [[[27,40],false]]",
      },
    },
    {
      name: "reports timeline Directive marked closed despite its missing closer (tokens-unclosed-directive-in-period-line, unclosed)",
      diagram: "timeline",
      fixture: "tokens-unclosed-directive-in-period-line",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[13,28],true]], not [[[13,28],false]]",
      },
    },
    {
      name: "reports treemap Directive marked closed despite its missing closer (directive-unclosed, unclosed)",
      diagram: "treemap",
      fixture: "directive-unclosed",
      directiveIndex: 0,
      expected: {
        where: "the directives",
        message:
          "the directives of the tree are not those of the source: [[[14,25],true]], not [[[14,25],false]]",
      },
    },
  ] as const
  for (const testCase of incorrectDirectiveClosedFlagCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(tree)
      setField(broken.directives[testCase.directiveIndex], "closed", true)
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }
})
describe("checkTree: written gaps and unconverted text (ast.md, Nodes)", () => {
  // These mutations exercise the common WrittenText/value check. The diagram
  // supplies the authored form; no diagram-specific shape is changed.
  const writtenTextCases = [
    {
      name: "reports written text without the space between string and text units",
      diagram: "flowchart",
      fixture: "gram-link-text-string-space-text",
      type: "FlowchartLabel",
      range: [17, 22],
      value: "ax",
      expected: 'value is not its written text: "ax", not "a x"',
    },
    {
      name: "reports a written line terminator replaced by its converted line feed",
      diagram: "flowchart",
      fixture: "lex-lone-cr-directive-lf-label",
      type: "FlowchartLabel",
      range: [15, 26],
      value: "a\n\nb",
      expected: 'value is not its written text: "a\\n\\nb", not "a\\r\\nb"',
    },
    {
      name: "reports written attribute quotes replaced by converted quotes",
      diagram: "common",
      fixture: "html-attribute-quotes",
      type: "FlowchartLabel",
      range: [15, 32],
      value: "<a href='u'>t</a>",
      expected:
        'value is not its written text: "<a href=\'u\'>t</a>", not "<a href=\\"u\\">t</a>"',
    },
    {
      name: "reports a written entity replaced by its converted placeholder",
      diagram: "common",
      fixture: "entity-style-acc-title",
      type: "FlowchartLiteral",
      range: [23, 33],
      value: "style:ﬂ°x¶ßy",
      expected:
        'value is not its written text: "style:ﬂ°x¶ßy", not "style:#x;y"',
    },
  ] as const
  for (const testCase of writtenTextCases) {
    it(testCase.name, () => {
      const { input, tree } = recordedTree(testCase.diagram, testCase.fixture)
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === testCase.type &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      setField(node, "value", testCase.value)
      expect(checkTree(input, tree)).toContainEqual({
        where: `${testCase.type} at ${testCase.range[0]}-${testCase.range[1]}`,
        message: testCase.expected,
      })
    })
  }

  it("reports written text without the line feed between string and text units", () => {
    const recorded = recordedTree(
      "flowchart",
      "gram-link-text-string-space-text",
    )
    // diagrams/flowchart.md, The link text contexts, reads a line feed in
    // text. Replace the gap by that accepted spelling before breaking its value.
    const input = recorded.input.replace('"a" x', '"a"\nx')
    const tree = copyOf(recorded.tree)
    for (const node of nodesOf(tree))
      setField(node, "loc", locationOf(input, node.range))
    for (const token of tree.tokens) {
      setField(token, "loc", locationOf(input, token.range))
      setField(token, "value", input.slice(...token.range))
    }
    setField(firstNode(tree, "FlowchartLabel"), "value", "a\nx")
    expect(checkTree(input, tree)).toEqual([])
    setField(firstNode(tree, "FlowchartLabel"), "value", "ax")
    expect(checkTree(input, tree)).toEqual([
      {
        where: "FlowchartLabel at 17-22",
        message: 'value is not its written text: "ax", not "a\\nx"',
      },
    ])
  })
})

describe("checkTree: undecoded single-quoted values (ast.md, StringLiteral)", () => {
  const decodedEscapeCases = [
    {
      name: "reports architecture single-quoted string with decoded escape (c4-component-icontext)",
      diagram: "architecture",
      fixture: "c4-component-icontext",
      nodeType: "StringLiteral",
      range: [30, 43],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 30-43",
        message:
          'value is not its written text: "\\nComponent", not "\\\\nComponent"',
      },
    },
    {
      name: "reports cynefin single-quoted string with decoded escape (lex-string-unknown-single)",
      diagram: "cynefin",
      fixture: "lex-string-unknown-single",
      nodeType: "StringLiteral",
      range: [21, 38],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 21-38",
        message:
          'value is not its written text: "\\nqb\\\\u0041c\\\\x41", not "\\\\nqb\\\\u0041c\\\\x41"',
      },
    },
    {
      name: "reports eventmodeling single-quoted string with decoded escape (data-all-types)",
      diagram: "eventmodeling",
      fixture: "data-all-types",
      nodeType: "StringLiteral",
      range: [117, 123],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 117-123",
        message: 'value is not its written text: "\\nlt", not "\\\\nlt"',
      },
    },
    {
      name: "reports gitgraph single-quoted string with decoded escape (db-compare-bare-and-quoted)",
      diagram: "gitgraph",
      fixture: "db-compare-bare-and-quoted",
      nodeType: "StringLiteral",
      range: [78, 87],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 78-87",
        message: 'value is not its written text: "\\nature", not "\\\\nature"',
      },
    },
    {
      name: "reports packet single-quoted string with decoded escape (db-label-single-escapes)",
      diagram: "packet",
      fixture: "db-label-single-escapes",
      nodeType: "StringLiteral",
      range: [9, 20],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 9-20",
        message:
          'value is not its written text: "\\nn\\\\q\\\\\'\\\\\\\\", not "\\\\nn\\\\q\\\\\'\\\\\\\\"',
      },
    },
    {
      name: "reports pie single-quoted string with decoded escape (label-single-escapes)",
      diagram: "pie",
      fixture: "label-single-escapes",
      nodeType: "StringLiteral",
      range: [4, 16],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 4-16",
        message:
          'value is not its written text: "\\nnB\\\\tC\\\\\\\\D", not "\\\\nnB\\\\tC\\\\\\\\D"',
      },
    },
    {
      name: "reports radar single-quoted string with decoded escape (comment-label)",
      diagram: "radar",
      fixture: "comment-label",
      nodeType: "StringLiteral",
      range: [35, 42],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 35-42",
        message: 'value is not its written text: "\\n% d", not "\\\\n% d"',
      },
    },
    {
      name: "reports railroad single-quoted string with decoded escape (ebnf-div-html-frontmatter-rule-single)",
      diagram: "railroad",
      fixture: "ebnf-div-html-frontmatter-rule-single",
      nodeType: "StringLiteral",
      range: [41, 49],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 41-49",
        message:
          'value is not its written text: "\\n\\"y\\">", not "\\\\n\\"y\\">"',
      },
    },
    {
      name: "reports treemap single-quoted string with decoded escape (div-html-frontmatter-reverse)",
      diagram: "treemap",
      fixture: "div-html-frontmatter-reverse",
      nodeType: "StringLiteral",
      range: [26, 34],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 26-34",
        message:
          'value is not its written text: "\\n\\"y\\">", not "\\\\n\\"y\\">"',
      },
    },
    {
      name: "reports treeview single-quoted string with decoded escape (db-quote-conversion)",
      diagram: "treeview",
      fixture: "db-quote-conversion",
      nodeType: "StringLiteral",
      range: [31, 39],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 31-39",
        message:
          'value is not its written text: "\\nnb\\\\q", not "\\\\nnb\\\\q"',
      },
    },
    {
      name: "reports wardley single-quoted string with decoded escape (c4-component-flow-label)",
      diagram: "wardley",
      fixture: "c4-component-flow-label",
      nodeType: "StringLiteral",
      range: [16, 29],
      valueOwners: [
        {
          type: "WardleyArrow",
          range: [15, 30],
        },
      ],
      expected: {
        where: "StringLiteral at 16-29",
        message:
          'value is not its written text: "\\nComponent", not "\\\\nComponent"',
      },
    },
    {
      name: "reports usecase single-quoted string with decoded escape (lex-native-single-quote-comment-region-control)",
      diagram: "usecase",
      fixture: "lex-native-single-quote-comment-region-control",
      nodeType: "StringLiteral",
      range: [27, 39],
      valueOwners: [],
      expected: {
        where: "StringLiteral at 27-39",
        message:
          'value is not its written text: "\\nrst\u2028last", not "\\\\nrst\u2028last"',
      },
    },
  ] as const
  for (const testCase of decodedEscapeCases) {
    it(testCase.name, () => {
      const recorded = recordedTree(testCase.diagram, testCase.fixture)
      const broken = copyOf(recorded.tree)
      const start = testCase.range[0] + 1
      const input = `${recorded.input.slice(0, start)}\\n${recorded.input.slice(start + 2)}`
      const node = nodesOf(broken).find(
        (candidate) =>
          candidate.type === testCase.nodeType &&
          candidate.range[0] === testCase.range[0] &&
          candidate.range[1] === testCase.range[1],
      )!
      for (const token of broken.tokens)
        setField(token, "value", input.slice(...token.range))
      for (const owner of testCase.valueOwners) {
        const valueOwner = nodesOf(broken).find(
          (candidate) =>
            candidate.type === owner.type &&
            candidate.range[0] === owner.range[0] &&
            candidate.range[1] === owner.range[1],
        )!
        setField(valueOwner, "value", input.slice(...valueOwner.range))
      }
      const raw = input.slice(...node.range)
      setField(node, "raw", raw)
      setField(node, "value", raw.slice(1, -1))
      expect(checkTree(input, broken)).toEqual([])
      setField(node, "value", raw.slice(1, -1).replace("\\n", "\n"))
      expect(checkTree(input, broken)).toContainEqual(testCase.expected)
    })
  }
})

/** The first node of the type `type` for which `holds` is true. */
function nodeOf(
  root: CheckedRoot,
  type: string,
  holds: (node: CheckedNode) => boolean = () => true,
): CheckedNode {
  return nodesOf(root).find((node) => node.type === type && holds(node))!
}

/** The first node in the field `field` of `owner`, a node or a list of nodes. */
function firstIn(owner: CheckedNode, field: string): CheckedNode {
  const value = owner[field] as CheckedNode | CheckedNode[]
  return Array.isArray(value) ? value[0] : value
}

/** Whether the field `field` of `node` holds a node or a nonempty list. */
function holdsNode(node: CheckedNode, field: string): boolean {
  const value = node[field]
  return Array.isArray(value) ? value.length > 0 : value !== null
}

/** Changes the type of the first node in the field `field` of the first node of the type `type` that holds a node there to `to`. */
function retypeChild(
  type: string,
  field: string,
  to: string,
): MutationCase["mutate"] {
  return (root) => {
    const owner = nodeOf(root, type, (node) => holdsNode(node, field))
    setField(firstIn(owner, field), "type", to)
  }
}

/**
 * Makes the first node in the field `field` of the first node of the type
 * `type` that holds a node there a node of the type `to`: the fields
 * `dropped` are taken off it, and `added` are set.
 */
function remakeChild(
  type: string,
  field: string,
  to: string,
  dropped: readonly string[],
  added: (node: CheckedNode) => Record<string, unknown>,
): MutationCase["mutate"] {
  return (root) => {
    const owner = nodeOf(root, type, (node) => holdsNode(node, field))
    const node = firstIn(owner, field)
    const fields = added(node)
    for (const name of dropped) delete (node as Record<string, unknown>)[name]
    setField(node, "type", to)
    for (const [name, value] of Object.entries(fields))
      setField(node, name, value)
  }
}

/** The fields of a StringLiteral that a name node and a RequirementLiteral do not have. */
const STRING_FIELDS = ["raw", "value", "closed"] as const

/** Takes off the `,` token between the first two nodes of the field `field` of the first node of the type `type` that holds two. */
function withoutCommaIn(type: string, field: string): MutationCase["mutate"] {
  return (root) => {
    const owner = nodeOf(
      root,
      type,
      (node) => (node[field] as CheckedNode[]).length > 1,
    )
    const [first, second] = owner[field] as CheckedNode[]
    setField(
      root,
      "tokens",
      root.tokens.filter(
        (token) =>
          !(
            token.value === "," &&
            token.range[0] >= first.range[1] &&
            token.range[1] <= second.range[0]
          ),
      ),
    )
  }
}

/** Takes off the tokens with the text `text` inside the first node of the type `type` for which `holds` is true. */
function withoutTokenIn(
  type: string,
  text: string,
  holds: (node: CheckedNode) => boolean = () => true,
): MutationCase["mutate"] {
  return (root) => {
    const owner = nodeOf(root, type, holds)
    setField(
      root,
      "tokens",
      root.tokens.filter(
        (token) =>
          !(
            token.value === text &&
            token.range[0] >= owner.range[0] &&
            token.range[1] <= owner.range[1]
          ),
      ),
    )
  }
}

/** Leaves the RequirementIgnoredText nodes out of the body of the first requirement. */
function withoutIgnoredTextInBody(root: CheckedRoot): void {
  const statement = nodeOf(root, "RequirementRequirementStatement")
  setField(
    statement,
    "body",
    (statement.body as CheckedNode[]).filter(
      (item) => item.type !== "RequirementIgnoredText",
    ),
  )
}

/** The message of a node whose tokens and child nodes are not in the order of its form. */
const PARTS =
  "the tokens that the node writes itself and its child nodes, in source order"

describe("checkTree: the nodes of a requirement diagram (ast/requirement.md)", () => {
  const requirementCases: readonly MutationCase[] = [
    // The diagram.
    {
      name: "fails the body of a requirement diagram as a PieDiagram",
      fixture: "header-only",
      mutate: (root) => {
        setField(root.body, "type", "PieDiagram")
        setField(root.body, "showData", false)
        setField(root.body, "textBeforeHeader", [])
        setField(root.body, "textBeforeShowData", [])
      },
      expected:
        "Root: the diagram type requirement is not one of those of a PieDiagram: pie",
    },
    {
      name: "fails a field among the statements of a requirement diagram",
      fixture: "db-requirement-all-fields",
      mutate: (root) => {
        const field = nodeOf(root, "RequirementValueField")
        setField(root.body, "body", [
          ...(root.body.body as CheckedNode[]),
          field,
        ])
      },
      expected:
        "RequirementDiagram at 0-118: the field body holds a RequirementValueField, not a RequirementRequirementStatement",
    },
    {
      name: "fails a node for an empty line of a requirement diagram",
      fixture: "lex-style-blank-line-after",
      mutate: (root) => {
        const body = root.body.body as CheckedNode[]
        // The empty line between the style and the element, at 54.
        const node = {
          type: "RequirementIgnoredText",
          value: "",
          range: [54, 54],
          loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 0 } },
        } as CheckedNode
        setField(root.body, "body", [
          ...body.slice(0, 2),
          node,
          ...body.slice(2),
        ])
      },
      expected:
        "RequirementDiagram at 0-68: the field body holds a RequirementIgnoredText, not a RequirementRequirementStatement",
    },
    {
      name: "fails the text of an accessibility title in the converted form",
      fixture: "lex-html-attribute-quote-in-acc-title",
      mutate: (root) => {
        const value = nodeOf(root, "RequirementLiteral")
        setField(value, "value", (value.value as string).replaceAll('"', "'"))
      },
      expected: "RequirementLiteral at 29-43: value is not its written text",
    },
    // RequirementRequirementStatement.
    {
      name: "fails the name of a requirement as an Identifier",
      fixture: "db-requirement-defaults",
      mutate: retypeChild(
        "RequirementRequirementStatement",
        "name",
        "Identifier",
      ),
      expected:
        "the field name holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails the quoted name of a requirement as a RequirementIdentifier",
      fixture: "db-requirement-quoted-values",
      mutate: remakeChild(
        "RequirementRequirementStatement",
        "name",
        "RequirementIdentifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "RequirementIdentifier at 31-39: the tokens of a RequirementIdentifier in name are not all of the kind RawText: String",
    },
    {
      name: "fails a requirement whose name is its class",
      fixture: "db-requirement-second-definition-classes",
      mutate: (root) => {
        const statement = nodeOf(
          root,
          "RequirementRequirementStatement",
          (node) => holdsNode(node, "cssClasses"),
        )
        const [first] = statement.cssClasses as CheckedNode[]
        setField(statement, "cssClasses", [statement.name])
        setField(statement, "name", first)
      },
      expected: `RequirementRequirementStatement at 57-84: ${PARTS}`,
    },
    {
      name: "fails a class after the `:::` of a requirement as an Identifier",
      fixture: "db-requirement-second-definition-classes",
      mutate: retypeChild(
        "RequirementRequirementStatement",
        "cssClasses",
        "Identifier",
      ),
      expected:
        "the field cssClasses holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails a quoted class after the `:::` of a requirement as a RequirementIdentifier",
      fixture: "gram-requirement-class-string",
      mutate: remakeChild(
        "RequirementRequirementStatement",
        "cssClasses",
        "RequirementIdentifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "RequirementIdentifier at 35-40: the tokens of a RequirementIdentifier in cssClasses are not all of the kind RawText: String",
    },
    {
      name: "fails a class of a requirement without `:::`",
      fixture: "db-requirement-defaults",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementRequirementStatement")
        setField(statement, "cssClasses", [statement.name])
      },
      expected: `RequirementRequirementStatement at 19-36: ${PARTS}`,
    },
    {
      name: "fails an item of the body of a requirement that the source does not write",
      fixture: "db-requirement-defaults",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementRequirementStatement")
        // The `}` of the empty body, at 35.
        setField(statement, "body", [
          {
            type: "RequirementIgnoredText",
            value: "}",
            range: [35, 36],
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 1 } },
          },
        ])
      },
      expected: `RequirementRequirementStatement at 19-36: ${PARTS}`,
    },
    // RequirementValueField.
    {
      name: "fails a value field without its colon",
      fixture: "db-requirement-all-fields",
      mutate: withoutTokenIn("RequirementValueField", ":"),
      expected: `RequirementValueField at 47-54: ${PARTS}`,
    },
    {
      name: "fails the unquoted value of a field as a StringLiteral",
      fixture: "db-requirement-all-fields",
      mutate: remakeChild(
        "RequirementValueField",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "StringLiteral at 51-54: the tokens of the string are not one String token or StringFragment tokens: RawText",
    },
    {
      name: "fails the quoted value of a field as a RequirementLiteral",
      fixture: "db-requirement-quoted-values",
      mutate: remakeChild(
        "RequirementValueField",
        "value",
        "RequirementLiteral",
        ["raw", "closed"],
        () => ({}),
      ),
      expected:
        "RequirementLiteral at 48-63: the tokens of a RequirementLiteral are not all of the kind RawText: String",
    },
    // RequirementElementStatement and RequirementElementField.
    {
      name: "fails the name of an element as an Identifier",
      fixture: "db-class-shorthand-requirement-and-element",
      mutate: retypeChild("RequirementElementStatement", "name", "Identifier"),
      expected:
        "the field name holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails a class after the `:::` of an element as an Identifier",
      fixture: "db-element-definition-again-with-class",
      mutate: retypeChild(
        "RequirementElementStatement",
        "cssClasses",
        "Identifier",
      ),
      expected:
        "the field cssClasses holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails an element without its `:::`",
      fixture: "db-element-definition-again-with-class",
      mutate: withoutTokenIn("RequirementElementStatement", ":::", (node) =>
        holdsNode(node, "cssClasses"),
      ),
      expected: `RequirementElementStatement at 33-50: ${PARTS}`,
    },
    {
      name: "fails an element without the comma between its classes",
      fixture: "spec-requirement-diagram-a8854583",
      mutate: withoutCommaIn("RequirementElementStatement", "cssClasses"),
      expected: `RequirementElementStatement at 51-85: ${PARTS}`,
    },
    {
      name: "fails a class of an element without `:::`",
      fixture: "db-element-fields",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementElementStatement")
        setField(statement, "cssClasses", [statement.name])
      },
      expected: `RequirementElementStatement at 19-73: ${PARTS}`,
    },
    {
      name: "fails an item of the body of an element that the source does not write",
      fixture: "db-element-definition-again-with-class",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementElementStatement")
        // The `}` of the empty body of the first element, at 31.
        setField(statement, "body", [
          {
            type: "RequirementIgnoredText",
            value: "}",
            range: [31, 32],
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 1 } },
          },
        ])
      },
      expected: `RequirementElementStatement at 19-32: ${PARTS}`,
    },
    {
      name: "fails an element field without its colon",
      fixture: "db-element-fields",
      mutate: withoutTokenIn("RequirementElementField", ":"),
      expected: `RequirementElementField at 33-49: ${PARTS}`,
    },
    {
      name: "fails the value of an element field as a RequirementIdentifier",
      fixture: "db-element-fields",
      mutate: remakeChild(
        "RequirementElementField",
        "value",
        "RequirementIdentifier",
        ["value"],
        (node) => ({ name: node.value }),
      ),
      expected:
        "RequirementElementField at 33-49: the field value holds a RequirementIdentifier, not a RequirementLiteral or StringLiteral",
    },
    {
      name: "fails the unquoted value of an element field as a StringLiteral",
      fixture: "db-element-fields",
      mutate: remakeChild(
        "RequirementElementField",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "the tokens of the string are not one String token or StringFragment tokens: RawText",
    },
    {
      name: "fails the quoted value of an element field as a RequirementLiteral",
      fixture: "gram-element-docref-quoted-url",
      mutate: remakeChild(
        "RequirementElementField",
        "value",
        "RequirementLiteral",
        ["raw", "closed"],
        () => ({}),
      ),
      expected:
        "the tokens of a RequirementLiteral are not all of the kind RawText: String",
    },
    {
      name: "fails the field of an element field in the case in which it is written",
      fixture: "db-element-fields",
      mutate: (root) => {
        setField(
          nodeOf(
            root,
            "RequirementElementField",
            (node) => node.field === "docref",
          ),
          "field",
          "docRef",
        )
      },
      expected:
        'RequirementElementField at 52-71: the field field is "docRef", none of type, docref',
    },
    // RequirementRelationshipStatement.
    {
      name: "fails the first end of a relationship as an Identifier",
      fixture: "db-relationship-arrows",
      mutate: retypeChild(
        "RequirementRelationshipStatement",
        "left",
        "Identifier",
      ),
      expected:
        "the field left holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails the second end of a relationship as an Identifier",
      fixture: "db-relationship-arrows",
      mutate: retypeChild(
        "RequirementRelationshipStatement",
        "right",
        "Identifier",
      ),
      expected:
        "the field right holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    // RequirementDirectionStatement.
    {
      name: "fails the text before a direction as a RequirementLiteral",
      fixture: "lex-direction-line-text-before-and-after",
      mutate: retypeChild(
        "RequirementDirectionStatement",
        "textBefore",
        "RequirementLiteral",
      ),
      expected:
        "RequirementDirectionStatement at 19-39: the field textBefore holds a RequirementLiteral, not a RequirementIgnoredText",
    },
    {
      name: "fails the text after a direction as a RequirementLiteral",
      fixture: "lex-direction-line-text-before-and-after",
      mutate: retypeChild(
        "RequirementDirectionStatement",
        "textAfter",
        "RequirementLiteral",
      ),
      expected:
        "RequirementDirectionStatement at 19-39: the field textAfter holds a RequirementLiteral, not a RequirementIgnoredText",
    },
    {
      name: "fails a direction statement with a text before where the source writes none",
      fixture: "db-direction-last-wins",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementDirectionStatement")
        // The keyword `direction` of `direction LR`, at 19.
        setField(statement, "textBefore", {
          type: "RequirementIgnoredText",
          value: "direction",
          range: [19, 28],
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 9 } },
        })
      },
      expected: `RequirementDirectionStatement at 19-31: ${PARTS}`,
    },
    {
      name: "fails a direction statement with a text after where the source writes none",
      fixture: "db-direction-last-wins",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementDirectionStatement")
        // The value `LR` of `direction LR`, at 29.
        setField(statement, "textAfter", {
          type: "RequirementIgnoredText",
          value: "LR",
          range: [29, 31],
          loc: { start: { line: 2, column: 10 }, end: { line: 2, column: 12 } },
        })
      },
      expected: `RequirementDirectionStatement at 19-31: ${PARTS}`,
    },
    // RequirementStyleStatement and RequirementClassDefStatement.
    {
      name: "fails a quoted name of a style as an Identifier",
      fixture: "lex-style-string-name",
      mutate: remakeChild(
        "RequirementStyleStatement",
        "names",
        "Identifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "Identifier at 48-54: the tokens of a Identifier in names are not all of the kind Identifier: String",
    },
    {
      name: "fails a style without the comma between its styles",
      fixture: "db-style-statement",
      mutate: withoutCommaIn("RequirementStyleStatement", "styles"),
      expected: `RequirementStyleStatement at 51-82: ${PARTS}`,
    },
    {
      name: "fails a class definition without the comma between its classes",
      fixture: "db-class-def",
      mutate: withoutCommaIn("RequirementClassDefStatement", "cssClasses"),
      expected: `RequirementClassDefStatement at 51-75: ${PARTS}`,
    },
    {
      name: "fails a class definition without the comma between its styles",
      fixture: "db-class-def",
      mutate: withoutCommaIn("RequirementClassDefStatement", "styles"),
      expected: `RequirementClassDefStatement at 19-50: ${PARTS}`,
    },
    {
      name: "fails a style of a class definition as a RequirementIdentifier",
      fixture: "db-class-def",
      mutate: remakeChild(
        "RequirementClassDefStatement",
        "styles",
        "RequirementIdentifier",
        ["value"],
        (node) => ({ name: node.value }),
      ),
      expected:
        "RequirementClassDefStatement at 19-50: the field styles holds a RequirementIdentifier, not a RequirementLiteral",
    },
    {
      name: "fails a quoted class of a class definition as an Identifier",
      fixture: "lex-classdef-string-name",
      mutate: remakeChild(
        "RequirementClassDefStatement",
        "cssClasses",
        "Identifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "Identifier at 46-52: the tokens of a Identifier in cssClasses are not all of the kind Identifier: String",
    },
    // RequirementClassStatement.
    {
      name: "fails a name after `class` as an Identifier",
      fixture: "db-class-statement",
      mutate: retypeChild("RequirementClassStatement", "names", "Identifier"),
      expected:
        "the field names holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails a class after `class` as an Identifier",
      fixture: "db-class-statement",
      mutate: retypeChild(
        "RequirementClassStatement",
        "cssClasses",
        "Identifier",
      ),
      expected:
        "the field cssClasses holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails a quoted name after `class` as a RequirementIdentifier",
      fixture: "db-name-quoted-and-unquoted-same",
      mutate: remakeChild(
        "RequirementClassStatement",
        "names",
        "RequirementIdentifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "the tokens of a RequirementIdentifier in names are not all of the kind Identifier: String",
    },
    {
      name: "fails a quoted class after `class` as a RequirementIdentifier",
      fixture: "gram-class-string-class",
      mutate: remakeChild(
        "RequirementClassStatement",
        "cssClasses",
        "RequirementIdentifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "RequirementIdentifier at 45-51: the tokens of a RequirementIdentifier in cssClasses are not all of the kind Identifier or RawText: String",
    },
    {
      name: "fails a class statement without the comma between its names",
      fixture: "db-class-statement",
      mutate: withoutCommaIn("RequirementClassStatement", "names"),
      expected: `RequirementClassStatement at 51-64: ${PARTS}`,
    },
    {
      name: "fails a class statement without the comma between its classes",
      fixture: "db-class-statement",
      mutate: withoutCommaIn("RequirementClassStatement", "cssClasses"),
      expected: `RequirementClassStatement at 51-64: ${PARTS}`,
    },
    // RequirementClassShorthandStatement.
    {
      name: "fails the name before the `:::` of a shorthand as an Identifier",
      fixture: "db-class-colon-form",
      mutate: retypeChild(
        "RequirementClassShorthandStatement",
        "name",
        "Identifier",
      ),
      expected:
        "the field name holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails a class after the `:::` of a shorthand as an Identifier",
      fixture: "db-class-colon-form",
      mutate: retypeChild(
        "RequirementClassShorthandStatement",
        "cssClasses",
        "Identifier",
      ),
      expected:
        "the field cssClasses holds a Identifier, not a RequirementIdentifier or StringLiteral",
    },
    {
      name: "fails a shorthand without the comma between its classes",
      fixture: "db-class-colon-form",
      mutate: withoutCommaIn(
        "RequirementClassShorthandStatement",
        "cssClasses",
      ),
      expected: `RequirementClassShorthandStatement at 51-58: ${PARTS}`,
    },
    {
      name: "fails a shorthand as a RequirementClassStatement",
      fixture: "db-class-colon-form",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementClassShorthandStatement")
        const name = statement.name
        delete (statement as Record<string, unknown>).name
        setField(statement, "type", "RequirementClassStatement")
        setField(statement, "names", [name])
      },
      expected: `RequirementClassStatement at 51-58: ${PARTS}`,
    },
    // The accessibility statements.
    {
      name: "fails the text of an accessibility title as a StringLiteral",
      fixture: "db-acc-title-descr",
      mutate: remakeChild(
        "RequirementAccTitleStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "StringLiteral at 31-33: the tokens of the string are not one String token or StringFragment tokens: RawText",
    },
    {
      name: "fails the text of an accessibility description as a StringLiteral",
      fixture: "db-acc-title-descr",
      mutate: remakeChild(
        "RequirementAccDescrStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "StringLiteral at 60-62: the tokens of the string are not one String token or StringFragment tokens: RawText",
    },
    {
      name: "fails an accessibility title without its value",
      fixture: "db-acc-title-descr",
      mutate: (root) => {
        setField(nodeOf(root, "RequirementAccTitleStatement"), "value", null)
      },
      expected:
        "RequirementAccTitleStatement at 19-33: the field value is null, not a node",
    },
    {
      name: "fails an accessibility description without its value",
      fixture: "db-acc-title-descr",
      mutate: (root) => {
        setField(nodeOf(root, "RequirementAccDescrStatement"), "value", null)
      },
      expected:
        "RequirementAccDescrStatement at 49-62: the field value is null, not a node",
    },
    {
      name: "fails an accessibility title whose text starts at the line feed after its colon",
      fixture: "gram-acc-title-line-feed-then-text",
      mutate: (root) => {
        // The line feed after `accTitle:`, at 28, and the text `T`.
        const value = firstIn(
          nodeOf(root, "RequirementAccTitleStatement"),
          "value",
        )
        setField(value, "range", [28, 30])
        setField(value, "loc", {
          start: { line: 2, column: 9 },
          end: { line: 3, column: 1 },
        })
        setField(value, "value", "\nT")
      },
      expected:
        'RequirementLiteral at 28-30: the RequirementLiteral starts or ends with whitespace: "\\nT"',
    },
    {
      name: "fails an accessibility description whose value stops before the end of its line",
      fixture: "db-acc-title-descr",
      mutate: (root) => {
        // `d1` at 60, without its last character.
        const value = firstIn(
          nodeOf(root, "RequirementAccDescrStatement"),
          "value",
        )
        setField(value, "range", [60, 61])
        setField(value, "loc", {
          start: { line: 4, column: 11 },
          end: { line: 4, column: 12 },
        })
        setField(value, "value", "d")
      },
      expected: 'RawText at 60-62 of "d1": lies in no value node',
    },
    {
      name: "fails an accessibility title whose value is whitespace only",
      fixture: "db-acc-title-descr",
      mutate: (root) => {
        setField(
          firstIn(nodeOf(root, "RequirementAccTitleStatement"), "value"),
          "value",
          "  ",
        )
      },
      expected:
        'RequirementAccTitleStatement at 19-33: the value of an accessibility statement starts or ends with whitespace: "  "',
    },
    {
      name: "fails an empty description block with a value",
      fixture: "gram-acc-descr-block-empty",
      mutate: (root) => {
        // Between the braces of `accDescr {}`, at 29.
        setField(nodeOf(root, "RequirementAccDescrBlockStatement"), "value", {
          type: "RequirementLiteral",
          value: "",
          range: [29, 29],
          loc: { start: { line: 2, column: 10 }, end: { line: 2, column: 10 } },
        })
      },
      expected: "RequirementLiteral at 29-29: the RequirementLiteral is empty",
    },
    {
      name: "fails a description block that holds only a directive with a value",
      fixture: "gram-acc-descr-block-directive-only",
      mutate: (root) => {
        // After the directive, before `}`, at 43.
        setField(nodeOf(root, "RequirementAccDescrBlockStatement"), "value", {
          type: "RequirementLiteral",
          value: "",
          range: [43, 43],
          loc: { start: { line: 2, column: 24 }, end: { line: 2, column: 24 } },
        })
      },
      expected: "RequirementLiteral at 43-43: the RequirementLiteral is empty",
    },
    {
      name: "fails a description block without its closing brace",
      fixture: "db-acc-descr-block",
      mutate: withoutTokenIn("RequirementAccDescrBlockStatement", "}"),
      expected:
        "RequirementAccDescrBlockStatement at 19-49: does not run from the start of a token to the end of a token",
    },
    // RequirementIdentifier and RequirementLiteral.
    {
      name: "fails a name that leaves out the whitespace between its words",
      fixture: "db-requirement-name-spaces",
      mutate: (root) => {
        setField(nodeOf(root, "RequirementIdentifier"), "name", "spacedname")
      },
      expected: "RequirementIdentifier at 32-43: name is not its written text",
    },
    {
      name: "fails a name that leaves out the U+00A0 between its characters",
      fixture: "lex-whitespace-nbsp-in-name",
      mutate: (root) => {
        setField(nodeOf(root, "RequirementIdentifier"), "name", "ab")
      },
      expected: "RequirementIdentifier at 31-34: name is not its written text",
    },
    {
      name: "fails a value that leaves out the whitespace between its words",
      fixture: "db-requirement-value-spaces",
      mutate: (root) => {
        setField(
          nodeOf(
            root,
            "RequirementLiteral",
            (node) => node.value === "spaced out",
          ),
          "value",
          "spacedout",
        )
      },
      expected: "RequirementLiteral at 57-67: value is not its written text",
    },
    {
      name: "fails a style without a comma that holds only its first unit",
      fixture: "lex-style-no-comma",
      mutate: (root) => {
        setField(
          firstIn(nodeOf(root, "RequirementStyleStatement"), "styles"),
          "value",
          "fill:red",
        )
      },
      expected:
        'RequirementLiteral at 45-65: value is not the texts of its tokens joined: "fill:red", not "fill:redstroke:blue"',
    },
    // RequirementIgnoredText.
    {
      name: "fails two empty description blocks of a body held as one node",
      fixture: "gram-empty-description-blocks-adjacent-in-body",
      mutate: (root) => {
        const statement = nodeOf(root, "RequirementRequirementStatement")
        const [first, second, ...rest] = statement.body as CheckedNode[]
        const range = [first.range[0], second.range[1]] as const
        setField(statement, "body", [
          {
            ...first,
            range,
            loc: { start: first.loc.start, end: second.loc.end },
            value: "accDescr {} accDescr {}",
          },
          ...rest,
        ])
      },
      expected:
        "RequirementIgnoredText at 35-58: the text of an item of a body, without its whitespace, which is an empty description block",
    },
    // An empty description block in a body is one node wherever it stands
    // on its line, so leaving it out of the body is reported.
    {
      name: "fails an empty description block after `{` left out of the body",
      fixture: "gram-empty-description-block-after-brace",
      mutate: withoutIgnoredTextInBody,
      expected: `RequirementRequirementStatement at 19-54: ${PARTS}`,
    },
    {
      name: "fails an empty description block before a field left out of the body",
      fixture: "gram-empty-description-block-before-field",
      mutate: withoutIgnoredTextInBody,
      expected: `RequirementRequirementStatement at 19-54: ${PARTS}`,
    },
    {
      name: "fails an empty description block after a field whose value is a string left out of the body",
      fixture: "gram-empty-description-block-after-string-value",
      mutate: withoutIgnoredTextInBody,
      expected: `RequirementRequirementStatement at 19-56: ${PARTS}`,
    },
    {
      name: "fails an empty description block before `}` left out of the body",
      fixture: "gram-empty-description-block-before-close-brace",
      mutate: withoutIgnoredTextInBody,
      expected: `RequirementRequirementStatement at 19-48: ${PARTS}`,
    },
  ]
  for (const testCase of requirementCases) {
    it(testCase.name, () => {
      const { base, mutated } = problemsOf("requirement", testCase)
      expect(base).toEqual([])
      expect(
        says(mutated, testCase.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})

/** The `index`th node of the type `type` of `root`, in the order of the walk. */
function nthNode(root: CheckedRoot, type: string, index = 0): CheckedNode {
  return nodesOf(root).filter((node) => node.type === type)[index]
}

/** Sets the range of `node` to `range` of `input`, with its location. */
function placeAt(
  node: CheckedNode,
  input: string,
  range: readonly [number, number],
): void {
  setField(node, "range", range)
  setField(node, "loc", locationOf(input, range))
}

/** Moves the first node of the list `from` of the first node of the type `type` that holds one there to the end of its list `to`. */
function moveFirst(
  type: string,
  from: string,
  to: string,
): InputCase["mutate"] {
  return (root) => {
    const owner = nodeOf(root, type, (node) => holdsNode(node, from))
    const [first, ...rest] = owner[from] as CheckedNode[]
    setField(owner, from, rest)
    setField(owner, to, [...(owner[to] as CheckedNode[]), first])
  }
}

/** Moves the first node of the list `field` of the first node of the type `type` that holds one there into the body of the diagram, after that node. */
function moveToBody(type: string, field: string): InputCase["mutate"] {
  return (root) => {
    const owner = nodeOf(root, type, (node) => holdsNode(node, field))
    const [first, ...rest] = owner[field] as CheckedNode[]
    setField(owner, field, rest)
    const body = root.body.body as CheckedNode[]
    const at = body.indexOf(owner) + 1
    setField(root.body, "body", [
      ...body.slice(0, at),
      first,
      ...body.slice(at),
    ])
  }
}

/** Makes the first PacketIgnoredText in the list `field` of the first node of the type `type` that holds one there a PacketLiteral with the same value. */
function hiddenAsLiteral(type: string, field: string): InputCase["mutate"] {
  return (root) => {
    const owner = nodeOf(root, type, (node) => holdsNode(node, field))
    const node = firstIn(owner, field)
    delete (node as Record<string, unknown>).kind
    setField(node, "type", "PacketLiteral")
  }
}

/** Leaves the `index`th item out of the body of the diagram. */
function withoutBodyItem(index: number): InputCase["mutate"] {
  return (root) => {
    setField(
      root.body,
      "body",
      (root.body.body as CheckedNode[]).filter((_item, at) => at !== index),
    )
  }
}

/** Sets the range of the `index`th node of the type `type` to `range`, and its value to the input there when it has one. */
function rangeOf(
  type: string,
  range: readonly [number, number],
  index = 0,
): InputCase["mutate"] {
  return (root, input) => {
    const node = nthNode(root, type, index)
    placeAt(node, input, range)
    if (typeof node.value === "string")
      setField(node, "value", input.slice(...range))
  }
}

/** Makes the first node of the type `type` hold a NumericLiteral `raw` in place of its number in `field`. */
function numberOf(
  type: string,
  field: string,
  raw: string,
): InputCase["mutate"] {
  return (root) => {
    const number = firstIn(nodeOf(root, type), field)
    setField(number, "raw", raw)
    setField(number, "value", Number(raw))
  }
}

/** Gives the first node of the type `type` the value `value`, a PacketLiteral at `range` of the input. */
function packetValueAt(
  type: string,
  range: readonly [number, number],
): InputCase["mutate"] {
  return (root, input) => {
    setField(nodeOf(root, type), "value", {
      type: "PacketLiteral",
      value: input.slice(...range),
      range,
      loc: locationOf(input, range),
    })
  }
}

/** Makes the first diagram comment a hidden directive in the suffix of the first node of the type `type`, with its RawText token. */
function commentAsSuffix(type: string): InputCase["mutate"] {
  return (root, input) => {
    const [comment] = root.comments
    const node = {
      type: "PacketIgnoredText",
      kind: "directive",
      value: input.slice(...comment.range),
      range: comment.range,
      loc: comment.loc,
    }
    setField(nodeOf(root, type), "textAfter", [node])
    setField(root, "comments", [])
    setField(
      root,
      "tokens",
      [
        ...root.tokens,
        {
          type: "RawText",
          value: node.value,
          range: node.range,
          loc: node.loc,
        },
      ].sort((first, second) => first.range[0] - second.range[0]),
    )
  }
}

describe("checkTree: the nodes of a packet diagram (ast/packet.md)", () => {
  itFailsEachRecorded("packet", [
    // The fields keep authored values; null, empty lists, and source order.
    {
      name: "fails a packet label that is not its written text",
      fixture: "gram-mixed",
      mutate: (root) => {
        setField(nodeOf(root, "StringLiteral"), "value", "twoZ")
      },
      expected:
        'StringLiteral at 10-15: value is not its written text: "twoZ", not "two"',
    },
    {
      name: "fails a packet title without its null value field",
      fixture: "title-empty",
      mutate: (root) => {
        delete (nodeOf(root, "PacketTitleStatement") as Record<string, unknown>)
          .value
      },
      expected: "PacketTitleStatement at 7-12: lacks the field value",
    },
    {
      name: "fails an absent gap of a relative block that is null instead of an empty list",
      fixture: "gram-mixed",
      mutate: (root) => {
        setField(
          nodeOf(root, "PacketRelativeBlockStatement"),
          "textBeforeCount",
          null,
        )
      },
      expected:
        "PacketRelativeBlockStatement at 7-15: the field textBeforeCount is null, not a list",
    },
    {
      name: "fails two hidden suffixes out of source order",
      fixture: "lex-hidden-two-suffixes",
      mutate: (root) => {
        const statement = nodeOf(root, "PacketSingleBlockStatement")
        setField(
          statement,
          "textAfter",
          [...(statement.textAfter as CheckedNode[])].reverse(),
        )
      },
      expected:
        "PacketIgnoredText at 12-22: comes before the child node PacketIgnoredText at 23-33 of PacketSingleBlockStatement at 7-33, which the child fields list before it",
    },
    // PacketDiagram.
    {
      name: "fails a YAML form retained before the header as a PacketLiteral",
      fixture: "detect-one-block",
      mutate: hiddenAsLiteral("PacketDiagram", "textBeforeHeader"),
      expected:
        "PacketDiagram at 11-33: the field textBeforeHeader holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a diagram without the YAML form retained before its header",
      fixture: "detect-one-block",
      mutate: (root) => {
        setField(root.body, "textBeforeHeader", [])
      },
      expected: 'RawText at 11-20 of "---\\nx\\n---": lies in no value node',
    },
    {
      name: "fails a diagram without the directive retained before its header",
      fixture: "detect-second-scan-directive",
      mutate: (root) => {
        setField(root.body, "textBeforeHeader", [])
      },
      expected: 'RawText at 0-4 of "%%{\\n": lies in no value node',
    },
    {
      name: "fails a label among the items of a packet body",
      fixture: "gram-mixed",
      mutate: (root) => {
        setField(root.body, "body", [
          ...(root.body.body as CheckedNode[]),
          nodeOf(root, "StringLiteral"),
        ])
      },
      expected:
        "PacketDiagram at 0-38: the field body holds a StringLiteral, not a PacketRangeBlockStatement or PacketSingleBlockStatement or PacketRelativeBlockStatement or PacketTitleStatement or PacketAccTitleStatement or PacketAccDescrStatement or PacketAccDescrBlockStatement or PacketIgnoredText",
    },
    {
      name: "fails a body without the hidden form after a visible line feed",
      fixture: "lex-hidden-after-visible-eol",
      mutate: withoutBodyItem(1),
      expected: 'RawText at 13-20 of "%%{!}%%": lies in no value node',
    },
    {
      name: "fails a diagram that starts at its header after a retained form",
      fixture: "detect-one-block",
      mutate: rangeOf("PacketDiagram", [21, 33]),
      expected:
        "PacketIgnoredText at 11-20: lies outside PacketDiagram at 21-33",
    },
    {
      name: "fails a diagram that starts at a bare comment line before its header",
      fixture: "detect-empty-braces-bare",
      mutate: rangeOf("PacketDiagram", [0, 13]),
      expected:
        "PacketDiagram at 0-13: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a diagram that runs over the line feed after its last form",
      fixture: "lex-title-two-spaces",
      mutate: rangeOf("PacketDiagram", [0, 15]),
      expected:
        "PacketDiagram at 0-15: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails the header `packet-beta` as a RawText token",
      fixture: "spec-packet-c4580507",
      mutate: (root) => {
        setField(root.tokens[0], "type", "RawText")
      },
      expected: 'RawText at 0-11 of "packet-beta": lies in no value node',
    },
    {
      name: "fails a `packet-beta` diagram whose diagram type is `packet-beta`",
      fixture: "spec-packet-c4580507",
      mutate: (root) => {
        setField(root, "diagramType", "packet-beta")
      },
      expected:
        "Root: the diagram type packet-beta is not one of those of a PacketDiagram: packet",
    },
    {
      name: "fails a bare comment line passed before the header left out of the comments",
      fixture: "detect-empty-braces-bare",
      mutate: (root) => {
        setField(root, "comments", [])
      },
      expected:
        'offset 0: the character outside the tokens and comments is not whitespace: "%"',
    },
    {
      name: "fails a retained YAML form that starts at the line feed before it",
      fixture: "detect-one-block",
      mutate: rangeOf("PacketIgnoredText", [10, 20]),
      expected:
        "PacketIgnoredText at 10-20: lies outside PacketDiagram at 11-33",
    },
    {
      name: "fails a retained YAML form that ends before its closing fence",
      fixture: "detect-one-block",
      mutate: rangeOf("PacketIgnoredText", [11, 19]),
      expected:
        "PacketIgnoredText at 11-19: does not run from the start of a token to the end of a token",
    },
    // PacketBodyItem.
    {
      name: "fails a repeated title left out of the body",
      fixture: "title-repeat-empty",
      mutate: withoutBodyItem(1),
      expected: 'RawText at 25-31 of "Second": lies in no value node',
    },
    {
      name: "fails an empty title left out of the body",
      fixture: "title-repeat-empty",
      mutate: withoutBodyItem(2),
      expected:
        'PacketTitleStatement at 19-31: the gap is not ASCII whitespace and LF: "\\ntitle\\n"',
    },
    {
      name: "fails a block beyond the publication cap left out of the body",
      fixture: "db-cap-following-block-unpublished",
      mutate: withoutBodyItem(1),
      expected: 'Numeric at 20-21 of "1": lies in no value node',
    },
    {
      name: "fails a range block that publication splits held as two nodes",
      fixture: "db-row-split",
      mutate: (root) => {
        const body = root.body.body as CheckedNode[]
        setField(root.body, "body", [
          ...body,
          (copyOf(root).body.body as CheckedNode[])[1],
        ])
      },
      expected:
        "PacketRangeBlockStatement at 20-33: overlaps the child node PacketRangeBlockStatement at 20-33 of PacketDiagram at 0-33",
    },
    {
      name: "fails a relative block with a start field",
      fixture: "gram-mixed",
      mutate: (root) => {
        const statement = nodeOf(root, "PacketRelativeBlockStatement")
        setField(statement, "start", statement.count)
      },
      expected:
        "PacketRelativeBlockStatement at 7-15: has the field start, which its type does not have",
    },
    {
      name: "fails a node for the blank line between two blocks",
      fixture: "gram-block-blank-lines",
      mutate: (root, input) => {
        const body = root.body.body as CheckedNode[]
        // The empty line between the blocks, at 13.
        const node = {
          type: "PacketIgnoredText",
          kind: "directive",
          value: "",
          range: [13, 13],
          loc: locationOf(input, [13, 13]),
        } as CheckedNode
        setField(root.body, "body", [body[0], node, body[1]])
      },
      expected:
        "PacketIgnoredText at 13-13: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails the YAML form before a block left out of the body",
      fixture: "gram-yaml-around-range",
      mutate: withoutBodyItem(0),
      expected: 'RawText at 7-16 of "---\\nx\\n---": lies in no value node',
    },
    // PacketRangeBlockStatement.
    {
      name: "fails the start of a range block as a StringLiteral",
      fixture: "gram-zero-range",
      mutate: remakeChild(
        "PacketRangeBlockStatement",
        "start",
        "StringLiteral",
        [],
        (node) => ({ value: node.raw, closed: true }),
      ),
      expected:
        "PacketRangeBlockStatement at 7-14: the field start holds a StringLiteral, not a NumericLiteral",
    },
    {
      name: "fails the start of a range block that is not the written number",
      fixture: "gram-zero-range",
      mutate: numberOf("PacketRangeBlockStatement", "start", "1"),
      expected: 'NumericLiteral at 7-8: raw: "1", not "0"',
    },
    {
      name: "fails a range block without its start",
      fixture: "gram-zero-range",
      mutate: (root) => {
        setField(nodeOf(root, "PacketRangeBlockStatement"), "start", null)
      },
      expected:
        "PacketRangeBlockStatement at 7-14: the field start is null, not a node",
    },
    {
      name: "fails the end of a range block as a StringLiteral",
      fixture: "gram-zero-range",
      mutate: remakeChild(
        "PacketRangeBlockStatement",
        "end",
        "StringLiteral",
        [],
        (node) => ({ value: node.raw, closed: true }),
      ),
      expected:
        "PacketRangeBlockStatement at 7-14: the field end holds a StringLiteral, not a NumericLiteral",
    },
    {
      name: "fails the end of a range block that is not the written number",
      fixture: "gram-zero-range",
      mutate: numberOf("PacketRangeBlockStatement", "end", "1"),
      expected: 'NumericLiteral at 9-10: raw: "1", not "0"',
    },
    {
      name: "fails the end of a range block that publication splits that is not its written end",
      fixture: "db-row-split",
      mutate: (root) => {
        const end = nthNode(root, "PacketRangeBlockStatement", 1)
          .end as CheckedNode
        setField(end, "raw", "31")
        setField(end, "value", 31)
      },
      expected: 'NumericLiteral at 23-25: raw: "31", not "90"',
    },
    {
      name: "fails a range block without its label",
      fixture: "gram-zero-range",
      mutate: (root) => {
        setField(nodeOf(root, "PacketRangeBlockStatement"), "label", null)
      },
      expected:
        "PacketRangeBlockStatement at 7-14: the field label is null, not a node",
    },
    {
      name: "fails the label of a range block as a PacketLiteral",
      fixture: "gram-zero-range",
      mutate: remakeChild(
        "PacketRangeBlockStatement",
        "label",
        "PacketLiteral",
        ["raw", "closed"],
        () => ({}),
      ),
      expected:
        "PacketRangeBlockStatement at 7-14: the field label holds a PacketLiteral, not a StringLiteral",
    },
    {
      name: "fails a range block with equal endpoints as a single block",
      fixture: "gram-zero-range",
      mutate: (root) => {
        const statement = nodeOf(root, "PacketRangeBlockStatement")
        for (const field of ["end", "textBeforeDash", "textBeforeEnd"])
          delete (statement as Record<string, unknown>)[field]
        setField(statement, "type", "PacketSingleBlockStatement")
      },
      expected: 'Numeric at 9-10 of "0": lies in no value node',
    },
    {
      name: "fails a hidden form before the range dash as a PacketLiteral",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: hiddenAsLiteral("PacketRangeBlockStatement", "textBeforeDash"),
      expected:
        "PacketRangeBlockStatement at 7-38: the field textBeforeDash holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the range dash moved after the dash",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: moveFirst(
        "PacketRangeBlockStatement",
        "textBeforeDash",
        "textBeforeEnd",
      ),
      expected:
        "PacketIgnoredText at 8-15: comes before the child node PacketIgnoredText at 17-24 of PacketRangeBlockStatement at 7-38, which the child fields list before it",
    },
    {
      name: "fails a hidden form after the range dash as a PacketLiteral",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: hiddenAsLiteral("PacketRangeBlockStatement", "textBeforeEnd"),
      expected:
        "PacketRangeBlockStatement at 7-38: the field textBeforeEnd holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form after the range dash moved before the dash",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: moveFirst(
        "PacketRangeBlockStatement",
        "textBeforeEnd",
        "textBeforeDash",
      ),
      expected:
        'PacketRangeBlockStatement at 7-38: the gap is not hidden ASCII whitespace: " -"',
    },
    {
      name: "fails a hidden form before the colon of a range block as a PacketLiteral",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: hiddenAsLiteral("PacketRangeBlockStatement", "textBeforeColon"),
      expected:
        "PacketRangeBlockStatement at 7-38: the field textBeforeColon holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the colon of a range block moved before its end",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: moveFirst(
        "PacketRangeBlockStatement",
        "textBeforeColon",
        "textBeforeEnd",
      ),
      expected:
        "NumericLiteral at 25-26: comes before the child node PacketIgnoredText at 26-33 of PacketRangeBlockStatement at 7-38, which the child fields list before it",
    },
    {
      name: "fails a hidden suffix of a range block as a PacketLiteral",
      fixture: "gram-yaml-around-range",
      mutate: hiddenAsLiteral("PacketRangeBlockStatement", "textAfter"),
      expected:
        "PacketRangeBlockStatement at 17-33: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of a range block moved to the body",
      fixture: "gram-yaml-around-range",
      mutate: moveToBody("PacketRangeBlockStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 24-33: overlaps the child node PacketRangeBlockStatement at 17-33 of PacketDiagram at 0-33",
    },
    {
      name: "fails a range block that starts before its first digit",
      fixture: "gram-zero-range",
      mutate: rangeOf("PacketRangeBlockStatement", [6, 14]),
      expected:
        "PacketRangeBlockStatement at 6-14: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a range block that ends before its closing quote",
      fixture: "gram-zero-range",
      mutate: rangeOf("PacketRangeBlockStatement", [7, 13]),
      expected:
        "PacketRangeBlockStatement at 7-13: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a range block that runs over the line feed after it",
      fixture: "gram-zero-range",
      mutate: rangeOf("PacketRangeBlockStatement", [7, 15]),
      expected:
        "PacketRangeBlockStatement at 7-15: lies outside PacketDiagram at 0-14",
    },
    {
      name: "fails a range block that ends at its label before its hidden suffix",
      fixture: "gram-yaml-around-range",
      mutate: rangeOf("PacketRangeBlockStatement", [17, 24]),
      expected:
        "PacketIgnoredText at 24-33: lies outside PacketRangeBlockStatement at 17-24",
    },
    // PacketSingleBlockStatement.
    {
      name: "fails the start of a single block as a StringLiteral",
      fixture: "gram-block-blank-lines",
      mutate: remakeChild(
        "PacketSingleBlockStatement",
        "start",
        "StringLiteral",
        [],
        (node) => ({ value: node.raw, closed: true }),
      ),
      expected:
        "PacketSingleBlockStatement at 7-12: the field start holds a StringLiteral, not a NumericLiteral",
    },
    {
      name: "fails the start of a single block that is not the written number",
      fixture: "gram-block-blank-lines",
      mutate: numberOf("PacketSingleBlockStatement", "start", "5"),
      expected: 'NumericLiteral at 7-8: raw: "5", not "0"',
    },
    {
      name: "fails a single block without its label",
      fixture: "gram-block-blank-lines",
      mutate: (root) => {
        setField(nodeOf(root, "PacketSingleBlockStatement"), "label", null)
      },
      expected:
        "PacketSingleBlockStatement at 7-12: the field label is null, not a node",
    },
    {
      name: "fails the label of a single block as a PacketLiteral",
      fixture: "gram-block-blank-lines",
      mutate: remakeChild(
        "PacketSingleBlockStatement",
        "label",
        "PacketLiteral",
        ["raw", "closed"],
        () => ({}),
      ),
      expected:
        "PacketSingleBlockStatement at 7-12: the field label holds a PacketLiteral, not a StringLiteral",
    },
    {
      name: "fails a single block with an end field",
      fixture: "gram-block-blank-lines",
      mutate: (root) => {
        const statement = nodeOf(root, "PacketSingleBlockStatement")
        setField(statement, "end", statement.start)
      },
      expected:
        "PacketSingleBlockStatement at 7-12: has the field end, which its type does not have",
    },
    {
      name: "fails a hidden form before the colon of a single block as a PacketLiteral",
      fixture: "gram-single-hidden-gaps",
      mutate: hiddenAsLiteral("PacketSingleBlockStatement", "textBeforeColon"),
      expected:
        "PacketSingleBlockStatement at 7-30: the field textBeforeColon holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the colon of a single block moved after the colon",
      fixture: "gram-single-hidden-gaps",
      mutate: moveFirst(
        "PacketSingleBlockStatement",
        "textBeforeColon",
        "textBeforeLabel",
      ),
      expected:
        "PacketIgnoredText at 8-16: comes before the child node PacketIgnoredText at 18-26 of PacketSingleBlockStatement at 7-30, which the child fields list before it",
    },
    {
      name: "fails a hidden form before the label of a single block as a PacketLiteral",
      fixture: "gram-single-hidden-gaps",
      mutate: hiddenAsLiteral("PacketSingleBlockStatement", "textBeforeLabel"),
      expected:
        "PacketSingleBlockStatement at 7-30: the field textBeforeLabel holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the label of a single block moved before the colon",
      fixture: "gram-single-hidden-gaps",
      mutate: moveFirst(
        "PacketSingleBlockStatement",
        "textBeforeLabel",
        "textBeforeColon",
      ),
      expected:
        'PacketSingleBlockStatement at 7-30: the gap is not hidden ASCII whitespace: " :"',
    },
    {
      name: "fails a global directive record among the gaps of a single block",
      fixture: "gram-single-hidden-gaps",
      mutate: remakeChild(
        "PacketSingleBlockStatement",
        "textBeforeColon",
        "Directive",
        ["kind"],
        (node) => ({ name: "", value: node.value, closed: true }),
      ),
      expected:
        "PacketSingleBlockStatement at 7-30: the field textBeforeColon holds a Directive, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of a single block as a PacketLiteral",
      fixture: "lex-hidden-two-suffixes",
      mutate: hiddenAsLiteral("PacketSingleBlockStatement", "textAfter"),
      expected:
        "PacketSingleBlockStatement at 7-33: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of a single block moved to the body",
      fixture: "lex-hidden-two-suffixes",
      mutate: moveToBody("PacketSingleBlockStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 12-22: overlaps the child node PacketSingleBlockStatement at 7-33 of PacketDiagram at 0-33",
    },
    {
      name: "fails a single block that starts before its digit",
      fixture: "gram-block-blank-lines",
      mutate: rangeOf("PacketSingleBlockStatement", [6, 12]),
      expected:
        "PacketSingleBlockStatement at 6-12: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a single block that ends at its label before its hidden suffixes",
      fixture: "lex-hidden-two-suffixes",
      mutate: rangeOf("PacketSingleBlockStatement", [7, 12]),
      expected:
        "PacketIgnoredText at 12-22: lies outside PacketSingleBlockStatement at 7-12",
    },
    // PacketRelativeBlockStatement.
    {
      name: "fails the count of a relative block as a StringLiteral",
      fixture: "gram-mixed",
      mutate: remakeChild(
        "PacketRelativeBlockStatement",
        "count",
        "StringLiteral",
        [],
        (node) => ({ value: node.raw, closed: true }),
      ),
      expected:
        "PacketRelativeBlockStatement at 7-15: the field count holds a StringLiteral, not a NumericLiteral",
    },
    {
      name: "fails the count of a relative block that is not the written number",
      fixture: "gram-mixed",
      mutate: numberOf("PacketRelativeBlockStatement", "count", "3"),
      expected: 'NumericLiteral at 8-9: raw: "3", not "2"',
    },
    {
      name: "fails the count of a relative block that holds its plus",
      fixture: "gram-mixed",
      mutate: (root, input) => {
        const count = firstIn(
          nodeOf(root, "PacketRelativeBlockStatement"),
          "count",
        )
        placeAt(count, input, [7, 9])
        setField(count, "raw", "+2")
      },
      expected:
        "NumericLiteral at 7-9: has 2 tokens, not the one that a node of this type has",
    },
    {
      name: "fails a relative block without its label",
      fixture: "gram-mixed",
      mutate: (root) => {
        setField(nodeOf(root, "PacketRelativeBlockStatement"), "label", null)
      },
      expected:
        "PacketRelativeBlockStatement at 7-15: the field label is null, not a node",
    },
    {
      name: "fails the label of a relative block as a PacketLiteral",
      fixture: "gram-mixed",
      mutate: remakeChild(
        "PacketRelativeBlockStatement",
        "label",
        "PacketLiteral",
        ["raw", "closed"],
        () => ({}),
      ),
      expected:
        "PacketRelativeBlockStatement at 7-15: the field label holds a PacketLiteral, not a StringLiteral",
    },
    {
      name: "fails a relative block with an end field",
      fixture: "gram-mixed",
      mutate: (root) => {
        const statement = nodeOf(root, "PacketRelativeBlockStatement")
        setField(statement, "end", statement.count)
      },
      expected:
        "PacketRelativeBlockStatement at 7-15: has the field end, which its type does not have",
    },
    {
      name: "fails a relative block that starts at its count",
      fixture: "gram-mixed",
      mutate: rangeOf("PacketRelativeBlockStatement", [8, 15]),
      expected:
        'PacketRelativeBlockStatement at 8-15: the block\'s authored operators: [":"], not ["+",":"]',
    },
    {
      name: "fails a hidden form before the count of a relative block as a PacketLiteral",
      fixture: "gram-hidden-gap",
      mutate: hiddenAsLiteral(
        "PacketRelativeBlockStatement",
        "textBeforeCount",
      ),
      expected:
        "PacketRelativeBlockStatement at 7-29: the field textBeforeCount holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the count of a relative block moved before its label",
      fixture: "gram-hidden-gap",
      mutate: moveFirst(
        "PacketRelativeBlockStatement",
        "textBeforeCount",
        "textBeforeLabel",
      ),
      expected:
        "PacketIgnoredText at 8-15: comes before the child node PacketIgnoredText at 18-25 of PacketRelativeBlockStatement at 7-29, which the child fields list before it",
    },
    {
      name: "fails a relative block without the YAML form between its plus and its count",
      fixture: "gram-hidden-yaml-gap",
      mutate: (root) => {
        setField(
          nodeOf(root, "PacketRelativeBlockStatement"),
          "textBeforeCount",
          [],
        )
      },
      expected: 'RawText at 8-17 of "---\\nx\\n---": lies in no value node',
    },
    {
      name: "fails a hidden form before the label of a relative block as a PacketLiteral",
      fixture: "gram-hidden-gap",
      mutate: hiddenAsLiteral(
        "PacketRelativeBlockStatement",
        "textBeforeLabel",
      ),
      expected:
        "PacketRelativeBlockStatement at 7-29: the field textBeforeLabel holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the label of a relative block moved before its count",
      fixture: "gram-hidden-gap",
      mutate: moveFirst(
        "PacketRelativeBlockStatement",
        "textBeforeLabel",
        "textBeforeCount",
      ),
      expected:
        "NumericLiteral at 16-17: comes before the child node PacketIgnoredText at 18-25 of PacketRelativeBlockStatement at 7-29, which the child fields list before it",
    },
    {
      name: "fails a hidden form before the colon of a relative block as a PacketLiteral",
      fixture: "gram-relative-hidden-colon",
      mutate: hiddenAsLiteral(
        "PacketRelativeBlockStatement",
        "textBeforeColon",
      ),
      expected:
        "PacketRelativeBlockStatement at 7-21: the field textBeforeColon holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden form before the colon of a relative block moved before its count",
      fixture: "gram-relative-hidden-colon",
      mutate: moveFirst(
        "PacketRelativeBlockStatement",
        "textBeforeColon",
        "textBeforeCount",
      ),
      expected:
        "NumericLiteral at 8-9: comes before the child node PacketIgnoredText at 9-16 of PacketRelativeBlockStatement at 7-21, which the child fields list before it",
    },
    // The hidden suffixes and the leaves of the three block nodes.
    {
      name: "fails two hidden suffixes held as one node",
      fixture: "lex-hidden-two-suffixes",
      mutate: (root, input) => {
        const statement = nodeOf(root, "PacketSingleBlockStatement")
        const [first] = statement.textAfter as CheckedNode[]
        placeAt(first, input, [12, 33])
        setField(first, "value", input.slice(12, 33))
        setField(statement, "textAfter", [first])
      },
      expected:
        'PacketIgnoredText at 12-33: the texts of its tokens joined are not its written text: "%%{!one}%%%%{!two}%%", not "%%{!one}%% %%{!two}%%"',
    },
    {
      name: "fails a hidden suffix whose range holds the line feed after it",
      fixture: "hidden-yaml-crlf",
      mutate: rangeOf("PacketIgnoredText", [13, 26]),
      expected:
        "PacketIgnoredText at 13-26: lies outside PacketSingleBlockStatement at 8-24",
    },
    {
      name: "fails a body form after a visible line feed moved into the hidden suffixes of the block before it",
      fixture: "lex-hidden-after-visible-eol",
      mutate: (root) => {
        const [first, hidden, ...rest] = root.body.body as CheckedNode[]
        setField(first, "textAfter", [hidden])
        setField(root.body, "body", [first, ...rest])
      },
      expected:
        "PacketIgnoredText at 13-20: lies outside PacketSingleBlockStatement at 7-12",
    },
    {
      name: "fails a label whose value decodes an escape",
      fixture: "db-label-escapes",
      mutate: (root) => {
        const label = nodeOf(root, "StringLiteral")
        setField(label, "value", (label.value as string).replace("\\b", "\b"))
      },
      expected:
        'StringLiteral at 9-42: value is not its written text: "a\\b\\\\f\\\\n\\\\r\\\\t\\\\v\\\\0\\\\q\\\\u0041\\\\x41\\\\\\\\\\\\\\"", not "a\\\\b\\\\f\\\\n\\\\r\\\\t\\\\v\\\\0\\\\q\\\\u0041\\\\x41\\\\\\\\\\\\\\""',
    },
    {
      name: "fails a label that is not closed",
      fixture: "gram-mixed",
      mutate: (root) => {
        setField(nodeOf(root, "StringLiteral"), "closed", false)
      },
      expected: "StringLiteral at 10-15: closed: false, not true",
    },
    {
      name: "fails a count whose value is not the double of its digits",
      fixture: "db-precision-rounded",
      mutate: (root) => {
        setField(nodeOf(root, "NumericLiteral"), "value", 9007199254740994)
      },
      expected:
        "NumericLiteral at 8-24: value is not the number that its written text writes: 9007199254740994, not 9007199254740992",
    },
    // PacketTitleStatement.
    {
      name: "fails the value of a title as a StringLiteral",
      fixture: "comment-title",
      mutate: remakeChild(
        "PacketTitleStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "PacketTitleStatement at 7-14: the field value holds a StringLiteral, not a PacketLiteral",
    },
    {
      name: "fails a title value that is not its written text",
      fixture: "comment-title",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", "B")
      },
      expected:
        'PacketLiteral at 13-14: value is not its written text: "B", not "A"',
    },
    {
      name: "fails a hidden suffix of a title as a PacketLiteral",
      fixture: "hidden-directive-title-eof",
      mutate: hiddenAsLiteral("PacketTitleStatement", "textAfter"),
      expected:
        "PacketTitleStatement at 7-21: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of a title moved to the body",
      fixture: "hidden-directive-title-spare",
      mutate: moveToBody("PacketTitleStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 14-21: overlaps the child node PacketTitleStatement at 7-21 of PacketDiagram at 0-28",
    },
    {
      name: "fails a title value that starts at its first separator",
      fixture: "lex-title-two-spaces",
      mutate: rangeOf("PacketLiteral", [12, 14]),
      expected:
        "PacketLiteral at 12-14: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a title value that leaves out the padding at its end",
      fixture: "common-whitespace",
      mutate: rangeOf("PacketLiteral", [13, 22]),
      expected:
        "PacketLiteral at 13-22: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a title without a separator with a value",
      fixture: "title-empty",
      mutate: packetValueAt("PacketTitleStatement", [12, 12]),
      expected:
        "PacketLiteral at 12-12: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a title with one separator and nothing after it with a value",
      fixture: "lex-title-one-space",
      mutate: packetValueAt("PacketTitleStatement", [13, 13]),
      expected:
        "PacketLiteral at 13-13: lies outside PacketTitleStatement at 7-12",
    },
    {
      name: "fails a title whose second separator is null instead of a whitespace value",
      fixture: "lex-title-two-spaces",
      mutate: (root) => {
        setField(nodeOf(root, "PacketTitleStatement"), "value", null)
      },
      expected:
        "RawText at 13-14: starts with whitespace or a line terminator where no value starts",
    },
    {
      name: "fails a title that runs over the line feed after its value",
      fixture: "lex-title-two-spaces",
      mutate: rangeOf("PacketTitleStatement", [7, 15]),
      expected:
        "PacketTitleStatement at 7-15: lies outside PacketDiagram at 0-14",
    },
    {
      name: "fails a null title that runs over its separator after its keyword",
      fixture: "lex-title-one-space",
      mutate: rangeOf("PacketTitleStatement", [7, 13]),
      expected:
        "PacketTitleStatement at 7-13: lies outside PacketDiagram at 0-12",
    },
    {
      name: "fails a title that ends at its value before its hidden suffix",
      fixture: "hidden-directive-title-eof",
      mutate: rangeOf("PacketTitleStatement", [7, 14]),
      expected:
        "PacketIgnoredText at 14-21: lies outside PacketTitleStatement at 7-14",
    },
    {
      name: "fails a native comment after a title held as its hidden suffix",
      fixture: "comment-title",
      mutate: commentAsSuffix("PacketTitleStatement"),
      expected:
        "PacketIgnoredText at 14-20: lies outside PacketTitleStatement at 7-14",
    },
    // PacketAccTitleStatement.
    {
      name: "fails the value of an accessibility title as a StringLiteral",
      fixture: "comment-acctitle",
      mutate: remakeChild(
        "PacketAccTitleStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "PacketAccTitleStatement at 7-18: the field value holds a StringLiteral, not a PacketLiteral",
    },
    {
      name: "fails an accessibility title value that is not its written text",
      fixture: "comment-acctitle",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", " B")
      },
      expected:
        'PacketLiteral at 16-18: value is not its written text: " B", not " A"',
    },
    {
      name: "fails a hidden suffix of an accessibility title as a PacketLiteral",
      fixture: "hidden-directive-acctitle-eof",
      mutate: hiddenAsLiteral("PacketAccTitleStatement", "textAfter"),
      expected:
        "PacketAccTitleStatement at 7-25: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of an accessibility title moved to the body",
      fixture: "hidden-directive-acctitle-spare",
      mutate: moveToBody("PacketAccTitleStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 18-25: overlaps the child node PacketAccTitleStatement at 7-25 of PacketDiagram at 0-32",
    },
    {
      name: "fails an accessibility title value that leaves out the space after its colon",
      fixture: "comment-acctitle",
      mutate: rangeOf("PacketLiteral", [17, 18]),
      expected:
        "PacketLiteral at 17-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an empty accessibility title with a value",
      fixture: "acctitle-empty",
      mutate: packetValueAt("PacketAccTitleStatement", [16, 16]),
      expected:
        "PacketLiteral at 16-16: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an accessibility title of a directive only with a value",
      fixture: "lex-acctitle-directive-only",
      mutate: packetValueAt("PacketAccTitleStatement", [26, 26]),
      expected:
        "PacketLiteral at 26-26: lies outside PacketAccTitleStatement at 7-16",
    },
    {
      name: "fails a whitespace-only accessibility title that is null",
      fixture: "acctitle-repeat-empty",
      mutate: (root) => {
        setField(nthNode(root, "PacketAccTitleStatement", 2), "value", null)
      },
      expected:
        "RawText at 49-51: starts with whitespace or a line terminator where no value starts",
    },
    {
      name: "fails an accessibility title that runs over the line feed after its value",
      fixture: "comment-acctitle",
      mutate: rangeOf("PacketAccTitleStatement", [7, 19]),
      expected:
        "PacketAccTitleStatement at 7-19: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an empty accessibility title that runs over the line feed after its colon",
      fixture: "acctitle-empty",
      mutate: rangeOf("PacketAccTitleStatement", [7, 17]),
      expected:
        "PacketAccTitleStatement at 7-17: lies outside PacketDiagram at 0-16",
    },
    {
      name: "fails an accessibility title that ends at its value before its hidden suffix",
      fixture: "hidden-directive-acctitle-eof",
      mutate: rangeOf("PacketAccTitleStatement", [7, 18]),
      expected:
        "PacketIgnoredText at 18-25: lies outside PacketAccTitleStatement at 7-18",
    },
    {
      name: "fails a native comment after an accessibility title held as its hidden suffix",
      fixture: "comment-acctitle",
      mutate: commentAsSuffix("PacketAccTitleStatement"),
      expected:
        "PacketIgnoredText at 18-24: lies outside PacketAccTitleStatement at 7-18",
    },
    // PacketAccDescrStatement.
    {
      name: "fails the value of an accessibility description as a StringLiteral",
      fixture: "comment-accdescr",
      mutate: remakeChild(
        "PacketAccDescrStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "PacketAccDescrStatement at 7-18: the field value holds a StringLiteral, not a PacketLiteral",
    },
    {
      name: "fails an accessibility description value that is not its written text",
      fixture: "comment-accdescr",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", " B")
      },
      expected:
        'PacketLiteral at 16-18: value is not its written text: " B", not " A"',
    },
    {
      name: "fails a hidden suffix of an accessibility description as a PacketLiteral",
      fixture: "hidden-directive-accdescr-eof",
      mutate: hiddenAsLiteral("PacketAccDescrStatement", "textAfter"),
      expected:
        "PacketAccDescrStatement at 7-25: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of an accessibility description moved to the body",
      fixture: "hidden-directive-accdescr-spare",
      mutate: moveToBody("PacketAccDescrStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 18-25: overlaps the child node PacketAccDescrStatement at 7-25 of PacketDiagram at 0-32",
    },
    {
      name: "fails an accessibility description value that leaves out the space after its colon",
      fixture: "comment-accdescr",
      mutate: rangeOf("PacketLiteral", [17, 18]),
      expected:
        "PacketLiteral at 17-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an empty accessibility description with a value",
      fixture: "accdescr-line-empty",
      mutate: packetValueAt("PacketAccDescrStatement", [16, 16]),
      expected:
        "PacketLiteral at 16-16: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an accessibility description of a directive only with a value",
      fixture: "lex-accdescr-directive-only",
      mutate: packetValueAt("PacketAccDescrStatement", [26, 26]),
      expected:
        "PacketLiteral at 26-26: lies outside PacketAccDescrStatement at 7-16",
    },
    {
      name: "fails a whitespace-only accessibility description that is null",
      fixture: "lex-accdescr-whitespace-only",
      mutate: (root) => {
        setField(nodeOf(root, "PacketAccDescrStatement"), "value", null)
      },
      expected:
        "RawText at 16-18: starts with whitespace or a line terminator where no value starts",
    },
    {
      name: "fails an accessibility description written with a brace after its colon as a description block",
      fixture: "lex-description-colon-first",
      mutate: (root) => {
        setField(
          nodeOf(root, "PacketAccDescrStatement"),
          "type",
          "PacketAccDescrBlockStatement",
        )
      },
      expected:
        'PacketAccDescrBlockStatement at 7-22: the common statement\'s fixed components: "accDescr:", not "accDescr{}"',
    },
    {
      name: "fails an accessibility description that runs over the line feed after its value",
      fixture: "comment-accdescr",
      mutate: rangeOf("PacketAccDescrStatement", [7, 19]),
      expected:
        "PacketAccDescrStatement at 7-19: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an empty accessibility description that runs over the line feed after its colon",
      fixture: "accdescr-line-empty",
      mutate: rangeOf("PacketAccDescrStatement", [7, 17]),
      expected:
        "PacketAccDescrStatement at 7-17: lies outside PacketDiagram at 0-16",
    },
    {
      name: "fails an accessibility description that ends at its value before its hidden suffix",
      fixture: "hidden-directive-accdescr-eof",
      mutate: rangeOf("PacketAccDescrStatement", [7, 18]),
      expected:
        "PacketIgnoredText at 18-25: lies outside PacketAccDescrStatement at 7-18",
    },
    {
      name: "fails a native comment after an accessibility description held as its hidden suffix",
      fixture: "comment-accdescr",
      mutate: commentAsSuffix("PacketAccDescrStatement"),
      expected:
        "PacketIgnoredText at 18-24: lies outside PacketAccDescrStatement at 7-18",
    },
    // PacketAccDescrBlockStatement.
    {
      name: "fails the value of a description block as a StringLiteral",
      fixture: "accdescr-block-lines",
      mutate: remakeChild(
        "PacketAccDescrBlockStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "PacketAccDescrBlockStatement at 7-31: the field value holds a StringLiteral, not a PacketLiteral",
    },
    {
      name: "fails a hidden suffix of a description block as a PacketLiteral",
      fixture: "hidden-directive-description-eof",
      mutate: hiddenAsLiteral("PacketAccDescrBlockStatement", "textAfter"),
      expected:
        "PacketAccDescrBlockStatement at 7-28: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "fails a hidden suffix of a description block moved to the body",
      fixture: "hidden-directive-description-spare",
      mutate: moveToBody("PacketAccDescrBlockStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 21-28: overlaps the child node PacketAccDescrBlockStatement at 7-28 of PacketDiagram at 0-35",
    },
    {
      name: "fails a description block value that keeps the whitespace at its ends",
      fixture: "accdescr-block-lines",
      mutate: rangeOf("PacketLiteral", [18, 30]),
      expected:
        "PacketLiteral at 18-30: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a description block value that leaves out its internal indentation",
      fixture: "accdescr-block-lines",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", "A  B\n\nC")
      },
      expected:
        'PacketLiteral at 20-29: value is not its written text: "A  B\\n\\nC", not "A  B\\n\\n  C"',
    },
    {
      name: "fails an empty packet description block with a value",
      fixture: "gram-empty-description",
      mutate: packetValueAt("PacketAccDescrBlockStatement", [17, 17]),
      expected:
        "PacketAccDescrBlockStatement at 7-18: the common value is not the complete composite lexical value (or null when empty)",
    },
    {
      name: "fails a whitespace-only description block with a value",
      fixture: "lex-description-whitespace-only",
      mutate: packetValueAt("PacketAccDescrBlockStatement", [18, 18]),
      expected:
        "PacketLiteral at 18-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a directive-only description block with a value",
      fixture: "lex-description-directive-only",
      mutate: packetValueAt("PacketAccDescrBlockStatement", [27, 27]),
      expected:
        "PacketLiteral at 27-27: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a comment-only description block with a value",
      fixture: "lex-description-comment-only",
      mutate: packetValueAt("PacketAccDescrBlockStatement", [29, 29]),
      expected:
        "PacketLiteral at 29-29: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an empty description block left out of the body",
      fixture: "gram-empty-description",
      mutate: withoutBodyItem(0),
      expected:
        'PacketDiagram at 0-24: the gap is not ASCII whitespace and LF: "\\naccDescr {}\\n"',
    },
    {
      name: "fails a description block that ends before its closing brace",
      fixture: "accdescr-block-lines",
      mutate: rangeOf("PacketAccDescrBlockStatement", [7, 30]),
      expected:
        "PacketAccDescrBlockStatement at 7-30: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an empty description block that ends before its closing brace",
      fixture: "gram-empty-description",
      mutate: rangeOf("PacketAccDescrBlockStatement", [7, 17]),
      expected:
        'PacketAccDescrBlockStatement at 7-17: the gap is not ASCII whitespace and LF: "}\\n"',
    },
    {
      name: "fails a description block that ends at its brace before its hidden suffix",
      fixture: "hidden-directive-description-eof",
      mutate: rangeOf("PacketAccDescrBlockStatement", [7, 21]),
      expected:
        "PacketIgnoredText at 21-28: lies outside PacketAccDescrBlockStatement at 7-21",
    },
    {
      name: "fails a native comment after a description block held as its hidden suffix",
      fixture: "comment-block-description",
      mutate: commentAsSuffix("PacketAccDescrBlockStatement"),
      expected:
        "PacketIgnoredText at 21-27: lies outside PacketAccDescrBlockStatement at 7-21",
    },
    // PacketLiteral.
    {
      name: "fails a title value that holds the directive inside it",
      fixture: "directive-title-value",
      mutate: (root, input) => {
        setField(nodeOf(root, "PacketLiteral"), "value", input.slice(13, 28))
      },
      expected:
        'PacketLiteral at 13-28: value is not its written text: "A%%{init:{}}%%B", not "AB"',
    },
    {
      name: "fails a title value that ends before the directive inside it",
      fixture: "directive-title-value",
      mutate: rangeOf("PacketLiteral", [13, 14]),
      expected: 'RawText at 27-28 of "B": lies in no value node',
    },
    {
      name: "fails a title value that decodes its entities",
      fixture: "entity-all-text",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", "& #")
      },
      expected:
        'PacketLiteral at 13-23: value is not its written text: "& #", not "&amp; #35;"',
    },
    {
      name: "fails a title value whose whitespace runs are collapsed",
      fixture: "common-whitespace",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", " A B C ")
      },
      expected:
        'PacketLiteral at 13-24: value is not its written text: " A B C ", not "\\t A  B\\t\\tC \\t"',
    },
    {
      name: "fails a title value with an open quote as a StringLiteral",
      fixture: "title-open-quote",
      mutate: remakeChild(
        "PacketTitleStatement",
        "value",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, value: "open", closed: false }),
      ),
      expected:
        "PacketTitleStatement at 7-18: the field value holds a StringLiteral, not a PacketLiteral",
    },
    // PacketIgnoredText.
    {
      name: "fails a hidden form whose kind is `yaml`",
      fixture: "detect-one-block",
      mutate: (root) => {
        setField(nodeOf(root, "PacketIgnoredText"), "kind", "yaml")
      },
      expected:
        'PacketIgnoredText at 11-20: the field kind is "yaml", none of yaml-block, directive',
    },
    {
      name: "fails a hidden YAML form whose kind is `directive`",
      fixture: "detect-one-block",
      mutate: (root) => {
        setField(nodeOf(root, "PacketIgnoredText"), "kind", "directive")
      },
      expected:
        "PacketIgnoredText at 11-20: the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    },
    {
      name: "fails a hidden form that is not its written text",
      fixture: "detect-one-block",
      mutate: (root) => {
        setField(nodeOf(root, "PacketIgnoredText"), "value", "---\ny\n---")
      },
      expected:
        'PacketIgnoredText at 11-20: value is not its written text: "---\\ny\\n---", not "---\\nx\\n---"',
    },
    {
      name: "fails a hidden directive that starts at the space before it",
      fixture: "lex-hidden-two-suffixes",
      mutate: rangeOf("PacketIgnoredText", [22, 33], 1),
      expected:
        "PacketIgnoredText at 22-33: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a hidden YAML form that leaves out the padding after its opening fence",
      fixture: "hidden-yaml-padding",
      mutate: (root) => {
        setField(nodeOf(root, "PacketIgnoredText"), "value", "---\nx\n---")
      },
      expected:
        'PacketIgnoredText at 7-18: value is not its written text: "---\\nx\\n---", not "--- \\t\\nx\\n---"',
    },
    {
      name: "fails a hidden directive whose range holds the CR after it",
      fixture: "hidden-directive-crlf",
      mutate: rangeOf("PacketIgnoredText", [13, 21]),
      expected:
        "PacketIgnoredText at 13-21: lies outside PacketSingleBlockStatement at 8-20",
    },
    {
      name: "fails a hidden YAML form that writes its CRLF line endings as LF",
      fixture: "hidden-yaml-crlf",
      mutate: (root) => {
        setField(nodeOf(root, "PacketIgnoredText"), "value", "---\nx\n---")
      },
      expected:
        'PacketIgnoredText at 13-24: value is not its written text: "---\\nx\\n---", not "---\\r\\nx\\r\\n---"',
    },
    {
      name: "fails a hidden YAML form at the end of the text that runs over the appended line feed",
      fixture: "hidden-yaml-block-eof",
      mutate: (root, input) => {
        const node = nodeOf(root, "PacketIgnoredText")
        setField(node, "range", [12, input.length + 1])
        setField(node, "value", `${input.slice(12)}\n`)
      },
      expected: "PacketIgnoredText at 12-22: lies outside the input",
    },
    {
      name: "fails a hidden directive whose value holds the global directive inside it",
      fixture: "lex-hidden-nested-global",
      mutate: (root, input) => {
        setField(nodeOf(root, "PacketIgnoredText"), "value", input.slice(7, 27))
      },
      expected:
        'PacketIgnoredText at 7-27: value is not its written text: "%%{! %%{wrap}%% !}%%", not "%%{!  !}%%"',
    },
    {
      name: "fails a global directive inside a hidden directive left out of the directives",
      fixture: "lex-hidden-nested-global",
      mutate: (root) => {
        setField(root, "directives", [])
      },
      expected:
        "the directives: the directives of the tree are not those of the source: [], not [[[12,22],true]]",
    },
    {
      name: "fails a hidden YAML form before the header held as the frontmatter as well",
      fixture: "detect-one-block",
      mutate: (root, input) => {
        setField(root, "frontmatter", {
          type: "Frontmatter",
          value: "x",
          valueRange: [15, 16],
          range: [11, 20],
          loc: locationOf(input, [11, 20]),
        })
      },
      expected:
        'the tokens in the range of the frontmatter: are not the opening delimiter, the body, and the closing delimiter: [["RawText",[11,20]]], not [["Punctuator",[11,14]],["RawText",[15,16]],["Punctuator",[17,20]]]',
    },
    {
      name: "fails a hidden form held in two gaps",
      fixture: "gram-hidden-range-gap-spaced",
      mutate: (root) => {
        const statement = nodeOf(root, "PacketRangeBlockStatement")
        setField(statement, "textBeforeEnd", [
          ...(statement.textBeforeDash as CheckedNode[]),
          ...(statement.textBeforeEnd as CheckedNode[]),
        ])
      },
      expected:
        "PacketIgnoredText at 8-15: overlaps the child node PacketIgnoredText at 8-15 of PacketRangeBlockStatement at 7-38",
    },
    {
      name: "fails a YAML form of three fences held as two forms",
      fixture: "hidden-yaml-adjacent-later",
      mutate: (root, input) => {
        const [first, ...rest] = root.body.body as CheckedNode[]
        const second = (copyOf(root).body.body as CheckedNode[])[0]
        placeAt(first, input, [7, 14])
        setField(first, "value", input.slice(7, 14))
        placeAt(second, input, [15, 18])
        setField(second, "value", input.slice(15, 18))
        setField(root.body, "body", [first, second, ...rest])
      },
      expected:
        "PacketIgnoredText at 7-14: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails two nonempty YAML forms held as one form",
      fixture: "lex-yaml-two-nonempty",
      mutate: (root, input) => {
        const [first, , ...rest] = root.body.body as CheckedNode[]
        placeAt(first, input, [7, 26])
        setField(first, "value", input.slice(7, 26))
        setField(root.body, "body", [first, ...rest])
      },
      expected:
        'PacketIgnoredText at 7-26: the texts of its tokens joined are not its written text: "---\\nx\\n------\\ny\\n---", not "---\\nx\\n---\\n---\\ny\\n---"',
    },
    {
      name: "fails a description block value that leaves out a bare percent line",
      fixture: "common-block-bare",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", "A\nB")
      },
      expected:
        'PacketLiteral at 18-24: value is not its written text: "A\\nB", not "A\\n%%\\nB"',
    },
    {
      name: "fails a description block value that leaves out its quotes and decodes its escape",
      fixture: "accdescr-block-quoted",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", "A\n B")
      },
      expected:
        'PacketLiteral at 18-25: value is not its written text: "A\\n B", not "\'A\\\\n B\'"',
    },
    {
      name: "fails a title value that writes an HTML attribute quote as `'`",
      fixture: "html-all-fields",
      mutate: (root) => {
        setField(nodeOf(root, "PacketLiteral"), "value", "<b x='q'>T</b>")
      },
      expected:
        'PacketLiteral at 13-27: value is not its written text: "<b x=\'q\'>T</b>", not "<b x=\\"q\\">T</b>"',
    },
    {
      name: "fails a label that writes its CRLF as LF",
      fixture: "line-crlf-label",
      mutate: (root) => {
        setField(nodeOf(root, "StringLiteral"), "value", "A\nB")
      },
      expected:
        'StringLiteral at 9-15: value is not its written text: "A\\nB", not "A\\r\\nB"',
    },
  ])
})

describe("checkTree: the gaps of a packet diagram that no recorded tree holds (ast/packet.md)", () => {
  // A range block with a hidden form after its colon, and a relative block
  // with a hidden suffix: the corpus has neither, so the trees are made by
  // hand.

  /** A range block with a hidden directive between its colon and its label. */
  function rangeWithLabelGap(): Built {
    return buildPacket('packet\n0-1:%%{!}%% "A"', (kit) => [
      rangeBlock(kit, "0", "1", '"A"', {
        beforeLabel: () => [ignored(kit, "Packet", "%%{!}%%", "directive")],
      }),
    ])
  }

  /** A relative block with a hidden directive after its label. */
  function relativeWithSuffix(): Built {
    return buildPacket('packet\n+1:"A"%%{!}%%', (kit) => [
      relative(kit, "1", '"A"', {
        after: () => [ignored(kit, "Packet", "%%{!}%%", "directive")],
      }),
    ])
  }

  itFailsEach([
    {
      name: "a hidden form before the label of a range block as a PacketLiteral",
      built: rangeWithLabelGap,
      mutate: hiddenAsLiteral("PacketRangeBlockStatement", "textBeforeLabel"),
      expected:
        "PacketRangeBlockStatement at 7-22: the field textBeforeLabel holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "a hidden form before the label of a range block moved before its colon",
      built: rangeWithLabelGap,
      mutate: moveFirst(
        "PacketRangeBlockStatement",
        "textBeforeLabel",
        "textBeforeColon",
      ),
      expected:
        'PacketRangeBlockStatement at 7-22: the gap is not hidden ASCII whitespace: ":"',
    },
    {
      name: "a hidden suffix of a relative block as a PacketLiteral",
      built: relativeWithSuffix,
      mutate: hiddenAsLiteral("PacketRelativeBlockStatement", "textAfter"),
      expected:
        "PacketRelativeBlockStatement at 7-20: the field textAfter holds a PacketLiteral, not a PacketIgnoredText",
    },
    {
      name: "a hidden suffix of a relative block moved to the body",
      built: relativeWithSuffix,
      mutate: moveToBody("PacketRelativeBlockStatement", "textAfter"),
      expected:
        "PacketIgnoredText at 13-20: overlaps the child node PacketRelativeBlockStatement at 7-20 of PacketDiagram at 0-20",
    },
  ])
})

/** The IshikawaNode whose text has the value `text`. */
function ishikawaNode(root: CheckedRoot, text: string): CheckedNode {
  return nodeOf(
    root,
    "IshikawaNode",
    (node) => (node.text as CheckedNode).value === text,
  )
}

/** Moves the IshikawaNode with the text `child` from its parent to the end of the children of the IshikawaNode with the text `parent`. */
function moveIshikawaNode(child: string, parent: string): InputCase["mutate"] {
  return (root) => {
    const node = ishikawaNode(root, child)
    const from = nodeOf(root, "IshikawaNode", (candidate) =>
      (candidate.children as CheckedNode[]).includes(node),
    )
    setField(
      from,
      "children",
      (from.children as CheckedNode[]).filter((item) => item !== node),
    )
    const to = ishikawaNode(root, parent)
    setField(to, "children", [...(to.children as CheckedNode[]), node])
  }
}

/** Sets the field `field` of the IshikawaNode with the text `text` to `value`. */
function setIshikawaField(
  text: string,
  field: string,
  value: unknown,
): InputCase["mutate"] {
  return (root) => {
    setField(ishikawaNode(root, text), field, value)
  }
}

/** Puts first among the children of the IshikawaNode with the text `parent` a leaf whose text is the input at `range`. */
function ishikawaNodeAt(
  parent: string,
  range: readonly [number, number],
): InputCase["mutate"] {
  return (root, input) => {
    const node = ishikawaNode(root, parent)
    const text = {
      type: "IshikawaLiteral",
      value: input.slice(...range),
      range,
      loc: locationOf(input, range),
    }
    setField(node, "children", [
      {
        type: "IshikawaNode",
        indent: 0,
        text,
        children: [],
        range,
        loc: locationOf(input, range),
      },
      ...(node.children as CheckedNode[]),
    ])
  }
}

describe("checkTree: the nodes of an ishikawa diagram (ast/ishikawa.md)", () => {
  itFailsEachRecorded("ishikawa", [
    {
      name: "fails an ishikawa node whose indentation is not the written one",
      fixture: "db-indent-first-cause",
      mutate: setIshikawaField("A", "indent", 5),
      expected:
        "IshikawaNode at 15-24: the indent is not the written line whitespace count: 5, not 4",
    },
    {
      name: "fails a cause held as a child of the cause before it at the same indentation",
      fixture: "db-indent-first-cause",
      mutate: moveIshikawaNode("C", "A"),
      expected:
        "IshikawaNode at 9-30: the children do not follow the Ishikawa first-cause and nearest-smaller-indent parent rule",
    },
    {
      name: "fails two causes of an ishikawa root out of source order",
      fixture: "db-all-fields",
      mutate: (root) => {
        const effect = ishikawaNode(root, "Effect")
        setField(
          effect,
          "children",
          [...(effect.children as CheckedNode[])].reverse(),
        )
      },
      expected:
        "IshikawaNode at 46-65: comes before the child node IshikawaNode at 67-86 of IshikawaNode at 38-86, which the child fields list before it",
    },
    {
      name: "fails a repeated ishikawa text held once",
      fixture: "db-three-definitions",
      mutate: (root) => {
        const r = ishikawaNode(root, "R")
        setField(
          r,
          "children",
          (r.children as CheckedNode[]).filter(
            (child) => child.range[0] !== 26,
          ),
        )
      },
      expected: 'RawText at 26-27 of "A": lies in no value node',
    },
    {
      name: "fails the root of an ishikawa diagram as an IshikawaLiteral",
      fixture: "gram-root-lf",
      mutate: (root) => {
        setField(root.body, "root", (root.body.root as CheckedNode).text)
      },
      expected:
        "IshikawaDiagram at 0-13: the field root holds a IshikawaLiteral, not a IshikawaNode",
    },
    {
      name: "fails an ishikawa diagram whose written root is null",
      fixture: "gram-root-lf",
      mutate: (root) => {
        setField(root.body, "root", null)
      },
      expected: 'RawText at 9-13 of "Root": lies in no value node',
    },
    {
      name: "fails an ishikawa diagram whose root is its first cause",
      fixture: "db-all-fields",
      mutate: (root) => {
        setField(root.body, "root", ishikawaNode(root, "Cause B"))
      },
      expected: 'RawText at 38-44 of "Effect": lies in no value node',
    },
    {
      name: "fails an ishikawa diagram with a beta flag",
      fixture: "header-beta-only-lf",
      mutate: (root) => {
        setField(root.body, "beta", true)
      },
      expected:
        "IshikawaDiagram at 0-13: has the field beta, which its type does not have",
    },
    {
      name: "fails a node for a comment line of an ishikawa diagram",
      fixture: "gram-preserved-comment-after-root",
      mutate: ishikawaNodeAt("R", [11, 17]),
      expected:
        "IshikawaNode at 11-17: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a node for a blank line of an ishikawa diagram",
      fixture: "gram-between-spaces-line",
      mutate: ishikawaNodeAt("A", [15, 18]),
      expected:
        "IshikawaNode at 15-18: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails a node for a directive of an ishikawa diagram",
      fixture: "header-lf-directive-eof",
      mutate: (root, input) => {
        const range = [9, 23] as const
        setField(root.body, "root", {
          type: "IshikawaNode",
          indent: 0,
          text: {
            type: "IshikawaLiteral",
            value: input.slice(...range),
            range,
            loc: locationOf(input, range),
          },
          children: [],
          range,
          loc: locationOf(input, range),
        })
      },
      expected: "IshikawaNode at 9-23: lies outside IshikawaDiagram at 0-8",
    },
    {
      name: "fails a title line of an ishikawa diagram left out of the nodes",
      fixture: "db-title-line-is-node",
      mutate: (root) => {
        setField(root.body, "root", null)
      },
      expected: 'RawText at 9-16 of "title T": lies in no value node',
    },
    {
      name: "fails the frontmatter of an ishikawa diagram left out of the root",
      fixture: "db-frontmatter-title",
      mutate: (root) => {
        setField(root, "frontmatter", null)
      },
      expected:
        "Root.body: does not run from its first token to its last: [33,48], not [0,48]",
    },
    {
      name: "fails an ishikawa diagram that ends before its last descendant",
      fixture: "db-all-fields",
      mutate: rangeOf("IshikawaDiagram", [29, 44]),
      expected: "IshikawaNode at 38-86: lies outside IshikawaDiagram at 29-44",
    },
    {
      name: "fails a rootless ishikawa diagram that ends before its header",
      fixture: "header-only-lf",
      mutate: rangeOf("IshikawaDiagram", [0, 4]),
      expected:
        "IshikawaDiagram at 0-4: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails an ishikawa node whose indentation is negative",
      fixture: "db-indent-first-cause",
      mutate: setIshikawaField("R", "indent", -1),
      expected: "IshikawaNode at 9-30: the indent is not a nonnegative integer",
    },
    {
      name: "fails an ishikawa node whose indentation is not an integer",
      fixture: "db-indent-first-cause",
      mutate: setIshikawaField("A", "indent", 4.5),
      expected:
        "IshikawaNode at 15-24: the indent is not a nonnegative integer",
    },
    {
      name: "fails the text of an ishikawa node as a StringLiteral",
      fixture: "gram-root-lf",
      mutate: remakeChild(
        "IshikawaNode",
        "text",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, closed: true }),
      ),
      expected:
        "IshikawaNode at 9-13: the field text holds a StringLiteral, not a IshikawaLiteral",
    },
    {
      name: "fails the text of an ishikawa node that is empty",
      fixture: "gram-root-lf",
      mutate: (root) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", "")
      },
      expected: "IshikawaLiteral at 9-13: the literal is empty",
    },
    {
      name: "fails the text of an ishikawa node that is not its written text",
      fixture: "gram-root-lf",
      mutate: (root) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", "Rot")
      },
      expected:
        'IshikawaLiteral at 9-13: value is not its written text: "Rot", not "Root"',
    },
    {
      name: "fails a child of an ishikawa node as an IshikawaLiteral",
      fixture: "db-indent-first-cause",
      mutate: (root) => {
        const r = ishikawaNode(root, "R")
        const [first, ...rest] = r.children as CheckedNode[]
        setField(r, "children", [first.text, ...rest])
      },
      expected:
        "IshikawaNode at 9-30: the field children holds a IshikawaLiteral, not a IshikawaNode",
    },
    {
      name: "fails a leaf of an ishikawa diagram with a child it does not have",
      fixture: "db-indent-first-cause",
      mutate: (root) => {
        setField(ishikawaNode(root, "C"), "children", [ishikawaNode(root, "B")])
      },
      expected: "IshikawaNode at 23-24: lies outside IshikawaNode at 29-30",
    },
    {
      name: "fails an ishikawa node that ends at its text before its last descendant",
      fixture: "db-indent-first-cause",
      mutate: (root, input) => {
        placeAt(ishikawaNode(root, "R"), input, [9, 10])
      },
      expected: "IshikawaNode at 15-24: lies outside IshikawaNode at 9-10",
    },
    {
      name: "fails an ishikawa leaf that runs over the line feed after its text",
      fixture: "db-indent-first-cause",
      mutate: (root, input) => {
        placeAt(ishikawaNode(root, "C"), input, [29, 31])
      },
      expected: "IshikawaNode at 29-31: lies outside IshikawaNode at 9-30",
    },
    {
      name: "fails the text of an ishikawa node that holds its indentation",
      fixture: "db-indent-first-cause",
      mutate: (root, input) => {
        const text = ishikawaNode(root, "C").text as CheckedNode
        placeAt(text, input, [25, 30])
        setField(text, "value", input.slice(25, 30))
      },
      expected: "IshikawaLiteral at 25-30: lies outside IshikawaNode at 29-30",
    },
    {
      name: "fails an ishikawa node indented by a tab whose indentation counts the tab as four",
      fixture: "db-indent-tab-character",
      mutate: setIshikawaField("A", "indent", 4),
      expected:
        "IshikawaNode at 12-17: the indent is not the written line whitespace count: 4, not 1",
    },
    {
      name: "fails an ishikawa node indented by U+3000 whose indentation leaves it out",
      fixture: "lex-ideographic-positions",
      mutate: setIshikawaField("A\u3000B\u3000", "indent", 0),
      expected:
        "IshikawaNode at 14-22: the indent is not the written line whitespace count: 0, not 1",
    },
    {
      name: "fails an ishikawa node after a comment that ends at U+2028 whose indentation leaves it out",
      fixture: "comment-preserved-u2028",
      mutate: setIshikawaField("A", "indent", 0),
      expected:
        "IshikawaNode at 19-20: the indent is not the written line whitespace count: 0, not 1",
    },
    {
      name: "fails an ishikawa node whose indentation counts the directive before it",
      fixture: "db-indent-around-directives",
      mutate: setIshikawaField("R", "indent", 18),
      expected:
        "IshikawaNode at 27-51: the indent is not the written line whitespace count: 18, not 4",
    },
    {
      name: "fails an ishikawa root on the header line whose indentation leaves out the space after the header",
      fixture: "header-same-line-root",
      mutate: setIshikawaField("R", "indent", 0),
      expected:
        "IshikawaNode at 9-13: the indent is not the written line whitespace count: 0, not 1",
    },
    {
      name: "fails an ishikawa root deeper than its causes whose indentation is not the written one",
      fixture: "db-indent-root-deeper",
      mutate: setIshikawaField("R", "indent", 0),
      expected:
        "IshikawaNode at 17-29: the indent is not the written line whitespace count: 0, not 8",
    },
    {
      name: "fails an ishikawa cause at the indentation of the first cause held as a child of a deeper cause",
      fixture: "db-indent-clamp-below-base",
      mutate: moveIshikawaNode("B", "A"),
      expected:
        "IshikawaNode at 9-22: the children do not follow the Ishikawa first-cause and nearest-smaller-indent parent rule",
    },
    {
      name: "fails an ishikawa cause held as a child of a cause that is not the nearest with a smaller indentation",
      fixture: "db-indent-nearest-smaller-cause",
      mutate: moveIshikawaNode("D", "A"),
      expected:
        "IshikawaNode at 13-35: the children do not follow the Ishikawa first-cause and nearest-smaller-indent parent rule",
    },
    {
      name: "fails an ishikawa text that leaves out its trailing whitespace",
      fixture: "gram-root-trailing-space",
      mutate: (root, input) => {
        const text = nodeOf(root, "IshikawaLiteral")
        placeAt(text, input, [9, 10])
        setField(text, "value", "R")
      },
      expected:
        "RawText at 9-13: ends with whitespace or a line terminator where no value ends",
    },
    {
      name: "fails an ishikawa text that leaves out its quotes",
      fixture: "gram-quotes-padding",
      mutate: (root) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", "  R  ")
      },
      expected:
        'IshikawaLiteral at 9-16: value is not its written text: "  R  ", not "\\"  R  \\""',
    },
    {
      name: "fails an ishikawa text that decodes its entities",
      fixture: "header-root-inline-entity",
      mutate: (root) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", "R#&")
      },
      expected:
        'IshikawaLiteral at 9-19: value is not its written text: "R#&", not "R#35;#amp;"',
    },
    {
      name: "fails an ishikawa text that leaves out the whitespace at its end",
      fixture: "lex-trailing-ls-ps-whitespace",
      mutate: (root) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", "A")
      },
      expected:
        'IshikawaLiteral at 9-15: value is not its written text: "A", not "A \\t\u00a0\u2028\u2029"',
    },
    {
      name: "fails an ishikawa text that holds the directive inside it",
      fixture: "directive-root-middle",
      mutate: (root, input) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", input.slice(9, 27))
      },
      expected:
        'IshikawaLiteral at 9-27: value is not its written text: "Ro%%{init: {}}%%ot", not "Root"',
    },
    {
      name: "fails an ishikawa text that holds the semicolon that the line rule ignores",
      fixture: "lex-root-style-semicolon-padding",
      mutate: (root, input) => {
        setField(nodeOf(root, "IshikawaLiteral"), "value", input.slice(9, 29))
      },
      expected:
        'IshikawaLiteral at 9-29: value is not its written text: "style R fill:#abc;  ", not "style R fill:#abc  "',
    },
    {
      name: "fails an ishikawa text that ends before the directive inside it",
      fixture: "directive-root-middle",
      mutate: (root, input) => {
        const text = nodeOf(root, "IshikawaLiteral")
        placeAt(text, input, [9, 11])
        setField(text, "value", "Ro")
      },
      expected: 'RawText at 25-27 of "ot": lies in no value node',
    },
    {
      name: "fails a numeric-looking ishikawa text as a NumericLiteral",
      fixture: "db-number-labels",
      mutate: remakeChild(
        "IshikawaNode",
        "text",
        "NumericLiteral",
        [],
        (node) => ({ raw: node.value, value: -0 }),
      ),
      expected:
        "IshikawaNode at 9-52: the field text holds a NumericLiteral, not a IshikawaLiteral",
    },
    {
      name: "fails an ishikawa text of empty quotes as a StringLiteral",
      fixture: "gram-empty-quotes",
      mutate: remakeChild(
        "IshikawaNode",
        "text",
        "StringLiteral",
        [],
        (node) => ({ raw: node.value, value: "", closed: true }),
      ),
      expected:
        "IshikawaNode at 9-15: the field text holds a StringLiteral, not a IshikawaLiteral",
    },
    {
      name: "fails an ishikawa text with an open quote that has a closed field",
      fixture: "gram-root-unclosed-quote",
      mutate: (root) => {
        setField(nodeOf(root, "IshikawaLiteral"), "closed", false)
      },
      expected:
        "IshikawaLiteral at 9-14: has the field closed, which its type does not have",
    },
  ])
})

describe("checkTree: the nodes of a sankey diagram (ast/sankey.md)", () => {
  itFailsEachRecorded("sankey", [
    {
      name: "fails the body of a sankey diagram as a PieDiagram",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(root.body, "type", "PieDiagram")
        setField(root.body, "showData", false)
        setField(root.body, "textBeforeHeader", [])
        setField(root.body, "textBeforeShowData", [])
      },
      expected:
        "Root: the diagram type sankey is not one of those of a PieDiagram: pie",
    },
    {
      name: "fails a quoted sankey field that writes its CRLF as LF",
      fixture: "db-quoted-crlf",
      mutate: (root) => {
        const string = nodeOf(root, "StringLiteral")
        setField(
          string,
          "value",
          (string.value as string).replace("\r\n", "\n"),
        )
      },
      expected:
        'StringLiteral at 8-14: value is not its written text: "a\\nb", not "a\\r\\nb"',
    },
    {
      name: "fails an unquoted sankey field that keeps the space before it",
      fixture: "db-fields-trimmed",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyIdentifier"), "name", " a")
      },
      expected:
        'SankeyIdentifier at 9-10: name is not its written text without the whitespace at its ends: " a", not "a"',
    },
    {
      name: "fails a sankey field of spaces only whose name is its spaces",
      fixture: "db-spaces-only-target-id",
      mutate: (root) => {
        setField(nthNode(root, "SankeyIdentifier", 1), "name", " ")
      },
      expected:
        'SankeyIdentifier at 9-10: name is not its written text without the whitespace at its ends: " ", not ""',
    },
    {
      name: "fails a quoted sankey value as a SankeyLiteral",
      fixture: "db-quoted-value",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "value",
        "SankeyLiteral",
        ["raw", "closed"],
        () => ({}),
      ),
      expected:
        'SankeyLiteral at 11-14: value is not its written text without the whitespace at its ends: "1", not "\\"1\\""',
    },
    {
      name: "fails a quoted sankey field whose value is not what lies between its quotes",
      fixture: "db-quoted-line-feed",
      mutate: (root) => {
        setField(nodeOf(root, "StringLiteral"), "value", "a b")
      },
      expected:
        'StringLiteral at 7-12: value is not its written text: "a b", not "a\\nb"',
    },
    {
      name: "fails a sankey link among the statements as a SankeyIdentifier",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(root.body, "body", [nodeOf(root, "SankeyIdentifier")])
      },
      expected:
        "SankeyDiagram at 0-12: the field body holds a SankeyIdentifier, not a SankeyLinkStatement",
    },
    {
      name: "fails a sankey diagram without its links",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(root.body, "body", [])
      },
      expected: 'RawText at 7-8 of "a": lies in no value node',
    },
    {
      name: "fails a sankey diagram with a header field",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(root.body, "header", "sankey")
      },
      expected:
        "SankeyDiagram at 0-12: has the field header, which its type does not have",
    },
    {
      name: "fails a `sankey-beta` diagram whose diagram type is `sankey-beta`",
      fixture: "db-header-beta",
      mutate: (root) => {
        setField(root, "diagramType", "sankey-beta")
      },
      expected:
        "Root: the diagram type sankey-beta is not one of those of a SankeyDiagram: sankey",
    },
    {
      name: "fails a sankey link that runs over the line feed after it",
      fixture: "db-link-basic",
      mutate: rangeOf("SankeyLinkStatement", [7, 13]),
      expected:
        "SankeyLinkStatement at 7-13: lies outside SankeyDiagram at 0-12",
    },
    {
      name: "fails a node for an empty line of a sankey diagram",
      fixture: "db-blank-lines-between",
      mutate: (root, input) => {
        const [first, second] = root.body.body as CheckedNode[]
        // The empty line between the records, at 15.
        setField(root.body, "body", [
          first,
          { ...first, range: [15, 15], loc: locationOf(input, [15, 15]) },
          second,
        ])
      },
      expected:
        "SankeyLinkStatement at 15-15: does not run from the start of a token to the end of a token",
    },
    {
      name: "fails the source of a sankey link as a SankeyLiteral",
      fixture: "db-link-basic",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "source",
        "SankeyLiteral",
        ["name"],
        (node) => ({ value: node.name }),
      ),
      expected:
        "SankeyLinkStatement at 7-12: the field source holds a SankeyLiteral, not a SankeyIdentifier or StringLiteral",
    },
    {
      name: "fails a sankey link without its source",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyLinkStatement"), "source", null)
      },
      expected:
        "SankeyLinkStatement at 7-12: the field source is null, not a node",
    },
    {
      name: "fails a sankey link whose source and target are swapped",
      fixture: "db-link-basic",
      mutate: (root) => {
        const link = nodeOf(root, "SankeyLinkStatement")
        const { source, target } = link
        setField(link, "source", target)
        setField(link, "target", source)
      },
      expected:
        "SankeyIdentifier at 7-8: comes before the child node SankeyIdentifier at 9-10 of SankeyLinkStatement at 7-12, which the child fields list before it",
    },
    {
      name: "fails the target of a sankey link as a SankeyLiteral",
      fixture: "db-link-basic",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "target",
        "SankeyLiteral",
        ["name"],
        (node) => ({ value: node.name }),
      ),
      expected:
        "SankeyLinkStatement at 7-12: the field target holds a SankeyLiteral, not a SankeyIdentifier or StringLiteral",
    },
    {
      name: "fails a sankey link without its target",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyLinkStatement"), "target", null)
      },
      expected:
        "SankeyLinkStatement at 7-12: the field target is null, not a node",
    },
    {
      name: "fails the value of a sankey link as a SankeyIdentifier",
      fixture: "db-link-basic",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "value",
        "SankeyIdentifier",
        ["value"],
        (node) => ({ name: node.value }),
      ),
      expected:
        "SankeyLinkStatement at 7-12: the field value holds a SankeyIdentifier, not a SankeyLiteral or StringLiteral",
    },
    {
      name: "fails a sankey link without its value",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyLinkStatement"), "value", null)
      },
      expected:
        "SankeyLinkStatement at 7-12: the field value is null, not a node",
    },
    {
      name: "fails a sankey link whose target and value are swapped",
      fixture: "db-link-basic",
      mutate: (root) => {
        const link = nodeOf(root, "SankeyLinkStatement")
        const { target, value } = link
        setField(link, "target", value)
        setField(link, "value", target)
      },
      expected:
        "SankeyIdentifier at 9-10: comes before the child node SankeyLiteral at 11-12 of SankeyLinkStatement at 7-12, which the child fields list before it",
    },
    {
      name: "fails a quoted sankey source as a SankeyIdentifier",
      fixture: "db-quoted-and-unquoted-same-id",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "source",
        "SankeyIdentifier",
        STRING_FIELDS,
        (node) => ({ name: node.value }),
      ),
      expected:
        "SankeyIdentifier at 7-10: the tokens of a SankeyIdentifier are not all of the kind RawText: String",
    },
    {
      name: "fails an unquoted sankey source as a StringLiteral",
      fixture: "db-link-basic",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "source",
        "StringLiteral",
        ["name"],
        (node) => ({ raw: node.name, value: node.name, closed: true }),
      ),
      expected:
        "StringLiteral at 7-8: the tokens of the string are not one String token or StringFragment tokens: RawText",
    },
    {
      name: "fails a sankey name that leaves out the space between its words",
      fixture: "db-text-with-spaces",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyIdentifier"), "name", "ab")
      },
      expected:
        'SankeyIdentifier at 7-10: name is not its written text without the whitespace at its ends: "ab", not "a b"',
    },
    {
      name: "fails a sankey name that is not its written text",
      fixture: "db-link-basic",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyIdentifier"), "name", "x")
      },
      expected:
        'SankeyIdentifier at 7-8: name is not its written text without the whitespace at its ends: "x", not "a"',
    },
    {
      name: "fails an unquoted sankey value that keeps the space before it",
      fixture: "db-fields-trimmed",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyLiteral"), "value", " 1")
      },
      expected:
        'SankeyLiteral at 17-18: value is not its written text without the whitespace at its ends: " 1", not "1"',
    },
    {
      name: "fails a sankey value as a NumericLiteral",
      fixture: "db-value-exponent",
      mutate: remakeChild(
        "SankeyLinkStatement",
        "value",
        "NumericLiteral",
        [],
        (node) => ({ raw: node.value, value: 1000 }),
      ),
      expected:
        "SankeyLinkStatement at 7-14: the field value holds a NumericLiteral, not a SankeyLiteral or StringLiteral",
    },
    {
      name: "fails a sankey value of spaces only whose value is its spaces",
      fixture: "db-spaces-only-value",
      mutate: (root) => {
        setField(nodeOf(root, "SankeyLiteral"), "value", " ")
      },
      expected:
        'SankeyLiteral at 11-12: value is not its written text without the whitespace at its ends: " ", not ""',
    },
  ])
})

import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { SANKEY_CHILD_TYPES } from "../src/check-tree/sankey.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { BrokenCase, Built, Kit } from "./check-tree-built.ts"
import {
  buildTree,
  endAt,
  itFailsEach,
  nodeWith,
  ownKind,
  retype,
  tokenWith,
} from "./check-tree-built.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  problemsOf,
  retypeIn,
  says,
  setField,
} from "./check-tree-recorded.ts"
import { readFieldTables } from "./spec-field-tables.ts"

// The trees of a sankey diagram made by hand: they are the smallest trees that
// hold the case they are about (see `check-tree-built.ts`). The header is a
// `Keyword` token, the `,` a `Punctuator` token, a field without quotes a
// `RawText` token, and a string a `String` token with its quotes
// (parser/docs/tokens/sankey.md).

/** A tree of `source`, whose first line is the header. */
function build(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    { header: "sankey", diagramType: "sankey", bodyType: "SankeyDiagram" },
    source,
    makeStatements,
  )
}

/** A field without quotes: its token, and the node of the type `type` that holds it. */
function field(kit: Kit, type: string, text: string): CheckedNode {
  const token = kit.token("RawText", text)
  return kit.node(type, token.range, {
    [type === "SankeyIdentifier" ? "name" : "value"]: text,
  })
}

/** A string: its token with its quotes, and the node that holds it; `content` is what lies between the quotes. */
function string(kit: Kit, written: string, content: string): CheckedNode {
  const token = kit.token("String", written)
  return kit.node("StringLiteral", token.range, {
    value: content,
    raw: written,
    closed: true,
  })
}

/** A link of three fields written as `fields` say, with the `,` between them. */
function linkOf(
  kit: Kit,
  makeFields: readonly ((kit: Kit) => CheckedNode)[],
): CheckedNode {
  const nodes = makeFields.map((make, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return make(kit)
  })
  const [source, target, value] = nodes
  return kit.node(
    "SankeyLinkStatement",
    [source?.range[0] ?? 0, value?.range[1] ?? 0],
    { source, target, value },
  )
}

/** The three fields of a link of names and a value. */
function names(
  source: string,
  target: string,
  value: string,
): ((kit: Kit) => CheckedNode)[] {
  return [
    (kit) => field(kit, "SankeyIdentifier", source),
    (kit) => field(kit, "SankeyIdentifier", target),
    (kit) => field(kit, "SankeyLiteral", value),
  ]
}

/** `a,b,1`. */
function oneLink(): Built {
  return build("sankey\na,b,1", (kit) => [linkOf(kit, names("a", "b", "1"))])
}

/** Two links, the second on the next line. */
function twoLinks(): Built {
  return build("sankey\na,b,1\nc,d,2.5", (kit) => [
    linkOf(kit, names("a", "b", "1")),
    linkOf(kit, names("c", "d", "2.5")),
  ])
}

/** A link of strings: a doubled quote, a comma, and a value in quotes. */
function linkOfStrings(): Built {
  return build('sankey\n"a""b","c,d","1"', (kit) => [
    linkOf(kit, [
      (k) => string(k, '"a""b"', 'a""b'),
      (k) => string(k, '"c,d"', "c,d"),
      (k) => string(k, '"1"', "1"),
    ]),
  ])
}

/** A string with a line feed and a CR between its quotes. */
function stringWithLineTerminators(): Built {
  return build('sankey\n"a\nb\rc",d,1', (kit) => [
    linkOf(kit, [
      (k) => string(k, '"a\nb\rc"', "a\nb\rc"),
      (k) => field(k, "SankeyIdentifier", "d"),
      (k) => field(k, "SankeyLiteral", "1"),
    ]),
  ])
}

/** A field and a string whose HTML tags have attribute quotes: they are read as `\'`, so the `"` are no quote of the lexer's (common.md, HTML attribute quotes). */
function linkWithTags(): Built {
  return build('sankey\n<a b="c">d,"x<a b="c">y",1', (kit) => [
    linkOf(kit, [
      (k) => field(k, "SankeyIdentifier", '<a b="c">d'),
      (k) => string(k, '"x<a b="c">y"', 'x<a b="c">y'),
      (k) => field(k, "SankeyLiteral", "1"),
    ]),
  ])
}

/** A field of whitespace only: the one `RawText` token of its whitespace, and the node with the empty value. */
function emptyField(kit: Kit, type: string, spaces: string): CheckedNode {
  const token = kit.token("RawText", spaces)
  return kit.node(type, token.range, {
    [type === "SankeyIdentifier" ? "name" : "value"]: "",
  })
}

/** `a, ,1`: the target is a field of one space. */
function linkWithSpaceTarget(): Built {
  return build("sankey\na, ,1", (kit) => [
    linkOf(kit, [
      (k) => field(k, "SankeyIdentifier", "a"),
      (k) => emptyField(k, "SankeyIdentifier", " "),
      (k) => field(k, "SankeyLiteral", "1"),
    ]),
  ])
}

/** `a,b, ` and a record after it: the value is a field of one space. */
function linkWithSpaceValue(): Built {
  return build("sankey\na,b, \nc,d,1", (kit) => [
    linkOf(kit, [
      (k) => field(k, "SankeyIdentifier", "a"),
      (k) => field(k, "SankeyIdentifier", "b"),
      (k) => emptyField(k, "SankeyLiteral", " "),
    ]),
    linkOf(kit, names("c", "d", "1")),
  ])
}

/** A field that a directive cuts into two `RawText` tokens, and empty lines and a directive between the header and the first record. */
function linkWithDirectives(): Built {
  return build("sankey\n\n%%{x}%%\na%%{y}%%b,c,1", (kit) => {
    kit.directive("%%{x}%%")
    const first = kit.token("RawText", "a")
    kit.directive("%%{y}%%")
    const second = kit.token("RawText", "b")
    const source = kit.node(
      "SankeyIdentifier",
      [first.range[0], second.range[1]],
      {
        name: "ab",
      },
    )
    kit.token("Punctuator", ",")
    const target = field(kit, "SankeyIdentifier", "c")
    kit.token("Punctuator", ",")
    const value = field(kit, "SankeyLiteral", "1")
    return [
      kit.node("SankeyLinkStatement", [source.range[0], value.range[1]], {
        source,
        target,
        value,
      }),
    ]
  })
}

/** The header `sankey-beta`, spaces around the commas, and spaces at the end of the record. */
function betaWithSpaces(): Built {
  return buildTree(
    {
      header: "sankey-beta",
      diagramType: "sankey",
      bodyType: "SankeyDiagram",
    },
    "sankey-beta\n  a , b , 1  ",
    (kit) => [linkOf(kit, names("a", "b", "1"))],
  )
}

/** The trees that satisfy every sentence, by name. */
const VALID: Readonly<Record<string, () => Built>> = {
  "a link of two names and a value": oneLink,
  "two links": twoLinks,
  "a link of strings": linkOfStrings,
  "a field and a string with HTML attribute quotes": linkWithTags,
  "a string with a line feed and a CR": stringWithLineTerminators,
  "a field of one space": linkWithSpaceTarget,
  "a value of one space before another record": linkWithSpaceValue,
  "a field that a directive cuts, and a directive line after the header":
    linkWithDirectives,
  "the header sankey-beta and spaces around the fields": betaWithSpaces,
}

describe("the check of a sankey tree made by hand", () => {
  for (const [name, make] of Object.entries(VALID)) {
    it(`passes ${name}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

/** Sets the field `fieldName` of the first node of the type `type` to `value`. */
function set(
  type: string,
  fieldName: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, type), fieldName, value)
  }
}

describe("the check of a sankey tree made by hand: the fields", () => {
  itFailsEach([
    {
      name: "a diagram without a link",
      built: oneLink,
      mutate: set("SankeyDiagram", "body", []),
      expected: "SankeyDiagram at #: the list body is empty",
    },
    {
      name: "a name as the value of a link",
      built: oneLink,
      mutate: (tree) => {
        const statement = nodeWith(tree, "SankeyLinkStatement")
        setField(statement, "value", statement.source)
      },
      expected:
        "SankeyLinkStatement at #: the field value holds a SankeyIdentifier, not a SankeyLiteral or StringLiteral",
    },
    {
      name: "a value as the source of a link",
      built: oneLink,
      mutate: (tree) => {
        const statement = nodeWith(tree, "SankeyLinkStatement")
        setField(statement, "source", statement.value)
      },
      expected:
        "SankeyLinkStatement at #: the field source holds a SankeyLiteral, not a SankeyIdentifier or StringLiteral",
    },
    {
      name: "a value as the target of a link",
      built: oneLink,
      mutate: (tree) => {
        const statement = nodeWith(tree, "SankeyLinkStatement")
        setField(statement, "target", statement.value)
      },
      expected:
        "SankeyLinkStatement at #: the field target holds a SankeyLiteral, not a SankeyIdentifier or StringLiteral",
    },
    {
      name: "a name in the body of the diagram",
      built: oneLink,
      mutate: (tree) => {
        const diagram = nodeWith(tree, "SankeyDiagram")
        setField(diagram, "body", [nodeWith(tree, "SankeyIdentifier")])
      },
      expected:
        "SankeyDiagram at #: the field body holds a SankeyIdentifier, not a SankeyLinkStatement",
    },
  ])
})

describe("the check of a sankey tree made by hand: the values", () => {
  itFailsEach([
    {
      name: "a name that starts with whitespace",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", " a"),
      expected:
        'SankeyIdentifier at #: the name " a" starts or ends with whitespace',
    },
    {
      name: "a name that ends with whitespace",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a\t"),
      expected: "starts or ends with whitespace",
    },
    {
      name: "a name with a comma",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a,b"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a quote",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", 'a"b'),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a character outside ASCII",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "é"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a quote in a tag that is not closed",
      built: linkWithTags,
      mutate: set("SankeyIdentifier", "name", '<a b="c'),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a quote after a tag",
      built: linkWithTags,
      mutate: set("SankeyIdentifier", "name", '<a b="c">d"'),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a no-break space inside",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a\u00a0b"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a U+2028 inside",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a\u2028b"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a U+FEFF inside",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a\ufeffb"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a name with a line feed inside",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a\nb"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a value with a U+2029 at its end",
      built: oneLink,
      mutate: set("SankeyLiteral", "value", "1\u2029"),
      expected: "starts or ends with whitespace",
    },
    {
      name: "a name with a tab inside",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", "a\tb"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a value that ends with whitespace",
      built: oneLink,
      mutate: set("SankeyLiteral", "value", "1 "),
      expected:
        'SankeyLiteral at #: the value "1 " starts or ends with whitespace',
    },
    {
      name: "a value with a comma",
      built: oneLink,
      mutate: set("SankeyLiteral", "value", "1,5"),
      expected: "which a field without quotes does not hold",
    },
    {
      name: "a string that is not closed",
      built: linkOfStrings,
      mutate: set("StringLiteral", "closed", false),
      expected: "StringLiteral at #: the string is not closed",
    },
    {
      name: "a string with nothing between its quotes",
      built: linkOfStrings,
      mutate: set("StringLiteral", "value", ""),
      expected: "the string has nothing between its quotes",
    },
    {
      name: "a string with a character outside ASCII",
      built: linkOfStrings,
      mutate: set("StringLiteral", "value", "é"),
      expected: "which a string does not hold",
    },
    {
      name: "a string with a tab",
      built: linkOfStrings,
      mutate: set("StringLiteral", "value", "a\tb"),
      expected: "which a string does not hold",
    },
    {
      name: "a string with a quote in a tag that is not closed",
      built: linkWithTags,
      mutate: set("StringLiteral", "value", 'x<a b="c'),
      expected: 'holds a `"` that is not in a pair of `"`',
    },
    {
      name: "a string with a single quote inside",
      built: linkOfStrings,
      mutate: set("StringLiteral", "value", 'a"b'),
      expected: 'holds a `"` that is not in a pair of `"`',
    },
    {
      name: "a string with three quotes in a row",
      built: linkOfStrings,
      mutate: set("StringLiteral", "value", 'a"""b'),
      expected: 'holds a `"` that is not in a pair of `"`',
    },
    {
      name: "a string with a single quote at its end",
      built: linkOfStrings,
      mutate: set("StringLiteral", "value", 'a"'),
      expected: 'holds a `"` that is not in a pair of `"`',
    },
  ])
})

describe("the check of a sankey tree made by hand: the tokens and the ranges", () => {
  itFailsEach([
    {
      name: "the header as a RawText token",
      built: oneLink,
      mutate: retype("sankey", "RawText"),
      expected: ownKind("sankey", "SankeyDiagram", "RawText", "Keyword"),
    },
    {
      name: "a comma as a Keyword token",
      built: oneLink,
      mutate: retype(",", "Keyword"),
      expected: ownKind(",", "SankeyLinkStatement", "Keyword", "Punctuator"),
    },
    {
      name: "a name as a Keyword token",
      built: oneLink,
      mutate: retype("a", "Keyword"),
      expected:
        "SankeyIdentifier at #: the tokens of a SankeyIdentifier are not all of the kind RawText: Keyword",
    },
    {
      name: "a value as a Punctuator token",
      built: oneLink,
      mutate: retype("1", "Punctuator"),
      expected:
        "SankeyLiteral at #: the tokens of a SankeyLiteral are not all of the kind RawText: Punctuator",
    },
    {
      name: "a comma token whose text is another character",
      built: oneLink,
      mutate: (tree) => {
        setField(tokenWith(tree, ","), "value", ";")
      },
      expected:
        'SankeyLinkStatement at #: the tokens of the node outside its child nodes, joined: ";,", not ",,"',
    },
    {
      name: "a header that is another word",
      built: oneLink,
      mutate: (tree) => {
        setField(nodeWith(tree, "SankeyDiagram"), "range", [0, 6])
        setField(tree.tokens[0] ?? tree, "value", "sankex")
      },
      expected: "not the header (sankey or sankey-beta)",
    },
    {
      name: "a link whose range ends before its value",
      built: twoLinks,
      mutate: endAt("SankeyLinkStatement", (tree) => {
        const statement = nodeWith(tree, "SankeyLinkStatement")
        return statement.range[1] - 1
      }),
      expected:
        "the range, which runs from the first of its tokens and child nodes to the last",
    },
    {
      name: "a diagram whose range starts after its header",
      built: oneLink,
      mutate: (tree) => {
        const diagram = nodeWith(tree, "SankeyDiagram")
        setField(diagram, "range", [1, diagram.range[1]])
      },
      expected:
        "the range, which runs from the first of its tokens and child nodes to the last",
    },
    {
      name: "a target before the source",
      built: oneLink,
      mutate: (tree) => {
        const statement = nodeWith(tree, "SankeyLinkStatement")
        setField(statement, "source", statement.target)
        setField(statement, "target", nodeWith(tree, "SankeyIdentifier"))
      },
      expected: "are not in the order source, `,`, target, `,`, value",
    },
    {
      name: "a field that holds whitespace at its end, though it is not whitespace only",
      built: linkWithSpaceTarget,
      mutate: (tree) => {
        setField(nodeWith(tree, "SankeyIdentifier", "name", ""), "name", "x")
      },
      expected:
        "a token of the field starts or ends with whitespace, though the field is not whitespace only",
    },
    {
      name: "an empty name whose token is not whitespace",
      built: oneLink,
      mutate: set("SankeyIdentifier", "name", ""),
      expected:
        "an empty value is not the one token of the whitespace of a field of whitespace only",
    },
  ])

  it("fails a record on the line of the header", () => {
    const { source, tree } = build("sankey a,b,1", (kit) => [
      linkOf(kit, names("a", "b", "1")),
    ])
    expect(
      says(checkTree(source, tree), "not whitespace with a line terminator"),
    ).toBe(true)
  })

  it("fails two records on one line", () => {
    const { source, tree } = build("sankey\na,b,1 c,d,2", (kit) => [
      linkOf(kit, names("a", "b", "1")),
      linkOf(kit, names("c", "d", "2")),
    ])
    expect(
      says(checkTree(source, tree), "not whitespace with a line terminator"),
    ).toBe(true)
  })
})

describe("the tables of the check of a sankey tree", () => {
  it("give the child types that the Type column of ast/sankey.md gives", () => {
    const documented = readFieldTables()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(SANKEY_CHILD_TYPES)) {
      for (const [fieldName, allowed] of Object.entries(fields)) {
        const cell = documented.get(type)?.get(fieldName) ?? ""
        const named = [...cell.matchAll(/[A-Z][A-Za-z]*[a-z][A-Za-z]*/gu)]
          .map((match) => match[0])
          .sort()
        if (JSON.stringify(named) !== JSON.stringify([...allowed].sort())) {
          differing.push(`${type}.${fieldName}: ${cell}`)
        }
      }
    }
    expect(differing).toEqual([])
  })

  it("give a child type for every field of the sankey types that holds a node", () => {
    const missing: string[] = []
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Sankey")) continue
      for (const [fieldName, cell] of fields) {
        if (
          /\b(?:Sankey\w+|StringLiteral)\b/u.test(cell) &&
          SANKEY_CHILD_TYPES[type]?.[fieldName] === undefined
        ) {
          missing.push(`${type}.${fieldName}: ${cell}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture.

/** Sets the field `fieldName` of the first node of the type `type` to `value`. */
function setIn(
  type: string,
  fieldName: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type), fieldName, value)
  }
}

const OWN_KIND = "the kind of a token that the node writes itself"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "a diagram without a link",
    fixture: "db-link-basic",
    mutate: setIn("SankeyDiagram", "body", []),
    expected: "SankeyDiagram at 0-12: the list body is empty",
  },
  {
    name: "a value as the source of a link",
    fixture: "db-link-basic",
    mutate: (root) => {
      const statement = firstNode(root, "SankeyLinkStatement")
      setField(statement, "source", statement.value)
    },
    expected:
      "the field source holds a SankeyLiteral, not a SankeyIdentifier or StringLiteral",
  },
  {
    name: "a name that starts with whitespace",
    fixture: "db-link-basic",
    mutate: setIn("SankeyIdentifier", "name", " a"),
    expected: 'the name " a" starts or ends with whitespace',
  },
  {
    name: "a name with a comma",
    fixture: "db-link-basic",
    mutate: setIn("SankeyIdentifier", "name", "a,b"),
    expected: "which a field without quotes does not hold",
  },
  {
    name: "a value with a character outside ASCII",
    fixture: "db-link-basic",
    mutate: setIn("SankeyLiteral", "value", "1\u00e9"),
    expected: "which a field without quotes does not hold",
  },
  {
    name: "a string that is not closed",
    fixture: "db-quoted-fields",
    mutate: setIn("StringLiteral", "closed", false),
    expected: "the string is not closed",
  },
  {
    name: "a string with nothing between its quotes",
    fixture: "db-quoted-fields",
    mutate: setIn("StringLiteral", "value", ""),
    expected: "the string has nothing between its quotes",
  },
  {
    name: "a string with a single quote inside",
    fixture: "db-quoted-doubled-quote",
    mutate: setIn("StringLiteral", "value", 'a"b'),
    expected: 'holds a `"` that is not in a pair of `"`',
  },
  {
    name: "a field with a quote in a tag that is not closed",
    fixture: "lex-html-tag-in-unquoted-field",
    mutate: setIn("SankeyIdentifier", "name", '<a b="c'),
    expected: "which a field without quotes does not hold",
  },
  {
    name: "a string with a quote in a tag that is not closed",
    fixture: "lex-html-tag-in-quoted-field",
    mutate: setIn("StringLiteral", "value", 'x<a b="c'),
    expected: 'holds a `"` that is not in a pair of `"`',
  },
  {
    name: "a name whose range holds the whitespace after its token",
    fixture: "db-fields-trimmed",
    mutate: (root) => {
      const node = firstNode(root, "SankeyIdentifier")
      setField(node, "range", [node.range[0], node.range[1] + 1])
    },
    expected:
      "SankeyIdentifier at 9-11: the texts of its tokens joined are not its written text",
  },
  // parser/docs/tokens/sankey.md, Tokens: the kinds of the tokens.
  {
    name: "the header as a RawText token",
    fixture: "db-link-basic",
    mutate: retypeIn("SankeyDiagram", "Keyword", "sankey", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "the header sankey-beta as a Punctuator token",
    fixture: "db-header-beta",
    mutate: retypeIn("SankeyDiagram", "Keyword", "sankey-beta", "Punctuator"),
    expected: `${OWN_KIND}: "Punctuator", not "Keyword"`,
  },
  {
    name: "a comma as a RawText token",
    fixture: "db-link-basic",
    mutate: retypeIn("SankeyLinkStatement", "Punctuator", ",", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Punctuator"`,
  },
  {
    name: "a name as a Keyword token",
    fixture: "db-link-basic",
    mutate: retypeIn("SankeyIdentifier", "RawText", "a", "Keyword"),
    expected: "are not all of the kind RawText: Keyword",
  },
  {
    name: "a value as an Identifier token",
    fixture: "db-link-basic",
    mutate: retypeIn("SankeyLiteral", "RawText", "1", "Identifier"),
    expected: "are not all of the kind RawText: Identifier",
  },
  {
    name: "a name that an ignored `;` cuts, with a Keyword token for its first part",
    fixture: "lex-style-line-semicolon-source",
    mutate: retypeIn("SankeyIdentifier", "RawText", "style:#x", "Keyword"),
    expected: "are not all of the kind RawText: Keyword, RawText",
  },
  // parser/docs/positions/sankey.md, Ranges.
  {
    name: "a diagram whose range starts after its header",
    fixture: "db-link-basic",
    mutate: (root) => {
      const diagram = firstNode(root, "SankeyDiagram")
      setField(diagram, "range", [1, diagram.range[1]])
    },
    expected: HULL,
  },
  {
    name: "a link whose range ends before its value",
    fixture: "db-fields-trimmed",
    mutate: (root) => {
      const statement = firstNode(root, "SankeyLinkStatement")
      setField(statement, "range", [statement.range[0], statement.range[1] - 1])
    },
    expected: HULL,
  },
  {
    name: "a link whose range starts at the spaces before its source",
    fixture: "db-fields-trimmed",
    mutate: (root) => {
      const statement = firstNode(root, "SankeyLinkStatement")
      setField(statement, "range", [statement.range[0] - 2, statement.range[1]])
    },
    expected: HULL,
  },
  {
    name: "a link whose target is before its source",
    fixture: "db-link-basic",
    mutate: (root) => {
      const statement = firstNode(root, "SankeyLinkStatement")
      setField(statement, "source", statement.target)
      setField(statement, "target", firstNode(root, "SankeyIdentifier"))
    },
    expected: "are not in the order source, `,`, target, `,`, value",
  },
  {
    name: "a name of whitespace only with a value that is not empty",
    fixture: "db-spaces-only-target-id",
    mutate: (root) => {
      const target = firstNode(root, "SankeyLinkStatement").target
      setField(target as object, "name", "x")
    },
    expected:
      "a token of the field starts or ends with whitespace, though the field is not whitespace only",
  },
  {
    name: "a name with an empty value whose token is not whitespace",
    fixture: "db-link-basic",
    mutate: setIn("SankeyIdentifier", "name", ""),
    expected:
      "an empty value is not the one token of the whitespace of a field of whitespace only",
  },
  {
    name: "a header that is another word",
    fixture: "db-link-basic",
    mutate: (root) => {
      setField(root.tokens[0] ?? root, "value", "sankex")
    },
    expected: "not the header (sankey or sankey-beta)",
  },
  {
    name: "a comment after the header",
    fixture: "db-link-basic",
    mutate: (root) => {
      setField(root, "comments", [
        ...root.comments,
        {
          type: "Comment",
          mark: "%%",
          value: "",
          range: [7, 8],
          loc: root.loc,
        },
      ])
    },
    expected: "the mark %% is no mark of the comments of a SankeyDiagram",
  },
]

describe("the check of a sankey tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("sankey", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})

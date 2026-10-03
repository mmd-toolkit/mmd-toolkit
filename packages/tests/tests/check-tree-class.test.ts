import { describe, expect, it } from "vitest"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  firstTokenIn,
  problemsOf,
  says,
  setField,
} from "./check-tree-recorded.ts"

// The checks of a class tree (ast/class.md): each case changes one thing of a
// recorded tree so that it breaks the sentence of the document that the check
// implements.

/** Appends `X` to the value of the first node of the type `type`. */
function appendToValue(type: string): MutationCase["mutate"] {
  return (root) => {
    const node = firstNode(root, type)
    setField(node, "value", `${String(node.value)}X`)
  }
}

/** Sets `field` of the first node of the type `type` to `value`. */
function setFieldOf(
  type: string,
  field: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type), field, value)
  }
}

const CASES: readonly MutationCase[] = [
  // Values: the value of a leaf node is its written text.
  {
    name: "a ClassLiteral value that is not its text",
    fixture: "gram-member-statement",
    mutate: appendToValue("ClassLiteral"),
    expected: 'ClassLiteral at 18-23: value is not its written text: "int xX"',
  },
  {
    name: "a ClassIgnoredText value that is not its text",
    fixture: "lex-direction-line-value-then-text",
    mutate: appendToValue("ClassIgnoredText"),
    expected: 'ClassIgnoredText at 25-26: value is not its written text: "XX"',
  },
  {
    name: "a StringLiteral value that is not its text",
    fixture: "db-link-undefined-class",
    mutate: appendToValue("StringLiteral"),
    expected: 'StringLiteral at 20-23: value is not its written text: "uX"',
  },
  {
    name: "a StringLiteral that is not closed, with the value of a closed one",
    fixture: "db-link-undefined-class",
    mutate: setFieldOf("StringLiteral", "closed", false),
    expected: "value is not its written text",
  },
  {
    name: "a ClassArrow value that is not the texts of its tokens",
    fixture: "lex-aggregation-end",
    mutate: appendToValue("ClassArrow"),
    expected:
      'ClassArrow at 15-18: value is not the texts of its tokens joined: "--oX"',
  },
  // The fields of an arrow are what its tokens write.
  {
    name: "a ClassArrow with another start marker",
    fixture: "lex-aggregation-end",
    mutate: setFieldOf("ClassArrow", "startMarker", "arrow"),
    expected: "the fields, written --o",
  },
  {
    name: "a ClassArrow with another line",
    fixture: "lex-aggregation-end",
    mutate: setFieldOf("ClassArrow", "line", "dotted"),
    expected: "the fields, written --o",
  },
  {
    name: "a ClassArrow with another end marker",
    fixture: "lex-aggregation-end",
    mutate: setFieldOf("ClassArrow", "endMarker", "none"),
    expected: "the fields, written --o",
  },
  {
    name: "a ClassArrow token that is not a Punctuator",
    fixture: "lex-aggregation-end",
    mutate: (root) => {
      setField(
        firstTokenIn(root, firstNode(root, "ClassArrow")),
        "type",
        "Keyword",
      )
    },
    expected: "is a Keyword, not a Punctuator",
  },
  // The marks of a member.
  {
    name: "a member without the visibility that its mark writes",
    fixture: "db-member-visibility-then-space",
    mutate: setFieldOf("ClassAttribute", "visibility", "none"),
    expected: "the visibility",
  },
  {
    name: "a member with a visibility that no mark writes",
    fixture: "db-member-entity",
    mutate: setFieldOf("ClassAttribute", "visibility", "public"),
    expected: "the visibility",
  },
  {
    name: "a member without the classifier that its mark writes",
    fixture: "db-member-visibility-space-then-classifier",
    mutate: setFieldOf("ClassAttribute", "classifier", "none"),
    expected: "the classifier",
  },
  {
    name: "a member with a classifier that no mark writes",
    fixture: "gram-member-statement",
    mutate: setFieldOf("ClassAttribute", "classifier", "static"),
    expected: "the classifier",
  },
  // A direction statement and a link.
  {
    name: "a direction that is not its value token",
    fixture: "lex-direction-line-value-next-line",
    mutate: setFieldOf("ClassDirectionStatement", "direction", "TB"),
    expected: "ClassDirectionStatement at 13-25: the keywords",
  },
  {
    name: "a link target that is not its last token",
    fixture: "db-click-href",
    mutate: setFieldOf("ClassLinkStatement", "target", "_top"),
    expected: "the last token, which is the target",
  },
  {
    name: "a link target where there is no target token",
    fixture: "db-link-undefined-class",
    mutate: setFieldOf("ClassLinkStatement", "target", "_self"),
    expected: "the last token, which is the target",
  },
  // Tokens and value nodes.
  {
    name: "a value token where a Keyword is",
    fixture: "lex-direction-line-value-next-line",
    mutate: (root) => {
      setField(
        firstTokenIn(
          root,
          firstNode(root, "ClassDirectionStatement"),
          (token) => token.type === "Keyword",
        ),
        "type",
        "Identifier",
      )
    },
    expected: "lies in no value node",
  },
]

describe("the check of a class tree", () => {
  for (const mutation of CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("class", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})

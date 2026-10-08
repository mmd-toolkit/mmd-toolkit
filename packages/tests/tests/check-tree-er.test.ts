import { describe, expect, it } from "vitest"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  firstTokenIn,
  problemsOf,
  says,
  setField,
} from "./check-tree-recorded.ts"

// The checks of an ER tree (ast/er.md): each case changes one thing of a
// recorded tree so that it breaks the sentence of the document that the check
// implements.

/** Appends `X` to the field `field` of the first node of the type `type`. */
function appendTo(type: string, field: string): MutationCase["mutate"] {
  return (root) => {
    const node = firstNode(root, type)
    setField(node, field, `${String(node[field])}X`)
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
  // Values: the value of a leaf node is its written text; the value of a
  // style is the written texts of its units joined.
  {
    name: "an ErIdentifier name that is not its text",
    fixture: "gram-alias",
    mutate: appendTo("ErIdentifier", "name"),
    expected: 'ErIdentifier at 10-11: name is not its written text: "pX"',
  },
  {
    name: "an ErLiteral value that is not its text",
    fixture: "gram-acc-title",
    mutate: appendTo("ErLiteral", "value"),
    expected: 'ErLiteral at 20-21: value is not its written text: "TX"',
  },
  {
    name: "an ErLiteral of a style whose value is not the texts of its tokens joined",
    fixture: "lex-classdef-style-spaces",
    mutate: appendTo("ErLiteral", "value"),
    expected: "value is not the texts of its tokens joined",
  },
  {
    name: "an ErIgnoredText value that is not its text",
    fixture: "lex-direction-line-text-after",
    mutate: appendTo("ErIgnoredText", "value"),
    expected: 'ErIgnoredText at 23-24: value is not its written text: "xX"',
  },
  {
    name: "a StringLiteral value that is not the text between its quotes",
    fixture: "gram-role-string",
    mutate: appendTo("StringLiteral", "value"),
    expected: "value is not its written text",
  },
  // The fields of a relationship are what its three units write.
  {
    name: "an ErRelationship with another left cardinality",
    fixture: "gram-relationship-symbols",
    mutate: setFieldOf("ErRelationship", "leftCardinality", "zero-or-one"),
    expected: "the fields, written || -- o{",
  },
  {
    name: "an ErRelationship with another line",
    fixture: "gram-relationship-symbols",
    mutate: setFieldOf("ErRelationship", "line", "non-identifying"),
    expected: "the fields, written || -- o{",
  },
  {
    name: "an ErRelationship with another right cardinality",
    fixture: "gram-relationship-symbols",
    mutate: setFieldOf("ErRelationship", "rightCardinality", "one-or-more"),
    expected: "the fields, written || -- o{",
  },
  {
    name: "an ErRelationship written with words whose line is not that of `to`",
    fixture: "lex-cardinality-words",
    mutate: setFieldOf("ErRelationship", "line", "non-identifying"),
    expected: "the fields, written one or more to zero or one",
  },
  {
    name: "an ErRelationship with a cardinality that is no name of the specification",
    fixture: "gram-relationship-symbols",
    mutate: setFieldOf("ErRelationship", "leftCardinality", "||"),
    expected: "the fields, written || -- o{",
  },
  // The direction is the value of the statement in upper case.
  {
    name: "a direction written in lower case that stays in lower case",
    fixture: "lex-direction-lower-case",
    mutate: setFieldOf("ErDirectionStatement", "direction", "lr"),
    expected:
      'the keywords, the value in upper case: ["direction","LR"], not ["direction","lr"]',
  },
  {
    name: "a direction that is not its value token",
    fixture: "lex-direction-lower-case",
    mutate: setFieldOf("ErDirectionStatement", "direction", "TB"),
    expected:
      'the keywords, the value in upper case: ["direction","LR"], not ["direction","TB"]',
  },
  // `optional` is whether a `?` follows the type.
  {
    name: "an attribute with a `?` that is not optional",
    fixture: "gram-optional-type",
    mutate: setFieldOf("ErAttribute", "optional", false),
    expected:
      "optional, which is whether a `?` follows the type: false, not true",
  },
  {
    name: "an attribute without a `?` that is optional",
    fixture: "gram-attribute",
    mutate: setFieldOf("ErAttribute", "optional", true),
    expected:
      "optional, which is whether a `?` follows the type: true, not false",
  },
  // A token of a value lies in a value node, and a `Keyword` or `Punctuator`
  // token in none.
  {
    name: "a Punctuator in a style",
    fixture: "gram-classdef",
    mutate: (root) => {
      setField(
        firstTokenIn(
          root,
          firstNode(root, "ErLiteral"),
          (token) => token.type === "RawText",
        ),
        "type",
        "Punctuator",
      )
    },
    expected: "lies in the value node ErLiteral",
  },
]

describe("the check of an ER tree", () => {
  for (const mutation of CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("er", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})

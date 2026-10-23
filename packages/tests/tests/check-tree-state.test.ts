import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  copyOf,
  firstNode,
  firstTokenIn,
  problemsOf,
  recordedTree,
  says,
  setField,
} from "./check-tree-recorded.ts"

// The checks of a state tree (ast/state.md): each case changes one thing of a
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

/** Sets `field` of the first token inside the first node of the type `type` to `value`. */
function setTokenField(
  type: string,
  field: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstTokenIn(root, firstNode(root, type)), field, value)
  }
}

const CASES: readonly MutationCase[] = [
  // Values: the value of a leaf node is its written text.
  {
    name: "a StateLiteral value that is not its text",
    fixture: "db-description-id-alone",
    mutate: appendToValue("StateLiteral"),
    expected: "value is not its written text",
  },
  {
    name: "a StateIgnoredText value that is not its text",
    fixture: "gram-state-empty-string-before-name",
    mutate: appendToValue("StateIgnoredText"),
    expected: "value is not its written text",
  },
  {
    name: "a StateIgnoredStatement value that is not its text",
    fixture: "gram-state-empty-string-alone",
    mutate: appendToValue("StateIgnoredStatement"),
    expected: "value is not its written text",
  },
  {
    name: "a StringLiteral value that is not the text between its quotes",
    fixture: "lex-alias-as-at-end",
    mutate: appendToValue("StringLiteral"),
    expected: "value is not its written text",
  },
  {
    name: "a StringLiteral that is not closed",
    fixture: "lex-alias-as-at-end",
    mutate: setFieldOf("StringLiteral", "closed", false),
    expected: "is not closed",
  },
  // `[*]` and `--` are one Punctuator token.
  {
    name: "a StateTerminal whose token is not [*]",
    fixture: "gram-terminal-alone",
    mutate: setTokenField("StateTerminal", "value", "[x]"),
    expected: 'the tokens: [["Punctuator","[x]"]]',
  },
  {
    name: "a StateTerminal whose token is not a Punctuator",
    fixture: "gram-terminal-alone",
    mutate: setTokenField("StateTerminal", "type", "Keyword"),
    expected: 'the tokens: [["Keyword","[*]"]]',
  },
  {
    name: "a StateDividerStatement whose token is not --",
    fixture: "db-divider-alone-in-body",
    mutate: setTokenField("StateDividerStatement", "value", "-"),
    expected: 'the tokens: [["Punctuator","-"]]',
  },
  // The words of a statement are its tokens.
  {
    name: "a pseudostate whose kind is not that of its mark",
    fixture: "lex-join-empty-id",
    mutate: setFieldOf("StatePseudostateDefinitionStatement", "kind", "fork"),
    expected: 'the kind "fork" is not that of the mark "<<join>>"',
  },
  {
    name: "a note whose position is not that of its token",
    fixture: "lex-note-mixed-case",
    mutate: setFieldOf("StateNoteStatement", "position", "right"),
    expected:
      'the position, which is the word before `of`: ["left","of"], not ["right","of"]',
  },
  {
    name: "a direction that is not its value token",
    fixture: "lex-direction-lower-case",
    mutate: setFieldOf("StateDirectionStatement", "direction", "TB"),
    expected: 'the keywords: ["direction","lr"], not ["direction","tb"]',
  },
  // A description block is closed when it ends with `}`.
  {
    name: "a closed description block that does not end with }",
    fixture: "gram-empty-description-block-statement",
    mutate: setFieldOf("StateAccDescrBlockStatement", "closed", false),
    expected: "closed, which is whether it ends with }: true, not false",
  },
  {
    name: "an unclosed description block that ends with }",
    fixture: "lex-acc-descr-block-unclosed",
    mutate: setFieldOf("StateAccDescrBlockStatement", "closed", true),
    expected: "closed, which is whether it ends with }: false, not true",
  },
  // The words of `hide empty description` are one token each, and the kind of
  // a pseudostate is the word of its mark, written with `<<>>` or `[[]]`.
  {
    name: "a hide empty description statement with a word that is no Keyword",
    fixture: "gram-hide-empty-description",
    mutate: (root) => {
      setField(
        firstTokenIn(
          root,
          firstNode(root, "StateHideEmptyDescriptionStatement"),
          (token) => token.value === "empty",
        ),
        "type",
        "RawText",
      )
    },
    expected:
      "StateHideEmptyDescriptionStatement at 18-40: the keywords, one token for each word",
  },
  {
    name: "a pseudostate written [[choice]] whose kind is fork",
    fixture: "lex-choice-square-brackets",
    mutate: setFieldOf("StatePseudostateDefinitionStatement", "kind", "fork"),
    expected:
      'StatePseudostateDefinitionStatement at 18-37: the kind "fork" is not that of the mark "[[choice]]"',
  },
  // The `:` at the start of the text of a note is not a value token, but
  // another Punctuator in the text is.
  {
    name: "a Punctuator in the text of a note",
    fixture: "lex-note-two-spaces-before-colon",
    mutate: (root) => {
      setField(
        firstTokenIn(
          root,
          firstNode(root, "StateNoteStatement"),
          (token) => token.value === "hi",
        ),
        "type",
        "Punctuator",
      )
    },
    expected: "lies in the value node StateLiteral",
  },
]

describe("the check of a state tree", () => {
  for (const mutation of CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("state", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }

  it("passes the `:` at the start of the text of a note on one line with two whitespace characters before it", () => {
    const { input, tree } = recordedTree(
      "state",
      "lex-note-two-spaces-before-colon",
    )
    const colon = firstTokenIn(
      tree,
      firstNode(tree, "StateNoteStatement"),
      (token) => token.value === ":",
    )
    expect(colon.type).toBe("Punctuator")
    expect(checkTree(input, copyOf(tree))).toEqual([])
  })
})

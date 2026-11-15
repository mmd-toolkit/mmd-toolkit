import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
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
  endOfSource,
  itFailsEach,
  nodeWith,
  ownKind,
  retype,
  tokenWith,
} from "./check-tree-built.ts"
import type { BrokenCase } from "./check-tree-built.ts"

// The trees of a journey diagram made by hand: they are the smallest trees
// that hold the case they are about (see `check-tree-built.ts`); the recorded
// trees of the corpus are the other half of the tests below. The tokens have
// the kinds that the table of Tokens of parser/docs/tokens/journey.md gives
// them, and the ranges follow ast/journey.md and parser/docs/positions/
// journey.md.

/** A journey tree: the header `journey`, a line feed, and the statements. */
function build(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "journey",
      diagramType: "journey",
      bodyType: "JourneyDiagram",
    },
    source,
    makeStatements,
  )
}

/** A text unit: its `RawText` token, and the `JourneyLiteral` that holds it. */
function literal(kit: Kit, text: string, value = text): CheckedNode {
  const token = kit.token("RawText", text)
  return kit.node("JourneyLiteral", token.range, { value })
}

/** `TITLE  T  `: the keyword in upper case, then a title that keeps its whitespace: the one whitespace character after the keyword is not part of it. */
function title(): Built {
  return build("journey\nTITLE  T  ", (kit) => {
    const keyword = kit.token("Keyword", "TITLE")
    const value = literal(kit, " T  ")
    return [
      kit.node("JourneyTitleStatement", [keyword.range[0], value.range[1]], {
        value,
      }),
    ]
  })
}

/** `section S ` with the name `S `. */
function section(): Built {
  return build("journey\nsection S ", (kit) => {
    const keyword = kit.token("Keyword", "section")
    const name = literal(kit, "S ")
    return [
      kit.node("JourneySectionStatement", [keyword.range[0], name.range[1]], {
        name,
      }),
    ]
  })
}

/** `A : 5 : Me, , Cat: x: y`: the description `A `, the score `5`, the people `Me`, null, and `Cat`, and the text `: x: y` from the third colon. */
function taskWithEverything(): Built {
  return build("journey\nA : 5 : Me, , Cat: x: y", (kit) => {
    const description = literal(kit, "A ")
    kit.token("Punctuator", ":")
    const score = literal(kit, "5")
    kit.token("Punctuator", ":")
    const me = literal(kit, "Me")
    kit.token("Punctuator", ",")
    kit.token("Punctuator", ",")
    const cat = literal(kit, "Cat")
    const rest = kit.token("RawText", ": x: y")
    return [
      kit.node("JourneyTaskStatement", [description.range[0], rest.range[1]], {
        description,
        score,
        people: [me, null, cat],
        textAfter: kit.node("JourneyIgnoredText", rest.range, {
          value: ": x: y",
        }),
      }),
    ]
  })
}

/** `A: 5` and two spaces: a score and no people; the range ends at the score. */
function taskWithScoreOnly(): Built {
  return build("journey\nA: 5  ", (kit) => {
    const description = literal(kit, "A")
    kit.token("Punctuator", ":")
    const score = literal(kit, "5")
    return [
      kit.node("JourneyTaskStatement", [description.range[0], score.range[1]], {
        description,
        score,
        people: [],
        textAfter: null,
      }),
    ]
  })
}

/** `A:` and three spaces: the data is whitespace only, so no score, and the range ends at the colon. */
function taskWithBlankData(): Built {
  return build("journey\nA:   ", (kit) => {
    const description = literal(kit, "A")
    const colon = kit.token("Punctuator", ":")
    return [
      kit.node("JourneyTaskStatement", [description.range[0], colon.range[1]], {
        description,
        score: null,
        people: [],
        textAfter: null,
      }),
    ]
  })
}

/** `A: 5:` and two spaces: a second colon and nothing after it is one null person, and the range ends at that colon. */
function taskWithOneEmptyPerson(): Built {
  return build("journey\nA: 5:  ", (kit) => {
    const description = literal(kit, "A")
    kit.token("Punctuator", ":")
    const score = literal(kit, "5")
    const second = kit.token("Punctuator", ":")
    return [
      kit.node(
        "JourneyTaskStatement",
        [description.range[0], second.range[1]],
        {
          description,
          score,
          people: [null],
          textAfter: null,
        },
      ),
    ]
  })
}

/** `A: 5: Me,`: the person `Me` and a null person after the comma; the range ends at the comma. */
function taskWithTrailingComma(): Built {
  return build("journey\nA: 5: Me,", (kit) => {
    const description = literal(kit, "A")
    kit.token("Punctuator", ":")
    const score = literal(kit, "5")
    kit.token("Punctuator", ":")
    const me = literal(kit, "Me")
    const comma = kit.token("Punctuator", ",")
    return [
      kit.node("JourneyTaskStatement", [description.range[0], comma.range[1]], {
        description,
        score,
        people: [me, null],
        textAfter: null,
      }),
    ]
  })
}

/** `A: 1%%{x}%%0`: the score `10`, which a directive cuts into two `RawText` tokens. */
function taskWithCutScore(): Built {
  return build("journey\nA: 1%%{x}%%0", (kit) => {
    const description = literal(kit, "A")
    kit.token("Punctuator", ":")
    const start = kit.token("RawText", "1")
    kit.directive("%%{x}%%")
    const end = kit.token("RawText", "0")
    return [
      kit.node("JourneyTaskStatement", [description.range[0], end.range[1]], {
        description,
        score: kit.node("JourneyLiteral", [start.range[0], end.range[1]], {
          value: "10",
        }),
        people: [],
        textAfter: null,
      }),
    ]
  })
}

/** `A: 5: Me:`: the text from the third colon is the colon alone. */
function taskWithColonAfterPeople(): Built {
  return build("journey\nA: 5: Me:", (kit) => {
    const description = literal(kit, "A")
    kit.token("Punctuator", ":")
    const score = literal(kit, "5")
    kit.token("Punctuator", ":")
    const me = literal(kit, "Me")
    const rest = kit.token("RawText", ":")
    return [
      kit.node("JourneyTaskStatement", [description.range[0], rest.range[1]], {
        description,
        score,
        people: [me],
        textAfter: kit.node("JourneyIgnoredText", rest.range, { value: ":" }),
      }),
    ]
  })
}

/** `accTitle: T u` and two spaces: the value is the text without the whitespace at its end. */
function accTitle(): Built {
  return build("journey\naccTitle: T u  ", (kit) => {
    const keyword = kit.token("Keyword", "accTitle")
    kit.token("Punctuator", ":")
    const value = literal(kit, "T u")
    return [
      kit.node("JourneyAccTitleStatement", [keyword.range[0], value.range[1]], {
        value,
      }),
    ]
  })
}

/** `accDescr:`, a line feed, and `  D`: the text starts on the line after the colon. */
function accDescrOnNextLine(): Built {
  return build("journey\naccDescr:\n  D", (kit) => {
    const keyword = kit.token("Keyword", "accDescr")
    kit.token("Punctuator", ":")
    const value = literal(kit, "D")
    return [
      kit.node("JourneyAccDescrStatement", [keyword.range[0], value.range[1]], {
        value,
      }),
    ]
  })
}

/** `accDescr { d e }`: the value is the text between the braces without the whitespace at its ends. */
function accDescrBlock(): Built {
  return build("journey\naccDescr { d e }", (kit) => {
    const keyword = kit.token("Keyword", "accDescr")
    kit.token("Punctuator", "{")
    const value = literal(kit, "d e")
    const close = kit.token("Punctuator", "}")
    return [
      kit.node(
        "JourneyAccDescrBlockStatement",
        [keyword.range[0], close.range[1]],
        { value },
      ),
    ]
  })
}

/** `accDescr {  }`: a block with whitespace only has the value null. */
function emptyAccDescrBlock(): Built {
  return build("journey\naccDescr {  }", (kit) => {
    const keyword = kit.token("Keyword", "accDescr")
    kit.token("Punctuator", "{")
    const close = kit.token("Punctuator", "}")
    return [
      kit.node(
        "JourneyAccDescrBlockStatement",
        [keyword.range[0], close.range[1]],
        { value: null },
      ),
    ]
  })
}

/** Diagram comments of the three marks, `#`, `%%`, and `%`, before a title, and a `#` comment that ends the text of the title and of the section after it. */
function statementsAmongComments(): Built {
  return build("journey\n# c\n%%\n% c\ntitle T # d\nsection S # e", (kit) => {
    kit.comment("#", "# c")
    kit.comment("%%", "%%")
    kit.comment("%", "% c")
    const titleKeyword = kit.token("Keyword", "title")
    const value = literal(kit, "T ")
    kit.comment("#", "# d")
    const sectionKeyword = kit.token("Keyword", "section")
    const name = literal(kit, "S ")
    kit.comment("#", "# e")
    return [
      kit.node(
        "JourneyTitleStatement",
        [titleKeyword.range[0], value.range[1]],
        {
          value,
        },
      ),
      kit.node(
        "JourneySectionStatement",
        [sectionKeyword.range[0], name.range[1]],
        {
          name,
        },
      ),
    ]
  })
}

/** The trees that satisfy every sentence, by name. */
const VALID: Readonly<Record<string, () => Built>> = {
  "a title in upper case that keeps its whitespace": title,
  "a section that keeps its whitespace": section,
  "a task with a score, people with a null one, and a text from the third colon":
    taskWithEverything,
  "a task with a score only": taskWithScoreOnly,
  "a task whose data is whitespace only": taskWithBlankData,
  "a task with a second colon and nothing after it": taskWithOneEmptyPerson,
  "a task with a null person after a comma": taskWithTrailingComma,
  "a task with a score that a directive cuts": taskWithCutScore,
  "a task whose text from the third colon is the colon":
    taskWithColonAfterPeople,
  "an accessibility title": accTitle,
  "an accessibility description on the line after its colon":
    accDescrOnNextLine,
  "a description block": accDescrBlock,
  "an empty description block": emptyAccDescrBlock,
  "a title and a section among diagram comments of the three marks":
    statementsAmongComments,
}

describe("checkTree: a journey tree made by hand", () => {
  for (const [name, make] of Object.entries(VALID)) {
    it(`accepts ${name}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

/** Gives the token of the text `from` and the `JourneyLiteral` of that value the range `range` and the text `text`. */
function reshape(
  tree: CheckedRoot,
  from: string,
  range: [number, number],
  text: string,
): void {
  const token = tokenWith(tree, from)
  setField(token, "range", range)
  setField(token, "value", text)
  const node = nodeWith(tree, "JourneyLiteral", "value", from)
  setField(node, "range", range)
  setField(node, "value", text)
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

/** Sets the `value` of the first node of the type `type` to `value`. */
function setValue(type: string, value: string): BrokenCase["mutate"] {
  return setIn(type, "value", value)
}

/** The part of the message of a problem that the node `owner` reports at its tokens and fields: `where: message`. */
function at(owner: string, message: string): string {
  return `${owner} at #: ${message}`
}

const BROKEN: readonly BrokenCase[] = [
  // The kinds of the tokens that a node writes itself: a keyword and the
  // header are `Keyword` tokens, and `:`, `,`, `{`, and `}` are `Punctuator`
  // tokens.
  {
    name: "the keyword of a title as a RawText token",
    built: title,
    mutate: retype("TITLE", "RawText"),
    expected: ownKind("TITLE", "JourneyTitleStatement", "RawText", "Keyword"),
  },
  {
    name: "the colon of a task as a Keyword token",
    built: taskWithScoreOnly,
    mutate: retype(":", "Keyword"),
    expected: ownKind(":", "JourneyTaskStatement", "Keyword", "Punctuator"),
  },
  {
    name: "the comma of the people of a task as a Keyword token",
    built: taskWithTrailingComma,
    mutate: retype(",", "Keyword"),
    expected: ownKind(",", "JourneyTaskStatement", "Keyword", "Punctuator"),
  },
  {
    name: "the closing brace of a description block as a Keyword token",
    built: accDescrBlock,
    mutate: retype("}", "Keyword"),
    expected: ownKind(
      "}",
      "JourneyAccDescrBlockStatement",
      "Keyword",
      "Punctuator",
    ),
  },
  {
    name: "the header as an Identifier token",
    built: title,
    mutate: retype("journey", "Identifier"),
    expected: ownKind("journey", "JourneyDiagram", "Identifier", "Keyword"),
  },
  // The tokens of a text unit are `RawText` tokens, also where a directive
  // cuts it.
  {
    name: "the description of a task as a Keyword token",
    built: taskWithScoreOnly,
    mutate: retype("A", "Keyword"),
    expected: at(
      "JourneyLiteral",
      "the tokens of a JourneyLiteral are not all of the kind RawText: Keyword",
    ),
  },
  {
    name: "the score of a task as an Identifier token",
    built: taskWithScoreOnly,
    mutate: retype("5", "Identifier"),
    expected: at(
      "JourneyLiteral",
      "the tokens of a JourneyLiteral are not all of the kind RawText: Identifier",
    ),
  },
  {
    name: "a score that a directive cuts, one fragment of which is a String token",
    built: taskWithCutScore,
    mutate: retype("0", "String"),
    expected: at(
      "JourneyLiteral",
      "the tokens of a JourneyLiteral are not all of the kind RawText: RawText, String",
    ),
  },
  {
    name: "the text from the third colon as a Punctuator token",
    built: taskWithColonAfterPeople,
    mutate: (tree) => {
      const token = tree.tokens.filter((candidate) => candidate.value === ":")
      setField(token.at(-1) as object, "type", "Punctuator")
    },
    expected: at(
      "JourneyIgnoredText",
      "the tokens of a JourneyIgnoredText are not all of the kind RawText: Punctuator",
    ),
  },
  {
    name: "a title that is no text",
    built: title,
    mutate: setValue("JourneyLiteral", ""),
    expected: at("JourneyLiteral", "the value of a JourneyLiteral is empty"),
  },
  // The range of a statement runs from the first of its tokens and child
  // nodes to the last, so it does not cover the whitespace after them.
  {
    name: "a task whose range covers the whitespace after its score",
    built: taskWithScoreOnly,
    mutate: endAt("JourneyTaskStatement", endOfSource),
    expected: at(
      "JourneyTaskStatement",
      "the range, which runs from the first of its tokens and child nodes to the last",
    ),
  },
  {
    name: "a task whose data is whitespace only and whose range covers the whitespace after the colon",
    built: taskWithBlankData,
    mutate: endAt("JourneyTaskStatement", endOfSource),
    expected: at(
      "JourneyTaskStatement",
      "the range, which runs from the first of its tokens and child nodes to the last",
    ),
  },
  {
    name: "a task with one null person whose range covers the whitespace after the second colon",
    built: taskWithOneEmptyPerson,
    mutate: endAt("JourneyTaskStatement", endOfSource),
    expected: at(
      "JourneyTaskStatement",
      "the range, which runs from the first of its tokens and child nodes to the last",
    ),
  },
  {
    name: "a task whose range ends before the last comma, which its people part holds",
    built: taskWithTrailingComma,
    mutate: endAt("JourneyTaskStatement", (_tree, source) => source.length - 1),
    expected: at(
      "JourneyTaskStatement",
      "the number of the person, which is one more than the separators: 2, not 1",
    ),
  },
  {
    name: "an accessibility title whose range covers the whitespace after its text",
    built: accTitle,
    mutate: endAt("JourneyAccTitleStatement", endOfSource),
    expected: at(
      "JourneyAccTitleStatement",
      "the range, which runs from the first of its tokens and child nodes to the last",
    ),
  },
  {
    name: "a description block that ends before its closing brace",
    built: accDescrBlock,
    mutate: endAt(
      "JourneyAccDescrBlockStatement",
      (tree) => nodeWith(tree, "JourneyLiteral").range[1],
    ),
    expected: at(
      "JourneyAccDescrBlockStatement",
      'the tokens of the node outside its child nodes, joined: "accdescr{", not "accdescr{}"',
    ),
  },
  // The tokens that a node writes itself are those of its grammar rule.
  {
    name: "a header that is not in lower case",
    built: title,
    mutate: (tree) => {
      setField(tokenWith(tree, "journey"), "value", "Journey")
    },
    expected: at(
      "JourneyDiagram",
      'the tokens of the node outside its child nodes, joined: "Journey", not "journey"',
    ),
  },
  {
    name: "a task with a person but no second colon",
    built: taskWithColonAfterPeople,
    mutate: setIn("JourneyTaskStatement", "people", []),
    expected: at(
      "JourneyTaskStatement",
      "textAfter is not null, but the data has no second colon, so no third colon",
    ),
  },
  {
    name: "a task with a second colon whose people are none",
    built: taskWithOneEmptyPerson,
    mutate: setIn("JourneyTaskStatement", "people", []),
    expected: at(
      "JourneyTaskStatement",
      'the tokens of the node outside its child nodes: the colon after the description, and with people the second colon and the commas between them: "::", not ":"',
    ),
  },
  // The text of a title and of a section starts after the keyword and one
  // whitespace character, and ends where its line or a `#`, `:`, or `;` ends.
  {
    name: "a title that starts after two whitespace characters",
    built: title,
    mutate: (tree) => {
      reshape(tree, " T  ", [15, 18], "T  ")
    },
    expected: at(
      "JourneyTitleStatement",
      'the written text between the keyword and the value is "  ", not one whitespace character',
    ),
  },
  {
    name: "a title that ends before the whitespace that it keeps",
    built: title,
    mutate: (tree) => {
      reshape(tree, " T  ", [14, 16], " T")
    },
    expected: at(
      "JourneyTitleStatement",
      'the value ends before " ", which does not end the text of the statement',
    ),
  },
  {
    name: "a section that ends before the whitespace that it keeps",
    built: section,
    mutate: (tree) => {
      reshape(tree, "S ", [16, 17], "S")
    },
    expected: at(
      "JourneySectionStatement",
      'the name ends before " ", which does not end the text of the statement',
    ),
  },
  {
    name: "a section whose name holds a colon",
    built: section,
    mutate: setValue("JourneyLiteral", "S:"),
    expected: at(
      "JourneySectionStatement",
      'the name "S:" holds a `:`, which ends the name of a section',
    ),
  },
  // The accessibility statements.
  {
    name: "an accessibility title whose value ends with whitespace",
    built: accTitle,
    mutate: setValue("JourneyLiteral", "T u "),
    expected: at(
      "JourneyAccTitleStatement",
      'the value of an accessibility statement starts or ends with whitespace: "T u "',
    ),
  },
  {
    name: "an accessibility title whose value stops before the end of its line",
    built: accTitle,
    mutate: (tree) => {
      reshape(tree, "T u", [18, 19], "T")
    },
    expected: at(
      "JourneyAccTitleStatement",
      "the value ends before the end of its line and not only whitespace follows it",
    ),
  },
  {
    name: "a description block whose value is null where text lies between the braces",
    built: accDescrBlock,
    mutate: setIn("JourneyAccDescrBlockStatement", "value", null),
    expected: at(
      "JourneyAccDescrBlockStatement",
      'the value is null, but the braces hold " d e "',
    ),
  },
  {
    name: "a description block whose value leaves out text between the braces",
    built: accDescrBlock,
    mutate: (tree) => {
      reshape(tree, "d e", [19, 20], "d")
    },
    expected: at(
      "JourneyAccDescrBlockStatement",
      'the text between the braces has " " before the value and " e " after it, not whitespace only',
    ),
  },
  {
    name: "a description block whose value ends with whitespace",
    built: accDescrBlock,
    mutate: setValue("JourneyLiteral", "d e "),
    expected: at(
      "JourneyAccDescrBlockStatement",
      'the value of a description block starts or ends with whitespace: "d e "',
    ),
  },
  // A task: the description, the score, the people, and the text after them.
  {
    name: "a description that stops before the whitespace that it keeps",
    built: taskWithEverything,
    mutate: (tree) => {
      reshape(tree, "A ", [8, 9], "A")
    },
    expected: at(
      "JourneyTaskStatement",
      'the written text between the description and the colon: " ", not ""',
    ),
  },
  {
    name: "a description that starts with whitespace",
    built: taskWithEverything,
    mutate: setValue("JourneyLiteral", " A "),
    expected: at(
      "JourneyTaskStatement",
      'the description starts with whitespace or holds a `:`: " A "',
    ),
  },
  {
    name: "a description that holds a colon",
    built: taskWithEverything,
    mutate: setValue("JourneyLiteral", "A: "),
    expected: at(
      "JourneyTaskStatement",
      'the description starts with whitespace or holds a `:`: "A: "',
    ),
  },
  {
    name: "a score that is null where the data writes one",
    built: taskWithScoreOnly,
    mutate: setIn("JourneyTaskStatement", "score", null),
    expected: at(
      "JourneyTaskStatement",
      'the score part 0 is null, but " 5" lies in its stretch',
    ),
  },
  {
    name: "a score that keeps the whitespace after it",
    built: taskWithEverything,
    mutate: (tree) => {
      reshape(tree, "5", [12, 14], "5 ")
    },
    expected: at(
      "JourneyTaskStatement",
      'the score starts or ends with whitespace: "5 "',
    ),
  },
  {
    name: "a score that holds a colon",
    built: taskWithScoreOnly,
    mutate: (tree) => {
      const score = nodeWith(tree, "JourneyTaskStatement").score as CheckedNode
      setField(score, "value", "5:")
    },
    expected: at(
      "JourneyTaskStatement",
      'the score "5:" holds a `:`, which divides the data',
    ),
  },
  {
    name: "people that leave out the null person between two commas",
    built: taskWithEverything,
    mutate: (tree) => {
      const task = nodeWith(tree, "JourneyTaskStatement")
      const people = task.people as (CheckedNode | null)[]
      setField(task, "people", [people[0], people[2]])
    },
    expected: at(
      "JourneyTaskStatement",
      "the number of the person, which is one more than the separators: 2, not 3",
    ),
  },
  {
    name: "a person that is null where the people part writes one",
    built: taskWithEverything,
    mutate: (tree) => {
      const task = nodeWith(tree, "JourneyTaskStatement")
      const people = task.people as (CheckedNode | null)[]
      setField(task, "people", [null, people[1], people[2]])
    },
    expected: at(
      "JourneyTaskStatement",
      'the person 0 is null, but " Me" lies in its stretch',
    ),
  },
  {
    name: "a person that holds a comma",
    built: taskWithEverything,
    mutate: (tree) => {
      const task = nodeWith(tree, "JourneyTaskStatement")
      const people = task.people as CheckedNode[]
      setField(people[0], "value", "Me,")
    },
    expected: at(
      "JourneyTaskStatement",
      'the person "Me," holds a `,` or a `:`, which divide the people part',
    ),
  },
  {
    name: "a person that starts with whitespace",
    built: taskWithEverything,
    mutate: (tree) => {
      const task = nodeWith(tree, "JourneyTaskStatement")
      const people = task.people as CheckedNode[]
      setField(people[2], "value", " Cat")
    },
    expected: at(
      "JourneyTaskStatement",
      'a person starts or ends with whitespace: " Cat"',
    ),
  },
  {
    name: "a text from the third colon that is null where the data writes it",
    built: taskWithEverything,
    mutate: setIn("JourneyTaskStatement", "textAfter", null),
    expected: 'RawText at # of ": x: y": lies in no value node',
  },
  {
    name: "a text from the third colon that does not start with the colon",
    built: taskWithEverything,
    mutate: setValue("JourneyIgnoredText", " x: y"),
    expected: at(
      "JourneyTaskStatement",
      'the text after the people part " x: y" does not start with the third colon or ends with whitespace',
    ),
  },
  {
    name: "a text from the third colon that ends with whitespace",
    built: taskWithEverything,
    mutate: setValue("JourneyIgnoredText", ": x: y "),
    expected: at(
      "JourneyTaskStatement",
      'the text after the people part ": x: y " does not start with the third colon or ends with whitespace',
    ),
  },
]

describe("checkTree: the tokens and ranges of a journey tree", () => {
  itFailsEach(BROKEN)

  it("reports the text from the third colon as a token that no value node holds when textAfter is null", () => {
    const { source, tree } = taskWithEverything()
    const broken = copyOf(tree)
    setField(nodeWith(broken, "JourneyTaskStatement"), "textAfter", null)
    expect(
      says(
        checkTree(source, broken),
        'RawText at 25-31 of ": x: y": lies in no',
      ),
    ).toBe(true)
  })

  it("reports the score of a task as a token that no value node holds when score is null", () => {
    const { source, tree } = taskWithScoreOnly()
    const broken = copyOf(tree)
    setField(nodeWith(broken, "JourneyTaskStatement"), "score", null)
    expect(
      says(checkTree(source, broken), 'RawText at 11-12 of "5": lies in no'),
    ).toBe(true)
  })
})

describe("checkTree: a journey keyword that a directive cuts", () => {
  it("reports the fragments of a title keyword (the input is rejected, so no recorded tree has it; the table of keywords holds the words of the journey diagram)", () => {
    const { source, tree } = build("journey\nti%%{x}%%tle T", (kit) => {
      const start = kit.token("Keyword", "ti")
      kit.directive("%%{x}%%")
      kit.token("Keyword", "tle")
      const value = literal(kit, " T")
      return [
        kit.node("JourneyTitleStatement", [start.range[0], value.range[1]], {
          value,
        }),
      ]
    })
    expect(
      says(
        checkTree(source, tree),
        'a Keyword token is cut: Keyword at 8-10, Keyword at 17-20 are the fragments of "title"',
      ),
    ).toBe(true)
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture.

const OWN_KIND = "the kind of a token that the node writes itself"

const RECORDED_CASES: readonly MutationCase[] = [
  // The kinds of the tokens that a node writes itself.
  {
    name: "the keyword of a title statement as a RawText token",
    fixture: "db-title-statement",
    mutate: retypeIn("JourneyTitleStatement", "Keyword", "title", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "the colon of a task as a Keyword token",
    fixture: "db-task-people",
    mutate: retypeIn("JourneyTaskStatement", "Punctuator", ":", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the comma between the people of a task as a Keyword token",
    fixture: "db-task-people",
    mutate: retypeIn("JourneyTaskStatement", "Punctuator", ",", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the brace of a description block as a Keyword token",
    fixture: "db-acc-descr-block",
    mutate: retypeIn(
      "JourneyAccDescrBlockStatement",
      "Punctuator",
      "}",
      "Keyword",
    ),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  // The kinds of the tokens of the values.
  {
    name: "the title as a Keyword token",
    fixture: "db-title-statement",
    mutate: retypeIn("JourneyLiteral", "RawText", null, "Keyword"),
    expected: "the tokens of a JourneyLiteral are not all of the kind RawText",
  },
  {
    name: "the text after the people of a task as a Punctuator token",
    fixture: "db-task-extra-colon",
    mutate: retypeIn("JourneyIgnoredText", "RawText", null, "Punctuator"),
    expected:
      "the tokens of a JourneyIgnoredText are not all of the kind RawText",
  },
  // The ranges.
  {
    name: "a title whose range covers the whitespace after its text",
    fixture: "lex-title-trailing-spaces",
    mutate: setEnd("JourneyTitleStatement", (root) => root.range[1]),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "an accessibility title whose range covers the whitespace after its text",
    fixture: "gram-acc-title-trailing-spaces",
    mutate: setEnd("JourneyAccTitleStatement", (root) => root.range[1]),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  {
    name: "a task whose range covers the whitespace after its colon",
    fixture: "gram-task-data-whitespace-only",
    mutate: setEnd("JourneyTaskStatement", (root) => root.range[1]),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  // The score, the people, and the text after them.
  {
    name: "a task whose score is null where a score is written",
    fixture: "db-task-people",
    mutate: (root) => {
      setField(firstNode(root, "JourneyTaskStatement"), "score", null)
    },
    expected: "the score part 0 is null, but",
  },
  {
    name: "a task with one person fewer than the commas give",
    fixture: "db-task-people",
    mutate: (root) => {
      const people = firstNode(root, "JourneyTaskStatement").people
      if (!Array.isArray(people)) throw new Error("the task has no people")
      people.pop()
    },
    expected: "the number of the person, which is one more than the separators",
  },
  {
    name: "a task whose text after the people is null where it is written",
    fixture: "db-task-extra-colon",
    mutate: (root) => {
      setField(firstNode(root, "JourneyTaskStatement"), "textAfter", null)
    },
    expected: "lies in no value node",
  },
  {
    name: "a score that holds the colon after it",
    fixture: "db-task-people",
    mutate: (root) => {
      const score = firstNode(root, "JourneyTaskStatement").score as CheckedNode
      setField(score, "value", "3:")
      setField(score, "range", [score.range[0], score.range[1] + 1])
    },
    expected: 'the score "3:" holds a `:`, which divides the data',
  },
  {
    name: "a person that holds the comma after it",
    fixture: "db-task-people",
    mutate: (root) => {
      const people = firstNode(root, "JourneyTaskStatement")
        .people as CheckedNode[]
      const person = people[0]
      setField(person, "value", "Me,")
      setField(person, "range", [person.range[0], person.range[1] + 1])
    },
    expected: 'the person "Me," holds a `,` or a `:`',
  },
]

describe("the check of a journey tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("journey", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})

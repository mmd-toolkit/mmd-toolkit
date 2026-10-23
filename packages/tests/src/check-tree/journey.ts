import type { TreeRange } from "../db-from-tree/tree.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import {
  between,
  checkAccessibilityBlock,
  checkAccessibilityLine,
  checkJoinedOwnText,
  checkOwnKinds,
  checkRangeIsHull,
  checkStretches,
  checkTextAfter,
  checkTokenKinds,
  checkTrimmedValue,
  childOf,
  endsWithWhitespace,
  entriesOf,
  offsetsOf,
  ownOf,
  readingOf,
  startsWithWhitespace,
  textOf,
} from "./statement-checks.ts"
import type { Own, Reading, TextAfterKeyword } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

// ast/journey.md and diagrams/journey.md: what the journey documents state
// about the tree beyond the conditions of every tree (ast.md). The tokens of a
// statement that no child node holds are the keywords and marks that its
// grammar rule writes (diagrams/journey.md, Grammar); the gaps between them
// and the values are the whitespace that the rules of the lexer read (The
// statement context). The kinds of the tokens follow the way the other diagram
// types with statements of a keyword and a text give them: a keyword and the
// header are `Keyword` tokens, `:`, `,`, `{`, and `}` are `Punctuator` tokens,
// and a text unit is a `RawText` token. There is no table of Tokens for the
// journey diagram yet (no `parser/docs/tokens/journey.md`), so these kinds, the
// texts of `keywords.ts` and `punctuators.ts`, and the token of the text from
// the third colon of task data are what the journey documents imply and are not
// held to a document of the parser.

/**
 * The texts of the `Punctuator` tokens that a node writes itself; every other
 * token that a node writes itself is a `Keyword` token.
 */
const OWN_PUNCTUATORS: readonly string[] = [":", ",", "{", "}"]

/**
 * diagrams/journey.md, Grammar: the texts of the tokens that a node writes
 * itself, outside its child nodes, joined, in lower case, since the keywords
 * are read case-insensitively. The header of the diagram is `journey` in
 * exactly this case (Detection). An accessibility statement writes its keyword
 * and the `:`, or the keyword and the braces. A task writes its colons and
 * commas, which {@link checkTask} checks.
 */
const OWN_TEXTS: Readonly<Record<string, string>> = {
  JourneyDiagram: "journey",
  JourneyTitleStatement: "title",
  JourneySectionStatement: "section",
  JourneyAccTitleStatement: "acctitle:",
  JourneyAccDescrStatement: "accdescr:",
  JourneyAccDescrBlockStatement: "accdescr{}",
}

/**
 * diagrams/journey.md, The statement context, rules 6 and 10: the field that
 * holds the text of a title and of a section. The text runs to the end of its
 * line or to a `#`, which starts a comment. A `;` or, for a section, a `:`
 * would end it too, but each is a unit that no rule of the grammar takes after
 * the text, so an input with one is rejected and has no tree; a `;` that the
 * line rule ignores is left out of the written text.
 */
const TEXT_AFTER_KEYWORD: Readonly<Record<string, TextAfterKeyword>> = {
  JourneyTitleStatement: { field: "value", endsBefore: ["#"] },
  JourneySectionStatement: { field: "name", endsBefore: ["#"] },
}

/**
 * ast/journey.md, JourneyTaskStatement, and diagrams/journey.md, Tasks: the
 * node writes the colon after the description, and, when its data has a second
 * colon, that colon and the `,` units of the people part; the third colon is
 * the first character of the text after the people. The score part runs from
 * the first colon to the second colon or the end of the data, and the people
 * part from the second colon to the third colon or the end of the data: the
 * people are the stretches of the people part between the colon, the commas,
 * and its end, one more than there are commas, an empty stretch a null person.
 * The description is the text before the colon, the whitespace before the
 * colon included, and the score and the people are read without the whitespace
 * at their ends.
 */
function checkTask(reading: Reading, node: CheckedNode, own: Own): void {
  const where = label(node)
  const description = childOf(node, "description")
  const score = childOf(node, "score")
  const people = entriesOf(node, "people")
  const textAfter = childOf(node, "textAfter")
  reading.problems.expectEqual(
    own.text,
    people.length === 0 ? ":" : `::${",".repeat(people.length - 1)}`,
    where,
    "the tokens of the node outside its child nodes: the colon after the description, and with people the second colon and the commas between them",
  )
  const [firstColon, secondColon] = offsetsOf(own, ":")
  const commas = offsetsOf(own, ",")
  if (description !== null && firstColon !== undefined) {
    reading.problems.expectEqual(
      between(reading, description.range[1], firstColon),
      "",
      where,
      "the written text between the description and the colon",
    )
  }
  const descriptionValue = textOf(description)
  reading.problems.expect(
    !startsWithWhitespace(descriptionValue) && !descriptionValue.includes(":"),
    where,
    `the description starts with whitespace or holds a \`:\`: ${JSON.stringify(descriptionValue)}`,
  )
  if (firstColon !== undefined) {
    checkStretches(
      reading,
      node,
      [score],
      [[firstColon + 1, secondColon ?? node.range[1]]],
      "the score part",
    )
  }
  const endOfPeople = textAfter?.range[0] ?? node.range[1]
  const separators = secondColon === undefined ? [] : [secondColon, ...commas]
  checkStretches(
    reading,
    node,
    people,
    separators.map((offset, index): TreeRange => [
      offset + 1,
      separators[index + 1] ?? endOfPeople,
    ]),
    "the person",
  )
  checkTrimmedValue(reading, node, score, "the score")
  reading.problems.expect(
    !textOf(score).includes(":"),
    where,
    `the score ${JSON.stringify(textOf(score))} holds a \`:\`, which divides the data`,
  )
  for (const person of people) {
    checkTrimmedValue(reading, node, person, "a person")
    reading.problems.expect(
      !textOf(person).includes(",") && !textOf(person).includes(":"),
      where,
      `the person ${JSON.stringify(textOf(person))} holds a \`,\` or a \`:\`, which divide the people part`,
    )
  }
  if (textAfter !== null) {
    const rest = textOf(textAfter)
    reading.problems.expect(
      people.length > 0,
      where,
      "textAfter is not null, but the data has no second colon, so no third colon",
    )
    reading.problems.expect(
      rest.startsWith(":") && !endsWithWhitespace(rest),
      where,
      `the text after the people part ${JSON.stringify(rest)} does not start with the third colon or ends with whitespace`,
    )
  }
}

/**
 * ast/journey.md, JourneySectionStatement: the name is the text up to a `#`, a
 * `:`, a `;`, or a line feed, so it holds no `:`.
 */
function checkSection(reading: Reading, node: CheckedNode): void {
  const name = textOf(childOf(node, "name"))
  reading.problems.expect(
    !name.includes(":"),
    label(node),
    `the name ${JSON.stringify(name)} holds a \`:\`, which ends the name of a section`,
  )
}

/**
 * Checks what the journey documents state about a journey tree beyond the
 * conditions of every tree (ast.md): the tokens of values lie in value nodes,
 * the tokens that a node writes itself are those of its grammar rule, and the
 * fields that they write are what they write: the score and the people of a
 * task as the stretches between the colons and the commas, the text after the
 * third colon, and where the values of the statements begin and end with
 * respect to their keywords.
 */
export function checkJourneyTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  for (const node of nodesOf(root)) {
    if (!node.type.startsWith("Journey")) continue
    if (node.type === "JourneyLiteral" || node.type === "JourneyIgnoredText") {
      problems.expect(
        textOf(node) !== "",
        label(node),
        `the value of a ${node.type} is empty`,
      )
      // A text unit, which a directive may cut into several tokens.
      checkTokenKinds(reading, node, ["RawText"], `a ${node.type}`)
      continue
    }
    const own = ownOf(root, node)
    checkOwnKinds(reading, node, own, OWN_PUNCTUATORS)
    const expectedOwn = OWN_TEXTS[node.type]
    if (expectedOwn !== undefined) {
      checkJoinedOwnText(
        reading,
        node,
        own,
        expectedOwn,
        node.type !== "JourneyDiagram",
      )
    }
    if (node.type !== "JourneyDiagram") checkRangeIsHull(reading, node, own)
    const afterKeyword = TEXT_AFTER_KEYWORD[node.type]
    if (afterKeyword !== undefined)
      checkTextAfter(reading, node, own, afterKeyword)
    switch (node.type) {
      case "JourneyTaskStatement":
        checkTask(reading, node, own)
        break
      case "JourneySectionStatement":
        checkSection(reading, node)
        break
      case "JourneyAccTitleStatement":
      case "JourneyAccDescrStatement":
        checkAccessibilityLine(reading, node, own)
        checkTrimmedValue(
          reading,
          node,
          childOf(node, "value"),
          "the value of an accessibility statement",
        )
        break
      case "JourneyAccDescrBlockStatement":
        checkAccessibilityBlock(reading, node, own)
        checkTrimmedValue(
          reading,
          node,
          childOf(node, "value"),
          "the value of a description block",
        )
        break
      default:
        break
    }
  }
}

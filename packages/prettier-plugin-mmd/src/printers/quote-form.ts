import type {
  AgentflowName,
  C4BoundaryStatement,
  C4ElementStatement,
  C4RelationshipStatement,
  C4UpdateStatement,
  Node,
} from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { findAgentflowKeptLines } from "./agentflow-kept-lines.ts"
import { findErKeptLines, followsSplitKeyword } from "./er-kept-lines.ts"
import { findFlowchartKeptLines } from "./flowchart-kept-lines.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import { shortestNumber } from "./number-form.ts"
import { findQuadrantKeptLines } from "./quadrant-kept-lines.ts"
import { findKanbanKeptLines } from "./kanban-kept-lines.ts"
import { findMindmapKeptLines } from "./mindmap-kept-lines.ts"
import { findRequirementKeptLines } from "./requirement-kept-lines.ts"
import { findSankeyKeptLines } from "./sankey-kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findTriviaAt,
  isBracketPadding,
  isSpaceOrTab,
  isWhitespace,
  textWithoutDirectives,
} from "./source.ts"
import { c4ArgumentFields, c4NameFields, c4TextFields } from "./text-slots.ts"
import { collapseRuns, printsRunsAsOne } from "./text-runs.ts"
import { findUsecaseKeptLines } from "./usecase-kept-lines.ts"
import { findVennKeptLines } from "./venn-kept-lines.ts"
import { findXychartKeptLines } from "./xychart-kept-lines.ts"

/**
 * The text that a printer writes for a text in the form of the examples, or
 * undefined where the text must stay in the form that it is written in.
 */
type Bare = (text: string) => string | undefined

/**
 * The form of the examples of a field: without quotes, or in quotes. `text` is
 * given the text of a field in the other form.
 */
interface QuoteRule {
  readonly form: "bare" | "quoted"
  readonly text: Bare
  /**
   * The values of the field that have the form, when it is not every value of
   * every node of the type: `item` is a value of the field of `node`, and
   * `index` its place among the values of a field that holds several.
   */
  readonly when?: (node: Node, item: Node, index: number) => boolean
  /**
   * Whether the text before and after the field on its line, which the printer
   * does not separate from it, would join a text without quotes into a longer
   * name, or make the field another unit in the form that it would be given.
   */
  readonly joins?: (
    before: string,
    after: string,
    source: Source,
    start: number,
  ) => boolean
  /**
   * The characters that stand at the two ends of the range of the field and
   * are no part of its text, such as the brackets of a label. The quotes go
   * inside them, and the text must be the whole of what they hold.
   */
  readonly wrapped?: readonly [string, string]
  /**
   * Whether a text in quotes joins none of the units that touch it, since they
   * are delimiters or the printer sets a space between them and the text: such
   * a field is put in quotes also where it touches a unit in the source
   * (`A--b-->C`, `icon:1`).
   */
  readonly standsAlone?: boolean
  /**
   * Whether the field has text before it on its line: a string that starts its
   * line, after a comment line or a line break, is a unit that mermaid.js
   * rejects there, where the text without quotes is read.
   */
  readonly afterTextOnItsLine?: boolean
}

/** The options of a rule, besides its form and its text. */
type QuoteOptions = Pick<
  QuoteRule,
  "when" | "joins" | "wrapped" | "standsAlone" | "afterTextOnItsLine"
>

/** A field that the examples write without quotes. */
function bare(text: Bare, options: QuoteOptions = {}): QuoteRule {
  return { form: "bare", text, ...options }
}

/** A field that the examples write in quotes. */
function quoted(text: Bare, options: QuoteOptions = {}): QuoteRule {
  return { form: "quoted", text, ...options }
}

/**
 * Whether the name follows `end` or `subgraph` so that a version that counts
 * reads both as one name, so the name without quotes would join the keyword
 * (docs/er.md, Statements one per line).
 */
function followsKeywordAsOneName(
  _before: string,
  _after: string,
  source: Source,
  start: number,
): boolean {
  return followsSplitKeyword(source, start)
}

/**
 * Whether the `---` of a hidden YAML block touches a name: a name without
 * quotes would take the dashes into the name.
 */
function touchesDashes(before: string, after: string): boolean {
  return before.endsWith("---") || after.startsWith("---")
}

/**
 * A field of a sankey diagram without the spaces at its ends, which
 * mermaid.js drops from a field with or without quotes, when its text is made
 * of ASCII letters, digits, `_`, and the `characters`, which include the space
 * (docs/sankey.md, Quotes). No other character is certain to be read the same
 * without quotes: a stage that reads the text of a diagram before its lexer
 * gives `%%`, `#`, and `;` a meaning, and the lexer a `,` and a `"`.
 */
function sankeyText(text: string, characters: string): string | undefined {
  const field = text.trim()
  return field !== "" &&
    [...field].every(
      (character) =>
        isWordCharacter(character) || characters.includes(character),
    )
    ? field
    : undefined
}

/**
 * The source or the target of a link of a sankey diagram. Its text may hold
 * `&`, `<`, `>`, `'`, `/`, and `\` besides the characters of a value, which
 * were compared with and without quotes in the two fields.
 */
function sankeyName(text: string): string | undefined {
  return sankeyText(text, " -.&<>'/\\")
}

/** The value of a link of a sankey diagram. */
function sankeyValueField(text: string): string | undefined {
  return sankeyText(text, " -.")
}

/**
 * The names of the directions that the lexers of a class, an ER, and a
 * requirement diagram read after `direction`.
 */
const directionNames: readonly string[] = ["TB", "BT", "RL", "LR"]

/**
 * Whether a name without quotes would join the line before or the line after
 * it. The lexers of a class, a flowchart, an agentflow, an ER, and a
 * requirement diagram try the rule `.*direction\s+TB[^\n]*` (and the same for
 * `BT`, `RL`, `LR`, and, in a flowchart and an agentflow diagram, `TD`) before
 * their other rules, and `\s+` reads a line break too. A quote inside the line
 * does not matter, but a name that ends with `direction` is followed by the
 * line after it, and a name that starts with the name of a direction follows
 * the line before it, once its quotes are dropped. The name alone decides it,
 * since the lines that touch a name change when the lines are printed.
 */
function joinsDirectionLine(
  text: string,
  { starts = directionNames, ignoreCase = false } = {},
): boolean {
  const compared = ignoreCase ? text.toLowerCase() : text
  return (
    compared.endsWith("direction") ||
    starts.some((direction) =>
      compared.startsWith(ignoreCase ? direction.toLowerCase() : direction),
    )
  )
}

/**
 * A word of ASCII letters, digits, and `_`, or, where `spaces` is true, words
 * with spaces between them, that starts with a letter or `_` (or, where
 * `digits` is true, with any of these characters) and whose first word is none
 * of the `reserved` words, which are compared in lower case: the lexer of a
 * diagram type reads a reserved word as a unit of its own, and a text of other
 * characters has a meaning in the stages before the lexer. Where `hyphens` is
 * true, the parts of a word may be joined by a single `-`, and the part before
 * the first `-` is the one compared with the reserved words, since a `-` ends a
 * keyword (`end-x` is `end` and `-x`). The text joins no line of a direction
 * either (`joinsDirectionLine`, in any case, since the lexers of an ER and a
 * requirement diagram read in any case).
 */
function wordWithout(
  reserved: ReadonlySet<string>,
  { spaces = false, digits = false, hyphens = false } = {},
): Bare {
  return (text) => {
    const first = text[0]
    const parts = hyphens ? text.split("-") : [text]
    return first !== undefined &&
      (digits || !(first >= "0" && first <= "9")) &&
      first !== " " &&
      !text.endsWith(" ") &&
      parts.every(
        (part) =>
          part !== "" &&
          [...part].every(
            (character) =>
              isWordCharacter(character) || (spaces && character === " "),
          ),
      ) &&
      !reserved.has(parts[0].split(" ")[0].toLowerCase()) &&
      !joinsDirectionLine(text, { ignoreCase: true })
      ? text
      : undefined
  }
}

/**
 * The words of an ER diagram that its lexer reads as a unit of its own:
 * keywords, the words of the cardinalities and of the relationship lines, the
 * names of the directions and of the keys of an attribute, and the letters
 * `u` and `o`, which begin the symbols `u.`, `u-`, `u|`, `o|` and `o{`.
 */
const erReserved: ReadonlySet<string> = new Set([
  "erdiagram",
  "style",
  "classdef",
  "class",
  "subgraph",
  "end",
  "one",
  "many",
  "only",
  "zero",
  "optionally",
  "or",
  "to",
  "acctitle",
  "accdescr",
  "direction",
  "tb",
  "bt",
  "rl",
  "lr",
  "pk",
  "fk",
  "uk",
  "u",
  "o",
])

/**
 * A name or a role of an ER diagram that every version of mermaid.js that
 * reads it in quotes reads the same without them: a word of `wordWithout`
 * that may have a single `-` between its parts (the lexers of 9.4.3 to 12.3.0
 * read the `-` inside a name without quotes).
 */
const erName: Bare = wordWithout(erReserved, { hyphens: true })

/**
 * The words of a requirement diagram that its lexer reads as a unit of its own:
 * keywords, the names of the directions, the kinds of a requirement and of a
 * relationship, and the words of the risk and of the verification method.
 */
const requirementReserved: ReadonlySet<string> = new Set([
  "title",
  "acctitle",
  "accdescr",
  "direction",
  "tb",
  "bt",
  "rl",
  "lr",
  "requirementdiagram",
  "id",
  "text",
  "risk",
  "verifymethod",
  "requirement",
  "functionalrequirement",
  "interfacerequirement",
  "performancerequirement",
  "physicalrequirement",
  "designconstraint",
  "low",
  "medium",
  "high",
  "analysis",
  "demonstration",
  "inspection",
  "test",
  "element",
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
  "type",
  "docref",
  "style",
  "classdef",
  "class",
])

/**
 * The words of a Wardley map that its lexer reads as a unit of its own, in
 * lower case and without a boundary after them: a name that starts with one of
 * them is read as the unit and the rest of the name.
 */
const wardleyPrefixes: readonly string[] = [
  "build",
  "buy",
  "outsource",
  "market",
  "wardley-beta",
  "size",
  "evolution",
  "anchor",
  "component",
  "label",
  "inertia",
  "evolve",
  "pipeline",
  "note",
  "annotation",
  "accelerator",
  "deaccelerator",
  "title",
  "accTitle",
  "accDescr",
]

/**
 * A name of a Wardley map that the lexer reads whole without quotes: words of
 * ASCII letters, digits, and `_` that start with a letter, with a space between
 * them, and none of the words that it reads as a unit of its own at the start.
 */
function wardleyName(text: string): string | undefined {
  return text
    .split(" ")
    .every(
      (word) =>
        word !== "" &&
        ((word[0] >= "a" && word[0] <= "z") ||
          (word[0] >= "A" && word[0] <= "Z")) &&
        [...word].every(
          (character) =>
            (character >= "a" && character <= "z") ||
            (character >= "A" && character <= "Z") ||
            (character >= "0" && character <= "9") ||
            character === "_",
        ),
    ) && !wardleyPrefixes.some((prefix) => text.startsWith(prefix))
    ? text
    : undefined
}

/**
 * The words of a gitGraph that the lexer of a version that counts reads as a
 * unit of its own before a character that is no part of a word (`lr-x` is `lr`
 * and `-x`), in lower case, since one of those versions compares them in any
 * case (docs/compatibility.md, The quotes of a text).
 */
const gitgraphWordsBeforeNonWord: readonly string[] = [
  "gitgraph",
  "highlight",
  "reverse",
  "normal",
  "lr",
  "tb",
]

/**
 * The words of a gitGraph that are a unit of their own only as the whole name
 * (`commit-x` is a name, `commit` is not), in lower case, since one of the
 * versions that count compares them in any case.
 */
const gitgraphWholeWords: readonly string[] = [
  "cherry-pick",
  "checkout",
  "commit",
  "branch",
  "merge",
  "options",
]

/** Whether a character is an ASCII letter, a digit, or `_`. */
function isWordCharacter(character: string | undefined): boolean {
  return (
    character !== undefined &&
    ((character >= "a" && character <= "z") ||
      (character >= "A" && character <= "Z") ||
      (character >= "0" && character <= "9") ||
      character === "_")
  )
}

/**
 * A branch of a gitGraph that the lexer reads whole without quotes: ASCII
 * letters, digits, `_`, and `-`, `.`, `/` between them, starting with a letter
 * or `_` (a digit can start a number), ending with a letter, a digit, or `_`,
 * and none of the names that a version that counts reads as something else:
 * the words of `gitgraphWordsBeforeNonWord` and `gitgraphWholeWords` in any
 * case, `switch` and `BT` as written, and a name that starts with `title`,
 * which the line of a title takes (docs/gitgraph.md, References).
 */
function gitgraphReference(text: string): string | undefined {
  const lower = text.toLowerCase()
  const isUnitOfItsOwn =
    text.startsWith("title") ||
    text === "switch" ||
    text === "BT" ||
    gitgraphWholeWords.includes(lower) ||
    gitgraphWordsBeforeNonWord.some(
      (word) => lower.startsWith(word) && !isWordCharacter(lower[word.length]),
    )
  return (isLetter(text[0]) || text.startsWith("_")) &&
    !isUnitOfItsOwn &&
    isWordCharacter(text.at(-1)) &&
    [...text].every(
      (character) => isWordCharacter(character) || "-./".includes(character),
    )
    ? text
    : undefined
}

/**
 * The words of a quadrant chart that its lexer reads as a unit of its own at
 * the start of a word, in lower case: a word of a text that is one of the
 * first four, or starts with `quadrant` (the header and `quadrant-1` to
 * `quadrant-4`), would be read as the unit.
 */
const quadrantReserved: ReadonlySet<string> = new Set([
  "title",
  "classdef",
  "acctitle",
  "accdescr",
])

/**
 * A text of a quadrant chart that the lexer reads whole without quotes: words
 * of ASCII letters that end with digits, with one space between them, whose
 * parts may be joined by a single `-`, none of the parts a word that the lexer
 * reads as a unit of its own (a `-` ends a word, so a part after it starts a
 * word again), and no `x-axis` or `y-axis`, which the lexer reads across the
 * `-`. A letter after a digit or a `_` would start a word again, so none
 * follows one.
 */
function quadrantLabel(text: string): string | undefined {
  const lower = text.toLowerCase()
  return !lower.includes("x-axis") &&
    !lower.includes("y-axis") &&
    text.split(" ").every((word) =>
      word.split("-").every((part) => {
        const letters = [...part].findIndex(
          (character) => character >= "0" && character <= "9",
        )
        const head = letters === -1 ? part : part.slice(0, letters)
        const tail = letters === -1 ? "" : part.slice(letters)
        return (
          head !== "" &&
          [...head].every(
            (character) =>
              (character >= "a" && character <= "z") ||
              (character >= "A" && character <= "Z"),
          ) &&
          [...tail].every(
            (character) => character >= "0" && character <= "9",
          ) &&
          !quadrantReserved.has(part.toLowerCase()) &&
          !part.toLowerCase().startsWith("quadrant")
        )
      }),
    )
    ? text
    : undefined
}

/**
 * The words of an XY chart that its lexer reads as a unit of its own where a
 * run of letters starts, in lower case. They are read only where no letter,
 * digit, or `_` follows them.
 */
const xychartKeywords: readonly string[] = [
  "title",
  "xychart-beta",
  "xychart",
  "x-axis",
  "y-axis",
  "line",
  "bar",
]

/** The words of an XY chart that its lexer reads wherever they start. */
const xychartOrientations: readonly string[] = ["vertical", "horizontal"]

/** Whether a character is an ASCII letter. */
function isLetter(character: string | undefined): boolean {
  return (
    character !== undefined &&
    ((character >= "a" && character <= "z") ||
      (character >= "A" && character <= "Z"))
  )
}

/**
 * A text of an XY chart of ASCII letters, digits, `_`, and `-` with no space:
 * mermaid.js drops the spaces of a text without quotes, so a text with spaces
 * is not the same in quotes.
 */
function xychartText(text: string): string | undefined {
  return text !== "" &&
    [...text].every(
      (character) => isWordCharacter(character) || character === "-",
    )
    ? text
    : undefined
}

/**
 * A text of an XY chart (see `xychartText`) that the lexer reads whole without
 * quotes: none of the words that it reads as a unit of its own starts where a
 * run of letters starts (at the start of the text, and after a digit, `_`, or
 * `-`), in any case.
 */
function xychartCategory(text: string): string | undefined {
  const lower = text.toLowerCase()
  return xychartText(text) !== undefined &&
    [...lower].every(
      (_character, index) =>
        isLetter(lower[index - 1]) ||
        !(
          xychartOrientations.some((word) => lower.startsWith(word, index)) ||
          xychartKeywords.some(
            (word) =>
              lower.startsWith(word, index) &&
              !isWordCharacter(lower[index + word.length]),
          )
        ),
    )
    ? text
    : undefined
}

/**
 * The words of a venn diagram that its lexer reads as a unit of its own at the
 * start of a name, in lower case. They are read in any case wherever no
 * letter, digit, or `_` follows them, and `-` is such a boundary: `set-a` starts
 * with `set`.
 */
const vennKeywords: readonly string[] = [
  "venn-beta",
  "set",
  "union",
  "text",
  "style",
]

/**
 * A name of a venn diagram that the lexer reads whole without quotes: an ASCII
 * letter or `_`, then letters, digits, `_`, and `-`, that does not start with
 * one of the words that it reads as a unit of its own. `title` is no name
 * either: a `title` that text follows on its line starts a title.
 */
function vennName(text: string): string | undefined {
  const lower = text.toLowerCase()
  return (isLetter(text[0]) || text.startsWith("_")) &&
    [...text].every(
      (character) => isWordCharacter(character) || character === "-",
    ) &&
    lower !== "title" &&
    !vennKeywords.some(
      (word) => lower.startsWith(word) && !isWordCharacter(lower[word.length]),
    )
    ? text
    : undefined
}

/** Whether a text is digits only, or empty. */
function isDigits(text: string): boolean {
  return [...text].every((character) => character >= "0" && character <= "9")
}

/** Whether a text is an unsigned or signed decimal number of digits. */
function isVennNumber(text: string): boolean {
  const unsigned =
    text.startsWith("+") || text.startsWith("-") ? text.slice(1) : text
  const [whole, fraction, ...more] = unsigned.split(".")
  return (
    more.length === 0 &&
    (whole !== "" || fraction !== undefined) &&
    isDigits(whole) &&
    (fraction === undefined || (fraction !== "" && isDigits(fraction)))
  )
}

/** Whether a text is a color of `#` and three to eight hexadecimal digits. */
function isVennHexColor(text: string): boolean {
  return (
    text.startsWith("#") &&
    text.length >= 4 &&
    text.length <= 9 &&
    [...text.slice(1)].every(
      (character) =>
        (character >= "0" && character <= "9") ||
        (character >= "a" && character <= "f") ||
        (character >= "A" && character <= "F"),
    )
  )
}

/**
 * A value of a style of a venn diagram that the lexer reads whole without
 * quotes: names, numbers, and colors of `#` and hexadecimal digits, with one
 * space between them. mermaid.js joins the words of such a value with one
 * space, and reads two units that touch (`1a`) as one text.
 */
function vennStyleValue(text: string): string | undefined {
  return text
    .split(" ")
    .every(
      (atom) =>
        vennName(atom) !== undefined ||
        isVennNumber(atom) ||
        isVennHexColor(atom),
    )
    ? text
    : undefined
}

/**
 * The text of a bracket label of a venn diagram that the lexer reads whole in
 * quotes, without the spaces, tabs, and no-break spaces next to the brackets,
 * which mermaid.js trims (a text of whitespace only is a label of another
 * kind: its Db has none, and a quoted one has an empty label), and without a
 * `%%`, which a stage before the lexer reads as a comment.
 */
function vennLabel(written: string): string | undefined {
  let from = 0
  let to = written.length
  while (from < to && isBracketPadding(written[from])) from++
  while (to > from && isBracketPadding(written[to - 1])) to--
  const text = written.slice(from, to)
  return text.trim() !== "" && !text.includes("%%") && !text.includes('"')
    ? text
    : undefined
}

/** Whether the text of a venn diagram has no explicit targets. */
function isImplicitText(node: Node): boolean {
  return (node as Node & { targets?: unknown }).targets === null
}

/**
 * The words of a use case diagram that its lexer reads as a unit of its own,
 * written in these cases: a name of the same letters is read as the unit.
 */
const usecaseKeywords: ReadonlySet<string> = new Set([
  "actor",
  "systemBoundary",
  "end",
  "direction",
  "TD",
  "TB",
  "BT",
  "LR",
  "RL",
  "note",
  "for",
  "json",
  "classDef",
  "class",
  "style",
  "true",
  "false",
  // At the start of a statement, a `:` after them makes a line of an
  // accessibility title or description.
  "accTitle",
  "accDescr",
])

/**
 * The words of a use case diagram that its lexer reads as a unit of its own in
 * any case: a word of the same letters is read as the unit.
 */
const usecaseKeywordsInAnyCase: ReadonlySet<string> = new Set([
  "include",
  "extend",
])

/**
 * The words that a name cannot be at the start of a statement, in any case:
 * the grammar refuses them as the name that starts a statement.
 */
const usecaseWordsAtStatementStart: ReadonlySet<string> = new Set([
  "allowmixing",
  "newpage",
  "package",
  "rectangle",
  "skinparam",
])

/**
 * A word of a use case diagram that the lexer reads whole without quotes:
 * ASCII letters, digits, and `_`, none of the words that it reads as a unit of
 * its own.
 */
function usecaseWord(text: string): string | undefined {
  return text !== "" &&
    [...text].every(isWordCharacter) &&
    !usecaseKeywords.has(text) &&
    !usecaseKeywordsInAnyCase.has(text.toLowerCase())
    ? text
    : undefined
}

/** A name of a use case diagram: a word that is none of the words that start a statement. */
function usecaseName(text: string): string | undefined {
  return usecaseWord(text) !== undefined &&
    !usecaseWordsAtStatementStart.has(text.toLowerCase())
    ? text
    : undefined
}

/**
 * The text of a label of a use case diagram that the lexer reads whole in
 * quotes: any text but one that starts with a backquote, which a quote and a
 * backquote start a markdown string with.
 */
function usecaseLabel(text: string): string | undefined {
  return text !== "" && !text.startsWith("`") ? text : undefined
}

/**
 * The text of a label in square brackets that the lexer reads whole without
 * quotes: words of ASCII letters, digits, and `_`, with one space between
 * them. Any other character may be one that the lexer reads as an operator, a
 * delimiter, or a number.
 */
function usecaseBracketLabel(text: string): string | undefined {
  return text !== "" &&
    text
      .split(" ")
      .every((word) => word !== "" && [...word].every(isWordCharacter))
    ? text
    : undefined
}

/** Whether a node of a use case diagram has no id: its name is quoted. */
function hasNoId(node: Node): boolean {
  return (node as Node & { id?: unknown }).id === null
}

/** Whether a node of a use case diagram has an id: its label is a display text. */
function hasId(node: Node): boolean {
  return !hasNoId(node)
}

/** Whether a use case, or its label, is drawn as an ellipse (between parentheses). */
function isInParentheses(node: Node): boolean {
  return (
    hasId(node) && (node as Node & { shape?: unknown }).shape !== "rectangle"
  )
}

/** Whether a use case has a label between square brackets. */
function isInSquareBrackets(node: Node): boolean {
  return (
    hasId(node) && (node as Node & { shape?: unknown }).shape === "rectangle"
  )
}

/** The text of the key of a property of the native metadata of a use case. */
function metadataKeyOf(node: Node): string | undefined {
  const { key } = node as Node & {
    key?: Node & { name?: string; value?: string }
  }
  return key?.type === "Identifier" ? key.name : key?.value
}

/** Whether a property of the native metadata is the icon of an actor. */
function isIcon(node: Node): boolean {
  return metadataKeyOf(node) === "icon"
}

/** Whether a property of the native metadata is no icon. */
function isNoIcon(node: Node): boolean {
  return !isIcon(node)
}

/** Whether a text holds a line terminator (LF, CR, U+2028, or U+2029). */
function holdsLineTerminator(text: string): boolean {
  return [...text].some((character) => "\n\r\u2028\u2029".includes(character))
}

/**
 * The text of a label in square brackets of an architecture diagram that every
 * version of mermaid.js that reads the label in quotes reads without them:
 * ASCII letters, digits, `_`, and spaces, with none at its ends. The grammars
 * of some versions that count read a label in quotes, and a label without
 * quotes of these characters only (docs/compatibility.md, Forms kept for
 * versions of mermaid.js that count).
 */
function architectureLabel(text: string): string | undefined {
  return text !== "" &&
    text.trim() === text &&
    [...text].every(
      (character) => isWordCharacter(character) || character === " ",
    )
    ? text
    : undefined
}

/**
 * The text of the label of a shape of a mindmap or a kanban board that the
 * lexer reads whole without quotes: none of `)`, `]`, `(`, and `}`, which end
 * the text or are read as a closer, no line break, no whitespace at its ends,
 * and not a `-` at its start, which `(` makes the opener `(-` and a `)` after
 * it makes the closer `-)`.
 */
function shapeText(text: string): string | undefined {
  return text !== "" &&
    text.trim() === text &&
    !text.startsWith("-") &&
    ![...text].some((character) => ")](}".includes(character)) &&
    !holdsLineTerminator(text)
    ? text
    : undefined
}

/**
 * Whether a dash stands next to a text in a shape of a mindmap or a kanban
 * board: the closer `-)` follows only a string, and `(-` opens a shape in which
 * a text without quotes would be read with it.
 */
function nextToDash(before: string, after: string): boolean {
  return before.endsWith("-") || after.startsWith("-")
}

/** Whether a plot of an XY chart is a line. */
function isLine(node: Node): boolean {
  return (node as Node & { kind?: string }).kind === "line"
}

/** Whether a link of a Wardley map has an arrow between its names. */
function hasArrow(node: Node): boolean {
  return (node as Node & { arrow?: unknown }).arrow !== null
}

/**
 * The words that the lexer of a class diagram reads as a unit of its own where
 * they stand as a name, which a name between backquotes is not: the keywords of
 * the statements, the header word `classDiagram`, the targets of a link, `o` of
 * the aggregation, and the words that start a line of accessibility. A name of
 * one of them is rejected, or is read as another statement, without the
 * backquotes.
 */
const classNameReserved: ReadonlySet<string> = new Set([
  "_blank",
  "_parent",
  "_self",
  "_top",
  "accDescr",
  "accTitle",
  "call",
  "callback",
  "class",
  "classDef",
  "classDiagram",
  "click",
  "cssClass",
  "href",
  "link",
  "namespace",
  "note",
  "o",
  "style",
])

/**
 * The name of a class or of a namespace that every version of mermaid.js that
 * reads a name between backquotes reads the same without them: a word of ASCII
 * letters, digits, and `_` that is none of `classNameReserved` and joins no
 * line of a direction (`joinsDirectionLine`). Spaces and other characters are
 * not read the same: a name of two words is the two words joined without the
 * space.
 */
function className(text: string): string | undefined {
  return text !== "" &&
    [...text].every(isWordCharacter) &&
    !classNameReserved.has(text) &&
    !joinsDirectionLine(text)
    ? text
    : undefined
}

/**
 * The words that the lexer of a flowchart reads as a unit of its own where they
 * stand as a whole word in the name of a subgraph or of a flow, and `direction`,
 * which starts a direction where a direction follows it on its line: a name
 * with one of them is not read as a name without quotes.
 */
const headingNameReserved: ReadonlySet<string> = new Set([
  "_blank",
  "_parent",
  "_self",
  "_top",
  "call",
  "click",
  "default",
  "direction",
  "end",
  "href",
  "interpolate",
])

/**
 * The name of a subgraph, a flow, or a connector that every version of
 * mermaid.js reads the same without quotes: words of ASCII letters, digits, and
 * `_` with one space between them, whose parts may be joined by a single `-`,
 * none of them a word of `headingNameReserved` (compared by the part before
 * the first `-`, which ends a keyword) and the last not ending with
 * `direction`, which the line after the name would join (a name stands after a
 * keyword, so no line before it can). The names of the same kind with other
 * characters are not read the same in every position: `end`, `~~~`, `--`, and a
 * `"` in a name differ.
 */
function headingName(text: string): string | undefined {
  return text.split(" ").every((word) => {
    const parts = word.split("-")
    return (
      parts.every((part) => part !== "" && [...part].every(isWordCharacter)) &&
      !headingNameReserved.has(parts[0])
    )
  }) && !joinsDirectionLine(text, { starts: [] })
    ? text
    : undefined
}

/**
 * The text of a label, or the title of a connector, that mermaid.js reads the
 * same in quotes and without them in every position where it stands, in every
 * version that reads it: it starts with a letter or a digit, so that the
 * padding inside its brackets is dropped and no `/`, `\`, or `-` opens another
 * shape, ends with no space, and holds ASCII letters, digits, spaces, and `_`,
 * `-`, `.`, `,`, `:`, `!`, and `?`. A text with another character, such as a
 * backquote that would start a markdown string, stays as written.
 */
function labelText(text: string): string | undefined {
  const first = text[0]
  return first !== undefined &&
    isWordCharacter(first) &&
    first !== "_" &&
    !text.endsWith(" ") &&
    [...text].every(
      (character) =>
        isWordCharacter(character) || " -.,:!?".includes(character),
    )
    ? text
    : undefined
}

/**
 * The text of a label between the arrows of a solid link (`-- text -->`), which
 * a `--` in the text ends, or reads as an arrow with the letters around it
 * (`go--on` has the arrow `--o`): a text of `labelText` without a `--`.
 */
function solidLinkLabelText(text: string): string | undefined {
  return text.includes("--") ? undefined : labelText(text)
}

/** The text of a label of a flowchart between the arrows of a dotted link. */
function dottedLinkLabelText(text: string): string | undefined {
  return text.includes(".") ? undefined : labelText(text)
}

/** The line of the opening arrow of a link, or undefined for a label between `|`. */
function openingLineOf(node: Node): string | undefined {
  return (node as Node & { opening?: { line?: string } | null }).opening?.line
}

/** Whether a link of a flowchart has its label between two dotted arrows. */
function isDottedArrowLabel(node: Node): boolean {
  return openingLineOf(node) === "dotted"
}

/** Whether a link has its label between two solid arrows. */
function isSolidArrowLabel(node: Node): boolean {
  return openingLineOf(node) === "solid"
}

/**
 * Whether a link has its label between `|`, or between two thick arrows: the
 * labels between dotted and solid arrows end at a `.` and a `--`.
 */
function isPipedOrThickLabel(node: Node): boolean {
  const line = openingLineOf(node)
  return line === undefined || line === "thick"
}

/** Whether a link of an agentflow diagram has its label between `|`. */
function isPipedLabel(node: Node): boolean {
  return openingLineOf(node) === undefined
}

/**
 * Whether a word follows a name at once, with no space between them (an empty
 * description block, `accDescr {}`, that the line holds after it): a name
 * without quotes would take the word into itself.
 */
function wordFollows(_before: string, after: string): boolean {
  return isWordCharacter(after[0])
}

/** Whether the name of a flow or a connector is one label. */
function hasOnePart(node: Node): boolean {
  return (node as AgentflowName).parts.length === 1
}

/** The statements of a C4 diagram that are calls with arguments. */
type C4Call =
  | C4BoundaryStatement
  | C4ElementStatement
  | C4RelationshipStatement
  | C4UpdateStatement

/**
 * What a value of the arguments of a C4 statement is, from its keyword and its
 * place (`c4ArgumentFields`). A named attribute is no string or text without
 * quotes, and is left out, and so is every argument of `RelIndex`: the
 * examples write none.
 */
function c4ArgumentOf(
  node: Node,
  item: Node,
  index: number,
): string | undefined {
  const { keyword } = node as C4Call
  return (item.type === "C4Literal" || item.type === "StringLiteral") &&
    keyword !== "RelIndex"
    ? c4ArgumentFields[keyword][index]
    : undefined
}

/** Whether a value of the arguments of a C4 statement is a name. */
function isC4Name(node: Node, item: Node, index: number): boolean {
  return c4NameFields.has(c4ArgumentOf(node, item, index) ?? "")
}

/**
 * Whether a value of the arguments of a C4 statement is a text that the
 * examples write in quotes. The examples write the description of an element
 * only: the description of a node and of a relationship stays as written.
 */
function isC4Text(node: Node, item: Node, index: number): boolean {
  const role = c4ArgumentOf(node, item, index)
  return role === "descr"
    ? node.type === "C4ElementStatement"
    : c4TextFields.has(role ?? "")
}

/**
 * A name of a C4 diagram that every version of mermaid.js reads the same
 * without quotes: ASCII letters, digits, `_`, `-`, and `.`, with spaces between
 * them. The lexer takes any character but a `,` into an argument without
 * quotes, but a `"` or a `$` at its start begins a string or a key, a `)`
 * there ends the call, and the stages before the lexer give `%%`, `#`, and `;`
 * a meaning.
 */
function c4Name(text: string): string | undefined {
  return text !== "" &&
    text.trim() === text &&
    [...text].every(
      (character) => isWordCharacter(character) || "-. ".includes(character),
    )
    ? text
    : undefined
}

/**
 * A text of a C4 diagram that can be put in quotes: one without a `"`, which
 * would end the string, and without a line break, which the printer keeps
 * where it is written.
 */
function c4Text(text: string): string | undefined {
  return text !== "" && !text.includes('"') && !holdsLineTerminator(text)
    ? text
    : undefined
}

/**
 * Whether a name in quotes of a C4 call is not followed by a `,` right away:
 * a text without quotes would take a space after it into its value, and a
 * string after it into its text, where the string is a unit of its own.
 */
function c4NameIsNotBeforeComma(_before: string, after: string): boolean {
  return !after.startsWith(",")
}

/**
 * Whether a character is whitespace that the printer replaces in a C4 call: any
 * but a line terminator. A gap with a line break or with a U+2028 or U+2029 is
 * written as it is (docs/c4.md, Argument spacing).
 */
function isReplacedGapSpace(character: string | undefined): boolean {
  return (
    character !== undefined &&
    isWhitespace(character) &&
    !"\n\r\u2028\u2029".includes(character)
  )
}

/**
 * Whether a text without quotes of a C4 call does not stand right after a `,`
 * or a `(` and right before a `,` on its line, once the whitespace that the
 * printer replaces is taken away. mermaid.js reads a string only after ASCII
 * spaces, so a tab, a line break, or any other space before it makes the quotes
 * part of the text, and a string followed by anything but a `,` is followed by
 * a unit of its own. The printer sets one space after a `,`, none after a `(`,
 * and none before a `,` that follows a text without quotes, and writes any
 * other gap as it is (docs/c4.md, Argument spacing).
 */
function c4TextIsNotBetweenCommas(before: string, after: string): boolean {
  let gap = before.length
  while (gap > 0 && isReplacedGapSpace(before[gap - 1])) gap--
  const previous = before[gap - 1]
  let next = 0
  while (next < after.length && isReplacedGapSpace(after[next])) next++
  return (
    after[next] !== "," ||
    previous === undefined ||
    "\r\u2028\u2029".includes(previous) ||
    (previous !== "," &&
      previous !== "(" &&
      [...before.slice(gap)].some((character) => character !== " "))
  )
}

/**
 * The rules of the arguments of the calls of a C4 diagram: a name without
 * quotes, which the examples write so, and a text in quotes. The other
 * arguments (the sprite, the tags, the link, the description of a node and of a
 * relationship, the arguments of `RelIndex`, and the settings of a style) are
 * written as named attributes in the examples, or not at all, and stay as
 * written.
 */
const c4Arguments: readonly QuoteRule[] = [
  bare(c4Name, { when: isC4Name, joins: c4NameIsNotBeforeComma }),
  quoted(c4Text, {
    when: isC4Text,
    joins: c4TextIsNotBetweenCommas,
    standsAlone: true,
  }),
]

/**
 * The fields that are written with or without quotes, by the type of the node
 * and the field, in the form that the examples in the documentation of the
 * pinned mermaid.js use at least twice as often as the other
 * (docs/compatibility.md, Spellings that are drawn the same): the three fields
 * of a link of a sankey diagram, the names and the roles of an ER diagram, the
 * names, the values, and the classes of a requirement diagram, the names of a
 * Wardley map, the branches of a gitGraph, the texts of a quadrant chart, the
 * titles and the categories of an XY chart, the names, the labels, and the
 * values of a venn diagram, the names, the labels, and the metadata of a use
 * case diagram, the names and the texts of the calls of a C4 diagram, and the
 * names of the subgraphs, flows, and connectors of a flowchart and an
 * agentflow. A field may have several rules, which tell the roles of
 * the field apart by the node (the name of an actor without an id, the label of
 * an actor with one).
 */
const quoteRules: Readonly<
  Record<string, Readonly<Record<string, QuoteRule | readonly QuoteRule[]>>>
> = {
  ArchitectureGroupStatement: {
    title: bare(architectureLabel, { wrapped: ["[", "]"] }),
  },
  ArchitectureServiceStatement: {
    title: bare(architectureLabel, { wrapped: ["[", "]"] }),
  },
  AgentflowConnectorStatement: {
    title: quoted(labelText, { standsAlone: true, afterTextOnItsLine: true }),
  },
  AgentflowFlowStatement: {
    title: quoted(labelText, { standsAlone: true, afterTextOnItsLine: true }),
  },
  AgentflowLink: {
    label: [
      bare(labelText, { when: isPipedLabel }),
      bare(solidLinkLabelText, { when: isSolidArrowLabel }),
    ],
  },
  AgentflowName: {
    parts: bare(headingName, { when: hasOnePart, joins: wordFollows }),
  },
  AgentflowShape: {
    label: quoted(labelText, { standsAlone: true, afterTextOnItsLine: true }),
  },
  C4BoundaryStatement: { arguments: c4Arguments },
  ClassName: { name: bare(className) },
  ClassNamespaceStatement: { name: bare(className) },
  C4ElementStatement: { arguments: c4Arguments },
  C4RelationshipStatement: { arguments: c4Arguments },
  C4UpdateStatement: { arguments: c4Arguments },
  FlowchartLink: {
    label: [
      bare(labelText, { when: isPipedOrThickLabel }),
      bare(dottedLinkLabelText, { when: isDottedArrowLabel }),
      bare(solidLinkLabelText, { when: isSolidArrowLabel }),
    ],
  },
  FlowchartShape: { label: bare(labelText) },
  FlowchartSubgraphStatement: {
    name: bare(headingName, { joins: wordFollows }),
    title: bare(labelText),
  },
  KanbanShape: { label: bare(shapeText, { joins: nextToDash }) },
  MindmapShape: { label: bare(shapeText, { joins: nextToDash }) },
  ErEntityReference: { name: bare(erName) },
  ErEntityStatement: {
    name: bare(erName, { joins: followsKeywordAsOneName }),
  },
  ErRelationshipStatement: { role: bare(erName) },
  ErSubgraphStatement: {
    id: bare(erName, { joins: followsKeywordAsOneName }),
  },
  QuadrantAxisStatement: {
    end: bare(quadrantLabel),
    start: bare(quadrantLabel),
  },
  QuadrantPointStatement: { name: bare(quadrantLabel) },
  QuadrantQuadrantStatement: { text: bare(quadrantLabel) },
  UsecaseActor: {
    label: [
      bare(usecaseName, { when: hasNoId }),
      quoted(usecaseLabel, { when: hasId, standsAlone: true }),
    ],
  },
  UsecaseEntity: {
    label: [
      bare(usecaseName, { when: hasNoId }),
      quoted(usecaseLabel, { when: isInParentheses, standsAlone: true }),
      bare(usecaseBracketLabel, { when: isInSquareBrackets }),
    ],
  },
  UsecaseMetadataAssignmentStatement: { target: bare(usecaseName) },
  UsecaseMetadataProperty: {
    key: bare(usecaseWord),
    value: [
      quoted(usecaseWord, { when: isIcon, standsAlone: true }),
      bare(usecaseWord, { when: isNoIcon }),
    ],
  },
  UsecaseNoteStatement: { label: quoted(usecaseLabel, { standsAlone: true }) },
  UsecaseRelationshipStatement: {
    label: quoted(usecaseLabel, { standsAlone: true }),
  },
  UsecaseSystemBoundaryStatement: {
    title: [
      bare(usecaseName, { when: hasNoId }),
      quoted(usecaseLabel, { when: hasId, standsAlone: true }),
    ],
  },
  VennStyleProperty: {
    value: bare(vennStyleValue),
  },
  VennStyleStatement: { targets: bare(vennName) },
  VennSubsetStatement: {
    label: quoted(vennLabel, { wrapped: ["[", "]"], standsAlone: true }),
    sets: bare(vennName),
  },
  VennTextStatement: {
    id: bare(vennName, { when: isImplicitText }),
    label: quoted(vennLabel, {
      when: isImplicitText,
      wrapped: ["[", "]"],
      standsAlone: true,
    }),
  },
  XychartBand: { categories: bare(xychartCategory) },
  XychartPlotStatement: { title: quoted(xychartText, { when: isLine }) },
  XychartTitleStatement: { value: quoted(xychartText) },
  XychartXAxisStatement: { title: quoted(xychartText) },
  XychartYAxisStatement: { title: quoted(xychartText) },
  RequirementClassDefStatement: {
    cssClasses: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementClassStatement: {
    cssClasses: bare(wordWithout(requirementReserved, { digits: true })),
    names: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementElementField: {
    value: bare(
      wordWithout(requirementReserved, { spaces: true, digits: true }),
    ),
  },
  RequirementElementStatement: {
    name: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementRelationshipStatement: {
    left: bare(wordWithout(requirementReserved, { digits: true })),
    right: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementRequirementStatement: {
    cssClasses: bare(wordWithout(requirementReserved, { digits: true })),
    name: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementStyleStatement: {
    names: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementValueField: {
    value: bare(
      wordWithout(requirementReserved, { spaces: true, digits: true }),
    ),
  },
  GitgraphBranchStatement: {
    name: bare(gitgraphReference, { joins: touchesDashes }),
  },
  GitgraphCheckoutStatement: {
    branch: bare(gitgraphReference, { joins: touchesDashes }),
  },
  GitgraphMergeStatement: {
    branch: bare(gitgraphReference, { joins: touchesDashes }),
  },
  SankeyLinkStatement: {
    source: bare(sankeyName),
    target: bare(sankeyName),
    value: bare((text) => {
      const field = sankeyValueField(text)
      return field === undefined ? undefined : (shortestNumber(field) ?? field)
    }),
  },
  WardleyAcceleratorStatement: { name: quoted(wardleyName) },
  WardleyAnchorStatement: {
    name: bare(wardleyName, { joins: touchesDashes }),
  },
  WardleyComponentStatement: {
    name: bare(wardleyName, { joins: touchesDashes }),
  },
  WardleyDeacceleratorStatement: { name: quoted(wardleyName) },
  WardleyEvolutionStage: {
    name: bare(wardleyName, { joins: touchesDashes }),
    secondName: bare(wardleyName, { joins: touchesDashes }),
  },
  WardleyEvolveStatement: {
    component: bare(wardleyName, { joins: touchesDashes }),
  },
  // Two names without an arrow between them, `A B`, read as one name.
  WardleyLinkStatement: {
    from: bare(wardleyName, { when: hasArrow, joins: touchesDashes }),
    to: bare(wardleyName, { when: hasArrow, joins: touchesDashes }),
  },
  WardleyPipelineComponent: { name: quoted(wardleyName) },
  WardleyPipelineStatement: {
    parent: bare(wardleyName, { joins: touchesDashes }),
  },
}

/** The kept lines of the diagram types that have fields in `bareFields`. */
const keptLinesOf: Readonly<Record<string, (source: Source) => KeptLines>> = {
  agentflow: findAgentflowKeptLines,
  er: findErKeptLines,
  "flowchart-elk": findFlowchartKeptLines,
  "flowchart-v2": findFlowchartKeptLines,
  kanban: findKanbanKeptLines,
  mindmap: findMindmapKeptLines,
  quadrantChart: findQuadrantKeptLines,
  requirement: findRequirementKeptLines,
  sankey: findSankeyKeptLines,
  swimlane: findFlowchartKeptLines,
  usecase: findUsecaseKeptLines,
  venn: findVennKeptLines,
  xychart: findXychartKeptLines,
}

const keptLinesOfSources = new WeakMap<Source, KeptLines | null>()

/**
 * The lines of a source that the printer writes as they are, from the function
 * of its diagram type in `keptLinesOf`, or null where the type has none. The
 * lines are found once for a source, since a field asks for them.
 */
function keptLinesOfSource(source: Source): KeptLines | null {
  let kept = keptLinesOfSources.get(source)
  if (kept === undefined) {
    kept = keptLinesOf[source.root.diagramType]?.(source) ?? null
    keptLinesOfSources.set(source, kept)
  }
  return kept
}

/**
 * Whether the line of an offset is one that the printer writes as it is, or
 * keeps whole, because of a `;` or a number that the lexer reads with what
 * follows: the characters that touch a text stay there, and a text without
 * quotes could join them into one name. A diagram type without a function of
 * its own is told by a `;` or a `%%` on the line.
 */
function isKept(source: Source, offset: number): boolean {
  const kept = keptLinesOfSource(source)
  const line = lineStartOf(source, offset)
  return kept === null
    ? source.text.slice(line, lineEndOf(source, offset)).includes(";") ||
        source.text.slice(line, lineEndOf(source, offset)).includes("%%")
    : kept.joined.has(line) || kept.verbatim.has(line)
}

/**
 * Whether the character at a side of a text without quotes touches another
 * unit, so that a space would come between them once the text is in quotes
 * (the `a` and the `-1` of `a-1`). A keyword is no such unit: the printer
 * writes a space after it in any case.
 */
function touchesToken(
  source: Source,
  offset: number,
  before: boolean,
): boolean {
  const character = source.text[before ? offset - 1 : offset]
  return (
    character !== undefined &&
    !isWhitespace(character) &&
    !";[".includes(character) &&
    source.root.tokens.find((token) =>
      before ? token.range[1] === offset : token.range[0] === offset,
    )?.type !== "Keyword"
  )
}

/**
 * Whether a text ends with `style` or `classDef` in any case: followed by a
 * `:` and a `#`, and by a `;` on the line, it would start the line rule that
 * ignores the `;` (docs/compatibility.md, Lines that hold a `;`).
 */
function endsLikeStyleKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return lower.endsWith("style") || lower.endsWith("classdef")
}

/**
 * Records, for each field of `quoteRules` that is written in the other form
 * and holds a text that is read the same in the form of the examples, the
 * field in that form. A field that a `#`, a `%`, or a `;` follows on its line
 * keeps its form: a text without quotes can run to the end of the line and take
 * the character, and the text after it, into the field. So does a text that a
 * `:` follows and that ends like a `style` keyword, and a field on a kept line.
 */
export function findQuoteFormRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node = source.root,
): void {
  const fields = quoteRules[node.type]
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    const children: readonly unknown[] = Array.isArray(value) ? value : [value]
    children.forEach((child, index) => {
      // A written empty entry (`null`) holds a place, but no text.
      if (child === null || child === undefined) return
      const item = child as Node
      const rules = fields?.[key]
      if (rules === undefined) {
        findQuoteFormRespellings(source, found, item)
        return
      }
      for (const rule of Array.isArray(rules) ? rules : [rules]) {
        respell(source, found, node, item, index, rule)
      }
    })
  }
}

/**
 * Whether only spaces, tabs, and directives lie between the start of the line
 * and `offset`: the first unit of its line, which is the place where mermaid.js
 * rejects a string in an agentflow diagram. It removes the directives before it
 * reads the text, and ends a line at a U+2028 or a U+2029 as well as at a line
 * feed, so a label after a directive on a line of its own, or after a line
 * separator, is the first unit.
 */
function startsItsLine(source: Source, offset: number): boolean {
  let position = offset
  while (position > 0) {
    const directive = findDirectiveEndingAt(source, position)
    if (directive !== undefined) {
      position = directive.range[0]
      continue
    }
    const character = source.text[position - 1]
    if (
      (character === "\n" && !source.removedLineFeeds.has(position - 1)) ||
      character === "\r" ||
      character === "\u2028" ||
      character === "\u2029"
    )
      return true
    if (!isSpaceOrTab(character)) return false
    position--
  }
  return true
}

/**
 * Records the respelling of one field of a node, when its rule applies to the
 * node and the field is written in the other form (see
 * `findQuoteFormRespellings`).
 */
function respell(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node,
  item: Node,
  index: number,
  rule: QuoteRule,
): void {
  const { kind } = item as Node & { kind?: string }
  if (kind === "markdown") return
  if (rule.when?.(node, item, index) === false) return
  // The characters around the text, such as the brackets of a label, stay.
  const [open, close] = rule.wrapped ?? ["", ""]
  const start = item.range[0] + open.length
  const end = item.range[1] - close.length
  if (
    source.text.slice(item.range[0], start) !== open ||
    source.text.slice(end, item.range[1]) !== close
  )
    return
  const line = lineStartOf(source, start)
  const content = (item as Node & { value?: unknown }).value
  // The spaces, tabs, and no-break spaces next to the brackets are left out of
  // the text of a label that is printed without quotes, which mermaid.js trims.
  let written = source.text.slice(start, end)
  if (rule.wrapped !== undefined && rule.form === "bare") {
    let from = 0
    let to = written.length
    while (from < to && isBracketPadding(written[from])) from++
    while (to > from && isBracketPadding(written[to - 1])) to--
    written = written.slice(from, to)
  }
  // A string is a StringLiteral, or a node of the kind `string`. A label with
  // padding before a quote is a text that holds the quotes, but the printer
  // drops the padding, and then the label is a string.
  const isString =
    item.type === "StringLiteral" ||
    kind === "string" ||
    (rule.wrapped !== undefined &&
      rule.form === "bare" &&
      kind === "text" &&
      written.length >= 2 &&
      written.startsWith('"') &&
      written.endsWith('"') &&
      !written.slice(1, -1).includes('"'))
  if (isString !== (rule.form === "bare")) return
  let text = written
  // Where the string ends: the label of a name that a space and a bracket
  // follow holds that space, which the printer drops (the tail of the string).
  let stringEnd = item.range[1]
  if (isString) {
    // A directive or a comment region inside the string, or a text that
    // follows it, is no part of the content. A string between `'` is the
    // same string, which the printer writes between `"` (Strings between
    // `"`).
    if (kind === "text") {
      text = written.slice(1, -1)
    } else if (rule.wrapped !== undefined) {
      if (written !== `"${content}"` && written !== `'${content}'`) return
      text = content as string
    } else {
      const closing = written.lastIndexOf(written[0])
      const tail = written.slice(closing + 1)
      if (
        !(
          written.startsWith('"') ||
          written.startsWith("'") ||
          written.startsWith("`")
        ) ||
        closing < 1 ||
        ![...tail].every(isSpaceOrTab) ||
        content !== written.slice(1, closing) + tail
      )
        return
      text = written.slice(1, closing)
      stringEnd = start + closing + 1
    }
  } else if (typeof content === "string" && written !== content) {
    // A directive or a comment region inside the text is no part of its
    // value.
    return
  }
  // The printer writes the runs of spaces and tabs of some texts as one space,
  // and the second formatting reads the text that the first one wrote.
  const printed = rule.text(
    printsRunsAsOne(source, item.range[0], item.range[1])
      ? collapseRuns(text)
      : text,
  )
  // mermaid.js takes the directives away before it reads the text, so what
  // follows is the first character after the spaces, tabs, and directives.
  const textEnd = rule.wrapped === undefined ? stringEnd : end
  const lineEnd = lineEndOf(source, textEnd)
  let next = textEnd
  for (;;) {
    while (next < lineEnd && isSpaceOrTab(source.text[next])) next++
    const directive = findTriviaAt(source, next)
    if (directive?.type !== "Directive" || directive.range[0] !== next) break
    next = directive.range[1]
  }
  const after = next < lineEnd ? source.text[next] : undefined
  if (rule.afterTextOnItsLine === true && startsItsLine(source, start)) return
  if (
    printed !== undefined &&
    (rule.form === "quoted"
      ? rule.standsAlone === true ||
        (!touchesToken(source, start, true) &&
          !touchesToken(source, end, false))
      : !"#%".includes(after ?? "\n") &&
        !(after === ":" && endsLikeStyleKeyword(printed))) &&
    rule.joins?.(
      textWithoutDirectives(source, line, start),
      textWithoutDirectives(source, textEnd, lineEndOf(source, textEnd)),
      source,
      start,
    ) !== true &&
    !isKept(source, start)
  ) {
    found.set(item.range[0], {
      end: stringEnd,
      text: `${open}${isString ? printed : `"${printed}"`}${close}`,
    })
  }
}

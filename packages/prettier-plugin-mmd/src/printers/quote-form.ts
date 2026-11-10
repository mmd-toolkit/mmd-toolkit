import type { Node } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { findErKeptLines } from "./er-kept-lines.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import { shortestNumber } from "./number-form.ts"
import { findQuadrantKeptLines } from "./quadrant-kept-lines.ts"
import { findRequirementKeptLines } from "./requirement-kept-lines.ts"
import { findSankeyKeptLines } from "./sankey-kept-lines.ts"
import type { Source } from "./source.ts"
import { isBracketPadding, isWhitespace } from "./source.ts"
import { collapseRuns } from "./text-runs.ts"
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
  /** The nodes whose field has the form, when it is not every node of the type. */
  readonly when?: (node: Node) => boolean
  /**
   * Whether the text before and after the field on its line, which the printer
   * does not separate from it, would join a text without quotes into a longer
   * name.
   */
  readonly joins?: (before: string, after: string) => boolean
  /**
   * The characters that stand at the two ends of the range of the field and
   * are no part of its text, such as the brackets of a label. The quotes go
   * inside them, and the text must be the whole of what they hold.
   */
  readonly wrapped?: readonly [string, string]
}

/** A field that the examples write without quotes. */
function bare(
  text: Bare,
  options: Pick<QuoteRule, "when" | "joins" | "wrapped"> = {},
): QuoteRule {
  return { form: "bare", text, ...options }
}

/** A field that the examples write in quotes. */
function quoted(
  text: Bare,
  options: Pick<QuoteRule, "when" | "joins" | "wrapped"> = {},
): QuoteRule {
  return { form: "quoted", text, ...options }
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
 * mermaid.js drops from a field with or without quotes, when it is plain text:
 * ASCII letters, digits, `_`, `-`, and `.`, with spaces between them. No other
 * character is certain to be read the same without quotes: a stage that reads
 * the text of a diagram before its lexer gives `%%`, `#`, `;`, and `\` a
 * meaning, and the lexer a `,` and a `"`.
 */
function sankeyField(text: string): string | undefined {
  const field = text.trim()
  return field !== "" &&
    [...field].every(
      (character) =>
        (character >= "a" && character <= "z") ||
        (character >= "A" && character <= "Z") ||
        (character >= "0" && character <= "9") ||
        character === "_" ||
        character === "-" ||
        character === "." ||
        character === " ",
    )
    ? field
    : undefined
}

/**
 * A word of ASCII letters, digits, and `_`, or, where `spaces` is true, words
 * with spaces between them, that starts with a letter or `_` (or, where
 * `digits` is true, with any of these characters) and whose first word is none
 * of the `reserved` words, which are compared in lower case: the lexer of a
 * diagram type reads a reserved word as a unit of its own, and a text of other
 * characters has a meaning in the stages before the lexer.
 */
function wordWithout(
  reserved: ReadonlySet<string>,
  { spaces = false, digits = false } = {},
): Bare {
  return (text) => {
    const first = text[0]
    return first !== undefined &&
      (digits || !(first >= "0" && first <= "9")) &&
      first !== " " &&
      !text.endsWith(" ") &&
      [...text].every(
        (character) =>
          (character >= "a" && character <= "z") ||
          (character >= "A" && character <= "Z") ||
          (character >= "0" && character <= "9") ||
          character === "_" ||
          (spaces && character === " "),
      ) &&
      !reserved.has(text.split(" ")[0].toLowerCase())
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
 * The words of a gitGraph that its lexer reads as a unit of its own, in lower
 * case: the lexers of older versions of mermaid.js compare them in any case.
 */
const gitgraphReserved: readonly string[] = [
  "cherry-pick",
  "gitgraph",
  "highlight",
  "checkout",
  "reverse",
  "commit",
  "normal",
  "branch",
  "switch",
  "merge",
  "lr",
  "tb",
  "bt",
  "title",
  "acctitle",
  "accdescr",
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
 * and not starting with one of the words that it reads as a unit of its own,
 * in any case, before a character that is no part of a word, or with `title`.
 */
function gitgraphReference(text: string): string | undefined {
  const lower = text.toLowerCase()
  // The line of a title is read before a name, so a name that starts with
  // `title` cannot be written without quotes.
  const startsWithReserved =
    lower.startsWith("title") ||
    gitgraphReserved.some(
      (word) => lower.startsWith(word) && !isWordCharacter(lower[word.length]),
    )
  return !(text[0] >= "0" && text[0] <= "9") &&
    !startsWithReserved &&
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
 * of ASCII letters that end with digits, with one space between them, none of
 * them a word that the lexer reads as a unit of its own. A letter after a digit
 * or a `_` would start a word again, so none follows one.
 */
function quadrantLabel(written: string): string | undefined {
  // The printer writes a run of spaces and tabs inside a text as one space.
  const text = collapseRuns(written)
  return text.split(" ").every((word) => {
    const letters = [...word].findIndex(
      (character) => character >= "0" && character <= "9",
    )
    const head = letters === -1 ? word : word.slice(0, letters)
    const tail = letters === -1 ? "" : word.slice(letters)
    return (
      head !== "" &&
      [...head].every(
        (character) =>
          (character >= "a" && character <= "z") ||
          (character >= "A" && character <= "Z"),
      ) &&
      [...tail].every((character) => character >= "0" && character <= "9") &&
      !quadrantReserved.has(word.toLowerCase()) &&
      !word.toLowerCase().startsWith("quadrant")
    )
  })
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
])

/**
 * The words of a use case diagram that are read as a unit of their own in any
 * case: `include` and `extend`, the words that the grammar refuses as the name
 * that starts a statement, and the lines of an accessibility title and
 * description, which a `:` after them would start.
 */
const usecaseKeywordsInAnyCase: ReadonlySet<string> = new Set([
  "include",
  "extend",
  "allowmixing",
  "newpage",
  "package",
  "rectangle",
  "skinparam",
  "acctitle",
  "accdescr",
])

/**
 * A name or a word of a use case diagram that the lexer reads whole without
 * quotes: ASCII letters, digits, and `_`, none of the words that it reads as a
 * unit of its own.
 */
function usecaseWord(text: string): string | undefined {
  return text !== "" &&
    [...text].every(isWordCharacter) &&
    !usecaseKeywords.has(text) &&
    !usecaseKeywordsInAnyCase.has(text.toLowerCase())
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
    text.split(" ").every((word) => word !== "" && [...word].every(isWordCharacter))
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
  return hasId(node) && (node as Node & { shape?: unknown }).shape !== "rectangle"
}

/** Whether a use case has a label between square brackets. */
function isInSquareBrackets(node: Node): boolean {
  return hasId(node) && (node as Node & { shape?: unknown }).shape === "rectangle"
}

/** The text of the key of a property of the native metadata of a use case. */
function metadataKeyOf(node: Node): string | undefined {
  const { key } = node as Node & { key?: Node & { name?: string; value?: string } }
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

/** Whether a plot of an XY chart is a line. */
function isLine(node: Node): boolean {
  return (node as Node & { kind?: string }).kind === "line"
}

/** Whether the axis of an axis statement of a quadrant chart is the x axis. */
function isXAxis(node: Node): boolean {
  return (node as Node & { axis?: string }).axis === "x"
}

/** Whether a link of a Wardley map has an arrow between its names. */
function hasArrow(node: Node): boolean {
  return (node as Node & { arrow?: unknown }).arrow !== null
}

/**
 * The fields that are written with or without quotes, by the type of the node
 * and the field, in the form that the examples in the documentation of the
 * pinned mermaid.js use at least twice as often as the other
 * (docs/compatibility.md, Spellings that are drawn the same): the three fields
 * of a link of a sankey diagram, the names and the roles of an ER diagram, the
 * names, the values, and the classes of a requirement diagram, the names of a
 * Wardley map, the branches of a gitGraph, the texts of a quadrant chart, and
 * the titles and the categories of an XY chart.
 */
const quoteRules: Readonly<
  Record<string, Readonly<Record<string, QuoteRule | readonly QuoteRule[]>>>
> = {
  ErEntityReference: { name: bare(wordWithout(erReserved)) },
  ErEntityStatement: { name: bare(wordWithout(erReserved)) },
  ErRelationshipStatement: { role: bare(wordWithout(erReserved)) },
  ErSubgraphStatement: { id: bare(wordWithout(erReserved)) },
  QuadrantAxisStatement: {
    end: bare(quadrantLabel, { when: isXAxis }),
    start: bare(quadrantLabel),
  },
  QuadrantPointStatement: { name: bare(quadrantLabel) },
  QuadrantQuadrantStatement: { text: bare(quadrantLabel) },
  UsecaseActor: {
    label: [
      bare(usecaseWord, { when: hasNoId }),
      quoted(usecaseLabel, { when: hasId }),
    ],
  },
  UsecaseEntity: {
    label: [
      bare(usecaseWord, { when: hasNoId }),
      quoted(usecaseLabel, { when: isInParentheses }),
      bare(usecaseBracketLabel, { when: isInSquareBrackets }),
    ],
  },
  UsecaseMetadataAssignmentStatement: { target: bare(usecaseWord) },
  UsecaseMetadataProperty: {
    key: bare(usecaseWord),
    value: [
      quoted(usecaseWord, { when: isIcon }),
      bare(usecaseWord, { when: isNoIcon }),
    ],
  },
  UsecaseNoteStatement: { label: quoted(usecaseLabel) },
  UsecaseRelationshipStatement: { label: quoted(usecaseLabel) },
  UsecaseSystemBoundaryStatement: {
    title: [
      bare(usecaseWord, { when: hasNoId }),
      quoted(usecaseLabel, { when: hasId }),
    ],
  },
  VennStyleProperty: {
    value: bare(vennStyleValue),
  },
  VennStyleStatement: { targets: bare(vennName) },
  VennSubsetStatement: {
    label: quoted(vennLabel, { wrapped: ["[", "]"] }),
    sets: bare(vennName),
  },
  VennTextStatement: {
    id: bare(vennName, { when: isImplicitText }),
    label: quoted(vennLabel, { when: isImplicitText, wrapped: ["[", "]"] }),
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
    source: bare(sankeyField),
    target: bare(sankeyField),
    value: bare((text) => {
      const field = sankeyField(text)
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
  er: findErKeptLines,
  quadrant: findQuadrantKeptLines,
  requirement: findRequirementKeptLines,
  sankey: findSankeyKeptLines,
  usecase: findUsecaseKeptLines,
  venn: findVennKeptLines,
  xychart: findXychartKeptLines,
}

/**
 * Whether the line of an offset is one that the printer writes as it is, or
 * keeps whole, because of a `;` or a number that the lexer reads with what
 * follows: the characters that touch a text stay there, and a text without
 * quotes could join them into one name. A diagram type without a function of
 * its own is told by a `;` or a `%%` on the line.
 */
function isKept(source: Source, offset: number): boolean {
  const kept = keptLinesOf[source.root.diagramType]?.(source)
  const line = lineStartOf(source, offset)
  return kept === undefined
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
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      const rules = fields?.[key]
      if (rules === undefined) {
        findQuoteFormRespellings(source, found, item)
        continue
      }
      for (const rule of Array.isArray(rules) ? rules : [rules]) {
        respell(source, found, node, item, rule)
      }
    }
  }
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
  rule: QuoteRule,
): void {
  const { kind } = item as Node & { kind?: string }
  // A string is a StringLiteral, or a node of the kind `string`.
  const isString = item.type === "StringLiteral" || kind === "string"
  if (isString !== (rule.form === "bare") || kind === "markdown") return
  if (rule.when?.(node) === false) return
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
  const written = source.text.slice(start, end)
  const content = (item as Node & { value?: unknown }).value
  let text = written
  if (isString) {
    // A directive or a comment region inside the string, or a text that
    // follows it, is no part of the content. A string between `'` is the
    // same string, which the printer writes between `"` (Strings between
    // `"`).
    if (written !== `"${content}"` && written !== `'${content}'`) return
    text = content as string
  } else if (typeof content === "string" && written !== content) {
    // A directive or a comment region inside the text is no part of its
    // value.
    return
  }
  const printed = rule.text(text)
  const after = source.text.slice(end, lineEndOf(source, end)).trimStart()[0]
  if (
    printed !== undefined &&
    (rule.form === "quoted"
      ? rule.wrapped !== undefined ||
        (!touchesToken(source, start, true) &&
          !touchesToken(source, end, false))
      : !"#%;".includes(after ?? "\n") &&
        !(after === ":" && endsLikeStyleKeyword(printed))) &&
    rule.joins?.(
      source.text.slice(line, start),
      source.text.slice(end, lineEndOf(source, end)),
    ) !== true &&
    !isKept(source, start)
  ) {
    found.set(item.range[0], {
      end: item.range[1],
      text: `${open}${isString ? printed : `"${printed}"`}${close}`,
    })
  }
}

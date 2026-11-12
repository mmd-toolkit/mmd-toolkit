import type { Node, Range } from "@mmd-toolkit/ast"
import type { Doc } from "prettier"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { appendItems } from "./collections.ts"
import type { TextEdit } from "./layout.ts"
import {
  expectToken,
  expectValue,
  keptAsWritten,
  replaceInAtoms,
} from "./layout.ts"
import { styleRunEdits } from "./style-text.ts"
import { collapseRunEdits } from "./text-runs.ts"
import {
  findLinesWithOwnSemicolons,
  isInsideStyleRuleStretch,
  lineStartOf,
} from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokensBetween,
  findTriviaBetween,
  hasTriviaBesidesTrailingDirectives,
  isSpaceOrTab,
  isStructural,
  skipSpacesAndTabs,
} from "./source.ts"

/**
 * The gap rules of the statements that more than one diagram type has in
 * the same form: the lists of classes and names of the style context, the
 * direction line, and the accessibility statements. An ER diagram and a
 * requirement diagram read them with the same units, so they are printed
 * with the same rules (docs/er.md and docs/requirement.md). A rule is
 * stated by the start of the atom after the gap (see `GapRule`).
 */

/**
 * Adds the rules of a list of classes after `:::`: the `:::`, the `,`, and
 * the names touch what is before them. The list lies after `start`.
 */
export function addClassListRules(
  source: Source,
  classes: readonly Node[],
  start: number,
  rules: Map<number, GapRule>,
): void {
  const last = classes.at(-1)
  if (last === undefined) return
  for (const name of classes) rules.set(name.range[0], "none")
  for (const token of findTokensBetween(source, start, last.range[1])) {
    if (
      isStructural(source, token) &&
      (token.value === ":::" || token.value === ",")
    ) {
      rules.set(token.range[0], "none")
    }
  }
}

/**
 * Adds the rules of the class after a `:::`: the `:::` touches what is before
 * it, and the class touches the `:::`, as in `A:::c`.
 */
export function addCssClassRules(
  source: Source,
  cssClass: Node,
  rules: Map<number, GapRule>,
): void {
  const separator = expectToken(
    findStructuralTokenEndingBefore(source, cssClass.range[0]),
    "the `:::` before a class",
  )
  expectValue(separator, ":::")
  rules.set(separator.range[0], "none")
  rules.set(cssClass.range[0], "none")
}

/**
 * Adds the rules of a list of names separated by `,`: the first name stands
 * after one space, and the others touch the `,` before them, which touches
 * the name before it.
 */
export function addNameListRules(
  source: Source,
  names: readonly Node[],
  rules: Map<number, GapRule>,
): void {
  const first = names.at(0)
  const last = names.at(-1)
  if (first === undefined || last === undefined) return
  rules.set(first.range[0], "space")
  for (const name of names.slice(1)) rules.set(name.range[0], "none")
  for (const token of findTokensBetween(
    source,
    first.range[1],
    last.range[0],
  )) {
    if (isStructural(source, token) && token.value === ",") {
      rules.set(token.range[0], "none")
    }
  }
}

/**
 * The rules of a `classDef` or `style` statement: its names are separated by
 * `,` without whitespace, and the first style stands after one space. The
 * default style/comma gaps follow the source. Safe ER and requirement units
 * instead use no space before a comma and one after it (docs/er.md and
 * docs/requirement.md, Styles and classes).
 */
export function styleStatementRules(
  source: Source,
  names: readonly Node[],
  styles: readonly Node[],
  compactStyles = false,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  addNameListRules(source, names, rules)
  rules.set(styles[0].range[0], "space")
  if (compactStyles) {
    for (let index = 1; index < styles.length; index++) {
      const comma = expectToken(
        findStructuralToken(source, styles[index - 1].range[1]),
        "the comma between styles",
      )
      rules.set(comma.range[0], "none")
      rules.set(styles[index].range[0], "space")
    }
  }
  return rules
}

/**
 * Keep property and value text, changing only the first colon's padding and
 * the runs of spaces and tabs between the words of a style, which are printed
 * as one space (docs/er.md and docs/requirement.md, Styles and classes). A
 * style with a `:` at its start has no padding to set before it.
 */
export function printStyleUnitSpacing(source: Source, style: Node): Doc {
  const [start, end] = style.range
  const gap = findColonGap(source.text, start, end)
  if (gap === undefined) return printWordGaps(source, start, end)
  return [
    printWordGaps(source, start, gap.nameEnd),
    ":",
    gap.valueStart < end
      ? [" ", printWordGaps(source, gap.valueStart, end)]
      : "",
  ]
}

/**
 * The text at `[start, end)`, with each run of spaces and tabs that
 * `styleRunEdits` lists printed as one space.
 */
function printWordGaps(source: Source, start: number, end: number): Doc {
  const parts: Doc[] = []
  let position = start
  for (const { range } of styleRunEdits(source, start, end)) {
    parts.push(printAsWritten(source, position, range[0]), " ")
    position = range[1]
  }
  parts.push(printAsWritten(source, position, end))
  return parts
}

/**
 * Adds the edits that print each run of spaces and tabs between the words of a
 * style as one space, where the Db of mermaid.js either does not hold the
 * whitespace (it joins the words of a style that has no `:`) or holds it and
 * draws the figure without it (docs/compatibility.md, Styles that are drawn
 * the same). The whitespace next to the first `:` is the business of
 * `addColonEdit`, called before this, and stays as that edit leaves it. The
 * other runs that `styleRunEdits` lists change, also in a style where that edit
 * leaves the colon as written, as in one that starts with the `:`. Not the
 * whitespace at the ends of `range`, which is the business of the caller, which
 * keeps the whitespace after a backslash that ends a style.
 */
export function addWordGapEdits(
  source: Source,
  [start, end]: Range,
  edits: TextEdit[],
): void {
  const colon = source.text.indexOf(":", start)
  const hasColon = colon !== -1 && colon < end
  for (const edit of styleRunEdits(source, start, end)) {
    const [from, to] = edit.range
    if (hasColon && (to === colon || from === colon + 1)) continue
    if (!edits.some((other) => other.range[0] < to && from < other.range[1]))
      edits.push(edit)
  }
}

/**
 * ER and requirement discard simple same-line style-unit padding. Keep trivia,
 * physical/Unicode line boundaries and complete semicolon-sensitive lines (a
 * line that holds a `;` of its own, not one that separates statements and is
 * dropped) on their original path (diagrams/er.md and diagrams/requirement.md,
 * Style context).
 */
export function styleUnitsCanCompact(
  source: Source,
  start: number,
  end: number,
  styles: readonly Node[],
): boolean {
  return (
    styles.every((style) => {
      const text = source.text.slice(...style.range)
      return (
        !text.includes("\n") &&
        !text.includes("\u2028") &&
        !text.includes("\u2029")
      )
    }) &&
    !findLinesWithOwnSemicolons(source).has(lineStartOf(source, start)) &&
    findTriviaBetween(source, start, end).length === 0
  )
}

/** What the styles of a statement reach: what stays as written follows. */
export interface StyleListUse {
  /** The statement is a `linkStyle` with link numbers. */
  readonly keepsSpaceBeforeFill?: boolean
  /**
   * The statement is a `linkStyle`, with link numbers or `default`: its styles
   * are the styles of links, which mermaid.js reads in more ways than the
   * styles of a node.
   */
  readonly isLinkStyle?: boolean
  /**
   * mermaid.js joins the styles of the statement with `;` as they are: a
   * `linkStyle`, the `style` of a block diagram, and the `style` and the
   * `classDef` of a class diagram.
   */
  readonly joinsStyles?: boolean
  /**
   * The statement is a `style` of a block diagram: mermaid.js sorts its styles
   * into those of the label and those of the shape by how they start.
   */
  readonly splitsLabelStyles?: boolean
  /** The styles can reach a link: a `linkStyle`, a `classDef`. */
  readonly keepsGapAfterStroke?: boolean
  /**
   * A backslash escapes a `,`: `a\,b` is one style, and a space between the
   * backslash and a `,` decides that. Only the `classDef` of flowchart and
   * agentflow reads it so; their `style` and `linkStyle` end a style at every
   * `,`.
   */
  readonly escapesComma?: boolean
  /**
   * The statement is a `style` or a `classDef` of a class diagram: a run of
   * spaces and tabs between the words of a style is printed as one space (see
   * `addWordGapEdits`).
   */
  readonly collapsesWordGaps?: boolean
  /**
   * The text of the last style reaches over the whitespace after it, as in a
   * treemap, where the style runs to the end of the line: that whitespace is
   * left out too.
   */
  readonly trimsEnd?: boolean
}

/**
 * Prints the styles of a `classDef`, `style`, or `linkStyle` statement in the
 * form of ER and requirement: no whitespace before the first `:` of a style,
 * one space after it where the value is not empty, no whitespace before a `,`
 * and one space after it. mermaid.js draws the same figure whatever the
 * whitespace there: it takes the whitespace around the name and the value of a
 * style away before it makes the CSS of the figure (docs/flowchart.md,
 * Styles). The Db keeps the whitespace in the styles, so it changes (see
 * `styleDbForFormattingComparison`). The styles lie in the atoms as written,
 * and the edits are made in the atoms that hold them: where the layout makes
 * each style an atom of its own, the commas between them are the business of
 * the gap rules (see `replaceInAtoms`).
 *
 * `keepsSpaceBeforeFill` is set for a `linkStyle` with link numbers. Where no
 * style of such a statement starts with `fill`, mermaid.js adds `fill:none` to
 * the styles of the link, and a style that starts with whitespace does not
 * start with `fill`, so a style that starts with `fill` keeps whether
 * whitespace stands before it, a run of whitespace becoming one space.
 *
 * `keepsGapAfterStroke` is set for the statements whose styles can reach a
 * link. mermaid.js looks for `stroke:` in the styles of a link to colour its
 * arrowheads, so a name that ends with `stroke` keeps whether whitespace stands
 * between it and the `:`, a run of whitespace becoming one space
 * (docs/compatibility.md, Styles that are drawn the same).
 *
 * `isLinkStyle` is set for a `linkStyle`, whose styles mermaid.js reads as the
 * styles of a link in two more ways (docs/compatibility.md, Styles that are
 * drawn the same):
 *
 * - Where the look is `handDrawn`, it takes the first style of a link that
 *   starts with `stroke:` as the colour of its arrowheads and defines an
 *   arrowhead of that colour; a style that starts with whitespace does not
 *   start with `stroke:`. So a style that starts with `stroke:` keeps whether
 *   whitespace stands before it, as for `fill`, a run of whitespace becoming
 *   one space.
 * - It takes the colour of an arrowhead from the first `stroke:` of the styles
 *   of a link and the characters after it up to a `;`, and draws no colour
 *   where they are whitespace only: the next `stroke:` is not tried. So a
 *   style with a name that ends with `stroke` and a value of spaces and tabs
 *   only stays as written (see `hasBlankStrokeValue`), with the whitespace of
 *   its value, which reaches up to the `,` after it. The gap after that `,`
 *   follows the rules above.
 *
 * `splitsLabelStyles` is set for the `style` of a block diagram. mermaid.js
 * puts a style that starts with `color:` or `text-align:` in the style of the
 * label of a node and every other style in the style of its shape, and a block
 * arrow takes the style of its label as it is. A style that starts with
 * whitespace, or has whitespace between its name and the `:`, does not start
 * so. So such a style keeps whether whitespace stands before it, and between
 * `color` or `text-align` and the `:`, a run of whitespace becoming one space.
 *
 * `joinsStyles` is set for the statements whose styles mermaid.js joins with
 * `;` into one CSS text without taking their whitespace away: a `linkStyle`
 * (the path of a link), the `style` of a block diagram (a block arrow and a
 * group), and the `style` and the `classDef` of a class diagram (the box of a
 * class: a `classDef` that stands after the class it is put on adds its styles
 * to those of the class as they are). A backslash at the end of a style
 * escapes the `;` that follows, and the styles after it are lost. So a style
 * that ends with a backslash (see `endsWithEscape`) keeps whether whitespace
 * stands after it, a run of whitespace becoming its first character. The
 * `style` of a node of the other diagram types and their `classDef` are not
 * joined so: mermaid.js takes the whitespace at their ends away first.
 *
 * Where `collapsesWordGaps` is set, a run of spaces and tabs between the words
 * of a style is printed as one space, whether the style has a `:` or not
 * (`addWordGapEdits`). Where `trimsEnd` is set, the whitespace after the last
 * style is left out.
 *
 * Where `escapesComma` is set, a `,` after a backslash is part of a style, and
 * so is a space after a backslash at the end of one: taking that space away
 * would make the `,` part of the style. A space after a backslash before the
 * `:` stays as well, since CSS reads the escaped space as part of the name. A
 * statement with a style that is all whitespace, with a line break, a comment
 * or a directive, or on a line with a kept `;` stays as written, as in ER (see
 * `styleUnitsCanCompact`).
 */
export function normalizeStyleList(
  source: Source,
  atoms: Atom[],
  statement: {
    readonly range: Range
    readonly styles: readonly (Node | null)[]
  },
  {
    keepsSpaceBeforeFill = false,
    isLinkStyle = false,
    joinsStyles = false,
    splitsLabelStyles = false,
    keepsGapAfterStroke = false,
    escapesComma = false,
    collapsesWordGaps = false,
    trimsEnd = false,
  }: StyleListUse = {},
): void {
  const styles = statement.styles.filter((style) => style !== null)
  const first = styles.at(0)
  const last = styles.at(-1)
  if (
    styles.length !== statement.styles.length ||
    first === undefined ||
    last === undefined ||
    !styleUnitsCanCompact(
      source,
      statement.range[0],
      statement.range[1],
      styles,
    )
  ) {
    return
  }
  // The styles are the text between the commas that no backslash escapes.
  const edits: TextEdit[] = []
  const [from, to] = [first.range[0], last.range[1]]
  let previousEnd = -1
  for (let start = from; start <= to;) {
    let comma = start
    while (comma < to && !endsStyle(source, comma, escapesComma)) comma++
    const keepsValue =
      isLinkStyle && hasBlankStrokeValue(source.text.slice(start, comma))
    let core: Range = keepsValue
      ? [skipSpacesAndTabs(source, start, comma), comma]
      : trimStyle(source, [start, comma], { keepsEscapedSpace: escapesComma })
    if (core[0] === core[1]) return
    if (
      joinsStyles &&
      !keepsValue &&
      core[1] < comma &&
      endsWithEscape(source.text.slice(core[0], core[1]))
    ) {
      core = [core[0], core[1] + 1]
    }
    if (!keepsValue) {
      addColonEdit(source, core, edits, {
        keepsGapAfterStroke,
        keepsGapAfterLabelName: splitsLabelStyles,
      })
      if (collapsesWordGaps) addWordGapEdits(source, core, edits)
    }
    if (trimsEnd && comma === to && core[1] < comma) {
      // A directive right after the whitespace keeps whether whitespace stands
      // before it, a run becoming one space, as at the end of any line.
      const beforeDirective =
        findTriviaBetween(source, comma, comma + 1).length > 0
      edits.push({
        range: [core[1], comma],
        replacement: beforeDirective ? " " : "",
      })
    }
    if (previousEnd !== -1) {
      const touchesWord =
        core[0] === start &&
        ((keepsSpaceBeforeFill && source.text.startsWith("fill", core[0])) ||
          (isLinkStyle && source.text.startsWith("stroke:", core[0])) ||
          (splitsLabelStyles &&
            (source.text.startsWith("color:", core[0]) ||
              source.text.startsWith("text-align:", core[0]))))
      edits.push(
        { range: [previousEnd, start - 1], replacement: "" },
        { range: [start, core[0]], replacement: touchesWord ? "" : " " },
      )
    }
    previousEnd = core[1]
    start = comma + 1
  }
  // An insertion at the edge of an atom is the business of the gap rules.
  replaceInAtoms(
    source,
    atoms,
    edits.filter((edit) =>
      atoms.some((atom) =>
        edit.range[0] === edit.range[1]
          ? atom.start < edit.range[0] && edit.range[0] < atom.end
          : atom.start <= edit.range[0] && edit.range[1] <= atom.end,
      ),
    ),
  )
}

/**
 * Whether the text in `range` ends with directives: its content, then
 * directives with spaces and tabs between them and after the last, and nothing
 * else, no `;`, line break, or line separator. The last directive may start at
 * the end of the range, where the directives of a line that end with a
 * directive, with no whitespace after it, stand. A text printed so leaves out
 * the whitespace at its end, and prints the whitespace around the directives
 * as the end of a line (see `trimTextAfterKeyword`).
 */
export function endsWithDirectives(source: Source, [from, to]: Range): boolean {
  const text = source.text.slice(from, to)
  if ([";", "\n", "\r", "\u2028", "\u2029"].some((c) => text.includes(c))) {
    return false
  }
  if (hasTriviaBesidesTrailingDirectives(source, from, to)) return false
  const first = findTriviaBetween(source, from, to)[0]
  const follows = findTriviaBetween(source, to, to + 1).some(
    (item) => item.type === "Directive" && item.range[0] === to,
  )
  if (first === undefined && !follows) return false
  return source.text.slice(from, first?.range[0] ?? to).trim() !== ""
}

/**
 * The layout of a line that stays as written, apart from the end of its text
 * where directives end it: the whitespace after the last directive is left out,
 * and each directive keeps whether whitespace precedes it, a run becoming one
 * space (see `collectTextEndEdits`). The runs inside the text stay.
 */
export function keptWithDirectiveEnd(
  source: Source,
  start: number,
  end: number,
): AtomLayout {
  const layout = keptAsWritten(start, end)
  if (!endsWithDirectives(source, [start, end])) return layout
  const atoms = [...layout.atoms]
  replaceInAtoms(source, atoms, collectTextEndEdits(source, start, end, false))
  return { ...layout, atoms }
}

/**
 * Leaves the spaces and tabs at the start of the text that a statement holds
 * after its keyword out of what is printed, and those at its end: a title, a
 * setting. The keyword takes one whitespace character, and mermaid.js keeps the
 * rest in the Db, but draws the same text without it (docs/compatibility.md,
 * Texts after a keyword that are drawn the same). A directive among those
 * spaces and tabs is removed from the text before it is read, so the spaces and
 * tabs after it count too, and it stays where it is: `title  %%{x}%%  T` and
 * `title %%{x}%% T` are read as the title `T` with the same blanks before it.
 * The spaces and tabs at its end are left out too: mermaid.js keeps them in the
 * Db, and draws the same text without them. A text of spaces and tabs and
 * directives only stays as written. Where directives stand after the text,
 * each keeps whether whitespace precedes it, a run becoming one space, and the
 * whitespace after the last one is left out, whether the last one is read as
 * part of the statement or not: the figure is the same whatever the whitespace
 * at the end of the line, and a directive at the end of a line is printed so
 * elsewhere (docs/flowchart.md, Directives). `collapsesRuns` tells that the
 * runs of spaces and tabs inside the text are printed as one space (a title),
 * and not kept as written (a date format).
 */
export function trimTextAfterKeyword(
  source: Source,
  atoms: Atom[],
  text: Range | null,
  collapsesRuns: boolean,
): void {
  if (text === null) return
  const [from, to] = text
  const edits: TextEdit[] = []
  let offset = from
  for (;;) {
    const blanks = skipSpacesAndTabs(source, offset, to)
    if (blanks > offset)
      edits.push({ range: [offset, blanks], replacement: "" })
    if (blanks >= to) return
    const directive = findTriviaBetween(source, blanks, blanks + 1).find(
      (item) => item.type === "Directive" && item.range[0] === blanks,
    )
    if (directive === undefined) break
    offset = directive.range[1]
  }
  appendItems(edits, collectTextEndEdits(source, offset, to, collapsesRuns))
  replaceInAtoms(source, atoms, edits)
}

/**
 * The edits that print the end of a text that holds its last line of spaces and
 * tabs and directives: the spaces and tabs at its end are left out, and each
 * directive that ends it keeps whether whitespace precedes it, a run becoming
 * one space. `offset` is where the text starts, after the spaces, tabs and
 * directives that precede its content. `collapsesRuns` tells that the runs of
 * spaces and tabs in the text are printed as one space as well (a title), which
 * the general rule of the texts prints for a text that no directive ends.
 *
 * mermaid.js removes a directive from the text before it reads it, so the
 * spaces and tabs before a directive that ends the text are at the end too, and
 * the figure is the same whatever they are. The last directive of the line is
 * read as part of the text only where whitespace follows it; where it does not,
 * it starts at the end of the text, and its gap is that of a directive at the
 * end of a line, the same as in the other case (docs/flowchart.md, Directives).
 */
export function collectTextEndEdits(
  source: Source,
  offset: number,
  to: number,
  collapsesRuns: boolean,
): TextEdit[] {
  const edits: TextEdit[] = []
  const directiveFollows = findTriviaBetween(source, to, to + 1).some(
    (item) => item.type === "Directive" && item.range[0] === to,
  )
  if (directiveFollows && collapsesRuns) {
    // With no directive among the spaces and tabs at the end of the text, the
    // gap before the directive is the only one, and the rules of the texts
    // print it.
    let blanks = to
    while (blanks > offset && isSpaceOrTab(source.text[blanks - 1])) blanks--
    const last = findDirectiveEndingAt(source, blanks)
    if (last === undefined || last.range[0] <= offset) return edits
  }
  // A comment that starts right after the text stays on its line, one space
  // after it.
  const commentFollows =
    directiveFollows ||
    source.root.comments.some((comment) => comment.range[0] === to)
  let position = to
  let headEnd = to
  for (;;) {
    let blanks = position
    while (blanks > offset && isSpaceOrTab(source.text[blanks - 1])) blanks--
    headEnd = blanks
    if (blanks < position) {
      // The blanks before a directive that ends the text are the run that the
      // same text has when the directive stands after it: one space.
      edits.push({
        range: [blanks, position],
        replacement: position !== to || commentFollows ? " " : "",
      })
    }
    const directive = findDirectiveEndingAt(source, blanks)
    if (directive === undefined || directive.range[0] <= offset) break
    position = directive.range[0]
  }
  // A text that directives end holds them, so the collapse of the runs in the
  // texts does not reach it; the runs before them are the same as when the
  // directives stand after the text.
  if (collapsesRuns && position !== to) {
    appendItems(edits, collapseRunEdits(source, offset, headEnd))
  }
  return edits
}

/**
 * Prints the arguments of a `click` call in one form: no whitespace at their
 * ends or before a `,`, and one space after it. mermaid.js splits the text at
 * every `,` that has an even number of `"` after it, trims each part, and
 * takes a part in quotes without them, so it calls the function with the same
 * arguments whatever the whitespace around the parts. The Db keeps the text,
 * so it changes (see `clickCallDbForFormattingComparison`). A `,` inside
 * quotes is no part of the split, and the whitespace beside it stays. Arguments
 * with a line break, a comment or a directive, with an empty part, or with
 * nothing but whitespace stay as written (docs/compatibility.md, Call arguments
 * that are drawn the same).
 */
export function normalizeCallArguments(
  source: Source,
  atoms: Atom[],
  range: Range | null,
): void {
  if (range === null) return
  const text = source.text.slice(...range)
  if (
    text.includes("\n") ||
    text.includes("\u2028") ||
    text.includes("\u2029") ||
    text.includes("%%")
  )
    return
  const quotes = [...text].filter((character) => character === '"').length
  const parts: Range[] = []
  const separators: number[] = []
  let quotesBefore = 0
  let partStart = 0
  for (let index = 0; index <= text.length; index++) {
    const character = text[index]
    if (character === '"') quotesBefore++
    if (
      index < text.length &&
      !(character === "," && (quotes - quotesBefore) % 2 === 0)
    )
      continue
    parts.push([partStart, index])
    separators.push(index)
    partStart = index + 1
  }
  const trimmed = parts.map(([start, end]): Range => {
    let [from, to] = [start, end]
    while (from < to && isSpaceOrTab(text[from])) from++
    while (to > from && isSpaceOrTab(text[to - 1])) to--
    return [from, to]
  })
  if (trimmed.some(([from, to]) => from === to)) return
  const edits: TextEdit[] = []
  const [offset] = range
  for (const [index, [from, to]] of trimmed.entries()) {
    const [start, end] = parts[index]
    edits.push(
      callArgumentsGap(
        source,
        [offset + start, offset + from],
        index === 0 ? "" : " ",
      ),
      callArgumentsGap(source, [offset + to, offset + end], ""),
    )
  }
  replaceInAtoms(source, atoms, edits)
}

/**
 * The edit of a gap between the arguments of a `click` call, which holds
 * `range` and takes `replacement`. The line rule of mermaid.js reads the line
 * of the call: it ignores the last `;` of the line where only characters that
 * are not whitespace lie between a `:` and a `#` (see
 * `isInsideStyleRuleStretch`), so `click A call f(style:x,#b;c)` calls `f`
 * with `#bc`, and `f(style:x, #b;c)` with another text. A gap that the rule
 * may read keeps whether it holds whitespace: one space where it holds some,
 * and nothing where the arguments touch.
 */
function callArgumentsGap(
  source: Source,
  range: Range,
  replacement: string,
): TextEdit {
  if (!isInsideStyleRuleStretch(source, range[0], range[1]))
    return { range, replacement }
  return { range, replacement: range[0] === range[1] ? "" : " " }
}

/**
 * Prints the label without quotes of a shape or a link that holds nothing but
 * spaces and tabs as one space: mermaid.js reads the same empty text for any
 * number of them, draws the same figure, and rejects a label of no character
 * (docs/flowchart.md, Label inner whitespace). A label with a line break or a
 * comment in it stays as written.
 */
export function normalizeBlankLabels(
  source: Source,
  atoms: Atom[],
  values: readonly Node[],
): void {
  const edits: TextEdit[] = []
  for (const value of values) {
    if (
      (value.type !== "FlowchartLabel" && value.type !== "AgentflowLabel") ||
      value.kind !== "text"
    )
      continue
    const text = source.text.slice(...value.range)
    if (text !== " " && text !== "" && [...text].every(isSpaceOrTab))
      edits.push({ range: value.range, replacement: " " })
  }
  replaceInAtoms(source, atoms, edits)
}

/**
 * Prints the text of a style, from `range[0]` to `range[1]`, with the
 * whitespace around its first `:` as `normalizeStyleList` puts it.
 */
export function printStyleWithColon(source: Source, range: Range): Doc {
  const edits: TextEdit[] = []
  addColonEdit(source, trimStyle(source, range), edits)
  const [edit] = edits
  if (edit === undefined) return printAsWritten(source, ...range)
  return [
    printAsWritten(source, range[0], edit.range[0]),
    edit.replacement,
    printAsWritten(source, edit.range[1], range[1]),
  ]
}

/**
 * Whether the character at `offset` ends a style: a `,`, unless a backslash
 * before it escapes it where `escapesComma` is set.
 */
function endsStyle(
  source: Source,
  offset: number,
  escapesComma: boolean,
): boolean {
  return (
    source.text[offset] === "," &&
    !(escapesComma && source.text[offset - 1] === "\\")
  )
}

/**
 * Whether a style of a link has a `stroke` with a value of spaces and tabs
 * only, which mermaid.js reads as a colour that is blank and so draws no
 * colour (see `StyleListUse`, `isLinkStyle`): the name ends with `stroke`, the
 * `:` follows it at once, and nothing but spaces and tabs, at least one, lies
 * after the `:`. `text` is the style with the whitespace after it.
 */
export function hasBlankStrokeValue(text: string): boolean {
  const colon = text.indexOf(":")
  if (colon === -1) return false
  const value = text.slice(colon + 1)
  return (
    value !== "" &&
    [...value].every(isSpaceOrTab) &&
    text.slice(0, colon).endsWith("stroke")
  )
}

/**
 * Whether the text of a style ends with a backslash that escapes the next
 * character: an odd number of backslashes lie at its end (`4px\` escapes, and
 * `4px\\` does not). `text` is the style without the whitespace after it.
 */
export function endsWithEscape(text: string): boolean {
  let backslashes = 0
  while (text[text.length - 1 - backslashes] === "\\") backslashes++
  return backslashes % 2 === 1
}

/**
 * The end of the printed text of the last style of a statement whose styles
 * mermaid.js joins as they are (see `StyleListUse`, `joinsStyles`): `range` is
 * the style, and its end moves one character where a backslash that escapes
 * ends the style and a space or tab follows, since that character stays.
 */
export function endOfJoinedStyle(source: Source, range: Range): number {
  const [start, end] = range
  return isSpaceOrTab(source.text[end]) &&
    endsWithEscape(source.text.slice(start, end))
    ? end + 1
    : end
}

/**
 * The range of a style without the spaces and tabs at its ends, except a
 * space after a backslash where `keepsEscapedSpace` is set.
 */
function trimStyle(
  source: Source,
  range: Range,
  { keepsEscapedSpace = false } = {},
): Range {
  let [start, end] = range
  while (start < end && isSpaceOrTab(source.text[start])) start++
  while (end > start && isSpaceOrTab(source.text[end - 1])) {
    if (keepsEscapedSpace && source.text[end - 2] === "\\") break
    end--
  }
  return [start, end]
}

/**
 * Adds the edit that takes the whitespace before the first `:` of a style away
 * and puts one space after it, where the value is not empty. A style without
 * a name before the `:` has no whitespace before it to take away. The space
 * that a backslash before the `:` escapes stays, and the whitespace after it
 * goes: CSS reads the escaped space as part of the name. Where
 * `keepsGapAfterStroke` is set and the name ends with `stroke`, one space
 * stays before the `:` if whitespace stood there.
 */
export function addColonEdit(
  source: Source,
  [start, end]: Range,
  edits: TextEdit[],
  {
    keepsGapAfterStroke = false,
    keepsGapAfterLabelName = false,
  }: {
    readonly keepsGapAfterStroke?: boolean
    readonly keepsGapAfterLabelName?: boolean
  } = {},
): void {
  const gap = findColonGap(source.text, start, end)
  if (gap === undefined) return
  const { nameEnd, colon, valueStart } = gap
  const name = source.text.slice(start, nameEnd)
  const spaceBeforeColon =
    nameEnd < colon &&
    ((keepsGapAfterStroke && name.endsWith("stroke")) ||
      (keepsGapAfterLabelName && (name === "color" || name === "text-align")))
  edits.push({
    range: [nameEnd, valueStart],
    replacement: `${spaceBeforeColon ? " " : ""}:${valueStart < end ? " " : ""}`,
  })
}

/** Where the first `:` of a style stands, and the text around it. */
interface ColonGap {
  /**
   * The end of the name that stays: where the whitespace before the `:` that
   * goes away starts, after the space that a backslash escapes.
   */
  readonly nameEnd: number
  /** The offset of the `:`. */
  readonly colon: number
  /** The offset of the first character after the whitespace after the `:`. */
  readonly valueStart: number
}

/**
 * The first `:` of the style at `[start, end)` and the whitespace around it,
 * or undefined where the style has no `:`. A style that starts with the `:`
 * has no name before it. A backslash directly before the whitespace before the
 * `:` escapes its first space, which CSS reads as a character of the name, so
 * that space stays and the whitespace after it goes.
 */
function findColonGap(
  text: string,
  start: number,
  end: number,
): ColonGap | undefined {
  const colon = text.indexOf(":", start)
  if (colon === -1 || colon >= end) return undefined
  let valueStart = colon + 1
  while (valueStart < end && isSpaceOrTab(text[valueStart])) valueStart++
  let nameEnd = colon
  while (nameEnd > start && isSpaceOrTab(text[nameEnd - 1])) nameEnd--
  if (nameEnd === start && colon > start) return undefined
  const escapesSpace =
    nameEnd < colon && endsWithEscape(text.slice(start, nameEnd))
  return { nameEnd: escapesSpace ? nameEnd + 1 : nameEnd, colon, valueStart }
}

/**
 * The rules of a `class` statement: the names of the entities and the
 * classes are lists separated by `,` without whitespace, and the first class
 * stands after one space.
 */
export function classStatementRules(
  source: Source,
  names: readonly Node[],
  classes: readonly Node[],
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  addNameListRules(source, names, rules)
  addNameListRules(source, classes, rules)
  return rules
}

/**
 * The rules of a direction line: the text before and after, kept as written,
 * is separated from `direction` by one space where it was written apart, and
 * the value stands after one space.
 */
export function directionRules(
  source: Source,
  statement: { readonly range: Range; readonly textBefore: Node | null },
): Map<number, GapRule> {
  const keyword = expectToken(
    findStructuralToken(
      source,
      statement.textBefore?.range[1] ?? statement.range[0],
    ),
    "`direction`",
  )
  const value = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the value of a direction line",
  )
  return new Map<number, GapRule>([[value.range[0], "space"]])
}

/**
 * The rules of an `accTitle` or `accDescr` line: the `:` touches the keyword
 * and the text stands after one space.
 */
export function accessibilityRules(
  source: Source,
  statement: { readonly range: Range; readonly value: Node | null },
): Map<number, GapRule> {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  const rules = new Map<number, GapRule>([[colon.range[0], "none"]])
  if (statement.value !== null) rules.set(statement.value.range[0], "space")
  return rules
}

/**
 * The range from the `(` through the `)` around the arguments of a call, when
 * a comment or a directive stands among them; otherwise null. The whitespace
 * before the `)` is part of the arguments in the Db, and a comment line before
 * the `)` would otherwise indent it, so class and gantt print this range as
 * written (docs/class.md and docs/gantt.md, call arguments).
 */
export function findCallRangeWithTrivia(
  source: Source,
  args: Node,
): Range | null {
  const opening = expectToken(
    findStructuralTokenEndingBefore(source, args.range[0]),
    "the `(` of a call",
  )
  expectValue(opening, "(")
  const closing = expectToken(
    findStructuralToken(source, args.range[1]),
    "the `)` of a call",
  )
  expectValue(closing, ")")
  return findTriviaBetween(source, opening.range[1], closing.range[0]).length >
    0
    ? [opening.range[0], closing.range[1]]
    : null
}

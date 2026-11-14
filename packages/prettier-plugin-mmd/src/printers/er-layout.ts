import type {
  ErAttribute,
  ErEntityReference,
  ErEntityStatement,
  ErRelationshipStatement,
  ErStatement,
  ErSubgraphStatement,
  Node,
  Range,
  Token,
} from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  findKeptBreaks,
  gapKeepsLineBreak,
  holdsJoiningRegion,
  isDroppedSemicolon,
  isFirstOnItsLine,
  lineStartOf,
  spansKeptBreaks,
} from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keepFirstGapLineTails,
  keptAsWritten,
  layoutDescriptionBlock,
  spansLinesThatCannotJoin,
  toAsciiLowerCase,
} from "./layout.ts"
import {
  followsSplitKeyword,
  holdsAttributeTildeBefore,
  isDirectionBroughtToTheColon,
  isErLineKept,
} from "./er-kept-lines.ts"
import type { Source } from "./source.ts"
import { printedToken } from "./spelling.ts"
import {
  accessibilityRules,
  addClassListRules,
  classStatementRules,
  directionRules,
  printStyleUnitSpacing,
  styleStatementRules,
  styleUnitsCanCompact,
} from "./statement-rules.ts"
import {
  findStructuralToken,
  previousRead,
  findTokenEndingBefore,
  findTokensBetween,
  findTriviaBetween,
  isSpaceOrTab,
  isStructural,
} from "./source.ts"

/**
 * The node types of an ER diagram whose text is a value, printed as written:
 * the names, the keys, the strings, the texts of styles and accessibility
 * statements, and the text that mermaid.js does not read. They have no child
 * fields; `tests/value-nodes.test.ts` checks that every other such node type
 * is left out on purpose.
 */
export const erValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "ErIdentifier",
  "ErLiteral",
  "ErIgnoredText",
])

/** A statement that holds no other statement and no attribute block. */
export type ErSimpleStatement = Exclude<
  ErStatement,
  ErSubgraphStatement | ErEntityStatement
>

/** A statement, with the kind of statement it is. */
export type ClassifiedErStatement =
  | { readonly kind: "subgraph"; readonly statement: ErSubgraphStatement }
  | { readonly kind: "entity"; readonly statement: ErEntityStatement }
  | { readonly kind: "simple"; readonly statement: ErSimpleStatement }

/**
 * Which kind of statement a node is: a subgraph, whose body holds
 * statements; an entity statement, which may have a block of attributes; or
 * a statement that holds neither; null for a node that is no statement of an
 * ER diagram. The kinds are decided here only. Every statement type is
 * listed, the node of each case is checked against the type of its kind, and
 * the check after the cases fails when a statement type of the tree is not
 * listed.
 */
export function classifyErStatement(node: ErStatement): ClassifiedErStatement
export function classifyErStatement(
  node: MermaidAst,
): ClassifiedErStatement | null
export function classifyErStatement(
  node: MermaidAst,
): ClassifiedErStatement | null {
  switch (node.type) {
    case "ErSubgraphStatement":
      return { kind: "subgraph", statement: node }
    case "ErEntityStatement":
      return { kind: "entity", statement: node }
    case "ErRelationshipStatement":
    case "ErDirectionStatement":
    case "ErClassDefStatement":
    case "ErClassStatement":
    case "ErStyleStatement":
    case "ErAccTitleStatement":
    case "ErAccDescrStatement":
    case "ErAccDescrBlockStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, ErStatement>
      return null
  }
}

/**
 * Whether an entity statement is printed with its attribute block as a
 * block: the block holds an attribute or an item that mermaid.js does not
 * read, or a line break between its braces, whether it holds a comment or a
 * directive or nothing but whitespace. So an empty block over several lines is
 * a block too, and where the line of the entity stays as written, it is
 * printed as any block is: the entity stays on its line, and the `}` follows
 * the `{` with one space (see `isEmptyAttributeBlock`; docs/er.md, Attribute
 * blocks). A block without attributes on one line keeps its comments and
 * directives on that line, and is printed as one statement.
 */
export function hasAttributeBlock(
  source: Source,
  statement: ErEntityStatement,
): boolean {
  if (statement.attributes === null) return false
  if (statement.attributes.length > 0) return true
  const { opening, closing } = findAttributeBraces(source, statement)
  return source.text.slice(opening.range[1], closing.range[0]).includes("\n")
}

/**
 * Whether an entity statement has an empty attribute block over several lines
 * that stays over them. The `{ }` that it is otherwise printed as puts the `}`
 * and what follows it on the closing line on the line of the `{`, and the
 * joined line is not read as the two lines were:
 *
 * - The line rule of mermaid.js ignores the last `;` of a line that matches
 *   it, so in the joined line it can ignore another `;` than it does in each of
 *   the two lines (`spansLinesThatCannotJoin`, the one decision about joining
 *   lines; common.md, The `style` and `classDef` lines).
 * - The oldest versions that count read the text after a `~` in an attribute
 *   block with a rule that takes the longer, the longer the line is, so a line
 *   that stays as written and holds such a `~` before the `{` could become one
 *   that they do not draw (`holdsAttributeTildeBefore`).
 *
 * The statement is then printed as written (docs/er.md, Attribute blocks).
 */
export function keepsEmptyBlockLines(
  source: Source,
  statement: ErEntityStatement,
): boolean {
  if (!hasAttributeBlock(source, statement)) return false
  if (!isEmptyAttributeBlock(source, statement)) return false
  const { opening, closing } = findAttributeBraces(source, statement)
  return (
    spansLinesThatCannotJoin(source, opening.range[0], closing.range[1]) ||
    (isErLineKept(source, opening.range[0]) &&
      holdsAttributeTildeBefore(source, opening.range[0]))
  )
}

/**
 * Whether an entity statement has an attribute block whose `}` lies on a later
 * line than its `{`, after text that a joining region cuts: mermaid.js reads
 * the text up to the `{` as one line, which is printed as written, and the
 * attributes and the `}` lie outside that line, so they are printed as the
 * block of any entity, also where the entity stands after another statement on
 * the line (docs/er.md, Multi-line statements).
 */
export function isBlockAfterJoinedLine(
  source: Source,
  statement: ErEntityStatement,
): boolean {
  if (statement.attributes === null) return false
  const { opening, closing } = findAttributeBraces(source, statement)
  return (
    lineStartOf(source, closing.range[0]) !==
      lineStartOf(source, opening.range[0]) &&
    holdsJoiningRegion(
      source,
      lineStartOf(source, statement.range[0]),
      opening.range[0],
    )
  )
}

/**
 * Whether an entity statement has an empty attribute block: nothing but
 * whitespace and line breaks between its braces. Every empty block is
 * printed as `{ }`, with one space (docs/er.md, Attribute blocks).
 */
export function isEmptyAttributeBlock(
  source: Source,
  statement: ErEntityStatement,
): boolean {
  if (statement.attributes === null || statement.attributes.length > 0) {
    return false
  }
  const { opening, closing } = findAttributeBraces(source, statement)
  return (
    findTriviaBetween(source, opening.range[1], closing.range[0]).length === 0
  )
}

/**
 * The spaces and tabs before the `}` on its line in an empty attribute block
 * over several lines, or null when another character precedes it. Replacing
 * only this range aligns the `}` with the entity while keeping the rest as
 * written (docs/er.md, Attribute blocks).
 */
export function findEmptyBlockClosingIndentation(
  source: Source,
  statement: ErEntityStatement,
): Range | null {
  if (
    !hasAttributeBlock(source, statement) ||
    !isEmptyAttributeBlock(source, statement)
  ) {
    return null
  }
  const { opening, closing } = findAttributeBraces(source, statement)
  const between = source.text.slice(opening.range[1], closing.range[0])
  const indentation = between.slice(between.lastIndexOf("\n") + 1)
  return [...indentation].every(isSpaceOrTab)
    ? [closing.range[0] - indentation.length, closing.range[0]]
    : null
}

/** The `{` and the `}` of the attribute block of an entity statement. */
export function findAttributeBraces(
  source: Source,
  statement: ErEntityStatement,
): { readonly opening: Token; readonly closing: Token } {
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of an attribute block",
  )
  expectValue(closing, "}")
  const opening = expectToken(
    findTokensBetween(source, statement.range[0], closing.range[0]).find(
      (token) => isStructural(source, token) && token.value === "{",
    ),
    "the `{` of an attribute block",
  )
  return { opening, closing }
}

/**
 * Whether a unit that starts with a `-` touches the keyword before it, as in
 * `class-A a`, `subgraph-x`, and `end-x`. The lexer of the pinned version ends a
 * keyword at a `-`, so these are `class` and the id `-A`, and so on; a version
 * that counts reads `class-A` as one name and rejects `class -A a`, and some
 * read `subgraph-x` and `end-x` as entities and draw them differently from
 * `subgraph -x` and `end` with `-x`, so no space is set between them (the
 * statements `class`, `subgraph`, and `end` only: no version tells `classDef-x`
 * from `classDef -x`; docs/compatibility.md, Forms kept for versions of
 * mermaid.js that count; docs/er.md, Whitespace between tokens).
 */
export function touchesKeywordWithDash(source: Source, start: number): boolean {
  if (source.text[start] !== "-") return false
  const keywordEnd = previousRead(source, start) + 1
  const before = findTokenEndingBefore(source, keywordEnd)
  return before?.type === "Keyword" && before.range[1] === keywordEnd
}

/** Sets no gap before the units that `touchesKeywordWithDash` finds. */
function keepKeywordDashTouching(
  source: Source,
  atoms: readonly Atom[],
  rules: Map<number, GapRule>,
): void {
  for (const atom of atoms) {
    if (touchesKeywordWithDash(source, atom.start))
      rules.set(atom.start, "none")
  }
}

/**
 * The layout of the line that opens a subgraph: its keyword, name, and title
 * with its brackets, up to the end of the title or of the name. The empty
 * description blocks that may follow stand on the line as statements of the
 * body (see `findErKeptLines`).
 *
 * The name stands after one space, the `[` of the title touches it, with
 * nothing inside its brackets, and its names are separated by one space,
 * written touching or not: mermaid.js joins them with one space
 * (docs/er.md, Subgraphs).
 */
export function layoutSubgraphOpening(
  source: Source,
  statement: ErSubgraphStatement,
  end: number,
): AtomLayout {
  if (holdsJoiningRegion(source, statement.range[0], end)) {
    // A comment line cuts in, after a U+2028 or U+2029, and the line goes on
    // after it. The line is kept as written (docs/compatibility.md, A
    // comment line after U+2028 or U+2029).
    return keptAsWritten(statement.range[0], end)
  }
  // The keyword and a name that a whitespace character that is no space or
  // tab (a U+2028, a U+2029, a U+00A0, ...) or a character outside ASCII
  // separates from it are one name to a version that counts, so no space is
  // set between them (docs/er.md, Subgraphs).
  const rules = new Map<number, GapRule>([
    [
      statement.id.range[0],
      followsSplitKeyword(source, statement.id.range[0]) ? "none" : "space",
    ],
  ])
  if (statement.title !== null) {
    const opening = expectToken(
      findStructuralToken(source, statement.id.range[1]),
      "the `[` of a subgraph title",
    )
    expectValue(opening, "[")
    rules.set(opening.range[0], "none")
    for (const [index, name] of statement.title.entries()) {
      rules.set(name.range[0], index === 0 ? "none" : "space")
    }
    const closing = expectToken(
      findStructuralToken(source, statement.title.at(-1)?.range[1] ?? end),
      "the `]` of a subgraph title",
    )
    expectValue(closing, "]")
    rules.set(closing.range[0], "none")
  }
  const atoms = collectAtoms(
    source,
    statement.range[0],
    end,
    collectValueNodes(statement, erValueNodeTypes).filter(
      (value) => value.range[1] <= end,
    ),
    [],
  )
  keepKeywordDashTouching(source, atoms, rules)
  return {
    atoms,
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
    writtenGapsBefore: ignoredKeywordGaps(source, atoms),
  }
}

/**
 * The gap after `class` or `subgraph` when it holds an ignored `;`.
 * The line rule removes that character before the lexer tests the keyword
 * boundary, so the whole gap keeps its contacts (diagrams/er.md, The
 * statement context; docs/er.md, Statements one per line).
 */
function ignoredKeywordGaps(
  source: Source,
  atoms: readonly Atom[],
): ReadonlySet<number> {
  const [keyword, name] = atoms
  if (keyword === undefined || name === undefined) return new Set()
  return findTokensBetween(source, keyword.end, name.start).some((token) =>
    source.ignoredSemicolons.has(token.range[0]),
  )
    ? new Set([name.start])
    : new Set()
}

/**
 * Where the line that opens a subgraph ends: at its title, or at its name.
 * The body of the subgraph starts there.
 */
export function findSubgraphHeaderEnd(
  source: Source,
  statement: ErSubgraphStatement,
): number {
  if (statement.title === null) return statement.id.range[1]
  const closing = expectToken(
    findStructuralToken(source, statement.title.at(-1)?.range[1] ?? 0),
    "the `]` of a subgraph title",
  )
  expectValue(closing, "]")
  return closing.range[1]
}

/**
 * The layout of the line that opens an attribute block, from the start of
 * the entity statement to the end of its `{`: its name, alias, and classes.
 * One space stands before the `{` (docs/er.md, Attribute blocks).
 */
export function layoutBlockOpening(
  source: Source,
  statement: ErEntityStatement,
  opening: Token,
): AtomLayout {
  if (
    holdsJoiningRegion(
      source,
      lineStartOf(source, statement.range[0]),
      opening.range[1],
    )
  ) {
    return keptAsWritten(statement.range[0], opening.range[1])
  }
  const rules = entityHeaderRules(source, statement)
  rules.set(opening.range[0], "space")
  return {
    atoms: collectAtoms(
      source,
      statement.range[0],
      opening.range[1],
      collectValueNodes(statement, erValueNodeTypes).filter(
        (value) => value.range[1] <= opening.range[0],
      ),
      [],
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of a statement that is printed on one line, from its start to
 * `end` (the end of its range): a statement that holds no other, and an
 * entity statement without an attribute block (see `hasAttributeBlock`).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace, which it does only after the
 *   `:` of `accTitle` and `accDescr`, between `direction` and its value, and
 *   inside the statements of the style context (diagrams/er.md, The
 *   statement context); comments and directives keep line breaks while
 *   structural continuations align. The lines of an `accDescr`
 *   block keep their line breaks and align one level inside the statement,
 *   except inside subgraphs, where raw text also supplies membership
 *   (docs/er.md, Multi-line values).
 * - A relationship has one space around its three units and its `:`
 *   (docs/er.md, Relationship spacing).
 * - The classes after `:::` and in the lists of `class`, `classDef`, and
 *   `style` statements are separated by `,` without whitespace
 *   (docs/er.md, Entities and Styles and classes).
 */
export function layoutErStatement(
  source: Source,
  statement: ErSimpleStatement | ErEntityStatement,
  end: number,
  preservesDescriptionColumns: boolean,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "ErAccDescrBlockStatement") {
    return layoutDescriptionBlock(source, statement, end, erValueNodeTypes, {
      preservesBodyColumns: preservesDescriptionColumns,
    })
  }
  const keptBreaks = findKeptBreaks(source, start, end)
  const keepsLineBreaks = spansKeptBreaks(source, keptBreaks, start, end)
  if (keepsLineBreaks && holdsJoiningRegion(source, start, end)) {
    return keptAsWritten(start, end)
  }
  // The text of a statement that is brought to its `:` makes a direction line
  // when the statement does not start its line, where it is read as a title
  // at the first column (see `isDirectionBroughtToTheColon`): the statement
  // stays as written then.
  if (
    isDirectionBroughtToTheColon(source, statement) &&
    !isFirstOnItsLine(source, start)
  ) {
    return keptAsWritten(start, end)
  }
  const kept = findKeptStretches(source, statement)
  // A statement with a kept line break keeps its styles as written: printing
  // them changes whether joining its lines is safe, so a second pass would
  // join them.
  const styles =
    (statement.type === "ErStyleStatement" ||
      statement.type === "ErClassDefStatement") &&
    !keepsLineBreaks &&
    styleUnitsCanCompact(source, start, end, statement.styles)
      ? statement.styles
      : []
  for (const style of styles)
    kept.push({
      start: style.range[0],
      end: style.range[1],
      doc: printStyleUnitSpacing(source, style),
    })
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, erValueNodeTypes),
    kept,
  )
  const rules = statementRules(source, statement, styles.length > 0)
  if (statement.type === "ErClassStatement")
    keepKeywordDashTouching(source, atoms, rules)
  return {
    atoms: keepFirstGapLineTails(source, atoms, (from, to) =>
      gapKeepsLineBreak(source, keptBreaks, from, to),
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
    writtenGapsBefore:
      statement.type === "ErClassStatement"
        ? ignoredKeywordGaps(source, atoms)
        : undefined,
  }
}

/**
 * The stretches of a statement that are printed as written: the `;` that
 * ends a `classDef` or `style` statement, with what lies before it, and the
 * whitespace between the entity `only` and a cardinality `one`.
 */
function findKeptStretches(
  source: Source,
  statement: ErSimpleStatement | ErEntityStatement,
): Atom[] {
  switch (statement.type) {
    case "ErRelationshipStatement":
      return findOnlyOneStretches(source, statement)
    case "ErClassDefStatement":
    case "ErStyleStatement":
      return findEndingSemicolonStretches(source, statement)
    default:
      return []
  }
}

/**
 * The `;` that ends a `classDef` or `style` statement, after the last
 * style, as written: it is in the range of the statement, and no token of
 * the structure of the statement (docs/er.md, Styles and classes). The `;`
 * that the line rule ignores lies outside the statement.
 */
function findEndingSemicolonStretches(
  source: Source,
  statement: Extract<
    ErSimpleStatement,
    { type: "ErClassDefStatement" | "ErStyleStatement" }
  >,
): Atom[] {
  const last = findTokenEndingBefore(source, statement.range[1])
  if (last?.value !== ";" || isDroppedSemicolon(source, last.range[0]))
    return []
  return [
    {
      start: statement.styles.at(-1)?.range[1] ?? last.range[0],
      end: statement.range[1],
    },
  ]
}

/**
 * The layout of an attribute: its type, `?`, name, keys, and comment on one
 * line (docs/er.md, Attribute spacing). Comments and directives keep the line
 * breaks, while structural gaps still take continuation indentation. Joining
 * regions and textual semicolon boundaries retain their complete source.
 */
export function layoutAttribute(
  source: Source,
  attribute: ErAttribute,
): AtomLayout {
  const [start, end] = attribute.range
  const keptBreaks = findKeptBreaks(source, start, end)
  if (
    spansKeptBreaks(source, keptBreaks, start, end) &&
    holdsJoiningRegion(source, start, end)
  ) {
    return keptAsWritten(start, end)
  }
  const rules = new Map<number, GapRule>([[attribute.name.range[0], "space"]])
  for (const token of findTokensBetween(source, start, end)) {
    if (isStructural(source, token) && token.value === "?") {
      rules.set(token.range[0], "none")
    }
  }
  for (const [index, key] of attribute.keys.entries()) {
    rules.set(key.range[0], "space")
    const comma = findStructuralTokenBefore(source, key.range[0], start)
    if (index > 0 && comma?.value === ",") rules.set(comma.range[0], "none")
  }
  if (attribute.comment !== null) {
    rules.set(attribute.comment.range[0], "space")
  }
  return {
    atoms: keepFirstGapLineTails(
      source,
      collectAtoms(
        source,
        start,
        end,
        collectValueNodes(attribute, erValueNodeTypes),
        [],
      ),
      (from, to) => gapKeepsLineBreak(source, keptBreaks, from, to),
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * The last structural token that ends at or before `offset` and starts at or
 * after `lowerBound`, or undefined.
 */
function findStructuralTokenBefore(
  source: Source,
  offset: number,
  lowerBound: number,
): Token | undefined {
  return findTokensBetween(source, lowerBound, offset)
    .filter((token) => isStructural(source, token))
    .at(-1)
}

/** The gap rules of a statement. */
function statementRules(
  source: Source,
  statement: ErSimpleStatement | ErEntityStatement,
  compactStyles = false,
): Map<number, GapRule> {
  switch (statement.type) {
    case "ErEntityStatement": {
      const rules = entityHeaderRules(source, statement)
      if (statement.attributes !== null) {
        // An empty attribute block, or one with a comment or a directive on
        // a line (see `hasAttributeBlock`).
        const { opening, closing } = findAttributeBraces(source, statement)
        rules.set(opening.range[0], "space")
        if (isEmptyAttributeBlock(source, statement)) {
          rules.set(closing.range[0], "space")
        }
      }
      return rules
    }
    case "ErRelationshipStatement":
      return relationshipRules(source, statement)
    case "ErDirectionStatement":
      return directionRules(source, statement)
    case "ErClassDefStatement":
      return styleStatementRules(
        source,
        statement.cssClasses,
        statement.styles,
        compactStyles,
      )
    case "ErStyleStatement":
      return styleStatementRules(
        source,
        statement.entities,
        statement.styles,
        compactStyles,
      )
    case "ErClassStatement":
      return classStatementRules(
        source,
        statement.entities,
        statement.cssClasses,
      )
    case "ErAccTitleStatement":
    case "ErAccDescrStatement":
      return accessibilityRules(source, statement)
    case "ErAccDescrBlockStatement":
      return new Map()
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/**
 * The rules of the name, alias, and classes of an entity statement: the alias stands touching the name, with nothing inside its
 * brackets, and the classes touch their `:::` and the `,` between them
 * (docs/er.md, Entities).
 */
function entityHeaderRules(
  source: Source,
  statement: ErEntityStatement,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  const { alias } = statement
  if (alias !== null) {
    const opening = expectToken(
      findStructuralToken(source, statement.name.range[1]),
      "the `[` of an alias",
    )
    expectValue(opening, "[")
    const closing = expectToken(
      findStructuralToken(source, alias.range[1]),
      "the `]` of an alias",
    )
    expectValue(closing, "]")
    rules.set(opening.range[0], "none")
    rules.set(alias.range[0], "none")
    rules.set(closing.range[0], "none")
  }
  addClassListRules(
    source,
    statement.cssClasses,
    alias?.range[1] ?? statement.name.range[1],
    rules,
  )
  return rules
}

/**
 * The spellings of a cardinality or of a relationship line that are made of
 * symbols, in lower case. A unit spelled with letters is separated from the
 * units next to it by a space; the symbols touch (docs/er.md, Relationship
 * spacing). `many(0)` and `many(1)` hold letters, but a space inside them
 * would make the input rejected, and `u` is the cardinality `md-parent`,
 * which touches the line (`u--`) and the right entity (`u-B`).
 */
const symbolSpellings: ReadonlySet<string> = new Set([
  "|o",
  "}o",
  "}|",
  "||",
  "o|",
  "o{",
  "|{",
  "1+",
  "0+",
  "1",
  "many(0)",
  "many(1)",
  "u",
  "..",
  "--",
  ".-",
  "-.",
])

/** Whether a unit of a relationship is printed with symbols. */
function isSymbolSpelling(source: Source, unit: Token): boolean {
  return symbolSpellings.has(toAsciiLowerCase(printedToken(source, unit)))
}

/**
 * The rules of a relationship: one space between the left entity and the
 * relationship, between the relationship and the right entity, and around
 * the `:` of the role; the three units of the relationship touch each other
 * where both are symbols and are otherwise separated by one space; the right
 * entity touches a cardinality `u`, which is read as `md-parent` only
 * directly before the name (docs/er.md, Relationship spacing).
 */
function relationshipRules(
  source: Source,
  statement: ErRelationshipStatement,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  addReferenceRules(source, statement.left, rules)
  addReferenceRules(source, statement.right, rules)
  const units = findRelationshipUnits(source, statement)
  for (const [index, unit] of units.entries()) {
    const previous = units[index - 1]
    rules.set(
      unit.range[0],
      previous === undefined ||
        !isSymbolSpelling(source, previous) ||
        !isSymbolSpelling(source, unit)
        ? "space"
        : "none",
    )
  }
  if (
    isBareOne(statement.left) &&
    startsLikeWord(printedToken(source, units[0]))
  ) {
    // `1`, whitespace, and a letter, a digit, or `_` is the cardinality
    // `only-one` and a name (diagrams/er.md, The cardinalities, numbers, and
    // relationship lines, rule 11), so a `1a` that was written touching, the
    // entity `1` and a unit, stays touching.
    rules.set(units[0].range[0], "none")
  }
  rules.set(
    statement.right.range[0],
    toAsciiLowerCase(units[2].value) === "u" ? "none" : "space",
  )
  const colon = expectToken(
    findStructuralToken(source, statement.right.range[1]),
    "the `:` of a relationship",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "space")
  rules.set(statement.role.range[0], "space")
  return rules
}

/** The three units of a relationship: a cardinality, a line, and a cardinality. */
function findRelationshipUnits(
  source: Source,
  statement: ErRelationshipStatement,
): readonly [Token, Token, Token] {
  const units = findTokensBetween(
    source,
    statement.relationship.range[0],
    statement.relationship.range[1],
  ).filter((token) => isStructural(source, token))
  const [first, line, last] = units
  if (units.length !== 3) {
    throw new Error(
      `prettier-plugin-mmd: the relationship at offset ${statement.relationship.range[0]} has ${units.length} units, not 3`,
    )
  }
  return [first, line, last]
}

/** Whether the entity of a relationship is the name `1` with no classes. */
function isBareOne(reference: ErEntityReference): boolean {
  return (
    reference.cssClasses.length === 0 &&
    reference.name.type === "ErIdentifier" &&
    reference.name.name === "1"
  )
}

/** Whether a text starts with an ASCII letter, an ASCII digit, or `_`. */
function startsLikeWord(text: string): boolean {
  const first = text[0]
  return (
    (first >= "a" && first <= "z") ||
    (first >= "A" && first <= "Z") ||
    (first >= "0" && first <= "9") ||
    first === "_"
  )
}

/**
 * The stretch from the entity `only` to a first unit that starts with
 * `one`, as written: `only one` with exactly one space is the cardinality
 * `only one`, while `only`, two spaces or a tab, and `one to one` are an
 * entity and a relationship (diagrams/er.md, The statement context,
 * keywords and what follows them), so the whitespace between them is kept
 * as written (docs/er.md, Relationship spacing). A unit that is printed as
 * symbols starts with no `one`, and the whitespace before it is an ordinary
 * gap.
 */
function findOnlyOneStretches(
  source: Source,
  statement: ErRelationshipStatement,
): Atom[] {
  const { left } = statement
  const [first] = findRelationshipUnits(source, statement)
  if (
    left.cssClasses.length !== 0 ||
    left.name.type !== "ErIdentifier" ||
    toAsciiLowerCase(left.name.name) !== "only" ||
    !toAsciiLowerCase(printedToken(source, first)).startsWith("one")
  ) {
    return []
  }
  return [{ start: left.name.range[0], end: first.range[1] }]
}

/** Adds the rules of the classes of an end of a relationship. */
function addReferenceRules(
  source: Source,
  reference: ErEntityReference,
  rules: Map<number, GapRule>,
): void {
  addClassListRules(
    source,
    reference.cssClasses,
    reference.name.range[1],
    rules,
  )
}

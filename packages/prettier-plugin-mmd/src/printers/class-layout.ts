import type {
  ClassDeclaration,
  ClassName,
  ClassNamespaceStatement,
  ClassRelationStatement,
  ClassStatement,
  Node,
  StringLiteral,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { holdsDirection } from "./accessibility-lines.ts"
import { findWrittenWhitespaceEnd } from "./gap.ts"
import { findClassSemicolonLines } from "./class-kept-lines.ts"
import { holdsJoiningRegion, lineStartOf } from "./kept-lines.ts"
import { findOpenString } from "./lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  spansLinesThatCannotJoin,
  walk,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokenEndingBefore,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"

/**
 * The node types of a class diagram whose text is a value, printed as
 * written: the shared leaf nodes other than `Identifier`, of which no class
 * statement holds a `NumericLiteral` yet, and the leaf nodes of the diagram
 * type other than `ClassIdentifier`. An `Identifier` and a `ClassIdentifier`
 * are printed as their tokens instead, since a class name of several name
 * parts is one `ClassIdentifier` over the whitespace between them
 * (docs/class.md, Whitespace between tokens). They have no child fields;
 * `tests/value-nodes.test.ts` checks that every other such node type is left
 * out on purpose.
 */
export const classValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "NumericLiteral",
  "ClassLiteral",
  "ClassIgnoredText",
])

/** A statement that holds no other statement and no member body. */
export type ClassSimpleStatement = Exclude<
  ClassStatement,
  ClassNamespaceStatement | ClassDeclaration
>

/** A statement, with the kind of statement it is. */
export type ClassifiedClassStatement =
  | { readonly kind: "namespace"; readonly statement: ClassNamespaceStatement }
  | { readonly kind: "declaration"; readonly statement: ClassDeclaration }
  | { readonly kind: "simple"; readonly statement: ClassSimpleStatement }

/**
 * Which kind of statement a node is: a namespace, whose body holds
 * statements; a class statement, which may have a body of member lines; or
 * a statement that holds neither; null for a node that is no statement of a
 * class diagram. The kinds are decided here only. Every statement type is
 * listed, the node of each case is checked against the type of its kind,
 * and the check after the cases fails when a statement type of the tree is
 * not listed.
 */
export function classifyClassStatement(
  node: ClassStatement,
): ClassifiedClassStatement
export function classifyClassStatement(
  node: MermaidAst,
): ClassifiedClassStatement | null
export function classifyClassStatement(
  node: MermaidAst,
): ClassifiedClassStatement | null {
  switch (node.type) {
    case "ClassNamespaceStatement":
      return { kind: "namespace", statement: node }
    case "ClassDeclaration":
      return { kind: "declaration", statement: node }
    case "ClassMemberStatement":
    case "ClassNameStatement":
    case "ClassAnnotationStatement":
    case "ClassRelationStatement":
    case "ClassNoteStatement":
    case "ClassCallbackStatement":
    case "ClassLinkStatement":
    case "ClassStyleStatement":
    case "ClassCssClassStatement":
    case "ClassClassDefStatement":
    case "ClassDirectionStatement":
    case "ClassAccTitleStatement":
    case "ClassAccDescrStatement":
    case "ClassAccDescrBlockStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, ClassStatement>
      return null
  }
}

/**
 * Whether a class statement is printed with its member body as a block: the
 * body holds a member line, or a comment or a directive between braces on
 * different lines. An empty body, with nothing but whitespace between its
 * braces, is printed as `{ }` on the line of the class (see
 * `isEmptyMemberBody`), and a body without members on one line keeps its
 * comments and directives on that line (docs/class.md, Member bodies).
 */
export function hasMemberBlock(
  source: Source,
  statement: ClassDeclaration,
): boolean {
  if (statement.members === null) return false
  if (statement.members.length > 0) return true
  if (isEmptyMemberBody(source, statement)) return false
  const { opening, closing } = findMemberBraces(source, statement)
  return source.text.slice(opening.range[1], closing.range[0]).includes("\n")
}

/**
 * Whether a class statement has an empty member body: nothing but
 * whitespace and line breaks between its braces. Every empty body is
 * printed as `{ }`, with one space (docs/class.md, Member bodies): `{}`,
 * `{   }`, and braces on different lines all declare the class without
 * members, and after a CSS class, where `class C:::c {}` is rejected, the
 * body needs a member line, which a line of only whitespace is, so `{ }`
 * is accepted there too.
 */
export function isEmptyMemberBody(
  source: Source,
  statement: ClassDeclaration,
): boolean {
  if (statement.members === null || statement.members.length > 0) return false
  const { opening, closing } = findMemberBraces(source, statement)
  return (
    findTriviaBetween(source, opening.range[1], closing.range[0]).length === 0
  )
}

/** The `{` and the `}` of the member body of a class statement. */
export function findMemberBraces(
  source: Source,
  statement: ClassDeclaration,
): { readonly opening: Token; readonly closing: Token } {
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of a member body",
  )
  expectValue(closing, "}")
  const before = statement.members?.at(0)?.range[0] ?? closing.range[0]
  const opening = expectToken(
    findTokensBetween(source, statement.range[0], before)
      .filter((token) => isStructural(source, token) && token.value === "{")
      .at(-1),
    "the `{` of a member body",
  )
  return { opening, closing }
}

/** The layout of the header line: the keyword `classDiagram`. */
export function layoutClassHeader(source: Source, keyword: Token): AtomLayout {
  return {
    atoms: collectAtoms(source, keyword.range[0], keyword.range[1], [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of the line that opens a block, from `start` to the end of its
 * `{`: a namespace with its name and label, or a class statement with its
 * name, label, CSS class or annotation. One space stands before the `{`
 * (docs/class.md, Member bodies and Indentation).
 */
export function layoutBlockOpening(
  source: Source,
  statement: ClassNamespaceStatement | ClassDeclaration,
  opening: Token,
): AtomLayout {
  if (holdsJoiningRegion(source, statement.range[0], opening.range[1])) {
    // A comment line cuts in, after a U+2028 or U+2029, and the line goes on
    // after it: `namespace N`, U+2028, `%% e`, and a line ` {` is the
    // namespace with its `{`. The line is kept as written
    // (docs/compatibility.md, A comment line after U+2028 or U+2029).
    return {
      atoms: [{ start: statement.range[0], end: opening.range[1] }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "kept",
    }
  }
  const rules = new Map<number, GapRule>([[opening.range[0], "space"]])
  return {
    atoms: collectAtoms(
      source,
      statement.range[0],
      opening.range[1],
      collectValueNodes(statement, classValueNodeTypes).filter(
        (value) => value.range[1] <= opening.range[0],
      ),
      findGenericStretches(source, statement, opening.range[0]),
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of a statement that is printed on one line, from its start to
 * `end` (see `findClassPrintedEnd`): a statement that holds no other, and
 * a class statement without a member block (see `hasMemberBlock`).
 *
 * - An ordinary statement written over several lines stands on one line; a
 *   next-line accessibility value that would become a direction line keeps
 *   its break. A line
 *   break inside a statement is whitespace to the lexer only after
 *   `direction` and after the `:` of `accTitle` and `accDescr`
 *   (diagrams/class.md, The statement context); one with a comment or a
 *   directive in it is kept as written (see `spansLinesThatCannotJoin`). The
 *   lines of an `accDescr { ... }` block are lines of its text, and are
 *   kept (docs/class.md, Multi-line values).
 * - A relation has one space on each side of its arrow and of its
 *   cardinalities, and the tokens of its arrow touch (docs/class.md, Arrow
 *   spacing).
 * - The `:` of a label has one space on each side; a label of only
 *   whitespace keeps the whitespace after its `:` (docs/class.md, Labels).
 * - A member line is kept as written (docs/class.md, Member lines), and so
 *   is a generic type, from its first `~` to its second (docs/class.md,
 *   Generic types).
 */
export function layoutClassStatement(
  source: Source,
  statement: ClassSimpleStatement | ClassDeclaration,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (
    statement.type !== "ClassAccDescrBlockStatement" &&
    spansLinesThatCannotJoin(source, start, end)
  ) {
    return {
      atoms: [{ start, end }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "kept",
    }
  }
  const values = collectValueNodes(statement, classValueNodeTypes)
  if (statement.type === "ClassAccDescrBlockStatement") {
    // A description block of a class diagram is always closed: one that is
    // not is rejected (diagrams/class.md, Units and contexts).
    const block = {
      range: statement.range,
      value: statement.value,
      closed: true,
    }
    const closing = findAccDescrBlockClosing(source, block)
    return {
      atoms: collectAtoms(
        source,
        start,
        end,
        values,
        findAccDescrBlockStretches(source, block),
      ),
      rules: new Map(),
      outdented: closing === null ? new Set() : new Set([closing]),
      lineBreaks: "kept",
    }
  }
  const kept = [
    ...findGenericStretches(source, statement, end),
    ...findMemberStretches(statement),
    ...findBlankLabelStretches(source, statement),
    ...findOpenNameStretches(source, statement),
  ]
  // Joining a next-line accessibility value can expose class's greedy,
  // case-sensitive direction rule. Keep the previous continuation layout;
  // TD is value text, not a class direction (diagrams/class.md, The direction
  // line; docs/class.md, Multi-line statements).
  const keepsDirectionValue =
    (statement.type === "ClassAccTitleStatement" ||
      statement.type === "ClassAccDescrStatement") &&
    source.text.slice(start, statement.value.range[0]).includes("\n") &&
    holdsDirection(
      source,
      { range: statement.range, text: statement.value.value },
      { caseSensitive: true },
    )
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      values.filter(
        (value) => !kept.some((stretch) => containsRange(stretch, value)),
      ),
      kept,
    ),
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks: keepsDirectionValue ? "kept" : "joined",
  }
}

/**
 * Where the printed text of a statement ends: at its last token, except
 * for a label of only whitespace, whose whitespace after the `:` is printed
 * as written (see `findBlankLabelColon`), and for a backquoted name that is
 * not closed, which runs to the end of the text (see
 * `findOpenString`).
 */
export function findClassPrintedEnd(
  source: Source,
  statement: ClassStatement,
): number {
  if (findOpenNameIn(source, statement) !== null) return source.text.length
  const colon = findBlankLabelColon(source, statement)
  if (colon === null) return statement.range[1]
  return findWrittenWhitespaceEnd(source, colon.range[1])
}

/**
 * The unclosed backquoted name at the end of the text, when it lies in a
 * statement, or null.
 */
function findOpenNameIn(source: Source, statement: Node): StringLiteral | null {
  const open = findOpenString(source)
  if (
    open === null ||
    open.range[0] < statement.range[0] ||
    open.range[1] > statement.range[1]
  ) {
    return null
  }
  return open
}

/**
 * The stretch of an unclosed backquoted name, from its backquote to the end
 * of the text, as written (see `findOpenString`).
 */
function findOpenNameStretches(source: Source, statement: Node): Atom[] {
  const open = findOpenNameIn(source, statement)
  if (open === null) return []
  return [{ start: open.range[0], end: source.text.length }]
}

/**
 * The `:` of a label of only whitespace, or null. Such a label has a
 * meaning of its own: `A --> B : ` gives the relation an empty title, which
 * `A --> B` does not have, and `A : ` adds the class A, while `A :` is
 * rejected, since a label needs a character after its `:`
 * (diagrams/class.md, The shared rules and Building the summary). The tree
 * has the `:` token and no text (ast/class.md, ClassRelationStatement and
 * ClassMemberStatement).
 */
function findBlankLabelColon(
  source: Source,
  statement: ClassStatement,
): Token | null {
  if (statement.type === "ClassRelationStatement") {
    if (statement.label !== null) return null
    return findColonAfter(source, statement.to, statement.range[1])
  }
  if (statement.type === "ClassMemberStatement") {
    if (statement.member !== null) return null
    return findColonAfter(source, statement.class, statement.range[1])
  }
  return null
}

/** The `:` token right after a class name within a statement, or null. */
function findColonAfter(
  source: Source,
  name: ClassName,
  end: number,
): Token | null {
  const token = findStructuralToken(source, name.range[1])
  if (token === undefined || token.range[0] >= end) return null
  return token.value === ":" ? token : null
}

/**
 * The stretch of a label of only whitespace: its `:` and the whitespace
 * after it, as written (see `findBlankLabelColon`).
 */
function findBlankLabelStretches(source: Source, statement: Node): Atom[] {
  if (
    statement.type !== "ClassRelationStatement" &&
    statement.type !== "ClassMemberStatement"
  ) {
    return []
  }
  const colon = findBlankLabelColon(source, statement)
  if (colon === null) return []
  return [
    {
      start: colon.range[0],
      end: findWrittenWhitespaceEnd(source, colon.range[1]),
    },
  ]
}

/**
 * The member lines of a statement, each printed as written: the member of
 * a member statement. The whitespace after a visibility mark is part of
 * the member's name in the Db (diagrams/class.md, Building the summary):
 * `+ foo()` has the name ` foo`, and `+foo()` the name `foo`.
 */
function findMemberStretches(statement: Node): Atom[] {
  if (statement.type !== "ClassMemberStatement" || statement.member === null) {
    return []
  }
  const { range } = statement.member
  return [{ start: range[0], end: range[1] }]
}

/**
 * The generic types of the class names of a node before `end`, each from
 * its first `~` to its second, as written: the whitespace between the two
 * `~` is part of the type in the Db (diagrams/class.md, Building the
 * summary), and it is the value of `generic`, the whole `generic-text` unit
 * (ast/class.md, ClassName). The `~` are the structural tokens before and
 * after it: directives and a `;` that the line rule ignores may lie between
 * it and them. A name with the two `~` and nothing between them has no
 * generic and nothing to keep.
 */
function findGenericStretches(source: Source, node: Node, end: number): Atom[] {
  const stretches: Atom[] = []
  walk(node, (child) => {
    if (child.type !== "ClassName" || child.range[1] > end) return
    const { generic } = child
    if (generic === null) return
    const opening = findStructuralTokenEndingBefore(source, generic.range[0])
    const closing = findStructuralToken(source, generic.range[1])
    if (opening?.value !== "~" || closing?.value !== "~") {
      throw new Error(
        `prettier-plugin-mmd: the generic type at offset ${generic.range[0]} is not between two "~"`,
      )
    }
    stretches.push({ start: opening.range[0], end: closing.range[1] })
  })
  return stretches
}

/** Whether a stretch contains the range of a node. */
function containsRange(stretch: Atom, node: Node): boolean {
  return stretch.start <= node.range[0] && node.range[1] <= stretch.end
}

/** The gap rules of a statement. */
function statementRules(
  source: Source,
  statement: ClassSimpleStatement | ClassDeclaration,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  switch (statement.type) {
    case "ClassRelationStatement":
      addRelationRules(source, statement, rules)
      break
    case "ClassMemberStatement":
      addLabelRules(source, statement.class, statement.member, rules)
      break
    case "ClassAccTitleStatement":
    case "ClassAccDescrStatement":
      addAccessibilityColonRules(source, statement, rules)
      break
    case "ClassDeclaration":
      if (statement.members !== null) {
        const { opening, closing } = findMemberBraces(source, statement)
        rules.set(
          opening.range[0],
          spaceAfterName(source, statement.name, opening.range[0]),
        )
        if (isEmptyMemberBody(source, statement)) {
          rules.set(closing.range[0], "space")
        }
      }
      break
    default:
      break
  }
  return rules
}

/**
 * Adds the rules of a relation: one space before and after its arrow and
 * each cardinality, none between the tokens of its arrow (docs/class.md,
 * Arrow spacing), and the rules of its label.
 */
function addRelationRules(
  source: Source,
  statement: ClassRelationStatement,
  rules: Map<number, GapRule>,
): void {
  const { fromCardinality, arrow, toCardinality, to } = statement
  if (fromCardinality !== null) {
    rules.set(
      fromCardinality.range[0],
      spaceAfterName(source, statement.from, fromCardinality.range[0]),
    )
  }
  const arrowTokens = findTokensBetween(
    source,
    arrow.range[0],
    arrow.range[1],
  ).filter((token) => isStructural(source, token))
  for (const [index, token] of arrowTokens.entries()) {
    rules.set(
      token.range[0],
      index === 0 && fromCardinality === null
        ? spaceAfterName(source, statement.from, token.range[0])
        : index === 0
          ? "space"
          : "none",
    )
  }
  if (toCardinality !== null) rules.set(toCardinality.range[0], "space")
  rules.set(to.range[0], "space")
  addLabelRules(source, to, statement.label, rules)
}

/**
 * The rule for the gap before a token that follows a class name: one space,
 * except that a token that touches a name ending with the word `call` stays
 * touching, where `call` starts a unit: not inside an ASCII word, but after a
 * `-`, a `.`, or a letter that is not ASCII. `call` followed by whitespace is a keyword that the lexer reads
 * where a unit starts (diagrams/class.md, the statement context, rule 10), so
 * `A call()--> B` with a space before the arrow would be a callback.
 */
function spaceAfterName(
  source: Source,
  name: ClassName,
  token: number,
): GapRule {
  if (token !== name.range[1]) return "space"
  const text = source.text.slice(...name.range)
  const before = text.at(-"call".length - 1)
  const endsWithCall =
    text.endsWith("call") && (before === undefined || !isWordCharacter(before))
  return endsWithCall ? "none" : "space"
}

/**
 * Whether a character is one of those that the lexer reads as a word, which
 * `call` does not start inside of: an ASCII letter, an ASCII digit, or `_`
 * (diagrams/class.md, The shared rules, rule 12). After any other character,
 * a `-`, a `.`, a letter that is not ASCII, or whitespace, a unit starts.
 */
function isWordCharacter(character: string): boolean {
  return (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    (character >= "0" && character <= "9") ||
    character === "_"
  )
}

/**
 * Adds the rules of the label after a class name: one space on each side
 * of its `:` (docs/class.md, Labels). A label of only whitespace is a kept
 * stretch (see `findBlankLabelStretches`).
 *
 * On a line that holds a `;`, whether whitespace follows the `:` is kept as
 * written. The line rule (common.md, `style` and `classDef` lines) ignores
 * the last `;` of a line where a `:` is followed by text without whitespace
 * up to a `#`, after the text `style`: `styleA fill:#f00;` is the member
 * `#f00` of the class `styleAfill`, while in `styleA fill: #f00;` the rule
 * does not match, and the `;` is part of the member.
 */
function addLabelRules(
  source: Source,
  name: ClassName,
  text: Node | null,
  rules: Map<number, GapRule>,
): void {
  if (text === null) return
  const colon = findStructuralToken(source, name.range[1])
  if (colon?.value !== ":" || colon.range[0] >= text.range[0]) return
  rules.set(colon.range[0], spaceAfterName(source, name, colon.range[0]))
  const semicolonLines = findClassSemicolonLines(source)
  if (semicolonLines.has(lineStartOf(source, colon.range[0]))) return
  rules.set(text.range[0], "space")
}

/**
 * Adds the rules of the `:` after `accTitle` and `accDescr`: it touches the
 * keyword and has one space after it (docs/class.md, Labels).
 */
function addAccessibilityColonRules(
  source: Source,
  statement: Extract<
    ClassSimpleStatement,
    { type: "ClassAccTitleStatement" | "ClassAccDescrStatement" }
  >,
  rules: Map<number, GapRule>,
): void {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  rules.set(statement.value.range[0], "space")
}

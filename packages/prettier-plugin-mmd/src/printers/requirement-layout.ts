import type {
  Node,
  RequirementClassStatement,
  RequirementElementField,
  RequirementElementStatement,
  RequirementIdentifier,
  RequirementRelationshipStatement,
  RequirementRequirementStatement,
  RequirementRiskField,
  RequirementStatement,
  RequirementValueField,
  RequirementVerifyMethodField,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { holdsJoiningRegion } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keptAsWritten,
  layoutDescriptionBlock,
  layoutEmptyDescriptionBlock,
  spansLinesThatCannotJoin,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokensBetween,
  isStructural,
} from "./source.ts"
import {
  accessibilityRules,
  addClassListRules,
  classStatementRules,
  directionRules,
  styleStatementRules,
} from "./statement-rules.ts"

/**
 * The node types of a requirement diagram whose text is a value, printed as
 * written: the names, the values of the fields, the styles, the accessibility
 * texts, and the text that mermaid.js does not read. They have no child
 * fields; `tests/value-nodes.test.ts` checks that every other such node type
 * is left out on purpose.
 */
export const requirementValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "RequirementIdentifier",
  "RequirementLiteral",
  "RequirementIgnoredText",
])

/** A statement with a body between braces: a requirement or an element. */
export type RequirementBlockStatement =
  RequirementRequirementStatement | RequirementElementStatement

/** A statement that holds no body. */
export type RequirementSimpleStatement = Exclude<
  RequirementStatement,
  RequirementBlockStatement
>

/** A field of a requirement or an element. */
export type RequirementField =
  | RequirementValueField
  | RequirementRiskField
  | RequirementVerifyMethodField
  | RequirementElementField

/** An item of a body: a field, or an empty description block. */
export type RequirementBodyItem = RequirementBlockStatement["body"][number]

/** A statement, with the kind of statement it is. */
export type ClassifiedRequirementStatement =
  | { readonly kind: "block"; readonly statement: RequirementBlockStatement }
  | { readonly kind: "simple"; readonly statement: RequirementSimpleStatement }

/**
 * Which kind of statement a node is: a requirement or an element, whose body
 * stands between braces, or a statement that holds none; null for a node
 * that is no statement of a requirement diagram. The kinds are decided here
 * only. Every statement type is listed, and the check after the cases fails
 * when a statement type of the tree is not listed.
 */
export function classifyRequirementStatement(
  node: RequirementStatement,
): ClassifiedRequirementStatement
export function classifyRequirementStatement(
  node: MermaidAst,
): ClassifiedRequirementStatement | null
export function classifyRequirementStatement(
  node: MermaidAst,
): ClassifiedRequirementStatement | null {
  switch (node.type) {
    case "RequirementRequirementStatement":
    case "RequirementElementStatement":
      return { kind: "block", statement: node }
    case "RequirementRelationshipStatement":
    case "RequirementDirectionStatement":
    case "RequirementStyleStatement":
    case "RequirementClassDefStatement":
    case "RequirementClassStatement":
    case "RequirementClassShorthandStatement":
    case "RequirementAccTitleStatement":
    case "RequirementAccDescrStatement":
    case "RequirementAccDescrBlockStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, RequirementStatement>
      return null
  }
}

/** The `{` and the `}` of the body of a requirement or an element. */
export function findBlockBraces(
  source: Source,
  statement: RequirementBlockStatement,
): { readonly opening: Token; readonly closing: Token } {
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of a body",
  )
  expectValue(closing, "}")
  const opening = expectToken(
    findTokensBetween(source, statement.range[0], closing.range[0]).find(
      (token) => isStructural(source, token) && token.value === "{",
    ),
    "the `{` of a body",
  )
  return { opening, closing }
}

/**
 * The layout of the line that opens a body, from the start of the statement
 * to the end of its `{`: the keyword, the name, and the classes. One space
 * stands before the name and before the `{`, and the classes touch their
 * `:::` and the `,` between them (docs/requirement.md, Bodies and Class
 * lists). A statement written over lines, where the lexer reads the line
 * break as whitespace, stands on one line; one with a comment or a directive
 * in it is kept as written (see `spansLinesThatCannotJoin`).
 */
export function layoutBlockOpening(
  source: Source,
  statement: RequirementBlockStatement,
  opening: Token,
): AtomLayout {
  const start = statement.range[0]
  const end = opening.range[1]
  if (
    holdsJoiningRegion(source, start, end) ||
    spansLinesThatCannotJoin(source, start, end)
  ) {
    return keptAsWritten(start, end)
  }
  const rules = new Map<number, GapRule>([
    [statement.name.range[0], "space"],
    [opening.range[0], "space"],
  ])
  addClassListRules(
    source,
    statement.cssClasses,
    statement.name.range[1],
    rules,
  )
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, requirementValueNodeTypes).filter(
        (value) => value.range[1] <= opening.range[0],
      ),
      [],
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * The layout of an item of a body. A field is printed on one line: its
 * keyword, the `:` touching it, and its value after one space; a field
 * written over lines, where the lexer reads the line break as whitespace,
 * stands on one line too, and one with a comment or a directive in it is kept
 * as written. An empty description block, which mermaid.js does not read, is
 * laid out as in `layoutEmptyDescriptionBlock` (docs/requirement.md, Fields
 * and Empty description blocks).
 */
export function layoutBodyItem(
  source: Source,
  item: RequirementBodyItem,
): AtomLayout {
  const [start, end] = item.range
  if (item.type === "RequirementIgnoredText") {
    return layoutEmptyDescriptionBlock(source, start, end)
  }
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const keyword = expectToken(findStructuralToken(source, start), "a field")
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` of a field",
  )
  expectValue(colon, ":")
  const value = expectToken(
    findStructuralToken(source, colon.range[1]),
    "the value of a field",
  )
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(item, requirementValueNodeTypes),
      [],
    ),
    rules: new Map<number, GapRule>([
      [colon.range[0], "none"],
      [value.range[0], "space"],
    ]),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * The layout of a statement that holds no body, from its start to `end` (the
 * end of its range).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace (diagrams/requirement.md, The
 *   statement context); one with a comment or a directive in it, or a `;`, is
 *   kept as written (see `spansLinesThatCannotJoin`). The lines of an
 *   `accDescr` block are lines of its text, and are kept (docs/requirement.md,
 *   Accessibility statements). A `class` statement is laid out as
 *   `joinsClassStatement` says.
 * - A relationship has one space between its units (docs/requirement.md,
 *   Relationship spacing).
 * - The other statements follow the rules shared with an ER diagram (see
 *   `statement-rules.ts`).
 */
export function layoutRequirementStatement(
  source: Source,
  statement: RequirementSimpleStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "RequirementAccDescrBlockStatement") {
    return layoutDescriptionBlock(
      source,
      statement,
      end,
      requirementValueNodeTypes,
    )
  }
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, requirementValueNodeTypes),
      [],
    ),
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks:
      statement.type === "RequirementClassStatement" &&
      !joinsClassStatement(source, statement)
        ? "kept"
        : "joined",
  }
}

/**
 * Whether a `class` statement is printed on one line. The lexer reads the
 * names of the statement after its first line break in the statement
 * context, where an unquoted name may hold whitespace and other characters,
 * and the names before it in the style context, where it is a `style-word`,
 * one or more ASCII word characters (diagrams/requirement.md, The style
 * context, rule 1). On one line, all of them would be read in the style
 * context, so the statement stands on one line only when the names after the
 * first line break are strings or read as `style-word` units; otherwise it
 * keeps its line break (docs/requirement.md, Styles and classes).
 */
function joinsClassStatement(
  source: Source,
  statement: RequirementClassStatement,
): boolean {
  const lineBreak = source.text.indexOf("\n", statement.range[0])
  if (lineBreak === -1 || lineBreak >= statement.range[1]) return true
  return [...statement.names, ...statement.cssClasses]
    .filter((name) => name.range[0] > lineBreak)
    .every((name) => name.type !== "RequirementIdentifier" || isStyleWord(name))
}

/** Whether an unquoted name reads as a `style-word` unit: ASCII word characters only. */
function isStyleWord(name: RequirementIdentifier): boolean {
  return (
    name.name !== "" &&
    [...name.name].every(
      (character) =>
        (character >= "a" && character <= "z") ||
        (character >= "A" && character <= "Z") ||
        (character >= "0" && character <= "9") ||
        character === "_",
    )
  )
}

/** The gap rules of a statement that holds no body. */
function statementRules(
  source: Source,
  statement: Exclude<
    RequirementSimpleStatement,
    { type: "RequirementAccDescrBlockStatement" }
  >,
): Map<number, GapRule> {
  switch (statement.type) {
    case "RequirementRelationshipStatement":
      return relationshipRules(source, statement)
    case "RequirementDirectionStatement":
      return directionRules(source, statement)
    case "RequirementStyleStatement":
      return styleStatementRules(source, statement.names, statement.styles)
    case "RequirementClassDefStatement":
      return styleStatementRules(source, statement.cssClasses, statement.styles)
    case "RequirementClassStatement":
      return classStatementRules(source, statement.names, statement.cssClasses)
    case "RequirementClassShorthandStatement": {
      const rules = new Map<number, GapRule>()
      addClassListRules(
        source,
        statement.cssClasses,
        statement.name.range[1],
        rules,
      )
      return rules
    }
    case "RequirementAccTitleStatement":
    case "RequirementAccDescrStatement":
      return accessibilityRules(source, statement)
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/**
 * The rules of a relationship: one space between its units, the left name,
 * the `-` or `<-`, the relation, the `->` or `-`, and the right name
 * (docs/requirement.md, Relationship spacing).
 */
function relationshipRules(
  source: Source,
  statement: RequirementRelationshipStatement,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>([[statement.right.range[0], "space"]])
  for (const token of findTokensBetween(
    source,
    statement.left.range[1],
    statement.right.range[0],
  )) {
    if (isStructural(source, token)) rules.set(token.range[0], "space")
  }
  return rules
}

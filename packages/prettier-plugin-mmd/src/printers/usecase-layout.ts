import { appendItems } from "./collections.ts"
import type {
  Node,
  Range,
  UsecaseActor,
  UsecaseEntity,
  UsecaseMetadata,
  UsecaseLiteral,
  UsecaseStatement,
  UsecaseSystemBoundaryStatement,
} from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { holdsJoiningRegion } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  keptAsWritten,
  spansLinesThatCannotJoin,
  walk,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokenEndingBefore,
  findTriviaBetween,
  findTokensBetween,
  isStructural,
  isWhitespace,
} from "./source.ts"
import {
  addClassListRules,
  addNameListRules,
  classStatementRules,
} from "./statement-rules.ts"

/** Value leaves; accessibility/stereotype padding has its own layout rules. */
export const usecaseValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "UsecaseIdentifier",
  "UsecaseLiteral",
  "UsecaseLabel",
  "UsecaseJsonDataBlock",
])

/** A declaration suffix's value and its normalized printed bounds. */
interface StereotypeLayout {
  readonly value: UsecaseLiteral
  readonly range: Range
}

/** Exhaustively separates the one body-bearing statement from ordinary lines. */
export function classifyUsecaseStatement(statement: UsecaseStatement):
  | {
      readonly kind: "boundary"
      readonly statement: UsecaseSystemBoundaryStatement
    }
  | {
      readonly kind: "simple"
      readonly statement: Exclude<
        UsecaseStatement,
        UsecaseSystemBoundaryStatement
      >
    } {
  switch (statement.type) {
    case "UsecaseSystemBoundaryStatement":
      return { kind: "boundary", statement }
    case "UsecaseActorStatement":
    case "UsecaseEntityStatement":
    case "UsecaseRelationshipStatement":
    case "UsecaseMetadataAssignmentStatement":
    case "UsecaseNoteStatement":
    case "UsecaseJsonStatement":
    case "UsecaseDirectionStatement":
    case "UsecaseClassDefStatement":
    case "UsecaseClassStatement":
    case "UsecaseStyleStatement":
    case "UsecaseAccTitleStatement":
    case "UsecaseAccDescrStatement":
    case "UsecaseAccDescrBlockStatement":
      return { kind: "simple", statement }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown usecase statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/** The last authored heading component, before the required physical newline. */
export function usecaseBoundaryHeaderEnd(
  source: Source,
  boundary: UsecaseSystemBoundaryStatement,
): number {
  const last =
    boundary.classes.at(-1) ??
    boundary.metadata ??
    boundary.title ??
    boundary.id
  if (last === null)
    throw new Error("prettier-plugin-mmd: a boundary without a name")
  if (last === boundary.title && boundary.id !== null) {
    return expectToken(
      findStructuralToken(source, last.range[1]),
      "the boundary title closer",
    ).range[1]
  }
  return last.range[1]
}

/**
 * Interior value text and full CSS declarations stay authored; accessibility
 * and stereotype padding use sibling rules (docs/usecase.md, Native metadata,
 * Classes and styles, Direction and accessibility, and Stereotypes).
 */
export function layoutUsecaseStatement(
  source: Source,
  statement: UsecaseStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (holdsJoiningRegion(source, start, end)) return keptAsWritten(start, end)
  if (
    statement.type === "UsecaseAccTitleStatement" ||
    statement.type === "UsecaseAccDescrStatement" ||
    statement.type === "UsecaseAccDescrBlockStatement"
  )
    return layoutUsecaseAccessibility(source, statement, end)
  const rules = new Map<number, GapRule>()
  const outdented = new Set<number>()
  const joinedBefore = new Set<number>()
  const keptBreaksBefore = new Set<number>()
  const kept: Atom[] = []
  const stereotypes: StereotypeLayout[] = []

  /** Adds one node's structural rules, excluding a boundary's body. */
  function visit(node: Node): void {
    if (node.range[1] > end) return
    switch (node.type) {
      case "UsecaseActor":
      case "UsecaseEntity":
        addElementRules(source, node, rules, stereotypes, joinedBefore)
        break
      case "UsecaseStyleDeclaration":
        kept.push({ start: node.range[0], end: node.range[1] })
        break
      case "UsecaseMetadata":
        addMetadataRules(source, node, rules, outdented, keptBreaksBefore)
        break
      default:
        break
    }
  }

  walk(statement, visit)
  switch (statement.type) {
    case "UsecaseSystemBoundaryStatement": {
      const name = statement.id ?? statement.title
      if (name !== null) rules.set(name.range[0], "space")
      if (statement.id !== null && statement.title !== null) {
        const opening = expectToken(
          findStructuralTokenEndingBefore(source, statement.title.range[0]),
          "the boundary title opener",
        )
        const closing = expectToken(
          findStructuralToken(source, statement.title.range[1]),
          "the boundary title closer",
        )
        kept.push({ start: opening.range[0], end: closing.range[1] })
      }
      addClassListRules(source, statement.classes, statement.range[0], rules)
      break
    }
    case "UsecaseActorStatement":
      for (const actor of statement.actors) rules.set(actor.range[0], "space")
      for (const token of findTokensBetween(source, start, end)) {
        if (
          token.value === "," &&
          statement.actors.some((actor) => actor.range[1] <= token.range[0]) &&
          !statement.actors.some(
            (actor) =>
              actor.range[0] < token.range[0] &&
              token.range[0] < actor.range[1],
          )
        )
          rules.set(token.range[0], "none")
      }
      break
    case "UsecaseRelationshipStatement": {
      const first = statement.opening ?? statement.arrow
      rules.set(first.range[0], statement.id === null ? "space" : "none")
      rules.set(statement.target.range[0], "space")
      if (statement.source.type === "UsecaseActor")
        rules.set(statement.source.range[0], "space")
      if (statement.id !== null) {
        rules.set(statement.id.range[0], "space")
        const at = expectToken(
          findStructuralToken(source, statement.id.range[1]),
          "the edge id at sign",
        )
        rules.set(at.range[0], "none")
      }
      if (statement.label !== null) {
        rules.set(statement.label.range[0], "space")
        rules.set(statement.arrow.range[0], "space")
      }
      if (statement.kind === "include" || statement.kind === "extend") {
        for (const token of findTokensBetween(
          source,
          statement.arrow.range[1],
          statement.target.range[0],
        ))
          if (isStructural(source, token)) rules.set(token.range[0], "none")
      }
      break
    }
    case "UsecaseMetadataAssignmentStatement":
      break
    case "UsecaseEntityStatement":
      break
    case "UsecaseNoteStatement":
      rules.set(statement.target.range[0], "space")
      rules.set(statement.label.range[0], "space")
      for (const token of findTokensBetween(
        source,
        start,
        statement.target.range[0],
      ))
        if (token.value === "for") rules.set(token.range[0], "space")
      break
    case "UsecaseJsonStatement":
      rules.set(statement.id.range[0], "space")
      rules.set(statement.data.range[0], "space")
      addClassListRules(
        source,
        statement.classes,
        statement.data.range[1],
        rules,
      )
      break
    case "UsecaseDirectionStatement": {
      const last = expectToken(
        findTokenEndingBefore(source, end),
        "the direction value",
      )
      rules.set(last.range[0], "space")
      break
    }
    case "UsecaseClassStatement":
      for (const [offset, rule] of classStatementRules(
        source,
        statement.targets,
        statement.classes,
      ))
        rules.set(offset, rule)
      break
    case "UsecaseClassDefStatement":
    case "UsecaseStyleStatement": {
      addNameListRules(
        source,
        statement.type === "UsecaseClassDefStatement"
          ? statement.classes
          : [statement.target],
        rules,
      )
      for (const style of statement.styles) rules.set(style.range[0], "space")
      for (const token of findTokensBetween(
        source,
        statement.styles[0].range[1],
        end,
      ))
        if (
          token.value === "," &&
          !statement.styles.some(
            (style) =>
              style.range[0] <= token.range[0] &&
              token.range[0] < style.range[1],
          )
        )
          rules.set(token.range[0], "none")
      break
    }
    default:
      statement satisfies never
  }
  const values = collectValueNodes(statement, usecaseValueNodeTypes).filter(
    (value) => value.range[1] <= end,
  )
  const atoms = protectSemicolonPrefixes(
    source,
    start,
    end,
    collectAtoms(source, start, end, values, kept),
  )
  for (const stereotype of stereotypes) {
    const index = atoms.findIndex(
      (atom) =>
        atom.start === stereotype.value.range[0] &&
        atom.end === stereotype.value.range[1] &&
        !source.text.slice(atom.start, atom.end).includes(";"),
    )
    // A prefix that crosses a value keeps its complete written padding too.
    if (index === -1) continue
    atoms[index] = { start: stereotype.range[0], end: stereotype.range[1] }
  }
  return {
    atoms,
    rules,
    outdented,
    joinedBefore,
    keptBreaksBefore,
    lineBreaks: "kept",
  }
}

/**
 * Class/C4's exterior text spacing and aligned description closer, adapted to
 * usecase's complete Literal ranges (ast/usecase.md, UsecaseLiteral;
 * docs/usecase.md, Direction and accessibility). Native next-line statements
 * remain separate, and semicolon prefixes still protect their written text.
 */
function layoutUsecaseAccessibility(
  source: Source,
  statement: Extract<
    UsecaseStatement,
    {
      type:
        | "UsecaseAccTitleStatement"
        | "UsecaseAccDescrStatement"
        | "UsecaseAccDescrBlockStatement"
    }
  >,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  const keyword = expectToken(
    findStructuralToken(source, start),
    "the accessibility keyword",
  )
  const separator = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the accessibility colon or brace",
  )
  const valueRange = trimmedLiteralRange(source, statement.value)
  const rules = new Map<number, GapRule>()
  const outdented = new Set<number>()
  const joinedBefore = new Set<number>()
  let atoms: Atom[] = [{ start: keyword.range[0], end: keyword.range[1] }]
  let lineBreaks: "kept" | "joined" = "kept"
  if (statement.type !== "UsecaseAccDescrBlockStatement") {
    atoms.push({ start: separator.range[0], end: separator.range[1] })
    rules.set(separator.range[0], "none")
    if (valueRange !== null) {
      atoms.push({ start: valueRange[0], end: valueRange[1] })
      rules.set(valueRange[0], "space")
      joinedBefore.add(valueRange[0])
    }
  } else {
    if (valueRange === null && spansLinesThatCannotJoin(source, start, end))
      return keptAsWritten(start, end)
    const block = {
      range: statement.range,
      value: statement.value,
      closed: true,
    }
    const closing = findAccDescrBlockClosing(source, block)
    if (closing === null)
      throw new Error(
        "prettier-plugin-mmd: an unclosed usecase description block",
      )
    const stretches = findAccDescrBlockStretches(source, block, valueRange)
    if (stretches.length > 0) appendItems(atoms, stretches)
    else {
      atoms.push({ start: separator.range[0], end: separator.range[1] })
      if (valueRange !== null) {
        atoms.push({ start: valueRange[0], end: valueRange[1] })
        joinedBefore.add(valueRange[0])
      }
    }
    atoms.push({ start: closing, end })
    outdented.add(closing)
    if (valueRange === null) {
      rules.set(closing, "none")
      joinedBefore.add(closing)
      lineBreaks = "joined"
    }
  }
  atoms = protectSemicolonPrefixes(source, start, end, atoms)
  return { atoms, rules, outdented, joinedBefore, lineBreaks }
}

/** Trims exterior common whitespace while keeping complete embedded trivia. */
function trimmedLiteralRange(
  source: Source,
  value: UsecaseLiteral | null,
): Range | null {
  if (value === null) return null
  let [start, end] = value.range
  while (start < end && isWhitespace(source.text[start])) start++
  while (end > start && isWhitespace(source.text[end - 1])) end--
  for (const trivia of findTriviaBetween(source, ...value.range)) {
    start = Math.min(start, trivia.range[0])
    end = Math.max(end, trivia.range[1])
  }
  return start === end ? null : [start, end]
}

/** ER's compact shapes/suffixes and class's statement-annotation spacing. */
function addElementRules(
  source: Source,
  element: UsecaseActor | UsecaseEntity,
  rules: Map<number, GapRule>,
  stereotypes: StereotypeLayout[],
  joinedBefore: Set<number>,
): void {
  if (element.id !== null && element.label !== null) {
    const opening = expectToken(
      findStructuralToken(source, element.id.range[1]),
      "the element shape opener",
    )
    const closing = expectToken(
      findStructuralToken(source, element.label.range[1]),
      "the element shape closer",
    )
    rules.set(opening.range[0], "none")
    rules.set(element.label.range[0], "none")
    rules.set(closing.range[0], "none")
  }
  if (element.stereotype !== null) {
    const range = trimmedLiteralRange(source, element.stereotype)
    if (range === null)
      throw new Error("prettier-plugin-mmd: an empty usecase stereotype")
    const closing = expectToken(
      findStructuralToken(source, element.stereotype.range[1]),
      "the stereotype closer",
    )
    stereotypes.push({ value: element.stereotype, range })
    joinedBefore.add(range[0])
    joinedBefore.add(closing.range[0])
  }
  addClassListRules(source, element.classes, element.range[0], rules)
}

/**
 * Retains native property separators and every written LF; unlike opaque JSON,
 * key/colon/value gaps are structural (diagrams/usecase.md, Grammar;
 * docs/usecase.md, Native metadata).
 */
function addMetadataRules(
  source: Source,
  metadata: UsecaseMetadata,
  rules: Map<number, GapRule>,
  outdented: Set<number>,
  keptBreaksBefore: Set<number>,
): void {
  rules.set(metadata.range[0], "none")
  const tokens = findTokensBetween(source, ...metadata.range).filter((token) =>
    isStructural(source, token),
  )
  const closing = expectToken(tokens.at(-1), "the native metadata closer")
  outdented.add(closing.range[0])
  rules.set(closing.range[0], "space")
  for (const property of metadata.properties) {
    rules.set(property.key.range[0], "space")
    rules.set(property.value.range[0], "space")
    const colon = expectToken(
      findStructuralToken(source, property.key.range[1]),
      "the native property colon",
    )
    rules.set(colon.range[0], "none")
  }
  for (const token of tokens) {
    keptBreaksBefore.add(token.range[0])
    if (token.value === ",") rules.set(token.range[0], "none")
  }
}

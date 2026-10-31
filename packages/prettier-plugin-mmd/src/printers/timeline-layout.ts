import type {
  Node,
  TimelineAccDescrStatement,
  TimelineAccTitleStatement,
  TimelineEventStatement,
  TimelinePeriodStatement,
  TimelineSectionStatement,
  TimelineStatement,
  TimelineTitleStatement,
  Token,
} from "@mmd-toolkit/parser"
import { util } from "prettier"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { readGap } from "./gap.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keptAsWritten,
  layoutDescriptionBlock,
  spansLinesThatCannotJoin,
  toAsciiLowerCase,
} from "./layout.ts"
import { accessibilityRules } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import { findStructuralToken } from "./source.ts"

/**
 * The node types of a timeline whose text is a value, printed as written:
 * the texts of the statements (periods, events, titles, sections,
 * accessibility texts). They have no child fields; `tests/value-nodes.test.ts`
 * checks that every other such node type is left out on purpose.
 */
export const timelineValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "TimelineLiteral",
])

/**
 * Whether a statement is a period that is the word `title` or `section`
 * alone, with no events and no whitespace after the word: the lexer reads it
 * as a period because no text follows the word on its line, and a line of
 * only a directive after it is an empty line once the directive is removed.
 * Whitespace before that directive would be the text of a title or a section
 * (diagrams/timeline.md, The statement context, Keywords and what follows
 * them; Trivia between units).
 */
export function isBareKeywordPeriod(statement: TimelineStatement): boolean {
  if (
    statement.type !== "TimelinePeriodStatement" ||
    statement.events.length > 0
  ) {
    return false
  }
  const word = toAsciiLowerCase(statement.period.value)
  return word === "title" || word === "section"
}

/**
 * The layout of the line of the header: the keyword `timeline`, and the
 * direction after one space where there is one (docs/timeline.md, Header and
 * direction). The direction is the structural token after the keyword, which
 * the tree names in the `direction` field of the diagram.
 */
export function layoutTimelineHeader(
  source: Source,
  keyword: Token,
): AtomLayout {
  const { body } = source.root
  if (body.type !== "TimelineDiagram") {
    throw new Error("prettier-plugin-mmd: the header of a non-timeline diagram")
  }
  const atoms: Atom[] = [{ start: keyword.range[0], end: keyword.range[1] }]
  const rules = new Map<number, GapRule>()
  if (body.direction !== null) {
    const direction = expectToken(
      findStructuralToken(source, keyword.range[1]),
      "the direction of the header",
    )
    expectValue(direction, body.direction)
    atoms.push({ start: direction.range[0], end: direction.range[1] })
    rules.set(direction.range[0], "space")
  }
  return { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
}

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A period with its events, and the events after another statement, keep
 *   the line breaks between the units: a period and an event keep their
 *   whitespace as their text, so no event moves from line to line. The later
 *   event colons align under the period's colon when it immediately follows
 *   the period on its line (docs/timeline.md, Periods and events). The line
 *   break that is the one whitespace character after the `:` of an event is
 *   not one of them (see `layoutEvents`).
 * - A title, a section, and an accessibility statement written over several
 *   lines stand on one line where the lexer reads the line break as
 *   whitespace, which it does only right after a keyword; one with a comment
 *   or a directive in it is kept as written (see
 *   `spansLinesThatCannotJoin`). The lines of an `accDescr` block are lines
 *   of its text, and are kept (docs/timeline.md, Accessibility statements).
 */
export function layoutTimelineStatement(
  source: Source,
  statement: TimelineStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  switch (statement.type) {
    case "TimelineAccDescrBlockStatement":
      return layoutDescriptionBlock(
        source,
        statement,
        end,
        timelineValueNodeTypes,
      )
    case "TimelinePeriodStatement":
    case "TimelineEventStatement":
      return layoutEvents(source, statement, end)
    default:
      break
  }
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, timelineValueNodeTypes),
    [],
  )
  return {
    atoms,
    rules: textStatementRules(source, statement),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/** The gap rules of a title, a section, or an accessibility statement. */
function textStatementRules(
  source: Source,
  statement:
    | TimelineTitleStatement
    | TimelineSectionStatement
    | TimelineAccTitleStatement
    | TimelineAccDescrStatement,
): Map<number, GapRule> {
  switch (statement.type) {
    case "TimelineTitleStatement":
      return new Map<number, GapRule>([[statement.value.range[0], "space"]])
    case "TimelineSectionStatement":
      return new Map<number, GapRule>([[statement.name.range[0], "space"]])
    case "TimelineAccTitleStatement":
    case "TimelineAccDescrStatement":
      return accessibilityRules(source, statement)
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/**
 * The layout of a period with its events, or of events alone: the period and
 * the `:` and text of every event, with the gaps between them as written. A
 * period touches its `:`, since it holds the whitespace before it, and so
 * does an event before the next `:`; the text of an event stands after one
 * space, whatever whitespace character was the separator after the `:`
 * (docs/timeline.md, Periods and events).
 *
 * The separator may be a line break, with the text on the next line: that
 * line break is whitespace to the lexer, and the text moves to the line of
 * the `:`. A statement with such a line break, and a comment, a directive, or
 * a `;` in it, is kept as written (see `spansLinesThatCannotJoin`).
 */
function layoutEvents(
  source: Source,
  statement: TimelinePeriodStatement | TimelineEventStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, timelineValueNodeTypes),
    [],
  )
  const rules = new Map<number, GapRule>()
  const joinedBefore = new Set<number>()
  const alignedColons = new Set<number>()
  const outdented = new Set<number>()
  let statementPadding: string | undefined
  for (const event of statement.events) {
    const eventIndex = atoms.findIndex((atom) => atom.start === event.range[0])
    const colon = eventIndex < 1 ? undefined : atoms[eventIndex - 1]
    if (colon === undefined) {
      throw new Error(
        `prettier-plugin-mmd: no colon before the event at offset ${event.range[0]}`,
      )
    }
    // Events without a period are peers (docs/timeline.md, Event statements).
    if (statement.type === "TimelineEventStatement") outdented.add(colon.start)
    if (
      event === statement.events[0] &&
      statement.type === "TimelinePeriodStatement"
    ) {
      const writtenPeriod = source.text.slice(...statement.period.range)
      if (
        colon.start === statement.period.range[1] &&
        !writtenPeriod.includes("\n") &&
        !writtenPeriod.includes("\u2028") &&
        !writtenPeriod.includes("\u2029")
      ) {
        // Keep tabs as tab stops and replace each remaining span by its display
        // width, so later colons align without changing the period's value
        // (docs/timeline.md, Periods and events).
        statementPadding = writtenPeriod
          .split("\t")
          .map((part) => " ".repeat(util.getStringWidth(part)))
          .join("\t")
      }
    } else if (statementPadding !== undefined) {
      alignedColons.add(colon.start)
    }
    if (readGap(source, colon.end, event.range[0], true).breaksLine) {
      joinedBefore.add(event.range[0])
    }
    rules.set(event.range[0], "space")
  }
  if (joinedBefore.size > 0 && spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  return {
    atoms: atoms.map((atom) =>
      alignedColons.has(atom.start) ? { ...atom, statementPadding } : atom,
    ),
    rules,
    outdented,
    lineBreaks: "kept",
    joinedBefore,
  }
}

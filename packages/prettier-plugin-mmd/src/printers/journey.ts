import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { findJourneyKeptLines } from "./journey-kept-lines.ts"
import {
  findJourneyPrintedEnd,
  layoutJourneyStatement,
} from "./journey-layout.ts"
import { layoutKeywordHeader } from "./layout.ts"
import type { SectionedDiagram } from "./sectioned.ts"
import { printSectionedDiagram } from "./sectioned.ts"
import type { Source } from "./source.ts"
import type { JourneyStatement } from "@mmd-toolkit/parser"

/** The user journey as a diagram that a `section` groups. */
const journeyDiagram: SectionedDiagram<JourneyStatement> = {
  name: "user journey",
  statementsOf: (node) => (node.type === "JourneyDiagram" ? node.body : null),
  isSection: (statement) => statement.type === "JourneySectionStatement",
  keptLines: findJourneyKeptLines,
  printedEnd: findJourneyPrintedEnd,
  layoutHeader: layoutKeywordHeader,
  layoutStatement: layoutJourneyStatement,
  readsCommentsByWhitespaceBefore: false,
}

/**
 * Prints the body of a user journey and the nodes below it, to the end of the
 * text (docs/journey.md).
 */
export function printJourney(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  return printSectionedDiagram(journeyDiagram, path, options, source)
}

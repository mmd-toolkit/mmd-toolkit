import type { AstPath, Doc, ParserOptions } from "prettier"
import type { TimelineStatement } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { SectionedDiagram } from "./sectioned.ts"
import { printSectionedDiagram } from "./sectioned.ts"
import type { Source } from "./source.ts"
import { findTimelineKeptLines } from "./timeline-kept-lines.ts"
import {
  isBareKeywordPeriod,
  layoutTimelineHeader,
  layoutTimelineStatement,
} from "./timeline-layout.ts"

/** The timeline as a diagram that a `section` groups. */
const timelineDiagram: SectionedDiagram<TimelineStatement> = {
  name: "timeline",
  statementsOf: (node) => (node.type === "TimelineDiagram" ? node.body : null),
  isSection: (statement) => statement.type === "TimelineSectionStatement",
  keptLines: findTimelineKeptLines,
  printedEnd: (_source, statement) => statement.range[1],
  layoutHeader: layoutTimelineHeader,
  layoutStatement: layoutTimelineStatement,
  readsCommentsByWhitespaceBefore: false,
  readsDirectiveLineWhitespaceAfter: isBareKeywordPeriod,
}

/**
 * Prints the body of a timeline and the nodes below it, to the end of the
 * text (docs/timeline.md).
 */
export function printTimeline(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  return printSectionedDiagram(timelineDiagram, path, options, source)
}

import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import {
  findDirectionTextLines,
  findLinesAfterWords,
  findLinesAfterEmptyStyle,
  findStyleLinesWithLineSeparators,
  textWithoutDirectives,
  hasDirectionTextOnFirstLine,
} from "./graph-kept-lines.ts"
import { walk } from "./layout.ts"
import { findTriviaBetween } from "./source.ts"
import type { Source } from "./source.ts"

const keptLinesBySource = new WeakMap<Source, KeptLines>()

/** Flowchart's textual selection and priority rules, with Agentflow's vocabulary. */
export function findAgentflowKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  if (source.root.body.type !== "AgentflowDiagram")
    throw new Error("Expected Agentflow")
  const statements = source.root.body.body
  const directionText = new Set(findDirectionTextLines(source, statements))
  // Directive removal can reconstruct direction text within an accessibility
  // value. Judge its planned first line too; indentation must not turn that
  // value into a greedy direction statement (diagrams/agentflow.md, Direction
  // and accessibility; docs/agentflow.md, Direction).
  walk(source.root.body, (statement) => {
    if (
      statement.type !== "AgentflowAccTitleStatement" &&
      statement.type !== "AgentflowAccDescrStatement" &&
      statement.type !== "AgentflowAccDescrBlockStatement"
    )
      return
    const value = statement.value
    const joinsValue =
      statement.type !== "AgentflowAccDescrBlockStatement" &&
      value !== null &&
      findTriviaBetween(source, statement.range[0], value.range[0]).length === 0
    const text = joinsValue
      ? textWithoutDirectives(source, value.range).trimStart()
      : textWithoutDirectives(source, statement.range)
    if (hasDirectionTextOnFirstLine(text))
      directionText.add(lineStartOf(source, statement.range[0]))
  })
  const kept: KeptLines = {
    joined: new Set([
      ...findLinesWithOwnSemicolons(source),
      // end/global never take LF, and %% after a separator is a real comment
      // (diagrams/agentflow.md, Shared units and Preserved comments;
      // docs/agentflow.md, Kept lines and Comments).
      ...findLinesAfterWords(source, statements, [
        "accTitle",
        "accDescr",
        "click",
        "call",
        "href",
      ]),
      ...findLinesAfterEmptyStyle(source, statements),
    ]),
    verbatim: new Set([
      ...directionText,
      ...findStyleLinesWithLineSeparators(source, statements),
      ...findLinesEndedBySemicolon(source),
    ]),
    ownIndentation: directionText,
  }
  keptLinesBySource.set(source, kept)
  return kept
}

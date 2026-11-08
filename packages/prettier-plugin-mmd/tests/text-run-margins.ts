import type { DbSummary } from "@mmd-toolkit/tests"
import { restoreStrings } from "./db-restore.ts"
import { withoutBlanks } from "./db-values.ts"

/**
 * The places of the Db that hold a text whose runs of spaces and tabs the
 * formatter prints as one space, for each diagram type, as the names of the
 * keys down to the text without indices (`vertices.text` is the text of every
 * vertex). The name of a thing that another statement refers to is not one:
 * two names that differ by a run are two things, and are one once the run is
 * gone (docs/compatibility.md, Runs of whitespace in a text that are drawn the
 * same).
 */
const textRunPaths: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["agentflow", new Set(["accDescr", "accTitle"])],
  [
    "architecture",
    new Set([
      "accDescr",
      "accTitle",
      "groups.title",
      "nodes.iconText",
      "nodes.title",
    ]),
  ],
  ["block", new Set(["root.children.classes", "root.children.label"])],
  ["c4", new Set(["accDescr", "accTitle", "title"])],
  [
    "classDiagram",
    new Set([
      "accDescr",
      "accTitle",
      "classes.annotations",
      "classes.members.id",
      "classes.methods.parameters",
    ]),
  ],
  [
    "cynefin",
    new Set(["accDescr", "accTitle", "domains.items.label", "title"]),
  ],
  ["er", new Set(["accDescr", "accTitle", "entities.attributes.type"])],
  ["flowchart-v2", new Set(["accDescr", "accTitle", "subgraphs.title"])],
  ["gantt", new Set(["accDescr", "accTitle", "title"])],
  ["ishikawa", new Set(["root.children.text", "root.text", "title"])],
  ["journey", new Set(["accDescr", "accTitle", "title"])],
  ["packet", new Set(["accDescr", "accTitle", "packet.label", "title"])],
  ["info", new Set(["accDescr", "accTitle", "title"])],
  ["gitGraph", new Set(["accDescr", "accTitle", "title"])],
  ["pie", new Set(["accDescr", "accTitle", "title"])],
  [
    "quadrantChart",
    new Set([
      "accDescr",
      "accTitle",
      "points.text",
      "quadrants",
      "title",
      "xAxis.left",
      "xAxis.right",
      "yAxis.bottom",
      "yAxis.top",
    ]),
  ],
  [
    "radar",
    new Set(["accDescr", "accTitle", "axes.label", "curves.label", "title"]),
  ],
  ...["railroad", "railroadAbnf", "railroadEbnf", "railroadPeg"].map(
    (type): [string, ReadonlySet<string>] => [
      type,
      new Set([
        "accDescr",
        "accTitle",
        "rules.definition.elements.value",
        "rules.definition.text",
        "title",
      ]),
    ],
  ),
  [
    "requirement",
    new Set([
      "accDescr",
      "accTitle",
      "elements.type",
      "requirements.classes",
      "requirements.requirementId",
      "requirements.text",
    ]),
  ],
  [
    "sequence",
    new Set([
      "accDescr",
      "accTitle",
      "actors.description",
      "boxes.fill",
      "boxes.name",
      "messages.message",
      "title",
    ]),
  ],
  ["stateDiagram", new Set(["accDescr", "accTitle"])],
  ["timeline", new Set(["accDescr", "accTitle", "title"])],
  [
    "treemap",
    new Set([
      "accDescr",
      "accTitle",
      "nodes.children.name",
      "nodes.name",
      "title",
    ]),
  ],
  ["treeView", new Set(["accDescr", "accTitle", "title"])],
  ["usecase", new Set(["accDescr", "accTitle"])],
  ["venn", new Set(["subsets.label", "title"])],
  ["wardley", new Set(["accDescr", "accTitle", "links.label", "title"])],
  ["xychart", new Set(["accDescr", "accTitle", "title"])],
])

/** The diagram types whose texts the formatter prints without runs. */
export const textRunDiagramTypes: ReadonlySet<string> = new Set(
  textRunPaths.keys(),
)

/**
 * The path as a string, with the keys of a tree that repeat once: the name of a
 * node at any depth is `nodes.children.name`.
 */
function withoutRepeats(path: readonly string[]): string {
  return path.filter((key, index) => key !== path[index - 1]).join(".")
}

/** The text with each run of spaces and tabs replaced by one space. */
function withoutRuns(text: string): string {
  let collapsed = ""
  let inRun = false
  for (const character of text) {
    if (character === " " || character === "\t") {
      if (!inRun) collapsed += " "
      inRun = true
    } else {
      collapsed += character
      inRun = false
    }
  }
  return collapsed
}

/**
 * Checks the texts of a formatted diagram even though their runs of spaces and
 * tabs became one space. mermaid.js keeps the runs in the Db and draws the text
 * without them (docs/compatibility.md, Runs of whitespace in a text that are
 * drawn the same). A text that differs from the written one only by the runs
 * is restored from the written Db. Every other difference stays.
 */
export function textRunDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
  diagramType: string,
): DbSummary | null {
  const paths = textRunPaths.get(diagramType)
  if (before === null || after === null || paths === undefined) return after
  return restoreStrings(before, after, (written, printed, path) => {
    if (!paths.has(withoutRepeats(path))) return printed
    if (withoutRuns(written) === printed) return written
    // A text that also lost the whitespace at its ends gets its runs back; the
    // ends are another exception (keyword-text-margins.ts).
    const core = withoutBlanks(written)
    return core !== written && withoutRuns(core) === printed ? core : printed
  }) as DbSummary
}

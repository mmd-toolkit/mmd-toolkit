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
/**
 * The places of the Db of a railroad diagram that hold a string: the `value` of
 * a terminal, the `text` of a special sequence, and the `name` of a
 * nonterminal, in the definition of a rule, or in an expression inside the
 * alternatives, the elements, or the element of another one. A rule name holds
 * no whitespace (`RR_ID` of the grammar of mermaid.js), so the name of a
 * nonterminal that holds a run refers to no rule, and is a text like the other
 * two.
 */
const railroadStringPaths: readonly string[] = [
  "",
  "alternatives.",
  "elements.",
  "element.",
  "alternatives.elements.",
  "alternatives.element.",
  "elements.element.",
  "alternatives.elements.element.",
].flatMap((inside) =>
  ["value", "text", "name"].map((leaf) => `rules.definition.${inside}${leaf}`),
)

const textRunPaths: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["agentflow", new Set(["accDescr", "subgraphs.title"])],
  [
    "architecture",
    new Set(["accDescr", "groups.title", "nodes.iconText", "nodes.title"]),
  ],
  ["block", new Set(["root.children.classes", "root.children.label"])],
  [
    "c4",
    new Set([
      "accDescr",
      "boundaries.descr.text",
      "boundaries.label.text",
      "boundaries.type.text",
      "rels.descr.text",
      "rels.label.text",
      "rels.techn.text",
      "shapes.descr.text",
      "shapes.label.text",
      "shapes.techn.text",
      "title",
    ]),
  ],
  [
    "classDiagram",
    new Set([
      "accDescr",
      "classes.annotations",
      "classes.members.id",
      "classes.methods.parameters",
    ]),
  ],
  ["cynefin", new Set(["accDescr", "domains.items.label", "title"])],
  ["er", new Set(["accDescr", "entities.attributes.type"])],
  ["flowchart-v2", new Set(["accDescr", "subgraphs.title"])],
  ["gantt", new Set(["accDescr", "title"])],
  ["ishikawa", new Set(["root.children.text", "root.text", "title"])],
  ["journey", new Set(["accDescr", "title"])],
  ["packet", new Set(["accDescr", "packet.label", "title"])],
  ["info", new Set(["accDescr", "title"])],
  ["gitGraph", new Set(["accDescr", "title"])],
  ["pie", new Set(["accDescr", "title"])],
  [
    "quadrantChart",
    new Set([
      "accDescr",
      "points.text",
      "quadrants",
      "title",
      "xAxis.left",
      "xAxis.right",
      "yAxis.bottom",
      "yAxis.top",
    ]),
  ],
  ["radar", new Set(["accDescr", "axes.label", "curves.label", "title"])],
  ...["railroad", "railroadAbnf", "railroadEbnf", "railroadPeg"].map(
    (type): [string, ReadonlySet<string>] => [
      type,
      new Set(["accDescr", ...railroadStringPaths, "title"]),
    ],
  ),
  [
    "requirement",
    new Set([
      "accDescr",
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
      "actors.description",
      "boxes.fill",
      "boxes.name",
      "messages.message",
      "title",
    ]),
  ],
  ["stateDiagram", new Set(["accDescr"])],
  ["timeline", new Set(["accDescr", "title"])],
  [
    "treemap",
    new Set(["accDescr", "nodes.children.name", "nodes.name", "title"]),
  ],
  ["treeView", new Set(["accDescr", "title"])],
  ["usecase", new Set(["accDescr"])],
  ["venn", new Set(["subsets.label", "title"])],
  ["wardley", new Set(["accDescr", "links.label", "title"])],
  ["xychart", new Set(["accDescr", "title"])],
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

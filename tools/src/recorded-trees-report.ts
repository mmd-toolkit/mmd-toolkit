/**
 * The report of the check of the recorded trees of a change, as Markdown
 * (`packages/tests/docs/recorded-trees.md`, What it prints).
 */
import { appendItems } from "../../packages/tests/src/collections.ts"
import { normalizeSpace } from "./fixture-citations.ts"
import type { DocumentBlock } from "./recorded-tree-documents.ts"
import { ANSWERS } from "./recorded-trees.ts"
import type {
  AnswerFile,
  KeyedTree,
  Place,
  ReadItem,
  RecordedTreesReport,
} from "./recorded-trees.ts"

/** The opening words of a block, on one line. */
function openingOf(block: DocumentBlock): string {
  const text = normalizeSpace(block.text)
  return text.length > 100 ? `${text.slice(0, 100)}…` : text
}

/** A place, with the text at it on one line. */
function placeLine(place: Place): string {
  if (place.text === undefined) return `\`${place.key}\``
  const text =
    place.text.length > 80 ? `${place.text.slice(0, 80)}…` : place.text
  return `\`${place.key}\` ${JSON.stringify(text)}`
}

/** The lines of the report on the items to read. */
function itemLines(items: readonly ReadItem[], places: boolean): string[] {
  const out: string[] = []
  // The items come in the order of the documents; they are shown by diagram
  // type, each in that order.
  const byDiagram = new Map<string, ReadItem[]>()
  for (const item of items) {
    const list = byDiagram.get(item.diagram) ?? []
    list.push(item)
    byDiagram.set(item.diagram, list)
  }
  for (const [diagram, list] of byDiagram) {
    out.push("", `### ${diagram}`, "")
    appendItems(
      out,
      list.flatMap((item) => itemEntry(item, places)),
    )
  }
  return out
}

/** The lines of one item to read. */
function itemEntry(item: ReadItem, places: boolean): string[] {
  const count = item.trees.reduce((sum, tree) => sum + tree.places.length, 0)
  const out = [
    `- \`${item.key}\` (${item.block.document}:${item.block.line}): ${openingOf(item.block)}`,
    `  - places: ${count} in ${item.trees.length} trees`,
  ]
  if (item.block.cases.length > 0) {
    out.push(`  - cases: ${item.block.cases.join(", ")}`)
  }
  for (const section of item.block.sections) {
    out.push(`  - read with: ${section.target}`)
  }
  if (item.answeredHere.length > 0) {
    out.push(
      `  - an answer of this change covers ${item.answeredHere.length} of the ${item.trees.length} trees`,
    )
  }
  if (places) {
    for (const tree of item.trees) {
      for (const place of tree.places) out.push(`  - ${placeLine(place)}`)
    }
  }
  return out
}

/** The template of an answer file for what no answer covers. */
function answerTemplate(report: RecordedTreesReport): AnswerFile {
  /** The tree of an answer for `changed`. */
  function tree(changed: KeyedTree): { key: string; fixture: string } {
    return { key: changed.contentKey, fixture: changed.fixture }
  }

  return {
    items: report.readItems
      .map((item) => ({
        item: item.key,
        trees: item.trees
          .filter(({ tree: changed }) => !item.answeredHere.includes(changed))
          .map(({ tree: changed }) => tree(changed)),
        answer: "",
      }))
      .filter((item) => item.trees.length > 0),
    trees: report.unansweredTrees.map((changed) => ({
      ...tree(changed),
      answer: "",
    })),
  }
}

/** The items to read that some changed tree has no answer for. */
function unansweredItemsOf(report: RecordedTreesReport): ReadItem[] {
  return report.readItems.filter(
    (item) => item.answeredHere.length < item.trees.length,
  )
}

/**
 * Whether the report fails the check: a tree or answer file cannot be read,
 * or an item or a changed tree has no answer.
 */
export function failsOf(report: RecordedTreesReport): boolean {
  return (
    report.unreadableTrees.length > 0 ||
    report.unreadableAnswers.length > 0 ||
    unansweredItemsOf(report).length > 0 ||
    report.unansweredTrees.length > 0
  )
}

/** The report as Markdown. */
export function formatReport(
  report: RecordedTreesReport,
  places: boolean,
): string {
  const out: string[] = []
  const unansweredItems = unansweredItemsOf(report)

  out.push(`# Recorded trees since ${report.base}`)

  const byDiagram = new Map<string, number>()
  for (const tree of report.changedTrees) {
    const diagram = tree.diagram ?? "(none)"
    byDiagram.set(diagram, (byDiagram.get(diagram) ?? 0) + 1)
  }
  out.push(
    "",
    "## Counts",
    "",
    `- trees read: ${report.changedTrees.length - report.unreadableTrees.length}`,
    `- changed trees: ${report.changedTrees.length}${byDiagram.size === 0 ? "" : ` (${[...byDiagram].map(([diagram, count]) => `${diagram} ${count}`).join(", ")})`}`,
    `- removed ast.json: ${report.records.removedTrees.length}`,
    `- changed parse-error.json: ${report.records.rejections.length}`,
  )

  out.push("", "## Problems", "")
  if (
    report.unreadableTrees.length === 0 &&
    report.unreadableAnswers.length === 0
  ) {
    out.push("None.")
  }
  for (const { fixture, reason } of report.unreadableTrees) {
    out.push(`- ${fixture}: ${reason}`)
  }
  for (const { file, reason } of report.unreadableAnswers) {
    out.push(`- ${file}: ${reason}`)
  }

  out.push("", "## Items to read")
  appendItems(out, itemLines(report.readItems, places))
  if (report.readItems.length === 0) out.push("", "None.")
  if (report.answeredItems.length > 0) {
    out.push(
      "",
      `Answered at the base for every changed tree: ${report.answeredItems.length} items.`,
    )
    for (const key of report.answeredItems) out.push(`- \`${key}\``)
  }

  out.push("", "## Sentences that cite each changed tree", "")
  if (report.changedTrees.length === 0) out.push("None.")
  for (const tree of report.changedTrees) {
    const citing = report.citations.get(tree.fixture) ?? []
    if (citing.length > 0) {
      out.push(`- ${tree.fixture}: ${citing.join(", ")}`)
      continue
    }
    const added = report.newFixtures.has(tree.fixture)
    let source: string
    if (tree.sourceKind === "mermaid") {
      source =
        "it is a collected input (source kind mermaid), which no sentence needs to cite"
    } else if (tree.sourceKind === "authored") {
      source = "it is not a collected input (source kind authored)"
      if (added) {
        source += "; tell packages/spec that a sentence needs to cite it"
      }
    } else {
      source =
        "whether it is a collected input is unknown (expected.json source kind cannot be read)"
    }
    out.push(
      `- ${tree.fixture}: no sentence cites it; ${added ? "this change adds the fixture" : "the base has the fixture"}; ${source}`,
    )
  }

  out.push("", "## Missing answers", "")
  if (unansweredItems.length === 0 && report.unansweredTrees.length === 0) {
    out.push("None.")
  } else {
    out.push(
      `- items: ${unansweredItems.length}`,
      `- trees read against the sentences that cite them: ${report.unansweredTrees.length}`,
      "",
      `A template of an answer file (in ${ANSWERS}/):`,
      "",
      "```json",
      JSON.stringify(answerTemplate(report), null, 2),
      "```",
    )
  }

  out.push("", "## Items whose key changed", "")
  if (report.changedItems.length === 0) out.push("None.")
  for (const item of report.changedItems) {
    const reasons = [
      ...(item.ownTextChanged ? ["the text of the block"] : []),
      ...item.changedSections.map((target) => `the section ${target}`),
    ]
    out.push(
      `- \`${item.block.key}@${item.diagram}\` (${item.block.document}:${item.block.line}): changed: ${reasons.join("; ")}`,
    )
    if (item.trees.length === 0) {
      out.push(
        "  - no fixture to read: the changed sentences cite none of this diagram type",
      )
    }
    for (const tree of item.trees) {
      out.push(
        `  - ${tree.fixture}: ${!tree.exists ? "no such fixture now" : tree.contentKey === undefined ? "no tree (parse-error.json)" : `content key ${tree.contentKey}`}`,
      )
      for (const place of tree.places ?? [])
        out.push(`    - ${placeLine(place)}`)
    }
  }

  out.push("", "## Records this check does not read", "")
  if (report.records.rejections.length === 0) out.push("None.")
  for (const fixture of report.records.rejections) {
    out.push(`- ${fixture}/parse-error.json`)
  }

  return `${out.join("\n")}\n`
}
